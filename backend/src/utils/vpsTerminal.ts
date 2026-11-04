import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import type { Client } from 'ssh2';
import type { ClientChannel } from 'ssh2';
import { JWT_SECRET } from '../config/env.js';
import type { AuthPayload } from '../middleware/auth.js';
import { readVpsUnlockToken } from '../middleware/vpsConsole.js';
import { resolveSshTarget, hasSshCredentials, openSshShell } from './sshClient.js';
import { getVpsCommandLogModel } from '../models/VpsConsole.js';

/**
 * Interactive root SSH shell for the dashboard, at /api/ws/vps-terminal.
 *
 * The upgrade request carries two tokens: `token`, the ordinary dashboard access
 * token, and `vps`, the console unlock token. Both must be valid and belong to
 * the same senior admin — the same pair of gates the HTTP routes enforce.
 *
 * A session ends on disconnect, on its own idle timer, or as soon as the unlock
 * token stops being valid (expiry, or "Lock console" elsewhere in the UI), so a
 * locked console never leaves a live root shell behind.
 */

const WS_PATH = '/api/ws/vps-terminal';
const ALLOWED_ROLES = new Set(['OWNER', 'SUPER_ADMIN']);
const IDLE_TIMEOUT_MS = 15 * 60_000;
const UNLOCK_CHECK_MS = 30_000;
const MAX_CONCURRENT_SHELLS = 4;
const MAX_INPUT_BYTES = 8 * 1024;
const TRANSCRIPT_TAIL_CHARS = 4000;

type TerminalSocket = WebSocket & { auth?: AuthPayload };

let openShells = 0;

const send = (ws: WebSocket, payload: Record<string, unknown>) => {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
};

// Access token from ?token=, mirroring the notification socket
const readAccessToken = (url: URL): AuthPayload | null => {
  const token = url.searchParams.get('token');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded.type === 'access' ? decoded : null;
  } catch {
    return null;
  }
};

/** Attach the terminal endpoint. Safe alongside initRealtime: each ignores the other's paths. */
export const initVpsTerminal = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.replace(/\/$/, '') !== WS_PATH) return;

    const auth = readAccessToken(url);
    const unlock = readVpsUnlockToken(url.searchParams.get('vps') || undefined);

    const reject = (status: string) => {
      socket.write(`HTTP/1.1 ${status}\r\n\r\n`);
      socket.destroy();
    };

    if (!auth || !ALLOWED_ROLES.has(auth.role)) return reject('401 Unauthorized');
    if (!unlock || unlock.sub !== auth.sub) return reject('423 Locked');
    if (openShells >= MAX_CONCURRENT_SHELLS) return reject('503 Service Unavailable');

    wss.handleUpgrade(req, socket, head, (ws: TerminalSocket) => {
      ws.auth = auth;
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', async (ws: TerminalSocket, req) => {
    const auth = ws.auth!;
    const url = new URL(req.url || '/', 'http://localhost');
    const unlockToken = url.searchParams.get('vps') || undefined;
    const rows = Math.min(Math.max(Number(url.searchParams.get('rows')) || 30, 10), 120);
    const cols = Math.min(Math.max(Number(url.searchParams.get('cols')) || 110, 40), 300);

    let client: Client | null = null;
    let stream: ClientChannel | null = null;
    let transcript = '';
    let closed = false;
    const startedAt = Date.now();

    const target = await resolveSshTarget();
    if (!hasSshCredentials(target)) {
      send(ws, { type: 'error', message: 'No SSH credentials are saved for this VPS yet.' });
      ws.close();
      return;
    }

    let idleTimer: NodeJS.Timeout;
    const touch = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        send(ws, { type: 'error', message: 'Session closed after 15 minutes of inactivity.' });
        teardown();
      }, IDLE_TIMEOUT_MS);
    };

    // Ends the session once, writing the audit entry
    const teardown = () => {
      if (closed) return;
      closed = true;
      clearTimeout(idleTimer);
      clearInterval(unlockWatch);
      openShells = Math.max(0, openShells - 1);
      try {
        stream?.end();
      } catch {
        // already gone
      }
      client?.end();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();

      getVpsCommandLogModel()
        .create({
          admin_id: auth.sub,
          admin_email: auth.email,
          target: 'ssh',
          target_path: `${target.username}@${target.host}:${target.port}`,
          command_id: 'interactive-shell',
          command: 'SSH shell session',
          kind: 'SHELL',
          exit_code: null,
          duration_ms: Date.now() - startedAt,
          output_tail: transcript.slice(-TRANSCRIPT_TAIL_CHARS),
        })
        .catch(() => undefined);
    };

    // Stop the shell as soon as the console is locked or the unlock token expires
    const unlockWatch = setInterval(() => {
      const still = readVpsUnlockToken(unlockToken);
      if (!still || still.sub !== auth.sub) {
        send(ws, { type: 'error', message: 'Console locked — SSH session ended.' });
        teardown();
      }
    }, UNLOCK_CHECK_MS);

    try {
      openShells += 1;
      const shell = await openSshShell(target, { rows, cols });
      client = shell.client;
      stream = shell.stream;
      touch();

      send(ws, {
        type: 'ready',
        message: `Connected to ${target.username}@${target.host}:${target.port}`,
        host: target.host,
        username: target.username,
      });

      const forward = (chunk: Buffer) => {
        const text = chunk.toString('utf8');
        transcript = (transcript + text).slice(-TRANSCRIPT_TAIL_CHARS * 2);
        send(ws, { type: 'data', data: text });
      };

      stream.on('data', forward);
      stream.stderr.on('data', forward);
      stream.on('close', () => {
        send(ws, { type: 'exit', message: 'Remote shell closed.' });
        teardown();
      });
      stream.on('error', (err: Error) => {
        send(ws, { type: 'error', message: err.message || 'Shell error' });
        teardown();
      });
      client.on('error', (err: Error) => {
        send(ws, { type: 'error', message: err.message || 'SSH error' });
        teardown();
      });
    } catch (error: any) {
      send(ws, { type: 'error', message: error?.message || 'Could not open the SSH shell.' });
      teardown();
      return;
    }

    ws.on('message', (raw) => {
      if (closed || !stream) return;
      touch();
      let message: any;
      try {
        message = JSON.parse(String(raw));
      } catch {
        return;
      }

      if (message?.type === 'input' && typeof message.data === 'string') {
        if (Buffer.byteLength(message.data, 'utf8') > MAX_INPUT_BYTES) return;
        stream.write(message.data);
        return;
      }
      if (message?.type === 'resize') {
        const r = Math.min(Math.max(Number(message.rows) || rows, 10), 120);
        const c = Math.min(Math.max(Number(message.cols) || cols, 40), 300);
        try {
          stream.setWindow(r, c, r * 18, c * 8);
        } catch {
          // Some servers refuse window changes; harmless
        }
      }
    });

    ws.on('close', teardown);
    ws.on('error', teardown);
  });

  console.log(`🖥️  [VPS-CONSOLE] Root SSH terminal ready on ${WS_PATH}`);
};

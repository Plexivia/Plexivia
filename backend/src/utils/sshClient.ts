import fs from 'fs';
import { Client } from 'ssh2';
import type { ClientChannel, ConnectConfig } from 'ssh2';
import { decryptText } from './security.js';
import { getVpsServerModel, type IVpsServer } from '../models/VpsConsole.js';

/**
 * SSH transport for the root console.
 *
 * The VPS target is read from `vps_servers` (`key: 'primary'`) and falls back to
 * the backend .env, so the console works on a fresh install before anyone saves
 * credentials through the dashboard. Secrets live encrypted in the database and
 * are only ever decrypted inside this module.
 */

export interface SshTarget {
  label: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  appPath: string;
  clientsRoot: string;
}

export interface SshRunResult {
  stdout: string;
  stderr: string;
  /** Exit status, or null when the remote end closed on a signal */
  code: number | null;
  signal: string | null;
  truncated: boolean;
  durationMs: number;
}

const CONNECT_TIMEOUT_MS = 15_000;
const DEFAULT_COMMAND_TIMEOUT_MS = 180_000;
const MAX_OUTPUT_BYTES = 512 * 1024;

const env = (name: string) => (process.env[name] || '').trim();

// Private key from VPS_SSH_PRIVATE_KEY, or read from VPS_SSH_KEY_PATH
const readEnvPrivateKey = (): string => {
  const inline = env('VPS_SSH_PRIVATE_KEY');
  if (inline) return inline.replace(/\\n/g, '\n');
  const keyPath = env('VPS_SSH_KEY_PATH');
  if (!keyPath) return '';
  try {
    return fs.readFileSync(keyPath, 'utf8');
  } catch {
    return '';
  }
};

/** The stored VPS record, created with defaults on first use. */
export const getVpsServer = async (): Promise<IVpsServer> => {
  const Model = getVpsServerModel();
  const existing = await Model.findOne({ key: 'primary' });
  if (existing) return existing;
  return Model.create({
    key: 'primary',
    label: env('VPS_LABEL') || 'Plexivia VPS',
    host: env('VPS_SSH_HOST') || '127.0.0.1',
    port: Number(env('VPS_SSH_PORT')) || 22,
    username: env('VPS_SSH_USER') || 'root',
    auth_method: readEnvPrivateKey() ? 'PRIVATE_KEY' : 'PASSWORD',
    app_path: env('VPS_APP_PATH') || '/opt/plexivia',
    clients_root: env('VPS_CLIENTS_ROOT') || '/opt/clients',
  });
};

/** Decrypted connection details, preferring saved credentials over the .env fallback. */
export const resolveSshTarget = async (): Promise<SshTarget> => {
  const server = await getVpsServer();
  const storedPassword = decryptText(server.password_enc || '');
  const storedKey = decryptText(server.private_key_enc || '');
  const storedPassphrase = decryptText(server.passphrase_enc || '');

  const password = storedPassword || env('VPS_SSH_PASSWORD');
  const privateKey = storedKey || readEnvPrivateKey();
  const passphrase = storedPassphrase || env('VPS_SSH_PASSPHRASE');

  return {
    label: server.label,
    host: server.host,
    port: server.port,
    username: server.username,
    ...(server.auth_method === 'PRIVATE_KEY' ? { privateKey, passphrase } : { password }),
    appPath: server.app_path,
    clientsRoot: server.clients_root,
  };
};

/** True when the resolved target has a usable secret to authenticate with. */
export const hasSshCredentials = (target: SshTarget): boolean =>
  Boolean(target.privateKey?.trim() || target.password);

const toConnectConfig = (target: SshTarget): ConnectConfig => ({
  host: target.host,
  port: target.port,
  username: target.username,
  ...(target.privateKey?.trim()
    ? { privateKey: target.privateKey, ...(target.passphrase ? { passphrase: target.passphrase } : {}) }
    : { password: target.password }),
  readyTimeout: CONNECT_TIMEOUT_MS,
  keepaliveInterval: 20_000,
});

/** Open a connected ssh2 client, rejecting with a readable message on failure. */
export const connectSsh = (target: SshTarget): Promise<Client> =>
  new Promise((resolve, reject) => {
    if (!hasSshCredentials(target)) {
      reject(new Error('No SSH credentials are saved for this VPS yet.'));
      return;
    }

    const client = new Client();
    let settled = false;

    client.on('ready', () => {
      if (settled) return;
      settled = true;
      resolve(client);
    });

    client.on('error', (err: Error & { level?: string }) => {
      if (settled) return;
      settled = true;
      client.end();
      const level = err.level === 'client-authentication' ? 'Authentication failed — check the root username and password or key.' : '';
      reject(new Error(level || err.message || 'SSH connection failed'));
    });

    try {
      client.connect(toConnectConfig(target));
    } catch (err: any) {
      if (!settled) {
        settled = true;
        reject(new Error(err?.message || 'SSH connection failed'));
      }
    }
  });

/**
 * Run one command and collect its output.
 *
 * Output is capped at 512 KB per stream so a runaway `logs` command cannot
 * exhaust memory; `truncated` says whether anything was dropped.
 */
export const runSshCommand = async (
  target: SshTarget,
  command: string,
  options: { timeoutMs?: number } = {}
): Promise<SshRunResult> => {
  const started = Date.now();
  const client = await connectSsh(target);

  return new Promise<SshRunResult>((resolve, reject) => {
    const timeoutMs = options.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
    let stdout = '';
    let stderr = '';
    let truncated = false;
    let settled = false;

    const finish = (result: SshRunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      client.end();
      resolve(result);
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      client.end();
      reject(err);
    };

    const timer = setTimeout(() => {
      fail(new Error(`Command timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    const append = (current: string, chunk: Buffer) => {
      if (current.length >= MAX_OUTPUT_BYTES) {
        truncated = true;
        return current;
      }
      const next = current + chunk.toString('utf8');
      if (next.length > MAX_OUTPUT_BYTES) {
        truncated = true;
        return next.slice(0, MAX_OUTPUT_BYTES);
      }
      return next;
    };

    client.exec(command, { pty: false }, (err, stream: ClientChannel) => {
      if (err) {
        fail(err);
        return;
      }

      stream.on('data', (chunk: Buffer) => {
        stdout = append(stdout, chunk);
      });
      stream.stderr.on('data', (chunk: Buffer) => {
        stderr = append(stderr, chunk);
      });
      stream.on('close', (code: number | null, signal: string | null) => {
        finish({
          stdout,
          stderr,
          code: typeof code === 'number' ? code : null,
          signal: signal || null,
          truncated,
          durationMs: Date.now() - started,
        });
      });
      stream.on('error', fail);
    });
  });
};

/** Open an interactive shell with a pty, for the web terminal. */
export const openSshShell = async (
  target: SshTarget,
  size: { rows: number; cols: number } = { rows: 30, cols: 110 }
): Promise<{ client: Client; stream: ClientChannel }> => {
  const client = await connectSsh(target);
  return new Promise((resolve, reject) => {
    client.shell(
      { term: 'xterm-256color', rows: size.rows, cols: size.cols, width: size.cols * 8, height: size.rows * 18 },
      (err, stream) => {
        if (err) {
          client.end();
          reject(err);
          return;
        }
        resolve({ client, stream });
      }
    );
  });
};

/** Connect, read the remote identity, disconnect — used by the "Test connection" button. */
export const testSshConnection = async (target: SshTarget) => {
  const result = await runSshCommand(target, 'id -un && hostname && uname -sr', { timeoutMs: 20_000 });
  const [user, hostname, kernel] = result.stdout.trim().split('\n');
  return {
    user: (user || '').trim(),
    hostname: (hostname || '').trim(),
    kernel: (kernel || '').trim(),
    isRoot: (user || '').trim() === 'root',
  };
};

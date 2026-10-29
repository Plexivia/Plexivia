import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { JWT_SECRET } from '../config/env.js';
import type { AuthPayload } from '../middleware/auth.js';
import { getNotificationModel } from '../models/Webmail.js';

const WS_PATHS = new Set(['/api/ws', '/api/v1/ws', '/ws']);

type LiveSocket = WebSocket & { isAlive?: boolean; auth?: AuthPayload };

const clients = new Set<LiveSocket>();

// Verify the access token sent as ?token= on the upgrade request
const authenticate = (url: URL): AuthPayload | null => {
  const token = url.searchParams.get('token');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded.type === 'access' ? decoded : null;
  } catch {
    return null;
  }
};

// Push an event to every connected dashboard
export const broadcast = (event: string, data: unknown) => {
  const payload = JSON.stringify({ event, data });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
};

// Store a notification and push it live to all dashboards
export const notify = async (input: { type: string; title: string; description?: string; link?: string }) => {
  try {
    const doc = await getNotificationModel().create(input);
    const unreadCount = await getNotificationModel().countDocuments({ isRead: false });
    broadcast('notification', { notification: doc.toObject(), unreadCount });
  } catch (err: any) {
    console.warn('⚠️ [REALTIME] Failed to store notification:', err.message);
  }
};

// Attach the authenticated WebSocket endpoint to the HTTP server
export const initRealtime = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!WS_PATHS.has(url.pathname.replace(/\/$/, ''))) return;

    const auth = authenticate(url);
    if (!auth) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws: LiveSocket) => {
      ws.auth = auth;
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', async (ws: LiveSocket) => {
    ws.isAlive = true;
    clients.add(ws);
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));

    // Initial snapshot so the bell is correct right after connecting
    try {
      const Notification = getNotificationModel();
      const [notifications, unreadCount] = await Promise.all([
        Notification.find().sort({ created_at: -1 }).limit(20).lean(),
        Notification.countDocuments({ isRead: false }),
      ]);
      ws.send(JSON.stringify({ event: 'init', data: { notifications, unreadCount } }));
    } catch {
      // Database not ready yet; the client fetches over HTTP as well
    }
  });

  // Drop dead connections every 30s
  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (ws.isAlive === false) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);
  wss.on('close', () => clearInterval(heartbeat));

  console.log('🔔 [REALTIME] WebSocket endpoint ready on /api/ws');
};

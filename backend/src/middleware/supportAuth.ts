import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getClientModel, IClient } from '../models/Client.js';
import { verifyPassword } from '../utils/security.js';
import { JWT_SECRET } from '../config/env.js';
import type { AuthPayload } from './auth.js';

export interface SupportAuthedRequest extends Request {
  supportClient?: IClient;
  auth?: AuthPayload;
}

// A support key looks like "<clientDId>.<secret>" — the dId gives a cheap indexed lookup,
// the secret half is checked against the client's stored scrypt hash
const splitSupportKey = (raw: string): [string, string] | null => {
  const key = raw.replace(/^Bearer\s+/i, '').trim();
  const dot = key.indexOf('.');
  if (dot <= 0 || dot === key.length - 1) return null;
  return [key.slice(0, dot), key.slice(dot + 1)];
};

const headerKey = (req: Request): string => String(req.headers['x-support-key'] || req.headers.authorization || '');

// Loads and validates the client behind a support key; null with no side effect on failure
const resolveSupportClient = async (raw: string): Promise<IClient | null> => {
  const parsed = splitSupportKey(raw);
  if (!parsed) return null;
  const [dId, secret] = parsed;
  const client = await getClientModel().findOne({ dId });
  if (!client || !client.support_key_hash || !verifyPassword(secret, client.support_key_hash)) return null;
  if (client.status !== 'ACTIVE') return null;
  return client;
};

// Authenticates a client dashboard calling the Support Desk API with its issued key
export const requireSupportKey = async (req: SupportAuthedRequest, res: Response, next: NextFunction) => {
  const raw = headerKey(req);
  if (!raw) return res.status(401).json({ success: false, message: 'Support API key required' });
  const client = await resolveSupportClient(raw);
  if (!client) return res.status(401).json({ success: false, message: 'Invalid, revoked or inactive support key' });
  req.supportClient = client;
  return next();
};

// Accepts either an admin dashboard JWT or a client support key, for routes both sides share (e.g. attachment upload)
export const requireAuthOrSupportKey = async (req: SupportAuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      if (decoded.type === 'access') {
        req.auth = decoded;
        return next();
      }
    } catch {
      // fall through to support-key check
    }
  }
  const raw = headerKey(req);
  if (raw) {
    const client = await resolveSupportClient(raw);
    if (client) {
      req.supportClient = client;
      return next();
    }
  }
  return res.status(401).json({ success: false, message: 'Authentication required' });
};

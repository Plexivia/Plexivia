import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/env.js';
import type { AuthedRequest } from './auth.js';

/**
 * Unlock state for the root console.
 *
 * Holding a dashboard access token is not enough to run anything on the VPS: the
 * admin re-enters their password and a console authenticator code, which mints a
 * short-lived unlock token sent on `X-Vps-Token`.
 *
 * Unlock tokens are signed *and* tracked in memory, so "Lock console" and a
 * backend restart both end every open session immediately — a plain JWT could
 * not be withdrawn before it expired.
 */

export const VPS_UNLOCK_TTL_SECONDS = 20 * 60;
const PENDING_TTL_SECONDS = 5 * 60;

interface UnlockSession {
  adminId: string;
  email: string;
  expiresAt: number;
}

const activeUnlocks = new Map<string, UnlockSession>();

const sweep = () => {
  const now = Date.now();
  for (const [jti, session] of activeUnlocks) {
    if (session.expiresAt <= now) activeUnlocks.delete(jti);
  }
};

export interface VpsUnlockPayload {
  sub: string;
  email: string;
  jti: string;
  scope: 'vps_console';
}

/** Token for the password step, before the authenticator code is accepted. */
export const signVpsPendingToken = (adminId: string, email: string): string =>
  jwt.sign({ sub: adminId, email, step: 'vps_2fa_pending' }, JWT_SECRET, { expiresIn: PENDING_TTL_SECONDS });

/** The admin id bound to a valid pending token, or null. */
export const readVpsPendingToken = (token?: string): { adminId: string; email: string } | null => {
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded?.step !== 'vps_2fa_pending' || !decoded?.sub) return null;
    return { adminId: String(decoded.sub), email: String(decoded.email || '') };
  } catch {
    return null;
  }
};

/** Mint an unlock token and register the session. */
export const issueVpsUnlockToken = (adminId: string, email: string): { token: string; expiresInSeconds: number } => {
  sweep();
  const jti = crypto.randomUUID();
  activeUnlocks.set(jti, { adminId, email, expiresAt: Date.now() + VPS_UNLOCK_TTL_SECONDS * 1000 });
  const token = jwt.sign({ sub: adminId, email, jti, scope: 'vps_console' }, JWT_SECRET, {
    expiresIn: VPS_UNLOCK_TTL_SECONDS,
  });
  return { token, expiresInSeconds: VPS_UNLOCK_TTL_SECONDS };
};

/** Verify an unlock token against both its signature and the live session registry. */
export const readVpsUnlockToken = (token?: string): VpsUnlockPayload | null => {
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded?.scope !== 'vps_console' || !decoded?.jti) return null;
    const session = activeUnlocks.get(String(decoded.jti));
    if (!session || session.expiresAt <= Date.now() || session.adminId !== String(decoded.sub)) return null;
    return { sub: String(decoded.sub), email: String(decoded.email || ''), jti: String(decoded.jti), scope: 'vps_console' };
  } catch {
    return null;
  }
};

/** End one session (Lock console) or every session for an admin. */
export const revokeVpsUnlock = (payload: { jti?: string; adminId?: string }) => {
  if (payload.jti) activeUnlocks.delete(payload.jti);
  if (!payload.adminId) return;
  for (const [jti, session] of activeUnlocks) {
    if (session.adminId === payload.adminId) activeUnlocks.delete(jti);
  }
};

export const countVpsUnlocks = (adminId: string): number => {
  sweep();
  return [...activeUnlocks.values()].filter((s) => s.adminId === adminId).length;
};

export interface VpsRequest extends AuthedRequest {
  vps?: VpsUnlockPayload;
}

const getUnlockToken = (req: VpsRequest): string | undefined =>
  (req.headers['x-vps-token'] as string | undefined) || req.body?.vpsToken;

/**
 * Require an unlocked console. Use after `requireAuth`: the unlock token must
 * belong to the same admin as the access token, so a leaked unlock token is
 * useless without that admin's session.
 */
export const requireVpsUnlock = (req: VpsRequest, res: Response, next: NextFunction) => {
  const payload = readVpsUnlockToken(getUnlockToken(req));
  if (!payload) {
    return res.status(423).json({
      success: false,
      locked: true,
      message: 'The root console is locked. Verify your password and authenticator code to unlock it.',
    });
  }
  if (!req.auth || req.auth.sub !== payload.sub) {
    return res.status(423).json({ success: false, locked: true, message: 'This unlock session belongs to another account.' });
  }
  req.vps = payload;
  return next();
};

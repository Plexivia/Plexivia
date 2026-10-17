import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/env.js';

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
}

export interface AuthedRequest extends Request {
  auth?: AuthPayload;
}

// Require a valid access token in the Authorization header
export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (decoded.type !== 'access') {
      return res.status(401).json({ success: false, message: 'Invalid access token' });
    }
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
};

// Restrict a route to the given admin roles (use after requireAuth)
export const requireRole = (...roles: string[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  return next();
};

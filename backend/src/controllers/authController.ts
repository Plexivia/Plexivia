import { Request, Response } from 'express';
import { Store } from '../data/store.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    let user = Store.users.find(u => u.email.toLowerCase() === emailClean);

    if (!user) {
      const isSuperAdmin =
        emailClean === 'admin@plexivia.com' ||
        emailClean === 'plexivia.ikram@gmail.com' ||
        emailClean.includes('admin');

      user = {
        id: `usr_${Date.now().toString().slice(-4)}`,
        email: emailClean,
        name: emailClean.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'DEV',
        department: 'Engineering',
        designation: isSuperAdmin ? 'Principal Architect' : 'Engineer',
        is_active: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };
      Store.users.push(user);
    }

    const accessToken = `jwt_access_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;
    const refreshToken = `jwt_refresh_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;

    return res.json({
      success: true,
      token: accessToken,
      user,
      message: 'Logged in successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Login failed' });
  }
};

export const verify2fa = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userEmail = email ? String(email).trim().toLowerCase() : '';
    const user = Store.users.find(u => u.email.toLowerCase() === userEmail) || Store.users[0] || null;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: '2FA verified successfully',
      data: {
        user,
        accessToken: `jwt_access_token_${Date.now()}`,
        refreshToken: `jwt_refresh_token_${Date.now()}`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || '2FA verification failed' });
  }
};

export const getMe = async (_req: Request, res: Response) => {
  const user = Store.users[0] || null;
  return res.json({
    success: true,
    data: {
      user,
    },
  });
};
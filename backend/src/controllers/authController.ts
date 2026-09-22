import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const isSuperAdmin =
      emailClean === 'admin@plexivia.com' ||
      emailClean === 'plexivia.ikram@gmail.com' ||
      emailClean.includes('admin');

    const user = {
      id: isSuperAdmin ? 'usr_admin_01' : 'usr_dev_01',
      email: emailClean,
      name: emailClean.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      role: isSuperAdmin ? 'Superadmin' : 'Admin',
      department: 'Engineering',
      designation: 'Enterprise Admin',
      avatar: '',
    };

    const accessToken = `jwt_access_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;
    const refreshToken = `jwt_refresh_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;

    return res.json({
      success: true,
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
    const userEmail = email ? String(email).trim().toLowerCase() : 'admin@plexivia.com';

    const user = {
      id: 'usr_admin_01',
      email: userEmail,
      name: userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      role: 'Superadmin',
      department: 'Engineering',
    };

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
  return res.json({
    success: true,
    data: {
      user: {
        id: 'usr_admin_01',
        email: 'admin@plexivia.com',
        name: 'Plexivia Admin',
        role: 'Superadmin',
      },
    },
  });
};
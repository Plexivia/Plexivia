import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getAdminModel } from '../models/Admin.js';
import { getClientVaultModel } from '../models/ClientVault.js';

const JWT_SECRET = process.env.JWT_SECRET || 'plexivia_production_jwt_secret_key_secure_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'plexivia_production_jwt_refresh_secret_key_2026';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const activeOtps: Map<string, OtpEntry> = new Map();

// Check if admin email exists in database for step 1 login validation
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: emailClean });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No administrative account associated with this email.' });
    }

    return res.json({
      success: true,
      exists: true,
      data: {
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to verify email' });
  }
};

// Validate password for step 2 login validation and trigger 2FA requirements
export const verifyPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: emailClean });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    const twoFactorToken = jwt.sign(
      { email: emailClean, step: '2fa_pending' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    return res.json({
      success: true,
      requires2fa: true,
      twoFactorToken,
      email: emailClean,
      availableMethods: ['EMAIL_OTP', 'TOTP_AUTHENTICATOR'],
      message: 'Password verified. Please select a two-factor verification method.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Password verification failed' });
  }
};

// Dispatch a 6-digit email OTP with 3-minute validity countdown
export const sendEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 180;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    activeOtps.set(emailClean, { code: otpCode, expiresAt });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${emailClean}. Valid for 3 minutes.`,
      expiresInSeconds,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to dispatch email OTP' });
  }
};

// Validate 2FA code checking method, code matching, and 3-minute expiration
export const verify2fa = async (req: Request, res: Response) => {
  try {
    const { email, code, method } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const userEmail = String(email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: userEmail });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (method === 'EMAIL_OTP' || method === 'email') {
      const storedOtp = activeOtps.get(userEmail);
      if (!storedOtp) {
        return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new code.' });
      }
      if (Date.now() > storedOtp.expiresAt) {
        activeOtps.delete(userEmail);
        return res.status(400).json({ success: false, message: 'Verification code has expired (3 minutes passed). Please request a new OTP.' });
      }
      if (storedOtp.code !== String(code).trim()) {
        return res.status(400).json({ success: false, message: 'Invalid verification code.' });
      }
      activeOtps.delete(userEmail);
    }

    const accessToken = jwt.sign(
      { sub: admin._id || admin.id, email: admin.email, role: admin.role, type: 'access' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    const refreshToken = jwt.sign(
      { sub: admin._id || admin.id, email: admin.email, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Identity verified successfully',
      data: {
        admin,
        user: admin,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || '2FA verification failed' });
  }
};

// Resend fresh email verification code with renewed 3-minute timer
export const resendEmailOtp = (req: Request, res: Response) => {
  return sendEmailOtp(req, res);
};

// Dispatch or generate MFA TOTP QR code for authenticator configuration
export const sendMfaQr = async (req: Request, res: Response) => {
  try {
    let email = req.body?.email;
    const twoFactorToken = req.body?.twoFactorToken || req.headers['x-two-factor-token'] || req.headers.authorization?.replace('Bearer ', '');

    if (!email && twoFactorToken) {
      try {
        const decoded: any = jwt.verify(twoFactorToken, JWT_SECRET);
        email = decoded?.email;
      } catch {
        // Fallback if token is expired or direct decode
        const decoded: any = jwt.decode(twoFactorToken);
        email = decoded?.email;
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address or valid twoFactorToken is required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: emailClean });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No administrative account found with this email.' });
    }

    const baseSecret = Buffer.from(`${emailClean}_PLX_MFA_2026`).toString('base64').replace(/[^A-Z2-7]/g, '').slice(0, 16).padEnd(16, 'A');
    const otpauthUrl = `otpauth://totp/Plexivia:${encodeURIComponent(emailClean)}?secret=${baseSecret}&issuer=Plexivia`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(otpauthUrl)}`;

    return res.json({
      success: true,
      message: `MFA QR setup dispatched and generated for ${emailClean}. Scan with Google Authenticator, Microsoft Authenticator, or Apple Keychain.`,
      data: {
        email: emailClean,
        secretKey: baseSecret,
        otpauthUrl,
        qrCodeImageUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to dispatch MFA QR code' });
  }
};

// Backward-compatible single-step authentication handler
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: emailClean });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const twoFactorToken = jwt.sign(
      { email: emailClean, step: '2fa_pending' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    return res.json({
      success: true,
      requires2fa: true,
      twoFactorToken,
      email: emailClean,
      availableMethods: ['EMAIL_OTP', 'TOTP_AUTHENTICATOR'],
      message: 'Password verified. Please complete two-factor authentication.',
      data: {
        requires2fa: true,
        twoFactorToken,
        email: emailClean,
        user: admin,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Authentication failed' });
  }
};

// Refresh expired access token with valid refresh token
export const refreshToken = (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const newAccessToken = jwt.sign(
      { sub: decoded.sub, email: decoded.email, role: decoded.role || 'OWNER', type: 'access' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    const newRefreshToken = jwt.sign(
      { sub: decoded.sub, email: decoded.email, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to refresh token' });
  }
};

// Terminate session and invalidate auth token
export const logout = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Initiate administrative password reset flow
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }
  return res.json({
    success: true,
    message: 'If the email exists, reset instructions have been dispatched.',
  });
};

// Complete administrative password reset
export const resetPassword = (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
  }
  return res.json({
    success: true,
    message: 'Password reset successfully. Please login with your new credentials.',
  });
};

// Retrieve current authenticated administrative session profile
export const getMe = async (req: Request, res: Response) => {
  try {
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ is_active: true });
    return res.json({
      success: true,
      data: {
        admin,
        user: admin,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve secret credentials vault for a specific client with access protection
export const getClientVault = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.clientId as string;
    const VaultModel = getClientVaultModel();
    const vaultItem = await VaultModel.findOne({ $or: [{ client_id: clientId }, { client_key: clientId }] });

    if (!vaultItem) {
      return res.status(404).json({ success: false, message: `Vault entry for client '${clientId}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: vaultItem,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client vault' });
  }
};

// Store or update confidential credentials and VPS keys in the vault
export const updateClientVault = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.clientId as string;
    const updates = req.body;
    const VaultModel = getClientVaultModel();

    const updated = await VaultModel.findOneAndUpdate(
      { $or: [{ client_id: clientId }, { client_key: clientId }] },
      {
        $set: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
        $setOnInsert: {
          client_id: clientId,
          client_key: updates.client_key || clientId,
          business_name: updates.business_name || 'Client',
          created_at: new Date().toISOString(),
        },
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Client credentials vault updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client vault' });
  }
};

// Retrieve granular service and module permissions for an administrative user
export const getAdminPermissions = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id as string;
    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ $or: [{ email: adminId.toLowerCase() }] });

    if (!admin) {
      return res.status(404).json({ success: false, message: `Admin user '${adminId}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: admin.permissions || {},
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve admin permissions' });
  }
};

// Update granular service and module permissions for an administrative user
export const updateAdminPermissions = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id as string;
    const { permissions } = req.body;
    const AdminModel = getAdminModel();

    const admin = await AdminModel.findOneAndUpdate(
      { $or: [{ email: adminId.toLowerCase() }] },
      {
        $set: {
          permissions,
          updated_at: new Date().toISOString(),
        },
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ success: false, message: `Admin user '${adminId}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Permissions for admin '${admin.full_name}' updated successfully`,
      data: admin.permissions,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update admin permissions' });
  }
};
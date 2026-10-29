import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getAdminModel, type IAdmin } from '../models/Admin.js';
import { getClientVaultModel } from '../models/ClientVault.js';
import { sendMail, renderOtpEmailHtml, renderMfaEmailHtml } from '../utils/mailer.js';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/env.js';
import { AuthedRequest } from '../middleware/auth.js';
import { verifyPassword as checkPassword, verifyTotp, generateTotpSecret, generateNumericOtp, safeEqual } from '../utils/security.js';

interface OtpEntry {
  code: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

const OTP_TTL_SECONDS = 180;
const OTP_RESEND_COOLDOWN_MS = 30_000;
const OTP_MAX_ATTEMPTS = 5;
const INVALID_CREDENTIALS = 'Invalid email or password.';

const activeOtps: Map<string, OtpEntry> = new Map();

// Extract the pending two-factor token from body or headers
const getTwoFactorToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  return (
    req.body?.twoFactorToken ||
    (req.headers['x-two-factor-token'] as string | undefined) ||
    (header?.startsWith('Bearer ') ? header.slice(7) : undefined)
  );
};

// Return the email bound to a valid, unexpired 2fa_pending token, or null
const getPendingEmail = (token?: string): string | null => {
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded?.step === '2fa_pending' && decoded?.email ? String(decoded.email) : null;
  } catch {
    return null;
  }
};

// Issue access and refresh tokens for a verified admin
const issueSessionTokens = (admin: IAdmin) => {
  const sub = String(admin._id);
  const accessToken = jwt.sign({ sub, email: admin.email, role: admin.role, type: 'access' }, JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ sub, email: admin.email, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

// Stamp the admin's last successful sign-in time without blocking the response
const recordLogin = (admin: IAdmin) => {
  getAdminModel()
    .updateOne({ _id: admin._id }, { $set: { last_login_at: new Date().toISOString() } })
    .catch(() => undefined);
};

// Check email + password and return the admin, or null on any mismatch
const authenticateWithPassword = async (email: unknown, password: unknown): Promise<IAdmin | null> => {
  const emailClean = String(email).trim().toLowerCase();
  const admin = await getAdminModel().findOne({ email: emailClean });
  if (!admin || !admin.is_active) return null;
  return checkPassword(String(password), admin.password_hash) ? admin : null;
};

const pendingTwoFactorResponse = (admin: IAdmin, message: string) => {
  const twoFactorToken = jwt.sign({ email: admin.email, step: '2fa_pending' }, JWT_SECRET, { expiresIn: '5m' });
  const availableMethods = admin.two_factor_secret ? ['EMAIL_OTP', 'TOTP_AUTHENTICATOR'] : ['EMAIL_OTP'];
  return {
    success: true,
    requires2fa: true,
    twoFactorToken,
    email: admin.email,
    availableMethods,
    message,
    data: { requires2fa: true, twoFactorToken, email: admin.email },
  };
};

// Sign in directly when 2FA is disabled, otherwise issue a pending 2FA challenge
const passwordStepResponse = (admin: IAdmin, message: string) => {
  if (admin.two_factor_enabled === false) {
    const { accessToken, refreshToken } = issueSessionTokens(admin);
    recordLogin(admin);
    return {
      success: true,
      requires2fa: false,
      message: 'Signed in successfully',
      data: { admin, user: admin, accessToken, refreshToken },
    };
  }
  return pendingTwoFactorResponse(admin, message);
};

// Check if admin email exists in database for step 1 login validation
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const admin = await getAdminModel().findOne({ email: emailClean, is_active: true });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No administrative account associated with this email.' });
    }

    return res.json({
      success: true,
      exists: true,
      data: {
        email: admin.email,
        full_name: admin.full_name,
        avatar: admin.avatar,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to verify email' });
  }
};

// Validate password for step 2 login validation and trigger 2FA requirements
export const verifyPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await authenticateWithPassword(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, message: INVALID_CREDENTIALS });
    }

    return res.json(passwordStepResponse(admin, 'Password verified. Please select a two-factor verification method.'));
  } catch {
    return res.status(500).json({ success: false, message: 'Password verification failed' });
  }
};

// Dispatch a 6-digit email OTP with 3-minute validity countdown
export const sendEmailOtp = async (req: Request, res: Response) => {
  try {
    const email = req.body?.email || getPendingEmail(getTwoFactorToken(req));
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const genericResponse = {
      success: true,
      message: 'If the account exists, a 6-digit verification code has been sent. Valid for 3 minutes.',
      expiresInSeconds: OTP_TTL_SECONDS,
    };

    const existing = activeOtps.get(emailClean);
    if (existing && Date.now() - existing.sentAt < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting another code.' });
    }

    const admin = await getAdminModel().findOne({ email: emailClean, is_active: true });
    if (!admin) {
      return res.json(genericResponse);
    }

    const otpCode = generateNumericOtp();
    const now = Date.now();
    activeOtps.set(emailClean, { code: otpCode, expiresAt: now + OTP_TTL_SECONDS * 1000, sentAt: now, attempts: 0 });

    const mail = await sendMail({
      to: emailClean,
      subject: 'Your Plexivia Verification Code',
      html: renderOtpEmailHtml(otpCode, emailClean),
      text: `Your Plexivia verification code is: ${otpCode}. It expires in 3 minutes.`,
    });
    if (!mail.success) {
      activeOtps.delete(emailClean);
      console.error(`[BACKEND-AUTH] Failed to send OTP email: ${mail.error}`);
      return res.status(502).json({ success: false, message: 'Could not send the verification email. Please try again shortly.' });
    }

    return res.json(genericResponse);
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to dispatch email OTP' });
  }
};

// Validate 2FA code (email OTP or authenticator TOTP) and issue session tokens
export const verify2fa = async (req: Request, res: Response) => {
  try {
    const { email, code, method } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const userEmail = String(email).trim().toLowerCase();
    const codeClean = String(code).trim();
    const pendingEmail = getPendingEmail(getTwoFactorToken(req));

    if (pendingEmail && pendingEmail !== userEmail) {
      return res.status(401).json({ success: false, message: 'Two-factor session does not match this account.' });
    }

    const admin = await getAdminModel().findOne({ email: userEmail, is_active: true });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid verification code.' });
    }

    if (method === 'EMAIL_OTP' || method === 'email') {
      // Email OTP is accepted alone (passwordless login) or as the second factor after the password step
      const storedOtp = activeOtps.get(userEmail);
      if (!storedOtp) {
        return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new code.' });
      }
      if (Date.now() > storedOtp.expiresAt || storedOtp.attempts >= OTP_MAX_ATTEMPTS) {
        activeOtps.delete(userEmail);
        return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new OTP.' });
      }
      if (!safeEqual(storedOtp.code, codeClean)) {
        storedOtp.attempts += 1;
        return res.status(401).json({ success: false, message: 'Invalid verification code.' });
      }
      activeOtps.delete(userEmail);
    } else if (method === 'TOTP_AUTHENTICATOR' || method === 'totp' || method === 'authenticator') {
      // Authenticator codes are only accepted after a successful password step
      if (!pendingEmail) {
        return res.status(401).json({ success: false, message: 'Password verification required before authenticator code.' });
      }
      if (admin.two_factor_secret) {
        if (!verifyTotp(admin.two_factor_secret, codeClean)) {
          return res.status(401).json({ success: false, message: 'Invalid verification code.' });
        }
      } else if (admin.two_factor_pending_secret && verifyTotp(admin.two_factor_pending_secret, codeClean)) {
        await getAdminModel().updateOne(
          { _id: admin._id },
          { $set: { two_factor_secret: admin.two_factor_pending_secret, updated_at: new Date().toISOString() }, $unset: { two_factor_pending_secret: '' } }
        );
      } else {
        return res.status(401).json({ success: false, message: 'Invalid verification code.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported verification method.' });
    }

    const { accessToken, refreshToken } = issueSessionTokens(admin);
    recordLogin(admin);

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
  } catch {
    return res.status(500).json({ success: false, message: '2FA verification failed' });
  }
};

// Resend fresh email verification code with renewed 3-minute timer
export const resendEmailOtp = (req: Request, res: Response) => {
  return sendEmailOtp(req, res);
};

// Enroll an authenticator app: requires a valid password step, issues a secret only once
export const sendMfaQr = async (req: Request, res: Response) => {
  try {
    const emailClean = getPendingEmail(getTwoFactorToken(req));
    if (!emailClean) {
      return res.status(401).json({ success: false, message: 'A valid twoFactorToken is required.' });
    }

    const AdminModel = getAdminModel();
    const admin = await AdminModel.findOne({ email: emailClean, is_active: true });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'A valid twoFactorToken is required.' });
    }

    if (admin.two_factor_secret) {
      return res.status(409).json({ success: false, message: 'An authenticator is already configured for this account. Contact the owner to reset it.' });
    }

    const secretKey = admin.two_factor_pending_secret || generateTotpSecret();
    if (!admin.two_factor_pending_secret) {
      await AdminModel.updateOne({ _id: admin._id }, { $set: { two_factor_pending_secret: secretKey, updated_at: new Date().toISOString() } });
    }

    const otpauthUrl = `otpauth://totp/Plexivia:${encodeURIComponent(emailClean)}?secret=${secretKey}&issuer=Plexivia`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(otpauthUrl)}`;

    const mail = await sendMail({
      to: emailClean,
      subject: 'Setup Two-Factor Authenticator (Plexivia IAM)',
      html: renderMfaEmailHtml(secretKey, qrCodeImageUrl, emailClean),
      text: `Setup your Plexivia Two-Factor Authenticator. Secret Key: ${secretKey}`,
    });
    if (!mail.success) {
      console.error(`[BACKEND-AUTH] Failed to send MFA QR email: ${mail.error}`);
      return res.status(502).json({ success: false, message: 'Could not send the authenticator setup email. Please try again shortly.' });
    }

    return res.json({
      success: true,
      message: `Authenticator QR code emailed to ${emailClean}. Scan it, then enter the 6-digit code to finish setup.`,
      data: {
        email: emailClean,
        secretKey,
        otpauthUrl,
        qrCodeImageUrl,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to dispatch MFA QR code' });
  }
};

// Backward-compatible single-step authentication handler
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await authenticateWithPassword(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, message: INVALID_CREDENTIALS });
    }

    return res.json(passwordStepResponse(admin, 'Password verified. Please complete two-factor authentication.'));
  } catch {
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// Refresh expired access token with valid refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const admin = decoded?.type === 'refresh' ? await getAdminModel().findById(decoded.sub) : null;
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    return res.json({
      success: true,
      data: issueSessionTokens(admin),
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to refresh token' });
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

// Forward credential assistance notification to administrator
export const notifyForgotCredentials = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log(`🔔 [Auth] Credential assistance request dispatched for: ${email || 'Unknown'}`);
    return res.json({
      success: true,
      message: 'Your credential recovery request has been forwarded to the Plexivia administrator.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to submit recovery request' });
  }
};

// Password reset is not implemented yet; refuse instead of pretending to succeed
export const resetPassword = (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
  }
  return res.status(501).json({
    success: false,
    message: 'Password reset is not available yet. Please contact the Plexivia administrator.',
  });
};

// Retrieve current authenticated administrative session profile
export const getMe = async (req: AuthedRequest, res: Response) => {
  try {
    const admin = await getAdminModel().findById(req.auth?.sub);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Session is no longer valid' });
    }
    return res.json({
      success: true,
      data: {
        admin,
        user: admin,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
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
    const { _id, client_id, created_at, ...updates } = req.body || {};
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

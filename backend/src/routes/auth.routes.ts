import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Multi-step Authentication Lifecycle
router.post('/login/check-email', authController.checkEmail);
router.post('/login/verify-password', authController.verifyPassword);
router.post('/login/2fa/send-email-otp', authController.sendEmailOtp);
router.post('/2fa/resend', authController.resendEmailOtp);
router.post('/2fa/send-qr', authController.sendMfaQr);
router.post('/mfa/send-qr', authController.sendMfaQr);
router.post('/mfa/generate-qr', authController.sendMfaQr);
router.post('/2fa/verify', authController.verify2fa);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/forgot-credentials-notify', authController.notifyForgotCredentials);
router.post('/reset-password', authController.resetPassword);

// Everything below requires a valid access token
router.get('/me', requireAuth, authController.getMe);

// High-Security Client Vault (Owner / Admin Only)
router.get('/vault/clients/:clientId', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), authController.getClientVault);
router.put('/vault/clients/:clientId', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), authController.updateClientVault);
router.patch('/vault/clients/:clientId', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), authController.updateClientVault);

// Admin Role & Module Permissions Management
router.get('/admins/:id/permissions', requireAuth, requireRole('OWNER', 'SUPER_ADMIN'), authController.getAdminPermissions);
router.put('/admins/:id/permissions', requireAuth, requireRole('OWNER', 'SUPER_ADMIN'), authController.updateAdminPermissions);
router.patch('/admins/:id/permissions', requireAuth, requireRole('OWNER', 'SUPER_ADMIN'), authController.updateAdminPermissions);

// Legacy admin user list compatibility
router.get('/users', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.getUsers);
router.post('/users', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.createUser);
router.post('/users/bulk-delete', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.bulkDeleteUsers);
router.post('/users/:id/invite', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.sendUserInvite);
router.post('/users/:id/reset-password', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.resetUserPassword);
router.post('/users/:id/send-2fa', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.sendUser2fa);
router.get('/users/:id', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.getUserById);
router.put('/users/:id', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.updateUser);
router.patch('/users/:id', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.updateUser);
router.delete('/users/:id', requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'), userController.deleteUser);

export default router;

import { Router } from 'express';
import {
  checkEmail,
  verifyPassword,
  sendEmailOtp,
  verify2fa,
  getClientVault,
} from '../controllers/authController.js';

export const authRouter = Router();

// Route: Step 1 Check Email
authRouter.post('/login/check-email', checkEmail);

// Route: Step 2 Verify Password
authRouter.post('/login/verify-password', verifyPassword);

// Route: Step 3 Dispatch Email OTP
authRouter.post('/login/2fa/send-email-otp', sendEmailOtp);

// Route: Verify 2FA & Issue JWT
authRouter.post('/2fa/verify', verify2fa);

// Route: Resend 2FA Email Code
authRouter.post('/2fa/resend', sendEmailOtp);

// Route: Direct login fallback
authRouter.post('/login', verifyPassword);

// Route: Client Vault
authRouter.get('/vault/clients/:id', getClientVault);

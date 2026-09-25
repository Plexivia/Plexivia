import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// Authentication lifecycle
router.post('/login', authController.login);
router.post('/2fa/verify', authController.verify2fa);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authController.getMe);

// High-Security Client Vault (Owner / Admin Only)
router.get('/vault/clients/:clientId', authController.getClientVault);
router.put('/vault/clients/:clientId', authController.updateClientVault);
router.patch('/vault/clients/:clientId', authController.updateClientVault);

// Legacy admin user list compatibility
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

export default router;

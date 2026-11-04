import { Router } from 'express';
import * as vpsConsole from '../controllers/vpsConsoleController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { requireVpsUnlock } from '../middleware/vpsConsole.js';

/**
 * VPS root console (/api/vps/console/*).
 *
 * Two gates on everything here: a dashboard session with a senior role, and —
 * for anything that touches the server — an unlock token from the password plus
 * console-authenticator challenge. Credential changes are owner-only.
 */

const router = Router();

router.use(requireAuth);
router.use(requireRole('OWNER', 'SUPER_ADMIN'));

const owner = requireRole('OWNER');

// Lock screen and unlock challenge
router.get('/console/state', vpsConsole.getConsoleState);
router.post('/console/unlock/password', vpsConsole.unlockWithPassword);
router.post('/console/unlock/authenticator', vpsConsole.startAuthenticatorEnrollment);
router.post('/console/unlock/email-otp', vpsConsole.sendConsoleEmailOtp);
router.post('/console/unlock/verify', vpsConsole.verifyConsoleCode);
router.post('/console/lock', vpsConsole.lockConsole);

// Everything below needs an unlocked console
router.get('/console/targets', requireVpsUnlock, vpsConsole.listTargets);
router.get('/console/commands', requireVpsUnlock, vpsConsole.listCommands);
router.post('/console/exec', requireVpsUnlock, vpsConsole.execCommand);
router.get('/console/logs', requireVpsUnlock, vpsConsole.listCommandLogs);
router.post('/console/test', requireVpsUnlock, vpsConsole.testConnection);

// Owner-only: root credentials and authenticator recovery
router.put('/console/server', requireVpsUnlock, owner, vpsConsole.saveServer);
router.post('/console/enrollment/reset', requireVpsUnlock, owner, vpsConsole.resetEnrollment);

export default router;

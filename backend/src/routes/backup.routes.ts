import { Router } from 'express';
import * as backupController from '../controllers/backupController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Cloudflare R2 database backups (Owner / Super Admin / Admin only)
router.use(requireAuth, requireRole('OWNER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/settings', backupController.getSettings);
router.put('/settings', backupController.updateSettings);
router.post('/settings/test', backupController.testConnection);
router.post('/bucket', backupController.createBucket);
router.post('/run', backupController.runBackupNow);
router.get('/list', backupController.listBackups);
router.get('/download', backupController.downloadBackup);

export default router;

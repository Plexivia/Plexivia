import { Router } from 'express';
import * as qr from '../controllers/qrController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public endpoint used by the website landing page — no auth
router.get('/public/:slug', qr.getPublicQrData);
router.get('/public', qr.getPublicQrData);
router.get('/public/:slug/vcard', qr.getPublicVCard);

// Admin management
const admin = [requireAuth, requireRole('OWNER', 'SUPER_ADMIN', 'ADMIN')];
router.get('/', admin, qr.listQrCodes);
router.post('/', admin, qr.createQrCode);
router.post('/preview', admin, qr.previewQr);
router.get('/:id', admin, qr.getQrCode);
router.patch('/:id', admin, qr.updateQrCode);
router.delete('/:id', admin, qr.deleteQrCode);
router.get('/:id/image', admin, qr.getQrImage);

export default router;

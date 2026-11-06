import { Router } from 'express';
import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import * as studioDocs from '../controllers/studioDocumentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Dashboard-wide settings and Document Studio records both need a signed-in admin
router.use(requireAuth);

// Brand identity + document defaults (one settings document for the whole dashboard)
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);
router.patch('/settings', settingsController.updateSettings);

// Brand logo / app icon upload — the image is sent as a raw body (?slot=logo|icon)
router.post(
  '/settings/brand-image',
  express.raw({ type: settingsController.LOGO_TYPES, limit: '2mb' }),
  settingsController.uploadBrandImage
);

// Generated documents (invoice, money receipt, salary slip, cash voucher)
router.get('/studio-documents', studioDocs.listDocuments);
router.get('/studio-documents/next-number', studioDocs.getNextDocumentNumber);
router.get('/studio-documents/qr', studioDocs.getDocumentQr);
router.get('/studio-documents/check-number', studioDocs.checkDocumentNumber);
router.post('/studio-documents', studioDocs.createDocument);
router.get('/studio-documents/:id', studioDocs.getDocumentById);
router.put('/studio-documents/:id', studioDocs.updateDocument);
router.patch('/studio-documents/:id', studioDocs.updateDocument);
router.delete('/studio-documents/:id', studioDocs.deleteDocument);

export default router;

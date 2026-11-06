import { Router } from 'express';
import authRouter from './auth.routes.js';
import hubRouter from './hub.routes.js';
import agencyRouter from './agency.routes.js';
import accountingRouter from './accounting.routes.js';
import backupRouter from './backup.routes.js';
import qrRouter from './qr.routes.js';
import supportRouter from './support.routes.js';
import settingsRouter from './settings.routes.js';
import * as studioDocs from '../controllers/studioDocumentController.js';
import vpsRouter from './vps.routes.js';

const router = Router();

// ============================================================================
// Modular Micro-Backend Chunks
// ============================================================================

// 1. Auth & Identity Chunk (/api/auth/*)
router.use('/auth', authRouter);
router.use('/v1/auth', authRouter);

// 1b. Cloudflare R2 Database Backups (/api/r2-backups/*)
router.use('/r2-backups', backupRouter);
router.use('/v1/r2-backups', backupRouter);

// 1c. QR Codes (/api/qr/*) — /api/qr/public/:slug is unauthenticated
router.use('/qr', qrRouter);
router.use('/v1/qr', qrRouter);

// 1d. Support Desk (/api/support/*) — client-key tickets, admin tickets, shared attachment upload
router.use('/support', supportRouter);
router.use('/v1/support', supportRouter);

// 1d-2. Public receipt view for the QR on money receipts (no auth)
router.get('/public/receipts/:id', studioDocs.getPublicReceipt);
router.get('/v1/public/receipts/:id', studioDocs.getPublicReceipt);

// 1e. Dashboard settings (brand / logo) & Document Studio records
router.use('/', settingsRouter);
router.use('/v1', settingsRouter);

// 1f. VPS root console (/api/vps/console/*) — password + console 2FA, then whitelisted SSH commands
router.use('/vps', vpsRouter);
router.use('/v1/vps', vpsRouter);

// 2. Master Hub Core Chunk (/api/hub/*)
router.use('/hub', hubRouter);
router.use('/v1/hub', hubRouter);

// 3. Agency & Client Operations Chunk (/api/agency/*)
router.use('/agency', agencyRouter);
router.use('/v1/agency', agencyRouter);

// 4. Accounting & Finance Chunk (/api/accounting/* & /api/finance/*)
router.use('/accounting', accountingRouter);
router.use('/finance', accountingRouter);
router.use('/v1/accounting', accountingRouter);
router.use('/v1/finance', accountingRouter);

// ============================================================================
// Direct Backward-Compatibility Endpoints & Admin Aliases
// ============================================================================
router.use('/v1/client', agencyRouter);
router.use('/v1/client', accountingRouter);
router.use('/v1/client', hubRouter);

router.use('/v1/admin', authRouter);
router.use('/v1/admin', agencyRouter);
router.use('/v1/admin', accountingRouter);
router.use('/v1/admin', hubRouter);

router.use(authRouter);
router.use(agencyRouter);
router.use(accountingRouter);
router.use(hubRouter);

export default router;

import { Router } from 'express';
import authRouter from './auth.routes.js';
import hubRouter from './hub.routes.js';
import agencyRouter from './agency.routes.js';
import accountingRouter from './accounting.routes.js';

const router = Router();

// ============================================================================
// Modular Micro-Backend Chunks
// ============================================================================

// 1. Auth & Identity Chunk (/api/auth/*)
router.use('/auth', authRouter);
router.use('/v1/auth', authRouter);

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

// ============================================================================
// Direct Backward-Compatibility Endpoints
// ============================================================================
router.use(authRouter);
router.use(agencyRouter);

export default router;

import { Router } from 'express';
import express from 'express';
import * as support from '../controllers/supportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSupportKey, requireAuthOrSupportKey } from '../middleware/supportAuth.js';

const router = Router();

// Client dashboards call these with their issued Support Desk API key (never a browser-exposed admin token)
router.get('/client/tickets', requireSupportKey, support.listClientTickets);
router.post('/client/tickets', requireSupportKey, support.createClientTicket);
router.get('/client/tickets/:id', requireSupportKey, support.getClientTicket);
router.post('/client/tickets/:id/messages', requireSupportKey, support.replyClientTicket);

// Shared by both sides of the conversation
router.post(
  '/attachments',
  requireAuthOrSupportKey,
  express.raw({ type: support.ATTACHMENT_TYPES, limit: '5mb' }),
  support.uploadAttachment
);

// Everything below is the admin dashboard (JWT)
router.use(requireAuth);
router.get('/tickets', support.getSupportTickets);
router.post('/tickets', support.createSupportTicket);
router.get('/tickets/:id', support.getSupportTicketById);
router.post('/tickets/:id/messages', support.addSupportTicketMessage);
router.patch('/tickets/:id/status', support.updateSupportTicketStatus);
router.patch('/tickets/:id/assign', support.assignSupportTicket);
router.delete('/tickets/:id', support.deleteSupportTicket);

export default router;

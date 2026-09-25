import { Router } from 'express';
import * as hubController from '../controllers/hubController.js';

const router = Router();

// Master Hub Metrics
router.get('/overview', hubController.getHubOverview);

// Client Support & Messages
router.get('/support/tickets', hubController.getSupportTickets);
router.post('/support/tickets', hubController.createSupportTicket);
router.post('/support/tickets/:ticketId/messages', hubController.addSupportTicketMessage);

// Client Project Documentation
router.get('/docs', hubController.getProjectDocs);
router.post('/docs', hubController.saveProjectDoc);

// Secure VPS Node Telemetry Ingestion (No Credential Leakage)
router.get('/vps/status', hubController.getVpsNodeStatus);
router.get('/vps/status/:tenantId', hubController.getVpsNodeStatus);
router.post('/telemetry/events', hubController.receiveNodeTelemetryEvent);

export default router;

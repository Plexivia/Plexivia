import { Router } from 'express';
import * as hubController from '../controllers/hubController.js';

const router = Router();

// Master Hub Metrics & Stats
router.get('/overview', hubController.getHubOverview);
router.get('/stats', hubController.getStats);

// Fleet Nodes & Infrastructure SRE
router.get('/fleet', hubController.getFleet);
router.get('/services', hubController.getServices);
router.get('/sre/services', hubController.getServices);

// Backups Management
router.get('/backups', hubController.getBackups);
router.post('/backups/trigger', hubController.triggerBackup);

// Git Repositories
router.get('/git/repos', hubController.getGitRepos);

// Mail Logs & Diagnostics
router.get('/mail/logs', hubController.getMailLogs);
router.post('/mail/send-test', hubController.sendTestMail);

// Activities & Audit Trail
router.get('/activities', hubController.getActivities);
router.post('/activities', hubController.logActivity);

// Time Tracking Logs
router.get('/timelogs', hubController.getTimeLogs);
router.post('/timelogs', hubController.createTimeLog);

// Client Support & Messages
router.get('/support/tickets', hubController.getSupportTickets);
router.post('/support/tickets', hubController.createSupportTicket);
router.post('/support/tickets/:ticketId/messages', hubController.addSupportTicketMessage);

// Client Project Documentation
router.get('/docs', hubController.getProjectDocs);
router.post('/docs', hubController.saveProjectDoc);

// Secure VPS Node Telemetry Ingestion
router.get('/vps/status', hubController.getVpsNodeStatus);
router.get('/vps/status/:tenantId', hubController.getVpsNodeStatus);
router.post('/telemetry/events', hubController.receiveNodeTelemetryEvent);

export default router;

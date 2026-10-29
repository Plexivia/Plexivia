import { Router } from 'express';
import * as hubController from '../controllers/hubController.js';
import * as webmailController from '../controllers/webmailController.js';
import * as serverController from '../controllers/serverController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All routes in this router require a valid access token
router.use(requireAuth);

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

// Webmail (inbox synced over IMAP, sending through support SMTP)
const mailAdmin = requireRole('OWNER', 'SUPER_ADMIN', 'ADMIN');
router.get('/webmail/folders', webmailController.getFolders);
router.get('/webmail/messages', webmailController.listMessages);
router.post('/webmail/messages/batch', webmailController.batchAction);
router.get('/webmail/messages/:id', webmailController.getMessage);
router.patch('/webmail/messages/:id/flags', webmailController.updateFlags);
router.delete('/webmail/messages/:id', webmailController.deleteMessage);
router.post('/webmail/send', webmailController.sendWebmail);
router.post('/webmail/sync', webmailController.triggerSync);
router.get('/webmail/settings', mailAdmin, webmailController.getSettings);
router.put('/webmail/settings', mailAdmin, webmailController.updateSettings);
router.post('/webmail/settings/test', mailAdmin, webmailController.testSettings);

// Live notifications (pushed over /api/ws)
router.get('/notifications', webmailController.listNotifications);
router.post('/notifications/read-all', webmailController.markAllNotificationsRead);
router.patch('/notifications/:id/read', webmailController.markNotificationRead);

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
router.patch('/support/tickets/:ticketId/status', hubController.updateSupportTicketStatus);

// Client Project Documentation
router.get('/docs', hubController.getProjectDocs);
router.post('/docs', hubController.saveProjectDoc);

// Live server vitals for the Cpanel page (admins only)
router.get('/server/vitals', requireRole('OWNER', 'SUPER_ADMIN', 'ADMIN'), serverController.getServerVitals);

// Secure VPS Node Telemetry Ingestion
router.get('/vps/status', hubController.getVpsNodeStatus);
router.get('/vps/status/:tenantId', hubController.getVpsNodeStatus);
router.post('/telemetry/events', hubController.receiveNodeTelemetryEvent);

export default router;

import { Router } from 'express';
import * as cpanelController from '../controllers/cpanelController.js';
import * as guardController from '../controllers/guardController.js';
import * as mailController from '../controllers/mailController.js';
import * as giteaController from '../controllers/giteaController.js';
import * as backupController from '../controllers/backupController.js';
import * as projectController from '../controllers/projectController.js';
import * as issueController from '../controllers/issueController.js';
import * as docController from '../controllers/docController.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// 0. Authentication Routes (/api/v1/auth/* & /api/auth/*)
router.post('/v1/auth/login', authController.login);
router.post('/v1/auth/2fa/verify', authController.verify2fa);
router.get('/v1/auth/me', authController.getMe);
router.post('/auth/login', authController.login);
router.post('/auth/2fa/verify', authController.verify2fa);
router.get('/auth/me', authController.getMe);

// Version baseline
router.get('/version', backupController.getVersion);

// 1. Projects Microservice (/api/projects/*)
router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// 2. Issues & Tasks Microservice (/api/issues/*)
router.get('/issues', issueController.getIssues);
router.post('/issues', issueController.createIssue);
router.get('/issues/:id', issueController.getIssueById);
router.put('/issues/:id', issueController.updateIssue);
router.delete('/issues/:id', issueController.deleteIssue);
router.post('/issues/:id/checklist', issueController.handleChecklist);

// 3. Documentation & Knowledge Microservice (/api/docs/*)
router.get('/docs', docController.getDocs);
router.post('/docs', docController.createDoc);
router.get('/docs/:id', docController.getDocById);
router.put('/docs/:id', docController.updateDoc);
router.delete('/docs/:id', docController.deleteDoc);

// 4. cPanel Fleet Manager Integration (/api/cpanel/*)
router.get('/cpanel/fleet-overview', cpanelController.getFleetOverview);
router.get('/cpanel/nodes/:id', cpanelController.getNodeById);
router.post('/cpanel/nodes/:id/reboot', cpanelController.rebootNode);
router.post('/cpanel/nodes/:id/sync', cpanelController.syncNode);
router.post('/cpanel/nodes/:id/probe', cpanelController.probeNode);

// 5. plexiGuard SRE Telemetry Integration (/api/guard/*)
router.get('/guard/health', guardController.getGuardHealth);
router.get('/guard/telemetry', guardController.getTelemetry);
router.get('/guard/anomalies', guardController.getAnomalies);
router.get('/guard/containers', guardController.getContainers);
router.post('/guard/alerts/:id/acknowledge', guardController.acknowledgeAlert);
router.post('/guard/alerts/:id/resolve', guardController.resolveAlert);

// 6. plexiMail Subsystem Integration (/api/mail/*)
router.get('/mail/health', mailController.getMailHealth);
router.get('/mail/logs', mailController.getMailLogs);
router.get('/mail/templates', mailController.getTemplates);
router.post('/mail/send', mailController.sendEmail);

// 7. Gitea Private Git Integration (/api/gitea/*)
router.get('/gitea/status', giteaController.getGiteaStatus);
router.get('/gitea/repos', giteaController.getRepositories);
router.get('/gitea/dual-remote-guide', giteaController.getDualRemoteGuide);

// 8. Version Manager & Cloudflare R2 Backups (/api/backup/*)
router.get('/backup/status', backupController.getBackupStatus);
router.get('/backup/archives', backupController.getBackupArchives);
router.post('/backup/trigger', backupController.triggerBackup);

export default router;


import {
  VPSNode,
  AnomalyAlert,
  ContainerHealth,
  EmailLogEntry,
  EmailTemplate,
  GiteaRepository,
  BackupArchive,
  BackupStatus,
  SystemVersion,
  PlexiviaProject,
  PlexiviaIssue,
  PlexiviaDoc
} from '../types/index.js';

export class Store {
  public static nodes: VPSNode[] = [];
  public static containers: ContainerHealth[] = [];
  public static anomalies: AnomalyAlert[] = [];

  public static emailTemplates: EmailTemplate[] = [
    {
      id: 'cloudflare_r2_backup_report',
      name: 'Cloudflare R2 Backup Report',
      subject: '[Plexivia Backup] PostgreSQL Automated Daily Backup Notification',
      description: 'Daily automated notification sent after R2 backup run.',
      defaultRecipient: 'admin@plexivia.com',
      variables: ['date', 'status', 'backup_size', 'r2_bucket', 'duration_seconds', 'sha256'],
      htmlPreview: `<div style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 8px;">
        <h2 style="color: #38bdf8; margin-top: 0;">Plexivia Database Backup Report</h2>
        <p><strong>Status:</strong> <span style="color: #4ade80;">SUCCESS</span></p>
        <p><strong>Target:</strong> Cloudflare R2 Bucket</p>
      </div>`
    },
    {
      id: 'sre_anomaly_incident',
      name: 'SRE Incident & Anomaly Alert',
      subject: '[CRITICAL ALERT] plexiGuard SRE Anomaly Detected',
      description: 'Triggered when system thresholds exceed critical limits.',
      defaultRecipient: 'admin@plexivia.com',
      variables: ['node_name', 'metric_name', 'threshold', 'current_value', 'timestamp'],
      htmlPreview: `<div style="font-family: Arial, sans-serif; background: #1e1b4b; color: #e2e8f0; padding: 24px; border-radius: 8px;">
        <h2 style="color: #f43f5e; margin-top: 0;">plexiGuard SRE Telemetry Alert</h2>
      </div>`
    }
  ];

  public static emailLogs: EmailLogEntry[] = [];
  public static giteaRepos: GiteaRepository[] = [];
  public static backupArchives: BackupArchive[] = [];

  public static backupStatus: BackupStatus = {
    cloudflareAccountId: 'fa0942a4bd8e442e22f78fdb6a2a605a',
    r2Bucket: 'clienthub-backups',
    cronSchedule: '03:00 UTC daily',
    cronFile: '/etc/cron.d/plexi-postgres-backup',
    notificationRecipient: 'admin@plexivia.com',
    retentionPolicy: '7-day local disk cache / 30-day Cloudflare R2 rotation',
    lastBackupStatus: 'NEVER',
    lastBackupTime: new Date().toISOString(),
    totalBackupsCount: 0,
    totalR2StorageBytes: 0,
    totalR2StorageFormatted: '0 B',
    isTriggering: false
  };

  public static systemVersion: SystemVersion = {
    version: '1.0.3',
    buildNumber: 'v1.0.3-release',
    releaseDate: '2026-09-23',
    commitSha: 'prod-release-v1.0.3',
    environment: 'production',
    baseline: 'v1.0.3 Production Baseline',
    services: [
      { name: 'plexi-hub-dashboard', version: '1.0.3', status: 'ONLINE' },
      { name: 'plexi-hub-server', version: '1.0.3', status: 'ONLINE' },
      { name: 'plexi-mail', version: '1.0.3', status: 'ONLINE' },
      { name: 'plexi-cpanel', version: '1.0.3', status: 'ONLINE' },
      { name: 'plexi-guard', version: '1.0.3', status: 'ONLINE' },
      { name: 'plexi-gitea', version: '1.22.3', status: 'ONLINE' },
      { name: 'plexi-postgres', version: '16.4', status: 'ONLINE' },
      { name: 'plexi-redis', version: '7.2.4', status: 'ONLINE' }
    ]
  };

  public static projects: PlexiviaProject[] = [];
  public static issues: PlexiviaIssue[] = [];
  public static docs: PlexiviaDoc[] = [];
}

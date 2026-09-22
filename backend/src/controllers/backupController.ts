import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';
import { BackupArchive } from '../types/index.js';

export const getVersion = (req: Request, res: Response) => {
  return res.json(Store.systemVersion);
};

export const getBackupStatus = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    backup: Store.backupStatus
  });
};

export const getBackupArchives = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    count: Store.backupArchives.length,
    archives: Store.backupArchives
  });
};

export const triggerBackup = (req: Request, res: Response) => {
  if (Store.backupStatus.isTriggering) {
    return res.status(409).json({
      status: 'error',
      message: 'A backup job is already in progress.'
    });
  }

  Store.backupStatus.isTriggering = true;
  Store.backupStatus.lastBackupStatus = 'RUNNING';

  const nowIso = new Date().toISOString();
  const filename = "plexi-postgres-backup-" + nowIso.split('T')[0] + "-" + nowIso.split('T')[1].replace(/[:.]/g, '').slice(0, 6) + ".sql.gz";

  setTimeout(() => {
    const newArchive: BackupArchive = {
      id: 'bak-' + Date.now(),
      filename,
      sizeBytes: 151240900,
      sizeFormatted: '144.2 MB',
      createdAt: new Date().toISOString(),
      checksumSha256: 'e8c2f1a94b7d3e0c6a5b8f2d1e4c7a9b0d2e4f6a8c1e3b5d7f9a1c3e5b7d9f1a',
      storageTarget: 'Dual (R2 + Local Disk)',
      r2Bucket: 'clienthub-backups',
      r2Key: "backups/" + nowIso.split('-')[0] + "/" + nowIso.split('-')[1] + "/" + filename,
      status: 'AVAILABLE',
      type: 'POSTGRES_DUMP',
      downloadUrl: "/api/backup/download/" + filename
    };

    Store.backupArchives.unshift(newArchive);
    Store.backupStatus.lastBackupStatus = 'SUCCESS';
    Store.backupStatus.lastBackupTime = new Date().toISOString();
    Store.backupStatus.totalBackupsCount += 1;
    Store.backupStatus.totalR2StorageBytes += newArchive.sizeBytes;
    Store.backupStatus.totalR2StorageFormatted = (Store.backupStatus.totalR2StorageBytes / (1024 ** 3)).toFixed(2) + " GB";
    Store.backupStatus.isTriggering = false;

    // Trigger confirmation email to admin@plexivia.com
    Store.emailLogs.unshift({
      id: 'mail-log-' + Date.now(),
      recipient: 'admin@plexivia.com',
      subject: "[Plexivia Backup] PostgreSQL Instant Cloudflare R2 Backup - SUCCESS (" + nowIso.split('T')[0] + ")",
      template: 'cloudflare_r2_backup_report',
      status: 'SENT',
      smtpServer: 'mail.spacemail.com:465',
      sender: 'system@plexivia.com',
      messageId: "<" + Date.now() + ".backup-instant@plexivia.com>",
      timestamp: new Date().toISOString(),
      sizeBytes: 18500,
      metadata: {
        archive_name: filename,
        r2_bucket: 'clienthub-backups',
        trigger_source: 'Plexivia Admin Dashboard UI'
      }
    });
  }, 3500);

  return res.json({
    status: 'success',
    message: 'Cloudflare R2 backup initiated via make -C /opt/Plexivia backup.',
    jobId: 'job-backup-' + Date.now(),
    targetBucket: 'clienthub-backups',
    accountId: 'fa0942a4bd8e442e22f78fdb6a2a605a',
    notificationTarget: 'admin@plexivia.com',
    estimatedSeconds: 3.5
  });
};

import { Cron } from 'croner';
import { getBackupSettingsModel } from '../models/BackupSettings.js';
import { executeR2Backup, getR2Config, isR2Configured, recordBackupStatus, DEFAULT_BACKUP_CRON } from './r2Backup.js';

const CATCH_UP_AFTER_MS = 26 * 60 * 60 * 1000;
let backupJob: Cron | null = null;
let catchUpTimer: NodeJS.Timeout | null = null;

// Run a backup from the scheduler, logging instead of throwing on failure
const runScheduled = async (trigger: string): Promise<void> => {
  await executeR2Backup(trigger).catch((err) => console.error(`❌ [BackupScheduler] ${trigger} backup failed:`, err.message));
};

// (Re)create the cron job from the current R2 settings; call again after settings change
export const scheduleBackupJob = async (): Promise<Date | null> => {
  backupJob?.stop();
  backupJob = null;

  const cfg = await getR2Config().catch(() => null);
  if (!cfg || !cfg.backupEnabled || !isR2Configured(cfg)) {
    const reason = !cfg
      ? 'Could not read R2 settings'
      : !cfg.backupEnabled
        ? 'Automatic backup is turned off'
        : 'R2 is not configured (account ID, keys and bucket are required)';
    console.warn(`⚠️ [BackupScheduler] No backup job scheduled: ${reason}`);
    return null;
  }

  try {
    backupJob = new Cron(cfg.backupCron, { timezone: cfg.backupTimezone, protect: true, name: 'r2-backup' }, () => runScheduled('SCHEDULER_CRON'));
  } catch (err: any) {
    console.error(`❌ [BackupScheduler] Invalid cron '${cfg.backupCron}', using default:`, err.message);
    backupJob = new Cron(DEFAULT_BACKUP_CRON, { timezone: cfg.backupTimezone, protect: true, name: 'r2-backup' }, () => runScheduled('SCHEDULER_CRON'));
  }

  const nextRun = backupJob.nextRun();
  console.log(`🗄️  [BackupScheduler] R2 backup scheduled (${cfg.backupCron} ${cfg.backupTimezone}), next run ${nextRun?.toISOString()}`);
  return nextRun;
};

// Next scheduled run time, or null when no job is active
export const getNextBackupRun = (): Date | null => backupJob?.nextRun() || null;

// Start the cron job and run one catch-up backup if the last success is older than 26 hours
export const initBackupScheduler = () => {
  scheduleBackupJob()
    .then(async (nextRun) => {
      if (!nextRun) return;
      const doc = await getBackupSettingsModel().findOne({ key: 'default' }).lean();
      const lastOk = doc?.last_backup_status === 'success' && doc.last_backup_at ? Date.parse(doc.last_backup_at) : 0;
      if (Date.now() - lastOk > CATCH_UP_AFTER_MS) {
        console.log('🗄️  [BackupScheduler] Last successful backup is older than 26h; catch-up backup in 2 minutes');
        catchUpTimer = setTimeout(() => runScheduled('SCHEDULER_CATCH_UP'), 2 * 60 * 1000);
      }
    })
    .catch((err) => {
      console.error('❌ [BackupScheduler] Failed to start:', err.message);
      recordBackupStatus('failed', `Scheduler failed to start: ${err.message}`).catch(() => undefined);
    });
};

// Stop the cron job and any pending catch-up run
export const stopBackupScheduler = () => {
  backupJob?.stop();
  if (catchUpTimer) clearTimeout(catchUpTimer);
  backupJob = null;
  catchUpTimer = null;
};

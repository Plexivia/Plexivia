import { Response } from 'express';
import { Cron } from 'croner';
import { AuthedRequest } from '../middleware/auth.js';
import { getBackupSettingsModel, BackupSettingsFields } from '../models/BackupSettings.js';
import { encryptText, decryptText } from '../utils/security.js';
import {
  DEFAULT_BACKUP_CRON,
  DEFAULT_BACKUP_TIMEZONE,
  getR2Config,
  isR2Configured,
  testBucketAccess,
  createR2Bucket,
  executeR2Backup,
  isBackupRunning,
  listDatabaseBackups,
  planRetention,
  getBackupObject,
} from '../utils/r2Backup.js';
import { scheduleBackupJob, getNextBackupRun } from '../utils/backupScheduler.js';

const BUCKET_NAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

// Mask a secret so only its last four characters are visible
const mask = (value: string): string => (!value ? '' : value.length <= 8 ? '********' : `********${value.slice(-4)}`);

// Load the settings document, or an empty object when none is saved yet
const loadSettings = async (): Promise<Partial<BackupSettingsFields>> =>
  ((await getBackupSettingsModel().findOne({ key: 'default' }).lean()) as unknown as Partial<BackupSettingsFields> | null) || {};

// Public-safe view of the R2 settings: secrets are never returned, only masked previews
const toResponse = async (s: Partial<BackupSettingsFields>) => {
  const cfg = await getR2Config();
  return {
    is_enabled: s.is_enabled ?? false,
    account_id: s.account_id || '',
    access_key_id: s.access_key_id || '',
    has_secret_access_key: Boolean(s.secret_access_key),
    secret_access_key_masked: mask(decryptText(s.secret_access_key || '')),
    has_api_token: Boolean(s.api_token),
    api_token_masked: mask(decryptText(s.api_token || '')),
    bucket_name: s.bucket_name || '',
    backup_enabled: s.backup_enabled ?? true,
    backup_cron: s.backup_cron || DEFAULT_BACKUP_CRON,
    backup_timezone: s.backup_timezone || DEFAULT_BACKUP_TIMEZONE,
    keep_daily_days: s.keep_daily_days ?? 7,
    keep_weekly_weeks: s.keep_weekly_weeks ?? 5,
    last_tested_at: s.last_tested_at || null,
    last_test_status: s.last_test_status || 'untested',
    last_test_message: s.last_test_message || '',
    last_backup_at: s.last_backup_at || null,
    last_backup_status: isBackupRunning() ? 'running' : s.last_backup_status || 'never',
    last_backup_message: s.last_backup_message || '',
    last_backup_size: s.last_backup_size || '',
    next_backup_at: getNextBackupRun(),
    active_source: cfg.source,
    active_bucket: cfg.bucketName,
    configured: isR2Configured(cfg),
  };
};

// GET /backups/settings
export const getSettings = async (_req: AuthedRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await toResponse(await loadSettings()) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load backup settings' });
  }
};

// PUT /backups/settings — empty secrets keep the stored values
export const updateSettings = async (req: AuthedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const backupCron = String(body.backup_cron || DEFAULT_BACKUP_CRON).trim();
    const backupTimezone = String(body.backup_timezone || DEFAULT_BACKUP_TIMEZONE).trim();
    try {
      new Cron(backupCron, { timezone: backupTimezone, paused: true }).stop();
    } catch (err: any) {
      return res.status(400).json({ success: false, message: `Invalid schedule: ${err.message}` });
    }

    const update: Record<string, any> = {
      is_enabled: body.is_enabled !== false,
      account_id: String(body.account_id || '').trim(),
      access_key_id: String(body.access_key_id || '').trim(),
      bucket_name: String(body.bucket_name || '').trim(),
      backup_enabled: body.backup_enabled !== false,
      backup_cron: backupCron,
      backup_timezone: backupTimezone,
      keep_daily_days: Math.max(1, Math.min(60, parseInt(body.keep_daily_days ?? 7, 10) || 7)),
      keep_weekly_weeks: Math.max(0, Math.min(52, parseInt(body.keep_weekly_weeks ?? 5, 10) || 0)),
      updated_by: req.auth?.email || '',
      updated_at: new Date().toISOString(),
    };
    const secret = String(body.secret_access_key || '').trim();
    if (secret) update.secret_access_key = encryptText(secret);
    const apiToken = String(body.api_token || '').trim();
    if (apiToken) update.api_token = encryptText(apiToken);

    const doc = await getBackupSettingsModel()
      .findOneAndUpdate({ key: 'default' }, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true })
      .lean();

    await scheduleBackupJob();
    return res.json({ success: true, message: 'R2 backup settings saved.', data: await toResponse((doc as unknown as Partial<BackupSettingsFields> | null) || {}) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to save backup settings' });
  }
};

// POST /backups/settings/test — checks the bucket with the given (or stored) credentials
export const testConnection = async (req: AuthedRequest, res: Response) => {
  try {
    const stored = await loadSettings();
    const body = req.body || {};
    const cfg = {
      accountId: String(body.account_id || stored.account_id || '').trim(),
      accessKeyId: String(body.access_key_id || stored.access_key_id || '').trim(),
      secretAccessKey:
        String(body.secret_access_key || '').trim() || decryptText(stored.secret_access_key || ''),
      bucketName: String(body.bucket_name || stored.bucket_name || '').trim(),
    };
    if (!isR2Configured(cfg)) {
      return res.status(400).json({ success: false, message: 'Account ID, access key, secret and bucket are required.' });
    }

    const { ok, message } = await testBucketAccess(cfg);
    await getBackupSettingsModel().updateOne(
      { key: 'default' },
      { $set: { last_tested_at: new Date().toISOString(), last_test_status: ok ? 'connected' : 'failed', last_test_message: message } },
      { upsert: true }
    );
    return res.status(ok ? 200 : 400).json({ success: ok, message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Connection test failed' });
  }
};

// POST /backups/bucket — creates an R2 bucket with the Cloudflare API token and saves it as the backup bucket
export const createBucket = async (req: AuthedRequest, res: Response) => {
  try {
    const stored = await loadSettings();
    const name = String(req.body?.bucket_name || '').trim().toLowerCase();
    const accountId = String(req.body?.account_id || stored.account_id || '').trim();
    const apiToken = String(req.body?.api_token || '').trim() || decryptText(stored.api_token || '');

    if (!BUCKET_NAME_PATTERN.test(name)) {
      return res.status(400).json({ success: false, message: 'Bucket names use 3-63 lowercase letters, numbers and dashes.' });
    }
    if (!accountId || !apiToken) {
      return res.status(400).json({ success: false, message: 'Cloudflare account ID and API token are required to create a bucket.' });
    }

    const result = await createR2Bucket(accountId, apiToken, name, String(req.body?.location_hint || 'apac'));
    await getBackupSettingsModel().updateOne(
      { key: 'default' },
      {
        $set: {
          bucket_name: name,
          account_id: accountId,
          ...(req.body?.api_token ? { api_token: encryptText(String(req.body.api_token).trim()) } : {}),
          updated_at: new Date().toISOString(),
          updated_by: req.auth?.email || '',
        },
      },
      { upsert: true }
    );
    return res.status(201).json({ success: true, message: `Bucket '${name}' created.`, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create bucket' });
  }
};

// POST /backups/run — starts a backup in the background; poll the settings for the result
export const runBackupNow = async (req: AuthedRequest, res: Response) => {
  try {
    if (isBackupRunning()) {
      return res.status(409).json({ success: false, message: 'A backup is already running.' });
    }
    if (!isR2Configured(await getR2Config())) {
      return res.status(400).json({ success: false, message: 'R2 storage is not configured yet.' });
    }
    executeR2Backup(`MANUAL:${req.auth?.email || 'dashboard'}`).catch(() => undefined);
    return res.status(202).json({ success: true, message: 'Backup started. This can take a minute.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to start backup' });
  }
};

// GET /backups/list — database backups in R2 (newest first) with which ones retention will remove
export const listBackups = async (_req: AuthedRequest, res: Response) => {
  try {
    const cfg = await getR2Config();
    if (!isR2Configured(cfg)) return res.json({ success: true, data: { configured: false, backups: [] } });
    const backups = await listDatabaseBackups(cfg);
    const { remove } = planRetention(backups, cfg.keepDailyDays, cfg.keepWeeklyWeeks);
    const removeSet = new Set(remove.map((b) => b.key));
    return res.json({
      success: true,
      data: {
        configured: true,
        bucket: cfg.bucketName,
        timezone: cfg.backupTimezone,
        backups: backups.map((b) => ({ ...b, kind: b.ageDays < cfg.keepDailyDays ? 'daily' : 'weekly', will_be_removed: removeSet.has(b.key) })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to list backups' });
  }
};

// GET /backups/download?key=database/... — streams one backup file
export const downloadBackup = async (req: AuthedRequest, res: Response) => {
  try {
    const key = String(req.query.key || '');
    const cfg = await getR2Config();
    if (!isR2Configured(cfg)) return res.status(400).json({ success: false, message: 'R2 storage is not configured.' });
    const obj = await getBackupObject(cfg, key);
    res.setHeader('Content-Type', 'application/gzip');
    if (obj.ContentLength) res.setHeader('Content-Length', String(obj.ContentLength));
    res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
    (obj.Body as NodeJS.ReadableStream).pipe(res);
  } catch (error: any) {
    if (error?.name === 'NoSuchKey') return res.status(404).json({ success: false, message: 'Backup not found.' });
    if (error?.message === 'Invalid backup key') return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || 'Failed to download backup' });
  }
};

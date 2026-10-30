import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  _Object,
} from '@aws-sdk/client-s3';
import { secureDbConnection, operationsDbConnection } from '../config/database.js';
import { getBackupSettingsModel } from '../models/BackupSettings.js';
import { decryptText } from './security.js';

export const DEFAULT_BACKUP_CRON = '0 3 * * *';
export const DEFAULT_BACKUP_TIMEZONE = 'Asia/Dhaka';
const DB_PREFIX = 'database/';
const DAY_MS = 24 * 60 * 60 * 1000;
const EJSON = mongoose.mongo.BSON.EJSON;

export interface R2Config {
  source: 'settings';
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  apiToken: string;
  bucketName: string;
  backupEnabled: boolean;
  backupCron: string;
  backupTimezone: string;
  keepDailyDays: number;
  keepWeeklyWeeks: number;
}

export interface BackupEntry {
  key: string;
  size: number;
  createdAt: string;
  date: string;
  weekday: string;
  ageDays: number;
}

let isRunning = false;

// Resolve the R2 config from the encrypted dashboard settings (the only source for credentials)
export const getR2Config = async (): Promise<R2Config> => {
  const doc = await getBackupSettingsModel().findOne({ key: 'default' }).lean();
  const enabled = Boolean(doc?.is_enabled);

  return {
    source: 'settings',
    accountId: enabled ? doc?.account_id || '' : '',
    accessKeyId: enabled ? doc?.access_key_id || '' : '',
    secretAccessKey: enabled ? decryptText(doc?.secret_access_key || '') : '',
    apiToken: decryptText(doc?.api_token || ''),
    bucketName: enabled ? doc?.bucket_name || '' : '',
    backupEnabled: doc?.backup_enabled ?? true,
    backupCron: doc?.backup_cron || DEFAULT_BACKUP_CRON,
    backupTimezone: doc?.backup_timezone || DEFAULT_BACKUP_TIMEZONE,
    keepDailyDays: Number(doc?.keep_daily_days) || 7,
    keepWeeklyWeeks: Number(doc?.keep_weekly_weeks ?? 5),
  };
};

// Check that the config has everything needed to talk to the bucket
export const isR2Configured = (cfg?: Partial<R2Config> | null): boolean =>
  Boolean(cfg?.accountId && cfg?.accessKeyId && cfg?.secretAccessKey && cfg?.bucketName);

// Build an S3 client pointed at the account's R2 endpoint
export const r2ClientFor = (cfg: Pick<R2Config, 'accountId' | 'accessKeyId' | 'secretAccessKey'>) =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });

// Record the outcome of the latest backup run on the settings document
export const recordBackupStatus = async (status: string, message = '', size = '') => {
  await getBackupSettingsModel().updateOne(
    { key: 'default' },
    {
      $set: {
        last_backup_status: status,
        last_backup_message: String(message).slice(0, 500),
        ...(status !== 'running' ? { last_backup_at: new Date().toISOString(), last_backup_size: size } : {}),
      },
    },
    { upsert: true }
  );
};

// Check that the bucket is reachable with the given credentials, returning a readable message
export const testBucketAccess = async (cfg: Pick<R2Config, 'accountId' | 'accessKeyId' | 'secretAccessKey' | 'bucketName'>) => {
  try {
    await r2ClientFor(cfg).send(new HeadBucketCommand({ Bucket: cfg.bucketName }));
    return { ok: true, message: `Connected to bucket '${cfg.bucketName}'.` };
  } catch (err: any) {
    const code = err?.$metadata?.httpStatusCode;
    const message =
      code === 403
        ? 'Access denied: check the access key, secret and that the token can use this bucket.'
        : code === 404
          ? `Bucket '${cfg.bucketName}' was not found in this account.`
          : err?.message || 'Connection failed.';
    return { ok: false, message };
  }
};

// Create an R2 bucket through the Cloudflare API using an account API token
export const createR2Bucket = async (accountId: string, apiToken: string, name: string, locationHint = 'apac') => {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, locationHint }),
  });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok || !body?.success) {
    const error = body?.errors?.[0];
    throw new Error(error ? `Cloudflare: ${error.message} (code ${error.code})` : `Cloudflare API returned HTTP ${res.status}`);
  }
  return body.result;
};

// Format a byte count as KB or MB
const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(Number(bytes || 0) / 1024).toFixed(1)} KB`;

// Timestamp like 20261031_030000 (UTC) used in backup object keys
const backupStamp = (date = new Date()): string => date.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);

// Stream every collection of both databases into a gzipped EJSON-lines file and return its stats
export const dumpDatabasesToFile = async (filePath: string) => {
  const gzip = zlib.createGzip({ level: 9 });
  const out = fs.createWriteStream(filePath);
  gzip.pipe(out);
  const finished = new Promise<void>((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
    gzip.on('error', reject);
  });

  // Write one line, waiting for the gzip buffer to drain when it is full
  const write = (line: string) =>
    gzip.write(line + '\n') ? Promise.resolve() : new Promise<void>((resolve) => gzip.once('drain', resolve));

  const counts: Record<string, number> = {};
  for (const conn of [secureDbConnection, operationsDbConnection]) {
    if (!conn?.db || conn.readyState !== 1) throw new Error(`Database '${conn?.name || 'unknown'}' is not connected`);
    const dbName = conn.db.databaseName;
    const collections = await conn.db.listCollections({}, { nameOnly: true }).toArray();
    for (const { name } of collections) {
      if (name.startsWith('system.')) continue;
      let count = 0;
      await write(JSON.stringify({ type: 'collection', db: dbName, collection: name }));
      for await (const doc of conn.db.collection(name).find({})) {
        await write(JSON.stringify({ db: dbName, collection: name, doc: EJSON.serialize(doc, { relaxed: false }) }));
        count += 1;
      }
      counts[`${dbName}.${name}`] = count;
    }
  }

  gzip.end();
  await finished;
  return counts;
};

// Calendar date (YYYY-MM-DD), weekday and day number of an instant in the given timezone
const zonedDay = (date: Date, timeZone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  return { ymd, weekday: parts.weekday as string, dayNumber: Math.round(Date.parse(`${ymd}T00:00:00Z`) / DAY_MS) };
};

// Extract the timestamp part of a backup object key
const timestampOf = (key: string): string | null => key.match(/plexivia_db_(\d{8}_\d{6})/)?.[1] || null;

// List every object under a prefix, following continuation tokens
const listAll = async (client: S3Client, bucket: string, prefix: string) => {
  const items: _Object[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    items.push(...(res.Contents || []));
    token = res.NextContinuationToken;
  } while (token);
  return items;
};

// Database backups in R2, newest first, with calendar info in the backup timezone
export const listDatabaseBackups = async (cfg: R2Config): Promise<BackupEntry[]> => {
  const tz = cfg.backupTimezone || DEFAULT_BACKUP_TIMEZONE;
  const today = zonedDay(new Date(), tz);
  const objects = await listAll(r2ClientFor(cfg), cfg.bucketName, DB_PREFIX);

  return objects
    .filter((o) => o.Key && o.LastModified && timestampOf(o.Key))
    .map((o) => {
      const day = zonedDay(o.LastModified as Date, tz);
      return {
        key: o.Key as string,
        size: o.Size || 0,
        createdAt: (o.LastModified as Date).toISOString(),
        date: day.ymd,
        weekday: day.weekday,
        ageDays: today.dayNumber - day.dayNumber,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

// Keep every backup from the last N days, then one per calendar week (preferring Sunday) for M weeks
export const planRetention = (backups: BackupEntry[], keepDailyDays = 7, keepWeeklyWeeks = 5) => {
  const keep = new Set<string>();
  const weekly = new Map<number, BackupEntry>();

  for (const b of backups) {
    if (b.ageDays < keepDailyDays) {
      keep.add(b.key);
      continue;
    }
    if (b.ageDays >= keepWeeklyWeeks * 7) continue;
    const dayNumber = Math.round(Date.parse(`${b.date}T00:00:00Z`) / DAY_MS);
    const weekStart = dayNumber - ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(b.weekday);
    if (dayNumber + b.ageDays - weekStart >= keepWeeklyWeeks * 7) continue;
    const current = weekly.get(weekStart);
    // Backups are newest-first: the first seen is the week's newest; a Sunday one replaces a non-Sunday pick
    if (!current || (b.weekday === 'Sun' && current.weekday !== 'Sun')) weekly.set(weekStart, b);
  }
  for (const b of weekly.values()) keep.add(b.key);

  return { keep: backups.filter((b) => keep.has(b.key)), remove: backups.filter((b) => !keep.has(b.key)) };
};

// Delete backups that fall outside the retention plan, along with their manifests
const pruneDatabaseBackups = async (cfg: R2Config): Promise<number> => {
  const { remove } = planRetention(await listDatabaseBackups(cfg), cfg.keepDailyDays, cfg.keepWeeklyWeeks);
  if (remove.length === 0) return 0;

  const keys = remove.flatMap((b) => [b.key, `metadata/manifest_${timestampOf(b.key)}.json`]);
  const client = r2ClientFor(cfg);
  for (let i = 0; i < keys.length; i += 1000) {
    await client.send(
      new DeleteObjectsCommand({ Bucket: cfg.bucketName, Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true } })
    );
  }
  return remove.length;
};

// Open a database backup object for streaming to the client
export const getBackupObject = async (cfg: R2Config, key: string) => {
  if (!key || !key.startsWith(DB_PREFIX) || key.includes('..')) throw new Error('Invalid backup key');
  return r2ClientFor(cfg).send(new GetObjectCommand({ Bucket: cfg.bucketName, Key: key }));
};

export const isBackupRunning = () => isRunning;

// Dump both databases, upload the archive and manifest to R2, apply retention and record the result
export const executeR2Backup = async (triggeredBy = 'SCHEDULER') => {
  if (isRunning) throw new Error('A backup is already running');
  isRunning = true;
  const tmpFile = path.join(os.tmpdir(), `plexivia_db_${Date.now()}.ejson.gz`);

  try {
    const cfg = await getR2Config();
    if (!isR2Configured(cfg)) {
      throw new Error('R2 storage is not configured. Add credentials on the R2 Backups page.');
    }
    await recordBackupStatus('running', `Started by ${triggeredBy}`);

    const stamp = backupStamp();
    const counts = await dumpDatabasesToFile(tmpFile);
    const body = await fs.promises.readFile(tmpFile);
    const sha256 = crypto.createHash('sha256').update(body).digest('hex');
    const key = `${DB_PREFIX}plexivia_db_${stamp}.ejson.gz`;
    const client = r2ClientFor(cfg);

    await client.send(
      new PutObjectCommand({ Bucket: cfg.bucketName, Key: key, Body: body, ContentType: 'application/gzip', Metadata: { sha256, triggeredby: triggeredBy } })
    );
    const manifest = {
      key,
      bucket: cfg.bucketName,
      createdAt: new Date().toISOString(),
      triggeredBy,
      sizeBytes: body.length,
      sizeFormatted: formatBytes(body.length),
      sha256,
      format: 'ejson-lines+gzip',
      collections: counts,
    };
    await client.send(
      new PutObjectCommand({ Bucket: cfg.bucketName, Key: `metadata/manifest_${stamp}.json`, Body: JSON.stringify(manifest, null, 2), ContentType: 'application/json' })
    );

    const pruned = await pruneDatabaseBackups(cfg).catch((err) => {
      console.warn('⚠️ [R2Backup] Retention prune failed:', err.message);
      return 0;
    });

    await recordBackupStatus('success', `Saved to bucket '${cfg.bucketName}' (${triggeredBy}); ${pruned} old backup(s) removed`, manifest.sizeFormatted);
    console.log(`✅ [R2Backup] ${key} (${manifest.sizeFormatted}) uploaded to '${cfg.bucketName}'`);
    return manifest;
  } catch (error: any) {
    await recordBackupStatus('failed', error.message).catch(() => undefined);
    console.error('❌ [R2Backup] Backup failed:', error.message);
    throw error;
  } finally {
    isRunning = false;
    fs.promises.unlink(tmpFile).catch(() => undefined);
  }
};

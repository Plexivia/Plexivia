import { ImapFlow } from 'imapflow';
import { simpleParser, type AddressObject } from 'mailparser';
import { getMailMessageModel, getMailSettingsModel, type IMailAddress } from '../models/Webmail.js';
import { decryptText } from './security.js';
import { sendMail } from './mailer.js';
import { broadcast, notify } from './realtime.js';

export type FolderKey = 'inbox' | 'sent' | 'junk' | 'trash' | 'drafts';

export const FOLDER_KEYS: FolderKey[] = ['inbox', 'sent', 'junk', 'trash', 'drafts'];

// Hostinger paths, used when the server does not advertise special-use folders
const FALLBACK_PATHS: Record<FolderKey, string> = {
  inbox: 'INBOX',
  sent: 'INBOX.Sent',
  junk: 'INBOX.Junk',
  trash: 'INBOX.Trash',
  drafts: 'INBOX.Drafts',
};

const SPECIAL_USE: Partial<Record<string, FolderKey>> = {
  '\\Sent': 'sent',
  '\\Junk': 'junk',
  '\\Trash': 'trash',
  '\\Drafts': 'drafts',
};

// Parse a boolean env value; z.coerce-style Boolean("false") === true is avoided on purpose
export const parseEnvBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

export const isImapSyncEnabled = () => parseEnvBool(process.env.IMAP_SYNC_ENABLED, true);

const escapeHtml = (value: string) =>
  String(value || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  source: 'database' | 'env';
}

// Resolve mailbox settings: dashboard settings (when enabled) win over .env
export const getImapConfig = async (): Promise<ImapConfig> => {
  const doc = await getMailSettingsModel().findOne({ key: 'default' }).lean().catch(() => null);
  const db = doc?.imap;
  if (db?.isEnabled && db.host && db.user && db.password) {
    return { host: db.host, port: db.port || 993, secure: db.secure !== false, user: db.user, pass: decryptText(db.password), source: 'database' };
  }
  const { IMAP_HOST, IMAP_PORT, IMAP_SECURE, WEBMAIL_USER, WEBMAIL_PASS } = process.env;
  if (!WEBMAIL_USER || !WEBMAIL_PASS) {
    throw new Error('Mailbox is not configured (WEBMAIL_USER, WEBMAIL_PASS or dashboard mail settings)');
  }
  return {
    host: IMAP_HOST || 'imap.hostinger.com',
    port: Number(IMAP_PORT) || 993,
    secure: parseEnvBool(IMAP_SECURE, true),
    user: WEBMAIL_USER,
    pass: WEBMAIL_PASS,
    source: 'env',
  };
};

export const getForwardTarget = async (): Promise<string> => {
  const doc = await getMailSettingsModel().findOne({ key: 'default' }).lean().catch(() => null);
  return (doc?.forwardTo || process.env.WEBMAIL_FORWARD_TO || '').trim();
};

// Try a login with the given settings without touching the live connection
export const testImapConnection = async (config: Omit<ImapConfig, 'source'>) => {
  const client = new ImapFlow({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass }, logger: false });
  await client.connect();
  try {
    const status = await client.status('INBOX', { messages: true, unseen: true });
    return status ? { messages: status.messages || 0, unseen: status.unseen || 0 } : { messages: 0, unseen: 0 };
  } finally {
    await client.logout().catch(() => {});
  }
};

// ---------------------------------------------------------------------------
// One persistent connection: Hostinger rejects parallel logins, and ImapFlow
// IDLEs on the selected INBOX between commands, giving real-time new mail.
// ---------------------------------------------------------------------------

let client: ImapFlow | null = null;
let connecting: Promise<ImapFlow> | null = null;
let folderPaths: Record<FolderKey, string> | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let stopped = false;
let queue: Promise<unknown> = Promise.resolve();
let existsTimer: NodeJS.Timeout | null = null;

const scheduleReconnect = () => {
  if (stopped || reconnectTimer || !isImapSyncEnabled()) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    getClient()
      .then(() => syncFolder('inbox', 50, true))
      .catch((err) => {
        console.warn('⚠️ [IMAP] Reconnect failed, retrying in 30s:', err.message);
        scheduleReconnect();
      });
  }, 30000);
};

const connect = async (): Promise<ImapFlow> => {
  const config = await getImapConfig();
  const c = new ImapFlow({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass }, logger: false });
  await c.connect();

  const paths = { ...FALLBACK_PATHS };
  for (const box of await c.list()) {
    const key = box.specialUse ? SPECIAL_USE[box.specialUse] : undefined;
    if (key) paths[key] = box.path;
  }
  folderPaths = paths;

  await c.mailboxOpen('INBOX');
  c.on('exists', (data: { path: string }) => {
    if (data.path !== 'INBOX') return;
    // Debounce bursts so several arrivals trigger one sync
    if (existsTimer) clearTimeout(existsTimer);
    existsTimer = setTimeout(() => {
      syncFolder('inbox', 20, true).catch((err) => console.warn('⚠️ [IMAP] Live sync failed:', err.message));
    }, 1500);
  });
  c.on('close', () => {
    if (client === c) client = null;
    scheduleReconnect();
  });
  c.on('error', (err: Error) => console.warn('⚠️ [IMAP] Connection error:', err.message));

  client = c;
  console.log(`📬 [IMAP] Connected to ${config.user} (${config.source}), listening for new mail`);
  return c;
};

const getClient = async (): Promise<ImapFlow> => {
  if (client?.usable) return client;
  if (!connecting) connecting = connect().finally(() => { connecting = null; });
  return connecting;
};

// Run one IMAP operation at a time on the shared connection, then return to INBOX for IDLE
const runInFolder = <T>(key: FolderKey, fn: (c: ImapFlow, path: string) => Promise<T>): Promise<T> => {
  const run = async () => {
    const c = await getClient();
    const path = folderPaths?.[key] || FALLBACK_PATHS[key];
    const lock = await c.getMailboxLock(path);
    try {
      return await fn(c, path);
    } finally {
      lock.release();
      if (path !== 'INBOX') await c.mailboxOpen('INBOX').catch(() => {});
    }
  };
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
};

// Close the live connection (used after settings change); the next call reconnects
export const resetImapConnection = async () => {
  const c = client;
  client = null;
  folderPaths = null;
  if (c) await c.logout().catch(() => {});
};

export const getFolderPath = (key: FolderKey) => folderPaths?.[key] || FALLBACK_PATHS[key];

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

const toAddresses = (value?: AddressObject | AddressObject[]): IMailAddress[] => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((obj) => obj.value || []).map((a) => ({ name: a.name || '', address: (a.address || '').toLowerCase() }));
};

const buildDoc = async (key: FolderKey, uid: number, source: Buffer, flags: Set<string>) => {
  const parsed = await simpleParser(source);
  const references = Array.isArray(parsed.references) ? parsed.references : parsed.references ? [parsed.references] : [];
  const bodyText = parsed.text || '';
  return {
    folder: key,
    uid,
    messageId: parsed.messageId || undefined,
    inReplyTo: parsed.inReplyTo || undefined,
    threadId: references[0] || parsed.inReplyTo || parsed.messageId || undefined,
    from: toAddresses(parsed.from)[0] || { name: '', address: '' },
    to: toAddresses(parsed.to),
    cc: toAddresses(parsed.cc),
    subject: parsed.subject || '(no subject)',
    snippet: bodyText.replace(/\s+/g, ' ').trim().slice(0, 180),
    bodyText,
    bodyHtml: typeof parsed.html === 'string' ? parsed.html : '',
    attachments: parsed.attachments.map((a) => ({ filename: a.filename || 'attachment', size: a.size, contentType: a.contentType })),
    date: parsed.date || new Date(),
    isRead: flags.has('\\Seen'),
    isStarred: flags.has('\\Flagged'),
  };
};

// Forward a new inbox message to the configured address (headers escaped, original HTML kept)
const forwardMessage = async (doc: any) => {
  const target = await getForwardTarget();
  if (!target) return;
  const sender = doc.from?.name ? `${doc.from.name} <${doc.from.address}>` : doc.from?.address || '';
  const body = doc.bodyHtml || `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(doc.bodyText)}</pre>`;
  await sendMail({
    to: target,
    replyTo: doc.from?.address,
    subject: `[Fwd] ${doc.subject}`,
    text: `From: ${sender}\nSubject: ${doc.subject}\n\n${doc.bodyText}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 12px; border-left: 4px solid #06b6d4; background: #f8fafc; margin-bottom: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>From:</strong> ${escapeHtml(sender)}</p>
        <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Subject:</strong> ${escapeHtml(doc.subject)}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${escapeHtml(new Date(doc.date).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))}</p>
      </div>
      <div>${body}</div>`,
  });
};

// Pull the newest messages of a folder into the database and refresh flags of known ones
export const syncFolder = async (key: FolderKey, limit = 50, announce = false) => {
  const Mail = getMailMessageModel();

  const created = await runInFolder(key, async (c) => {
    const total = (c.mailbox && typeof c.mailbox === 'object' ? c.mailbox.exists : 0) || 0;
    if (!total) return [];
    const start = Math.max(1, total - limit + 1);

    const headers: { uid: number; flags: Set<string> }[] = [];
    for await (const msg of c.fetch(`${start}:*`, { uid: true, flags: true })) {
      headers.push({ uid: msg.uid, flags: msg.flags || new Set() });
    }

    const known = await Mail.find({ folder: key, uid: { $in: headers.map((h) => h.uid) } }, { uid: 1, isRead: 1, isStarred: 1 }).lean();
    const knownByUid = new Map(known.map((k) => [k.uid, k]));

    // Keep read/star state in step with changes made in other mail clients
    const flagUpdates = headers
      .filter((h) => knownByUid.has(h.uid))
      .map((h) => ({ h, k: knownByUid.get(h.uid)! }))
      .filter(({ h, k }) => k.isRead !== h.flags.has('\\Seen') || k.isStarred !== h.flags.has('\\Flagged'))
      .map(({ h }) => ({
        updateOne: { filter: { folder: key, uid: h.uid }, update: { $set: { isRead: h.flags.has('\\Seen'), isStarred: h.flags.has('\\Flagged') } } },
      }));
    if (flagUpdates.length) await Mail.bulkWrite(flagUpdates);

    const missing = headers.filter((h) => !knownByUid.has(h.uid));
    if (!missing.length) return [];

    const inserted: any[] = [];
    for await (const msg of c.fetch(missing.map((m) => m.uid).join(','), { uid: true, flags: true, source: true }, { uid: true })) {
      if (!msg.source) continue;
      try {
        const doc = await buildDoc(key, msg.uid, msg.source, msg.flags || new Set());
        // A message moved here from the dashboard is already stored without its new uid
        const moved = doc.messageId ? await Mail.findOne({ folder: key, messageId: doc.messageId, uid: { $exists: false } }) : null;
        if (moved) {
          moved.uid = msg.uid;
          await moved.save();
          continue;
        }
        inserted.push(await Mail.create(doc));
      } catch (err: any) {
        if (err?.code !== 11000) console.warn(`⚠️ [IMAP] Could not store message ${msg.uid}:`, err.message);
      }
    }
    return inserted;
  });

  if (announce && key === 'inbox' && created.length) {
    for (const doc of created.filter((d) => !d.isRead)) {
      await notify({
        type: 'webmail',
        title: `New email from ${doc.from?.name || doc.from?.address || 'unknown sender'}`,
        description: doc.subject,
        link: `/webmail?id=${doc._id}`,
      });
      forwardMessage(doc).catch((err) => console.warn('⚠️ [IMAP] Forward failed:', err.message));
    }
    broadcast('webmail:new', { folder: key, count: created.length });
  }

  return { folder: key, created: created.length };
};

export const syncAllFolders = async (limit = 50) => {
  const results = [];
  for (const key of FOLDER_KEYS) {
    try {
      results.push(await syncFolder(key, key === 'inbox' ? limit : Math.min(25, limit)));
    } catch (err: any) {
      results.push({ folder: key, created: 0, error: err.message });
    }
  }
  return results;
};

// Start the live listener: initial sync, then IDLE on INBOX with auto-reconnect
export const startImapListener = async () => {
  if (!isImapSyncEnabled()) {
    console.log('📭 [IMAP] Sync disabled (IMAP_SYNC_ENABLED=false)');
    return;
  }
  stopped = false;
  try {
    await syncAllFolders(50);
  } catch (err: any) {
    console.warn('⚠️ [IMAP] Listener start failed, retrying in 30s:', err.message);
    scheduleReconnect();
  }
};

// ---------------------------------------------------------------------------
// Server-side actions mirrored from the dashboard
// ---------------------------------------------------------------------------

export const setServerFlags = async (key: FolderKey, uid: number, flags: { isRead?: boolean; isStarred?: boolean }) =>
  runInFolder(key, async (c) => {
    const ops: [boolean | undefined, string][] = [[flags.isRead, '\\Seen'], [flags.isStarred, '\\Flagged']];
    for (const [value, flag] of ops) {
      if (value === true) await c.messageFlagsAdd(String(uid), [flag], { uid: true });
      if (value === false) await c.messageFlagsRemove(String(uid), [flag], { uid: true });
    }
  });

// Move a message between folders; returns its uid in the destination when the server reports it
export const moveOnServer = async (from: FolderKey, uid: number, to: FolderKey): Promise<number | undefined> =>
  runInFolder(from, async (c) => {
    const result = await c.messageMove(String(uid), getFolderPath(to), { uid: true });
    return result && typeof result === 'object' ? result.uidMap?.get(uid) : undefined;
  });

export const deleteOnServer = async (key: FolderKey, uid: number) =>
  runInFolder(key, async (c) => {
    await c.messageDelete(String(uid), { uid: true });
  });

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendMail } from '../utils/mailer.js';
import { encryptText } from '../utils/security.js';
import { getMailMessageModel, getMailSettingsModel, getNotificationModel } from '../models/Webmail.js';
import { broadcast } from '../utils/realtime.js';
import {
  FOLDER_KEYS,
  type FolderKey,
  getImapConfig,
  getForwardTarget,
  testImapConnection,
  resetImapConnection,
  syncAllFolders,
  syncFolder,
  setServerFlags,
  moveOnServer,
  deleteOnServer,
} from '../utils/imapSync.js';

const fail = (res: Response, error: any, status = 500) =>
  res.status(status).json({ success: false, message: error?.message || 'Mailbox request failed' });

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isFolderKey = (value: string): value is FolderKey => (FOLDER_KEYS as string[]).includes(value);

// Fire-and-forget mirror of a dashboard action on the mail server
const mirror = (label: string, task: Promise<unknown>) => {
  task.catch((err) => console.warn(`⚠️ [WEBMAIL] ${label} not mirrored on server:`, err.message));
};

// Folder list with unread and total counts
export const getFolders = async (_req: Request, res: Response) => {
  try {
    const Mail = getMailMessageModel();
    const [grouped, starred] = await Promise.all([
      Mail.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$folder', total: { $sum: 1 }, unread: { $sum: { $cond: ['$isRead', 0, 1] } } } },
      ]),
      Mail.countDocuments({ active: true, isStarred: true, folder: { $ne: 'trash' } }),
    ]);
    const byFolder = new Map(grouped.map((g) => [g._id, g]));
    const count = (key: string) => ({ total: byFolder.get(key)?.total || 0, unread: byFolder.get(key)?.unread || 0 });

    const folders = [
      { id: 'inbox', name: 'Inbox', ...count('inbox') },
      { id: 'starred', name: 'Starred', total: starred, unread: 0 },
      { id: 'sent', name: 'Sent', ...count('sent'), unread: 0 },
      { id: 'drafts', name: 'Drafts', ...count('drafts'), unread: 0 },
      { id: 'junk', name: 'Junk', ...count('junk') },
      { id: 'trash', name: 'Trash', ...count('trash'), unread: 0 },
    ];

    let mailbox = '';
    try {
      mailbox = (await getImapConfig()).user;
    } catch {
      // Not configured yet; the page shows the settings prompt
    }
    return res.json({ success: true, data: folders, mailbox });
  } catch (error) {
    return fail(res, error);
  }
};

// Paginated message list from the synced store (search on sender, subject and preview)
export const listMessages = async (req: Request, res: Response) => {
  try {
    const folder = String(req.query.folder || 'inbox').toLowerCase();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 25), 100);
    const q = String(req.query.q || '').trim();

    const filter: Record<string, any> = { active: true };
    if (folder === 'starred') {
      filter.isStarred = true;
      filter.folder = { $ne: 'trash' };
    } else {
      filter.folder = isFolderKey(folder) ? folder : 'inbox';
    }
    if (req.query.unread === 'true') filter.isRead = false;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ subject: rx }, { snippet: rx }, { 'from.address': rx }, { 'from.name': rx }, { 'to.address': rx }];
    }

    const Mail = getMailMessageModel();
    const [items, total] = await Promise.all([
      Mail.find(filter, { bodyHtml: 0, bodyText: 0 }).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Mail.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items.map((m) => ({ ...m, id: String(m._id) })),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return fail(res, error);
  }
};

// Full message with its conversation thread; opening marks it read
export const getMessage = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }
    const Mail = getMailMessageModel();
    const message = await Mail.findOne({ _id: req.params.id, active: true });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!message.isRead) {
      message.isRead = true;
      await message.save();
      if (message.uid) mirror('Mark read', setServerFlags(message.folder as FolderKey, message.uid, { isRead: true }));
      broadcast('webmail:updated', { ids: [String(message._id)] });
    }

    const thread = message.threadId
      ? await Mail.find({ active: true, threadId: message.threadId, _id: { $ne: message._id } }, { bodyHtml: 0 }).sort({ date: 1 }).lean()
      : [];

    return res.json({ success: true, data: { ...message.toObject(), id: String(message._id), thread: thread.map((t) => ({ ...t, id: String(t._id) })) } });
  } catch (error) {
    return fail(res, error);
  }
};

// Send a new email or a reply through the support SMTP account, and keep a copy in Sent
export const sendWebmail = async (req: Request, res: Response) => {
  try {
    const { to, cc, subject, text, inReplyTo, threadId } = req.body || {};
    if (!to || !subject || !text) {
      return res.status(400).json({ success: false, message: 'Recipient, subject and message are required' });
    }

    const escaped = String(text).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const html = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #111827; white-space: pre-wrap;">${escaped}</div>`;

    let mailbox = '';
    try {
      mailbox = (await getImapConfig()).user;
    } catch {
      // Replies then go to the SMTP sender address
    }

    const result = await sendMail({
      to: String(to),
      cc: cc ? String(cc) : undefined,
      subject: String(subject),
      text: String(text),
      html,
      replyTo: mailbox || undefined,
      inReplyTo: inReplyTo ? String(inReplyTo) : undefined,
      references: threadId ? String(threadId) : inReplyTo ? String(inReplyTo) : undefined,
    });

    if (!result.success) {
      return res.status(502).json({ success: false, message: result.error || 'Failed to send email' });
    }

    const split = (value?: string) =>
      String(value || '').split(',').map((a) => a.trim()).filter(Boolean).map((address) => ({ name: '', address: address.toLowerCase() }));

    const saved = await getMailMessageModel().create({
      folder: 'sent',
      messageId: result.messageId,
      inReplyTo: inReplyTo || undefined,
      threadId: threadId || inReplyTo || result.messageId,
      from: { name: 'Plexivia Support', address: (process.env.SMTP_USER || '').toLowerCase() },
      to: split(to),
      cc: split(cc),
      subject: String(subject),
      snippet: String(text).replace(/\s+/g, ' ').trim().slice(0, 180),
      bodyText: String(text),
      bodyHtml: html,
      date: new Date(),
      isRead: true,
    });
    broadcast('webmail:updated', { ids: [String(saved._id)] });

    return res.json({ success: true, message: `Email sent to ${to}`, data: { id: String(saved._id), messageId: result.messageId } });
  } catch (error) {
    return fail(res, error);
  }
};

// Pull the latest mail from the server now
export const triggerSync = async (_req: Request, res: Response) => {
  try {
    const result = await syncAllFolders(50);
    broadcast('webmail:updated', {});
    return res.json({ success: true, message: 'Mailbox synchronized', data: result });
  } catch (error) {
    return fail(res, error, 502);
  }
};

// Toggle read or starred on one message
export const updateFlags = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }
    const update: { isRead?: boolean; isStarred?: boolean } = {};
    if (typeof req.body?.isRead === 'boolean') update.isRead = req.body.isRead;
    if (typeof req.body?.isStarred === 'boolean') update.isStarred = req.body.isStarred;

    const message = await getMailMessageModel().findOneAndUpdate({ _id: req.params.id, active: true }, { $set: update }, { new: true });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (message.uid) mirror('Flag update', setServerFlags(message.folder as FolderKey, message.uid, update));
    broadcast('webmail:updated', { ids: [String(message._id)] });
    return res.json({ success: true, data: { ...message.toObject(), id: String(message._id) } });
  } catch (error) {
    return fail(res, error);
  }
};

// Move to a folder (trash, inbox, junk) keeping the server in step
const moveMessage = async (message: any, to: FolderKey) => {
  if (message.folder === to) return;
  const from = message.folder as FolderKey;
  const uid = message.uid;
  message.folder = to;
  message.uid = undefined;
  await message.save();
  if (uid) {
    const newUid = await moveOnServer(from, uid, to).catch((err) => {
      console.warn('⚠️ [WEBMAIL] Move not mirrored on server:', err.message);
      return undefined;
    });
    if (newUid) {
      message.uid = newUid;
      await message.save().catch(() => {});
    }
  }
};

const removeMessage = async (message: any) => {
  if (message.uid) mirror('Delete', deleteOnServer(message.folder as FolderKey, message.uid));
  await message.deleteOne();
};

type BatchAction = 'markRead' | 'markUnread' | 'star' | 'unstar' | 'trash' | 'restore' | 'junk' | 'notJunk' | 'delete';

// Apply one action to several messages
export const batchAction = async (req: Request, res: Response) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.filter((id: string) => mongoose.isValidObjectId(id)) : [];
    const action = req.body?.action as BatchAction;
    if (!ids.length || !action) {
      return res.status(400).json({ success: false, message: 'Message ids and action are required' });
    }

    const messages = await getMailMessageModel().find({ _id: { $in: ids }, active: true });
    for (const message of messages) {
      switch (action) {
        case 'markRead':
        case 'markUnread': {
          message.isRead = action === 'markRead';
          await message.save();
          if (message.uid) mirror('Flag update', setServerFlags(message.folder as FolderKey, message.uid, { isRead: message.isRead }));
          break;
        }
        case 'star':
        case 'unstar': {
          message.isStarred = action === 'star';
          await message.save();
          if (message.uid) mirror('Flag update', setServerFlags(message.folder as FolderKey, message.uid, { isStarred: message.isStarred }));
          break;
        }
        case 'trash':
          await moveMessage(message, 'trash');
          break;
        case 'restore':
        case 'notJunk':
          await moveMessage(message, message.from?.address && message.from.address === (process.env.SMTP_USER || '').toLowerCase() ? 'sent' : 'inbox');
          break;
        case 'junk':
          await moveMessage(message, 'junk');
          break;
        case 'delete':
          await removeMessage(message);
          break;
        default:
          return res.status(400).json({ success: false, message: 'Unknown action' });
      }
    }

    broadcast('webmail:updated', { ids });
    return res.json({ success: true, message: `${messages.length} message(s) updated` });
  } catch (error) {
    return fail(res, error);
  }
};

// Move to Trash, or delete for good when already in Trash
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }
    const message = await getMailMessageModel().findOne({ _id: req.params.id, active: true });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    const permanent = message.folder === 'trash';
    if (permanent) await removeMessage(message);
    else await moveMessage(message, 'trash');

    broadcast('webmail:updated', { ids: [req.params.id] });
    return res.json({ success: true, message: permanent ? 'Message deleted' : 'Message moved to Trash' });
  } catch (error) {
    return fail(res, error);
  }
};

// ---------------------------------------------------------------------------
// Mailbox settings (dashboard overrides .env; password never returned)
// ---------------------------------------------------------------------------

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const doc = await getMailSettingsModel().findOne({ key: 'default' }).lean();
    let active: { user: string; host: string; source: string } | null = null;
    try {
      const config = await getImapConfig();
      active = { user: config.user, host: config.host, source: config.source };
    } catch {
      active = null;
    }
    return res.json({
      success: true,
      data: {
        imap: {
          isEnabled: doc?.imap?.isEnabled || false,
          host: doc?.imap?.host || process.env.IMAP_HOST || 'imap.hostinger.com',
          port: doc?.imap?.port || Number(process.env.IMAP_PORT) || 993,
          secure: doc?.imap?.secure ?? true,
          user: doc?.imap?.user || '',
          hasPassword: Boolean(doc?.imap?.password),
        },
        forwardTo: await getForwardTarget(),
        smtpSender: process.env.SMTP_USER || '',
        active,
      },
    });
  } catch (error) {
    return fail(res, error);
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { imap = {}, forwardTo } = req.body || {};
    const set: Record<string, any> = {};
    if (typeof imap.isEnabled === 'boolean') set['imap.isEnabled'] = imap.isEnabled;
    if (typeof imap.host === 'string') set['imap.host'] = imap.host.trim();
    if (imap.port !== undefined) set['imap.port'] = Number(imap.port) || 993;
    if (typeof imap.secure === 'boolean') set['imap.secure'] = imap.secure;
    if (typeof imap.user === 'string') set['imap.user'] = imap.user.trim().toLowerCase();
    if (typeof imap.password === 'string' && imap.password) set['imap.password'] = encryptText(imap.password);
    if (typeof forwardTo === 'string') set.forwardTo = forwardTo.trim().toLowerCase();

    await getMailSettingsModel().updateOne({ key: 'default' }, { $set: set }, { upsert: true });

    // Reconnect with the new account and pull its mail
    await resetImapConnection();
    syncFolder('inbox', 50).catch((err) => console.warn('⚠️ [WEBMAIL] Sync after settings change failed:', err.message));

    return res.json({ success: true, message: 'Mail settings saved' });
  } catch (error) {
    return fail(res, error);
  }
};

// Check a login; uses the saved password when none is typed
export const testSettings = async (req: Request, res: Response) => {
  try {
    const { host, port, secure, user, password } = req.body || {};
    let pass = typeof password === 'string' ? password : '';
    let target = { host, port: Number(port) || 993, secure: secure !== false, user };
    if (!host || !user) {
      const config = await getImapConfig();
      target = { host: config.host, port: config.port, secure: config.secure, user: config.user };
      pass = config.pass;
    } else if (!pass) {
      const config = await getImapConfig().catch(() => null);
      if (config && config.user === user) pass = config.pass;
    }
    if (!pass) {
      return res.status(400).json({ success: false, message: 'Password is required to test this account' });
    }
    const status = await testImapConnection({ ...target, pass });
    return res.json({ success: true, message: `Connected. Inbox has ${status.messages} message(s), ${status.unseen} unread.`, data: status });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: `Connection failed: ${error.responseText || error.message}` });
  }
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const Notification = getNotificationModel();
    const [items, unreadCount] = await Promise.all([
      Notification.find().sort({ created_at: -1 }).limit(limit).lean(),
      Notification.countDocuments({ isRead: false }),
    ]);
    return res.json({ success: true, data: items, unreadCount });
  } catch (error) {
    return fail(res, error);
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const Notification = getNotificationModel();
    await Notification.updateOne({ _id: req.params.id }, { $set: { isRead: true } });
    const unreadCount = await Notification.countDocuments({ isRead: false });
    broadcast('notification:read', { ids: [req.params.id], unreadCount });
    return res.json({ success: true, unreadCount });
  } catch (error) {
    return fail(res, error);
  }
};

export const markAllNotificationsRead = async (_req: Request, res: Response) => {
  try {
    await getNotificationModel().updateMany({ isRead: false }, { $set: { isRead: true } });
    broadcast('notification:read', { all: true, unreadCount: 0 });
    return res.json({ success: true, unreadCount: 0 });
  } catch (error) {
    return fail(res, error);
  }
};

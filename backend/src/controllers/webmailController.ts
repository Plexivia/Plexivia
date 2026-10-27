import { Request, Response } from 'express';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { sendMail } from '../utils/mailer.js';

// Mailbox folders exposed to the dashboard, mapped to Hostinger IMAP paths
const FOLDERS: Record<string, string> = {
  inbox: 'INBOX',
  sent: 'INBOX.Sent',
  junk: 'INBOX.Junk',
  trash: 'INBOX.Trash',
  drafts: 'INBOX.Drafts',
};

// Dashboard inbox credentials (sending still uses the support SMTP account)
const getMailboxAuth = () => {
  const { WEBMAIL_USER, WEBMAIL_PASS } = process.env;
  if (!WEBMAIL_USER || !WEBMAIL_PASS) {
    throw new Error('Mailbox is not configured (WEBMAIL_USER, WEBMAIL_PASS)');
  }
  return { user: WEBMAIL_USER, pass: WEBMAIL_PASS };
};

// Open an IMAP session for the dashboard mailbox
const createImapClient = () => {
  const { IMAP_HOST, IMAP_PORT } = process.env;
  return new ImapFlow({
    host: IMAP_HOST || 'imap.hostinger.com',
    port: Number(IMAP_PORT) || 993,
    secure: true,
    auth: getMailboxAuth(),
    logger: false,
  });
};

// The mail server rejects parallel logins, so IMAP operations run one at a time
let imapQueue: Promise<unknown> = Promise.resolve();

// Run one IMAP operation in the queue, retrying once on a transient failure
const withMailbox = <T>(folder: string, fn: (client: ImapFlow) => Promise<T>): Promise<T> => {
  const run = async () => {
    try {
      return await runInMailbox(folder, fn);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return runInMailbox(folder, fn);
    }
  };
  const result = imapQueue.then(run, run);
  imapQueue = result.catch(() => {});
  return result;
};

const runInMailbox = async <T>(folder: string, fn: (client: ImapFlow) => Promise<T>): Promise<T> => {
  const client = createImapClient();
  await client.connect();
  const lock = await client.getMailboxLock(folder);
  try {
    return await fn(client);
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
};

const resolveFolder = (req: Request) => FOLDERS[String(req.query.folder || 'inbox').toLowerCase()] || FOLDERS.inbox;

// List the newest messages in a folder (headers only)
export const listMessages = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const folder = resolveFolder(req);

    const messages = await withMailbox(folder, async (client) => {
      const total = (client.mailbox && typeof client.mailbox === 'object' ? client.mailbox.exists : 0) || 0;
      if (!total) return [];
      const start = Math.max(1, total - limit + 1);
      const items: any[] = [];
      for await (const msg of client.fetch(`${start}:*`, { uid: true, envelope: true, flags: true, internalDate: true })) {
        items.push({
          uid: msg.uid,
          subject: msg.envelope?.subject || '(no subject)',
          from: msg.envelope?.from?.map((a) => (a.name ? `${a.name} <${a.address}>` : a.address)).join(', ') || '',
          to: msg.envelope?.to?.map((a) => a.address).join(', ') || '',
          date: msg.internalDate || msg.envelope?.date,
          seen: msg.flags?.has('\\Seen') || false,
        });
      }
      return items.reverse();
    });

    return res.json({ success: true, data: messages, mailbox: process.env.WEBMAIL_USER });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: `Mailbox unavailable: ${error.message}` });
  }
};

// Read one message (full body) and mark it as seen
export const getMessage = async (req: Request, res: Response) => {
  try {
    const uid = Number(req.params.uid);
    if (!uid) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }
    const folder = resolveFolder(req);

    const message = await withMailbox(folder, async (client) => {
      const raw = await client.fetchOne(String(uid), { source: true }, { uid: true });
      if (!raw || !raw.source) return null;
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true }).catch(() => {});
      const parsed = await simpleParser(raw.source);
      return {
        uid,
        subject: parsed.subject || '(no subject)',
        from: parsed.from?.text || '',
        to: Array.isArray(parsed.to) ? parsed.to.map((t) => t.text).join(', ') : parsed.to?.text || '',
        date: parsed.date,
        text: parsed.text || '',
        html: parsed.html || '',
        attachments: parsed.attachments.map((a) => ({ filename: a.filename, size: a.size, contentType: a.contentType })),
      };
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    return res.json({ success: true, data: message });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: `Mailbox unavailable: ${error.message}` });
  }
};

// Send a plain-text email from the support mailbox
export const sendWebmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, text } = req.body || {};
    if (!to || !subject || !text) {
      return res.status(400).json({ success: false, message: 'Recipient, subject and message are required' });
    }

    const escaped = String(text).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const result = await sendMail({
      to: String(to),
      subject: String(subject),
      text: String(text),
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #111827; white-space: pre-wrap;">${escaped}</div>`,
    });

    if (!result.success) {
      return res.status(502).json({ success: false, message: result.error || 'Failed to send email' });
    }
    return res.json({ success: true, message: `Email sent to ${to}`, data: { messageId: result.messageId } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send email' });
  }
};

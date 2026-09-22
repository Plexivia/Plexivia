import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';
import { EmailLogEntry } from '../types/index.js';

export const getMailHealth = (req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    service: 'plexiMail Subsystem',
    version: '0.0.0',
    port: 5096,
    smtpHost: 'mail.spacemail.com',
    smtpPort: 465,
    smtpSecure: true,
    senderIdentity: 'Plexivia System <system@plexivia.com>',
    queueDriver: 'Redis BullMQ (plexi-redis:6380)',
    activeWorkers: 2,
    queueDepth: 0,
    sentToday: Store.emailLogs.filter(l => l.timestamp.startsWith(new Date().toISOString().split('T')[0])).length + 14,
    dailyQuotaLimit: 10000,
    dailyQuotaRemaining: 9986,
    averageLatencyMs: 38
  });
};

export const getMailLogs = (req: Request, res: Response) => {
  const { recipient, status, limit = 50 } = req.query;
  let logs = [...Store.emailLogs];

  if (recipient) {
    logs = logs.filter(l => l.recipient.toLowerCase().includes(String(recipient).toLowerCase()));
  }
  if (status) {
    logs = logs.filter(l => l.status === status);
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return res.json({
    status: 'success',
    count: logs.length,
    logs: logs.slice(0, Number(limit))
  });
};

export const getTemplates = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    templates: Store.emailTemplates
  });
};

export const sendEmail = (req: Request, res: Response) => {
  const { recipient, subject, template = 'custom_dispatch', bodyHtml, sender = 'system@plexivia.com' } = req.body;

  if (!recipient || !subject) {
    return res.status(400).json({ status: 'error', message: 'Recipient and Subject are required' });
  }

  const newLog: EmailLogEntry = {
    id: 'mail-log-' + Date.now(),
    recipient,
    subject,
    template,
    status: 'SENT',
    smtpServer: 'mail.spacemail.com:465',
    sender,
    messageId: "<" + Date.now() + "." + Math.floor(Math.random() * 100000) + "@plexivia.com>",
    timestamp: new Date().toISOString(),
    sizeBytes: bodyHtml ? Buffer.byteLength(bodyHtml, 'utf8') : 14200,
    metadata: {
      dispatchedVia: 'Plexivia API Modal',
      queuedMs: 12
    }
  };

  Store.emailLogs.unshift(newLog);

  return res.json({
    status: 'success',
    message: "Email dispatched successfully via mail.spacemail.com:465 to " + recipient,
    log: newLog
  });
};

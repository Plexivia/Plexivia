import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getSupportTicketModel, ISupportTicket, ITicketMessage } from '../models/Hub.js';
import { getClientModel, IClient } from '../models/Client.js';
import { getAdminModel } from '../models/Admin.js';
import { nextSequence } from '../models/Accounts.js';
import { generateDId } from '../utils/dId.js';
import { sendMail } from '../utils/mailer.js';
import { notify } from '../utils/realtime.js';
import { softDeleteOne } from '../plugins/softDelete.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type { SupportAuthedRequest } from '../middleware/supportAuth.js';

const CATEGORIES = ['VPS', 'DEPLOYMENT', 'BUG', 'BILLING', 'FEATURE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'];

// First-response SLA window per priority
const SLA_HOURS: Record<string, number> = { URGENT: 2, HIGH: 8, MEDIUM: 24, LOW: 72 };

const nowIso = () => new Date().toISOString();
const escapeHtml = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

export const ATTACHMENT_DIR = path.resolve(process.cwd(), 'uploads', 'support');
export const ATTACHMENT_URL_PREFIX = '/api/uploads/support/';
export const ATTACHMENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

// --- Shared helpers -------------------------------------------------------

const nextTicketNumber = async () => {
  const year = new Date().getFullYear();
  return `PX-TKT-${year}-${String(await nextSequence(`ticket:${year}`)).padStart(5, '0')}`;
};

const resolveTicketQuery = (id: string) => ({ $or: [{ dId: id }, { ticket_number: id }] });

// Admins who should be emailed about client-side ticket activity: the assignee plus every
// support lead / owner / super admin, and anyone who opted into email notifications
const resolveAdminRecipients = async (ticket: ISupportTicket): Promise<string[]> => {
  const recipients = new Set<string>();
  try {
    const admins = await getAdminModel()
      .find(
        {
          is_active: true,
          $or: [
            { dId: ticket.assigned_to },
            { role: { $in: ['OWNER', 'SUPER_ADMIN', 'SUPPORT_LEAD'] } },
            { receive_email_notifications: true },
          ],
        },
        { email: 1 }
      )
      .lean();
    admins.forEach((a: any) => a?.email && recipients.add(String(a.email).trim().toLowerCase()));
  } catch (err: any) {
    console.warn('⚠️ [Support] Could not resolve admin recipients:', err.message);
  }
  return [...recipients];
};

const ticketEmailHtml = (heading: string, accent: string, rows: [string, string][], body?: string) => `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <div style="border:1px solid #e5e7eb;border-top:4px solid ${accent};border-radius:8px;padding:20px;background:#fff">
    <h2 style="margin:0 0 4px;color:${accent};font-size:20px">${escapeHtml(heading)}</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px">Plexivia Support Desk</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 12px;color:#6b7280;border-bottom:1px solid #e5e7eb;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`).join('')}
    </table>
    ${body ? `<p style="margin:16px 0 0;padding:12px;background:#f9fafb;border-radius:6px;color:#374151;font-size:13px;white-space:pre-wrap">${escapeHtml(body)}</p>` : ''}
  </div>
</div>`;

// Notify the dashboard bell + email the right side after a ticket is created or replied to
const notifyTicketEvent = async (
  ticket: ISupportTicket,
  kind: 'created' | 'client_reply' | 'admin_reply' | 'status',
  message?: ITicketMessage,
  extra?: string
) => {
  const toAdmins = kind === 'created' || kind === 'client_reply';
  if (toAdmins) {
    const title = kind === 'created' ? `New ticket: ${ticket.ticket_number}` : `${ticket.client_name} replied to ${ticket.ticket_number}`;
    await notify({ type: 'support_ticket', title, description: ticket.subject, link: `/support/${ticket.dId}` });
    const recipients = await resolveAdminRecipients(ticket);
    if (recipients.length) {
      await sendMail({
        to: recipients.join(', '),
        subject: `🎫 ${title}`,
        html: ticketEmailHtml(title, '#0891b2', [
          ['Ticket', ticket.ticket_number],
          ['Client', ticket.client_name],
          ['Priority', ticket.priority],
          ['Category', ticket.category],
        ], message?.body || ticket.description),
      }).catch((err) => console.warn('⚠️ [Support] Admin email failed:', err.message));
    }
  } else {
    // Admin reply or status change — tell the client, if we have an email for them
    const client = await getClientModel().findOne({ dId: ticket.client_dId }).lean();
    const to = client?.contact_email || client?.email;
    if (!to) return;
    const title =
      kind === 'admin_reply' ? `New reply on your ticket ${ticket.ticket_number}` : `Your ticket ${ticket.ticket_number} is now ${extra}`;
    await sendMail({
      to,
      subject: `🎫 ${title}`,
      html: ticketEmailHtml(title, '#059669', [
        ['Ticket', ticket.ticket_number],
        ['Subject', ticket.subject],
        ['Status', extra || ticket.status],
      ], message?.body),
    }).catch((err) => console.warn('⚠️ [Support] Client email failed:', err.message));
  }
};

// Appends a message to a ticket, applying the status/SLA transitions a reply from either side causes
const appendMessage = async (
  ticket: ISupportTicket,
  input: { authorType: 'CLIENT' | 'ADMIN'; authorName: string; authorAdminDId?: string; body: string; isInternalNote?: boolean; attachments?: any[] }
) => {
  const message: ITicketMessage = {
    dId: generateDId(),
    author_type: input.authorType,
    author_name: input.authorName,
    author_admin_dId: input.authorAdminDId,
    body: input.body || '',
    is_internal_note: Boolean(input.isInternalNote),
    attachments: Array.isArray(input.attachments) ? input.attachments : [],
    created_at: nowIso(),
  };
  ticket.messages.push(message);
  ticket.updated_at = nowIso();

  if (input.authorType === 'ADMIN' && !message.is_internal_note) {
    if (!ticket.first_response_at) ticket.first_response_at = message.created_at;
    // A real reply moves a freshly-opened ticket into progress automatically
    if (ticket.status === 'OPEN') ticket.status = 'IN_PROGRESS';
  }
  if (input.authorType === 'CLIENT' && (ticket.status === 'WAITING_CLIENT' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
    // The client followed up — the ball is back in our court
    ticket.status = 'IN_PROGRESS';
    ticket.resolved_at = undefined;
    ticket.closed_at = undefined;
  }

  await ticket.save();
  return message;
};

const applyStatus = (ticket: ISupportTicket, status: string) => {
  ticket.status = status as ISupportTicket['status'];
  if (status === 'RESOLVED' && !ticket.resolved_at) ticket.resolved_at = nowIso();
  if (status === 'CLOSED' && !ticket.closed_at) ticket.closed_at = nowIso();
  if (status !== 'RESOLVED') ticket.resolved_at = undefined;
  if (status !== 'CLOSED') ticket.closed_at = undefined;
};

// Whether a ticket has missed its first-response SLA (computed, not stored)
export const isOverdue = (t: Pick<ISupportTicket, 'status' | 'sla_due_at' | 'first_response_at'>) =>
  !t.first_response_at && !!t.sla_due_at && t.status === 'OPEN' && Date.parse(t.sla_due_at) < Date.now();

const serializeTicket = (t: ISupportTicket, { includeInternal }: { includeInternal: boolean }) => {
  const obj = t.toObject ? t.toObject() : t;
  return {
    ...obj,
    messages: includeInternal ? obj.messages : obj.messages.filter((m: ITicketMessage) => !m.is_internal_note),
    is_overdue: isOverdue(obj),
  };
};

// --- Admin-facing endpoints (JWT) -----------------------------------------

export const getSupportTickets = async (req: AuthedRequest, res: Response) => {
  try {
    const { status, priority, category, clientId, assignedTo, search } = req.query;
    const filter: any = {};
    if (status) filter.status = String(status).toUpperCase();
    if (priority) filter.priority = String(priority).toUpperCase();
    if (category) filter.category = String(category).toUpperCase();
    if (clientId) filter.client_dId = String(clientId);
    if (assignedTo) filter.assigned_to = String(assignedTo);
    if (search) {
      const rx = new RegExp(String(search), 'i');
      filter.$or = [{ ticket_number: rx }, { subject: rx }, { client_name: rx }, { description: rx }];
    }

    const tickets = await getSupportTicketModel().find(filter).sort({ created_at: -1 });
    return res.json({ success: true, status: 'success', count: tickets.length, data: tickets.map((t) => serializeTicket(t, { includeInternal: true })) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve support tickets' });
  }
};

export const getSupportTicketById = async (req: AuthedRequest, res: Response) => {
  try {
    const ticket = await getSupportTicketModel().findOne(resolveTicketQuery(String(req.params.id)));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    return res.json({ success: true, status: 'success', data: serializeTicket(ticket, { includeInternal: true }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve ticket' });
  }
};

// Admin opens a ticket on a client's behalf (e.g. a phone-in issue)
export const createSupportTicket = async (req: AuthedRequest, res: Response) => {
  try {
    const data = req.body || {};
    const clientDId = String(data.client_dId || data.client_id || data.clientId || '').trim();
    const subject = String(data.subject || '').trim();
    if (!clientDId || !subject) {
      return res.status(400).json({ success: false, message: 'Client and subject are required' });
    }
    const category = data.category ? String(data.category).toUpperCase() : 'DEPLOYMENT';
    const priority = data.priority ? String(data.priority).toUpperCase() : 'MEDIUM';
    if (!CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Invalid category' });
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ success: false, message: 'Invalid priority' });

    const client = await getClientModel().findOne({ dId: clientDId }).lean();
    const project = data.project_dId ? (client?.projects || []).find((p) => p.dId === data.project_dId) : undefined;

    const created = await getSupportTicketModel().create({
      ticket_number: await nextTicketNumber(),
      client_dId: clientDId,
      client_id: clientDId,
      client_name: client?.name || data.client_name || 'Client',
      project_dId: project?.dId,
      project_name: project?.name,
      subject,
      description: String(data.description || '').trim(),
      category,
      priority,
      status: 'OPEN',
      sla_due_at: new Date(Date.now() + SLA_HOURS[priority] * 3600_000).toISOString(),
      messages: [
        { dId: generateDId(), author_type: 'ADMIN', author_name: req.auth?.email || 'Admin', author_admin_dId: req.auth?.sub, body: String(data.description || '').trim(), is_internal_note: false, attachments: data.attachments || [], created_at: nowIso() },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    });

    return res.status(201).json({ success: true, status: 'success', message: 'Ticket created', data: serializeTicket(created, { includeInternal: true }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create ticket' });
  }
};

// Admin reply, or an internal note the client never sees
export const addSupportTicketMessage = async (req: AuthedRequest, res: Response) => {
  try {
    const body = String(req.body?.message || req.body?.body || '').trim();
    const isInternalNote = Boolean(req.body?.is_internal_note);
    if (!body) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const ticket = await getSupportTicketModel().findOne(resolveTicketQuery(String(req.params.id)));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const admin = req.auth?.sub ? await getAdminModel().findById(req.auth.sub).lean() : null;
    const message = await appendMessage(ticket, {
      authorType: 'ADMIN',
      authorName: admin?.full_name || req.auth?.email || 'Support',
      authorAdminDId: admin?.dId,
      body,
      isInternalNote,
      attachments: req.body?.attachments,
    });

    if (!isInternalNote) await notifyTicketEvent(ticket, 'admin_reply', message);
    return res.status(201).json({ success: true, status: 'success', message: 'Reply added', data: serializeTicket(ticket, { includeInternal: true }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add reply' });
  }
};

export const updateSupportTicketStatus = async (req: AuthedRequest, res: Response) => {
  try {
    const ticket = await getSupportTicketModel().findOne(resolveTicketQuery(String(req.params.id)));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const status = req.body?.status ? String(req.body.status).toUpperCase() : undefined;
    const priority = req.body?.priority ? String(req.body.priority).toUpperCase() : undefined;
    if (status && !STATUSES.includes(status)) return res.status(400).json({ success: false, message: `Status must be one of ${STATUSES.join(', ')}` });
    if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ success: false, message: `Priority must be one of ${PRIORITIES.join(', ')}` });

    const prevStatus = ticket.status;
    if (status) applyStatus(ticket, status);
    if (priority) ticket.priority = priority as ISupportTicket['priority'];
    ticket.updated_at = nowIso();
    await ticket.save();

    if (status && status !== prevStatus && ['WAITING_CLIENT', 'RESOLVED', 'CLOSED'].includes(status)) {
      await notifyTicketEvent(ticket, 'status', undefined, status);
    }
    return res.json({ success: true, status: 'success', data: serializeTicket(ticket, { includeInternal: true }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update ticket' });
  }
};

export const assignSupportTicket = async (req: AuthedRequest, res: Response) => {
  try {
    const adminDId = req.body?.assigned_to ? String(req.body.assigned_to).trim() : '';
    let assignedToName: string | undefined;
    if (adminDId) {
      const admin = await getAdminModel().findOne({ dId: adminDId }).lean();
      if (!admin) return res.status(400).json({ success: false, message: 'Admin not found' });
      assignedToName = admin.full_name;
    }
    const ticket = await getSupportTicketModel().findOneAndUpdate(
      resolveTicketQuery(String(req.params.id)),
      { $set: { assigned_to: adminDId || undefined, assigned_to_name: assignedToName, updated_at: nowIso() } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    return res.json({ success: true, status: 'success', data: serializeTicket(ticket, { includeInternal: true }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to assign ticket' });
  }
};

export const deleteSupportTicket = async (req: AuthedRequest, res: Response) => {
  try {
    const deleted = await softDeleteOne(getSupportTicketModel(), resolveTicketQuery(String(req.params.id)));
    if (!deleted) return res.status(404).json({ success: false, message: 'Ticket not found' });
    return res.json({ success: true, status: 'success', message: 'Ticket deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete ticket' });
  }
};

// --- Client-facing endpoints (support key) --------------------------------

export const listClientTickets = async (req: SupportAuthedRequest, res: Response) => {
  try {
    const client = req.supportClient as IClient;
    const tickets = await getSupportTicketModel().find({ client_dId: client.dId }).sort({ created_at: -1 });
    return res.json({ success: true, status: 'success', count: tickets.length, data: tickets.map((t) => serializeTicket(t, { includeInternal: false })) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve tickets' });
  }
};

export const getClientTicket = async (req: SupportAuthedRequest, res: Response) => {
  try {
    const client = req.supportClient as IClient;
    const ticket = await getSupportTicketModel().findOne({ ...resolveTicketQuery(String(req.params.id)), client_dId: client.dId });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    return res.json({ success: true, status: 'success', data: serializeTicket(ticket, { includeInternal: false }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve ticket' });
  }
};

export const createClientTicket = async (req: SupportAuthedRequest, res: Response) => {
  try {
    const client = req.supportClient as IClient;
    const data = req.body || {};
    const subject = String(data.subject || '').trim();
    const description = String(data.description || data.body || '').trim();
    if (!subject || !description) return res.status(400).json({ success: false, message: 'Subject and description are required' });

    const category = data.category ? String(data.category).toUpperCase() : 'BUG';
    const priority = data.priority ? String(data.priority).toUpperCase() : 'MEDIUM';
    const project = data.project_dId ? (client.projects || []).find((p) => p.dId === data.project_dId) : undefined;

    const created = await getSupportTicketModel().create({
      ticket_number: await nextTicketNumber(),
      client_dId: client.dId,
      client_id: client.dId,
      client_name: client.business_name || client.name,
      project_dId: project?.dId,
      project_name: project?.name,
      subject,
      description,
      category: CATEGORIES.includes(category) ? category : 'BUG',
      priority: PRIORITIES.includes(priority) ? priority : 'MEDIUM',
      status: 'OPEN',
      sla_due_at: new Date(Date.now() + SLA_HOURS[PRIORITIES.includes(priority) ? priority : 'MEDIUM'] * 3600_000).toISOString(),
      messages: [
        { dId: generateDId(), author_type: 'CLIENT', author_name: client.business_name || client.name, body: description, is_internal_note: false, attachments: data.attachments || [], created_at: nowIso() },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    });

    await notifyTicketEvent(created, 'created');
    return res.status(201).json({ success: true, status: 'success', message: 'Ticket submitted', data: serializeTicket(created, { includeInternal: false }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit ticket' });
  }
};

export const replyClientTicket = async (req: SupportAuthedRequest, res: Response) => {
  try {
    const client = req.supportClient as IClient;
    const body = String(req.body?.message || req.body?.body || '').trim();
    if (!body) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const ticket = await getSupportTicketModel().findOne({ ...resolveTicketQuery(String(req.params.id)), client_dId: client.dId });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status === 'CLOSED') return res.status(400).json({ success: false, message: 'This ticket is closed. Please open a new one.' });

    const message = await appendMessage(ticket, {
      authorType: 'CLIENT',
      authorName: client.business_name || client.name,
      body,
      attachments: req.body?.attachments,
    });

    await notifyTicketEvent(ticket, 'client_reply', message);
    return res.status(201).json({ success: true, status: 'success', message: 'Reply added', data: serializeTicket(ticket, { includeInternal: false }) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add reply' });
  }
};

// --- Shared attachment upload (admin JWT or client support key) ----------

// Detect the real file type from magic bytes — never trust the client-declared content type
const detectFileType = (buf: Buffer): string | null => {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 6 && buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.length > 4 && buf.subarray(0, 4).toString('ascii') === '%PDF') return 'application/pdf';
  return null;
};

export const uploadAttachment = async (req: SupportAuthedRequest, res: Response) => {
  try {
    const file = req.body;
    if (!Buffer.isBuffer(file) || file.length === 0) {
      return res.status(400).json({ success: false, message: 'Send the file as png, jpeg, webp, gif or pdf (max 5 MB).' });
    }
    const mimeType = detectFileType(file);
    if (!mimeType) return res.status(400).json({ success: false, message: 'Unsupported file type.' });

    fs.mkdirSync(ATTACHMENT_DIR, { recursive: true });
    const originalName = String(req.headers['x-file-name'] || 'attachment').slice(0, 120);
    const fileName = `${Date.now()}-${generateDId()}.${EXT_BY_TYPE[mimeType]}`;
    fs.writeFileSync(path.join(ATTACHMENT_DIR, fileName), file);

    return res.status(201).json({
      success: true,
      status: 'success',
      data: { name: originalName, url: ATTACHMENT_URL_PREFIX + fileName, size: file.length, mimeType },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload attachment' });
  }
};

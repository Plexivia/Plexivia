import { Cron } from 'croner';
import { getSupportTicketModel, ISupportTicket } from '../models/Hub.js';
import { getAdminModel } from '../models/Admin.js';
import { sendMail } from './mailer.js';
import { isOverdue } from '../controllers/supportController.js';

// How long a ticket may sit waiting on the client before it is flagged for a nudge
const STALE_WAITING_CLIENT_HOURS = 48;
const DIGEST_CRON = '0 9,15 * * *'; // 9am and 3pm Dhaka time
const DIGEST_TIMEZONE = 'Asia/Dhaka';

let job: Cron | null = null;

const escapeHtml = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

const resolveDigestRecipients = async (): Promise<string[]> => {
  const admins = await getAdminModel()
    .find({ is_active: true, $or: [{ role: { $in: ['OWNER', 'SUPER_ADMIN', 'SUPPORT_LEAD'] } }, { receive_email_notifications: true }] }, { email: 1 })
    .lean();
  return [...new Set(admins.map((a: any) => String(a.email || '').trim().toLowerCase()).filter(Boolean))];
};

const row = (t: ISupportTicket, reason: string) =>
  `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace">${escapeHtml(t.ticket_number)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(t.client_name)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(t.subject)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#dc2626">${escapeHtml(reason)}</td></tr>`;

// Email a digest of tickets that have missed their first-response SLA, or have sat
// waiting on the client far longer than is reasonable to leave them hanging
const runDigest = async () => {
  try {
    const [openTickets, waitingTickets] = await Promise.all([
      getSupportTicketModel().find({ status: 'OPEN' }),
      getSupportTicketModel().find({ status: 'WAITING_CLIENT' }),
    ]);

    const overdue = openTickets.filter((t) => isOverdue(t));
    const staleWaiting = waitingTickets.filter((t) => Date.now() - Date.parse(t.updated_at) > STALE_WAITING_CLIENT_HOURS * 3600_000);
    if (overdue.length === 0 && staleWaiting.length === 0) return;

    const recipients = await resolveDigestRecipients();
    if (recipients.length === 0) return;

    const rows = [
      ...overdue.map((t) => row(t, 'Past first-response SLA')),
      ...staleWaiting.map((t) => row(t, `Waiting on client ${Math.floor((Date.now() - Date.parse(t.updated_at)) / 3600_000)}h`)),
    ].join('');

    await sendMail({
      to: recipients.join(', '),
      subject: `🎫 Support Desk follow-up: ${overdue.length + staleWaiting.length} ticket(s) need attention`,
      html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px">
        <h2 style="color:#dc2626;margin:0 0 4px">Tickets needing follow-up</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 16px">Plexivia Support Desk</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="text-align:left;color:#6b7280"><th style="padding:6px 10px">Ticket</th><th style="padding:6px 10px">Client</th><th style="padding:6px 10px">Subject</th><th style="padding:6px 10px">Why</th></tr>
          ${rows}
        </table>
      </div>`,
    });
  } catch (err: any) {
    console.warn('⚠️ [TicketReminders] Digest run failed:', err.message);
  }
};

export const initTicketReminderScheduler = () => {
  job?.stop();
  job = new Cron(DIGEST_CRON, { timezone: DIGEST_TIMEZONE, protect: true, name: 'ticket-sla-digest' }, runDigest);
  console.log(`🎫 [TicketReminders] SLA digest scheduled (${DIGEST_CRON} ${DIGEST_TIMEZONE})`);
};

export const stopTicketReminderScheduler = () => {
  job?.stop();
  job = null;
};

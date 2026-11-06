import { Request, Response } from 'express';
import { sendMail } from '../utils/mailer.js';

const esc = (v: any) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Line {
  label: string;
  value: any;
}

const renderRows = (rows: Line[]) =>
  rows
    .filter((r) => r && r.label && r.value !== undefined && r.value !== null && r.value !== '')
    .map(
      (r) =>
        `<tr><td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:42%">${esc(r.label)}</td>` +
        `<td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:600;text-align:right">${esc(r.value)}</td></tr>`
    )
    .join('');

// POST /accounting/receipts/email — sends a payment receipt / slip to the client over SMTP
export const emailReceipt = async (req: Request, res: Response) => {
  try {
    const { to, heading = 'Money Receipt', reference = '', rows = [], totals = [], notes = '' } = req.body || {};
    const recipient = String(to || '').trim();
    if (!EMAIL_RX.test(recipient)) return res.status(400).json({ success: false, message: 'A valid recipient email is required' });

    const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Arial,sans-serif">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
    <div style="background:#0C1618;padding:18px 22px">
      <div style="color:#58C1C3;font-size:20px;font-weight:800;letter-spacing:2px">PLEXIVIA</div>
      <div style="color:#F5F7F7;font-size:12px;margin-top:4px">${esc(heading)}${reference ? ` · ${esc(reference)}` : ''}</div>
    </div>
    <div style="padding:20px 22px">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px">${renderRows(rows)}</table>
      ${totals.length ? `<table style="width:100%;border-collapse:collapse;margin-top:14px;border:1px solid #e2e8f0">${renderRows(totals)}</table>` : ''}
      ${notes ? `<p style="margin:14px 0 0;padding:10px 12px;background:#f8fafc;border-radius:10px;color:#334155;font-size:13px">${esc(notes)}</p>` : ''}
      <p style="margin:18px 0 0;color:#94a3b8;font-size:11px;text-align:center">This is a system-generated receipt from Plexivia. Payment received and confirmed by Plexivia Admin.</p>
    </div>
  </div>
</body></html>`;

    const text = [`${heading}${reference ? ` - ${reference}` : ''}`, '', ...[...rows, ...totals].filter((r: Line) => r?.value).map((r: Line) => `${r.label}: ${r.value}`)].join('\n');

    const result = await sendMail({ to: recipient, subject: `${heading}${reference ? ` ${reference}` : ''} — Plexivia`, html, text });
    if (!result.success) return res.status(502).json({ success: false, message: result.error || 'Email could not be sent' });
    return res.json({ success: true, message: `Receipt sent to ${recipient}`, data: { messageId: result.messageId } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send the receipt' });
  }
};

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { Mail, Pencil, Printer } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getStudioBrand } from '@/features/document-studio/components/common/useStudioBrand';

const actionTile = 'h-auto min-w-0 flex-col gap-1 whitespace-normal px-1 py-2 text-[11px] leading-tight';

// Escapes HTML special characters in input values
const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Normalizes a phone number into a wa.me link with prefilled message
const getWhatsAppLink = (rawPhone, text = '') => {
  let digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 11) digits = `88${digits}`;
  else if (digits.length === 10 && digits.startsWith('1')) digits = `880${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

// Renders the WhatsApp brand SVG icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.8 9.8 0 1 1 8.33 4.6zm8.34-18.14A11.75 11.75 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.88c0 2.1.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.86 11.86 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.88 0-3.17-1.24-6.16-3.48-8.4z" />
  </svg>
);

// Opens an official branded printable receipt slip in a new print preview window
const printSlip = ({ heading = 'Money Receipt', reference = '', rows = [], totals = [], notes = '' }) => {
  // Print through a hidden iframe: works even where pop-ups are blocked
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  if (!win) return;
  setTimeout(() => frame.remove(), 60000);

  const brand = getStudioBrand();
  const brandName = brand.brandTitle || brand.agencyName || 'PLEXIVIA';
  const brandSub = brand.brandSubtitle || 'Corporate Financial & Operations Division';
  const brandAddress = brand.address?.full || 'VIP Road, Commercial Area, Dhaka 1212';
  const brandPhone = brand.phone || brand.phoneLocal || '+880 1700-000000';
  const brandEmail = brand.email || 'contact@plexivia.com';
  const brandWeb = brand.website || 'www.plexivia.com';
  const logoSrc = brand.logo || '';

  const statusRow = rows.find((r) => String(r.label || '').toLowerCase().includes('status'));
  const statusValue = String(statusRow?.value || '').trim();
  const isPaid = !statusValue || /completed|paid|received|success/i.test(statusValue);

  const mainAmountObj = [...(totals || [])].reverse().find((t) => t.value) || totals?.[0];
  const primaryAmount = mainAmountObj?.value || '';
  const primaryAmountLabel = mainAmountObj?.label || (isPaid ? 'Amount Received' : 'Total Amount');

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const infoRows = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== '' && !String(r.label || '').toLowerCase().includes('status'));

  const gridHtml = infoRows
    .map(
      (r) =>
        `<div class="info-item"><span class="info-label">${escapeHtml(r.label)}</span><span class="info-value">${escapeHtml(r.value)}</span></div>`
    )
    .join('');

  const totalsHtml = (totals || [])
    .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
    .map((r) => `<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.value)}</td></tr>`)
    .join('');

  win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(heading)} ${escapeHtml(reference)} - ${escapeHtml(brandName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 28px;
      font-size: 13px;
      line-height: 1.5;
    }
    .receipt-card {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 10px;
      padding: 24px 28px;
      position: relative;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .watermark {
      position: absolute;
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-20deg);
      border: 4px dashed rgba(16, 185, 129, 0.22);
      color: rgba(16, 185, 129, 0.24);
      font-size: 36px;
      font-weight: 900;
      padding: 10px 28px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 4px;
      pointer-events: none;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 14px;
      gap: 16px;
    }
    .brand-col {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 1.5px solid #0f172a;
      object-fit: contain;
      background: #ffffff;
      padding: 2px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #0f172a;
      line-height: 1.1;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 10.5px;
      color: #475569;
      margin-top: 3px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-contact {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .token-col {
      text-align: right;
      flex-shrink: 0;
    }
    .type-badge {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 3px 9px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .ref-no {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      font-weight: 800;
      color: #0284c7;
    }
    .issue-date {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .status-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 12px;
      margin-bottom: 14px;
    }
    .status-strip-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid;
    }
    .status-paid {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }
    .status-pending {
      background: #fffbeb;
      color: #b45309;
      border-color: #fde68a;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.4px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }
    .amount-banner {
      background: #0f172a;
      color: #ffffff;
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .amount-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }
    .amount-figure {
      font-size: 20px;
      font-weight: 900;
      color: #34d399;
      letter-spacing: 0.5px;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .totals-table td {
      padding: 6px 0;
      border-bottom: 1px dashed #cbd5e1;
      font-size: 12px;
    }
    .totals-table td:last-child {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }
    .notes-box {
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      border-radius: 0 4px 4px 0;
      padding: 8px 12px;
      margin-bottom: 20px;
      font-size: 11px;
      color: #334155;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 34px;
      padding-top: 8px;
    }
    .signature-block {
      width: 38%;
      text-align: center;
    }
    .signature-line {
      border-top: 1.5px solid #475569;
      margin-bottom: 4px;
    }
    .signature-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .footer-note {
      text-align: center;
      margin-top: 18px;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-card { box-shadow: none; border-color: #0f172a; padding: 16px 20px; }
      @page { margin: 10mm; size: auto; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    ${isPaid ? '<div class="watermark">PAID &amp; VERIFIED</div>' : ''}
    <div class="header">
      <div class="brand-col">
        ${logoSrc ? `<img src="${logoSrc}" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
        <div>
          <h1 class="brand-title">${escapeHtml(brandName)}</h1>
          <div class="brand-sub">${escapeHtml(brandSub)}</div>
          <div class="brand-contact">${escapeHtml(brandAddress)}</div>
          <div class="brand-contact">Phone: ${escapeHtml(brandPhone)} | Email: ${escapeHtml(brandEmail)}</div>
        </div>
      </div>
      <div class="token-col">
        <span class="type-badge">${escapeHtml(heading)}</span>
        <div class="ref-no">Token: ${escapeHtml(reference)}</div>
        <div class="issue-date">Date: ${escapeHtml(printDate)} ${escapeHtml(printTime)}</div>
      </div>
    </div>

    <div class="status-strip">
      <span class="status-strip-title">Payment Voucher &amp; Official Slip</span>
      <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
        ${isPaid ? '✔ Cash Received &amp; Seal Verified' : '● Payment Pending Verification'}
      </span>
    </div>

    <div class="info-grid">
      ${gridHtml}
    </div>

    ${primaryAmount ? `
    <div class="amount-banner">
      <div>
        <div class="amount-label">${escapeHtml(primaryAmountLabel)}</div>
        <div class="amount-figure">${escapeHtml(primaryAmount)}</div>
      </div>
      <div style="text-align: right;">
        <div class="amount-label">Currency / System</div>
        <div style="font-size: 11px; font-weight: 700; color: #e2e8f0; margin-top: 2px;">BDT · Verified Settlement</div>
      </div>
    </div>` : ''}

    ${totalsHtml ? `<table class="totals-table">${totalsHtml}</table>` : ''}

    ${notes ? `<div class="notes-box"><strong>Notes / Particulars:</strong> ${escapeHtml(notes)}</div>` : ''}

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Prepared by / Cashier</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Authorized Signatory &amp; Seal</div>
      </div>
    </div>

    <div class="footer-note">
      This is a computer-generated official payment receipt issued by ${escapeHtml(brandName)} Portal (${escapeHtml(brandWeb)}).
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  win.document.close();
};

// Builds a plain-text summary for message sharing
const toText = ({ heading, reference, rows, totals }) =>
  [
    `${heading} - ${reference}`,
    '',
    ...[...rows, ...(totals || [])]
      .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
      .map((r) => `${r.label}: ${r.value}`),
  ].join('\n');

// Displays right-side quick view drawer for financial records
export const RecordQuickView = ({
  open,
  onClose,
  title,
  description,
  slip,
  printLabel = 'Print',
  defaultPhone,
  defaultEmail,
  onEdit,
  editLabel = 'Edit',
  children,
}) => {
  const [shareMode, setShareMode] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) setShareMode(null);
  }, [open]);

  const openShare = (mode) => {
    if (!slip) return;
    const known = mode === 'whatsapp' ? defaultPhone : defaultEmail;
    // Client's number / email is known: go straight to WhatsApp or the mail app
    if (known && mode === 'whatsapp') {
      window.open(getWhatsAppLink(known, toText(slip)), '_blank', 'noopener');
      setShareMode(null);
      return;
    }
    // Email: recipient box opens pre-filled with the client's email, then Send emails it over SMTP
    setShareMode(shareMode === mode ? null : mode);
    setRecipient(mode === 'email' ? known || '' : '');
  };

  const send = () => {
    if (!slip) return;
    const text = toText(slip);
    if (shareMode === 'whatsapp') {
      const link = getWhatsAppLink(recipient, text);
      window.open(link || `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } else {
      const to = recipient.trim();
      if (!to) return;
      setSending(true);
      apiClient
        .post('/api/accounting/receipts/email', { to, ...slip })
        .then(() => {
          toast.success(`Receipt emailed to ${to}`);
          setShareMode(null);
        })
        .catch((err) => toast.error(err?.response?.data?.message || 'Email could not be sent'))
        .finally(() => setSending(false));
      return;
    }
    setShareMode(null);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="gap-4 border-b p-5">
          <div className="space-y-1 pr-8">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
          </div>
          <div className={cn('grid gap-2', onEdit ? 'grid-cols-4' : 'grid-cols-3')}>
            <Button variant="outline" onClick={() => slip && printSlip(slip)} className={actionTile}>
              <Printer className="size-3.5" /> {printLabel}
            </Button>
            <Button variant={shareMode === 'whatsapp' ? 'secondary' : 'outline'} onClick={() => openShare('whatsapp')} className={actionTile}>
              <WhatsAppIcon className="size-3.5 text-emerald-600" /> WhatsApp
            </Button>
            <Button variant={shareMode === 'email' ? 'secondary' : 'outline'} onClick={() => openShare('email')} className={actionTile}>
              <Mail className="size-3.5" /> Email
            </Button>
            {onEdit && (
              <Button onClick={onEdit} className={actionTile}>
                <Pencil className="size-3.5" /> {editLabel}
              </Button>
            )}
          </div>
          {shareMode && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <Input
                autoFocus
                type={shareMode === 'email' ? 'email' : 'tel'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={shareMode === 'email' ? 'name@example.com' : '01XXXXXXXXX'}
                className="h-9"
              />
              <Button type="submit" size="sm" className="h-9" disabled={sending}>
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </form>
          )}
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

// Groups related details into a titled section inside the drawer
export const QuickViewSection = ({ title, children }) => (
  <section className="overflow-hidden rounded-xl border border-border">
    <h3 className="border-b border-border bg-muted/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {title}
    </h3>
    <div className="divide-y divide-border">{children}</div>
  </section>
);

// One table row inside a quick view section: label cell on the left, value on the right
export const QuickViewLine = ({ label, value, className }) => (
  <div className={cn('grid grid-cols-[40%_1fr] text-sm', className)}>
    <span className="border-r border-border bg-muted/20 px-3 py-2 text-muted-foreground">{label}</span>
    <span className="flex items-center justify-end px-3 py-2 text-right font-medium tabular-nums break-all">{value}</span>
  </div>
);

// "2026-11-07" -> "7 November 2026"
export const formatLongDate = (value) => {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(value);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

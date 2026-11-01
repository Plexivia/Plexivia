import React, { useEffect, useState } from 'react';
import { Mail, Pencil, Printer } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Equal-width action tiles under the header: icon on top, label below
const actionTile = 'h-auto min-w-0 flex-col gap-1 whitespace-normal px-1 py-2 text-[11px] leading-tight';

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Normalizes a BD phone number into a wa.me link with prefilled text
const getWhatsAppLink = (rawPhone, text = '') => {
  let digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 11) digits = `88${digits}`;
  else if (digits.length === 10 && digits.startsWith('1')) digits = `880${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.8 9.8 0 1 1 8.33 4.6zm8.34-18.14A11.75 11.75 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.88c0 2.1.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.86 11.86 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.88 0-3.17-1.24-6.16-3.48-8.4z" />
  </svg>
);

// Opens a printable slip in a new window and triggers the print dialog
const printSlip = ({ heading, reference, rows, totals, notes }) => {
  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return;
  const rowHtml = (list) =>
    list
      .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
      .map((r) => `<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.value)}</td></tr>`)
      .join('');
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(heading)} ${escapeHtml(reference)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;margin:32px;font-size:13px}
  h1{font-size:20px;margin:0}.ref{color:#666;margin:4px 0 20px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  td{padding:7px 0;border-bottom:1px solid #eee}td:last-child{text-align:right;font-weight:600}
  .totals td{border-bottom:none}.totals tr:last-child td{border-top:2px solid #111;font-size:15px}
  .notes{color:#444;white-space:pre-wrap}.sign{display:flex;justify-content:space-between;margin-top:64px}
  .sign span{border-top:1px solid #999;padding-top:4px;width:40%;text-align:center;color:#666}
</style></head><body>
<h1>${escapeHtml(heading)}</h1><div class="ref">${escapeHtml(reference)}</div>
<table>${rowHtml(rows)}</table>
${totals?.length ? `<table class="totals">${rowHtml(totals)}</table>` : ''}
${notes ? `<p class="notes"><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ''}
<div class="sign"><span>Prepared by</span><span>Authorized signature</span></div>
<script>window.onload=function(){window.print();}</script>
</body></html>`);
  win.document.close();
};

// Builds a plain-text summary for WhatsApp / email bodies
const toText = ({ heading, reference, rows, totals }) =>
  [
    `${heading} - ${reference}`,
    '',
    ...[...rows, ...(totals || [])]
      .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
      .map((r) => `${r.label}: ${r.value}`),
  ].join('\n');

/**
 * Right-side quick view drawer for accounting records (bills, payments).
 * `slip` = { heading, reference, rows: [{label, value}], totals: [{label, value}], notes }
 * drives print, WhatsApp and email; `children` renders the drawer body.
 */
export function RecordQuickView({ open, onClose, title, description, slip, printLabel = 'Print', defaultPhone, defaultEmail, onEdit, editLabel = 'Edit', children }) {
  const [shareMode, setShareMode] = useState(null);
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    if (!open) setShareMode(null);
  }, [open]);

  const openShare = (mode) => {
    setShareMode(shareMode === mode ? null : mode);
    setRecipient(mode === 'whatsapp' ? defaultPhone || '' : defaultEmail || '');
  };

  const send = () => {
    if (!slip) return;
    const text = toText(slip);
    if (shareMode === 'whatsapp') {
      const link = getWhatsAppLink(recipient, text);
      window.open(link || `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } else {
      const subject = `${slip.heading} ${slip.reference}`;
      window.location.href = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
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
              <Button type="submit" size="sm" className="h-9">
                Send
              </Button>
            </form>
          )}
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function QuickViewSection({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function QuickViewLine({ label, value, className }) {
  return (
    <div className={cn('flex justify-between gap-3', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

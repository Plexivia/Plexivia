import { useEffect, useState } from 'react';

// Public, view-only money receipt opened from the QR on a printed receipt.
// The id in the URL is the receipt's random document id, not its serial number.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://api.plexivia.com').replace(/\/+$/, '');

interface PublicReceipt {
  receiptNo: string;
  issueDate: string;
  time: string;
  clientName: string;
  service: string;
  amount: number;
  currency: string;
  amountInWords: string;
  paymentMethod: string;
  status: string;
}

const formatDate = (iso: string) => {
  const [y, m, d] = (iso || '').split('-');
  return y && m && d ? `${d}-${m}-${y}` : iso || '—';
};

export default function ReceiptViewPage({ receiptId }: { receiptId: string }) {
  const [receipt, setReceipt] = useState<PublicReceipt | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/public/receipts/${encodeURIComponent(receiptId)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok || !body?.data) setError(body?.message || 'Receipt not found');
        else setReceipt(body.data);
      })
      .catch(() => active && setError('Could not load the receipt. Please try again.'));
    return () => {
      active = false;
    };
  }, [receiptId]);

  const rows: [string, string][] = receipt
    ? [
        ['Receipt No', receipt.receiptNo],
        ['Date', `${formatDate(receipt.issueDate)}${receipt.time ? ` · ${receipt.time}` : ''}`],
        ['Paid By', receipt.clientName || '—'],
        ['Service', receipt.service || '—'],
        ['Payment Method', receipt.paymentMethod || '—'],
      ]
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0C1618] text-[#F5F7F7] font-sans flex items-center justify-center px-4 py-10">
      {/* Same glow accents as the website hero */}
      <div className="pointer-events-none absolute top-10 left-1/4 h-96 w-96 rounded-full bg-[#58C1C3]/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-[420px] w-[420px] rounded-full bg-[#97CC6F]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[#58C1C3]/20 bg-[#0F1E22] shadow-2xl shadow-black/40">
          {/* Header — website navbar style */}
          <div className="flex items-center justify-between gap-3 border-b border-[#58C1C3]/15 bg-[#0C1618]/90 px-5 py-4 backdrop-blur-md">
            <img src="/brand-light.png" alt="Plexivia" className="h-8 w-auto object-contain" />
            <span className="rounded-[8px] bg-[#58C1C3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0C1618]">
              Money Receipt
            </span>
          </div>

          {!receipt && !error && <p className="px-5 py-12 text-center font-mono text-sm text-[#F5F7F7]/60">Loading receipt…</p>}

          {error && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-rose-400">{error}</p>
              <p className="mt-1 text-xs text-[#F5F7F7]/60">Check the QR code or contact Plexivia.</p>
            </div>
          )}

          {receipt && (
            <>
              {/* Body — amount, in the website's code-box style */}
              <div className="p-5">
                <div className="rounded-2xl border border-[#58C1C3]/15 bg-[#081012] px-5 py-6 text-center">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#58C1C3]">Amount Paid</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-[#58C1C3] via-[#72D5A3] to-[#97CC6F] bg-clip-text text-transparent">
                      {receipt.currency} {Number(receipt.amount || 0).toLocaleString('en-IN')}/-
                    </span>
                  </p>
                  {receipt.amountInWords && <p className="mt-2 text-xs text-[#F5F7F7]/70">{receipt.amountInWords}</p>}
                </div>
              </div>

              {/* Footer — receipt information */}
              <div className="border-t border-[#58C1C3]/15 px-5 pb-5">
                <dl className="divide-y divide-[#58C1C3]/10 text-sm">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-3">
                      <dt className="shrink-0 font-medium text-[#F5F7F7]/60">{label}</dt>
                      <dd className={`text-right font-semibold break-all ${label === 'Receipt No' ? 'font-mono text-[#58C1C3]' : 'text-[#F5F7F7]'}`}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#97CC6F]/30 bg-[#97CC6F]/10 px-3 py-2 text-center text-xs font-semibold text-[#97CC6F]">
                  <span className="h-2 w-2 rounded-full bg-[#97CC6F] animate-pulse" />
                  {receipt.status || 'Received'} — confirmed by Plexivia Admin
                </p>
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-center font-mono text-[11px] text-[#F5F7F7]/40">plexivia.com · view only</p>
      </div>
    </div>
  );
}

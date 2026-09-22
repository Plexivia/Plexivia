import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, CheckCircle2, Clock, ShieldCheck, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import agencyInfo from '@/lib/information.json';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';

// Helper component for single half-page receipt slip
function SingleReceiptSlip({ data = {}, copyType = 'Client Copy' }) {
  const {
    receiptNo = 'MR-000000-0000',
    clientName = '',
    clientPhone = '',
    passportNumber = '',
    serviceType = 'Indian Visa Processing',
    purpose = '',
    amount = 0,
    amountInWords = '',
    paymentMethod = 'Cash',
    status = 'pending',
    createdByName = 'Manager',
    confirmedByName = '',
    confirmedAt = null,
    createdAt = new Date().toISOString(),
  } = data || {};

  const isConfirmed = status === 'confirmed';

  return (
    <div className="border-2 border-slate-800 rounded-lg p-3 sm:p-3.5 bg-white flex flex-col justify-between relative text-slate-900">
      
      {/* Watermark for Confirmed Seal - Subtle Ash Color */}
      {isConfirmed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <div className="border-[5px] border-slate-400 rounded-full p-6 rotate-[-20deg] text-center">
            <span className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-slate-500">
              PAID & SEALED
            </span>
          </div>
        </div>
      )}

      {/* Header with Agency Branding */}
      <div className="border-b border-slate-800 pb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Agency Info */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 border-2 border-[#0B3A60] overflow-hidden shadow-xs">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase leading-none">
                {agencyInfo.agencyName || 'PLEXIVIA'}
              </h1>
              <p className="text-[9.5px] text-slate-600 font-medium mt-0.5">
                {agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
              <p className="text-[9.5px] text-slate-700 font-mono">
                Helpline: {agencyInfo.phone || '+8801345579534'} | {agencyInfo.email || 'contact@plexivia.com'}
              </p>
            </div>
          </div>

          {/* Token Header & Badge */}
          <div className="text-right shrink-0">
            <span className="inline-block bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5">
              {copyType}
            </span>
            <div className="text-[10.5px] font-mono font-bold text-slate-800">
              Token No: <span className="text-primary font-black text-xs">{receiptNo}</span>
            </div>
            <div className="text-[9.5px] text-slate-600 font-mono">
              Date: {formatToDdMmYyyy(createdAt)} {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div className="flex items-center justify-between bg-slate-100 border border-slate-300 px-2.5 py-0.5 my-1.5 rounded">
        <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
          Money Receipt & Payment Token
        </span>
        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 ${
          isConfirmed 
            ? 'bg-slate-100 text-slate-700 border-slate-300' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isConfirmed ? <CheckCircle2 className="w-3 h-3 text-slate-500" /> : <Clock className="w-3 h-3 text-amber-600" />}
          {isConfirmed ? 'Cash Received & Seal Verified' : 'Cashier Payment Pending'}
        </span>
      </div>

      {/* Client & Service Info Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs border border-slate-200 rounded p-2 bg-slate-50/50 mb-1.5">
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Client Name:</span>
          <span className="font-bold text-slate-900 text-xs">{clientName || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Phone Number:</span>
          <span className="font-mono font-semibold text-slate-800 text-[11px]">{clientPhone || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Passport Number:</span>
          <span className="font-mono font-bold text-slate-900 uppercase text-[11px]">{passportNumber || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Service Category:</span>
          <span className="font-semibold text-slate-900 text-[11px]">{serviceType}</span>
        </div>
        {purpose && (
          <div className="col-span-2 border-t border-slate-200 pt-0.5 mt-0.5">
            <span className="text-slate-500 text-[9.5px] uppercase font-bold block">Description & Purpose:</span>
            <span className="text-slate-800 text-[10.5px]">{purpose}</span>
          </div>
        )}
      </div>

      {/* Amount & Payment Method Highlight Box */}
      <div className="flex items-center justify-between border border-slate-900 bg-slate-900 text-white rounded p-2 mb-1.5">
        <div>
          <div className="text-[9.5px] uppercase font-medium text-slate-300">Received Amount (BDT)</div>
          <div className="text-base sm:text-lg font-black tracking-tight text-emerald-400">
            BDT  {Number(amount || 0).toLocaleString('en-IN')} BDT
          </div>
          {amountInWords && (
            <div className="text-[9.5px] text-slate-300 italic">
              In Words: {amountInWords}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[9.5px] text-slate-300 uppercase">Payment Method</div>
          <div className="text-[11px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 inline-block mt-0.5">
            {paymentMethod}
          </div>
        </div>
      </div>

      {/* Signatures Grid */}
      <div className="grid grid-cols-2 gap-6 pt-1.5 border-t border-slate-300 items-end text-center">
        
        {/* Token Creator (Manager) */}
        <div>
          <div className="h-5 flex items-end justify-center">
            <span className="text-[9.5px] text-slate-400 italic">Signed</span>
          </div>
          <div className="border-t border-slate-700 pt-0.5 text-[9.5px] font-bold text-slate-800">
            {createdByName || 'Manager'}
          </div>
          <div className="text-[8.5px] text-slate-500">Token Prepared By</div>
        </div>

        {/* Accountant / Cashier Receiver */}
        <div>
          <div className="h-5 flex items-end justify-center">
            {isConfirmed ? (
              <span className="text-[9.5px] font-bold text-slate-600">✓ Received</span>
            ) : (
              <span className="text-[9.5px] text-slate-300 italic">Pending</span>
            )}
          </div>
          <div className="border-t border-slate-700 pt-0.5 text-[9.5px] font-bold text-slate-800">
            {confirmedByName || 'Cashier / Accounts'}
          </div>
          <div className="text-[8.5px] text-slate-500">Payment & Seal Receiver</div>
        </div>

      </div>

      {/* Bottom Micro Footer */}
      <div className="flex justify-between items-center text-[8.5px] text-slate-500 border-t border-slate-200 mt-1 pt-0.5 font-mono">
        <span>* This token is valid for official accounting and document release.</span>
        <span className="font-bold">{receiptNo}</span>
      </div>

    </div>
  );
}

/**
 * Main Printable Money Receipt Sheet
 * Formatted as an A4 page with 2 slips (Client Copy & Office Copy)
 */
export function MoneyReceiptPrintSlip({ data = {}, onPrint }) {
  const handlePrint = onPrint || (() => {
    printDocument({
      docId: data.receiptNo,
      docType: 'Money_Receipt',
      clientName: data.clientName,
    });
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Preview Action Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Money Receipt & Token Canvas (A4 Dual Slip)</span>
          <span>•</span>
          <span className="text-[11px]">2 Copies per A4 Page (Client & Office)</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt / PDF</span>
        </Button>
      </div>

      {/* A4 Paper Canvas - Clean Compact Padding */}
      <PrintablePaper id="printable-receipt-canvas" className="p-4 sm:p-5 space-y-2.5 min-h-0 flex-col justify-start">
        {/* Top Half: Client Copy */}
        <SingleReceiptSlip data={data} copyType="Client Copy" />

        {/* Perforated Divider Line */}
        <div className="relative py-0.5 text-center select-none">
          <div className="border-t-2 border-dashed border-slate-400 w-full" />
          <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-white px-3 text-[9.5px] font-mono text-slate-500 flex items-center gap-1">
            ✂️ ------------------ Tear Along Line ------------------ ✂️
          </span>
        </div>

        {/* Bottom Half: Office Copy */}
        <SingleReceiptSlip data={data} copyType="Office & Accounts Copy" />
      </PrintablePaper>
    </div>
  );
}

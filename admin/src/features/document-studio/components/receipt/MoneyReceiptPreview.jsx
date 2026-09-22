import React from 'react';
import { Scissors, CheckSquare, Square } from 'lucide-react';
import agencyInfo from '@/lib/information.json';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy } from '@/lib/utils';

// Helper Barcode Component
function BarcodeSVG({ value = 'MR2026084001' }) {
  // Generate visual barcode bars based on value
  const cleanVal = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'MR2026084001';
  const barPattern = [2, 1, 3, 1, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3];

  return (
    <div className="flex flex-col items-center">
      <svg className="h-9 w-44" viewBox="0 0 160 40">
        {barPattern.map((width, idx) => {
          const xPos = idx * 4;
          return (
            <rect
              key={idx}
              x={xPos}
              y="2"
              width={width > 2 ? 2.5 : width === 2 ? 1.8 : 1.1}
              height="34"
              fill="#1E293B"
            />
          );
        })}
      </svg>
      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 -mt-0.5">
        *{cleanVal}*
      </span>
    </div>
  );
}

// Single Voucher Slip Unit Component
export function VoucherSlipCard({ data = {}, copyTitle = 'Original Copy', idSuffix = '' }) {
  const {
    receiptNo = 'MR-2026-084',
    date = new Date().toISOString().split('T')[0],
    time = '11:30 AM',
    clientName = 'Md. Abdul Karim',
    passportNumber = 'A08492014',
    purpose = 'Visa Processing & Flight Ticket Booking (Saudi Arabia)',
    receivedBy = 'Md. Tanvir Hossain',
    receivedByRole = 'Accounts Officer',
    paymentMethod = 'Cash',
    amount = 50000,
    amountInWords = 'Fifty Thousand Taka Only.',
    preparedBy = 'Client / Depositor',
    receivedBySignature = 'Recipient',
    accountsSignature = 'Accountant',
    approvedBySignature = 'Authorized Signatory',
  } = data || {};

  const formattedAmount = Number(amount || 0).toLocaleString('en-IN');
  const formattedDate = formatToDdMmYyyy(date);

  return (
    <div className="border-2 border-[#1E88E5] rounded-2xl p-4 sm:p-5 bg-white text-slate-900 shadow-sm relative w-full select-none print:shadow-none print:border-[#1E88E5]">
      
      {/* 1. Header Section */}
      <div className="flex items-start justify-between gap-4 pb-2.5">
        {/* Left: Logo & Agency Details */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-xs border-2 border-[#0B3A60] overflow-hidden">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0D47A1] uppercase font-serif leading-none">
              {agencyInfo.agencyName || 'PLEXIVIA'}
            </h1>
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              Recruitment &amp; Travel Agency
            </p>
            <div className="mt-1.5 inline-block bg-[#0B3A60] text-white text-[10.5px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              INTERNAL MONEY RECEIPT / VOUCHER
            </div>
          </div>
        </div>

        {/* Right: Copy Tag & Barcode / QR Code */}
        <div className="flex flex-col items-end">
          <span className="inline-block bg-[#E3F2FD] text-[#0D47A1] text-[10.5px] font-bold px-3 py-0.5 rounded-full border border-[#BBDEFB] uppercase tracking-wide mb-1.5 shadow-2xs">
            {copyTitle}
          </span>
          <div className="flex items-center gap-2">
            {data.qrCode && (
              <img
                src={data.qrCode}
                alt="Receipt QR"
                className="w-11 h-11 rounded p-0.5 bg-white border border-slate-300 shadow-2xs"
                title={`Scan to verify: ${receiptNo}`}
              />
            )}
            <BarcodeSVG value={receiptNo} />
          </div>
        </div>
      </div>

      {/* 2. Subheader Meta Bar (Light Blue Bar) */}
      <div className="bg-[#E1F5FE] border border-[#B3E5FC] px-4 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold text-[#0277BD] my-2">
        <div>
          <span>Receipt No: </span>
          <span className="font-mono text-slate-900 font-black">{receiptNo}</span>
        </div>
        <div>
          <span>Date: </span>
          <span className="font-mono text-slate-900">{formattedDate}</span>
        </div>
        <div>
          <span>Time: </span>
          <span className="font-mono text-slate-900">{time || '11:30 AM'}</span>
        </div>
      </div>

      {/* 3. Main Details Key-Value Grid */}
      <div className="border border-[#BBDEFB] rounded-xl overflow-hidden text-xs my-2 bg-[#F8FAFC]">
        {/* Row 1: Client / Passenger Name */}
        <div className="grid grid-cols-12 border-b border-[#E2E8F0] px-3.5 py-2">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Client / Passenger Name:
          </div>
          <div className="col-span-8 sm:col-span-9 font-bold text-slate-900">
            {clientName || '—'}{' '}
            {passportNumber && (
              <span className="font-normal text-slate-700">
                (Passport: <span className="font-mono font-semibold">{passportNumber}</span>)
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Purpose / Service Head */}
        <div className="grid grid-cols-12 border-b border-[#E2E8F0] px-3.5 py-2 bg-white">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Purpose / Service Head:
          </div>
          <div className="col-span-8 sm:col-span-9 font-medium text-slate-900">
            {purpose || '—'}
          </div>
        </div>

        {/* Row 3: Received / Paid By */}
        <div className="grid grid-cols-12 border-b border-[#E2E8F0] px-3.5 py-2">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Received / Paid By:
          </div>
          <div className="col-span-8 sm:col-span-9 font-medium text-slate-900">
            {receivedBy || '—'}{' '}
            {receivedByRole && (
              <span className="font-normal text-slate-700">({receivedByRole})</span>
            )}
          </div>
        </div>

        {/* Row 4: Payment Method */}
        <div className="grid grid-cols-12 px-3.5 py-2 bg-white items-center">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Payment Method:
          </div>
          <div className="col-span-8 sm:col-span-9 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              {paymentMethod === 'Cash' ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#0D47A1] fill-[#0D47A1]/10" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={`text-[11.5px] ${paymentMethod === 'Cash' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                Cash
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              {paymentMethod === 'Bank Transfer / Cheque' ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#0D47A1] fill-[#0D47A1]/10" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={`text-[11.5px] ${paymentMethod === 'Bank Transfer / Cheque' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                Bank Transfer / Cheque
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              {paymentMethod === 'Online Payment' ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#0D47A1] fill-[#0D47A1]/10" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={`text-[11.5px] ${paymentMethod === 'Online Payment' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                Online Payment
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Total Amount Bar with Highlighted Right Block */}
      <div className="border-2 border-[#0B3A60] rounded-xl overflow-hidden flex flex-col sm:flex-row items-stretch my-2.5 bg-white">
        {/* Left: Amount in Words */}
        <div className="flex-1 p-3 flex items-center">
          <span className="text-xs font-semibold text-slate-700">
            Amount in Words:{' '}
            <span className="font-bold text-slate-900 italic underline ml-1">
              {amountInWords || '—'}
            </span>
          </span>
        </div>

        {/* Right: Solid Blue Block */}
        <div className="bg-[#0B3A60] text-white px-6 py-2.5 text-center flex flex-col justify-center shrink-0 min-w-[170px]">
          <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#90CAF9]">
            TOTAL AMOUNT
          </span>
          <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white mt-0.5">
            BDT  {formattedAmount}/-
          </span>
        </div>
      </div>

      {/* 5. Four Signatures Bar */}
      <div className="grid grid-cols-4 gap-3 pt-6 mt-4 text-center text-[10.5px]">
        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            Prepared / Paid By
          </div>
          <div className="text-[10px] text-slate-500 font-medium">({preparedBy || 'Paid By'})</div>
        </div>

        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            Received By
          </div>
          <div className="text-[10px] text-slate-500 font-medium">({receivedBySignature || 'Received By'})</div>
        </div>

        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            Accounts
          </div>
          <div className="text-[10px] text-slate-500 font-medium">({accountsSignature || 'Accountant'})</div>
        </div>

        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            Approved By
          </div>
          <div className="text-[10px] text-slate-500 font-medium">({approvedBySignature || 'General Manager / Proprietor'})</div>
        </div>
      </div>
    </div>
  );
}

// Scissor Divider Line Component
function ScissorDivider() {
  return (
    <div className="py-3 flex items-center justify-center relative w-full my-1 select-none">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-dashed border-[#1E88E5]/70" />
      </div>
      <div className="relative bg-white px-4 text-[#0D47A1] text-[10px] font-mono font-bold flex items-center gap-1.5 uppercase tracking-wider">
        <Scissors className="w-3.5 h-3.5 transform -rotate-90 text-[#0D47A1]" />
        <span>PLEXIVIA : OFFICE &amp; CUSTOMER DIVIDER LINE</span>
        <Scissors className="w-3.5 h-3.5 transform rotate-90 text-[#0D47A1]" />
      </div>
    </div>
  );
}

// Master Printable Money Receipt Container
export function MoneyReceiptPreview({ data = {} }) {
  const isDualPrint = data.dualPrint !== false;

  return (
    <div className="w-full flex justify-center py-2 sm:py-4 no-print-padding print:p-0 print:m-0">
      {/* 
        A4 container: 
        In display mode: max-w-[850px], height fits content naturally.
        In print mode: fits standard A4 with clean margins.
      */}
      <div
        id="printable-receipt-canvas"
        className="printable-a4-paper printable-money-receipt bg-white text-slate-900 shadow-2xl rounded-2xl w-full max-w-[850px] p-4 sm:p-6 flex flex-col justify-start print:min-h-0 print:h-auto print:p-4 print:m-0 print:shadow-none print:w-full print:max-w-none space-y-3"
      >
        {/* First Voucher Slip (Original Copy) */}
        <VoucherSlipCard
          data={data}
          copyTitle={data.copyType || 'Original Copy'}
          idSuffix="-original"
        />

        {/* Optional Second Voucher Slip on the same A4 page */}
        {isDualPrint && (
          <>
            <ScissorDivider />
            <VoucherSlipCard
              data={data}
              copyTitle="Office Copy"
              idSuffix="-office"
            />
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import plexiviaLogo from '@/assets/brand-dark.png';
import { studioDocumentsApi } from '@/services/settingsApi';
import { Scissors, CheckSquare, Square } from 'lucide-react';
import { formatToDdMmYyyy } from '@/lib/utils';
import { useStudioBrand } from '../common/useStudioBrand';

const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

// Generate visual Code 128 barcode bars for Plexivia
const BarcodeSVG = ({ value = 'PLX-MR-2026' }) => {
  const normalizedText = value.startsWith('PLX-') ? value : `PLX-${value}`;
  const cleanText = normalizedText.replace(/[^\x20-\x7E]/g, '');
  const startCode = 104;
  let checksum = startCode;
  const bars = [...startCode.toString().split('').map(Number)];

  const encodedBars = [];
  const startPattern = CODE128_PATTERNS[startCode].split('').map(Number);
  encodedBars.push(...startPattern);

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i) - 32;
    checksum += charCode * (i + 1);
    const pattern = (CODE128_PATTERNS[charCode] || '211214').split('').map(Number);
    encodedBars.push(...pattern);
  }

  const checkDigit = checksum % 103;
  encodedBars.push(...CODE128_PATTERNS[checkDigit].split('').map(Number));
  encodedBars.push(...CODE128_PATTERNS[106].split('').map(Number));

  const totalUnits = encodedBars.reduce((a, b) => a + b, 0);
  const width = 170;
  const height = 44;
  const unitWidth = width / (totalUnits + 12);
  let currentX = unitWidth * 6;

  return (
    <div className="flex flex-col items-center">
      <svg className="h-9 w-44" viewBox={`0 0 ${width} ${height}`}>
        <text x={width / 2} y="7" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0D47A1" letterSpacing="1">
          PLEXIVIA BARCODE
        </text>
        {encodedBars.map((unit, idx) => {
          const w = unit * unitWidth;
          const x = currentX;
          currentX += w;
          if (idx % 2 === 0) {
            return (
              <rect
                key={idx}
                x={x.toFixed(2)}
                y="9"
                width={w.toFixed(2)}
                height="24"
                fill="#0B3A60"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="text-[9.5px] font-mono font-bold tracking-widest text-slate-800 -mt-0.5">
        *{normalizedText}*
      </span>
    </div>
  );
};

// Single Voucher Slip Unit Component
export function VoucherSlipCard({ data = {}, copyTitle = 'Original Copy', idSuffix = '' }) {
  const agencyInfo = useStudioBrand();
  const logoImg = agencyInfo.logo;
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

  // QR comes from the backend, encoding the receipt number
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    let active = true;
    setQrDataUrl('');
    const docId = data?.savedDocId;
    if (!docId) return undefined; // QR links to the saved receipt's public page
    studioDocumentsApi
      .qr(docId)
      .then((url) => active && setQrDataUrl(url))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [data?.savedDocId]);

  const formattedAmount = Number(amount || 0).toLocaleString('en-IN');
  const formattedDate = formatToDdMmYyyy(date);

  return (
    <div className="border-2 border-[#1E88E5] rounded-2xl p-4 sm:p-5 bg-white text-slate-900 shadow-sm relative w-full select-none print:shadow-none print:border-[#1E88E5]">
      
      {/* 1. Header Section */}
      <div className="flex items-start justify-between gap-4 pb-2.5">
        {/* Left: Money Receipt chip, Plexivia logo, website & email */}
        <div className="flex flex-col items-start gap-2">
          <span className="inline-block bg-[#0B3A60] text-white text-[11px] font-bold px-3 py-1 rounded-[8px] uppercase tracking-wider">
            Money Receipt
          </span>
          <img src={plexiviaLogo} alt="Plexivia" className="h-11 w-auto object-contain" />
          <div className="text-[10.5px] font-semibold text-slate-600 leading-tight">
            <div>{agencyInfo.website || 'plexivia.com'}</div>
            {agencyInfo.email && <div>{agencyInfo.email}</div>}
          </div>
        </div>

        {/* Right: QR code (generated by the backend from the receipt number) */}
        <div className="flex flex-col items-center gap-1">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR ${receiptNo}`}
              className="w-24 h-24 rounded-[8px] p-1 bg-white border border-slate-300"
              title={`Scan to verify: ${receiptNo}`}
            />
          ) : (
            <div className="w-24 h-24 rounded-[8px] border border-dashed border-slate-300 flex items-center justify-center text-center text-[9px] font-semibold text-slate-400 px-2">QR appears after save</div>
          )}
          <span className="w-24 text-center font-mono text-[11px] font-black tracking-tight text-slate-800">{receiptNo}</span>
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
            Client Name:
          </div>
          <div className="col-span-8 sm:col-span-9 font-bold text-slate-900">
            {clientName || '—'}
          </div>
        </div>

        {/* Row 2: Purpose / Service Head */}
        <div className="grid grid-cols-12 border-b border-[#E2E8F0] px-3.5 py-2 bg-white">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Service / Deliverable:
          </div>
          <div className="col-span-8 sm:col-span-9 font-medium text-slate-900">
            {purpose || '—'}
          </div>
        </div>

        {/* Row 3: Received / Paid By */}
        <div className="grid grid-cols-12 border-b border-[#E2E8F0] px-3.5 py-2">
          <div className="col-span-4 sm:col-span-3 font-bold text-slate-700">
            Received By:
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
          <div className="col-span-8 sm:col-span-9 flex items-center gap-x-4 gap-y-1 flex-wrap">
            <span className="font-bold text-slate-900 text-[11.5px]">{paymentMethod || '—'}</span>
            {data?.transactionId && (
              <span className="text-[11px] text-slate-700">
                TrxID: <span className="font-mono font-semibold text-slate-900">{data.transactionId}</span>
              </span>
            )}
            {data?.transactionAmount !== undefined && data?.transactionAmount !== '' && (
              <span className="text-[11px] text-slate-700">
                Paid: <span className="font-mono font-semibold text-slate-900">BDT {Number(data.transactionAmount || 0).toLocaleString('en-IN')}</span>
              </span>
            )}
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

      {/* 5. Signatures (toggle) or system confirmation */}
      {!data?.showSignatures ? (
        <p className="mt-4 border-t border-dashed border-slate-300 pt-2 text-center text-[10px] font-medium text-slate-500">
          This is a system-generated receipt and does not require a signature. Payment received and confirmed by Plexivia Admin.
        </p>
      ) : (
      <div className="flex justify-end pt-4 mt-4">
        <div className="w-48 text-center text-[10.5px]">
          {data?.signatureImage?.url ? (
            <img src={data.signatureImage.url} alt="Signature" className="h-10 mx-auto object-contain" />
          ) : (
            <div className="h-10" />
          )}
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">{receivedBy || 'Authorized Signature'}</div>
          {receivedByRole && <div className="text-[10px] text-slate-500 font-medium">{receivedByRole}</div>}
        </div>
      </div>
      )}
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
  const isDualPrint = data.dualPrint === true;

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

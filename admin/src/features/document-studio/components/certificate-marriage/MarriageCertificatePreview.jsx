import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Heart } from 'lucide-react';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';

export function MarriageCertificatePreview({ data = {}, onPrint }) {
  const {
    memoNo = 'MC/2026/0001',
    issueDate = new Date().toISOString().split('T')[0],
    marriageDate = '2021-11-20',
    marriagePlace = '',
    volumeNo = 'Vol-IV/2021',
    pageNo = 'Page #48',
    certificateTitle = 'MARRIAGE CERTIFICATE',
    certificateSubtitle = 'OFFICIAL MARITAL STATUS & NIKAHNAMA EXTRACT',
    registrar = {},
    groom = {},
    bride = {},
    marriageTerms = {},
    declaration = {},
  } = data || {};

  const handlePrint = onPrint || (() => {
    printDocument({
      docId: memoNo || data.certificateNo,
      docType: 'Marriage_Certificate',
      clientName: groom.fullName ? `${groom.fullName}_and_${bride.fullName || ''}` : 'Marriage',
      elementId: 'marriage-certificate-canvas',
    });
  });

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Marriage Certificate Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 High-Res Print Ready</span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper */}
      <PrintablePaper id="marriage-certificate-canvas" className="font-serif">
        
        {/* Single Clean Certificate Border Frame */}
        <div className="border-2 border-slate-900 p-6 sm:p-7 flex flex-col justify-between bg-white text-slate-900 flex-1 min-h-[960px] print:min-h-0 print:p-5">
          
          {/* Main Top and Body Content Section */}
          <div className="space-y-3 flex-1">
            
            {/* Header (Registrar / Kazi Office) */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
              {registrar.logoUrl && (
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-slate-900 overflow-hidden p-1">
                    <img src={registrar.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
                {registrar.officeName || 'OFFICE OF THE MUSLIM MARRIAGE REGISTRAR & KAZI'}
              </h1>
              
              <p className="text-[11px] font-semibold text-slate-700 font-sans">
                {registrar.areaJurisdiction}
              </p>

              <p className="text-[10px] text-slate-600 font-sans">
                {registrar.address}
              </p>
              
              <p className="text-[9.5px] text-slate-600 font-sans font-mono">
                {registrar.phone && `Tel: ${registrar.phone}`} {registrar.licenseNo && ` | Govt. License No: ${registrar.licenseNo}`}
              </p>
            </div>

            {/* Registry Details & Date Row */}
            <div className="flex justify-between items-center text-[11px] font-bold font-sans text-slate-800 border-b border-slate-300 pb-1.5">
              <div>Ref / Memo: <span className="font-mono underline">{memoNo}</span> | Reg Vol: <span className="font-mono">{volumeNo}</span>, {pageNo}</div>
              <div>Issue Date: <span className="font-mono underline">{formatToDdMmYyyy(issueDate)}</span></div>
            </div>

            {/* Certificate Title Badge */}
            <div className="text-center my-1">
              <div className="inline-block border-2 border-slate-900 px-5 py-1 rounded-xs bg-slate-50 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 font-sans flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-slate-900 fill-slate-900" />
                  {certificateTitle || 'MARRIAGE CERTIFICATE'}
                  <Heart className="w-4 h-4 text-slate-900 fill-slate-900" />
                </h2>
              </div>
              {certificateSubtitle && (
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-sans mt-0.5">
                  {certificateSubtitle}
                </p>
              )}
            </div>

            {/* Solemnization Info */}
            <div className="text-center text-xs font-sans text-slate-800 bg-slate-50 border border-slate-300 py-1 px-2 rounded-xs">
              This is to certify that the marriage was solemnized on <strong className="font-mono">{formatToDdMmYyyy(marriageDate)}</strong> at <strong>{marriagePlace || 'Residence'}</strong>.
            </div>

            {/* Groom & Bride Grid Comparison */}
            <div className="grid grid-cols-2 gap-3 my-2 font-sans">
              
              {/* Groom Box */}
              <div className="border border-slate-300 bg-slate-50 p-2.5 rounded-xs space-y-1 text-xs">
                <div className="border-b border-slate-300 pb-1 font-bold uppercase text-[10px] tracking-wide text-slate-900">
                  Groom's Particulars
                </div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Full Name:</span><strong className="text-slate-900 text-xs uppercase">{groom.name}</strong></div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Father's Name:</span><span className="text-slate-800">{groom.fatherName}</span></div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Mother's Name:</span><span className="text-slate-800">{groom.motherName}</span></div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div><span className="text-[9px] text-slate-500 block uppercase">NID / Passport:</span><span className="font-mono font-semibold">{groom.nidPassport || 'N/A'}</span></div>
                  <div><span className="text-[9px] text-slate-500 block uppercase">DOB / Age:</span><span className="font-mono">{formatToDdMmYyyy(groom.dob)} ({groom.age || '—'} Yrs)</span></div>
                </div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Address:</span><span className="text-slate-700 text-[10.5px] leading-tight">{groom.address}</span></div>
              </div>

              {/* Bride Box */}
              <div className="border border-slate-300 bg-slate-50 p-2.5 rounded-xs space-y-1 text-xs">
                <div className="border-b border-slate-300 pb-1 font-bold uppercase text-[10px] tracking-wide text-slate-900">
                  Bride's Particulars
                </div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Full Name:</span><strong className="text-slate-900 text-xs uppercase">{bride.name}</strong></div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Father's Name:</span><span className="text-slate-800">{bride.fatherName}</span></div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Mother's Name:</span><span className="text-slate-800">{bride.motherName}</span></div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div><span className="text-[9px] text-slate-500 block uppercase">NID / Passport:</span><span className="font-mono font-semibold">{bride.nidPassport || 'N/A'}</span></div>
                  <div><span className="text-[9px] text-slate-500 block uppercase">DOB / Age:</span><span className="font-mono">{formatToDdMmYyyy(bride.dob)} ({bride.age || '—'} Yrs)</span></div>
                </div>
                <div><span className="text-[10px] text-slate-500 block uppercase">Address:</span><span className="text-slate-700 text-[10.5px] leading-tight">{bride.address}</span></div>
              </div>

            </div>

            {/* Dower / Mahr & Terms */}
            <div className="border border-slate-300 bg-slate-50 p-2 rounded-xs text-xs font-sans">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Total Dower (Mahr):</span>
                  <strong className="font-mono text-slate-900">{marriageTerms.dowerTotal || 'BDT 5,00,000/-'}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Prompt / Paid Mahr:</span>
                  <strong className="font-mono text-emerald-700">{marriageTerms.dowerPaid || 'BDT 2,00,000/-'}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Deferred / Due Mahr:</span>
                  <strong className="font-mono text-slate-800">{marriageTerms.dowerDeferred || 'BDT 3,00,000/-'}</strong>
                </div>
              </div>
            </div>

            {/* Official Declaration */}
            <div className="space-y-1.5 text-xs text-slate-900 leading-relaxed text-justify px-1 font-serif">
              <p className="indent-4">
                {declaration.statement || `This is to solemnly certify that the marriage between ${groom.name} and ${bride.name} was solemnized and duly registered in accordance with the law.`}
              </p>
              <p>
                {declaration.livingStatus || 'They have been living together peacefully as lawfully wedded husband and wife without any legal impediment or dispute.'}
              </p>
            </div>

          </div>

          {/* Signatures Section - Pinned strictly to bottom via mt-auto */}
          <div className="mt-auto pt-4 border-t-2 border-slate-900 font-sans print:break-inside-avoid page-break-inside-avoid">
            <div className="grid grid-cols-2 gap-6 items-end">
              
              {/* Groom & Bride Signatures */}
              <div className="text-left space-y-4">
                <div className="border-t border-slate-700 pt-1 w-48">
                  <p className="text-[10px] font-bold uppercase text-slate-900">Signature of Groom</p>
                </div>
                <div className="border-t border-slate-700 pt-1 w-48">
                  <p className="text-[10px] font-bold uppercase text-slate-900">Signature of Bride</p>
                </div>
              </div>

              {/* Kazi / Registrar Signature */}
              <div className="text-right space-y-1">
                <div className="h-10 flex items-end justify-end">
                  <span className="text-xs text-slate-400 font-serif italic mr-2">Official Registrar</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-1 ml-auto w-56">
                  <p className="text-[11px] font-black uppercase text-slate-900">
                    {registrar.kaziName || 'MARRIAGE REGISTRAR & KAZI'}
                  </p>
                  <p className="text-[9px] text-slate-600">
                    Government Licensed Muslim Marriage Registrar
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </PrintablePaper>

    </div>
  );
}

import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export function CertificatePreview({ data, onPrint }) {
  const { memoNo, issueDate, language, client, conduct, authority } = data;

  const isBn = language === 'bn';

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar (hidden during print) */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Official Certificate Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-certificate-canvas">
        
        {/* Double Border Frame for Official Look */}
        <div className="border-4 border-slate-900 p-6 sm:p-8 min-h-[1000px] flex flex-col justify-between relative bg-white">
          <div className="border-2 border-slate-700 p-6 sm:p-8 h-full flex flex-col justify-between space-y-8">
            
            {/* Header / Crest */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-slate-900 overflow-hidden p-1">
                  <img src={logoImg} alt="Organization Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900">
                {authority.organizationName}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                {authority.organizationSubtitle}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                {authority.officeAddress}
              </p>
            </div>

            {/* Memo & Date Row */}
            <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-800 border-b border-slate-300 pb-2">
              <div>Ref No: <span className="underline">{memoNo}</span></div>
              <div>Date: <span className="underline">{issueDate}</span></div>
            </div>

            {/* Certificate Title */}
            <div className="text-center py-2">
              <div className="inline-block border-2 border-slate-900 px-8 py-2 rounded-md bg-slate-50">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900">
                  {isBn ? 'Character Certificate & Testimonial' : 'CHARACTER CERTIFICATE'}
                </h2>
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-900 text-justify px-2 sm:px-4">
              {isBn ? (
                <>
                  <p>
                    This is to certify that <strong>{client.fullName}</strong>, 
                    Son/Daughter of: <strong>{client.fatherName}</strong>, 
                    Mother: <strong>{client.motherName}</strong>, 
                    Village / Area: <strong>{client.village}</strong>, 
                    Post Office: <strong>{client.postOffice}</strong>, 
                    Upazila / Police Station: <strong>{client.upazila}</strong>, 
                    District: <strong>{client.district}</strong>। 
                    {client.passportNo && <>Passport Number: <strong className="font-mono">{client.passportNo}</strong>, </>}
                    {client.nidNo && <>National ID No: <strong className="font-mono">{client.nidNo}</strong>।</>}
                  </p>

                  <p>
                    He/She is known to me personally for the last <strong>{conduct.durationYears}</strong> years. {conduct.statementEn}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    This is to certify that <strong>{client.fullNameEn || client.fullName}</strong>, 
                    Son/Daughter of <strong>{client.fatherName}</strong> and <strong>{client.motherName}</strong>, 
                    resident of Village: <strong>{client.village}</strong>, Post Office: <strong>{client.postOffice}</strong>, 
                    Upazila: <strong>{client.upazila}</strong>, District: <strong>{client.district}</strong>. 
                    {client.passportNo && <>Passport No: <strong className="font-mono">{client.passportNo}</strong>, </>}
                    {client.nidNo && <>NID No: <strong className="font-mono">{client.nidNo}</strong>.</>}
                  </p>

                  <p>
                    He/She has been known to me for the last <strong>{conduct.durationYears}</strong> years. {conduct.statementEn}
                  </p>
                </>
              )}
            </div>

            {/* Seal & Signature Section */}
            <div className="pt-12 grid grid-cols-2 gap-8 items-end text-xs font-semibold text-slate-900">
              
              {/* Seal Placeholder */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  [ Official Seal ]
                </div>
                <div className="text-[11px] text-slate-600">Official Seal</div>
              </div>

              {/* Signature Line */}
              <div className="text-center space-y-1">
                <div className="border-b-2 border-slate-900 w-48 mx-auto mb-2"></div>
                <div className="font-bold text-sm">{authority.issuingPersonName}</div>
                <div className="text-slate-700">{authority.designation}</div>
                <div className="text-[11px] text-slate-600">{authority.organizationName}</div>
              </div>

            </div>

          </div>
        </div>

      </PrintablePaper>
    </div>
  );
}

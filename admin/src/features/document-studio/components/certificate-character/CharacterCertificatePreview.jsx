import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer } from 'lucide-react';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';

export function CharacterCertificatePreview({ data = {}, onPrint }) {
  const {
    memoNo = 'CC/2026/0001',
    issueDate = new Date().toISOString().split('T')[0],
    certificateTitle = 'CHARACTER CERTIFICATE',
    certificateSubtitle = 'TO WHOM IT MAY CONCERN',
    authority = {},
    applicant = {},
    conduct = {},
    signatory = {},
  } = data || {};

  const handlePrint = onPrint || (() => {
    printDocument({
      docId: memoNo || data.certificateNo,
      docType: 'Character_Certificate',
      clientName: applicant.fullName || data.candidateName,
      elementId: 'character-certificate-canvas',
    });
  });

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Character Certificate Canvas</span>
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
      <PrintablePaper id="character-certificate-canvas" className="font-serif">
        
        {/* Single Clean Certificate Border Frame */}
        <div className="border-2 border-slate-900 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-900 flex-1 min-h-[960px] print:min-h-0 print:p-5">
          
          {/* Main Top and Body Content Section */}
          <div className="space-y-4 flex-1">
            
            {/* Header (Fully Customizable) */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              {authority.logoUrl && (
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-slate-900 overflow-hidden p-1">
                    <img src={authority.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-sans">
                {authority.organizationName || 'OFFICE OF THE ISSUING AUTHORITY'}
              </h1>
              
              {authority.subHeader && (
                <p className="text-xs font-semibold text-slate-700 font-sans tracking-wide">
                  {authority.subHeader}
                </p>
              )}

              <p className="text-[11px] text-slate-600 font-sans">
                {authority.address}
              </p>
              
              <p className="text-[10px] text-slate-600 font-sans font-mono">
                {authority.phone && `Phone: ${authority.phone}`} {authority.email && ` | Email: ${authority.email}`} {authority.website && ` | Web: ${authority.website}`}
              </p>
            </div>

            {/* Memo No & Date Row */}
            <div className="flex justify-between items-center text-xs font-bold font-sans text-slate-800 border-b border-slate-300 pb-2">
              <div>Memo / Ref No: <span className="font-mono underline">{memoNo}</span></div>
              <div>Date: <span className="font-mono underline">{formatToDdMmYyyy(issueDate)}</span></div>
            </div>

            {/* Certificate Title Badge */}
            <div className="text-center my-2">
              <div className="inline-block border-2 border-slate-900 px-6 py-1.5 rounded-xs bg-slate-50 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 font-sans">
                  {certificateTitle || 'CHARACTER CERTIFICATE'}
                </h2>
              </div>
              {certificateSubtitle && (
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans mt-1">
                  {certificateSubtitle}
                </p>
              )}
            </div>

            {/* Main Certificate Content / Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed text-justify px-2 font-serif">
              
              {/* Certification Statement */}
              <p className="indent-6">
                {conduct.knownStatement || `This is to certify that ${applicant.fullName}, Son of ${applicant.fatherName} and ${applicant.motherName}, resident of Village: ${applicant.village || '—'}, Post: ${applicant.postOffice || '—'}, Thana/Upazila: ${applicant.upazila || '—'}, District: ${applicant.district || '—'}, is personally known to me for the last ${conduct.knownDurationYears || 'many'} years.`}
              </p>

              {/* Applicant Details Info Box */}
              <div className="my-3 p-3.5 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Applicant Name:</span>
                    <strong className="text-slate-900 uppercase font-bold">{applicant.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Father's Name:</span>
                    <strong className="text-slate-900 font-bold">{applicant.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Mother's Name:</span>
                    <strong className="text-slate-900 font-bold">{applicant.motherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">National ID / Birth Cert:</span>
                    <strong className="text-slate-900 font-mono font-bold">{applicant.nidNo || applicant.birthCertNo || 'N/A'}</strong>
                  </div>
                  {applicant.passportNo && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Passport No:</span>
                      <strong className="text-slate-900 font-mono uppercase">{applicant.passportNo}</strong>
                    </div>
                  )}
                  {applicant.occupation && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Occupation:</span>
                      <strong className="text-slate-900">{applicant.occupation}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Praise & Conduct Assessment */}
              <p>
                {conduct.characterPraise || 'To the best of my knowledge and official verification, he bears good moral character, honesty, and peaceful disposition. He has not been involved in any anti-social or criminal activities against the law of the land.'}
              </p>

              <p>
                {conduct.recommendation || 'I recommend him for employment, visa processing, travel, or official administrative purposes, and wish him all success in his future life.'}
              </p>

            </div>

          </div>

          {/* Signatures Section - Pinned strictly to bottom via mt-auto */}
          <div className="mt-auto pt-6 border-t-2 border-slate-900 font-sans print:break-inside-avoid page-break-inside-avoid">
            <div className="grid grid-cols-2 items-end">
              
              <div>
                <p className="text-[10px] text-slate-500 italic">
                  This certificate is issued upon verification of official records and character antecedents.
                </p>
              </div>

              <div className="text-right space-y-1">
                <div className="h-12 flex items-end justify-end">
                  <span className="text-xs text-slate-400 font-serif italic mr-4">Authorized Signature &amp; Stamp</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-1 ml-auto w-64">
                  <p className="text-xs font-black uppercase text-slate-900 tracking-wide">
                    {signatory.name || 'AUTHORIZED SIGNATORY'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {signatory.designation || 'Issuing Authority'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {authority.organizationName}
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

import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer } from 'lucide-react';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';

export function ExperienceCertificatePreview({ data = {}, onPrint }) {
  const {
    memoNo = 'EXP/2026/0001',
    issueDate = new Date().toISOString().split('T')[0],
    certificateTitle = 'TO WHOM IT MAY CONCERN',
    certificateSubtitle = 'EXPERIENCE & SERVICE CERTIFICATE',
    company = {},
    employee = {},
    content = {},
    signatory = {},
  } = data || {};

  const handlePrint = onPrint || (() => {
    printDocument({
      docId: memoNo || data.certificateNo,
      docType: 'Experience_Certificate',
      clientName: employee.fullName || data.employeeName,
      elementId: 'experience-certificate-canvas',
    });
  });

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Experience Certificate Canvas</span>
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
      <PrintablePaper id="experience-certificate-canvas" className="font-serif">
        
        {/* Single Clean Certificate Border Frame */}
        <div className="border-2 border-slate-900 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-900 flex-1 min-h-[960px] print:min-h-0 print:p-5">
          
          {/* Main Top and Body Content Section */}
          <div className="space-y-4 flex-1">
            
            {/* Top Company Header (Customizable) */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              
              {company.logoUrl && (
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-slate-900 overflow-hidden p-1">
                    <img src={company.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-sans">
                {company.name || 'COMPANY NAME'}
              </h1>
              
              {company.subtitle && (
                <p className="text-xs font-semibold text-slate-700 font-sans tracking-wide">
                  {company.subtitle}
                </p>
              )}

              <p className="text-[11px] text-slate-600 font-sans">
                {company.address}
              </p>
              
              <p className="text-[10px] text-slate-600 font-sans font-mono">
                {company.phone && `Tel: ${company.phone}`} {company.email && ` | Email: ${company.email}`} {company.website && ` | Web: ${company.website}`}
              </p>
              
              {company.registrationNo && (
                <p className="text-[10px] text-slate-500 font-sans font-mono tracking-wider">
                  Govt. Reg / Trade License No: {company.registrationNo}
                </p>
              )}
            </div>

            {/* Memo No & Date Row */}
            <div className="flex justify-between items-center text-xs font-bold font-sans text-slate-800 border-b border-slate-300 pb-2">
              <div>Ref / Memo No: <span className="font-mono underline">{memoNo}</span></div>
              <div>Date: <span className="font-mono underline">{formatToDdMmYyyy(issueDate)}</span></div>
            </div>

            {/* Certificate Title Badge */}
            <div className="text-center my-2">
              <div className="inline-block border-2 border-slate-900 px-6 py-1.5 rounded-xs bg-slate-50 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 font-sans">
                  {certificateTitle || 'TO WHOM IT MAY CONCERN'}
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
              
              {/* Primary Certification Statement */}
              <p className="indent-6">
                {content.statement || `This is to certify that ${employee.fullName}, Son of ${employee.fatherName}, bearing Passport No: ${employee.passportNo || 'N/A'}, was an employee of our company.`}
              </p>

              {/* Job Specification Box */}
              <div className="my-3 p-3.5 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Employee Name:</span>
                    <strong className="text-slate-900 uppercase font-bold">{employee.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Designation / Job Title:</span>
                    <strong className="text-slate-900 font-bold">{employee.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Passport / NID No:</span>
                    <strong className="text-slate-900 font-mono font-bold uppercase">{employee.passportNo || employee.nidNo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Service Period:</span>
                    <strong className="text-slate-900 font-mono">{formatToDdMmYyyy(employee.startDate)} to {employee.endDate ? formatToDdMmYyyy(employee.endDate) : 'Present'}</strong>
                  </div>
                  {employee.totalDuration && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Total Experience:</span>
                      <strong className="text-slate-900">{employee.totalDuration}</strong>
                    </div>
                  )}
                  {employee.department && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Department:</span>
                      <strong className="text-slate-900">{employee.department}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Responsibilities */}
              {content.dutiesResponsibilities && (
                <p>
                  <strong>Core Duties &amp; Competencies:</strong> {content.dutiesResponsibilities}
                </p>
              )}

              {/* Conduct & Relieving Statement */}
              <p>
                {content.conductReview || 'During his period of employment, he demonstrated exemplary dedication, good moral conduct, and high integrity. We wish him all the best in his future career endeavors.'}
              </p>

            </div>

          </div>

          {/* Bottom Signatures Section - Pinned strictly to bottom via mt-auto */}
          <div className="mt-auto pt-6 border-t-2 border-slate-900 font-sans print:break-inside-avoid page-break-inside-avoid">
            <div className="grid grid-cols-2 items-end">
              
              <div>
                <p className="text-[10px] text-slate-500 italic">
                  This official certificate of experience is issued without any prejudice or liability to the organization.
                </p>
              </div>

              {/* Authorized Signatory */}
              <div className="text-right space-y-1">
                <div className="h-12 flex items-end justify-end">
                  <span className="text-xs text-slate-400 font-serif italic mr-4">Authorized Signature &amp; Stamp</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-1 ml-auto w-64">
                  <p className="text-xs font-black uppercase text-slate-900 tracking-wide">
                    {signatory.name || 'AUTHORIZED SIGNATORY'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {signatory.designation || 'Head of Human Resources'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {company.name}
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

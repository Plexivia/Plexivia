import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { FileCheck, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy } from '@/lib/utils';

export function IndianVisaPreview({ data, onPrint }) {
  const {
    trackingNo,
    submissionDate,
    agencyInfo = {},
    applicantName,
    passportNo,
    nidBirthCertNo,
    applicantPhone,
    applicantEmail,
    address,
    visaType,
    entryPort,
    durationMonths,
    entryType,
    documentsProvided = {},
    remarks,
  } = data;

  const checklistItems = [
    { id: 'passportOriginal', label: 'Original Passport (Minimum 6 Months Validity)' },
    { id: 'nidCopy', label: 'National ID Card (NID) / Birth Certificate Copy' },
    { id: 'photoLabPrint', label: '2x2 Inch Lab Print Photo (White Background)' },
    { id: 'bankSolvency', label: 'Bank Statement / International Dollar Endorsement' },
    { id: 'utilityBillCopy', label: 'Utility Bill Copy (Electricity / Gas / Water)' },
    { id: 'previousVisaCopy', label: 'Previous Indian Visa Copy' },
    { id: 'nocTradeLicense', label: 'NOC / Trade License / Student ID' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <PrintablePaper id="printable-indian-visa-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 min-h-[960px] print:min-h-0 print:h-auto">
          
          <div className="space-y-4 flex-1">
            {/* Header Section */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-sm shrink-0 overflow-hidden">
                  <img src={logoImg} alt="Plexivia Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {agencyInfo.name || 'PLEXIVIA'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {agencyInfo.tagline || 'Your Trusted Travel Partner'}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    Office: {agencyInfo.address || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'} | Cell: {agencyInfo.phone || '+8801345579534'}
                  </p>
                </div>
              </div>
              
              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="font-bold text-slate-900">Ref #: <span className="text-emerald-700">{trackingNo || 'IVISA-0000'}</span></div>
                <div className="text-slate-600 text-[11px]">Date: {formatToDdMmYyyy(submissionDate) || 'N/A'}</div>
              </div>
            </div>

            {/* Title Banner */}
            <div className="bg-slate-900 text-white py-2 px-4 rounded-md text-center shadow-sm">
              <h2 className="text-base font-extrabold tracking-wider uppercase flex items-center justify-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                INDIAN VISA APPLICATION ACKNOWLEDGEMENT
              </h2>
              <p className="text-[11px] font-semibold text-emerald-300">
                Indian Visa Application & Submission Receipt
              </p>
            </div>

            {/* SECTION 1: APPLICANT INFORMATION */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                <UserCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  1. Applicant Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Applicant Full Name</span>
                  <span className="font-bold text-sm text-slate-900">{applicantName || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Passport Number (Passport No.)</span>
                  <span className="font-mono font-bold text-sm text-emerald-800">{passportNo || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NID / Birth Certificate No</span>
                  <span className="font-mono font-bold text-slate-900">{nidBirthCertNo || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Mobile Phone Number</span>
                  <span className="font-mono font-bold text-slate-900">{applicantPhone || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Address</span>
                  <span className="font-semibold text-slate-800">{applicantEmail || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Address</span>
                  <span className="font-medium text-slate-800">{address || '—'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: VISA SPECIFICATIONS */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                <FileCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  2. Visa Category & Port Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300">
                <div><strong className="text-slate-600">Visa Type:</strong> <span className="font-bold text-slate-900">{visaType}</span></div>
                <div><strong className="text-slate-600">Entry Port:</strong> <span className="font-bold text-slate-900">{entryPort}</span></div>
                <div><strong className="text-slate-600">Validity Duration:</strong> <span>{durationMonths}</span></div>
                <div><strong className="text-slate-600">Entry Mode:</strong> <span className="font-bold text-emerald-700">{entryType}</span></div>
              </div>
            </div>

            {/* SECTION 3: CHECKLIST OF RECEIVED DOCUMENTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  3. Submitted Documents Checklist
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border border-slate-900 rounded p-3 bg-white">
                {checklistItems.map(item => {
                  const isProvided = Boolean(documentsProvided[item.id]);
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      {isProvided ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`font-medium ${isProvided ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {remarks && (
              <div className="p-2.5 border border-slate-300 bg-slate-50 rounded text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase">Remarks / Notes:</span>
                <p className="text-slate-800 mt-0.5">{remarks}</p>
              </div>
            )}

          </div>

          {/* Footer Signatures Pushed to Bottom via mt-auto */}
          <div className="mt-auto pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs print:break-inside-avoid page-break-inside-avoid">
            <div></div>

            <div className="text-center space-y-1">
              <div className="border-b-2 border-slate-900 w-44 mx-auto mb-1"></div>
              <div className="font-bold text-xs text-slate-900">{agencyInfo.name || 'PLEXIVIA'}</div>
              <div className="text-slate-600 text-[10px]">Authorized Visa Processing Officer</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}

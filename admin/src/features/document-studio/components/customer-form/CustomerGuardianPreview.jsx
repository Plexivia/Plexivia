import React, { useState } from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { formatToDdMmYyyy } from '@/lib/utils';
import { STATUS_OPTIONS } from './sampleData';
import { Paperclip, FileText, Download, Eye, X, Image as ImageIcon, Camera, CreditCard, FileCheck } from 'lucide-react';

export function ClientGuardianPreview({ data }) {
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  const {
    applicationNo,
    dateReceived,
    verifiedBy,
    serviceType,
    status = 'received',
    client = {},
    guardian = {},
    requirementDocuments = [],
    payment = {},
    attachments = {},
    officeNotes,
    declarationDate
  } = data;

  const currentStatusObj = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];

  return (
    <div className="w-full flex flex-col items-center select-none space-y-6">
      <PrintablePaper id="customer-guardian-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 font-sans min-h-[990px] print:min-h-0 print:h-auto">
          
          <div className="space-y-3">
            {/* Top Bar with Tracking & Service Type in preview */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 text-[11px] font-mono text-slate-600">
              <div>
                <span className="font-bold text-slate-900">Application #:</span>{' '}
                <span className="font-bold text-[#103058]">{applicationNo || 'CGA-000000'}</span>
              </div>
              <div className="font-semibold text-slate-800">
                Service: <span className="text-[#103058] font-bold">{serviceType || 'Indian Visa'}</span>
              </div>
              <div>
                Date: <span className="font-bold">{formatToDdMmYyyy(dateReceived) || '—'}</span>
              </div>
            </div>

            {/* Main Form Header with Photo Box */}
            <div className="flex items-center justify-between gap-4 pt-1 pb-1">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-[18px] sm:text-[19px] font-[900] uppercase tracking-wide text-slate-950 font-sans leading-tight">
                  CUSTOMER &amp; GUARDIAN INFORMATION APPLICATION FORM
                </h1>
                <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">
                  Please complete all applicable information accurately and submit the required supporting documents.
                </p>
              </div>

              {/* Photo Box in Top Right */}
              <div className="w-20 h-24 border-2 border-dashed border-slate-400 rounded-sm bg-slate-50 flex flex-col items-center justify-center shrink-0 overflow-hidden text-center p-1 relative">
                {attachments?.passportPhoto ? (
                  <img
                    src={attachments.passportPhoto}
                    alt="Applicant Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-0.5">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-bold uppercase leading-tight">2 × 2 Inch Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* 1. CUSTOMER DETAILS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>1. CUSTOMER DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">APPLICANT INFORMATION</span>
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Full Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-bold text-[11.5px] text-slate-900 uppercase truncate">
                    {client.fullName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    NID Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-mono font-bold text-[11.5px] text-slate-900">
                    {client.nidNumber || ''}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Passport Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900 uppercase">
                    {client.passportNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800 leading-tight">
                    Country previously applied to and rejected by:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 truncate">
                    {client.countryRejected || 'N/A'}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Father Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {client.fatherName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mother Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {client.motherName || ''}
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mobile Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900">
                    {client.mobileNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Email:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-medium text-[11px] text-slate-900 truncate">
                    {client.email || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GUARDIAN DETAILS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>2. GUARDIAN DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">EMERGENCY &amp; LEGAL GUARDIAN</span>
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Guardian Full Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-bold text-[11.5px] text-slate-900 uppercase truncate">
                    {guardian.fullName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    NID Card Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-mono font-bold text-[11.5px] text-slate-900">
                    {guardian.nidNumber || ''}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Father Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {guardian.fatherName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mother Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {guardian.motherName || ''}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mobile Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900">
                    {guardian.mobileNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Email:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-medium text-[11px] text-slate-900 truncate">
                    {guardian.email || ''}
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Address:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-medium text-[10.5px] text-slate-900 leading-tight">
                    {guardian.address || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800 leading-tight">
                    Relationship with Client:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-bold text-[11.5px] text-slate-900">
                    {guardian.relationship || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CUSTOMER REQUIREMENT DOCUMENTS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
                3. CUSTOMER REQUIREMENT DOCUMENTS
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-[#d7e5f3] font-bold text-slate-900 border-b border-slate-400 min-h-[27px] items-center text-[11px]">
                  <div className="col-span-1 text-center border-r border-slate-300 py-1 font-bold">No.</div>
                  <div className="col-span-6 px-3 border-r border-slate-300 py-1 font-bold">Required Document</div>
                  <div className="col-span-2 text-center border-r border-slate-300 py-1 font-bold">Submitted</div>
                  <div className="col-span-3 px-3 py-1 font-bold">Remarks</div>
                </div>

                {/* Table Rows */}
                {requirementDocuments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className={`grid grid-cols-12 items-stretch min-h-[24px] text-[11px] ${
                      idx !== requirementDocuments.length - 1 ? 'border-b border-slate-300' : ''
                    } ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <div className="col-span-1 text-center font-medium border-r border-slate-300 py-0.5 flex items-center justify-center text-slate-700">
                      {doc.id || idx + 1}
                    </div>
                    <div className="col-span-6 px-3 border-r border-slate-300 py-0.5 flex items-center font-semibold text-slate-900">
                      {doc.name}
                    </div>
                    <div className="col-span-2 text-center border-r border-slate-300 py-0.5 flex items-center justify-center font-bold text-slate-900">
                      {doc.submitted || ''}
                    </div>
                    <div className="col-span-3 px-3 py-0.5 flex items-center text-slate-700 font-medium text-[10.5px]">
                      {doc.remarks || ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ADVANCE PAYMENT & RECEIPT SECTION */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>4. SERVICE FEE &amp; ADVANCE PAYMENT DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">PAYMENT ACKNOWLEDGEMENT</span>
              </div>
              <div className="border border-slate-400 text-xs bg-slate-50/30">
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[28px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Total Agreed Fee:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center border-r border-slate-300 font-bold font-mono text-[11.5px] text-slate-900">
                    BDT  {Number(payment.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-3 bg-emerald-50/80 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-emerald-900">
                    Advance Paid:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center font-mono font-black text-[12px] text-emerald-700">
                    BDT  {Number(payment.advancePaid || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-[28px] items-stretch">
                  <div className="col-span-3 bg-rose-50/80 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-rose-900">
                    Due Amount Balance:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center border-r border-slate-300 font-mono font-black text-[12px] text-rose-600">
                    BDT  {Number(payment.dueAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Payment Method:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center font-medium text-[11px] text-slate-900">
                    {payment.paymentMethod || 'Cash'} {payment.receiptNo ? `(${payment.receiptNo})` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. DECLARATION */}
            <div className="space-y-1.5 pt-0.5">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
                5. DECLARATION
              </div>
              <p className="text-[10px] text-slate-800 leading-snug text-justify px-1">
                I hereby declare that the information provided in this application form is true, complete and correct to the best of my knowledge. I understand that the submitted documents may be verified for official processing and that any false or misleading information may affect the application.
              </p>

              {/* Signature Block */}
              <div className="grid grid-cols-3 gap-6 pt-5 pb-1 text-center text-[11px]">
                <div>
                  <p className="font-bold text-slate-900 mb-5">Client Signature</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-5">Guardian Signature</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-5">Authorized Officer</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Office Use Only Bar */}
          <div className="pt-2 border-t border-slate-300 text-[10px] font-mono flex flex-wrap items-center justify-between text-slate-700">
            <div>
              <span className="font-bold uppercase text-slate-900">OFFICE USE ONLY</span> Application No.:{' '}
              <span className="font-bold text-slate-900">{applicationNo || '______________'}</span>
            </div>
            <div>
              Date Received:{' '}
              <span className="font-bold text-slate-900">{formatToDdMmYyyy(dateReceived) || '______________'}</span>
            </div>
            <div>
              Status:{' '}
              <span className="font-bold text-[#103058] uppercase">
                {currentStatusObj?.label?.split('(')[0] || 'RECEIVED'}
              </span>
            </div>
            <div>
              Verified By:{' '}
              <span className="font-bold text-slate-900">{verifiedBy || '______________'}</span>
            </div>
          </div>

        </div>
      </PrintablePaper>

      {/* On-Screen Attached Documents Viewer Gallery (No-print) */}
      <div className="no-print w-full max-w-[850px] bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            <span>Attached Documents & Scans</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {attachments?.passportPhoto || attachments?.passportScan || attachments?.nidScan || (attachments?.otherFiles || []).length > 0
              ? 'Click to view or download document'
              : 'No files attached'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Photo */}
          {attachments?.passportPhoto && (
            <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={attachments.passportPhoto}
                  alt="Photo"
                  className="w-10 h-12 object-cover rounded border border-border shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">Passport Photo</p>
                  <p className="text-[10px] text-muted-foreground">2 × 2 Inch Picture</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewDoc({ title: 'Passport Size Photo', url: attachments.passportPhoto })}
                className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold cursor-pointer"
                title="View Full"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Passport Scan */}
          {attachments?.passportScan && (
            <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-12 bg-emerald-500/10 text-emerald-600 rounded flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">Passport Scan</p>
                  <p className="text-[10px] text-muted-foreground">Main Info Page</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewDoc({ title: 'Passport Scan Copy', url: attachments.passportScan })}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold cursor-pointer"
                title="View Full"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* NID Scan */}
          {attachments?.nidScan && (
            <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-12 bg-purple-500/10 text-purple-600 rounded flex items-center justify-center shrink-0 border border-purple-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">NID Scan Copy</p>
                  <p className="text-[10px] text-muted-foreground">National ID Card</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewDoc({ title: 'NID Scan Copy', url: attachments.nidScan })}
                className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 rounded-lg text-xs font-semibold cursor-pointer"
                title="View Full"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Other Files */}
        {(attachments?.otherFiles || []).length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-foreground">Other Attached Documents:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.otherFiles.map((of, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/20 border border-border rounded-lg text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                    <span className="font-medium text-foreground truncate">{of.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewDoc({ title: of.name, url: of.fileData })}
                      className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={of.fileData}
                      download={of.name}
                      className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attachment Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <span>{selectedPreviewDoc.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewDoc.url}
                  download={selectedPreviewDoc.title}
                  className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/20 rounded-xl p-3 min-h-[300px]">
              {selectedPreviewDoc.url?.startsWith('data:image') || selectedPreviewDoc.url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={selectedPreviewDoc.url}
                  alt={selectedPreviewDoc.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              ) : selectedPreviewDoc.url?.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedPreviewDoc.url}
                  title={selectedPreviewDoc.title}
                  className="w-full h-[65vh] rounded-lg border border-border"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">{selectedPreviewDoc.title}</p>
                  <a
                    href={selectedPreviewDoc.url}
                    download={selectedPreviewDoc.title}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download & View Attachment</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ClientGuardianPreview as CustomerGuardianPreview };
export default ClientGuardianPreview;


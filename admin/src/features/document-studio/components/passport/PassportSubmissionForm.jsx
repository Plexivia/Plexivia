import React, { useState } from 'react';
import { RotateCcw, Eye, ShieldCheck, UserCheck, FileCheck, PhoneCall, Sparkles } from 'lucide-react';
import { generateUniquePassportTrackingNo } from './sampleData';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { toast } from 'sonner';

export function PassportSubmissionForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
  const [detectedMatch, setDetectedMatch] = useState(null);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    onChange({
      ...data,
      clientId: c._id,
      clientDid: c.did,
      linkedCaseId: detectedMatch.caseFile?._id || null,
      linkedCaseDid: detectedMatch.caseFile?.did || null,
      applicantName: c.fullName || data.applicantName,
      applicantPhone: c.phone || data.applicantPhone,
      applicantEmail: c.email || data.applicantEmail,
      previousPassportNo: c.passportNumber || data.previousPassportNo,
      nidBirthCertNo: c.nidNumber || data.nidBirthCertNo,
      address: c.presentAddress || c.address || data.address,
    });
    toast.success(`"${c.fullName}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange({ ...data, applicantPhone: '' });
    resetLookup(val);
    toast.info('Please enter a different phone number.');
    setDetectedMatch(null);
  };

  const handleChecklistChange = (key, checked) => {
    onChange({
      ...data,
      documentsProvided: {
        ...data.documentsProvided,
        [key]: checked,
      },
    });
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const phone = data.applicantPhone || '';
    if (phone) {
      const check = validateBdPhone(phone);
      if (!check.isValid) {
        toast.error(`Applicant Phone: ${check.error}`);
        return;
      }
    }
    const gPhone = data.guardianPhone || '';
    if (gPhone) {
      const check = validateBdPhone(gPhone);
      if (!check.isValid) {
        toast.error(`Guardian Phone: ${check.error}`);
        return;
      }
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-6 text-sm shadow-xs">
        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground text-xs mb-1.5">Submission Date</label>
            <DatePicker
              value={data.submissionDate}
              onChange={(val) => onChange({ ...data, submissionDate: val })}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground text-xs mb-1.5">Passport Type</label>
            <select
              value={data.passportType}
              onChange={(e) => onChange({ ...data, passportType: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="E-Passport (Electronic Passport)">E-Passport (Electronic Passport)</option>
              <option value="MRP (Machine Readable Passport)">MRP (Machine Readable Passport)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground text-xs mb-1.5">Status</label>
            <select
              value={data.status || 'pending'}
              onChange={(e) => onChange({ ...data, status: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="processing">In Processing</option>
              <option value="submitted">Submitted to Passport Office</option>
              <option value="delivered">Completed / Delivered</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <UserCheck className="w-4 h-4 text-sky-200" />
            <span>1. Applicant Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">
                Applicant Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.applicantName}
                onChange={(e) => onChange({ ...data, applicantName: e.target.value })}
                placeholder="Enter candidate full name"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">
                National ID / Birth Certificate No.
              </label>
              <input
                type="text"
                value={data.nidBirthCertNo}
                onChange={(e) => onChange({ ...data, nidBirthCertNo: e.target.value })}
                placeholder="Enter National ID (NID) number"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">
                Previous Passport No. (If Applicable)
              </label>
              <input
                type="text"
                value={data.previousPassportNo}
                onChange={(e) => onChange({ ...data, previousPassportNo: e.target.value })}
                placeholder="Enter passport number"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono text-xs outline-none focus:ring-1 focus:ring-primary uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">
                Personal Mobile Number <span className="text-rose-500">*</span>
              </label>
              <BdPhoneInput
                value={data.applicantPhone}
                onChange={(val) => { onChange({ ...data, applicantPhone: val }); triggerLookup(val); }}
                required
              />
              {data.applicantPhone && !validateBdPhone(data.applicantPhone).isValid && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">
                  {validateBdPhone(data.applicantPhone).error}
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Email Address</label>
              <input
                type="email"
                value={data.applicantEmail}
                onChange={(e) => onChange({ ...data, applicantEmail: e.target.value })}
                placeholder="Enter email address"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Full Address (Village, Thana &amp; District)</label>
              <input
                type="text"
                value={data.address}
                onChange={(e) => onChange({ ...data, address: e.target.value })}
                placeholder="Enter present address"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GUARDIAN DETAILS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <PhoneCall className="w-4 h-4 text-sky-200" />
            <span>2. Guardian &amp; Emergency Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Guardian Full Name</label>
              <input
                type="text"
                value={data.guardianName}
                onChange={(e) => onChange({ ...data, guardianName: e.target.value })}
                placeholder="Enter father's name"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Relationship</label>
              <select
                value={data.relationship}
                onChange={(e) => onChange({ ...data, relationship: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse (Husband / Wife)</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Legal Guardian">Legal Guardian</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Guardian Phone Number</label>
              <BdPhoneInput
                value={data.guardianPhone}
                onChange={(val) => onChange({ ...data, guardianPhone: val })}
              />
              {data.guardianPhone && !validateBdPhone(data.guardianPhone).isValid && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">
                  {validateBdPhone(data.guardianPhone).error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <FileCheck className="w-4 h-4 text-sky-200" />
            <span>3. Passport Specifications &amp; Delivery Options</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Application Category</label>
              <select
                value={data.applicationCategory}
                onChange={(e) => onChange({ ...data, applicationCategory: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="New Application">New Application</option>
                <option value="Re-issue / Renewal">Re-issue / Renewal</option>
                <option value="Information Correction">Information Correction</option>
                <option value="Lost Passport Re-issue">Lost Passport Re-issue</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Page Count</label>
              <select
                value={data.pageCount}
                onChange={(e) => onChange({ ...data, pageCount: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="48 Pages">48 Pages</option>
                <option value="64 Pages">64 Pages</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Validity Period</label>
              <select
                value={data.validityYears}
                onChange={(e) => onChange({ ...data, validityYears: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="5 Years">5 Years</option>
                <option value="10 Years">10 Years</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">Delivery Speed</label>
              <select
                value={data.deliverySpeed}
                onChange={(e) => onChange({ ...data, deliverySpeed: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Regular">Regular (Standard Delivery)</option>
                <option value="Express">Express (Urgent Delivery)</option>
                <option value="Super Express">Super Express (Emergency Delivery)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCUMENTS CHECKLIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <FileCheck className="w-4 h-4 text-sky-200" />
            <span>4. Received Documents &amp; Attachments Checklist</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
            {[
              { id: 'nidCopy', label: 'National ID Copy / Online NID', desc: 'Clear photocopy of both sides of NID Card' },
              { id: 'birthCertOnline', label: '17-Digit Online Birth Certificate', desc: 'Verified English/Bengali online registered copy' },
              { id: 'oldPassportOriginal', label: 'Original Previous Passport', desc: 'Required for re-issue, renewal & corrections' },
              { id: 'photoLabPrint', label: 'Passport Size Lab Photos', desc: 'Recent color photos with white background' },
              { id: 'guardianNidCopy', label: 'Guardian / Parents NID Copy', desc: 'Photocopy of guardian/parent National ID' },
              { id: 'utilityBillCopy', label: 'Utility Bill Copy', desc: 'Recent electricity/gas/water bill for address verification' },
            ].map((item) => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.documentsProvided?.[item.id])}
                  onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                  className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-foreground block text-xs">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="border-t border-border pt-4">
          <label className="block font-bold text-foreground text-xs mb-1.5">Official Remarks / Special Instructions</label>
          <textarea
            rows={2}
            value={data.remarks}
            onChange={(e) => onChange({ ...data, remarks: e.target.value })}
            placeholder="Enter internal processing notes & instructions..."
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-xs outline-none resize-none focus:ring-1 focus:ring-primary"
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Saving Document...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Save &amp; View Official Preview</span>
            </>
          )}
        </button>
      </div>

      {detectedMatch && (
        <ExistingClientAlertModal
          client={detectedMatch.client}
          caseFile={detectedMatch.caseFile}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </form>
  );
}

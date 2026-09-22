import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Eye, FileCheck, UserCheck } from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';

export function IndianVisaForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
  const { t } = useTranslation();

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
      passportNo: c.passportNumber || data.passportNo,
      nidBirthCertNo: c.nidNumber || data.nidBirthCertNo,
      address: c.presentAddress || c.address || data.address,
    });
    toast.success(`"${c.fullName}" info auto-filled from database!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange({
      ...data,
      applicantPhone: '',
      applicantEmail: '',
    });
    resetLookup(val);
    toast.info('Please enter a different phone number or email.');
    setDetectedMatch(null);
  };

  const handleChecklistChange = (key, checked) => {
    onChange({
      ...data,
      documentsProvided: {
        ...data.documentsProvided,
        [key]: checked
      }
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
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto space-y-5">
      <div className="bg-card border border-border rounded-xl p-6 sm:p-7 space-y-5 text-sm shadow-sm">
        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4.5 rounded-lg border border-border">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">{t('visa.submissionDate', 'Submission Date')}</Label>
            <DatePicker
              value={data.submissionDate}
              onChange={val => onChange({ ...data, submissionDate: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">{t('visa.visaCategory', 'Visa Category')}</Label>
            <select
              value={data.visaType}
              onChange={e => onChange({ ...data, visaType: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="Tourist Visa">Tourist Visa</option>
              <option value="Medical Visa">Medical Visa</option>
              <option value="Business Visa">Business Visa</option>
              <option value="Entry Visa">Entry Visa</option>
              <option value="Student Visa">Student Visa</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">{t('visa.status', 'Status')}</Label>
            <select
              value={data.status || 'pending'}
              onChange={e => onChange({ ...data, status: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="pending">{t('common.pending', 'Pending')}</option>
              <option value="processing">Processing</option>
              <option value="submitted">Submitted</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <UserCheck className="w-4 h-4 text-sky-200" />
            <span>{t('visa.applicantInfo', '1. Applicant Information')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.fullName', 'Applicant\'s Full Name')} *</Label>
              <Input
                type="text"
                required
                value={data.applicantName}
                onChange={e => onChange({ ...data, applicantName: e.target.value })}
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.passportNo', 'Passport Number')} *</Label>
              <Input
                type="text"
                required
                value={data.passportNo}
                onChange={e => onChange({ ...data, passportNo: e.target.value })}
                className="font-mono"
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.nidBirthCert', 'NID / Birth Certificate No.')}</Label>
              <Input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                className="font-mono"
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.phone', 'Phone Number')} *</Label>
              <BdPhoneInput
                value={data.applicantPhone}
                onChange={(val) => {
                  onChange({ ...data, applicantPhone: val });
                  triggerLookup(val);
                }}
                required
              />
              {data.applicantPhone && !validateBdPhone(data.applicantPhone).isValid && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">
                  {validateBdPhone(data.applicantPhone).error}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.email', 'Email Address')}</Label>
              <Input
                type="email"
                value={data.applicantEmail}
                onChange={e => {
                  onChange({ ...data, applicantEmail: e.target.value });
                  triggerLookup(e.target.value);
                }}
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.address', 'Full Address')}</Label>
              <Input
                type="text"
                value={data.address}
                onChange={e => onChange({ ...data, address: e.target.value })}
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: VISA SPECIFICATIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <FileCheck className="w-4 h-4 text-sky-200" />
            <span>{t('visa.visaDetails', '2. Visa Details')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.entryPort', 'Port of Entry')}</Label>
              <select
                value={data.entryPort}
                onChange={e => onChange({ ...data, entryPort: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="Haridaspur / Gede">Haridaspur / Gede</option>
                <option value="By Air">By Air</option>
                <option value="Agartala">Agartala</option>
                <option value="Ghojadanga">Ghojadanga</option>
                <option value="Dawki / Tamabil">Dawki / Tamabil</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.duration', 'Visa Duration')}</Label>
              <select
                value={data.durationMonths}
                onChange={e => onChange({ ...data, durationMonths: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="1 Year Multiple">1 Year Multiple</option>
                <option value="6 Months Multiple">6 Months Multiple</option>
                <option value="3 Months Single">3 Months Single</option>
                <option value="5 Years Multiple">5 Years Multiple</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.entryType', 'Entry Type')}</Label>
              <select
                value={data.entryType}
                onChange={e => onChange({ ...data, entryType: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="Multiple Entry">Multiple Entry</option>
                <option value="Single Entry">Single Entry</option>
                <option value="Double Entry">Double Entry</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: DOCUMENTS CHECKLIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
            <FileCheck className="w-4 h-4 text-sky-200" />
            <span>{t('visa.documents', '3. Required Documents Checklist')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4.5 rounded-lg border border-border">
            {[
              { id: 'passportOriginal', label: t('visa.passportOriginal', 'Original Passport'), desc: t('visa.passportOriginalDesc', 'Minimum 2 years validity passport') },
              { id: 'nidCopy', label: t('visa.nidCopy', 'NID Copy'), desc: t('visa.nidCopyDesc', 'NID or online 17-digit birth certificate copy') },
              { id: 'photoLabPrint', label: t('visa.photoLabPrint', 'Photo (2x2 Lab Print)'), desc: t('visa.photoLabPrintDesc', 'White background print') },
              { id: 'bankSolvency', label: t('visa.bankSolvency', 'Bank Solvency Certificate / Dollar Endorsement'), desc: t('visa.bankSolvencyDesc', 'Minimum 20,000 BDT solvency or $200 endorsement') },
              { id: 'utilityBillCopy', label: t('visa.utilityBill', 'Utility Bill Copy (Electricity/Gas/Water)'), desc: t('visa.utilityBillDesc', 'Electricity/Water/Gas bill copy') },
              { id: 'previousVisaCopy', label: t('visa.previousVisa', 'Previous Indian Visa Copy (if any)'), desc: t('visa.previousVisaDesc', 'Old Indian visa copy') },
              { id: 'nocTradeLicense', label: t('visa.nocTradeLicense', 'NOC / Trade License / Student ID'), desc: t('visa.nocTradeLicenseDesc', 'Professional/educational document') },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.documentsProvided?.[item.id])}
                  onChange={e => handleChecklistChange(item.id, e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-foreground block text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="border-t border-border pt-4 space-y-1.5">
          <Label className="block text-xs font-semibold text-foreground">{t('visa.remarks', 'Special Remarks / Instructions')}</Label>
          <Textarea
            rows={2}
            value={data.remarks}
            onChange={e => onChange({ ...data, remarks: e.target.value })}
            placeholder=""
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4.5 rounded-lg flex items-center justify-between gap-3 shadow-sm">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>{t('common.reset', 'Reset')}</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/95 disabled:opacity-60 text-primary-foreground shadow-sm transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{t('visa.submitting', 'Submitting...')}</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>{t('visa.submit', 'Submit & Preview')}</span>
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

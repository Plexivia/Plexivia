import React, { useEffect, useState } from 'react';
import {
  Receipt,
  User,
  Phone,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  Eye,
  Save,
  CheckCircle2,
  DollarSign,
  Layers,
  Upload,
  Paperclip,
  X,
  Lock,
  Loader2,
} from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { SERVICE_PURPOSES, numberToWords, localToday } from './sampleData';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone, toPhoneString } from '../common/phoneValidator';
import { useAuthStore } from '@/store/useAuthStore';
import { Switch } from '@/components/ui/switch';
import { uploadTicketAttachment } from '@/services/supportApi';
import { ExistingClientSelector } from '@/components/common/ClientSelectorAndLineItems';
import { DocumentNumberField } from '../common/DocumentNumberField';
import { StudioSectionHeader } from '../common/StudioSectionHeader';
import { usePaymentMethodOptions } from '../common/useStudioLookups';

export function MoneyReceiptForm({ data, onChange, onReset, onSave, onPreview, isSubmitting, isLocked = false, onNumberStateChange = null }) {
  const { t } = useTranslation();
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [dateMode, setDateMode] = useState('auto'); // 'auto' | 'custom'
  const [uploadingField, setUploadingField] = useState('');

  // Received By = the dashboard user creating the voucher; only the owner may change it
  const currentUser = useAuthStore((st) => st.user);
  const isOwner = ['super_admin', 'owner'].includes(String(currentUser?.role || '').toLowerCase());
  useEffect(() => {
    if (!currentUser) return;
    const profileSignature = currentUser.signature || currentUser.signatureUrl || '';
    onChange((prev) => ({
      ...prev,
      receivedBy: prev.receivedBy || currentUser.name || '',
      receivedByRole: prev.receivedByRole || currentUser.designation || currentUser.subRole || currentUser.role || '',
      // Signature saved on the user's profile is used by default; it can be replaced here
      signatureImage: prev.signatureImage || (profileSignature ? { url: profileSignature, name: 'Profile signature' } : null),
    }));
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Payment proof / signature images: PDF or any image, max 5 MB
  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
  const handleFileUpload = async (field, file) => {
    if (!file) return;
    const okType = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!okType) {
      toast.error('Only PDF or image files are allowed.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('File is larger than 5 MB.');
      return;
    }
    setUploadingField(field);
    try {
      const uploaded = await uploadTicketAttachment(file);
      onChange((prev) => ({ ...prev, [field]: uploaded }));
      toast.success('File uploaded.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadingField('');
    }
  };
  // Payment methods exactly as configured under Accounts -> Payment Methods
  const { options: methodOptions, defaultMethod, loading: methodsLoading } = usePaymentMethodOptions();
  const selectedMethod = methodOptions.find((o) => o.value === data.paymentMethod)?.method || null;
  const isCashMethod = /cash/i.test(`${data.paymentMethod || ''} ${selectedMethod?.category || ''}`);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  // Start on the method marked default in Accounts, once the list has loaded
  useEffect(() => {
    if (!defaultMethod) return;
    onChange((prev) => (prev.paymentMethod ? prev : { ...prev, paymentMethod: defaultMethod.name }));
  }, [defaultMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));

    if (field === 'amount') {
      const numVal = parseFloat(value) || 0;
      onChange((prev) => ({
        ...prev,
        amount: numVal,
        amountInWords: numberToWords(numVal),
      }));
    }

    if (field === 'phone') {
      triggerLookup(value);
    }
  };

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    onChange((prev) => ({
      ...prev,
      clientName: c.fullName || c.name || prev.clientName,
      phone: toPhoneString(c.phone) || toPhoneString(c.mobileNumber) || prev.phone,
      clientId: c._id || c.did || prev.clientId,
      clientDid: c.did || c._id || prev.clientDid,
      linkedCaseId: detectedMatch.caseFile?._id || prev.linkedCaseId || null,
      linkedCaseDid: detectedMatch.caseFile?.did || prev.linkedCaseDid || null,
    }));
    toast.success(`"${c.fullName || c.name}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || data.phone || '';
    onChange((prev) => ({ ...prev, phone: '' }));
    resetLookup(val);
    setPhoneTouched(false);
    toast.info('Please enter a different phone number.');
    setDetectedMatch(null);
  };

  const handleSave = () => {
    const phone = data.phone || '';
    const check = validateBdPhone(phone);
    if (!check.isValid) {
      setPhoneTouched(true);
      toast.error(`Phone: ${check.error}`);
      return;
    }
    onSave();
  };

  const handlePreviewAction = () => {
    const phone = data.phone || '';
    const check = validateBdPhone(phone);
    if (!check.isValid) {
      setPhoneTouched(true);
      toast.error(`Phone: ${check.error}`);
      return;
    }
    onPreview();
  };


  const handleDateModeChange = (mode) => {
    setDateMode(mode);
    if (mode === 'auto') {
      const now = new Date();
      const todayStr = localToday(now);
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      onChange((prev) => ({
        ...prev,
        date: todayStr,
        time: timeStr,
      }));
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">


      {/* Meta Bar: Date, Time & Print Layout */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-end text-xs">
          {/* Date & Time Selection with Radio Options */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 bg-background/90 p-2 rounded-xl border border-border shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-foreground">
                <input
                  type="radio"
                  name="dateMode"
                  value="auto"
                  checked={dateMode === 'auto'}
                  onChange={() => handleDateModeChange('auto')}
                  className="accent-primary cursor-pointer"
                />
                <span>Auto Date &amp; Time</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-foreground">
                <input
                  type="radio"
                  name="dateMode"
                  value="custom"
                  checked={dateMode === 'custom'}
                  onChange={() => handleDateModeChange('custom')}
                  className="accent-primary cursor-pointer"
                />
                <span>Custom Date</span>
              </label>
            </div>

            {dateMode === 'auto' ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-primary/5 border border-primary/20 px-3 py-2 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{data.date || localToday()}</span>
                <span className="text-muted-foreground/40">•</span>
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{data.time || '11:30 AM'}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                <div>
                  <DatePicker
                    value={data.date || ''}
                    onChange={(val) => handleFieldChange('date', val)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={data.time || ''}
                    placeholder="Enter receipt time"
                    onChange={(e) => handleFieldChange('time', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Receipt number - type one or press the wand for a fresh one */}
          <div className="md:col-span-6 lg:col-span-4">
            <DocumentNumberField
              label="Receipt No."
              docType="money-receipt"
              value={data.receiptNo || ''}
              isSaved={Boolean(data.savedDocId)}
              onChange={(next) => onChange((prev) => ({ ...prev, receiptNo: next }))}
              onAvailabilityChange={onNumberStateChange}
            />
          </div>

          {/* Print Layout Format */}
          <div className="md:col-span-6 lg:col-span-4">
            <label className="block font-bold text-foreground mb-1">Print Layout Format</label>
            <select
              value={data.dualPrint === true ? 'dual' : 'single'}
              onChange={(e) => handleFieldChange('dualPrint', e.target.value === 'dual')}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary cursor-pointer outline-none"
            >
              <option value="dual">Dual Slip on 1 A4 (Original + Office Copy)</option>
              <option value="single">Single Voucher Slip Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Passenger / Client Details */}
      <div className="space-y-3">
        <StudioSectionHeader icon={User} title="1. Client Information" />

        {/* Existing Client Selector */}
        <ExistingClientSelector
          isLocked={isLocked}
          lockedClient={{
            name: data.clientName,
            fullName: data.clientName,
            caseNumber: data.caseNumber,
          }}
          selectedClientDid={data.caseDid || data.clientDid}
          onSelectClient={(clientData) => {
            onChange((prev) => ({
              ...prev,
              caseNumber: clientData.caseNumber || prev.caseNumber,
              caseDid: clientData.caseDid || prev.caseDid,
              clientDid: clientData.did || prev.clientDid,
              clientName: clientData.name || prev.clientName,
              phone: toPhoneString(clientData.phone) || prev.phone,
            }));
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Client Name *</label>
            <input
              type="text"
              disabled={isLocked}
              value={data.clientName || ''}
              placeholder="Enter recipient / client name"
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Phone / Mobile No. <span className="text-rose-500">*</span>
            </label>
            <BdPhoneInput
              value={data.phone || ''}
              required
              disabled={isLocked}
              onBlur={() => setPhoneTouched(true)}
              onChange={(val) => {
                handleFieldChange('phone', val);
                if (phoneTouched) setPhoneTouched(true);
              }}
            />
            {((phoneTouched || Boolean(data.phone)) && !validateBdPhone(data.phone || '').isValid) && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.phone || '').error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Services & Billing Officer */}
      <div className="space-y-3">
        <StudioSectionHeader icon={Layers} title="2. Services & Billing Officer" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Service / Deliverable *</label>
            <select
              value={SERVICE_PURPOSES.includes(data.purpose) ? data.purpose : data.purpose || data.purposeCustom ? '__custom' : ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom') onChange((prev) => ({ ...prev, purpose: '', purposeCustom: true }));
                else onChange((prev) => ({ ...prev, purpose: v, purposeCustom: false }));
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="">Select a service…</option>
              {SERVICE_PURPOSES.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
              <option value="__custom">Other (write it in)</option>
            </select>
            {!SERVICE_PURPOSES.includes(data.purpose) && (data.purpose || data.purposeCustom) && (
              <input
                type="text"
                value={data.purpose || ''}
                placeholder="Describe the service"
                onChange={(e) => handleFieldChange('purpose', e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              />
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
              Received By
              {!isOwner && <Lock className="w-3 h-3 text-muted-foreground" aria-label="Only the owner can change this" />}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.receivedBy || ''}
                disabled={!isOwner}
                placeholder="Name"
                onChange={(e) => handleFieldChange('receivedBy', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-muted/40 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={data.receivedByRole || ''}
                disabled={!isOwner}
                placeholder="Designation"
                onChange={(e) => handleFieldChange('receivedByRole', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-muted/40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Payment & Amount */}
      <div className="space-y-3">
        <StudioSectionHeader icon={DollarSign} title="3. Payment Method & Amount Breakdown" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/20 p-4 rounded-xl border border-border">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block font-bold text-foreground">Payment Method</label>
              <Link to="/accounts/payments/methods" className="text-[10px] font-semibold text-primary hover:underline">
                Manage
              </Link>
            </div>
            {methodOptions.length > 0 ? (
              <div className="space-y-1.5">
                {methodOptions.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      data.paymentMethod === pm.value
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-background border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={data.paymentMethod === pm.value}
                      onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                      className="accent-primary"
                    />
                    <span className="min-w-0 flex-1 truncate">{pm.label}</span>
                    {pm.badge && <span className="shrink-0 text-[9px] font-bold text-muted-foreground">{pm.badge}</span>}
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
                {methodsLoading
                  ? 'Loading payment methods...'
                  : 'No payment methods yet. Add them under Accounts, Payment Methods, and they show up here.'}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Total Amount (BDT) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">BDT </span>
                <input
                  type="number"
                  value={data.amount || ''}
                  placeholder="0.00"
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  className="w-full pl-14 pr-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {!isCashMethod && data.paymentMethod && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Transaction Amount (BDT)</label>
                  <input
                    type="number"
                    value={data.transactionAmount ?? ''}
                    placeholder={data.amount ? String(data.amount) : '0.00'}
                    onChange={(e) => handleFieldChange('transactionAmount', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={data.transactionId || ''}
                    placeholder="e.g. 9FD7XK2L1Q"
                    onChange={(e) => handleFieldChange('transactionId', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-foreground mb-1">
                Payment Proof <span className="font-medium text-muted-foreground">(optional · PDF or image · max 5 MB)</span>
              </label>
              {data.paymentProof?.url ? (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                  <a href={data.paymentProof.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-primary hover:underline">
                    {data.paymentProof.name || 'Attachment'}
                  </a>
                  <button
                    type="button"
                    onClick={() => onChange((prev) => ({ ...prev, paymentProof: null }))}
                    className="p-1 rounded hover:bg-muted cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-muted-foreground hover:bg-muted cursor-pointer">
                  {uploadingField === 'paymentProof' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploadingField === 'paymentProof' ? 'Uploading…' : 'Upload screenshot or PDF'}</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    disabled={Boolean(uploadingField)}
                    onChange={(e) => {
                      handleFileUpload('paymentProof', e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Amount in Words (In Words)</label>
              <input
                type="text"
                value={data.amountInWords || ''}
                placeholder="Enter amount in words"
                onChange={(e) => handleFieldChange('amountInWords', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs italic focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Signatures & Authorizations */}
      <div className="space-y-3">
        <StudioSectionHeader icon={FileText} title="4. Signatures & Approvals" />

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs">
          <span>
            <span className="block font-bold text-foreground">Show signatures on the receipt</span>
            <span className="block text-muted-foreground">
              {data.showSignatures
                ? 'Signature lines are printed. Upload a signature image, or use the one from your profile.'
                : 'Off: no signature lines. The receipt prints a system-generated confirmation instead.'}
            </span>
          </span>
          <Switch
            checked={Boolean(data.showSignatures)}
            onCheckedChange={(checked) => handleFieldChange('showSignatures', checked)}
            aria-label="Show signatures on the receipt"
          />
        </div>

        {data.showSignatures && (
        <>
        <p className="text-xs text-muted-foreground">
          Signed by <span className="font-bold text-foreground">{data.receivedBy || currentUser?.name || '—'}</span>
          {(data.receivedByRole || currentUser?.designation) && <> · {data.receivedByRole || currentUser?.designation}</>}
        </p>
        <div className="text-xs">
          <label className="block font-medium text-foreground mb-1">Signature</label>
          {data.signatureImage?.url ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-2">
              <img src={data.signatureImage.url} alt="Signature" className="h-10 max-w-[160px] object-contain" />
              <button
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, signatureImage: null }))}
                className="ml-auto p-1 rounded hover:bg-muted cursor-pointer"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-muted-foreground hover:bg-muted cursor-pointer">
              {uploadingField === 'signatureImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploadingField === 'signatureImage' ? 'Uploading…' : 'Upload signature image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={Boolean(uploadingField)}
                onChange={(e) => {
                  handleFileUpload('signatureImage', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
        </>
        )}
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
        <span className="mr-auto hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
          <Eye className="w-3.5 h-3.5" />
          Use the View switcher at the bottom to preview without saving.
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save & Generate Voucher'}</span>
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
    </div>
  );
}

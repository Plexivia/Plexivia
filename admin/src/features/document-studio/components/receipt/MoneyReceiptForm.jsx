import React, { useState } from 'react';
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
} from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { PAYMENT_METHODS, SERVICE_PURPOSES, numberToWords } from './sampleData';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { ExistingClientSelector } from '@/components/common/ClientSelectorAndLineItems';

export function MoneyReceiptForm({ data, onChange, onReset, onSave, onPreview, isSubmitting, isLocked = false }) {
  const { t } = useTranslation();
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [dateMode, setDateMode] = useState('auto'); // 'auto' | 'custom'

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

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
      phone: c.phone || c.mobileNumber || prev.phone,
      passportNumber: c.passportNumber || c.nidNumber || prev.passportNumber,
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
      const todayStr = now.toISOString().split('T')[0];
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
          {/* Date & Time Selection with Radio Options */}
          <div className="md:col-span-8 flex flex-col sm:flex-row sm:items-center gap-3">
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
                <span>{data.date || new Date().toISOString().split('T')[0]}</span>
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

          {/* Print Layout Format */}
          <div className="md:col-span-4">
            <label className="block font-bold text-foreground mb-1">Print Layout Format</label>
            <select
              value={data.dualPrint !== false ? 'dual' : 'single'}
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
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#0B3A60] via-sky-800 to-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>1. Client &amp; Passenger Information</span>
        </div>

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
              phone: clientData.phone || prev.phone,
              passportNumber: clientData.passportNumber || prev.passportNumber,
            }));
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Client / Passenger Name *</label>
            <input
              type="text"
              disabled={isLocked}
              value={data.clientName || ''}
              placeholder="Enter recipient / client name"
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Passport / NID No.</label>
            <input
              type="text"
              disabled={isLocked}
              value={data.passportNumber || ''}
              placeholder="Enter passport number"
              onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-medium text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
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

      {/* Section 2: Service Purpose & Authorizer */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#0B3A60] via-sky-800 to-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Layers className="w-4 h-4 text-sky-200" />
          <span>2. Purpose, Service Head &amp; Officer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Purpose / Service Head *</label>
            <input
              type="text"
              list="service-purpose-options"
              value={data.purpose || ''}
              placeholder="Enter payment purpose / description"
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
            <datalist id="service-purpose-options">
              {SERVICE_PURPOSES.map((sp, idx) => (
                <option key={idx} value={sp} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Received / Paid By (Accounts Officer)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.receivedBy || ''}
                placeholder="Enter recipient officer name"
                onChange={(e) => handleFieldChange('receivedBy', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
              />
              <input
                type="text"
                value={data.receivedByRole || ''}
                placeholder="Enter officer designation / role"
                onChange={(e) => handleFieldChange('receivedByRole', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Payment & Amount */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#0B3A60] via-sky-800 to-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <DollarSign className="w-4 h-4 text-sky-200" />
          <span>3. Payment Method &amp; Amount Breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/20 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground mb-1.5">Payment Method</label>
            <div className="space-y-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    data.paymentMethod === pm.id
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-background border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={data.paymentMethod === pm.id}
                    onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                    className="accent-primary"
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>
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
                  className="w-full pl-14 pr-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-sm focus:ring-2 focus:ring-sky-400/40 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Amount in Words (In Words)</label>
              <input
                type="text"
                value={data.amountInWords || ''}
                placeholder="Enter amount in words"
                onChange={(e) => handleFieldChange('amountInWords', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium text-xs italic focus:ring-2 focus:ring-sky-400/40 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Signatures & Authorizations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#0B3A60] via-sky-800 to-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <FileText className="w-4 h-4 text-sky-200" />
          <span>4. Signatures &amp; Approvals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Prepared / Paid By</label>
            <input
              type="text"
              value={data.preparedBy || ''}
              placeholder="Paid by name / title"
              onChange={(e) => handleFieldChange('preparedBy', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Received By</label>
            <input
              type="text"
              value={data.receivedBySignature || ''}
              placeholder="Received by name / title"
              onChange={(e) => handleFieldChange('receivedBySignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Accounts Officer</label>
            <input
              type="text"
              value={data.accountsSignature || ''}
              placeholder="Accountant designation"
              onChange={(e) => handleFieldChange('accountsSignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Approved By</label>
            <input
              type="text"
              value={data.approvedBySignature || ''}
              placeholder="Authorized signatory title"
              onChange={(e) => handleFieldChange('approvedBySignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={handlePreviewAction}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-4 h-4 text-primary" />
          <span>Preview Voucher</span>
        </button>

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

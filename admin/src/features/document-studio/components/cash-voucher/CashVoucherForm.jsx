import React, { useCallback, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { numberToWords, numberToWordsBn, generateVoucherNo } from './sampleData';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';

import { BdPhoneInput } from '@/components/common/BdPhoneInput';

export function CashVoucherForm({ data, onChange, onReset, onSave, onPreview, isSubmitting }) {
  const { t } = useTranslation();

  // ─── Client Lookup ────────────────────────────────────────────────────────
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleYes = () => {
    const { client, caseFile } = detectedMatch;
    onChange((prev) => ({
      ...prev,
      receivedFrom: client.fullName || client.name || prev.receivedFrom,
      phone: client.phone || client.mobileNumber || prev.phone,
      email: client.email || prev.email,
      clientId: client._id || client.did || null,
      clientDid: client.did || client._id || null,
      linkedCaseId: caseFile?._id || null,
      linkedCaseDid: caseFile?.did || null,
    }));
    toast.success(`Auto-filled from existing client: ${client.fullName || client.name}`);
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



  // ─── Helpers ─────────────────────────────────────────────────────────────
  const recalc = useCallback((items, taxVat) => {
    const subtotal   = items.reduce((s, it) => s + Number(it.amount || 0), 0);
    const grandTotal = subtotal + Number(taxVat || 0);
    return { subtotal, grandTotal, grandTotalInWordsEn: numberToWords(grandTotal), grandTotalInWordsBn: numberToWordsBn(grandTotal) };
  }, []);

  const handleChange = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));

  // ─── Line Items ───────────────────────────────────────────────────────────
  const handleItemChange = (idx, field, value) => {
    const updated = data.items.map((it, i) =>
      i === idx ? { ...it, [field]: field === 'amount' ? Number(value) || 0 : value } : it
    );
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const addItem = () => {
    const updated = [...data.items, { slNo: data.items.length + 1, descriptionBn: '', descriptionEn: '', amount: 0 }];
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const removeItem = (idx) => {
    const updated = data.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, slNo: i + 1 }));
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const handleTaxChange = (val) => {
    const taxVat = Number(val) || 0;
    onChange((prev) => ({ ...prev, taxVat, ...recalc(prev.items, taxVat) }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Voucher Meta */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Voucher No */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">
                {t('cashVoucherForm.voucherNo', 'Voucher No')}
              </label>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                Auto-generated
              </span>
            </div>
            <input
              type="text"
              value={data.voucherNo || 'Auto-generated'}
              readOnly
              disabled
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground font-mono cursor-not-allowed select-none outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.date', 'Date')}
            </label>
            <input
              type="date"
              value={data.voucherDate?.split('/').reverse().join('-') || ''}
              onChange={(e) => {
                const d = new Date(e.target.value);
                handleChange('voucherDate', d.toLocaleDateString('en-GB'));
              }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Received From */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.receivedFrom', 'Received From / Paid To')}
            </label>
            <input
              type="text"
              value={data.receivedFrom || ''}
              onChange={(e) => handleChange('receivedFrom', e.target.value)}
              placeholder={t('cashVoucherForm.receivedFromPlaceholder', 'Client / Person name')}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.phone', 'Phone Number')} <span className="text-rose-500">*</span>
            </label>
            <BdPhoneInput
              value={data.phone || ''}
              required
              onBlur={() => setPhoneTouched(true)}
              onChange={(val) => {
                handleChange('phone', val);
                triggerLookup(val);
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


      {/* Expense Items */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <span>{t('cashVoucherForm.expenseItems', '1. Expense Line Items & Breakdown')}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="px-2 py-2 text-left w-10">{t('cashVoucherForm.slNo', '#')}</th>
                <th className="px-2 py-2 text-left">{t('cashVoucherForm.descriptionBn', 'Description (Bengali)')}</th>
                <th className="px-2 py-2 text-left">{t('cashVoucherForm.descriptionEn', 'Description (English)')}</th>
                <th className="px-2 py-2 text-right w-32">{t('cashVoucherForm.amountBdt', 'Amount (BDT)')}</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="px-2 py-2 text-muted-foreground text-center">{item.slNo}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.descriptionBn}
                      onChange={(e) => handleItemChange(idx, 'descriptionBn', e.target.value)}
                      placeholder={t('cashVoucherForm.placeholderBn', 'Write in Bengali...')}
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.descriptionEn}
                      onChange={(e) => handleItemChange(idx, 'descriptionEn', e.target.value)}
                      placeholder={t('cashVoucherForm.placeholderEn', 'Write in English...')}
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      min="0"
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-right text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Add Row Button on Left & Totals on Right */}
        <div className="mt-4 flex flex-col sm:flex-row items-start justify-between gap-4">
          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={addItem}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('cashVoucherForm.addRow', 'Add Row')}</span>
          </Button>

          {/* Totals */}
          <div className="flex flex-col items-end gap-1 text-xs w-full sm:w-auto">
            <div className="flex gap-4">
              <span className="text-muted-foreground">{t('cashVoucherForm.subtotal', 'Subtotal')}</span>
              <span className="font-semibold text-foreground w-28 text-right">
                {Number(data.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-muted-foreground">{t('cashVoucherForm.taxVat', 'Tax / VAT')}</span>
              <input
                type="number"
                value={data.taxVat}
                onChange={(e) => handleTaxChange(e.target.value)}
                min="0"
                className="w-28 bg-muted border border-border rounded-lg px-2 py-1 text-right text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-4 border-t border-border pt-1 mt-1">
              <span className="font-bold text-foreground">{t('cashVoucherForm.grandTotal', 'Grand Total')}</span>
              <span className="font-bold text-foreground w-28 text-right">
                {Number(data.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <span>{t('cashVoucherForm.signatures', '2. Signatures & Authorizations')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.receivedBy', 'Received By')}
            </label>
            <input
              type="text"
              value={data.receivedBy}
              onChange={(e) => handleChange('receivedBy', e.target.value)}
              placeholder={t('cashVoucherForm.receivedByPlaceholder', 'Signature / Name')}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.preparedBy', 'Prepared By')}
            </label>
            <input
              type="text"
              value={data.preparedBy}
              onChange={(e) => handleChange('preparedBy', e.target.value)}
              placeholder={t('cashVoucherForm.preparedByPlaceholder', 'Signature & Name')}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('cashVoucherForm.authority', 'Authority')}
            </label>
            <input
              type="text"
              value={data.accountsSignature}
              onChange={(e) => handleChange('accountsSignature', e.target.value)}
              placeholder={t('cashVoucherForm.authorityPlaceholder', 'Signature & Designation')}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="reset"
          onClick={onReset}
        >
          {t('cashVoucherForm.reset', 'Reset')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviewAction}
        >
          {t('cashVoucherForm.previewOnly', 'Preview Only')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('cashVoucherForm.saving', 'Saving...') : t('cashVoucherForm.savePreview', 'Save & Preview')}
        </Button>
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

export default CashVoucherForm;

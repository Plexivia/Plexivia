import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerGuardianForm } from './CustomerGuardianForm';
import { CustomerGuardianPreview } from './CustomerGuardianPreview';
import { getDefaultClientGuardianData, generateApplicationNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';
import { validateBdPhone } from '../common/phoneValidator';

export function CustomerGuardian({ initialData = null, onSavedSuccess = null }) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData || getDefaultClientGuardianData());
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultClientGuardianData());
    toast.info(t('clientForm.clearReset', 'Form data reset'));
  };

  const handleSaveToDatabase = async () => {
    if (!data.client?.fullName?.trim()) {
      toast.error(t('clientForm.fullNamePlaceholder', 'Client full name is required'));
      return;
    }

    const phone = data.client?.mobileNumber || '';
    if (phone) {
      const check = validateBdPhone(phone);
      if (!check.isValid) {
        toast.error(`Client Phone: ${check.error}`);
        return;
      }
    }

    const gPhone = data.guardian?.mobileNumber || '';
    if (gPhone) {
      const check = validateBdPhone(gPhone);
      if (!check.isValid) {
        toast.error(`Guardian Phone: ${check.error}`);
        return;
      }
    }

    const payload = { ...data };
    if (!payload._id) {
      delete payload._id;
    }
    if (!payload.applicationNo) {
      payload.applicationNo = generateApplicationNo();
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/client-guardians/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/client-guardians', payload);

      const savedDoc = res.data?.data || res.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setData(savedDoc);
        toast.success(
          isEdit
            ? `${t('clientForm.updateDb', 'Updated')} (App No: ${savedDoc.applicationNo})`
            : `${t('clientForm.saveDb', 'Saved')} (App No: ${savedDoc.applicationNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save client file error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save client file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.applicationNo || data.receiptNo,
      docType: 'Customer_Guardian_Form',
      clientName: data.client?.fullName,
      elementId: 'customer-guardian-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.client?.fullName || 'Client';
    const total = Number(data.payment?.totalAmount || 0).toLocaleString('en-IN');
    const advance = Number(data.payment?.advancePaid || 0).toLocaleString('en-IN');
    const due = Number(data.payment?.dueAmount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*CUSTOMER & GUARDIAN APPLICATION FORM (${data.applicationNo || 'APP-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Name:* ${clientName}\n` +
      `📌 *Service:* ${data.serviceType || 'Indian Visa'}\n` +
      `🆔 *NID:* ${data.client?.nidNumber || 'N/A'}\n` +
      `🛂 *Passport:* ${data.client?.passportNumber || 'N/A'}\n` +
      `👥 *Guardian:* ${data.guardian?.fullName || 'N/A'} (${data.guardian?.relationship || 'Guardian'})\n` +
      `-----------------------------------------\n` +
      `💰 *Total Fee:* BDT  ${total}\n` +
      `✅ *Advance Paid:* BDT  ${advance}\n` +
      `⏳ *Due Amount:* BDT  ${due}\n` +
      `-----------------------------------------\n` +
      `📅 *Date:* ${data.dateReceived || 'Today'}\n\n` +
      `🏢 *PLEXIVIA*\n` +
      `📍 Address: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Phone: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={UserCheck}
        title={t('clientForm.title', 'Client & Guardian Application Dossier')}
        subtitle={t('clientForm.subtitle', 'Create and print official client & guardian profile details, file tracking status, and advance payment ledger.')}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Share Summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
              title="Export Printable A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="w-full pb-16">
          <CustomerGuardianForm
            data={data}
            onChange={setData}
            onReset={handleReset}
            onSave={handleSaveToDatabase}
            onPreview={() => setViewMode('preview')}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <CustomerGuardianPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <CustomerGuardianPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CustomerGuardianForm
              data={data}
              onChange={setData}
              onReset={handleReset}
              onSave={handleSaveToDatabase}
              onPreview={() => setViewMode('preview')}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <CustomerGuardianPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CustomerGuardian;

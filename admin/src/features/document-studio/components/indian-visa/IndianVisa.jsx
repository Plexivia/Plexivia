import React, { useState, useEffect } from 'react';
import { IndianVisaForm } from './IndianVisaForm';
import { IndianVisaPreview } from './IndianVisaPreview';
import { getDefaultIndianVisaData, generateUniqueIndianVisaTrackingNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function IndianVisa({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [data, setData] = useState(() => {
    if (initialData) {
      return { ...getDefaultIndianVisaData(), ...initialData, isLocked };
    }
    return getDefaultIndianVisaData();
  });
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        applicant: { ...prev.applicant, ...initialData.applicant },
        isLocked,
      }));
    }
  }, [initialData, isLocked]);

  const handleReset = () => {
    setData(getDefaultIndianVisaData());
    toast.info('Indian visa form reset successfully.');
  };

  const handleFormSubmit = async () => {
    const payload = { ...data };
    if (!payload.trackingNo) {
      delete payload.trackingNo;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/indian-visas/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/indian-visas', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedTrackingNo = savedDoc.trackingNo || generateUniqueIndianVisaTrackingNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          trackingNo: returnedTrackingNo,
        }));
        toast.success(
          isEdit
            ? `Indian visa application updated successfully! (Tracking No: ${returnedTrackingNo})`
            : `Indian visa application saved successfully! (Tracking No: ${returnedTrackingNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackTrackingNo = data.trackingNo || generateUniqueIndianVisaTrackingNo();
      setData((prev) => ({
        ...prev,
        trackingNo: fallbackTrackingNo,
      }));
      toast.info(`Indian visa application receipt ready! (Tracking No: ${fallbackTrackingNo})`);
      if (onSavedSuccess) onSavedSuccess({ trackingNo: fallbackTrackingNo });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.trackingNo,
      docType: 'Indian_Visa_Receipt',
      clientName: data.applicantName,
      elementId: 'printable-indian-visa-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const applicantName = data.applicantName || 'Valued Applicant';
    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Indian Visa Application & Submission Slip (${data.trackingNo || 'IVISA-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Applicant Name:* ${applicantName}\n` +
      `🛂 *Passport Number:* ${data.passportNo || 'N/A'}\n` +
      `🇮🇳 *Visa Category:* ${data.visaType || 'Tourist Visa'}\n` +
      `🛣️ *Entry Port:* ${data.entryPort || 'Haridaspur / Gede'}\n` +
      `📅 *Submission Date:* ${data.submissionDate || 'Today'}\n` +
      `📞 *Phone Number:* ${data.applicantPhone || 'N/A'}\n\n` +
      `📌 *Official Update:* Your Indian Visa submission receipt and dossier are ready.\n\n` +
      `🏢 *PLEXIVIA*\n` +
      `📍 Address: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Contact Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={FileText}
        title={`Indian Visa Application Dossier (${data.trackingNo || 'IVISA-OFFICIAL'})`}
        subtitle="IVAC submission receipt, passport delivery token, and consular checklist dossier generator."
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
          <IndianVisaForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <IndianVisaPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <IndianVisaPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <IndianVisaForm
              data={data}
              onChange={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <IndianVisaPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default IndianVisa;

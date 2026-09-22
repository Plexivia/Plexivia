import React, { useState, useEffect } from 'react';
import { PassportSubmissionForm } from './PassportSubmissionForm';
import { PassportSubmissionPreview } from './PassportSubmissionPreview';
import { getDefaultPassportSubmissionData, generateUniquePassportTrackingNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function PassportSubmission({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [data, setData] = useState(() => {
    if (initialData) {
      return { ...getDefaultPassportSubmissionData(), ...initialData, isLocked };
    }
    return getDefaultPassportSubmissionData();
  });
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        isLocked,
      }));
    }
  }, [initialData, isLocked]);

  const handleReset = () => {
    setData(getDefaultPassportSubmissionData());
    toast.info('Passport intake form reset to default.');
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
        ? await apiClient.put(`/api/v1/client/docs/passports/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/passports', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedTrackingNo = savedDoc.trackingNo || generateUniquePassportTrackingNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          trackingNo: returnedTrackingNo,
        }));
        toast.success(
          isEdit
            ? `Passport submission updated! (Tracking ID: ${returnedTrackingNo})`
            : `Passport submission saved to database! (Tracking ID: ${returnedTrackingNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save passport record to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackTrackingNo = data.trackingNo || generateUniquePassportTrackingNo();
      setData((prev) => ({
        ...prev,
        trackingNo: fallbackTrackingNo,
      }));
      toast.info(`Passport file preview ready! (Tracking ID: ${fallbackTrackingNo})`);
      if (onSavedSuccess) onSavedSuccess({ trackingNo: fallbackTrackingNo });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.trackingNo || data.submissionNo || data.barcode,
      docType: 'Passport_Submission',
      clientName: data.applicantName,
      elementId: 'printable-passport-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const applicantName = data.applicantName || 'Valued Applicant';

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Passport Submission & Intake Slip (${data.trackingNo || 'PASS-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Applicant Name:* ${applicantName}\n` +
      `🛂 *Passport Type:* ${data.passportType || 'E-Passport'}\n` +
      `📌 *Category:* ${data.applicationCategory || 'New Application'}\n` +
      `📅 *Submission Date:* ${data.submissionDate || 'Today'}\n` +
      `📞 *Mobile:* ${data.applicantPhone || 'N/A'}\n\n` +
      `📌 *Status:* Passport file received and logged in official processing queue.\n\n` +
      `🏢 *Plexivia*\n` +
      `📍 Head Office: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={BookOpen}
        title={`Passport Submission Receipt & Intake Token (${data.trackingNo || 'PASS-OFFICIAL'})`}
        subtitle="Official agency passport submission acknowledgement token, original document receipt, and verification slip generator."
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
          <PassportSubmissionForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <PassportSubmissionPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <PassportSubmissionPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <PassportSubmissionForm
              data={data}
              onChange={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <PassportSubmissionPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default PassportSubmission;

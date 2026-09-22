import React, { useState, useEffect } from 'react';
import { JobVerificationForm } from './JobVerificationForm';
import { JobVerificationPreview } from './JobVerificationPreview';
import { getDefaultJobVerificationData, generateUniqueJobVerificationId } from './sampleData';
import { RefreshCw, Briefcase, Share2, Printer } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function JobVerification({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(() => {
    if (initialData) {
      return { ...getDefaultJobVerificationData(), ...initialData, isLocked };
    }
    return getDefaultJobVerificationData();
  });

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
    setData(getDefaultJobVerificationData());
    toast.info('Job verification form reset to default.');
  };

  const handleFormSubmit = async () => {
    const payload = { ...data };
    if (!payload.verificationId) {
      delete payload.verificationId;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/job-verifications/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/job-verifications', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedId = savedDoc.verificationId || generateUniqueJobVerificationId();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          verificationId: returnedId,
        }));
        toast.success(
          isEdit
            ? `Job verification updated successfully! (ID: ${returnedId})`
            : `Job verification saved to database! (ID: ${returnedId})`
        );
        setViewMode('preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackId = data.verificationId || generateUniqueJobVerificationId();
      setData((prev) => ({
        ...prev,
        verificationId: fallbackId,
      }));
      toast.info(`Job verification document ready! (ID: ${fallbackId})`);
      setViewMode('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onSavedSuccess) onSavedSuccess({ verificationId: fallbackId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data?.verificationId,
      docType: 'Job_Verification',
      clientName: data?.clientInfo?.clientName || data?.employeeName,
      elementId: 'job-verification-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const employee = data.employeeName || 'Applicant';
    const passport = data.passportNumber || 'N/A';
    const destination = data.destinationCountry || 'Overseas';
    const jobTitle = data.jobStayDetails?.jobTitle || 'N/A';
    const helperName = data.helperDetails?.name || 'Authorized Sponsor';

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Job & Stay Verification Certificate (${data.verificationId || 'JVF-OFFICIAL'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Candidate:* ${employee}\n` +
      `🛂 *Passport:* ${passport}\n` +
      `🌍 *Destination Country:* ${destination}\n` +
      `💼 *Job Title:* ${jobTitle}\n` +
      `🤝 *Sponsor / Helper:* ${helperName}\n` +
      `💰 *Agreed Salary:* ${data.jobStayDetails?.salaryAmount || 'N/A'} ${data.jobStayDetails?.currency || 'EUR'}\n` +
      `✅ *Verification Status:* Verified & Approved\n\n` +
      `🏢 *Plexivia*\n` +
      `📍 ${data.companyInfo?.companyAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}\n` +
      `📞 Phone: ${data.companyInfo?.companyPhone || '+8801345579534'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <HeaderTitle
        icon={Briefcase}
        title={`Job Verification Document Generator (${data.verificationId || 'JVF-OFFICIAL'})`}
        subtitle="Official overseas employment, workplace sponsor and stay verification dossier generator for immigration and embassy authorities."
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
          <JobVerificationForm
            formData={data}
            setFormData={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <JobVerificationPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <JobVerificationPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <JobVerificationForm
              formData={data}
              setFormData={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <JobVerificationPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default JobVerification;

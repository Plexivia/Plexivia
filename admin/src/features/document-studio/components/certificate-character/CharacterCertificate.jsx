import React, { useState, useEffect } from 'react';
import { CharacterCertificateForm } from './CharacterCertificateForm';
import { CharacterCertificatePreview } from './CharacterCertificatePreview';
import { SAMPLE_CHARACTER_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, ShieldCheck, Printer, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function CharacterCertificate({ initialData = null, isLocked = false, onSavedSuccess = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(() => ({
    ...SAMPLE_CHARACTER_CERTIFICATE,
    ...(initialData || {}),
    candidateName: initialData?.candidateName || initialData?.client?.fullName || initialData?.clientName || SAMPLE_CHARACTER_CERTIFICATE.client?.fullName,
  }));
  const [viewMode, setViewMode] = useState('edit');

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        candidateName: initialData.candidateName || initialData.client?.fullName || initialData.clientName || prev.candidateName,
      }));
    }
  }, [initialData]);

  const handleResetSample = () => {
    setData(SAMPLE_CHARACTER_CERTIFICATE);
  };

  const handleSave = async () => {
    const candidateName = data.client?.fullName || data.candidateName;
    if (!candidateName) {
      toast.error('Candidate Full Name is required to save.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/character-certificates/${data._id}`, data)
        : await apiClient.post('/api/v1/client/docs/character-certificates', data);

      const savedDoc = res.data?.data;
      if (savedDoc) {
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          certificateNo: savedDoc.certificateNo,
        }));
        toast.success(
          isEdit
            ? `Character certificate updated successfully! (${savedDoc.certificateNo})`
            : `Character certificate saved successfully! (${savedDoc.certificateNo})`
        );
        setViewMode('preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      }
    } catch (err) {
      console.warn('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save character certificate to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Character_Certificate',
      clientName: data.client?.fullName || data.candidateName,
      elementId: 'character-certificate-canvas',
    });
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={ShieldCheck}
        title="Character Certificate & Testimonial Generator"
        subtitle="Generate official character certificates, good conduct letters, and institutional testimonials for visa & embassy dossiers."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetSample}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Store'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
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
          <CharacterCertificateForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <CharacterCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <CharacterCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CharacterCertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <CharacterCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CharacterCertificate;

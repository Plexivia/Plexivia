import React, { useState, useEffect } from 'react';
import { MarriageCertificateForm } from './MarriageCertificateForm';
import { MarriageCertificatePreview } from './MarriageCertificatePreview';
import { SAMPLE_MARRIAGE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Heart, Printer, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function MarriageCertificate({ initialData = null, isLocked = false, onSavedSuccess = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(() => ({
    ...SAMPLE_MARRIAGE_CERTIFICATE,
    ...(initialData || {}),
    groomName: initialData?.groomName || initialData?.groom?.name || initialData?.clientName || SAMPLE_MARRIAGE_CERTIFICATE.groom?.name,
  }));
  const [viewMode, setViewMode] = useState('edit');

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        groomName: initialData.groomName || initialData.groom?.name || initialData.clientName || prev.groomName,
      }));
    }
  }, [initialData]);

  const handleResetSample = () => {
    setData(SAMPLE_MARRIAGE_CERTIFICATE);
  };

  const handleSave = async () => {
    const groomName = data.groom?.name || data.groomName;
    const brideName = data.bride?.name || data.brideName;
    if (!groomName || !brideName) {
      toast.error('Groom Name and Bride Name are required to save.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/marriage-certificates/${data._id}`, data)
        : await apiClient.post('/api/v1/client/docs/marriage-certificates', data);

      const savedDoc = res.data?.data;
      if (savedDoc) {
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          certificateNo: savedDoc.certificateNo,
        }));
        toast.success(
          isEdit
            ? `Marriage certificate updated successfully! (${savedDoc.certificateNo})`
            : `Marriage certificate saved successfully! (${savedDoc.certificateNo})`
        );
        setViewMode('preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      }
    } catch (err) {
      console.warn('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save marriage certificate to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Marriage_Certificate',
      clientName: data.groom?.name ? `${data.groom.name}_and_${data.bride?.name || ''}` : 'Marriage',
      elementId: 'marriage-certificate-canvas',
    });
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Heart}
        title="Marriage Certificate Generator"
        subtitle="Generate official Muslim / Civil marriage certificate and Nikahnama translation dossiers for spouse visa and immigration."
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
          <MarriageCertificateForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <MarriageCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <MarriageCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <MarriageCertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <MarriageCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default MarriageCertificate;

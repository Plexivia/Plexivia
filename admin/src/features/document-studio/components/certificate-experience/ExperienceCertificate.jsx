import React, { useState, useEffect } from 'react';
import { ExperienceCertificateForm } from './ExperienceCertificateForm';
import { ExperienceCertificatePreview } from './ExperienceCertificatePreview';
import { SAMPLE_EXPERIENCE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Award, Printer } from 'lucide-react';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function ExperienceCertificate({ initialData = null, isLocked = false, onSavedSuccess = null }) {
  const [data, setData] = useState(() => ({
    ...SAMPLE_EXPERIENCE_CERTIFICATE,
    ...(initialData || {}),
    employeeName: initialData?.employeeName || initialData?.clientName || SAMPLE_EXPERIENCE_CERTIFICATE.employeeName,
  }));
  const [viewMode, setViewMode] = useState('edit');

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        employeeName: initialData.employeeName || initialData.clientName || prev.employeeName,
      }));
    }
  }, [initialData]);

  const handleResetSample = () => {
    setData(SAMPLE_EXPERIENCE_CERTIFICATE);
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Experience_Certificate',
      clientName: data.employeeName,
      elementId: 'experience-certificate-canvas',
    });
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Award}
        title="Experience Certificate Generator"
        subtitle="Create professional employment experience certificates and service letters for embassy, work permit, and immigration dossiers."
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
          <ExperienceCertificateForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <ExperienceCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <ExperienceCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <ExperienceCertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <ExperienceCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default ExperienceCertificate;

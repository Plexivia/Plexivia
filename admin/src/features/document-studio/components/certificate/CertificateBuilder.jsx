import React, { useState } from 'react';
import { CertificateForm } from './CertificateForm';
import { CertificatePreview } from './CertificatePreview';
import { ExportModal } from '../common/ExportModal';
import { SAMPLE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Award } from 'lucide-react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function CertificateBuilder() {
  const [data, setData] = useState(SAMPLE_CERTIFICATE);
  const [viewMode, setViewMode] = useState('edit');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleResetSample = () => {
    setData(SAMPLE_CERTIFICATE);
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Award}
        title="Institutional Certificate Generator"
        subtitle="Generate and export official institutional certificates, character references, and testimonials."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetSample}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Sample Certificate Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset Sample</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      {viewMode === 'edit' && (
        <div className="w-full pb-16">
          <CertificateForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <CertificatePreview data={data} onPrint={() => setIsExportOpen(true)} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <CertificatePreview data={data} onPrint={() => setIsExportOpen(true)} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full">
            <CertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <CertificatePreview data={data} onPrint={() => setIsExportOpen(true)} />
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documentTitle={`${data.client.fullName} - Character Certificate`}
        data={data}
        elementId="printable-certificate-canvas"
      />

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CertificateBuilder;

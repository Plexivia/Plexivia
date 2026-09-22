import React, { useState } from 'react';
import { ResumeForm } from './ResumeForm';
import { ResumePreview } from './ResumePreview';
import { ExportModal } from '../common/ExportModal';
import { getDefaultResumeData } from './sampleData';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function ResumeBuilder() {
  const [data, setData] = useState(getDefaultResumeData());
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleResetSample = () => {
    setData(getDefaultResumeData());
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={FileText}
        title="Curriculum Vitae & Resume Builder"
        subtitle="Generate and print official standardized overseas employment biodata and professional resumes."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetSample}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset</span>
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
          <ResumeForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <ResumePreview data={data} onPrint={() => setIsExportOpen(true)} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <ResumePreview data={data} onPrint={() => setIsExportOpen(true)} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full">
            <ResumeForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <ResumePreview data={data} onPrint={() => setIsExportOpen(true)} />
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documentTitle={`${data.personalInfo.fullName} - Resume`}
        data={data}
        elementId="printable-resume-canvas"
      />

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default ResumeBuilder;

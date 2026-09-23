import React, { useState, useEffect, useRef } from 'react';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Download, Sparkles, RefreshCw, Contact } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import agencyInfo from '@/lib/information.json';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function IdCard({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isExporting, setIsExporting] = useState(false);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  const defaultSampleData = {
    fullName: '',
    role: '',
    idNumber: '',
    joiningDate: new Date().toISOString().split('T')[0],
    bloodGroup: '',
    contactPhone: '',
    email: agencyInfo.email || '',
    address: agencyInfo.address?.full || '',
    website: agencyInfo.website || '',
    signatureName: agencyInfo.proprietor?.name || '',
    signatureTitle: '',
    photo: null,
    qrData: '',
    ...initialData,
    isLocked,
  };

  const [cardData, setCardData] = useState(defaultSampleData);

  useEffect(() => {
    if (initialData) {
      setCardData((prev) => ({
        ...prev,
        ...initialData,
        isLocked,
      }));
    }
  }, [initialData, isLocked]);

  const isFormValid = Boolean(
    cardData.photo &&
    cardData.fullName?.trim() &&
    cardData.role?.trim() &&
    cardData.idNumber?.trim() &&
    cardData.joiningDate?.trim() &&
    cardData.bloodGroup?.trim() &&
    cardData.contactPhone?.trim() &&
    cardData.email?.trim() &&
    cardData.address?.trim() &&
    cardData.signatureName?.trim()
  );

  const handleResetSample = () => {
    setCardData(defaultSampleData);
    toast.info('ID card form has been reset.');
  };

  const handleExportPNG = async (side) => {
    if (!isFormValid) {
      toast.error('All fields and photo are required to download ID card!');
      return;
    }
    const targetRef = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!targetRef) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(targetRef, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `ID-Card-${cardData.fullName || 'Employee'}-${side}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`${side === 'front' ? 'Front' : 'Back'} side ID card downloaded successfully as PNG image!`);
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('Failed to download image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Contact}
        title="Employee Identity Card Generator"
        subtitle="Generate and export official high-resolution dual-sided employee identity cards with photo and verifiable QR code."
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
              type="button"
              onClick={() => handleExportPNG('front')}
              disabled={!isFormValid || isExporting}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isFormValid ? 'All fields and photo required' : 'Download Front PNG'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Front PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportPNG('back')}
              disabled={!isFormValid || isExporting}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isFormValid ? 'All fields and photo required' : 'Download Back PNG'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Back PNG</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="w-full pb-16">
          <IdCardForm
            cardData={cardData}
            setCardData={setCardData}
            onResetSample={handleResetSample}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full bg-muted/20 border border-border p-6 rounded-2xl flex flex-col items-center justify-center min-h-[550px] overflow-x-auto shadow-xs pb-16">
          <IdCardPreview
            cardData={cardData}
            frontRef={frontCardRef}
            backRef={backCardRef}
          />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <IdCardForm
              cardData={cardData}
              setCardData={setCardData}
              onResetSample={handleResetSample}
            />
          </div>
          <div className="w-full bg-muted/20 border border-border p-6 rounded-2xl flex flex-col items-center justify-center min-h-[550px] overflow-x-auto shadow-xs">
            <IdCardPreview
              cardData={cardData}
              frontRef={frontCardRef}
              backRef={backCardRef}
            />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default IdCard;

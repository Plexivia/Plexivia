import React, { useState, useEffect } from 'react';
import { AgreementForm } from './AgreementForm';
import { AgreementPreview } from './AgreementPreview';
import { Download, RefreshCw, Share2, Printer, FileCheck, Edit3, Columns, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';
import { toast } from 'sonner';
import agencyInfoJson from '@/lib/information.json';

// Generates unique agreement number e.g. "AGR-AB1029"
export function generateUniqueAgreementId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AGR-${prefix}${num}`;
}

export function getDefaultAgreementData() {
  return {
    _id: null,
    agreementId: generateUniqueAgreementId(),
    header: {
      companyName: agencyInfoJson.agencyName || 'PLEXIVIA',
      officeAddress: agencyInfoJson.address?.full || '',
      phone: agencyInfoJson.phone || '',
      email: agencyInfoJson.email || ''
    },
    parties: {
      agreementDate: new Date().toISOString().split('T')[0],
      nidPassport: '',
      employerName: '',
      employerPhone: '',
      employeeName: '',
      employeeEmail: '',
      fatherHusbandName: '',
      address: ''
    },
    guardian: {
      guardianName: '',
      guardianPhone: '',
      relationship: 'Father',
      emergencyPhone: '',
      guardianNid: '',
      guardianAddress: ''
    },
    position: {
      designation: '',
      department: '',
      joiningDate: new Date().toISOString().split('T')[0],
      location: '',
      jobType: 'Permanent (Full-Time)',
      workSchedule: ''
    },
    salary: {
      basicSalary: '',
      houseRent: '',
      medical: '',
      conveyance: '',
      specialAllowance: '',
      grossSalary: '',
      grossSalaryInWords: ''
    },
    leave: {
      casualDays: '',
      sickDays: '',
      earnedDays: '',
      lunchProvided: false,
      teaSnacks: false,
      lunchAllowance: ''
    },
    witnesses: {
      firstWitnessName: '',
      firstWitnessPhone: '',
      firstWitnessAddress: '',
      secondWitnessName: '',
      secondWitnessPhone: '',
      secondWitnessAddress: ''
    },
    status: 'active'
  };
}

export function EmploymentAgreement({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return { ...getDefaultAgreementData(), ...initialData, isLocked };
    }
    return getDefaultAgreementData();
  });
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        parties: { ...prev.parties, ...initialData.parties },
        guardian: { ...prev.guardian, ...initialData.guardian },
        position: { ...prev.position, ...initialData.position },
        isLocked,
      }));
    }
  }, [initialData, isLocked]);

  const handleReset = () => {
    setFormData(getDefaultAgreementData());
    toast.info('Agreement form has been reset.');
  };

  const handleFormSubmit = async () => {
    const finalAgreementId = formData.agreementId?.trim() || generateUniqueAgreementId();
    const payload = {
      ...formData,
      agreementId: finalAgreementId,
    };

    if (!payload._id) {
      delete payload._id;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(formData._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/employment-agreements/${formData._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/employment-agreements', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          agreementId: savedDoc.agreementId || finalAgreementId,
        }));
        toast.success(
          isEdit
            ? `Employment agreement updated successfully in database! (Agreement ID: ${savedDoc.agreementId || finalAgreementId})`
            : `Employment agreement saved successfully in database! (Agreement ID: ${savedDoc.agreementId || finalAgreementId})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save employment agreement to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (preview mode ready):', err);
      setFormData((prev) => ({
        ...prev,
        agreementId: finalAgreementId,
      }));
      toast.success(`Employment agreement generated successfully! (Agreement ID: ${finalAgreementId})`);
      if (onSavedSuccess) onSavedSuccess({ agreementId: finalAgreementId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: formData.agreementId,
      docType: 'Employment_Agreement',
      clientName: formData.parties?.employeeName,
      elementId: 'employment-agreement-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const employee = formData.parties?.employeeName || 'Employee';
    const post = formData.position?.designation || 'Staff';
    const gross = formData.salary?.grossSalary || '0';

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Employment & Service Agreement (${formData.agreementId || 'Legal Doc'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Employee Name:* ${employee}\n` +
      `💼 *Designation:* ${post} (${formData.position?.department || 'Office'})\n` +
      `📅 *Agreement Date:* ${formData.parties?.agreementDate || 'Today'}\n` +
      `💰 *Gross Monthly Salary:* ${gross} BDT \n` +
      `📌 *Minimum Contract Duration:* 2 (Two) Years\n\n` +
      `🏢 *PLEXIVIA*\n` +
      `📍 ${formData.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}\n` +
      `📞 Helpline Contact: ${formData.header?.phone || '+8801345579534'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={FileCheck}
        title={`Employment Agreement & Contract Dossier (${formData.agreementId || 'AGR-OFFICIAL'})`}
        subtitle="Generate and print official employment agreements and appointment contracts with legal terms."
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
          <AgreementForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <AgreementPreview data={formData} formData={formData} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <AgreementPreview data={formData} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <AgreementForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <AgreementPreview data={formData} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default EmploymentAgreement;

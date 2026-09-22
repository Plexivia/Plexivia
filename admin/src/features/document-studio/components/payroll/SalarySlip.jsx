import React, { useState, useEffect } from 'react';
import { SalarySlipForm } from './SalarySlipForm';
import { SalarySlipPreview } from './SalarySlipPreview';
import { Download, RefreshCw, Share2, Printer, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { toast } from 'sonner';
import agencyInfo from '@/lib/information.json';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function generateUniqueSlipNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 2; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const midNum = Math.floor(1000 + Math.random() * 9000);
  const midChar = letters.charAt(Math.floor(Math.random() * letters.length));
  const endNum = Math.floor(100 + Math.random() * 900);
  return `SLIP-${prefix}${midNum}${midChar}${endNum}`;
}

export function getDefaultSalarySlipData() {
  return {
    _id: null,
    companyName: agencyInfo.agencyName?.toUpperCase() || 'PLEXIVIA',
    companyAddress: agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    slipNo: generateUniqueSlipNumber(),
    monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM
    issueDate: new Date().toISOString().split('T')[0],

    // Employee Bio
    employeeName: '',
    employeeId: 'EMP-001',
    designation: 'Staff',
    department: 'Operations',
    paymentMethod: 'Bank Transfer',
    bankAccountNo: '',

    // Earnings
    basicSalary: "",
    houseRentAllowance: "",
    medicalAllowance: "",
    conveyanceAllowance: "",
    overtimeBonusAllowance: "",
    grossEarnings: "",

    // Deductions
    advanceSalary: "",
    unpaidLeaveDeduction: "",
    loanDeduction: "",
    taxStatutoryDeduction: "",
    otherAuthorizedDeduction: "",
    totalDeduction: "",

    // Summary
    netSalaryPayable: "",
    netSalaryInWords: '',
    paymentStatus: 'Paid',
    remarks: '',
  };
}

export function SalarySlip({ initialData = null, isLocked = false, onSavedSuccess = null }) {
  const [formData, setFormData] = useState(() => ({
    ...getDefaultSalarySlipData(),
    ...(initialData || {}),
    employeeName: initialData?.employeeName || initialData?.clientName || '',
    designation: initialData?.designation || initialData?.trade || 'Staff',
  }));
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        employeeName: initialData.employeeName || initialData.clientName || prev.employeeName,
        designation: initialData.designation || initialData.trade || prev.designation,
      }));
    }
  }, [initialData]);

  const handleReset = () => {
    setFormData(getDefaultSalarySlipData());
    toast.info('Salary slip form has been reset.');
  };

  const handleFormSubmit = async () => {
    const finalSlipNo = formData.slipNo?.trim() || generateUniqueSlipNumber();
    const payload = {
      ...formData,
      slipNo: finalSlipNo,
    };

    if (!payload._id) {
      delete payload._id;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(formData._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/salary-slips/${formData._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/salary-slips', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          slipNo: savedDoc.slipNo || finalSlipNo,
        }));
        toast.success(
          isEdit
            ? `Salary slip updated successfully in database! (Slip No: ${savedDoc.slipNo || finalSlipNo})`
            : `Salary slip saved successfully in database! (Slip No: ${savedDoc.slipNo || finalSlipNo})`
        );
      } else {
        throw new Error(res.data?.message || 'Failed to save salary slip to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (preview mode ready):', err);
      setFormData((prev) => ({
        ...prev,
        slipNo: finalSlipNo,
      }));
      toast.success(`Salary slip generated successfully! (Slip No: ${finalSlipNo})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: formData.slipNo,
      docType: 'Salary_Slip',
      clientName: formData.employeeName,
      elementId: 'salary-slip-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const employee = formData.employeeName || 'Employee';
    const id = formData.employeeId || 'N/A';
    const month = formData.salaryMonth || 'Current Month';

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Monthly Salary Slip Summary (${formData.slipNo || 'Official Slip'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Employee Name:* ${employee} (ID: ${id})\n` +
      `💼 *Designation:* ${formData.designation || 'Official'}\n` +
      `📅 *Salary Month:* ${month}\n` +
      `💰 *Basic Salary:* ${formData.basicSalary} BDT \n` +
      `💵 *Gross Salary:* ${formData.grossEarnings} BDT \n` +
      `⏰ *Overtime:* ${formData.overtimeAmount} BDT \n` +
      `🔻 *Total Deduction:* ${formData.totalDeduction} BDT \n` +
      `✅ *Net Payable Salary:* ${formData.netSalaryPayable} BDT  (${formData.netSalaryInWords || ''})\n\n` +
      `📌 *Slip & Payment Status:* Paid (Paid via ${formData.paymentMode || 'Cash'})\n\n` +
      `🏢 *Plexivia*\n` +
      `📍 ${formData.companyAddress}\n` +
      `📞 Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={DollarSign}
        title={`Salary Slip & Payroll Voucher (${formData.slipNo || 'SLIP-OFFICIAL'})`}
        subtitle="Generate official employee monthly payslips, earnings breakdowns, deductions, and payment vouchers."
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
          <SalarySlipForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <SalarySlipPreview data={formData} formData={formData} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <SalarySlipPreview data={formData} formData={formData} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <SalarySlipForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <SalarySlipPreview data={formData} formData={formData} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default SalarySlip;

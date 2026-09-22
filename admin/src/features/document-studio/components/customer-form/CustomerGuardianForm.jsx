import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Building,
  Save,
  DollarSign,
  Activity,
  Layers,
  Paperclip,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Download,
  Camera,
  ExternalLink,
  X,
  UserCheck,
  Loader2
} from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { SERVICE_TYPES, STATUS_OPTIONS, getServiceLabel, getStatusLabel } from './sampleData';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { useClientLookup } from '../common/useClientLookup';
import { validateBdPhone } from '../common/phoneValidator';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ClientGuardianForm({ data, onChange, onReset, onSave, onPreview, isSubmitting }) {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    onChange(prev => ({
      ...prev,
      clientId: c._id,
      clientDid: c.did,
      linkedCaseId: detectedMatch.caseFile?._id || null,
      linkedCaseDid: detectedMatch.caseFile?.did || null,
      client: {
        ...prev.client,
        fullName: c.fullName || prev.client.fullName,
        nidNumber: c.nidNumber || prev.client.nidNumber,
        passportNumber: c.passportNumber || prev.client.passportNumber,
        mobileNumber: c.phone || prev.client.mobileNumber,
        email: c.email || prev.client.email,
        fatherName: c.fatherName || prev.client.fatherName,
        motherName: c.motherName || prev.client.motherName,
        presentAddress: c.presentAddress || c.address || prev.client.presentAddress,
      },
      guardian: {
        ...prev.guardian,
        fullName: c.guardian?.name || prev.guardian.fullName,
        mobileNumber: c.guardian?.phone || prev.guardian.mobileNumber,
        nidNumber: c.guardian?.nidNumber || prev.guardian.nidNumber,
        relationship: c.guardian?.relationship || prev.guardian.relationship,
        address: c.guardian?.address || prev.guardian.address,
      },
      attachments: {
        ...prev.attachments,
        passportPhoto: c.attachments?.photo || prev.attachments.passportPhoto,
        passportScan: c.attachments?.passportScan || prev.attachments.passportScan,
        nidScan: c.attachments?.nidScan || prev.attachments.nidScan,
      }
    }));
    toast.success(`"${c.fullName}" info auto-filled from database!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange(prev => ({
      ...prev,
      client: { ...prev.client, mobileNumber: '', email: '' },
    }));
    resetLookup(val);
    toast.info('Please enter a different phone number or email.');
    setDetectedMatch(null);
  };

  const handleClientChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      client: { ...prev.client, [field]: value }
    }));

    // Trigger lookup for mobileNumber, email, or passportNumber
    if (field === 'mobileNumber' || field === 'email' || field === 'passportNumber') {
      triggerLookup(value);
    }
  };

  const handleGuardianChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      guardian: { ...prev.guardian, [field]: value }
    }));
  };

  const handlePaymentChange = (field, value) => {
    onChange(prev => {
      const updatedPayment = { ...prev.payment, [field]: value };
      const total = Number(field === 'totalAmount' ? value : updatedPayment.totalAmount) || 0;
      const advance = Number(field === 'advancePaid' ? value : updatedPayment.advancePaid) || 0;
      updatedPayment.dueAmount = Math.max(0, total - advance);

      if (total > 0 && advance >= total) {
        updatedPayment.paymentStatus = 'Paid';
      } else if (advance > 0) {
        updatedPayment.paymentStatus = 'Partial';
      } else {
        updatedPayment.paymentStatus = 'Unpaid';
      }

      return { ...prev, payment: updatedPayment };
    });
  };

  const handleAttachmentUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error('File size must be under 8 MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(prev => ({
          ...prev,
          attachments: {
            ...(prev.attachments || {}),
            [field]: reader.result
          }
        }));
        toast.success('Document uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (field) => {
    onChange(prev => ({
      ...prev,
      attachments: {
        ...(prev.attachments || {}),
        [field]: ''
      }
    }));
    toast.info('Document deleted successfully.');
  };

  const handleOtherFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10 MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile = {
          name: file.name,
          fileType: file.type || 'document',
          fileData: reader.result,
          uploadedAt: new Date().toISOString()
        };
        onChange(prev => ({
          ...prev,
          attachments: {
            ...(prev.attachments || {}),
            otherFiles: [...(prev.attachments?.otherFiles || []), newFile]
          }
        }));
        toast.success(`"${file.name}" added successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveOtherFile = (index) => {
    onChange(prev => ({
      ...prev,
      attachments: {
        ...(prev.attachments || {}),
        otherFiles: (prev.attachments?.otherFiles || []).filter((_, idx) => idx !== index)
      }
    }));
  };

  const handleDocChange = (index, field, value) => {
    onChange(prev => {
      const updated = [...(prev.requirementDocuments || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, requirementDocuments: updated };
    });
  };

  const handleRowFileUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('clientForm.fileTooLarge', 'File size must be under 20 MB!'));
      return;
    }

    setUploadingDocIndex(index);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;

      try {
        const clientId = data.clientUniqueId || data.clientId || data.client_id || data._id || detectedMatch?.client?._id || detectedMatch?.client?.clientUniqueId;
        const queryParams = new URLSearchParams();
        if (clientId) {
          queryParams.append('clientId', clientId);
        } else {
          queryParams.append('documentType', 'clientForm');
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedUrl = res.data?.data?.url || res.data?.data?.fullUrl || dataUrl;
        const r2Key = res.data?.data?.r2Key || null;

        onChange(prev => {
          const list = [...(prev.requirementDocuments || [])];
          list[index] = {
            ...list[index],
            fileName: file.name,
            fileType: file.type || 'document',
            fileUrl: uploadedUrl,
            fileData: dataUrl,
            r2Key: r2Key,
            uploadedAt: new Date().toISOString(),
            submitted: 'Yes'
          };
          return { ...prev, requirementDocuments: list };
        });

        toast.success(`"${file.name}" ${t('clientForm.uploadedSuccess', 'uploaded successfully!')}`);
      } catch (err) {
        console.warn('API Upload fallback to local data URL:', err);
        onChange(prev => {
          const list = [...(prev.requirementDocuments || [])];
          list[index] = {
            ...list[index],
            fileName: file.name,
            fileType: file.type || 'document',
            fileUrl: dataUrl,
            fileData: dataUrl,
            uploadedAt: new Date().toISOString(),
            submitted: 'Yes'
          };
          return { ...prev, requirementDocuments: list };
        });
        toast.info(`"${file.name}" added successfully.`);
      } finally {
        setUploadingDocIndex(null);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveRowFile = (index) => {
    onChange(prev => {
      const list = [...(prev.requirementDocuments || [])];
      list[index] = {
        ...list[index],
        fileName: '',
        fileType: '',
        fileUrl: '',
        fileData: '',
        r2Key: null,
        uploadedAt: null
      };
      return { ...prev, requirementDocuments: list };
    });
    toast.info(t('clientForm.fileRemoved', 'Document attachment removed.'));
  };

  const handleAddDoc = () => {
    onChange(prev => {
      const list = prev.requirementDocuments || [];
      const newDoc = {
        id: list.length + 1,
        name: 'New Required Document',
        submitted: 'Yes',
        remarks: '',
        fileName: '',
        fileType: '',
        fileUrl: '',
        fileData: '',
        r2Key: null,
        uploadedAt: null
      };
      return { ...prev, requirementDocuments: [...list, newDoc] };
    });
  };

  const handleRemoveDoc = (index) => {
    onChange(prev => {
      const updated = prev.requirementDocuments.filter((_, idx) => idx !== index);
      const reindexed = updated.map((item, i) => ({ ...item, id: i + 1 }));
      return { ...prev, requirementDocuments: reindexed };
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* SERVICE & STATUS CONTROL BAR */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              {t('clientForm.serviceType', 'Service Type')}
            </label>
            <select
              value={data.serviceType || 'Indian Visa Application'}
              onChange={(e) => onChange(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {SERVICE_TYPES.map((st, i) => (
                <option key={st.id || i} value={st.label}>
                  {isBn ? st.bn : st.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              {t('clientForm.fileStatus', 'File Processing Status')}
            </label>
            <select
              value={data.status || 'received'}
              onChange={(e) => onChange(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-bold text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {STATUS_OPTIONS.map((so) => (
                <option key={so.id} value={so.id}>
                  {isBn ? so.bn : so.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-foreground">{t('clientForm.applicationNo', 'Application No.')}</label>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                Auto-generated
              </span>
            </div>
            <input
              type="text"
              value={data.applicationNo || 'Auto-generated'}
              readOnly
              disabled
              className="w-full px-3 py-2 bg-muted/60 border border-border rounded-lg text-muted-foreground font-mono font-bold text-xs cursor-not-allowed select-none outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">{t('clientForm.dateReceived', 'Date Received')}</label>
            <DatePicker
              value={data.dateReceived || ''}
              onChange={(val) => onChange(prev => ({ ...prev, dateReceived: val, declarationDate: val }))}
            />
          </div>
        </div>
      </div>

      {/* 1. CUSTOMER DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>{t('clientForm.clientDetails', '1. Client Details')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              {t('clientForm.fullName', 'Full Name')} <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder={t('clientForm.fullNamePlaceholder', 'Enter client full name')}
              value={data.client?.fullName || ''}
              onChange={(e) => handleClientChange('fullName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              {t('clientForm.nidNumber', 'NID Number')} <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder={t('clientForm.nidPlaceholder', 'National ID card number')}
              value={data.client?.nidNumber || ''}
              onChange={(e) => handleClientChange('nidNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.passportNumber', 'Passport Number')}</label>
            <input
              type="text"
              placeholder={t('clientForm.passportPlaceholder', 'Passport number')}
              value={data.client?.passportNumber || ''}
              onChange={(e) => handleClientChange('passportNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1 leading-tight truncate" title="Country previously applied to and rejected by">
              {t('clientForm.rejectedCountry', 'Rejected Country (if any)')}
            </label>
            <input
              type="text"
              placeholder={t('clientForm.rejectedCountryPlaceholder', 'Previously rejected country (if any)')}
              value={data.client?.countryRejected || ''}
              onChange={(e) => handleClientChange('countryRejected', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.fatherName', "Father's Name")}</label>
            <input
              type="text"
              placeholder={t('clientForm.fatherNamePlaceholder', "Enter father's name")}
              value={data.client?.fatherName || ''}
              onChange={(e) => handleClientChange('fatherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.motherName', "Mother's Name")}</label>
            <input
              type="text"
              placeholder={t('clientForm.motherNamePlaceholder', "Enter mother's name")}
              value={data.client?.motherName || ''}
              onChange={(e) => handleClientChange('motherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.mobileNumber', 'Phone Number')}</label>
            <BdPhoneInput
              value={data.client?.mobileNumber || ''}
              onChange={(val) => handleClientChange('mobileNumber', val)}
            />
            {data.client?.mobileNumber && !validateBdPhone(data.client.mobileNumber).isValid && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.client.mobileNumber).error}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.emailAddress', 'Email Address')}</label>
            <input
              type="email"
              placeholder={t('clientForm.emailPlaceholder', 'Email address')}
              value={data.client?.email || ''}
              onChange={(e) => handleClientChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. GUARDIAN DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Users className="w-4 h-4 text-sky-200" />
          <span>{t('clientForm.guardianDetails', '2. Guardian Details')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.guardianFullName', 'Guardian Full Name')}</label>
            <input
              type="text"
              placeholder={t('clientForm.guardianFullNamePlaceholder', 'Guardian full name')}
              value={data.guardian?.fullName || ''}
              onChange={(e) => handleGuardianChange('fullName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.guardianNid', 'NID Card Number')}</label>
            <input
              type="text"
              placeholder={t('clientForm.guardianNidPlaceholder', 'Guardian NID number')}
              value={data.guardian?.nidNumber || ''}
              onChange={(e) => handleGuardianChange('nidNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.fatherName', "Father's Name")}</label>
            <input
              type="text"
              placeholder={t('clientForm.fatherNamePlaceholder', "Enter father's name")}
              value={data.guardian?.fatherName || ''}
              onChange={(e) => handleGuardianChange('fatherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.motherName', "Mother's Name")}</label>
            <input
              type="text"
              placeholder={t('clientForm.motherNamePlaceholder', "Enter mother's name")}
              value={data.guardian?.motherName || ''}
              onChange={(e) => handleGuardianChange('motherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.mobileNumber', 'Phone Number')}</label>
            <BdPhoneInput
              value={data.guardian?.mobileNumber || ''}
              onChange={(val) => handleGuardianChange('mobileNumber', val)}
            />
            {data.guardian?.mobileNumber && !validateBdPhone(data.guardian.mobileNumber).isValid && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.guardian.mobileNumber).error}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.emailAddress', 'Email Address')}</label>
            <input
              type="email"
              placeholder={t('clientForm.emailPlaceholder', 'Email address')}
              value={data.guardian?.email || ''}
              onChange={(e) => handleGuardianChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.relationship', 'Relationship with Client')}</label>
            <input
              type="text"
              placeholder={t('clientForm.relationshipPlaceholder', 'Enter relationship')}
              value={data.guardian?.relationship || ''}
              onChange={(e) => handleGuardianChange('relationship', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">{t('clientForm.guardianAddress', 'Guardian Address')}</label>
            <input
              type="text"
              placeholder={t('clientForm.guardianAddressPlaceholder', 'Village, Post Office, District')}
              value={data.guardian?.address || ''}
              onChange={(e) => handleGuardianChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER REQUIREMENT DOCUMENTS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <FileText className="w-4 h-4 text-sky-200" />
          <span>{t('clientForm.requirementDocs', '3. Client Requirement Documents')}</span>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-xs bg-card shadow-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border text-[11px] uppercase font-bold">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">{t('clientForm.no', 'No.')}</th>
                <th className="py-2.5 px-3">{t('clientForm.requiredDocument', 'Required Document')}</th>
                <th className="py-2.5 px-3 w-36">{t('clientForm.submittedStatus', 'Submitted Status')}</th>
                <th className="py-2.5 px-3 w-48">{t('clientForm.documentFile', 'Document File')}</th>
                <th className="py-2.5 px-3 w-44">{t('clientForm.remarks', 'Remarks')}</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data.requirementDocuments || []).map((doc, idx) => (
                <tr key={doc.id || idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => handleDocChange(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-0 font-medium text-foreground text-xs focus:ring-1 focus:ring-primary rounded"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={doc.submitted || 'Yes'}
                      onChange={(e) => handleDocChange(idx, 'submitted', e.target.value)}
                      className="w-full px-2 py-1 bg-muted/60 border border-border rounded text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="Yes">{t('clientForm.submittedYes', 'Yes (Submitted)')}</option>
                      <option value="No">{t('clientForm.submittedNo', 'No (Missing)')}</option>
                      <option value="Pending">{t('clientForm.submittedPending', 'Pending')}</option>
                      <option value="N/A">{t('clientForm.submittedNa', 'N/A')}</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    {uploadingDocIndex === idx ? (
                      <div className="flex items-center gap-1.5 text-xs text-sky-600 font-semibold px-2.5 py-1 bg-sky-50 rounded-lg border border-sky-200">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('clientForm.uploading', 'Uploading...')}</span>
                      </div>
                    ) : (doc.fileUrl || doc.fileData || doc.fileName) ? (
                      <div className="flex items-center justify-between gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-xs">
                        <div
                          onClick={() => setSelectedPreviewDoc({ title: doc.name || doc.fileName, url: doc.fileUrl || doc.fileData })}
                          className="flex items-center gap-1.5 min-w-0 max-w-[125px] cursor-pointer hover:underline text-emerald-700 font-medium truncate"
                          title={doc.fileName || doc.name}
                        >
                          <FileCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span className="truncate text-[11px]">{doc.fileName || 'Attached Doc'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewDoc({ title: doc.name || doc.fileName, url: doc.fileUrl || doc.fileData })}
                            className="p-0.5 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-100 cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRowFile(idx)}
                            className="p-0.5 text-muted-foreground hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('clientForm.uploadFile', 'Upload')}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf,.doc,.docx"
                          onChange={(e) => handleRowFileUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder={t('clientForm.remarksPlaceholder', 'Remarks...')}
                      value={doc.remarks || ''}
                      onChange={(e) => handleDocChange(idx, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 bg-muted/50 border border-border rounded text-xs text-foreground focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Row Button at bottom of table */}
          <div className="p-2.5 bg-muted/20 border-t border-border flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDoc}
              className="w-full sm:w-auto border-dashed border-sky-400 text-sky-600 hover:bg-sky-50 px-6 py-1.5 rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('clientForm.addNew', 'Add New')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. ADVANCE PAYMENT DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <DollarSign className="w-4 h-4 text-sky-200" />
          <span>{t('clientForm.paymentDetails', '4. Service Fee & Advance Payment')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-muted/30 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground mb-1">{t('clientForm.totalAgreedFee', 'Total Agreed Fee')}</label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-muted-foreground">BDT </span>
              <input
                type="number"
                placeholder="0"
                value={data.payment?.totalAmount || ''}
                onChange={(e) => handlePaymentChange('totalAmount', e.target.value)}
                className="w-full pl-14 pr-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-emerald-600 mb-1">
              {t('clientForm.advancePaid', 'Advance Paid')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-emerald-600">BDT </span>
              <input
                type="number"
                placeholder="0"
                value={data.payment?.advancePaid || ''}
                onChange={(e) => handlePaymentChange('advancePaid', e.target.value)}
                className="w-full pl-14 pr-3 py-2 bg-background border border-emerald-500/40 rounded-lg text-emerald-700 font-mono font-black focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-rose-600 mb-1">
              {t('clientForm.dueAmount', 'Due Amount')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-rose-600">BDT </span>
              <input
                type="number"
                readOnly
                value={data.payment?.dueAmount || 0}
                className="w-full pl-14 pr-3 py-2 bg-muted/60 border border-rose-500/40 rounded-lg text-rose-600 font-mono font-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">{t('clientForm.paymentMethod', 'Payment Method')}</label>
            <select
              value={data.payment?.paymentMethod || 'Cash'}
              onChange={(e) => handlePaymentChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="Cash">{t('clientForm.cash', 'Cash')}</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">{t('clientForm.receiptNo', 'Money Receipt No.')}</label>
            <input
              type="text"
              placeholder="Enter receipt number"
              value={data.payment?.receiptNo || ''}
              onChange={(e) => handlePaymentChange('receiptNo', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-medium focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 5. DOCUMENT ATTACHMENTS (Photos, Passports & Attachments) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-sky-200" />
            <span>{t('clientForm.attachments', '5. Document Attachments')}</span>
          </div>
          <span className="text-[10px] font-normal opacity-80">{t('clientForm.attachmentsSub', 'Upload Images / PDF (Max 10MB)')}</span>
        </div>

        {/* 3 Main Specific Attachment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Passport Size Picture */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  {t('clientForm.passportPhoto', 'Passport Size Photo (2x2)')}
                </span>
                {data.attachments?.passportPhoto && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t('clientForm.attached', 'Attached ✓')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{t('clientForm.passportPhotoSub', 'Client 2x2 lab print photograph')}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded-xl border-2 border-dashed border-border overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-2xs relative">
                {data.attachments?.passportPhoto ? (
                  <img
                    src={data.attachments.passportPhoto}
                    alt="Passport Photo"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedPreviewDoc({ title: t('clientForm.passportPhoto', 'Passport Size Photo (2x2)'), url: data.attachments.passportPhoto })}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors w-full justify-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{data.attachments?.passportPhoto ? t('clientForm.changePhoto', 'Change Photo') : t('clientForm.uploadPhoto', 'Upload Photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAttachmentUpload('passportPhoto', e)}
                    className="hidden"
                  />
                </label>
                {data.attachments?.passportPhoto && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment('passportPhoto')}
                    className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 text-[11px] font-medium w-full justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('clientForm.remove', 'Remove')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Passport Scan Copy */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  {t('clientForm.passportScan', 'Passport Scan Copy')}
                </span>
                {data.attachments?.passportScan && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t('clientForm.attached', 'Attached ✓')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{t('clientForm.passportScanSub', 'Information & signature pages of passport')}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded-xl border-2 border-dashed border-border overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-2xs relative">
                {data.attachments?.passportScan ? (
                  data.attachments.passportScan.startsWith('data:image') ? (
                    <img
                      src={data.attachments.passportScan}
                      alt="Passport Scan"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedPreviewDoc({ title: t('clientForm.passportScan', 'Passport Scan Copy'), url: data.attachments.passportScan })}
                    />
                  ) : (
                    <FileText className="w-7 h-7 text-emerald-500" />
                  )
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors w-full justify-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{data.attachments?.passportScan ? t('clientForm.changeFile', 'Change File') : t('clientForm.uploadFile', 'Upload File')}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleAttachmentUpload('passportScan', e)}
                    className="hidden"
                  />
                </label>
                {data.attachments?.passportScan && (
                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewDoc({ title: t('clientForm.passportScan', 'Passport Scan Copy'), url: data.attachments.passportScan })}
                      className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{t('clientForm.view', 'View')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment('passportScan')}
                      className="text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('clientForm.remove', 'Remove')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: NID Card Scan Copy */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  {t('clientForm.nidScan', 'NID Card Scan Copy')}
                </span>
                {data.attachments?.nidScan && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t('clientForm.attached', 'Attached ✓')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{t('clientForm.nidScanSub', 'Front & back scan copy of NID')}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded-xl border-2 border-dashed border-border overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-2xs relative">
                {data.attachments?.nidScan ? (
                  data.attachments.nidScan.startsWith('data:image') ? (
                    <img
                      src={data.attachments.nidScan}
                      alt="NID Scan"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedPreviewDoc({ title: t('clientForm.nidScan', 'NID Card Scan Copy'), url: data.attachments.nidScan })}
                    />
                  ) : (
                    <FileText className="w-7 h-7 text-purple-500" />
                  )
                ) : (
                  <CreditCard className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors w-full justify-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{data.attachments?.nidScan ? t('clientForm.changeFile', 'Change File') : t('clientForm.uploadFile', 'Upload File')}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleAttachmentUpload('nidScan', e)}
                    className="hidden"
                  />
                </label>
                {data.attachments?.nidScan && (
                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewDoc({ title: t('clientForm.nidScan', 'NID Card Scan Copy'), url: data.attachments.nidScan })}
                      className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{t('clientForm.view', 'View')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment('nidScan')}
                      className="text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('clientForm.remove', 'Remove')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Supporting Documents Multi-File Section */}
        <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" />
                {t('clientForm.otherDocs', 'Other Supporting Documents')}
              </h4>
            </div>

            <label className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs shrink-0">
              <Plus className="w-3.5 h-3.5" />
              <span>+ {t('clientForm.uploadFile', 'Upload File')}</span>
              <input
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleOtherFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* List of uploaded other files */}
          {(data.attachments?.otherFiles || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {data.attachments.otherFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-card border border-border rounded-xl text-xs hover:border-primary/40 transition-colors shadow-2xs"
                >
                  <div
                    className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                    onClick={() => setSelectedPreviewDoc({ title: f.name, url: f.fileData })}
                  >
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate text-[11.5px]">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : 'Attached'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewDoc({ title: f.name, url: f.fileData })}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                      title={t('clientForm.view', 'View')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={f.fileData}
                      download={f.name}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherFile(idx)}
                      className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title={t('clientForm.remove', 'Remove')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-[11.5px] border border-dashed border-border rounded-lg bg-background/50">
              {isBn ? 'No additional documents attached.' : 'No additional documents attached.'}
            </div>
          )}
        </div>
      </div>

      {/* 6. OFFICE NOTES & DECLARATION */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Building className="w-4 h-4 text-primary" />
          <span>{t('clientForm.officeNotes', 'Office Internal Notes')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">{t('clientForm.verifiedBy', 'Verified By (Officer Name)')}</label>
            <input
              type="text"
              value={data.verifiedBy || ''}
              onChange={(e) => onChange(prev => ({ ...prev, verifiedBy: e.target.value }))}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground font-semibold text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-muted-foreground mb-1">{t('clientForm.officeNotes', 'Office Internal Notes')}</label>
            <input
              type="text"
              placeholder={t('clientForm.officeNotesPlaceholder', 'Internal file remarks...')}
              value={data.officeNotes || ''}
              onChange={(e) => onChange(prev => ({ ...prev, officeNotes: e.target.value }))}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bottom Submit / View Preview Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {data._id ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {t('clientForm.updateDb', 'Update Database')}: {data.applicationNo}
            </span>
          ) : (
            <span>{isBn ? 'New application not yet saved to database.' : 'New application not yet saved to database.'}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4" />
            <span>{t('clientForm.printPreview', 'Print Preview')}</span>
          </Button>

          <Button
            type="button"
            variant="success"
            onClick={onSave}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? t('clientForm.saving', 'Saving...') : data._id ? t('clientForm.updateDb', 'Update Database') : t('clientForm.saveDb', 'Save to Database')}</span>
          </Button>
        </div>
      </div>

      {/* Attachment Document Lightbox / Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <span>{selectedPreviewDoc.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewDoc.url}
                  download={selectedPreviewDoc.title}
                  className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/20 rounded-xl p-3 min-h-[300px]">
              {selectedPreviewDoc.url?.startsWith('data:image') || selectedPreviewDoc.url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={selectedPreviewDoc.url}
                  alt={selectedPreviewDoc.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              ) : selectedPreviewDoc.url?.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedPreviewDoc.url}
                  title={selectedPreviewDoc.title}
                  className="w-full h-[65vh] rounded-lg border border-border"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">{selectedPreviewDoc.title}</p>
                  <a
                    href={selectedPreviewDoc.url}
                    download={selectedPreviewDoc.title}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download & View Attachment</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen Freeze Modal: Duplicate / Existing Client Prompt */}
      {detectedMatch && (
        <ExistingClientAlertModal
          client={detectedMatch.client}
          caseFile={detectedMatch.caseFile}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </div>
  );
}

export { ClientGuardianForm as CustomerGuardianForm };
export default ClientGuardianForm;


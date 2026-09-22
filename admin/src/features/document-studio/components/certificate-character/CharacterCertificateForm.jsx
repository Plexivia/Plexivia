import React, { useState } from 'react';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { toast } from 'sonner';
import { Building2, User, FileText, ShieldCheck, Sparkles, Upload, Image, Trash2 } from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';

const AUTHORITY_PRESETS = [
  {
    id: 'ward',
    label: '🏛️ Ward Councillor / Union Parishad',
    data: {
      organizationName: 'OFFICE OF THE WARD COUNCILLOR & LOCAL ADMINISTRATION',
      organizationSubtitle: 'Municipal Corporation / Union Parishad Local Authority',
      designation: 'Elected Ward Councillor & Local Representative',
      sealText: 'OFFICIAL WARD COUNCILLOR SEAL',
    },
  },
  {
    id: 'notary',
    label: '⚖️ Notary Public / Advocate Chamber',
    data: {
      organizationName: 'CHAMBER OF ADVOCATES & NOTARY PUBLIC',
      organizationSubtitle: 'Govt. Appointed Notary Public & Legal Consultant',
      designation: 'Advocate & Notary Public of Bangladesh',
      sealText: 'NOTARY PUBLIC SEAL OF BANGLADESH',
    },
  },
  {
    id: 'employer',
    label: '🏢 Corporate Employer / Agency',
    data: {
      organizationName: 'PLEXIVIA',
      organizationSubtitle: 'Government Authorized Manpower & Travel Management',
      designation: 'Authorized Managing Director',
      sealText: 'AUTHORIZED AGENCY SEAL',
    },
  },
  {
    id: 'college',
    label: '🎓 Educational Institute / Principal',
    data: {
      organizationName: 'GOVT. DEGREE COLLEGE & HIGHER SECONDARY INSTITUTE',
      organizationSubtitle: 'Board of Intermediate and Secondary Education',
      designation: 'Principal & Head of Institute',
      sealText: 'OFFICE OF THE PRINCIPAL SEAL',
    },
  },
];

export function CharacterCertificateForm({ data = {}, onChange }) {
  const [detectedMatch, setDetectedMatch] = useState(null);
  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    onChange((prev) => ({
      ...prev,
      clientId: c._id,
      clientDid: c.did,
      linkedCaseId: detectedMatch.caseFile?._id || null,
      linkedCaseDid: detectedMatch.caseFile?.did || null,
      client: {
        ...prev.client,
        fullName: c.fullName || prev.client?.fullName,
        phone: c.phone || prev.client?.phone,
        passportNo: c.passportNumber || prev.client?.passportNo,
        nidNo: c.nidNumber || prev.client?.nidNo,
        fatherName: c.fatherName || prev.client?.fatherName,
        motherName: c.motherName || prev.client?.motherName,
        permanentAddress: c.presentAddress || c.address || prev.client?.permanentAddress,
      },
    }));
    toast.success(`"${c.fullName}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange((prev) => ({ ...prev, client: { ...prev.client, phone: '' } }));
    resetLookup(val);
    toast.info('Please enter a different phone number.');
    setDetectedMatch(null);
  };

  const handleChange = (section, field, value) => {
    if (section) {
      onChange((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      onChange((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      handleChange('authority', 'logoUrl', uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('authority', 'logoUrl', '');
  };

  const handleApplyAuthorityPreset = (preset) => {
    onChange((prev) => ({
      ...prev,
      authority: {
        ...prev.authority,
        organizationName: preset.data.organizationName,
        organizationSubtitle: preset.data.organizationSubtitle,
      },
      signatory: {
        ...prev.signatory,
        designation: preset.data.designation,
        sealText: preset.data.sealText,
      },
    }));
  };

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 1-Click Authority Presets */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Quick Authority Presets</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AUTHORITY_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyAuthorityPreset(p)}
              className="px-2.5 py-1 bg-background hover:bg-primary/10 hover:text-primary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issuing Authority Section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Building2 className="w-4 h-4 text-sky-200" />
          <span>1. Issuing Authority Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              Organization Logo Upload (Optional)
            </label>
            <div className="flex items-center gap-3">
              {data.authority?.logoUrl ? (
                <div className="relative w-14 h-14 rounded-lg border border-border bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img src={data.authority.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs hover:bg-rose-700 cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground shrink-0">
                  <Image className="w-6 h-6 opacity-40" />
                </div>
              )}
              
              <div className="flex-1 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>{data.authority?.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  (If no logo is provided, certificate will print with a clean typographic header)
                </p>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Organization / Authority Name</label>
            <input
              type="text"
              value={data.authority?.organizationName || ''}
              onChange={(e) => handleChange('authority', 'organizationName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Subtitle / Jurisdiction Details</label>
            <input
              type="text"
              value={data.authority?.organizationSubtitle || ''}
              onChange={(e) => handleChange('authority', 'organizationSubtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Office Address</label>
            <input
              type="text"
              value={data.authority?.officeAddress || ''}
              onChange={(e) => handleChange('authority', 'officeAddress', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={data.authority?.phone || ''}
              onChange={(e) => handleChange('authority', 'phone', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="text"
              value={data.authority?.email || ''}
              onChange={(e) => handleChange('authority', 'email', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Certificate Reference & Title */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <FileText className="w-4 h-4 text-sky-200" />
          <span>2. Certificate Title & Reference</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Certificate Title</label>
            <input
              type="text"
              value={data.certificateTitle || ''}
              onChange={(e) => handleChange(null, 'certificateTitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Memo / Reference No</label>
            <input
              type="text"
              value={data.memoNo || ''}
              onChange={(e) => handleChange(null, 'memoNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Issue Date</label>
            <input
              type="date"
              value={data.issueDate || ''}
              onChange={(e) => handleChange(null, 'issueDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>3. Candidate / Applicant Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Candidate Full Name</label>
            <input
              type="text"
              value={data.client?.fullName || ''}
              onChange={(e) => handleChange('client', 'fullName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Candidate Phone Number</label>
            <BdPhoneInput
              value={data.client?.phone || ''}
              onChange={(val) => {
                handleChange('client', 'phone', val);
                triggerLookup(val);
              }}
            />
            {data.client?.phone && !validateBdPhone(data.client.phone).isValid && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.client.phone).error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Father's Name</label>
            <input
              type="text"
              value={data.client?.fatherName || ''}
              onChange={(e) => handleChange('client', 'fatherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Mother's Name</label>
            <input
              type="text"
              value={data.client?.motherName || ''}
              onChange={(e) => handleChange('client', 'motherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Passport Number</label>
            <input
              type="text"
              value={data.client?.passportNo || ''}
              onChange={(e) => handleChange('client', 'passportNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Permanent Address</label>
            <input
              type="text"
              value={data.client?.permanentAddress || ''}
              onChange={(e) => handleChange('client', 'permanentAddress', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Statement Section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <FileText className="w-4 h-4 text-sky-200" />
          <span>4. Character & Conduct Statement</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Main Certification Statement</label>
            <textarea
              rows={3}
              value={data.conduct?.statement || ''}
              onChange={(e) => handleChange('conduct', 'statement', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Character Assessment & Praise</label>
            <textarea
              rows={2}
              value={data.conduct?.characterPraise || ''}
              onChange={(e) => handleChange('conduct', 'characterPraise', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Signatory */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <ShieldCheck className="w-4 h-4 text-sky-200" />
          <span>5. Authorized Signatory & Official Seal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Signatory Full Name</label>
            <input
              type="text"
              value={data.signatory?.name || ''}
              onChange={(e) => handleChange('signatory', 'name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Signatory Designation</label>
            <input
              type="text"
              value={data.signatory?.designation || ''}
              onChange={(e) => handleChange('signatory', 'designation', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

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

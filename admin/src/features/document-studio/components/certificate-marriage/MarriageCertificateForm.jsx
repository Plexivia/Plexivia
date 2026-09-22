import React, { useState } from 'react';
import { Building2, User, Heart, FileText, Calendar, DollarSign } from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { toast } from 'sonner';

export function MarriageCertificateForm({ data = {}, onChange }) {
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
      groom: {
        ...prev.groom,
        name: c.fullName || prev.groom?.name,
        phone: c.phone || prev.groom?.phone,
        passportNo: c.passportNumber || prev.groom?.passportNo,
        nidNo: c.nidNumber || prev.groom?.nidNo,
        fatherName: c.fatherName || prev.groom?.fatherName,
        motherName: c.motherName || prev.groom?.motherName,
        address: c.presentAddress || c.address || prev.groom?.address,
      },
    }));
    toast.success(`"${c.fullName}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange((prev) => ({
      ...prev,
      groom: { ...prev.groom, phone: '' },
    }));
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

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 1. Registrar / Kazi Office Information */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Building2 className="w-4 h-4 text-sky-200" />
          <span>1. Registrar / Marriage Registry Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Registrar Office Name</label>
            <input
              type="text"
              value={data.registrar?.officeName || ''}
              onChange={(e) => handleChange('registrar', 'officeName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Registrar / Kazi Full Name</label>
            <input
              type="text"
              value={data.registrar?.kaziName || ''}
              onChange={(e) => handleChange('registrar', 'kaziName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Govt. License / Registration No</label>
            <input
              type="text"
              value={data.registrar?.govLicenseNo || ''}
              onChange={(e) => handleChange('registrar', 'govLicenseNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Office Address</label>
            <input
              type="text"
              value={data.registrar?.officeAddress || ''}
              onChange={(e) => handleChange('registrar', 'officeAddress', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Certificate Meta & Marriage Dates */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Calendar className="w-4 h-4 text-sky-200" />
          <span>2. Registration & Marriage Dates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Reference / Memo No</label>
            <input
              type="text"
              value={data.memoNo || ''}
              onChange={(e) => handleChange(null, 'memoNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Volume & Page No</label>
            <input
              type="text"
              value={data.volumeNo || ''}
              onChange={(e) => handleChange(null, 'volumeNo', e.target.value)}
              placeholder="Enter volume & page reference"
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

          <div>
            <label className="block text-xs font-semibold mb-1">Date of Marriage</label>
            <input
              type="date"
              value={data.marriageDate || ''}
              onChange={(e) => handleChange(null, 'marriageDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Place of Marriage</label>
            <input
              type="text"
              value={data.marriagePlace || ''}
              onChange={(e) => handleChange(null, 'marriagePlace', e.target.value)}
              placeholder="Enter marriage / registration location"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 3. Groom Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>3. Groom Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Groom Full Name</label>
            <input
              type="text"
              value={data.groom?.name || ''}
              onChange={(e) => handleChange('groom', 'name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Groom Phone Number</label>
            <BdPhoneInput
              value={data.groom?.phone || ''}
              onChange={(val) => {
                handleChange('groom', 'phone', val);
                triggerLookup(val);
              }}
            />
            {data.groom?.phone && !validateBdPhone(data.groom.phone).isValid && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.groom.phone).error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Father's Name</label>
            <input
              type="text"
              value={data.groom?.fatherName || ''}
              onChange={(e) => handleChange('groom', 'fatherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Mother's Name</label>
            <input
              type="text"
              value={data.groom?.motherName || ''}
              onChange={(e) => handleChange('groom', 'motherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Passport Number</label>
            <input
              type="text"
              value={data.groom?.passportNo || ''}
              onChange={(e) => handleChange('groom', 'passportNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Date of Birth</label>
            <input
              type="date"
              value={data.groom?.birthDate || ''}
              onChange={(e) => handleChange('groom', 'birthDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Address</label>
            <input
              type="text"
              value={data.groom?.address || ''}
              onChange={(e) => handleChange('groom', 'address', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 4. Bride Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Heart className="w-4 h-4 text-sky-200" />
          <span>4. Bride Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Bride Full Name</label>
            <input
              type="text"
              value={data.bride?.name || ''}
              onChange={(e) => handleChange('bride', 'name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Father's Name</label>
            <input
              type="text"
              value={data.bride?.fatherName || ''}
              onChange={(e) => handleChange('bride', 'fatherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Mother's Name</label>
            <input
              type="text"
              value={data.bride?.motherName || ''}
              onChange={(e) => handleChange('bride', 'motherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Passport Number</label>
            <input
              type="text"
              value={data.bride?.passportNo || ''}
              onChange={(e) => handleChange('bride', 'passportNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Date of Birth</label>
            <input
              type="date"
              value={data.bride?.birthDate || ''}
              onChange={(e) => handleChange('bride', 'birthDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Address</label>
            <input
              type="text"
              value={data.bride?.address || ''}
              onChange={(e) => handleChange('bride', 'address', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 5. Dower & Terms */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <DollarSign className="w-4 h-4 text-sky-200" />
          <span>5. Dower & Witnesses Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Total Dower Amount (BDT)</label>
            <input
              type="text"
              value={data.marriageTerms?.dowerAmount || ''}
              onChange={(e) => handleChange('marriageTerms', 'dowerAmount', e.target.value)}
              placeholder="Enter dower / mahr amount"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Wakil / Representative Name</label>
            <input
              type="text"
              value={data.marriageTerms?.wakilName || ''}
              onChange={(e) => handleChange('marriageTerms', 'wakilName', e.target.value)}
              placeholder="Enter bride representative name & relation"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Witness 1 (Name & Details)</label>
            <input
              type="text"
              value={data.marriageTerms?.witness1 || ''}
              onChange={(e) => handleChange('marriageTerms', 'witness1', e.target.value)}
              placeholder="Enter 1st witness name, NID & address"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Witness 2 (Name & Details)</label>
            <input
              type="text"
              value={data.marriageTerms?.witness2 || ''}
              onChange={(e) => handleChange('marriageTerms', 'witness2', e.target.value)}
              placeholder="Enter 2nd witness name, NID & address"
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

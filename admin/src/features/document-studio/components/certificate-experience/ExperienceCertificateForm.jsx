import React, { useState } from 'react';
import { Building2, User, FileText, Calendar, Briefcase, ShieldCheck, Sparkles, Upload, RotateCcw } from 'lucide-react';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { toast } from 'sonner';

const PRESETS = [
  {
    id: 'construction',
    label: '🏗️ Construction Carpenter (Greece/EU)',
    data: {
      designation: 'Senior Construction Carpenter & Formwork Specialist',
      department: 'Civil Construction & Structural Division',
      dutiesResponsibilities:
        'Reading structural architectural drawings, wood formwork installation, column/beam shuttering fabrication, concrete framework alignment, scaffolding safety, and site task execution.',
      totalDuration: '5 Years 4 Months',
    },
  },
  {
    id: 'agriculture',
    label: '🌾 Agriculture & Farm Worker (Greece/EU)',
    data: {
      designation: 'Agricultural Farm Specialist & Greenhouse Worker',
      department: 'Horticulture & Farm Operations',
      dutiesResponsibilities:
        'Crop planting, automated irrigation maintenance, greenhouse climate control, harvesting, soil treatment, pest control, and packing farm produce according to EU safety standards.',
      totalDuration: '4 Years 6 Months',
    },
  },
  {
    id: 'chef',
    label: '🍳 Chef / Restaurant Cook',
    data: {
      designation: 'Head Line Cook & Culinary Operations Specialist',
      department: 'Food & Beverage / Kitchen Operations',
      dutiesResponsibilities:
        'Meal preparation, Mediterranean and Asian cuisine recipes, food hygiene/HACCP compliance, inventory control, kitchen equipment maintenance, and quality assurance.',
      totalDuration: '5 Years',
    },
  },
  {
    id: 'electrician',
    label: '⚡ Electrician & Industrial Wiring',
    data: {
      designation: 'Certified Industrial Electrician & Wiring Technician',
      department: 'Electrical Maintenance & Engineering',
      dutiesResponsibilities:
        'Circuit installation, 3-phase wiring, breaker diagnostics, generator maintenance, conduit bending, lighting control systems, and electrical safety standards inspection.',
      totalDuration: '6 Years',
    },
  },
  {
    id: 'driver',
    label: '🚚 Heavy Transport Driver',
    data: {
      designation: 'Professional Heavy Commercial Vehicle Driver',
      department: 'Logistics & Supply Chain Transport',
      dutiesResponsibilities:
        'Long-haul cargo transportation, vehicle pre-trip mechanical inspection, GPS route navigation, load securing, cargo documentation, and clean accident-free driving record.',
      totalDuration: '7 Years',
    },
  },
];

export function ExperienceCertificateForm({ data = {}, onChange }) {
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
      employee: {
        ...prev.employee,
        fullName: c.fullName || prev.employee?.fullName,
        phone: c.phone || prev.employee?.phone,
        passportNo: c.passportNumber || prev.employee?.passportNo,
        nidNo: c.nidNumber || prev.employee?.nidNo,
        fatherName: c.fatherName || prev.employee?.fatherName,
      },
    }));
    toast.success(`"${c.fullName}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    onChange((prev) => ({ ...prev, employee: { ...prev.employee, phone: '' } }));
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

  const handleApplyPreset = (preset) => {
    onChange((prev) => {
      const empName = prev.employee?.fullName || 'MD. JAHIDUL ISLAM';
      const fatherName = prev.employee?.fatherName || 'MD. ABDUL MALEK';
      const passNo = prev.employee?.passportNo || 'A08924182';
      const compName = prev.company?.name || 'AL-MADINA CONSTRUCTION LTD.';

      return {
        ...prev,
        employee: {
          ...prev.employee,
          designation: preset.data.designation,
          department: preset.data.department,
          totalDuration: preset.data.totalDuration,
        },
        content: {
          ...prev.content,
          statement: `This is to certify that ${empName}, Son of ${fatherName}, bearing Passport No: ${passNo}, was a bona fide employee of ${compName} from January 15, 2019 to June 30, 2024. During his tenure with us, he served as ${preset.data.designation} with high dedication and professional competence.`,
          dutiesResponsibilities: preset.data.dutiesResponsibilities,
        },
      };
    });
  };

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 1-Click Role Presets */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Quick Job Role Presets</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 bg-background hover:bg-primary/10 hover:text-primary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issuing Company / Organization Section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-sky-200" />
            <span>1. Issuing Company Information</span>
          </div>
          <span className="text-[10px] text-sky-100 opacity-90">
            * Fully customizable company credentials
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Company Name</label>
            <input
              type="text"
              value={data.company?.name || ''}
              onChange={(e) => handleChange('company', 'name', e.target.value)}
              placeholder="Enter company / organization name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tagline / Subtitle</label>
            <input
              type="text"
              value={data.company?.subtitle || ''}
              onChange={(e) => handleChange('company', 'subtitle', e.target.value)}
              placeholder="Enter industry / business nature"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Registration / Trade License No</label>
            <input
              type="text"
              value={data.company?.registrationNo || ''}
              onChange={(e) => handleChange('company', 'registrationNo', e.target.value)}
              placeholder="Enter company registration / license number"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Complete Company Address</label>
            <input
              type="text"
              value={data.company?.address || ''}
              onChange={(e) => handleChange('company', 'address', e.target.value)}
              placeholder="Enter company / office address"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={data.company?.phone || ''}
              onChange={(e) => handleChange('company', 'phone', e.target.value)}
              placeholder="Enter contact phone number"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="text"
              value={data.company?.email || ''}
              onChange={(e) => handleChange('company', 'email', e.target.value)}
              placeholder="Enter company email address"
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
              placeholder="Enter certificate subject / headline"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Memo / Reference No</label>
            <input
              type="text"
              value={data.memoNo || ''}
              onChange={(e) => handleChange(null, 'memoNo', e.target.value)}
              placeholder="Enter certificate reference number"
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

      {/* Employee / Client Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>3. Employee Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Employee Full Name</label>
            <input
              type="text"
              value={data.employee?.fullName || ''}
              onChange={(e) => handleChange('employee', 'fullName', e.target.value)}
              placeholder="Enter employee full name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Father's Name</label>
            <input
              type="text"
              value={data.employee?.fatherName || ''}
              onChange={(e) => handleChange('employee', 'fatherName', e.target.value)}
              placeholder="Enter father's name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={data.employee?.phone || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleChange('employee', 'phone', value);
                triggerLookup(value);
              }}
              placeholder="Enter employee phone number"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
            {data.employee?.phone && !validateBdPhone(data.employee.phone).isValid && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.employee.phone).error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Passport Number</label>
            <input
              type="text"
              value={data.employee?.passportNo || ''}
              onChange={(e) => handleChange('employee', 'passportNo', e.target.value)}
              placeholder="Enter passport number"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Designation / Trade</label>
            <input
              type="text"
              value={data.employee?.designation || ''}
              onChange={(e) => handleChange('employee', 'designation', e.target.value)}
              placeholder="Enter job designation / trade"
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Employment Start Date</label>
            <input
              type="date"
              value={data.employee?.startDate || ''}
              onChange={(e) => handleChange('employee', 'startDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Employment End Date</label>
            <input
              type="date"
              value={data.employee?.endDate || ''}
              onChange={(e) => handleChange('employee', 'endDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Total Service Duration</label>
            <input
              type="text"
              value={data.employee?.totalDuration || ''}
              onChange={(e) => handleChange('employee', 'totalDuration', e.target.value)}
              placeholder="Enter service duration / period"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Department / Division</label>
            <input
              type="text"
              value={data.employee?.department || ''}
              onChange={(e) => handleChange('employee', 'department', e.target.value)}
              placeholder="Enter department / work scope"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Body Statement & Responsibilities */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Briefcase className="w-4 h-4 text-sky-200" />
          <span>4. Certificate Statement & Responsibilities</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Certification Statement</label>
            <textarea
              rows={3}
              value={data.content?.statement || ''}
              onChange={(e) => handleChange('content', 'statement', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Core Duties & Responsibilities</label>
            <textarea
              rows={2}
              value={data.content?.dutiesResponsibilities || ''}
              onChange={(e) => handleChange('content', 'dutiesResponsibilities', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Conduct & Character Review</label>
            <textarea
              rows={2}
              value={data.content?.conductReview || ''}
              onChange={(e) => handleChange('content', 'conductReview', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Signatory & Authority Section */}
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
              placeholder="Enter authorized signatory name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Signatory Designation</label>
            <input
              type="text"
              value={data.signatory?.designation || ''}
              onChange={(e) => handleChange('signatory', 'designation', e.target.value)}
              placeholder="Enter signatory designation"
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

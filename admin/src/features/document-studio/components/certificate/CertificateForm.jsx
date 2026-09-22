import React from 'react';

export function CertificateForm({ data, onChange }) {
  const handleClientChange = (field, value) => {
    onChange({
      ...data,
      client: { ...data.client, [field]: value }
    });
  };

  const handleConductChange = (field, value) => {
    onChange({
      ...data,
      conduct: { ...data.conduct, [field]: value }
    });
  };

  const handleAuthorityChange = (field, value) => {
    onChange({
      ...data,
      authority: { ...data.authority, [field]: value }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 text-xs">
      <div className="flex items-center justify-end border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground font-semibold">Language:</span>
          <button
            onClick={() => onChange({ ...data, language: 'bn' })}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              data.language === 'bn' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            Bengali
          </button>
          <button
            onClick={() => onChange({ ...data, language: 'en' })}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              data.language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* METADATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-muted-foreground mb-1">Memo / Reference No</label>
          <input
            type="text"
            value={data.memoNo}
            onChange={e => onChange({ ...data, memoNo: e.target.value })}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-muted-foreground mb-1">Issue Date / Issue Date</label>
          <input
            type="date"
            value={data.issueDate}
            onChange={e => onChange({ ...data, issueDate: e.target.value })}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
          />
        </div>
      </div>

      {/* CANDIDATE DETAILS */}
      <div className="border-t border-border pt-3 space-y-3">
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Applicant Details</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted-foreground mb-1">Full Name</label>
            <input
              type="text"
              value={data.client.fullName}
              onChange={e => handleClientChange('fullName', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Full Name (English)</label>
            <input
              type="text"
              value={data.client.fullNameEn}
              onChange={e => handleClientChange('fullNameEn', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Father's Name</label>
            <input
              type="text"
              value={data.client.fatherName}
              onChange={e => handleClientChange('fatherName', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Mother's Name</label>
            <input
              type="text"
              value={data.client.motherName}
              onChange={e => handleClientChange('motherName', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Passport Number / Passport No</label>
            <input
              type="text"
              value={data.client.passportNo}
              onChange={e => handleClientChange('passportNo', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">National ID (NID) No</label>
            <input
              type="text"
              value={data.client.nidNo}
              onChange={e => handleClientChange('nidNo', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-mono outline-none"
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-muted-foreground mb-1">Village / Area</label>
            <input
              type="text"
              value={data.client.village}
              onChange={e => handleClientChange('village', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Post Office</label>
            <input
              type="text"
              value={data.client.postOffice}
              onChange={e => handleClientChange('postOffice', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Upazila / Police Station</label>
            <input
              type="text"
              value={data.client.upazila}
              onChange={e => handleClientChange('upazila', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">District</label>
            <input
              type="text"
              value={data.client.district}
              onChange={e => handleClientChange('district', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
            />
          </div>
        </div>
      </div>

      {/* CONDUCT STATEMENT */}
      <div className="border-t border-border pt-3 space-y-2">
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Character Assessment Statement</h4>
        
        <div>
          <label className="block text-muted-foreground mb-1">Acquaintance Duration (Years)</label>
          <input
            type="text"
            value={data.conduct.durationYears}
            onChange={e => handleConductChange('durationYears', e.target.value)}
            className="w-full max-w-[200px] bg-background border border-input rounded-lg px-3 py-1.5 text-foreground outline-none"
          />
        </div>

        <div>
          <label className="block text-muted-foreground mb-1">Testimonial Statement</label>
          <textarea
            rows={3}
            value={data.conduct.statementBn}
            onChange={e => handleConductChange('statementBn', e.target.value)}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-foreground outline-none resize-none"
          />
        </div>
      </div>

      {/* ISSUING AUTHORITY */}
      <div className="border-t border-border pt-3 space-y-2">
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Issuing Authority Information</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted-foreground mb-1">Organization Name</label>
            <input
              type="text"
              value={data.authority.organizationName}
              onChange={e => handleAuthorityChange('organizationName', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-semibold outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Authorized Official Full Name</label>
            <input
              type="text"
              value={data.authority.issuingPersonName}
              onChange={e => handleAuthorityChange('issuingPersonName', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Designation</label>
            <input
              type="text"
              value={data.authority.designation}
              onChange={e => handleAuthorityChange('designation', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Office Address</label>
            <input
              type="text"
              value={data.authority.officeAddress}
              onChange={e => handleAuthorityChange('officeAddress', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

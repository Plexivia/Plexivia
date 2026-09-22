import React from 'react';
import { User, IdCard, Calendar, Droplets, Phone, Mail, MapPin, Upload, RefreshCw, Globe, PenTool } from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';

export function IdCardForm({ cardData, setCardData, onResetSample }) {
  const handleChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
      <div className="space-y-3 text-xs">
        {/* Photo Upload Box */}
        <div className={`p-3 rounded-xl border transition-all ${!cardData.photo ? 'bg-rose-500/5 border-rose-500/30' : 'bg-muted/30 border-border'}`}>
          <label className="block font-bold text-foreground mb-1">
            📷 Photo Upload <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="flex items-center gap-3">
            <div className={`w-14 h-16 rounded-xl border-2 overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-xs relative ${!cardData.photo ? 'border-rose-500/50 border-dashed' : 'border-primary/30'}`}>
              {cardData.photo ? (
                <img src={cardData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground">
                Upload clear passport size photo (JPG/PNG). <span className="text-rose-500 font-medium">(Required)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Full Name & Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">
              Full Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter employee / holder name"
                value={cardData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Role / Designation <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter role / designation"
              value={cardData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold uppercase"
            />
          </div>
        </div>

        {/* Employee ID & Joining Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">
              Employee ID <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter employee / ID card number"
              value={cardData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Joining Date <span className="text-rose-500 font-bold">*</span>
            </label>
            <DatePicker
              value={cardData.joiningDate}
              onChange={(val) => handleChange('joiningDate', val)}
            />
          </div>
        </div>

        {/* Blood Group & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">
              Blood Group <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <Droplets className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter blood group"
                value={cardData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Contact Phone <span className="text-rose-500 font-bold">*</span>
            </label>
            <BdPhoneInput
              value={cardData.contactPhone}
              onChange={(val) => handleChange('contactPhone', val)}
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-bold text-foreground mb-1">
            Email Address <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Enter email address"
              value={cardData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Office Address */}
        <div>
          <label className="block font-bold text-foreground mb-1">
            Office Address <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter office address"
              value={cardData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Website & Signature Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
          <div>
            <label className="block font-bold text-foreground mb-1">
              Website URL <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter website URL"
                value={cardData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Signature Text <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <PenTool className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter authorized signatory name"
                value={cardData.signatureName}
                onChange={(e) => handleChange('signatureName', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

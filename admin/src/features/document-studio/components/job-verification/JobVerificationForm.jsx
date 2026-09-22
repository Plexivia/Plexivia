import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  User,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Eye,
  FileCheck2,
  HelpCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { toast } from 'sonner';

export function JobVerificationForm({
  formData,
  setFormData,
  onSubmit,
  onReset,
  isSubmitting = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [detectedMatch, setDetectedMatch] = useState(null);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    setFormData(prev => ({
      ...prev,
      clientId: c._id,
      clientDid: c.did,
      linkedCaseId: detectedMatch.caseFile?._id || null,
      linkedCaseDid: detectedMatch.caseFile?.did || null,
      clientInfo: {
        ...prev.clientInfo,
        clientName: c.fullName || prev.clientInfo?.clientName,
        clientPhone: c.phone || prev.clientInfo?.clientPhone,
        clientEmail: c.email || prev.clientInfo?.clientEmail,
        passportNumber: c.passportNumber || prev.clientInfo?.passportNumber,
        nidNumber: c.nidNumber || prev.clientInfo?.nidNumber,
      },
    }));
    toast.success(`"${c.fullName}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || '';
    setFormData(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, clientPhone: '', clientEmail: '' },
    }));
    resetLookup(val);
    toast.info('Please enter a different phone number or email.');
    setDetectedMatch(null);
  };

  const steps = [
    { id: 1, title: 'Company & Client', icon: Building2 },
    { id: 2, title: 'Job & Stay Details', icon: Briefcase },
    { id: 3, title: 'Work Permit & Helper', icon: UserCheck },
    { id: 4, title: 'Signatures & Review', icon: ShieldCheck },
  ];

  const updateNested = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.clientInfo?.clientName?.trim()) {
        alert('Please enter Client Name.');
        return;
      }
      const phone = formData.clientInfo?.clientPhone || '';
      const check = validateBdPhone(phone);
      if (!check.isValid) {
        toast.error(`Client Mobile: ${check.error}`);
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirmReset = () => {
    onReset();
    setCurrentStep(1);
    setResetDialogOpen(false);
  };

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-5 w-full mx-auto">
      {/* Stepper Header */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isPassed = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`p-2.5 rounded-lg text-left border transition-all flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary text-foreground font-bold shadow-xs'
                    : isPassed
                    ? 'bg-muted/40 border-border text-foreground hover:bg-muted cursor-pointer'
                    : 'bg-background border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{step.title}</div>
                  <div className="text-[10px] text-muted-foreground">Step {step.id}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={handleNext}>
        {/* STEP 1: COMPANY & CLIENT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Section 1: Company Information */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-primary font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>1. Company Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Company Name</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyName || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyName', e.target.value)}
                    placeholder="Enter organization / agency name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Mobile / Phone Number</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyPhone || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyPhone', e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    value={formData.companyInfo?.companyEmail || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyEmail', e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tax / VAT Number</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyTaxNumber || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyTaxNumber', e.target.value)}
                    placeholder="Enter TAX / TIN number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">ID / Registration Number</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyIdNumber || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyIdNumber', e.target.value)}
                    placeholder="Enter recruiting license / registration number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyCity || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyCity', e.target.value)}
                    placeholder="Enter city / district"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs font-semibold">Address</Label>
                  <Input
                    type="text"
                    value={formData.companyInfo?.companyAddress || ''}
                    onChange={(e) => updateNested('companyInfo', 'companyAddress', e.target.value)}
                    placeholder="Enter full office address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Client Information */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-primary font-bold text-sm">
                <User className="w-4 h-4" />
                <span>2. Client Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">
                    Client Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.clientInfo?.clientName || ''}
                    onChange={(e) => updateNested('clientInfo', 'clientName', e.target.value)}
                    placeholder="Enter candidate full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">
                    Mobile Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.clientInfo?.clientPhone || ''}
                    onChange={(e) => {
                      updateNested('clientInfo', 'clientPhone', e.target.value);
                      triggerLookup(e.target.value);
                    }}
                    placeholder="Enter candidate phone number"
                    className="mt-1 font-mono"
                  />
                  {formData.clientInfo?.clientPhone && !validateBdPhone(formData.clientInfo.clientPhone).isValid && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">
                      {validateBdPhone(formData.clientInfo.clientPhone).error}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    value={formData.clientInfo?.clientEmail || ''}
                    onChange={(e) => {
                      updateNested('clientInfo', 'clientEmail', e.target.value);
                      triggerLookup(e.target.value);
                    }}
                    placeholder="Enter candidate email address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tax Number</Label>
                  <Input
                    type="text"
                    value={formData.clientInfo?.clientTaxNumber || ''}
                    onChange={(e) => updateNested('clientInfo', 'clientTaxNumber', e.target.value)}
                    placeholder="Enter candidate TIN / TAX number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">ID / Passport Number</Label>
                  <Input
                    type="text"
                    value={formData.clientInfo?.clientIdNumber || ''}
                    onChange={(e) => updateNested('clientInfo', 'clientIdNumber', e.target.value.toUpperCase())}
                    placeholder="Enter passport / NID number"
                    className="mt-1 font-mono uppercase"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    type="text"
                    value={formData.clientInfo?.clientCity || ''}
                    onChange={(e) => updateNested('clientInfo', 'clientCity', e.target.value)}
                    placeholder="Enter place of birth / division"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs font-semibold">Address</Label>
                  <Input
                    type="text"
                    value={formData.clientInfo?.clientAddress || ''}
                    onChange={(e) => updateNested('clientInfo', 'clientAddress', e.target.value)}
                    placeholder="Enter candidate full address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: JOB & STAY DETAILS */}
        {currentStep === 2 && (
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-primary font-bold text-sm">
              <Briefcase className="w-4 h-4" />
              <span>3. Job Specifications &amp; Overseas Stay Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Where are you going? (Destination)</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.destinationPlace || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'destinationPlace', e.target.value)}
                  placeholder="Enter target region / block"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Destination Country</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.destinationCountry || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'destinationCountry', e.target.value)}
                  placeholder="Enter destination country"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Destination City</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.destinationCity || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'destinationCity', e.target.value)}
                  placeholder="Enter employment city / locality"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Accommodation Type</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.accommodationType || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'accommodationType', e.target.value)}
                  placeholder="Enter accommodation details"
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Residence / Stay Address</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.residenceAddress || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'residenceAddress', e.target.value)}
                  placeholder="Enter workplace / employment address"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Job Nature / Type of Work</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.jobNature || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'jobNature', e.target.value)}
                  placeholder="Enter employment sector / industry"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Job Title</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.jobTitle || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'jobTitle', e.target.value)}
                  placeholder="Enter proposed position / job title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Daily Working Hours</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.dailyWorkingHours || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'dailyWorkingHours', e.target.value)}
                  placeholder="Enter daily work hours"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Weekly Working Hours</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.weeklyWorkingHours || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'weeklyWorkingHours', e.target.value)}
                  placeholder="Enter weekly work hours"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Salary / Remuneration</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.salaryAmount || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'salaryAmount', e.target.value)}
                  placeholder="Enter monthly salary amount"
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Currency</Label>
                <Input
                  type="text"
                  value={formData.jobStayDetails?.currency || ''}
                  onChange={(e) => updateNested('jobStayDetails', 'currency', e.target.value)}
                  placeholder="Enter currency"
                  className="mt-1 uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WORK PERMIT & HELPER INFO */}
        {currentStep === 3 && (
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border text-primary font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>4. Work Permit &amp; Helper / Sponsor Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Who Provided Work Permit &amp; Assisted? (Helper's Full Name)
                </Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.helperName || ''}
                  onChange={(e) => updateNested('helperInfo', 'helperName', e.target.value)}
                  placeholder="Enter local contact / sponsor name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Relationship</Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.helperRelationship || ''}
                  onChange={(e) => updateNested('helperInfo', 'helperRelationship', e.target.value)}
                  placeholder="Enter relationship to candidate"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Duration of Stay in Destination</Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.helperDurationOfStay || ''}
                  onChange={(e) => updateNested('helperInfo', 'helperDurationOfStay', e.target.value)}
                  placeholder="Enter residency duration in destination"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Helper's Legal / Entry Status</Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.helperImmigrationStatus || ''}
                  onChange={(e) => updateNested('helperInfo', 'helperImmigrationStatus', e.target.value)}
                  placeholder="Enter sponsor visa / residency status"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Do you know him personally?</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="knowsHelper"
                      checked={formData.helperInfo?.knowsHelper === 'Yes'}
                      onChange={() => updateNested('helperInfo', 'knowsHelper', 'Yes')}
                      className="accent-primary"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="knowsHelper"
                      checked={formData.helperInfo?.knowsHelper === 'No'}
                      onChange={() => updateNested('helperInfo', 'knowsHelper', 'No')}
                      className="accent-primary"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">How long have you known him?</Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.durationKnown || ''}
                  onChange={(e) => updateNested('helperInfo', 'durationKnown', e.target.value)}
                  placeholder="Enter acquaintance duration"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Helper's Date of Birth</Label>
                <DatePicker
                  value={formData.helperInfo?.helperDob || ''}
                  onChange={(val) => updateNested('helperInfo', 'helperDob', val)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Helper's Mobile Number</Label>
                <Input
                  type="text"
                  value={formData.helperInfo?.helperPhone || ''}
                  onChange={(e) => updateNested('helperInfo', 'helperPhone', e.target.value)}
                  placeholder="Enter contact phone number"
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SIGNATURES & FINAL REVIEW */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-primary font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>5. Declarations &amp; Verification Signatures</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Client Signature Date</Label>
                  <DatePicker
                    value={formData.verificationDetails?.clientSignatureDate || ''}
                    onChange={(val) => updateNested('verificationDetails', 'clientSignatureDate', val)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Company Authorized Signatory</Label>
                  <Input
                    type="text"
                    value={formData.verificationDetails?.authorizedSignatory || 'Managing Director'}
                    onChange={(e) => updateNested('verificationDetails', 'authorizedSignatory', e.target.value)}
                    placeholder="Enter signing authority title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Verification Issue Date</Label>
                  <DatePicker
                    value={formData.verificationDetails?.issueDate || ''}
                    onChange={(val) => updateNested('verificationDetails', 'issueDate', val)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Authorized Signature Date</Label>
                  <DatePicker
                    value={formData.verificationDetails?.authorizedSignatureDate || ''}
                    onChange={(val) => updateNested('verificationDetails', 'authorizedSignatureDate', val)}
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold">Verification Notes / Remarks</Label>
                  <Textarea
                    rows={2}
                    value={formData.verificationDetails?.notes || ''}
                    onChange={(e) => updateNested('verificationDetails', 'notes', e.target.value)}
                    placeholder="Enter agency verification comments & notes..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>Verification Summary:</span>
                <span className="font-mono text-primary font-bold">
                  {formData.verificationId || 'Pending'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Client:</span> {formData.clientInfo?.clientName || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Destination:</span> {formData.jobStayDetails?.destinationCountry || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Job Title:</span> {formData.jobStayDetails?.jobTitle || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Helper:</span> {formData.helperInfo?.helperName || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 font-bold px-6"
          >
            {isSubmitting ? (
              <span>Saving Document...</span>
            ) : currentStep === 4 ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Save &amp; View Document</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Form Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all fields in this Job Verification Form? All entered information will be cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="cancel" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Reset Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ImageUp, Loader2, RotateCcw, Save, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { Input, NativeSelect } from '@/components/ui/input';
import { useSettingsStore, type AppSettings } from '@/store/useSettingsStore';
import { settingsErrorMessage } from '@/services/settingsApi';

const cardClass = 'rounded-2xl border border-border bg-card p-5 lg:p-6';
const outlineButtonClass =
  'flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

// Section wrapper so every settings block reads the same
const SettingsCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className={cardClass}>
    <div className="mb-5">
      <h4 className="text-lg font-semibold text-foreground">{title}</h4>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  helperText,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  helperText?: string;
}) => (
  <Input
    label={label}
    type={type}
    value={value ?? ''}
    placeholder={placeholder}
    helperText={helperText}
    onChange={(e) => onChange(e.target.value)}
  />
);

/**
 * Dashboard settings: the brand identity (logo included) and the document
 * defaults that every invoice, money receipt and salary slip is built from.
 */
export const SettingsPage: React.FC = () => {
  const { settings, loading, load, save, uploadImage } = useSettingsStore();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<'logo' | 'icon' | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  // The server copy wins whenever it changes (first load, or after an upload)
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const setBrand = (patch: Record<string, any>) =>
    setDraft((prev) => ({ ...prev, brand: { ...prev.brand, ...patch } }));
  const setAddress = (patch: Record<string, any>) =>
    setDraft((prev) => ({ ...prev, brand: { ...prev.brand, address: { ...prev.brand.address, ...patch } } }));
  const setDocuments = (patch: Record<string, any>) =>
    setDraft((prev) => ({ ...prev, documents: { ...prev.documents, ...patch } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ brand: draft.brand, documents: draft.documents });
      toast.success('Settings saved. The logo and brand details are now used everywhere.');
    } catch (error) {
      toast.error(settingsErrorMessage(error, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async (file: File | undefined, slot: 'logo' | 'icon') => {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('That image is larger than 2 MB. Pick a smaller file.');
      return;
    }
    setUploadingSlot(slot);
    try {
      await uploadImage(file, slot);
      toast.success(slot === 'icon' ? 'App icon updated.' : 'Logo updated everywhere.');
    } catch (error) {
      toast.error(settingsErrorMessage(error, 'Failed to upload the image'));
    } finally {
      setUploadingSlot(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={SettingsIcon}
        title="Settings"
        onRefresh={() => load(true)}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft(settings)}
              disabled={!isDirty || saving}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>{saving ? 'Saving…' : 'Save changes'}</span>
            </button>
          </div>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5 lg:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Workspace settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Brand identity and document defaults for the whole dashboard.
              {loading && <span className="ml-1 text-xs">Loading…</span>}
            </p>
          </div>
          {isDirty && (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* Logo — the one image used across the dashboard and every document */}
          <SettingsCard
            title="Logo & app icon"
            description="One common logo, used on the dashboard, the sign-in screen and every invoice, receipt and slip. Replacing it here replaces it everywhere."
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <span className="block text-xs font-semibold tracking-wide text-foreground/80">Primary logo</span>
                <div className="flex items-center gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-2">
                    {draft.brand.logoUrl ? (
                      <img src={draft.brand.logoUrl} alt="Brand logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Building2 className="size-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingSlot === 'logo'}
                      className={outlineButtonClass}
                    >
                      {uploadingSlot === 'logo' ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
                      {uploadingSlot === 'logo' ? 'Uploading…' : 'Upload logo'}
                    </button>
                    <p className="text-[11px] text-muted-foreground">PNG, JPEG, WebP, GIF or SVG · max 2 MB</p>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="hidden"
                    onChange={(e) => handlePickImage(e.target.files?.[0], 'logo')}
                  />
                </div>
                <Field
                  label="Or paste a logo URL"
                  value={draft.brand.hasCustomLogo ? draft.brand.logoUrl : ''}
                  placeholder="https://cdn.example.com/logo.png"
                  onChange={(value) => setBrand({ logoUrl: value, hasCustomLogo: Boolean(value) })}
                  helperText="Leave empty to fall back to the logo bundled with the dashboard."
                />
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-semibold tracking-wide text-foreground/80">Square app icon</span>
                <div className="flex items-center gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-2">
                    {draft.brand.iconUrl ? (
                      <img src={draft.brand.iconUrl} alt="App icon" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Building2 className="size-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={uploadingSlot === 'icon'}
                      className={outlineButtonClass}
                    >
                      {uploadingSlot === 'icon' ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
                      {uploadingSlot === 'icon' ? 'Uploading…' : 'Upload icon'}
                    </button>
                    <p className="text-[11px] text-muted-foreground">Used where a square mark fits better.</p>
                  </div>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="hidden"
                    onChange={(e) => handlePickImage(e.target.files?.[0], 'icon')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setBrand({ logoUrl: '', iconUrl: '', hasCustomLogo: false })}
                  className={cn(outlineButtonClass, 'hover:text-destructive')}
                >
                  <Trash2 className="size-4" />
                  Reset to the bundled logo
                </button>
              </div>
            </div>
          </SettingsCard>

          {/* Identity printed on documents */}
          <SettingsCard
            title="Brand identity"
            description="The name and contact particulars printed on documents and shown in the dashboard shell."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Display name" value={draft.brand.name} onChange={(v) => setBrand({ name: v })} placeholder="Plexivia" />
              <Field label="Legal / registered name" value={draft.brand.legalName} onChange={(v) => setBrand({ legalName: v })} placeholder="Plexivia Ltd." />
              <Field label="Tagline" value={draft.brand.tagline} onChange={(v) => setBrand({ tagline: v })} placeholder="Your trusted solutions partner" />
              <Field label="Document header title" value={draft.brand.brandTitle} onChange={(v) => setBrand({ brandTitle: v })} placeholder="PLEXIVIA" />
              <Field label="Document header subtitle" value={draft.brand.brandSubtitle} onChange={(v) => setBrand({ brandSubtitle: v })} placeholder="ENTERPRISE" />
              <Field label="Website" value={draft.brand.website} onChange={(v) => setBrand({ website: v })} placeholder="www.plexivia.com" />
              <Field label="Phone (international)" value={draft.brand.phone} onChange={(v) => setBrand({ phone: v })} placeholder="+880 1700-000000" />
              <Field label="Phone (local)" value={draft.brand.phoneLocal} onChange={(v) => setBrand({ phoneLocal: v })} placeholder="01700-000000" />
              <Field label="Email" type="email" value={draft.brand.email} onChange={(v) => setBrand({ email: v })} placeholder="contact@plexivia.com" />
              <Field label="Domain" value={draft.brand.domain} onChange={(v) => setBrand({ domain: v })} placeholder="plexivia.com" />
            </div>
          </SettingsCard>

          {/* Address block for document footers */}
          <SettingsCard title="Address" description="Printed in document headers and footers.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Area / holding" value={draft.brand.address.line1} onChange={(v) => setAddress({ line1: v })} placeholder="Commercial Area" />
              <Field label="Road" value={draft.brand.address.road} onChange={(v) => setAddress({ road: v })} placeholder="VIP Road" />
              <Field label="District / city" value={draft.brand.address.district} onChange={(v) => setAddress({ district: v })} placeholder="Dhaka" />
              <Field label="Post code" value={draft.brand.address.postcode} onChange={(v) => setAddress({ postcode: v })} placeholder="1212" />
              <Field label="Country" value={draft.brand.address.country} onChange={(v) => setAddress({ country: v })} placeholder="Bangladesh" />
              <Field
                label="Address in Bangla"
                value={draft.brand.address.fullBn}
                onChange={(v) => setAddress({ fullBn: v })}
                placeholder="বাণিজ্যিক এলাকা, ভিআইপি রোড, ঢাকা ১২১২"
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Field
                  label="One-line address (printed as-is)"
                  value={draft.brand.address.full}
                  onChange={(v) => setAddress({ full: v })}
                  placeholder="Commercial Area, VIP Road, Dhaka, Post Code 1212"
                  helperText="Leave empty and it is rebuilt from the parts above when you save."
                />
              </div>
            </div>
          </SettingsCard>

          {/* Defaults every generated document starts from */}
          <SettingsCard
            title="Document defaults"
            description="Numbering prefixes and starting values for Document Studio invoices, receipts and slips."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NativeSelect
                label="Currency"
                value={draft.documents.currency}
                onChange={(e) => setDocuments({ currency: e.target.value })}
              >
                <option value="BDT">BDT — Bangladeshi Taka</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — Pound Sterling</option>
              </NativeSelect>
              <Field label="Invoice number prefix" value={draft.documents.invoicePrefix} onChange={(v) => setDocuments({ invoicePrefix: v })} placeholder="PX-INV" />
              <Field label="Receipt number prefix" value={draft.documents.receiptPrefix} onChange={(v) => setDocuments({ receiptPrefix: v })} placeholder="PX-MR" />
              <Field label="Salary slip prefix" value={draft.documents.slipPrefix} onChange={(v) => setDocuments({ slipPrefix: v })} placeholder="PX-SLIP" />
              <Field
                label="Default VAT / tax rate (%)"
                type="number"
                value={draft.documents.defaultTaxRate}
                onChange={(v) => setDocuments({ defaultTaxRate: Number(v) || 0 })}
                placeholder="0"
              />
              <Field
                label="Invoice due in (days)"
                type="number"
                value={draft.documents.invoiceDueDays}
                onChange={(v) => setDocuments({ invoiceDueDays: Number(v) || 0 })}
                placeholder="15"
              />
              <Field
                label="Receipt signatory"
                value={draft.documents.receiptSignatory}
                onChange={(v) => setDocuments({ receiptSignatory: v })}
                placeholder="Accounts Officer"
              />
              <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Default payment terms</label>
                <textarea
                  rows={3}
                  value={draft.documents.paymentTerms}
                  placeholder="Payment due within 15 days of the invoice date."
                  onChange={(e) => setDocuments({ paymentTerms: e.target.value })}
                  className="flex w-full resize-none rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

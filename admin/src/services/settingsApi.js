import { apiClient } from '@/lib/api-client';
import brandFallback from '@/lib/information.json';
import bundledLogo from '@/assets/logo.png';

// Pulls the server's message out of an axios error so toasts show what actually failed
export const settingsErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// Shape used across the dashboard and every generated document
const toBrand = (brand = {}) => {
  const address = brand.address || {};
  return {
    name: brand.name || brandFallback.agencyName || 'Plexivia',
    legalName: brand.legal_name || '',
    brandTitle: brand.brand_title || brandFallback.brandTitle || 'PLEXIVIA',
    brandSubtitle: brand.brand_subtitle || brandFallback.brandSubtitle || '',
    tagline: brand.tagline || brandFallback.tagline || '',
    logoUrl: brand.logo_url || bundledLogo,
    iconUrl: brand.icon_url || brand.logo_url || bundledLogo,
    // True only when a logo was uploaded or set on the Settings page
    hasCustomLogo: Boolean(brand.logo_url),
    phone: brand.phone || brandFallback.phone || '',
    phoneLocal: brand.phone_local || brandFallback.phoneLocal || '',
    email: brand.email || brandFallback.email || '',
    website: brand.website || brandFallback.website || '',
    domain: brand.domain || brandFallback.domain || '',
    address: {
      line1: address.line1 || '',
      road: address.road || '',
      district: address.district || '',
      postcode: address.postcode || '',
      country: address.country || 'Bangladesh',
      full: address.full || brandFallback.address?.full || '',
      fullBn: address.full_bn || brandFallback.address?.fullBn || '',
    },
  };
};

const toDocuments = (documents = {}) => ({
  currency: documents.currency || 'BDT',
  invoicePrefix: documents.invoice_prefix || 'PX-INV',
  receiptPrefix: documents.receipt_prefix || 'PX-MR',
  slipPrefix: documents.slip_prefix || 'PX-SLIP',
  defaultTaxRate: Number(documents.default_tax_rate) || 0,
  invoiceDueDays: Number(documents.invoice_due_days) || 15,
  paymentTerms: documents.payment_terms || '',
  receiptSignatory: documents.receipt_signatory || '',
});

export const toSettings = (raw = {}) => ({
  brand: toBrand(raw.brand),
  documents: toDocuments(raw.documents),
  updatedAt: raw.updated_at || '',
});

// Settings the dashboard falls back to before the server answers (or when it cannot)
export const FALLBACK_SETTINGS = toSettings({});

const fromBrandForm = (brand = {}) => ({
  name: brand.name,
  legal_name: brand.legalName,
  brand_title: brand.brandTitle,
  brand_subtitle: brand.brandSubtitle,
  tagline: brand.tagline,
  logo_url: brand.logoUrl,
  icon_url: brand.iconUrl,
  phone: brand.phone,
  phone_local: brand.phoneLocal,
  email: brand.email,
  website: brand.website,
  domain: brand.domain,
  address: {
    line1: brand.address?.line1,
    road: brand.address?.road,
    district: brand.address?.district,
    postcode: brand.address?.postcode,
    country: brand.address?.country,
    full_bn: brand.address?.fullBn,
  },
});

const fromDocumentsForm = (documents = {}) => ({
  currency: documents.currency,
  invoice_prefix: documents.invoicePrefix,
  receipt_prefix: documents.receiptPrefix,
  slip_prefix: documents.slipPrefix,
  default_tax_rate: documents.defaultTaxRate,
  invoice_due_days: documents.invoiceDueDays,
  payment_terms: documents.paymentTerms,
  receipt_signatory: documents.receiptSignatory,
});

export const settingsApi = {
  get: async () => toSettings((await apiClient.get('/api/settings')).data?.data || {}),
  save: async ({ brand, documents }) =>
    toSettings(
      (
        await apiClient.put('/api/settings', {
          ...(brand ? { brand: fromBrandForm(brand) } : {}),
          ...(documents ? { documents: fromDocumentsForm(documents) } : {}),
        })
      ).data?.data || {}
    ),
  // slot: 'logo' (the common logo used everywhere) or 'icon' (square app icon)
  uploadImage: async (file, slot = 'logo') =>
    toSettings(
      (
        await apiClient.post(`/api/settings/brand-image?slot=${slot}`, file, {
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        })
      ).data?.data || {}
    ),
};

// Document Studio records: saved invoices, money receipts, salary slips and vouchers
const toStudioDoc = (d = {}) => ({
  id: d.dId,
  type: d.doc_type,
  number: d.doc_number,
  clientId: d.client_id || '',
  clientName: d.client_name || '',
  amount: Number(d.amount) || 0,
  currency: d.currency || 'BDT',
  status: d.status || '',
  issueDate: d.issue_date || '',
  payload: d.payload || {},
  createdAt: d.created_at || '',
});

export const studioDocumentsApi = {
  list: async (params = {}) =>
    ((await apiClient.get('/api/studio-documents', { params }))?.data?.data || []).map(toStudioDoc),
  get: async (id) => toStudioDoc((await apiClient.get(`/api/studio-documents/${id}`)).data?.data || {}),
  create: async (body) => toStudioDoc((await apiClient.post('/api/studio-documents', body)).data?.data || {}),
  update: async (id, body) => toStudioDoc((await apiClient.put(`/api/studio-documents/${id}`, body)).data?.data || {}),
  remove: (id) => apiClient.delete(`/api/studio-documents/${id}`),
  // QR image (data URL) linking to the saved document's public view page, rendered by the backend
  qr: async (id) =>
    (await apiClient.get('/api/studio-documents/qr', { params: { id } })).data?.data?.dataUrl || '',
  // A fresh, unused number for the given document type
  nextNumber: async (type) =>
    (await apiClient.get('/api/studio-documents/next-number', { params: { type } })).data?.data?.number || '',
  // { available, usedBy } — whether this number is still free for that document type
  checkNumber: async (type, number, excludeId) =>
    (await apiClient.get('/api/studio-documents/check-number', { params: { type, number, excludeId } })).data?.data || {
      available: true,
    },
};

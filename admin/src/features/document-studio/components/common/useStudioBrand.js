import { useBrand, getBrand, useDocumentDefaults, useSettingsStore } from '@/store/useSettingsStore';

/**
 * Brand particulars for Document Studio, in the shape the previews and default
 * form data already expect. Everything comes from the Settings page, so the
 * logo and agency details on a printed document are never hardcoded.
 */
export const toStudioBrand = (brand) => ({
  agencyName: brand.name,
  brandTitle: brand.brandTitle || brand.name,
  brandSubtitle: brand.brandSubtitle,
  tagline: brand.tagline,
  phone: brand.phone,
  phoneLocal: brand.phoneLocal,
  email: brand.email,
  website: brand.website,
  domain: brand.domain,
  logo: brand.logoUrl,
  icon: brand.iconUrl,
  address: {
    line1: brand.address?.line1 || '',
    road: brand.address?.road || '',
    district: brand.address?.district || '',
    postcode: brand.address?.postcode || '',
    country: brand.address?.country || '',
    full: brand.address?.full || '',
    fullBn: brand.address?.fullBn || '',
  },
});

// Inside a component — re-renders when the logo or details change in Settings
export const useStudioBrand = () => toStudioBrand(useBrand());

// Outside React (default form data, print headers, WhatsApp summaries)
export const getStudioBrand = () => toStudioBrand(getBrand());

// Document defaults (numbering prefixes, tax rate, due days, payment terms)
export const useStudioDocumentDefaults = () => useDocumentDefaults();
export const getDocumentDefaults = () => useSettingsStore.getState().settings.documents;

export default useStudioBrand;

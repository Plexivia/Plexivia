import { create } from 'zustand';
import { settingsApi, FALLBACK_SETTINGS } from '@/services/settingsApi';

/**
 * Dashboard-wide settings (brand identity + document defaults).
 *
 * Loaded once when the app shell mounts, then read straight from here by the
 * sidebar, the login screen and every Document Studio preview, so changing the
 * logo on the Settings page changes it everywhere without a reload.
 */
export interface BrandAddress {
  line1: string;
  road: string;
  district: string;
  postcode: string;
  country: string;
  full: string;
  fullBn: string;
}

export interface Brand {
  name: string;
  legalName: string;
  brandTitle: string;
  brandSubtitle: string;
  tagline: string;
  logoUrl: string;
  iconUrl: string;
  hasCustomLogo: boolean;
  phone: string;
  phoneLocal: string;
  email: string;
  website: string;
  domain: string;
  address: BrandAddress;
}

export interface DocumentDefaults {
  currency: string;
  invoicePrefix: string;
  receiptPrefix: string;
  slipPrefix: string;
  cashVoucherPrefix: string;
  defaultTaxRate: number;
  invoiceDueDays: number;
  paymentTerms: string;
  receiptSignatory: string;
}

export interface AppSettings {
  brand: Brand;
  documents: DocumentDefaults;
  updatedAt: string;
}

interface SettingsStore {
  settings: AppSettings;
  loading: boolean;
  loaded: boolean;
  load: (force?: boolean) => Promise<AppSettings>;
  save: (patch: { brand?: Partial<Brand>; documents?: Partial<DocumentDefaults> }) => Promise<AppSettings>;
  uploadImage: (file: File, slot?: 'logo' | 'icon') => Promise<AppSettings>;
}

let inFlight: Promise<AppSettings> | null = null;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: FALLBACK_SETTINGS as AppSettings,
  loading: false,
  loaded: false,

  // Concurrent callers share one request; the bundled defaults stay in place if it fails
  load: async (force = false) => {
    if (!force && get().loaded) return get().settings;
    if (inFlight) return inFlight;

    set({ loading: true });
    inFlight = settingsApi
      .get()
      .then((settings: AppSettings) => {
        set({ settings, loaded: true, loading: false });
        return settings;
      })
      .catch(() => {
        set({ loaded: true, loading: false });
        return get().settings;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  },

  save: async (patch) => {
    const current = get().settings;
    const settings = await settingsApi.save({
      brand: patch.brand ? { ...current.brand, ...patch.brand } : undefined,
      documents: patch.documents ? { ...current.documents, ...patch.documents } : undefined,
    });
    set({ settings, loaded: true });
    return settings;
  },

  uploadImage: async (file, slot = 'logo') => {
    const settings = await settingsApi.uploadImage(file, slot);
    set({ settings, loaded: true });
    return settings;
  },
}));

// Brand particulars for components that only need to read them
export const useBrand = (): Brand => useSettingsStore((state) => state.settings.brand);
export const useDocumentDefaults = (): DocumentDefaults => useSettingsStore((state) => state.settings.documents);

// For non-React helpers (print headers, WhatsApp summaries)
export const getBrand = (): Brand => useSettingsStore.getState().settings.brand;

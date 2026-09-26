import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IOwnerContact {
  name: string;
  phone: string;
  email: string;
  notification: boolean;
  isPrimary?: boolean;
}

export interface IBackendURL {
  storefrontURL: string;
  serviceURL: string;
}

export interface IDomainInfo {
  storeURL: string;
  adminURL: string;
  backendURL: IBackendURL;
  databaseURL: string;
}

export interface IWhiteLabelEcommerce extends Document {
  dId: string;
  clientDId: string;
  projectTypeDId: string;
  name: string;
  clientKey: string;
  domainInfo: IDomainInfo;
  owners: IOwnerContact[];
  policies: Record<string, any>;
  features: Record<string, any>;
  stockManagement: Record<string, any>;
  reports: Record<string, any>;
  cloudFlareAnalytics?: Record<string, any>;
  googleAnalytics?: Record<string, any>;
  assetsConfig?: Record<string, any>;
  allowedMenus: string[];
  theme: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  status: 'ACTIVE' | 'DEVELOPMENT' | 'MAINTENANCE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

const BackendURLSchema = new Schema<IBackendURL>(
  {
    storefrontURL: { type: String, required: true, trim: true },
    serviceURL: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DomainInfoSchema = new Schema<IDomainInfo>(
  {
    storeURL: { type: String, required: true, trim: true },
    adminURL: { type: String, required: true, trim: true },
    backendURL: { type: BackendURLSchema, required: true },
    databaseURL: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OwnerContactSchema = new Schema<IOwnerContact>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    notification: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const WhiteLabelEcommerceSchema = new Schema<IWhiteLabelEcommerce>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    clientDId: { type: String, default: '', index: true, trim: true },
    projectTypeDId: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    clientKey: { type: String, required: true, index: true, lowercase: true, trim: true },
    domainInfo: { type: DomainInfoSchema, required: true },
    owners: { type: [OwnerContactSchema], default: [] },
    policies: { type: Schema.Types.Mixed, default: {} },
    features: { type: Schema.Types.Mixed, default: {} },
    stockManagement: { type: Schema.Types.Mixed, default: {} },
    reports: { type: Schema.Types.Mixed, default: {} },
    cloudFlareAnalytics: { type: Schema.Types.Mixed, default: () => ({}) },
    googleAnalytics: { type: Schema.Types.Mixed, default: () => ({}) },
    assetsConfig: { type: Schema.Types.Mixed, default: () => ({ sections: [] }) },
    allowedMenus: { type: [String], default: ['overview', 'orders', 'products', 'settings'] },
    theme: {
      light: { type: Schema.Types.Mixed, required: true },
      dark: { type: Schema.Types.Mixed, required: true },
    },
    status: { type: String, enum: ['ACTIVE', 'DEVELOPMENT', 'MAINTENANCE', 'SUSPENDED'], default: 'ACTIVE' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'whitelabel_ecommerce_projects', timestamps: false }
);

// Retrieve or compile WhiteLabelEcommerce model
export const getWhiteLabelEcommerceModel = (): mongoose.Model<IWhiteLabelEcommerce> => {
  if (operationsDbConnection) {
    return operationsDbConnection.models.WhiteLabelEcommerce || operationsDbConnection.model<IWhiteLabelEcommerce>('WhiteLabelEcommerce', WhiteLabelEcommerceSchema);
  }
  return mongoose.models.WhiteLabelEcommerce || mongoose.model<IWhiteLabelEcommerce>('WhiteLabelEcommerce', WhiteLabelEcommerceSchema);
};

// Seed initial white label ecommerce projects from client configs
export const seedDefaultWhiteLabelProjects = async (conn: mongoose.Connection) => {
  try {
    const projectTypesCol = conn.collection('project_types');
    const wlProjectsCol = conn.collection('whitelabel_ecommerce_projects');
    const generalProjectsCol = conn.collection('projects');

    let wlType = await projectTypesCol.findOne({ key: 'whitelabel_ecommerce' });
    const projectTypeDId = wlType?.dId || generateDId();

    const configs = [
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Decantre',
        clientKey: 'decantre',
        domainInfo: {
          storeURL: 'https://decantrebd.com',
          adminURL: 'https://admin.decantrebd.com',
          backendURL: {
            storefrontURL: 'https://server.decantrebd.com',
            serviceURL: 'https://server.decantrebd.com',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/decantre',
        },
        owners: [
          {
            name: 'Decantre Support',
            phone: '01869151550',
            email: 'support@decantrebd.com',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'product_wise', trackQuantity: true, lowStockThreshold: 5, allowPreorder: true },
          pricing: { mode: 'variable', allowOfferPrice: true },
          variants: { enabled: true, allowVariantImages: true, supportedDimensions: ['size'], defaultUnit: 'ml' },
          specifications: { fragranceNotes: true, season: true, brand: true, gender: true, concentration: true },
        },
        features: { season: true, brand: true, variantImage: true, webmail: true, sizeChart: false, inStoreOrder: true },
        stockManagement: { simpleProduct: true, variableProduct: true },
        reports: { enableInStoreFilter: true, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: false },
        googleAnalytics: { measurementId: 'G-95TCXBZG7W', gtmId: 'GTM-DEC883Z', propertyId: '419823412', streamName: 'Decantre Web Stream', isVerified: true, enhancedMeasurement: true },
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
                { key: 'slider-3', label: 'Slide 3', filename: 'slider-3.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
                { key: 'banner-top', label: 'Top Announcement Banner', filename: 'banner-top.webp', recommendedSize: '1920x100' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Header Logo', filename: 'logo.webp', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['overview', 'orders', 'orders.new', 'orders.list', 'orders.instore', 'products', 'products.new', 'products.list', 'products.miniature', 'products.categories', 'products.brands', 'products.attributes', 'products.coupons', 'reviews', 'members', 'billing', 'billing.billings', 'billing.payments', 'reports', 'analytics', 'users', 'developer', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'studio', 'studio.batch-images', 'activity-logs', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': '#ffffff', '--foreground': '#111827', '--card': '#ffffff', '--card-foreground': '#111827', '--popover': '#ffffff', '--popover-foreground': '#111827', '--primary': '#C5A059', '--primary-foreground': '#ffffff', '--secondary': '#c5a059', '--secondary-foreground': '#ffffff', '--muted': '#f3f4f6', '--muted-foreground': '#6b7280', '--accent': '#eeeeee', '--accent-foreground': '#111827', '--destructive': '#ef4444', '--destructive-foreground': '#fafafa', '--border': '#e5e7eb', '--input': '#e5e7eb', '--ring': '#C5A059', '--chart-1': '#c5a059', '--chart-2': '#C5A059', '--chart-3': '#fbcb97', '--chart-4': '#888888', '--chart-5': '#999999', '--sidebar': '#f3f4f6', '--sidebar-foreground': '#111827', '--sidebar-primary': '#C5A059', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': '#ffffff', '--sidebar-accent-foreground': '#111827', '--sidebar-border': '#e5e7eb', '--sidebar-ring': '#C5A059', '--radius': '0.75rem' },
          dark: { '--background': '#121113', '--foreground': '#c1c1c1', '--card': '#121212', '--card-foreground': '#c1c1c1', '--popover': '#121113', '--popover-foreground': '#c1c1c1', '--primary': '#C5A059', '--primary-foreground': '#121113', '--secondary': '#c5a059', '--secondary-foreground': '#121113', '--muted': '#222222', '--muted-foreground': '#888888', '--accent': '#333333', '--accent-foreground': '#c1c1c1', '--destructive': '#ef4444', '--destructive-foreground': '#ffffff', '--border': '#222222', '--input': '#222222', '--ring': '#C5A059', '--chart-1': '#c5a059', '--chart-2': '#C5A059', '--chart-3': '#fbcb97', '--chart-4': '#888888', '--chart-5': '#999999', '--sidebar': '#121212', '--sidebar-foreground': '#c1c1c1', '--sidebar-primary': '#C5A059', '--sidebar-primary-foreground': '#121113', '--sidebar-accent': '#333333', '--sidebar-accent-foreground': '#c1c1c1', '--sidebar-border': '#222222', '--sidebar-ring': '#C5A059', '--radius': '0.75rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Demo Store',
        clientKey: 'demo',
        domainInfo: {
          storeURL: 'https://store.plexivia.online',
          adminURL: 'https://dashboard.plexivia.online',
          backendURL: {
            storefrontURL: 'https://api.plexivia.online',
            serviceURL: 'https://api.plexivia.online',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/demo',
        },
        owners: [
          {
            name: 'Demo Support',
            phone: '+8801823110885',
            email: 'info@plexivia.online',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'variant_wise', trackQuantity: true, lowStockThreshold: 5, allowPreorder: false },
          pricing: { mode: 'variable', allowOfferPrice: true },
          variants: { enabled: true, allowVariantImages: true, supportedDimensions: ['size', 'color'], defaultUnit: 'piece' },
          specifications: { material: true, origin: true },
        },
        features: { season: true, brand: true, variantImage: true, webmail: true, inStoreOrder: true },
        stockManagement: { simpleProduct: true, variableProduct: true },
        reports: { enableInStoreFilter: true, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: false },
        googleAnalytics: {},
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Header Logo', filename: 'logo.webp', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['*', 'overview', 'orders', 'orders.new', 'orders.list', 'orders.instore', 'products', 'products.new', 'products.list', 'products.categories', 'products.brands', 'products.attributes', 'products.coupons', 'reviews', 'members', 'billing', 'billing.billings', 'billing.payments', 'admin', 'reports', 'analytics', 'studio', 'studio.batch-images', 'activity-logs', 'users', 'developer', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': 'oklch(1 0 0)', '--foreground': 'oklch(0.145 0 0)', '--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.145 0 0)', '--popover': 'oklch(1 0 0)', '--popover-foreground': 'oklch(0.145 0 0)', '--primary': 'oklch(0.488 0.243 264.376)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.92 0.05 264)', '--secondary-foreground': 'oklch(0.25 0.08 264)', '--muted': 'oklch(0.97 0 0)', '--muted-foreground': 'oklch(0.556 0 0)', '--accent': 'oklch(0.92 0.05 264)', '--accent-foreground': 'oklch(0.205 0 0)', '--destructive': 'oklch(0.577 0.245 27.325)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.922 0 0)', '--input': 'oklch(0.922 0 0)', '--ring': 'oklch(0.488 0.243 264.376)', '--chart-1': 'oklch(0.488 0.243 264.376)', '--chart-2': 'oklch(0.6 0.118 184.704)', '--chart-3': 'oklch(0.398 0.07 227.392)', '--chart-4': 'oklch(0.828 0.189 84.429)', '--chart-5': 'oklch(0.769 0.188 70.08)', '--sidebar': 'oklch(0.145 0 0 / 90%)', '--sidebar-foreground': 'oklch(0.95 0 0)', '--sidebar-primary': 'oklch(0.488 0.243 264.376)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.269 0 0)', '--sidebar-accent-foreground': 'oklch(0.95 0 0)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.556 0 0)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.625rem' },
          dark: { '--background': 'oklch(0.145 0 0)', '--foreground': 'oklch(0.985 0 0)', '--card': 'oklch(0.205 0 0)', '--card-foreground': 'oklch(0.985 0 0)', '--popover': 'oklch(0.269 0 0)', '--popover-foreground': 'oklch(0.985 0 0)', '--primary': 'oklch(0.55 0.22 264)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.269 0.04 264)', '--secondary-foreground': 'oklch(0.95 0 0)', '--muted': 'oklch(0.269 0 0)', '--muted-foreground': 'oklch(0.708 0 0)', '--accent': 'oklch(0.269 0 0)', '--accent-foreground': 'oklch(0.985 0 0)', '--destructive': 'oklch(0.704 0.191 22.216)', '--destructive-foreground': '#ffffff', '--border': 'oklch(1 0 0 / 10%)', '--input': 'oklch(1 0 0 / 15%)', '--ring': 'oklch(0.55 0.22 264)', '--chart-1': 'oklch(0.55 0.22 264)', '--chart-2': 'oklch(0.696 0.17 162.48)', '--chart-3': 'oklch(0.769 0.188 70.08)', '--chart-4': 'oklch(0.627 0.265 303.9)', '--chart-5': 'oklch(0.645 0.246 16.439)', '--sidebar': 'oklch(0.145 0 0 / 90%)', '--sidebar-foreground': 'oklch(0.95 0 0)', '--sidebar-primary': 'oklch(0.55 0.22 264)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.269 0 0)', '--sidebar-accent-foreground': 'oklch(0.95 0 0)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.556 0 0)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.625rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Engulfic',
        clientKey: 'engulfic',
        domainInfo: {
          storeURL: 'https://engulfic.com',
          adminURL: 'https://admin.engulfic.com',
          backendURL: {
            storefrontURL: 'https://server.engulfic.com',
            serviceURL: 'https://server.engulfic.com',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/engulfic',
        },
        owners: [
          {
            name: 'Engulfic Support',
            phone: '01600905774',
            email: 'support@engulfic.com',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'variant_wise', trackQuantity: true, lowStockThreshold: 3, allowPreorder: false },
          pricing: { mode: 'flat', allowOfferPrice: true },
          variants: { enabled: true, allowVariantImages: false, supportedDimensions: ['size', 'color'], defaultUnit: 'piece' },
          specifications: { fabric: true, sizeGuide: true, gender: true, careInstructions: true },
        },
        features: { season: false, brand: false, variantImage: false, webmail: true, sizeChart: true, inStoreOrder: false },
        stockManagement: { simpleProduct: true, variableProduct: true },
        reports: { enableInStoreFilter: false, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: false },
        googleAnalytics: { measurementId: 'G-V2H268T9Q5', gtmId: '', propertyId: '', streamName: 'Engulfic Web Stream', isVerified: true, enhancedMeasurement: true },
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
                { key: 'slider-3', label: 'Slide 3', filename: 'slider-3.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Header Logo', filename: 'logo.webp', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['overview', 'orders', 'orders.list', 'products', 'products.new', 'products.list', 'products.categories', 'products.attributes', 'products.coupons', 'products.size-charts', 'reviews', 'studio', 'studio.batch-images', 'products.brands', 'members', 'reports', 'analytics', 'activity-logs', 'users', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': 'oklch(1.0000 0 0)', '--foreground': 'oklch(0.1884 0.0128 248.5103)', '--card': 'oklch(0.9784 0.0011 197.1387)', '--card-foreground': 'oklch(0.1884 0.0128 248.5103)', '--popover': 'oklch(1.0000 0 0)', '--popover-foreground': 'oklch(0.1884 0.0128 248.5103)', '--primary': '#f97316', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.1884 0.0128 248.5103)', '--secondary-foreground': 'oklch(1.0000 0 0)', '--muted': 'oklch(0.9222 0.0013 286.3737)', '--muted-foreground': 'oklch(0.1884 0.0128 248.5103)', '--accent': '#fff7ed', '--accent-foreground': '#f97316', '--destructive': 'oklch(0.6188 0.2376 25.7658)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.9317 0.0118 231.6594)', '--input': 'oklch(0.9809 0.0025 228.7836)', '--ring': '#f97316', '--chart-1': '#f97316', '--chart-2': 'oklch(0.6907 0.1554 160.3454)', '--chart-3': 'oklch(0.8214 0.1600 82.5337)', '--chart-4': 'oklch(0.7064 0.1822 151.7125)', '--chart-5': 'oklch(0.5919 0.2186 10.5826)', '--sidebar': 'oklch(0.9784 0.0011 197.1387)', '--sidebar-foreground': 'oklch(0.1884 0.0128 248.5103)', '--sidebar-primary': '#f97316', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': '#fff7ed', '--sidebar-accent-foreground': '#f97316', '--sidebar-border': 'oklch(0.9271 0.0101 238.5177)', '--sidebar-ring': '#f97316', '--radius': '0.625rem' },
          dark: { '--background': 'oklch(0 0 0)', '--foreground': 'oklch(0.9328 0.0025 228.7857)', '--card': 'oklch(0.2097 0.0080 274.5332)', '--card-foreground': 'oklch(0.8853 0 0)', '--popover': 'oklch(0 0 0)', '--popover-foreground': 'oklch(0.9328 0.0025 228.7857)', '--primary': '#f97316', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.9622 0.0035 219.5331)', '--secondary-foreground': 'oklch(0.1884 0.0128 248.5103)', '--muted': 'oklch(0.2090 0 0)', '--muted-foreground': 'oklch(0.5637 0.0078 247.9662)', '--accent': 'rgba(249, 115, 22, 0.15)', '--accent-foreground': '#f97316', '--destructive': 'oklch(0.6188 0.2376 25.7658)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.2674 0.0047 248.0045)', '--input': 'oklch(0.3020 0.0288 244.8244)', '--ring': '#f97316', '--chart-1': '#f97316', '--chart-2': 'oklch(0.6907 0.1554 160.3454)', '--chart-3': 'oklch(0.8214 0.1600 82.5337)', '--chart-4': 'oklch(0.7064 0.1822 151.7125)', '--chart-5': 'oklch(0.5919 0.2186 10.5826)', '--sidebar': 'oklch(0.2097 0.0080 274.5332)', '--sidebar-foreground': 'oklch(0.8853 0 0)', '--sidebar-primary': '#f97316', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'rgba(249, 115, 22, 0.15)', '--sidebar-accent-foreground': '#f97316', '--sidebar-border': 'oklch(0.3795 0.0220 240.5943)', '--sidebar-ring': '#f97316', '--radius': '0.625rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Kawaii Kutir',
        clientKey: 'kawaiikutir',
        domainInfo: {
          storeURL: 'https://kawaiikutir.shop',
          adminURL: 'https://admin.kawaiikutir.shop',
          backendURL: {
            storefrontURL: 'https://server.kawaiikutir.shop',
            serviceURL: 'https://server.kawaiikutir.shop',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/kawaiikutir',
        },
        owners: [
          {
            name: 'Kawaii Kutir Support',
            phone: '01600905774',
            email: 'kawaiikutir@gmail.com',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'variant_wise', trackQuantity: true, lowStockThreshold: 5, allowPreorder: false },
          pricing: { mode: 'variable', allowOfferPrice: true },
          variants: { enabled: true, allowVariantImages: true, supportedDimensions: ['size', 'color', 'style', 'design'], defaultUnit: 'piece' },
          specifications: { material: true, design: true, character: true },
        },
        features: { season: false, brand: false, variantImage: true, webmail: true, inStoreOrder: false },
        stockManagement: { simpleProduct: true, variableProduct: true },
        reports: { enableInStoreFilter: true, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: false },
        googleAnalytics: {},
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Header Logo', filename: 'kawaiikutir_logo.png', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['*', 'overview', 'orders', 'orders.list', 'products', 'products.new', 'products.list', 'products.categories', 'products.brands', 'products.attributes', 'products.coupons', 'reviews', 'members', 'billing', 'billing.billings', 'billing.payments', 'admin', 'reports', 'analytics', 'studio', 'studio.batch-images', 'activity-logs', 'users', 'developer', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': 'oklch(0.99 0.01 350)', '--foreground': 'oklch(0.15 0.02 350)', '--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.15 0.02 350)', '--popover': 'oklch(1 0 0)', '--popover-foreground': 'oklch(0.15 0.02 350)', '--primary': 'oklch(0.65 0.22 350)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.92 0.06 350)', '--secondary-foreground': 'oklch(0.25 0.08 350)', '--muted': 'oklch(0.97 0.01 350)', '--muted-foreground': 'oklch(0.55 0.03 350)', '--accent': 'oklch(0.93 0.08 340)', '--accent-foreground': 'oklch(0.25 0.08 340)', '--destructive': 'oklch(0.577 0.245 27.325)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.92 0.02 350)', '--input': 'oklch(0.92 0.02 350)', '--ring': 'oklch(0.65 0.22 350)', '--chart-1': 'oklch(0.65 0.22 350)', '--chart-2': 'oklch(0.75 0.18 320)', '--chart-3': 'oklch(0.70 0.15 40)', '--chart-4': 'oklch(0.80 0.14 80)', '--chart-5': 'oklch(0.60 0.20 280)', '--sidebar': 'oklch(0.15 0.02 350 / 95%)', '--sidebar-foreground': 'oklch(0.95 0.02 350)', '--sidebar-primary': 'oklch(0.65 0.22 350)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.25 0.03 350)', '--sidebar-accent-foreground': 'oklch(0.95 0.02 350)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.65 0.22 350)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.75rem' },
          dark: { '--background': 'oklch(0.14 0.02 350)', '--foreground': 'oklch(0.98 0.01 350)', '--card': 'oklch(0.18 0.02 350)', '--card-foreground': 'oklch(0.98 0.01 350)', '--popover': 'oklch(0.20 0.02 350)', '--popover-foreground': 'oklch(0.98 0.01 350)', '--primary': 'oklch(0.70 0.20 350)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.28 0.05 350)', '--secondary-foreground': 'oklch(0.95 0.02 350)', '--muted': 'oklch(0.22 0.02 350)', '--muted-foreground': 'oklch(0.70 0.03 350)', '--accent': 'oklch(0.28 0.06 340)', '--accent-foreground': 'oklch(0.95 0.02 340)', '--destructive': 'oklch(0.704 0.191 22.216)', '--destructive-foreground': '#ffffff', '--border': 'oklch(1 0 0 / 12%)', '--input': 'oklch(1 0 0 / 15%)', '--ring': 'oklch(0.70 0.20 350)', '--chart-1': 'oklch(0.70 0.20 350)', '--chart-2': 'oklch(0.75 0.18 320)', '--chart-3': 'oklch(0.70 0.15 40)', '--chart-4': 'oklch(0.80 0.14 80)', '--chart-5': 'oklch(0.60 0.20 280)', '--sidebar': 'oklch(0.12 0.02 350 / 95%)', '--sidebar-foreground': 'oklch(0.95 0.02 350)', '--sidebar-primary': 'oklch(0.70 0.20 350)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.22 0.03 350)', '--sidebar-accent-foreground': 'oklch(0.95 0.02 350)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.70 0.20 350)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.75rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Surokkha',
        clientKey: 'surokkha',
        domainInfo: {
          storeURL: 'https://surokkha.store',
          adminURL: 'https://admin.surokkha.store',
          backendURL: {
            storefrontURL: 'https://api.surokkha.store',
            serviceURL: 'https://api.surokkha.store',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/surokkha',
        },
        owners: [
          {
            name: 'Surokkha Support',
            phone: '01600905774',
            email: 'support@surokkha.store',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'product_wise', trackQuantity: true, lowStockThreshold: 5, allowPreorder: false },
          pricing: { mode: 'simple', allowOfferPrice: true },
          variants: { enabled: false, allowVariantImages: false, supportedDimensions: [], defaultUnit: 'piece' },
          specifications: { material: true, packSize: true, origin: true },
          members: { forceMembershipFromOrder: true },
        },
        features: { season: false, brand: false, category: false, categories: false, attribute: false, attributes: false, variantImage: false, sizeChart: false, webmail: true, inStoreOrder: true },
        stockManagement: { simpleProduct: true, variableProduct: false },
        reports: { enableInStoreFilter: true, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: true, zoneId: 'bd131177db6d610b5d4e5beb0142108b', domain: 'surokkha.store', accountEmail: 'plexivia@gmail.com' },
        googleAnalytics: { measurementId: 'G-3JHW9WK6GG', googleTagId: 'GT-5DH5WGNX', propertyId: '555476258', streamId: '15828364152', streamName: 'surokkha', isVerified: true, enhancedMeasurement: true },
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
                { key: 'slider-3', label: 'Slide 3', filename: 'slider-3.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Dashboard Logo', filename: 'logo.webp', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['*', 'overview', 'orders', 'orders.new', 'orders.list', 'orders.instore', 'products', 'products.new', 'products.list', 'products.categories', 'products.coupons', 'reviews', 'members', 'billing', 'billing.billings', 'billing.payments', 'admin', 'reports', 'analytics', 'studio', 'studio.batch-images', 'activity-logs', 'users', 'developer', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': 'oklch(0.99 0.005 15)', '--foreground': 'oklch(0.15 0.02 15)', '--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.15 0.02 15)', '--popover': 'oklch(1 0 0)', '--popover-foreground': 'oklch(0.15 0.02 15)', '--primary': 'oklch(0.50 0.22 15)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.95 0.03 15)', '--secondary-foreground': 'oklch(0.25 0.08 15)', '--muted': 'oklch(0.97 0.01 15)', '--muted-foreground': 'oklch(0.55 0.03 15)', '--accent': 'oklch(0.92 0.06 15)', '--accent-foreground': 'oklch(0.25 0.08 15)', '--destructive': 'oklch(0.577 0.245 27.325)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.92 0.02 15)', '--input': 'oklch(0.92 0.02 15)', '--ring': 'oklch(0.50 0.22 15)', '--chart-1': 'oklch(0.50 0.22 15)', '--chart-2': 'oklch(0.65 0.18 350)', '--chart-3': 'oklch(0.70 0.15 40)', '--chart-4': 'oklch(0.80 0.14 80)', '--chart-5': 'oklch(0.60 0.20 280)', '--sidebar': 'oklch(0.15 0.02 15 / 95%)', '--sidebar-foreground': 'oklch(0.95 0.02 15)', '--sidebar-primary': 'oklch(0.50 0.22 15)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.25 0.03 15)', '--sidebar-accent-foreground': 'oklch(0.95 0.02 15)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.50 0.22 15)', '--font-sans': "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", '--font-serif': 'Georgia, serif', '--font-mono': 'ui-monospace, monospace', '--radius': '0.75rem' },
          dark: { '--background': 'oklch(0.14 0.02 15)', '--foreground': 'oklch(0.98 0.01 15)', '--card': 'oklch(0.18 0.02 15)', '--card-foreground': 'oklch(0.98 0.01 15)', '--popover': 'oklch(0.20 0.02 15)', '--popover-foreground': 'oklch(0.98 0.01 15)', '--primary': 'oklch(0.60 0.22 15)', '--primary-foreground': '#ffffff', '--secondary': 'oklch(0.28 0.05 15)', '--secondary-foreground': 'oklch(0.95 0.02 15)', '--muted': 'oklch(0.22 0.02 15)', '--muted-foreground': 'oklch(0.70 0.03 15)', '--accent': 'oklch(0.28 0.06 15)', '--accent-foreground': 'oklch(0.95 0.02 15)', '--destructive': 'oklch(0.704 0.191 22.216)', '--destructive-foreground': '#ffffff', '--border': 'oklch(1 0 0 / 12%)', '--input': 'oklch(1 0 0 / 15%)', '--ring': 'oklch(0.60 0.22 15)', '--chart-1': 'oklch(0.60 0.22 15)', '--chart-2': 'oklch(0.75 0.18 350)', '--chart-3': 'oklch(0.70 0.15 40)', '--chart-4': 'oklch(0.80 0.14 80)', '--chart-5': 'oklch(0.60 0.20 280)', '--sidebar': 'oklch(0.12 0.02 15 / 95%)', '--sidebar-foreground': 'oklch(0.95 0.02 15)', '--sidebar-primary': 'oklch(0.60 0.22 15)', '--sidebar-primary-foreground': '#ffffff', '--sidebar-accent': 'oklch(0.22 0.03 15)', '--sidebar-accent-foreground': 'oklch(0.95 0.02 15)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.60 0.22 15)', '--font-sans': "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", '--font-serif': 'Georgia, serif', '--font-mono': 'ui-monospace, monospace', '--radius': '0.75rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        clientDId: '',
        projectTypeDId,
        name: 'Toyoland',
        clientKey: 'toyoland',
        domainInfo: {
          storeURL: 'https://toyoland.shop',
          adminURL: 'https://admin.toyoland.shop',
          backendURL: {
            storefrontURL: 'https://server.toyoland.shop',
            serviceURL: 'https://server.toyoland.shop',
          },
          databaseURL: 'mongodb://127.0.0.1:27017/toyoland',
        },
        owners: [
          {
            name: 'Toyoland Support',
            phone: '01600905774',
            email: 'support@toyoland.shop',
            notification: true,
            isPrimary: true,
          },
        ],
        policies: {
          stock: { mode: 'variant_wise', trackQuantity: true, lowStockThreshold: 5, allowPreorder: false },
          pricing: { mode: 'variable', allowOfferPrice: true },
          variants: { enabled: true, allowVariantImages: false, supportedDimensions: ['size', 'color', 'type'], defaultUnit: 'piece' },
          specifications: { ageGroup: true, material: true, batteryRequired: true, gender: true },
        },
        features: { season: true, brand: true, variantImage: false, webmail: true, inStoreOrder: true },
        stockManagement: { simpleProduct: true, variableProduct: true },
        reports: { enableInStoreFilter: true, enableExport: true, enabledTabs: ['sales', 'products', 'payments', 'inventory'] },
        cloudFlareAnalytics: { active: false },
        googleAnalytics: {},
        assetsConfig: {
          sections: [
            {
              id: 'hero-sliders',
              title: 'Hero Slider Carousel',
              description: 'Main sliding banners displayed on store homepage (Recommended: 1920x650 px, max 2MB)',
              slots: [
                { key: 'slider-1', label: 'Slide 1', filename: 'slider-1.webp', recommendedSize: '1920x650' },
                { key: 'slider-2', label: 'Slide 2', filename: 'slider-2.webp', recommendedSize: '1920x650' },
              ],
            },
            {
              id: 'promo-banners',
              title: 'Promotional Banners',
              description: 'Special campaign and announcement banner images',
              slots: [
                { key: 'banner-main', label: 'Main Promo Banner', filename: 'banner-main.webp', recommendedSize: '1200x400' },
              ],
            },
            {
              id: 'brand-identity',
              title: 'Brand & Identity',
              description: 'Brand logo and browser favicon files',
              slots: [
                { key: 'logo', label: 'Header Logo', filename: 'toyoland_logo.png', recommendedSize: '500x200' },
                { key: 'favicon', label: 'Favicon Icon', filename: 'favicon.ico', recommendedSize: '64x64' },
              ],
            },
          ],
        },
        allowedMenus: ['*', 'overview', 'orders', 'orders.new', 'orders.list', 'orders.instore', 'products', 'products.new', 'products.list', 'products.categories', 'products.brands', 'products.attributes', 'products.coupons', 'reviews', 'members', 'billing', 'billing.billings', 'billing.payments', 'admin', 'reports', 'analytics', 'studio', 'studio.batch-images', 'activity-logs', 'users', 'developer', 'tools', 'tools.messages', 'tools.assets', 'tools.bulk-image-resize', 'tools.meta-catalog', 'logs', 'system-logs', 'trash', 'settings'],
        theme: {
          light: { '--background': 'oklch(1 0 0)', '--foreground': 'oklch(0.145 0 0)', '--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.145 0 0)', '--popover': 'oklch(1 0 0)', '--popover-foreground': 'oklch(0.145 0 0)', '--primary': 'oklch(0.349 0.028 158.746)', '--primary-foreground': 'oklch(0.951 0.011 149.858)', '--secondary': 'oklch(0.698 0.034 148.031)', '--secondary-foreground': 'oklch(0.951 0.011 149.858)', '--muted': 'oklch(0.97 0 0)', '--muted-foreground': 'oklch(0.556 0 0)', '--accent': 'oklch(0.904 0.028 98.092)', '--accent-foreground': 'oklch(0.205 0 0)', '--destructive': 'oklch(0.577 0.245 27.325)', '--destructive-foreground': '#ffffff', '--border': 'oklch(0.922 0 0)', '--input': 'oklch(0.922 0 0)', '--ring': 'oklch(0.708 0 0)', '--chart-1': 'oklch(0.646 0.222 41.116)', '--chart-2': 'oklch(0.6 0.118 184.704)', '--chart-3': 'oklch(0.398 0.07 227.392)', '--chart-4': 'oklch(0.828 0.189 84.429)', '--chart-5': 'oklch(0.769 0.188 70.08)', '--sidebar': 'oklch(0.145 0 0 / 90%)', '--sidebar-foreground': 'oklch(0.904 0.028 98.092)', '--sidebar-primary': 'oklch(0.349 0.028 158.746)', '--sidebar-primary-foreground': 'oklch(0.985 0 0)', '--sidebar-accent': 'oklch(0.269 0 0)', '--sidebar-accent-foreground': 'oklch(0.904 0.028 98.092)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.556 0 0)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.625rem' },
          dark: { '--background': 'oklch(0.145 0 0)', '--foreground': 'oklch(0.985 0 0)', '--card': 'oklch(0.205 0 0)', '--card-foreground': 'oklch(0.985 0 0)', '--popover': 'oklch(0.269 0 0)', '--popover-foreground': 'oklch(0.985 0 0)', '--primary': 'oklch(0.349 0.028 158.746)', '--primary-foreground': 'oklch(0.951 0.011 149.858)', '--secondary': 'oklch(0.698 0.034 148.031)', '--secondary-foreground': 'oklch(0.951 0.011 149.858)', '--muted': 'oklch(0.269 0 0)', '--muted-foreground': 'oklch(0.708 0 0)', '--accent': 'oklch(0.904 0.028 98.092)', '--accent-foreground': 'oklch(0.205 0.001 0)', '--destructive': 'oklch(0.704 0.191 22.216)', '--destructive-foreground': '#ffffff', '--border': 'oklch(1 0 0 / 10%)', '--input': 'oklch(1 0 0 / 15%)', '--ring': 'oklch(0.556 0 0)', '--chart-1': 'oklch(0.488 0.243 264.376)', '--chart-2': 'oklch(0.696 0.17 162.48)', '--chart-3': 'oklch(0.769 0.188 70.08)', '--chart-4': 'oklch(0.627 0.265 303.9)', '--chart-5': 'oklch(0.645 0.246 16.439)', '--sidebar': 'oklch(0.145 0 0 / 90%)', '--sidebar-foreground': 'oklch(0.904 0.028 98.092)', '--sidebar-primary': 'oklch(0.349 0.028 158.746)', '--sidebar-primary-foreground': 'oklch(0.985 0 0)', '--sidebar-accent': 'oklch(0.269 0 0)', '--sidebar-accent-foreground': 'oklch(0.904 0.028 98.092)', '--sidebar-border': 'oklch(1 0 0 / 10%)', '--sidebar-ring': 'oklch(0.556 0 0)', '--font-sans': "'Poppins', system-ui, -apple-system, sans-serif", '--font-serif': "'Libre Baskerville', Georgia, serif", '--font-mono': "'IBM Plex Mono', ui-monospace, monospace", '--radius': '0.625rem' },
        },
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const item of configs) {
      const exists = await wlProjectsCol.findOne({ clientKey: item.clientKey });
      if (!exists) {
        await wlProjectsCol.insertOne(item);
        console.log(`🚀 [whitelabel_ecommerce_projects] Seeded project: ${item.name} (${item.clientKey}) [dId: ${item.dId}]`);
      } else {
        await wlProjectsCol.updateOne(
          { clientKey: item.clientKey },
          {
            $set: {
              name: item.name,
              domainInfo: item.domainInfo,
              owners: item.owners,
              policies: item.policies,
              features: item.features,
              stockManagement: item.stockManagement,
              reports: item.reports,
              cloudFlareAnalytics: item.cloudFlareAnalytics,
              googleAnalytics: item.googleAnalytics,
              assetsConfig: item.assetsConfig,
              allowedMenus: item.allowedMenus,
              theme: item.theme,
              status: item.status,
              updated_at: new Date().toISOString(),
            },
          }
        );
      }

      const generalProjectExists = await generalProjectsCol.findOne({ name: item.name });
      if (!generalProjectExists) {
        await generalProjectsCol.insertOne({
          dId: item.dId,
          client_dId: '',
          project_type_dId: projectTypeDId,
          name: item.name,
          description: `White-label multi-tenant ecommerce platform for ${item.name}`,
          status: 'In Progress',
          progress: 100,
          priority: 'High',
          due_date: '2026-12-31',
          tasks_count: 12,
          created_at: new Date().toISOString(),
        });
      }
    }
  } catch (err: any) {
    console.warn('⚠️ [seedDefaultWhiteLabelProjects] notice:', err.message);
  }
};

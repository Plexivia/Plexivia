import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';

/**
 * Dashboard-wide settings, kept as a single document (`key: 'app'`).
 *
 * The brand block is the one source of truth for the logo, agency name and
 * contact particulars printed on every generated document (invoice, money
 * receipt, salary slip, voucher) and shown in the dashboard shell. Editing it
 * on the Settings page changes every one of those places at once.
 */
export interface IBrandAddress {
  line1: string;
  road: string;
  district: string;
  postcode: string;
  country: string;
  full: string;
  full_bn: string;
}

export interface IBrandSettings {
  name: string;
  legal_name: string;
  brand_title: string;
  brand_subtitle: string;
  tagline: string;
  logo_url: string;
  icon_url: string;
  phone: string;
  phone_local: string;
  email: string;
  website: string;
  domain: string;
  address: IBrandAddress;
}

export interface IDocumentSettings {
  currency: string;
  invoice_prefix: string;
  receipt_prefix: string;
  slip_prefix: string;
  default_tax_rate: number;
  invoice_due_days: number;
  payment_terms: string;
  receipt_signatory: string;
}

export interface IAppSettings extends Document {
  key: string;
  brand: IBrandSettings;
  documents: IDocumentSettings;
  updated_at: string;
}

const BrandAddressSchema = new Schema<IBrandAddress>(
  {
    line1: { type: String, trim: true, default: '' },
    road: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    postcode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Bangladesh' },
    full: { type: String, trim: true, default: '' },
    full_bn: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const BrandSettingsSchema = new Schema<IBrandSettings>(
  {
    name: { type: String, trim: true, default: 'Plexivia' },
    legal_name: { type: String, trim: true, default: '' },
    brand_title: { type: String, trim: true, default: 'PLEXIVIA' },
    brand_subtitle: { type: String, trim: true, default: '' },
    tagline: { type: String, trim: true, default: '' },
    logo_url: { type: String, trim: true, default: '' },
    icon_url: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    phone_local: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    domain: { type: String, trim: true, default: '' },
    address: { type: BrandAddressSchema, default: () => ({}) },
  },
  { _id: false }
);

const DocumentSettingsSchema = new Schema<IDocumentSettings>(
  {
    currency: { type: String, trim: true, default: 'BDT' },
    invoice_prefix: { type: String, trim: true, default: 'PX-INV' },
    receipt_prefix: { type: String, trim: true, default: 'PX-MR' },
    slip_prefix: { type: String, trim: true, default: 'PX-SLIP' },
    default_tax_rate: { type: Number, default: 0, min: 0, max: 100 },
    invoice_due_days: { type: Number, default: 15, min: 0 },
    payment_terms: { type: String, trim: true, default: '' },
    receipt_signatory: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'app' },
    brand: { type: BrandSettingsSchema, default: () => ({}) },
    documents: { type: DocumentSettingsSchema, default: () => ({}) },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'app_settings', timestamps: false, minimize: false }
);

const compile = <T>(name: string, schema: Schema<T>): mongoose.Model<T> => {
  if (secureDbConnection) return (secureDbConnection.models[name] as mongoose.Model<T>) || secureDbConnection.model<T>(name, schema);
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
};

export const getAppSettingsModel = () => compile<IAppSettings>('AppSettings', AppSettingsSchema);

// The settings document, created with schema defaults the first time it is asked for
export const getOrCreateAppSettings = async () => {
  const Model = getAppSettingsModel();
  const existing = await Model.findOne({ key: 'app' });
  if (existing) return existing;
  return Model.create({ key: 'app' });
};

import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

// One custom field shown on the public QR landing page (label/value pairs are fully dynamic)
export interface IQrField {
  label: string;
  value: string;
  type?: 'text' | 'phone' | 'email' | 'url' | 'address';
}

export interface IQrCode extends Document {
  dId: string;
  slug: string; // value sent as the query param, e.g. /qr?code=<slug>
  title: string;
  // Business information rendered by the website page
  business: {
    name: string;
    logo_url?: string;
    tagline?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    address?: string;
    social?: Record<string, string>;
  };
  fields: IQrField[];
  // Whose info: our own business, an existing client, or typed manually
  source: 'SELF' | 'CLIENT' | 'MANUAL';
  client_dId?: string;
  // What happens on scan:
  //  LANDING    -> our website page (?code=slug) rendered with `template`
  //  WHATSAPP   -> opens a wa.me chat with a prefilled message
  //  CUSTOM_URL -> opens any URL
  //  VCARD      -> contact card saved straight to the phone (works offline)
  target_mode: 'LANDING' | 'WHATSAPP' | 'CUSTOM_URL' | 'VCARD';
  template: 'CONTACT' | 'PAYMENT' | 'PROFILE';
  custom_url?: string;
  whatsapp?: { number?: string; message?: string };
  payment?: { methods: { label: string; account: string; type?: string }[]; amount?: number; note?: string };
  // Rendering options
  style: { color: string; background: string; margin: number; error_correction: 'L' | 'M' | 'Q' | 'H' };
  is_active: boolean;
  scan_count: number;
  last_scanned_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const QrCodeSchema = new Schema<IQrCode>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  business: {
    name: { type: String, required: true },
    logo_url: String,
    tagline: String,
    description: String,
    phone: String,
    whatsapp: String,
    email: String,
    website: String,
    address: String,
    social: { type: Schema.Types.Mixed, default: {} },
  },
  fields: [{
    _id: false,
    label: { type: String, required: true },
    value: { type: String, required: true },
    type: { type: String, enum: ['text', 'phone', 'email', 'url', 'address'], default: 'text' },
  }],
  source: { type: String, enum: ['SELF', 'CLIENT', 'MANUAL'], default: 'MANUAL' },
  client_dId: { type: String, index: true },
  target_mode: { type: String, enum: ['LANDING', 'WHATSAPP', 'CUSTOM_URL', 'VCARD'], default: 'LANDING' },
  template: { type: String, enum: ['CONTACT', 'PAYMENT', 'PROFILE'], default: 'CONTACT' },
  custom_url: String,
  whatsapp: { number: String, message: String },
  payment: {
    methods: [{ _id: false, label: String, account: String, type: { type: String } }],
    amount: Number,
    note: String,
  },
  style: {
    color: { type: String, default: '#000000' },
    background: { type: String, default: '#ffffff' },
    margin: { type: Number, default: 2 },
    error_correction: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
  },
  is_active: { type: Boolean, default: true },
  scan_count: { type: Number, default: 0 },
  last_scanned_at: String,
  created_by: String,
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'qr_codes', timestamps: false });

// Retrieve or compile QrCode model
export const getQrCodeModel = (): mongoose.Model<IQrCode> => {
  if (operationsDbConnection) return operationsDbConnection.models.QrCode || operationsDbConnection.model<IQrCode>('QrCode', QrCodeSchema);
  return mongoose.models.QrCode || mongoose.model<IQrCode>('QrCode', QrCodeSchema);
};

import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';
import { nextSequence } from './Accounts.js';

export interface IVendor extends Document {
  dId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface IPurchaseLine {
  stock_item_id: string;
  short_name: string;
  name?: string;
  unit?: string;
  pack_label?: string;
  packs: number;
  units_per_pack: number;
  units: number;
  pack_price: number;
  unit_cost: number;
  total: number;
}

export interface IPurchasePayment {
  dId: string;
  method: string;
  payment_method_dId?: string;
  amount: number;
  transaction_reference?: string;
  paid_at: string;
  note?: string;
}

export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface IPurchase extends Document {
  dId: string;
  purchase_number: string;
  vendor_dId?: string;
  vendor_name: string;
  vendor_phone?: string;
  vendor_email?: string;
  order_date: string;
  received_date?: string;
  status: PurchaseStatus;
  lines: IPurchaseLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payments: IPurchasePayment[];
  paid_amount: number;
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID';
  bill_dId?: string;
  bill_number?: string;
  sync: {
    status: 'none' | 'pending' | 'synced' | 'failed';
    action?: 'apply' | 'cancel';
    version: number;
    last_error?: string;
    synced_at?: string;
    attempts: number;
  };
  notes?: string;
  attachments?: { name?: string; url: string }[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const VendorSchema = new Schema<IVendor>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'vendors', timestamps: false }
);

VendorSchema.index({ name: 1 }, { collation: { locale: 'en', strength: 2 } });

const PurchaseLineSchema = new Schema<IPurchaseLine>(
  {
    stock_item_id: { type: String, required: true },
    short_name: { type: String, required: true },
    name: { type: String, default: '' },
    unit: { type: String, default: 'pcs' },
    pack_label: { type: String, default: '' },
    packs: { type: Number, required: true },
    units_per_pack: { type: Number, required: true, default: 1 },
    units: { type: Number, required: true },
    pack_price: { type: Number, default: 0 },
    unit_cost: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const PurchasePaymentSchema = new Schema<IPurchasePayment>(
  {
    dId: { type: String, required: true, default: generateDId },
    method: { type: String, required: true },
    payment_method_dId: { type: String },
    amount: { type: Number, required: true },
    transaction_reference: { type: String, default: '' },
    paid_at: { type: String, default: () => new Date().toISOString() },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    purchase_number: { type: String, required: true, unique: true },
    vendor_dId: { type: String, index: true },
    vendor_name: { type: String, required: true, trim: true },
    vendor_phone: { type: String, default: '' },
    vendor_email: { type: String, default: '' },
    order_date: { type: String, default: () => new Date().toISOString() },
    received_date: { type: String },
    status: { type: String, enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'], default: 'DRAFT', index: true },
    lines: { type: [PurchaseLineSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    payments: { type: [PurchasePaymentSchema], default: [] },
    paid_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['PENDING', 'PARTIAL', 'PAID'], default: 'PENDING' },
    bill_dId: { type: String, index: true },
    bill_number: { type: String },
    sync: {
      status: { type: String, enum: ['none', 'pending', 'synced', 'failed'], default: 'none' },
      action: { type: String, enum: ['apply', 'cancel'] },
      version: { type: Number, default: 0 },
      last_error: { type: String },
      synced_at: { type: String },
      attempts: { type: Number, default: 0 },
    },
    notes: { type: String, default: '' },
    attachments: { type: [{ _id: false, name: String, url: String }], default: [] },
    created_by: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'purchases', timestamps: false }
);

PurchaseSchema.index({ created_at: -1 });
PurchaseSchema.index({ 'sync.status': 1 });

// Compiles a model on the secure (finance) connection when it is available
const compile = <T>(name: string, schema: Schema<T>): mongoose.Model<T> => {
  if (secureDbConnection) return (secureDbConnection.models[name] as mongoose.Model<T>) || secureDbConnection.model<T>(name, schema);
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
};

export const getVendorModel = () => compile<IVendor>('Vendor', VendorSchema);
export const getPurchaseModel = () => compile<IPurchase>('Purchase', PurchaseSchema);

// Purchase numbers like PO-2611-0001: year + month + serial, numbered per month
export const nextPurchaseNumber = async (date = new Date()): Promise<string> => {
  const ym = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `PO-${ym}-${String(await nextSequence(`purchase:${ym}`)).padStart(4, '0')}`;
};

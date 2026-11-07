import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';
import { AppliedChargeSchema, IAppliedCharge } from './Accounts.js';

export interface IInvoice extends Document {
  dId: string;
  invoice_number: string;
  client_dId?: string;
  client_id?: string;
  client_name: string;
  project_dId?: string;
  project_id?: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issue_date: string;
  due_date: string;
  items: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
  created_at: string;
}

export interface IPayment extends Document {
  dId: string;
  payment_number: string;
  external_ref?: string;
  invoice_dId?: string;
  invoice_id?: string;
  client_dId?: string;
  client_id?: string;
  client_name?: string;
  project_dId?: string;
  project_name?: string;
  payment_source_dId?: string;
  payment_source_name?: string;
  payer_name?: string;
  business_dId?: string;
  business_name?: string;
  payment_method_dId?: string;
  // Charges taken out of the received amount; net_amount = amount - charge_total
  charges?: IAppliedCharge[];
  charge_total?: number;
  net_amount?: number;
  // Order / bill total the payment settles; amount is what was actually received
  total_amount?: number;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_reference?: string;
  status: 'SUCCESS' | 'PENDING' | 'PARTIAL' | 'FAILED';
  notes?: string;
  attachments?: { name?: string; url: string }[];
  paid_at: string;
  created_at: string;
  updated_at?: string;
}

export interface IPaymentSource extends Document {
  dId: string;
  name: string;
  description?: string;
  // 'client' payments are tied to a client and one of their projects; 'none' takes a free-text payer
  link_type: 'client' | 'business' | 'none';
  status: 'Active' | 'Inactive';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface IBill extends Document {
  dId: string;
  bill_number: string;
  // Asset the bill belongs to (a client and one of their projects, or an internal project)
  client_dId?: string;
  client_name?: string;
  project_dId?: string;
  project_name?: string;
  title?: string;
  // Free-form bill type configured in Bill Types (category stays the legacy enum)
  bill_type?: string;
  payment_method?: string;
  payment_method_dId?: string;
  // Amount before charges; amount = base_amount + charge_total
  base_amount?: number;
  charges?: IAppliedCharge[];
  charge_total?: number;
  vendor_name: string;
  category: 'INFRASTRUCTURE' | 'SOFTWARE' | 'OFFICE' | 'MARKETING' | 'OTHER';
  amount: number;
  currency: string;
  paid_amount?: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  billing_date?: string;
  due_date?: string;
  // Breakdown shown inside the bill, e.g. deliveries / returns of a daily summary
  line_items?: { label: string; quantity?: number; amount: number }[];
  // Set by automated importers so the same period is never billed twice
  external_ref?: string;
  notes?: string;
  attachments?: { name?: string; url: string }[];
  created_at: string;
}

export interface IPayroll extends Document {
  dId: string;
  payroll_number: string;
  employee_dId?: string;
  employee_id?: string;
  employee_name: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_payable: number;
  status: 'PROCESSED' | 'PAID' | 'HELD';
  payment_date?: string;
  created_at: string;
}

const InvoiceSchema = new Schema<IInvoice>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  invoice_number: { type: String, required: true, unique: true },
  client_dId: { type: String, index: true },
  client_id: { type: String, index: true },
  client_name: { type: String, required: true },
  project_dId: { type: String },
  project_id: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'SENT' },
  issue_date: { type: String, default: () => new Date().toISOString() },
  due_date: { type: String, required: true },
  items: { type: [{ description: String, quantity: Number, unit_price: Number, total: Number }], default: [] },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'invoices', timestamps: false });

const PaymentSchema = new Schema<IPayment>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  payment_number: { type: String, required: true, unique: true },
  // Set by automated imports (e.g. surokkha-payments:2026-11-06) so a day is never recorded twice
  external_ref: { type: String, index: true, sparse: true },
  invoice_dId: { type: String, index: true },
  invoice_id: { type: String, index: true },
  client_dId: { type: String, index: true },
  client_id: { type: String, index: true },
  client_name: { type: String },
  project_dId: { type: String, index: true },
  project_name: { type: String },
  payment_source_dId: { type: String, index: true },
  payment_source_name: { type: String },
  payer_name: { type: String },
  business_dId: { type: String, index: true },
  business_name: { type: String },
  payment_method_dId: { type: String, index: true },
  charges: { type: [AppliedChargeSchema], default: [] },
  charge_total: { type: Number, default: 0 },
  net_amount: { type: Number },
  total_amount: { type: Number },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  // Free-form so it can hold any configured payment method name, not just the legacy codes
  payment_method: { type: String, default: 'BANK_TRANSFER' },
  transaction_reference: { type: String },
  status: { type: String, enum: ['SUCCESS', 'PENDING', 'PARTIAL', 'FAILED'], default: 'SUCCESS' },
  notes: { type: String },
  attachments: { type: [{ _id: false, name: String, url: String }], default: [] },
  paid_at: { type: String, default: () => new Date().toISOString() },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String },
}, { collection: 'payments', timestamps: false });

const PaymentSourceSchema = new Schema<IPaymentSource>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  link_type: { type: String, enum: ['client', 'business', 'none'], default: 'none' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  is_system: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'payment_sources', timestamps: false });

// Source names are unique regardless of case
PaymentSourceSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const BillSchema = new Schema<IBill>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  bill_number: { type: String, required: true, unique: true },
  client_dId: { type: String, index: true },
  client_name: { type: String },
  project_dId: { type: String, index: true },
  project_name: { type: String },
  title: { type: String },
  bill_type: { type: String },
  payment_method: { type: String },
  payment_method_dId: { type: String, index: true },
  base_amount: { type: Number },
  charges: { type: [AppliedChargeSchema], default: [] },
  charge_total: { type: Number, default: 0 },
  vendor_name: { type: String, required: true },
  category: { type: String, enum: ['INFRASTRUCTURE', 'SOFTWARE', 'OFFICE', 'MARKETING', 'OTHER'], default: 'INFRASTRUCTURE' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  paid_amount: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'], default: 'PENDING' },
  billing_date: { type: String, default: () => new Date().toISOString() },
  due_date: { type: String, default: '' },
  line_items: { type: [{ _id: false, label: String, quantity: Number, amount: Number }], default: [] },
  external_ref: { type: String, index: { unique: true, sparse: true } },
  notes: { type: String },
  attachments: { type: [{ _id: false, name: String, url: String }], default: [] },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'bills', timestamps: false });

const PayrollSchema = new Schema<IPayroll>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  payroll_number: { type: String, required: true, unique: true },
  employee_dId: { type: String, index: true },
  employee_id: { type: String, index: true },
  employee_name: { type: String, required: true },
  month: { type: String, required: true },
  base_salary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  net_payable: { type: Number, required: true },
  status: { type: String, enum: ['PROCESSED', 'PAID', 'HELD'], default: 'PROCESSED' },
  payment_date: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'payroll', timestamps: false });

// Retrieve or compile Invoice model
export const getInvoiceModel = (): mongoose.Model<IInvoice> => {
  if (secureDbConnection) return secureDbConnection.models.Invoice || secureDbConnection.model<IInvoice>('Invoice', InvoiceSchema);
  return mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
};

// Retrieve or compile Payment model
export const getPaymentModel = (): mongoose.Model<IPayment> => {
  if (secureDbConnection) return secureDbConnection.models.Payment || secureDbConnection.model<IPayment>('Payment', PaymentSchema);
  return mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
};

// Retrieve or compile PaymentSource model
export const getPaymentSourceModel = (): mongoose.Model<IPaymentSource> => {
  if (secureDbConnection) return secureDbConnection.models.PaymentSource || secureDbConnection.model<IPaymentSource>('PaymentSource', PaymentSourceSchema);
  return mongoose.models.PaymentSource || mongoose.model<IPaymentSource>('PaymentSource', PaymentSourceSchema);
};

// Retrieve or compile Bill model
export const getBillModel = (): mongoose.Model<IBill> => {
  if (secureDbConnection) return secureDbConnection.models.Bill || secureDbConnection.model<IBill>('Bill', BillSchema);
  return mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
};

// Retrieve or compile Payroll model
export const getPayrollModel = (): mongoose.Model<IPayroll> => {
  if (secureDbConnection) return secureDbConnection.models.Payroll || secureDbConnection.model<IPayroll>('Payroll', PayrollSchema);
  return mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
};


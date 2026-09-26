import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

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
  invoice_dId?: string;
  invoice_id?: string;
  client_dId?: string;
  client_id?: string;
  amount: number;
  currency: string;
  payment_method: 'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'STRIPE' | 'CASH';
  transaction_reference?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paid_at: string;
  created_at: string;
}

export interface IBill extends Document {
  dId: string;
  bill_number: string;
  vendor_name: string;
  category: 'INFRASTRUCTURE' | 'SOFTWARE' | 'OFFICE' | 'MARKETING' | 'OTHER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  due_date: string;
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
  invoice_dId: { type: String, index: true },
  invoice_id: { type: String, index: true },
  client_dId: { type: String, index: true },
  client_id: { type: String, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  payment_method: { type: String, enum: ['BKASH', 'NAGAD', 'BANK_TRANSFER', 'STRIPE', 'CASH'], default: 'BANK_TRANSFER' },
  transaction_reference: { type: String },
  status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
  paid_at: { type: String, default: () => new Date().toISOString() },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'payments', timestamps: false });

const BillSchema = new Schema<IBill>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  bill_number: { type: String, required: true, unique: true },
  vendor_name: { type: String, required: true },
  category: { type: String, enum: ['INFRASTRUCTURE', 'SOFTWARE', 'OFFICE', 'MARKETING', 'OTHER'], default: 'INFRASTRUCTURE' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
  due_date: { type: String, required: true },
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


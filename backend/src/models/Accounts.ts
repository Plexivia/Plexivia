import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

// A named charge, as a percent of the amount, a fixed amount, or both (e.g. bKash Cash Out 1.85%)
export interface IChargeRate {
  name: string;
  percent: number;
  fixed: number;
}

// A charge applied to a payment or bill. 'regular' comes from the payment method, 'extra' is added by hand
export interface IAppliedCharge extends IChargeRate {
  amount: number;
  kind: 'regular' | 'extra';
}

export const ChargeRateSchema = new Schema<IChargeRate>(
  {
    name: { type: String, required: true, trim: true },
    percent: { type: Number, default: 0, min: 0 },
    fixed: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

export const AppliedChargeSchema = new Schema<IAppliedCharge>(
  {
    name: { type: String, required: true, trim: true },
    percent: { type: Number, default: 0, min: 0 },
    fixed: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
    kind: { type: String, enum: ['regular', 'extra'], default: 'extra' },
  },
  { _id: false }
);

export interface IPaymentMethod extends Document {
  dId: string;
  name: string;
  category: 'mfs' | 'bank' | 'cash' | 'card' | 'gateway' | 'other';
  provider: string;
  account_number: string;
  account_name: string;
  account_type: string;
  branch_name: string;
  routing_number: string;
  // Regular charges offered for this method; one is picked when a payment or bill uses it
  fees: IChargeRate[];
  instructions: string;
  description: string;
  status: 'Active' | 'Inactive';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['mfs', 'bank', 'cash', 'card', 'gateway', 'other'], default: 'mfs' },
    provider: { type: String, trim: true, default: '' },
    account_number: { type: String, trim: true, default: '' },
    account_name: { type: String, trim: true, default: '' },
    account_type: { type: String, trim: true, default: 'Personal' },
    branch_name: { type: String, trim: true, default: '' },
    routing_number: { type: String, trim: true, default: '' },
    fees: { type: [ChargeRateSchema], default: [] },
    instructions: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    is_default: { type: Boolean, default: false },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'payment_methods', timestamps: false }
);
PaymentMethodSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// The owner's own businesses; a payment can come from one of them
export interface IBusiness extends Document {
  dId: string;
  name: string;
  legal_name: string;
  business_type: string;
  owner_name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  trade_license: string;
  tin: string;
  bin: string;
  logo_url: string;
  admin_dashboard_url: string;
  frontend_url: string;
  notes: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true, trim: true },
    legal_name: { type: String, trim: true, default: '' },
    business_type: { type: String, trim: true, default: '' },
    owner_name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    trade_license: { type: String, trim: true, default: '' },
    tin: { type: String, trim: true, default: '' },
    bin: { type: String, trim: true, default: '' },
    logo_url: { type: String, trim: true, default: '' },
    admin_dashboard_url: { type: String, trim: true, default: '' },
    frontend_url: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'businesses', timestamps: false }
);
BusinessSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Atomic sequence counters (e.g. invoice numbers per year)
interface ICounter extends Document {
  key: string;
  seq: number;
}
const CounterSchema = new Schema<ICounter>({ key: { type: String, required: true, unique: true }, seq: { type: Number, default: 0 } }, { collection: 'counters' });

const compile = <T>(name: string, schema: Schema<T>): mongoose.Model<T> => {
  if (secureDbConnection) return (secureDbConnection.models[name] as mongoose.Model<T>) || secureDbConnection.model<T>(name, schema);
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
};

export const getPaymentMethodModel = () => compile<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
export const getBusinessModel = () => compile<IBusiness>('Business', BusinessSchema);
const getCounterModel = () => compile<ICounter>('Counter', CounterSchema);

// Next value of a named counter, created at 1 on first use
export const nextSequence = async (key: string): Promise<number> => {
  const doc = await getCounterModel().findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return doc!.seq;
};

// Invoice numbers like PX-INV-2026-00001, numbered per year
export const nextInvoiceNumber = async (date = new Date()): Promise<string> => {
  const year = date.getFullYear();
  const seq = await nextSequence(`invoice:${year}`);
  return `PX-INV-${year}-${String(seq).padStart(5, '0')}`;
};

export const roundMoney = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

// Validates charges sent by the dashboard and recomputes each amount on the server
export const normalizeCharges = (input: any, baseAmount: number): IAppliedCharge[] =>
  (Array.isArray(input) ? input : [])
    .map((c: any) => {
      const percent = Math.max(0, Number(c?.percent) || 0);
      const fixed = Math.max(0, Number(c?.fixed) || 0);
      return {
        name: String(c?.name || '').trim(),
        percent,
        fixed,
        amount: roundMoney((Number(baseAmount) || 0) * (percent / 100) + fixed),
        kind: c?.kind === 'regular' ? ('regular' as const) : ('extra' as const),
      };
    })
    .filter((c) => c.name && (c.percent > 0 || c.fixed > 0));

// Default methods with their regular charges, created once when none exist yet
export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', category: 'cash', provider: 'Cash', fees: [], is_default: true },
  {
    name: 'bKash',
    category: 'mfs',
    provider: 'bKash',
    fees: [
      { name: 'Cash Out', percent: 1.85, fixed: 0 },
      { name: 'Send Money', percent: 0, fixed: 5 },
      { name: 'Payment', percent: 0, fixed: 0 },
    ],
  },
  {
    name: 'Nagad',
    category: 'mfs',
    provider: 'Nagad',
    fees: [
      { name: 'Cash Out', percent: 1.49, fixed: 0 },
      { name: 'Send Money', percent: 0, fixed: 5 },
    ],
  },
  {
    name: 'Bank Transfer',
    category: 'bank',
    provider: 'Bank',
    fees: [
      { name: 'BEFTN', percent: 0, fixed: 0 },
      { name: 'NPSB', percent: 0, fixed: 10 },
      { name: 'RTGS', percent: 0, fixed: 25 },
    ],
  },
  { name: 'Card', category: 'card', provider: 'POS / Gateway', fees: [{ name: 'Gateway Fee', percent: 2.5, fixed: 0 }] },
] as const;

export const seedDefaultPaymentMethods = async () => {
  const Model = getPaymentMethodModel();
  const existing = await Model.countDocuments({}).setOptions({ withInactive: true });
  if (existing > 0) return;
  const now = new Date().toISOString();
  await Model.insertMany(DEFAULT_PAYMENT_METHODS.map((m) => ({ ...m, fees: [...m.fees], status: 'Active', created_at: now, updated_at: now })));
};

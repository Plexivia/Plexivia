import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';
import { nextSequence } from './Accounts.js';

/**
 * Every document generated in Document Studio — invoice, money receipt, salary
 * slip, cash voucher — is stored here with its full form payload, so a saved
 * document can be listed, reopened and reprinted exactly as it was issued.
 *
 * `doc_number` is unique per `doc_type`, which is what makes the duplicate
 * check on the invoice / receipt / slip number fields reliable.
 */
export const STUDIO_DOC_TYPES = ['invoice', 'money-receipt', 'salary-slip', 'cash-voucher'] as const;
export type StudioDocType = (typeof STUDIO_DOC_TYPES)[number];

export interface IStudioDocument extends Document {
  dId: string;
  doc_type: StudioDocType;
  doc_number: string;
  client_id: string;
  client_name: string;
  project_id: string;
  payment_method: string;
  payment_method_id: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  payload: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const StudioDocumentSchema = new Schema<IStudioDocument>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    doc_type: { type: String, enum: STUDIO_DOC_TYPES as unknown as string[], required: true, index: true },
    doc_number: { type: String, required: true, trim: true },
    client_id: { type: String, trim: true, default: '' },
    client_name: { type: String, trim: true, default: '' },
    project_id: { type: String, trim: true, default: '' },
    payment_method: { type: String, trim: true, default: '' },
    payment_method_id: { type: String, trim: true, default: '' },
    amount: { type: Number, default: 0 },
    currency: { type: String, trim: true, default: 'BDT' },
    status: { type: String, trim: true, default: '' },
    issue_date: { type: String, trim: true, default: () => new Date().toISOString().slice(0, 10) },
    payload: { type: Schema.Types.Mixed, default: {} },
    created_by: { type: String, trim: true, default: '' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'studio_documents', timestamps: false, minimize: false }
);

// One number per document type; this is the constraint the duplicate check relies on
StudioDocumentSchema.index({ doc_type: 1, doc_number: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const compile = <T>(name: string, schema: Schema<T>): mongoose.Model<T> => {
  if (secureDbConnection) return (secureDbConnection.models[name] as mongoose.Model<T>) || secureDbConnection.model<T>(name, schema);
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
};

export const getStudioDocumentModel = () => compile<IStudioDocument>('StudioDocument', StudioDocumentSchema);

const NUMBER_PREFIX: Record<StudioDocType, string> = {
  invoice: 'PX-INV',
  'money-receipt': 'PX-MR',
  'salary-slip': 'PX-SLIP',
  'cash-voucher': 'PX-CV',
};

// Next free number for a type, e.g. PX-INV-2026-00001 — skips numbers already taken
export const nextStudioDocNumber = async (docType: StudioDocType, prefixOverride?: string, date = new Date()): Promise<string> => {
  const Model = getStudioDocumentModel();
  const prefix = (prefixOverride || NUMBER_PREFIX[docType] || 'PX-DOC').replace(/-+$/, '');
  const year = date.getFullYear();

  for (let attempt = 0; attempt < 25; attempt++) {
    const seq = await nextSequence(`studio:${docType}:${year}`);
    const candidate = `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
    const taken = await Model.findOne({ doc_type: docType, doc_number: candidate })
      .collation({ locale: 'en', strength: 2 })
      .setOptions({ withInactive: true });
    if (!taken) return candidate;
  }
  return `${prefix}-${year}-${Date.now().toString(36).toUpperCase()}`;
};

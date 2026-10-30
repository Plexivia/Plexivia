import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IClientProjectRef {
  dId: string;
  name: string;
}

export interface IClient extends Document {
  dId: string;
  name: string;
  email: string;
  phone: string[];
  business_name?: string;
  client_name?: string;
  client_key?: string;
  primary_domain?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  address?: string;
  services: string[];
  projects: IClientProjectRef[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

const ClientProjectRefSchema = new Schema<IClientProjectRef>(
  {
    dId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ClientSchema = new Schema<IClient>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0 && v.every((p) => typeof p === 'string' && p.trim().length > 0),
        message: 'At least one valid phone number is required.',
      },
    },
    business_name: { type: String, trim: true, default: '' },
    client_name: { type: String, trim: true, default: '' },
    client_key: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    primary_domain: { type: String, trim: true, default: '' },
    contact_email: { type: String, trim: true, lowercase: true, default: '' },
    contact_phone: { type: String, trim: true, default: '' },
    contact_whatsapp: { type: String, trim: true, default: '' },
    address: { type: String, default: '' },
    services: { type: [String], default: [] },
    projects: { type: [ClientProjectRefSchema], default: [] },
    status: { type: String, enum: ['ACTIVE', 'PENDING', 'SUSPENDED'], default: 'ACTIVE' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'clients', timestamps: false }
);

// Retrieve or compile Client model attached to plexiAuth secure database
export const getClientModel = (): mongoose.Model<IClient> => {
  if (secureDbConnection) {
    return secureDbConnection.models.Client || secureDbConnection.model<IClient>('Client', ClientSchema);
  }
  return mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
};

import mongoose, { Schema, Document } from 'mongoose';
import { secureDb } from '../config/database.js';

export interface IAdmin extends Document {
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'SUPPORT_LEAD' | 'DEV';
  phone?: string;
  department?: string;
  designation?: string;
  avatar?: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  permissions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['OWNER', 'ADMIN', 'ACCOUNTANT', 'SUPPORT_LEAD', 'DEV'], default: 'ADMIN' },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    avatar: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    two_factor_enabled: { type: Boolean, default: true },
    two_factor_secret: { type: String, default: '' },
    permissions: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, collection: 'admins' }
);

// Retrieve Admin model on secureDb
export const getAdminModel = (): mongoose.Model<IAdmin> => {
  if (secureDb) return secureDb.models.Admin || secureDb.model<IAdmin>('Admin', AdminSchema);
  return mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
};

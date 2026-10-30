import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IAdmin extends Document {
  dId: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'OWNER' | 'ADMIN' | 'SUPER_ADMIN' | 'PM' | 'DEV' | 'DESIGNER' | 'SRE' | 'ACCOUNTANT' | 'SUPPORT_LEAD';
  phone?: string;
  department?: string;
  designation?: string;
  address?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  hourly_rate?: number;
  avatar?: string;
  is_active: boolean;
  receive_email_notifications: boolean;
  last_login_at?: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  two_factor_pending_secret?: string;
  permissions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String },
    full_name: { type: String, required: true },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'PM', 'DEV', 'DESIGNER', 'SRE', 'ACCOUNTANT', 'SUPPORT_LEAD'],
      default: 'ADMIN',
    },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    hourly_rate: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    receive_email_notifications: { type: Boolean, default: false },
    last_login_at: { type: String, default: '' },
    two_factor_enabled: { type: Boolean, default: true },
    two_factor_secret: { type: String, default: '' },
    two_factor_pending_secret: { type: String },
    permissions: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    collection: 'admins',
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password_hash;
        delete ret.two_factor_secret;
        delete ret.two_factor_pending_secret;
        return ret;
      },
    },
  }
);

// Retrieve or compile Admin model attached to secure database connection
export const getAdminModel = (): mongoose.Model<IAdmin> => {
  if (secureDbConnection) {
    return secureDbConnection.models.Admin || secureDbConnection.model<IAdmin>('Admin', AdminSchema);
  }
  return mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
};

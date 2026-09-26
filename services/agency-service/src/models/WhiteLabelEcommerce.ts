import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IOwnerContact {
  name: string;
  phone: string;
  email: string;
  notification: boolean;
  isPrimary?: boolean;
}

export interface IBackendURL {
  storefrontURL: string;
  serviceURL: string;
}

export interface IDomainInfo {
  storeURL: string;
  adminURL: string;
  backendURL: IBackendURL;
  databaseURL: string;
}

export interface IWhiteLabelEcommerce extends Document {
  dId: string;
  clientDId: string;
  projectTypeDId: string;
  name: string;
  clientKey: string;
  domainInfo: IDomainInfo;
  owners: IOwnerContact[];
  policies: Record<string, any>;
  features: Record<string, any>;
  stockManagement: Record<string, any>;
  reports: Record<string, any>;
  cloudFlareAnalytics?: Record<string, any>;
  googleAnalytics?: Record<string, any>;
  assetsConfig?: Record<string, any>;
  allowedMenus: string[];
  theme: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  status: 'ACTIVE' | 'DEVELOPMENT' | 'MAINTENANCE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

const BackendURLSchema = new Schema<IBackendURL>(
  {
    storefrontURL: { type: String, required: true, trim: true },
    serviceURL: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DomainInfoSchema = new Schema<IDomainInfo>(
  {
    storeURL: { type: String, required: true, trim: true },
    adminURL: { type: String, required: true, trim: true },
    backendURL: { type: BackendURLSchema, required: true },
    databaseURL: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OwnerContactSchema = new Schema<IOwnerContact>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    notification: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const WhiteLabelEcommerceSchema = new Schema<IWhiteLabelEcommerce>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    clientDId: { type: String, required: true, index: true, trim: true },
    projectTypeDId: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    clientKey: { type: String, required: true, index: true, lowercase: true, trim: true },
    domainInfo: { type: DomainInfoSchema, required: true },
    owners: { type: [OwnerContactSchema], default: [] },
    policies: { type: Schema.Types.Mixed, default: {} },
    features: { type: Schema.Types.Mixed, default: {} },
    stockManagement: { type: Schema.Types.Mixed, default: {} },
    reports: { type: Schema.Types.Mixed, default: {} },
    cloudFlareAnalytics: { type: Schema.Types.Mixed, default: () => ({}) },
    googleAnalytics: { type: Schema.Types.Mixed, default: () => ({}) },
    assetsConfig: { type: Schema.Types.Mixed, default: () => ({ sections: [] }) },
    allowedMenus: { type: [String], default: ['overview', 'orders', 'products', 'settings'] },
    theme: {
      light: { type: Schema.Types.Mixed, required: true },
      dark: { type: Schema.Types.Mixed, required: true },
    },
    status: { type: String, enum: ['ACTIVE', 'DEVELOPMENT', 'MAINTENANCE', 'SUSPENDED'], default: 'ACTIVE' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'whitelabel_ecommerce_projects', timestamps: false }
);

// Retrieve or compile WhiteLabelEcommerce model
export const getWhiteLabelEcommerceModel = (): mongoose.Model<IWhiteLabelEcommerce> => {
  if (operationsDbConnection) {
    return operationsDbConnection.models.WhiteLabelEcommerce || operationsDbConnection.model<IWhiteLabelEcommerce>('WhiteLabelEcommerce', WhiteLabelEcommerceSchema);
  }
  return mongoose.models.WhiteLabelEcommerce || mongoose.model<IWhiteLabelEcommerce>('WhiteLabelEcommerce', WhiteLabelEcommerceSchema);
};

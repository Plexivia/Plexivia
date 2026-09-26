import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IClientVault extends Document {
  dId: string;
  client_dId?: string;
  client_id?: string;
  client_key: string;
  business_name: string;
  vps_ip: string;
  vps_ssh_port: number;
  vps_ssh_user: string;
  vps_ssh_password_encrypted?: string;
  vps_ssh_key_path?: string;
  db_connection_uri: string;
  cloudflare_zone_id?: string;
  cloudflare_r2_bucket?: string;
  cloudflare_r2_access_key?: string;
  cloudflare_r2_secret_key?: string;
  env_secrets?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const ClientVaultSchema = new Schema<IClientVault>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    client_dId: { type: String, index: true },
    client_id: { type: String, index: true },
    client_key: { type: String, required: true, unique: true, index: true },
    business_name: { type: String, required: true },
    vps_ip: { type: String, required: true },
    vps_ssh_port: { type: Number, default: 22 },
    vps_ssh_user: { type: String, default: 'root' },
    vps_ssh_password_encrypted: { type: String },
    vps_ssh_key_path: { type: String },
    db_connection_uri: { type: String, required: true },
    cloudflare_zone_id: { type: String },
    cloudflare_r2_bucket: { type: String },
    cloudflare_r2_access_key: { type: String },
    cloudflare_r2_secret_key: { type: String },
    env_secrets: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    collection: 'client_vault',
  }
);

// Retrieve or compile ClientVault model attached to secure database connection
export const getClientVaultModel = (): mongoose.Model<IClientVault> => {
  if (secureDbConnection) {
    return secureDbConnection.models.ClientVault || secureDbConnection.model<IClientVault>('ClientVault', ClientVaultSchema);
  }
  return mongoose.models.ClientVault || mongoose.model<IClientVault>('ClientVault', ClientVaultSchema);
};

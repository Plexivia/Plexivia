import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';

/**
 * Root console state for the VPS this application runs on.
 *
 * Three collections, all on the secure connection because every one of them
 * holds or guards root credentials:
 *
 *  - `vps_servers`      the single SSH target (`key: 'primary'`), secrets encrypted at rest
 *  - `vps_console_access`  per-admin authenticator enrolment, separate from the login 2FA
 *  - `vps_command_logs`    an audit trail of every command run through the console
 *
 * Nothing here is ever returned raw to the dashboard: `toJSON` strips the
 * encrypted fields, and the controller only reports whether each one is set.
 */

// ---------------------------------------------------------------------------
// SSH target
// ---------------------------------------------------------------------------

export type VpsAuthMethod = 'PASSWORD' | 'PRIVATE_KEY';

export interface IVpsServer extends Document {
  key: string;
  label: string;
  host: string;
  port: number;
  username: string;
  auth_method: VpsAuthMethod;
  /** AES-256-GCM ciphertext — never leaves the backend */
  password_enc?: string;
  private_key_enc?: string;
  passphrase_enc?: string;
  /** Absolute path of the Plexivia checkout on the VPS (`make deploy` runs here) */
  app_path: string;
  /** Parent directory of per-client checkouts, e.g. /opt/clients */
  clients_root: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

const VpsServerSchema = new Schema<IVpsServer>(
  {
    key: { type: String, required: true, unique: true, default: 'primary' },
    label: { type: String, default: 'Plexivia VPS' },
    host: { type: String, required: true, default: '127.0.0.1' },
    port: { type: Number, required: true, default: 22 },
    username: { type: String, required: true, default: 'root' },
    auth_method: { type: String, enum: ['PASSWORD', 'PRIVATE_KEY'], default: 'PASSWORD' },
    password_enc: { type: String, default: '' },
    private_key_enc: { type: String, default: '' },
    passphrase_enc: { type: String, default: '' },
    app_path: { type: String, default: '/opt/plexivia' },
    clients_root: { type: String, default: '/opt/clients' },
    updated_by: { type: String, default: '' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    collection: 'vps_servers',
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password_enc;
        delete ret.private_key_enc;
        delete ret.passphrase_enc;
        return ret;
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Per-admin console authenticator (separate from the dashboard login 2FA)
// ---------------------------------------------------------------------------

export interface IVpsConsoleAccess extends Document {
  admin_id: string;
  admin_email: string;
  /** Confirmed TOTP secret, encrypted. Empty until the first code is accepted. */
  totp_secret_enc: string;
  /** Secret issued but not yet proven by a code, encrypted. */
  pending_secret_enc: string;
  enrolled_at: string;
  last_unlock_at: string;
  unlock_count: number;
  created_at: string;
  updated_at: string;
}

const VpsConsoleAccessSchema = new Schema<IVpsConsoleAccess>(
  {
    admin_id: { type: String, required: true, unique: true, index: true },
    admin_email: { type: String, default: '' },
    totp_secret_enc: { type: String, default: '' },
    pending_secret_enc: { type: String, default: '' },
    enrolled_at: { type: String, default: '' },
    last_unlock_at: { type: String, default: '' },
    unlock_count: { type: Number, default: 0 },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    collection: 'vps_console_access',
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.totp_secret_enc;
        delete ret.pending_secret_enc;
        return ret;
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

export interface IVpsCommandLog extends Document {
  admin_id: string;
  admin_email: string;
  /** Target directory label, e.g. "plexivia" or a client folder name */
  target: string;
  target_path: string;
  command_id: string;
  command: string;
  kind: 'COMMAND' | 'SHELL';
  exit_code: number | null;
  duration_ms: number;
  output_tail: string;
  error: string;
  ip: string;
  created_at: string;
}

const VpsCommandLogSchema = new Schema<IVpsCommandLog>(
  {
    admin_id: { type: String, required: true, index: true },
    admin_email: { type: String, default: '' },
    target: { type: String, default: '' },
    target_path: { type: String, default: '' },
    command_id: { type: String, default: '' },
    command: { type: String, default: '' },
    kind: { type: String, enum: ['COMMAND', 'SHELL'], default: 'COMMAND' },
    exit_code: { type: Number, default: null },
    duration_ms: { type: Number, default: 0 },
    output_tail: { type: String, default: '' },
    error: { type: String, default: '' },
    ip: { type: String, default: '' },
    created_at: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { timestamps: false, collection: 'vps_command_logs' }
);

// ---------------------------------------------------------------------------
// Lazily compiled models on the secure connection
// ---------------------------------------------------------------------------

const model = <T>(name: string, schema: Schema<any>): mongoose.Model<T> => {
  if (secureDbConnection) {
    return (secureDbConnection.models[name] as mongoose.Model<T>) || secureDbConnection.model<T>(name, schema as any);
  }
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema as any);
};

export const getVpsServerModel = () => model<IVpsServer>('VpsServer', VpsServerSchema);
export const getVpsConsoleAccessModel = () => model<IVpsConsoleAccess>('VpsConsoleAccess', VpsConsoleAccessSchema);
export const getVpsCommandLogModel = () => model<IVpsCommandLog>('VpsCommandLog', VpsCommandLogSchema);

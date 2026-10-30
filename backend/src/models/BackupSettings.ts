import mongoose, { Schema, Document } from 'mongoose';
import { secureDbConnection } from '../config/database.js';

export interface BackupSettingsFields {
  key: string;
  is_enabled: boolean;
  account_id: string;
  access_key_id: string;
  secret_access_key: string;
  api_token: string;
  bucket_name: string;
  backup_enabled: boolean;
  backup_cron: string;
  backup_timezone: string;
  keep_daily_days: number;
  keep_weekly_weeks: number;
  last_tested_at?: string;
  last_test_status: string;
  last_test_message: string;
  last_backup_at?: string;
  last_backup_status: string;
  last_backup_message: string;
  last_backup_size: string;
  updated_by?: string;
  updated_at: string;
}

export interface IBackupSettings extends Document, BackupSettingsFields {}

const BackupSettingsSchema = new Schema<IBackupSettings>(
  {
    key: { type: String, default: 'default', unique: true },
    is_enabled: { type: Boolean, default: false },
    account_id: { type: String, default: '' },
    access_key_id: { type: String, default: '' },
    secret_access_key: { type: String, default: '' },
    api_token: { type: String, default: '' },
    bucket_name: { type: String, default: '' },
    backup_enabled: { type: Boolean, default: true },
    backup_cron: { type: String, default: '0 3 * * *' },
    backup_timezone: { type: String, default: 'Asia/Dhaka' },
    keep_daily_days: { type: Number, default: 7 },
    keep_weekly_weeks: { type: Number, default: 5 },
    last_tested_at: { type: String, default: '' },
    last_test_status: { type: String, default: 'untested' },
    last_test_message: { type: String, default: '' },
    last_backup_at: { type: String, default: '' },
    last_backup_status: { type: String, default: 'never' },
    last_backup_message: { type: String, default: '' },
    last_backup_size: { type: String, default: '' },
    updated_by: { type: String, default: '' },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false, collection: 'backup_settings' }
);

// Retrieve or compile the R2 backup settings model on the secure database connection
export const getBackupSettingsModel = (): mongoose.Model<IBackupSettings> => {
  if (secureDbConnection) {
    return secureDbConnection.models.BackupSettings || secureDbConnection.model<IBackupSettings>('BackupSettings', BackupSettingsSchema);
  }
  return mongoose.models.BackupSettings || mongoose.model<IBackupSettings>('BackupSettings', BackupSettingsSchema);
};

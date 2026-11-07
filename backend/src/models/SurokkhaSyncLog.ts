import mongoose, { Schema } from 'mongoose';
import { secureDbConnection } from '../config/database.js';

/**
 * One line per Surokkha import attempt (nightly job or a manual "Sync now"),
 * so the dashboard can show which days came in, which had nothing, and which failed.
 */
export interface ISurokkhaSyncLog {
  day: string; // YYYY-MM-DD (Bangladesh)
  kind: 'payments' | 'bills';
  status: 'imported' | 'already imported' | 'no payments' | 'no bills' | 'failed';
  total?: number;
  count?: number;
  error?: string;
  trigger: string; // SCHEDULER_CRON | MANUAL:<user>
  at: string;
}

const SurokkhaSyncLogSchema = new Schema<ISurokkhaSyncLog>(
  {
    day: { type: String, required: true, index: true },
    kind: { type: String, enum: ['payments', 'bills'], required: true },
    status: { type: String, required: true },
    total: { type: Number },
    count: { type: Number },
    error: { type: String },
    trigger: { type: String, default: 'SCHEDULER_CRON' },
    at: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { collection: 'surokkha_sync_logs', versionKey: false }
);

export const getSurokkhaSyncLogModel = () => {
  const conn: any = secureDbConnection || mongoose;
  return (conn.models.SurokkhaSyncLog as mongoose.Model<ISurokkhaSyncLog>) || conn.model('SurokkhaSyncLog', SurokkhaSyncLogSchema);
};

// Never lets logging break an import
export const logSurokkhaSync = async (entry: Omit<ISurokkhaSyncLog, 'at'>) => {
  try {
    await getSurokkhaSyncLogModel().create({ ...entry, at: new Date().toISOString() });
  } catch {
    /* ignore */
  }
};

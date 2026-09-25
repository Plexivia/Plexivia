import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';

export interface ISupportTicket extends Document {
  id: string;
  ticket_number: string;
  client_id: string;
  client_name: string;
  subject: string;
  description: string;
  category: 'VPS' | 'DEPLOYMENT' | 'BUG' | 'BILLING' | 'FEATURE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface IProjectDoc extends Document {
  id: string;
  client_id: string;
  project_id?: string;
  title: string;
  category: 'ARCHITECTURE' | 'BRS' | 'CREDENTIALS' | 'API' | 'DEPLOYMENT' | 'NOTE';
  storage_url?: string;
  doc_metadata?: Record<string, any>;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface ITelemetryLog extends Document {
  client_key: string;
  service_name: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  id: { type: String, required: true, unique: true, index: true },
  ticket_number: { type: String, required: true, unique: true },
  client_id: { type: String, required: true, index: true },
  client_name: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['VPS', 'DEPLOYMENT', 'BUG', 'BILLING', 'FEATURE'], default: 'DEPLOYMENT' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  assigned_to: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'support_tickets', timestamps: false });

const ProjectDocSchema = new Schema<IProjectDoc>({
  id: { type: String, required: true, unique: true, index: true },
  client_id: { type: String, required: true, index: true },
  project_id: { type: String },
  title: { type: String, required: true },
  category: { type: String, enum: ['ARCHITECTURE', 'BRS', 'CREDENTIALS', 'API', 'DEPLOYMENT', 'NOTE'], default: 'NOTE' },
  storage_url: { type: String },
  doc_metadata: { type: Schema.Types.Mixed, default: {} },
  version: { type: String, default: '1.0' },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'project_docs', timestamps: false });

const TelemetryLogSchema = new Schema<ITelemetryLog>({
  client_key: { type: String, required: true, index: true },
  service_name: { type: String, required: true },
  level: { type: String, enum: ['info', 'warn', 'error', 'fatal'], default: 'info' },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: String, default: () => new Date().toISOString() },
}, { collection: 'telemetry_logs', timestamps: false });

// Retrieve or compile SupportTicket model
export const getSupportTicketModel = (): mongoose.Model<ISupportTicket> => {
  if (operationsDbConnection) return operationsDbConnection.models.SupportTicket || operationsDbConnection.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
  return mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
};

// Retrieve or compile ProjectDoc model
export const getProjectDocModel = (): mongoose.Model<IProjectDoc> => {
  if (operationsDbConnection) return operationsDbConnection.models.ProjectDoc || operationsDbConnection.model<IProjectDoc>('ProjectDoc', ProjectDocSchema);
  return mongoose.models.ProjectDoc || mongoose.model<IProjectDoc>('ProjectDoc', ProjectDocSchema);
};

// Retrieve or compile TelemetryLog model
export const getTelemetryLogModel = (): mongoose.Model<ITelemetryLog> => {
  if (operationsDbConnection) return operationsDbConnection.models.TelemetryLog || operationsDbConnection.model<ITelemetryLog>('TelemetryLog', TelemetryLogSchema);
  return mongoose.models.TelemetryLog || mongoose.model<ITelemetryLog>('TelemetryLog', TelemetryLogSchema);
};

import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface ITicketAttachment {
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface ITicketMessage {
  dId: string;
  author_type: 'CLIENT' | 'ADMIN';
  author_name: string;
  author_admin_dId?: string;
  body: string;
  // Internal notes are written by admins and never sent to, or visible to, the client
  is_internal_note: boolean;
  attachments: ITicketAttachment[];
  created_at: string;
}

export interface ISupportTicket extends Document {
  dId: string;
  ticket_number: string;
  client_dId?: string;
  client_id?: string;
  client_name: string;
  project_dId?: string;
  project_name?: string;
  subject: string;
  description: string;
  category: 'VPS' | 'DEPLOYMENT' | 'BUG' | 'BILLING' | 'FEATURE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  assigned_to_name?: string;
  messages: ITicketMessage[];
  // First-response SLA deadline, set from priority at creation
  sla_due_at?: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IProjectDoc extends Document {
  dId: string;
  client_dId?: string;
  client_id?: string;
  project_dId?: string;
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
  dId: string;
  client_key: string;
  service_name: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const TicketAttachmentSchema = new Schema<ITicketAttachment>(
  { name: String, url: String, size: Number, mimeType: String },
  { _id: false }
);

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    dId: { type: String, required: true, default: generateDId },
    author_type: { type: String, enum: ['CLIENT', 'ADMIN'], required: true },
    author_name: { type: String, required: true },
    author_admin_dId: { type: String },
    body: { type: String, default: '' },
    is_internal_note: { type: Boolean, default: false },
    attachments: { type: [TicketAttachmentSchema], default: [] },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  ticket_number: { type: String, required: true, unique: true },
  client_dId: { type: String, index: true },
  client_id: { type: String, index: true },
  client_name: { type: String, required: true },
  project_dId: { type: String, index: true },
  project_name: { type: String },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['VPS', 'DEPLOYMENT', 'BUG', 'BILLING', 'FEATURE'], default: 'DEPLOYMENT' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
  assigned_to: { type: String, index: true },
  assigned_to_name: { type: String },
  messages: { type: [TicketMessageSchema], default: [] },
  sla_due_at: { type: String },
  first_response_at: { type: String },
  resolved_at: { type: String },
  closed_at: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'support_tickets', timestamps: false });

const ProjectDocSchema = new Schema<IProjectDoc>({
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
  client_dId: { type: String, index: true },
  client_id: { type: String, index: true },
  project_dId: { type: String },
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
  dId: { type: String, required: true, unique: true, index: true, default: generateDId },
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


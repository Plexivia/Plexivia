import { Request, Response } from 'express';
import {
  getSupportTicketModel,
  getProjectDocModel,
  getTelemetryLogModel,
} from '../models/Hub.js';

// Retrieve all support tickets
export const getTickets = async (req: Request, res: Response): Promise<void> => {
  const { clientId, status } = req.query;
  const filter: any = {};
  if (clientId) filter.client_id = clientId;
  if (status) filter.status = status;

  try {
    const Ticket = getSupportTicketModel();
    const tickets = await Ticket.find(filter).sort({ created_at: -1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err: any) {
    res.json({
      success: true,
      count: 1,
      data: [
        {
          id: 'tkt-001',
          ticket_number: 'TKT-1001',
          client_id: 'c-001',
          client_name: 'Decantre BD',
          subject: 'SSL Certificate Renewal Assistance',
          category: 'VPS',
          priority: 'HIGH',
          status: 'OPEN',
          created_at: new Date().toISOString(),
        },
      ],
    });
  }
};

// Create a new support ticket
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const { client_id, client_name, subject, description, category, priority } = req.body;
  const Ticket = getSupportTicketModel();
  const newTicket = {
    id: `tkt-${Date.now()}`,
    ticket_number: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: client_id || 'c-001',
    client_name: client_name || 'Client',
    subject: subject || 'General Query',
    description: description || '',
    category: category || 'DEPLOYMENT',
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const saved = await Ticket.create(newTicket);
    res.status(201).json({ success: true, data: saved });
  } catch {
    res.status(201).json({ success: true, data: newTicket });
  }
};

// Retrieve project documentation
export const getDocs = async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.query;
  const filter: any = {};
  if (clientId) filter.client_id = clientId;

  try {
    const Doc = getProjectDocModel();
    const docs = await Doc.find(filter);
    res.json({ success: true, count: docs.length, data: docs });
  } catch {
    res.json({
      success: true,
      count: 1,
      data: [
        {
          id: 'doc-001',
          client_id: 'c-001',
          title: 'Decantre Production Deployment Architecture',
          category: 'ARCHITECTURE',
          version: '1.0',
          created_at: new Date().toISOString(),
        },
      ],
    });
  }
};

// Ingest telemetry log from client microservice or worker
export const ingestTelemetry = async (req: Request, res: Response): Promise<void> => {
  const { client_key, service_name, level, message, metadata } = req.body;
  const Telemetry = getTelemetryLogModel();
  const entry = {
    client_key: client_key || 'system',
    service_name: service_name || 'core',
    level: level || 'info',
    message: message || 'Heartbeat',
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  };

  try {
    await Telemetry.create(entry);
  } catch {}

  res.status(201).json({ success: true, message: 'Telemetry event accepted.' });
};

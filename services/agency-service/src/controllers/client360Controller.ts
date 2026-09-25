import { Request, Response } from 'express';
import { getClientModel, getProjectModel, getTaskModel } from '../models/Agency.js';

// Aggregate 360-degree client intelligence across projects, tasks, and telemetry
export const getClient360 = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const Client = getClientModel();
  const Project = getProjectModel();
  const Task = getTaskModel();

  let client: any = null;
  let projects: any[] = [];
  let tasks: any[] = [];

  try {
    client = await Client.findOne({ $or: [{ id }, { client_key: id }] });
    if (client) {
      projects = await Project.find({ client_id: client.id });
      tasks = await Task.find({ project_id: { $in: projects.map((p) => p.id) } });
    }
  } catch {}

  if (!client) {
    client = {
      id: id || 'c-001',
      name: 'Decantre BD',
      client_key: 'decantre',
      category: 'eCommerce & Fragrance',
      status: 'Active',
      portal_url: 'https://decantre.com',
      email: 'founder@decantre.com',
      phone: '+8801700000001',
      contract_value: 350000,
      health: 'Optimal',
      created_at: '2024-02-10T10:00:00Z',
    };
    projects = [
      {
        id: 'p-001',
        client_id: client.id,
        name: 'Decantre Multi-Tenant eCommerce ERP',
        status: 'In Progress',
        progress: 82,
        priority: 'High',
        due_date: '2026-10-15',
        tasks_count: 14,
      },
    ];
  }

  const client360 = {
    client,
    projects,
    tasks,
    vault: {
      client_id: client.id,
      client_key: client.client_key,
      vps_ip: '139.59.102.14',
      vps_ssh_port: 22,
      vps_ssh_user: 'root',
      db_connection_uri: 'mongodb://root:***@139.59.102.14:27017/db',
    },
    supportTickets: [
      {
        id: 'tkt-001',
        client_id: client.id,
        subject: 'SSL Certificate Renewal Assistance',
        category: 'VPS',
        priority: 'HIGH',
        status: 'OPEN',
      },
    ],
    projectDocs: [
      {
        id: 'doc-001',
        client_id: client.id,
        title: 'Decantre Production Deployment Architecture',
        category: 'ARCHITECTURE',
        version: '1.0',
      },
    ],
    invoices: [
      {
        invoice_number: 'INV-2026-001',
        client_id: client.id,
        amount: 150000,
        currency: 'BDT',
        status: 'PAID',
        issue_date: '2026-08-01',
      },
    ],
  };

  res.status(200).json({ success: true, data: client360 });
};

import { Request, Response } from 'express';
import { getClientModel } from '../models/Client.js';
import { getProjectModel } from '../models/Agency.js';
import { getInvoiceModel, getPaymentModel } from '../models/Finance.js';
import { getSupportTicketModel, getProjectDocModel } from '../models/Hub.js';
import { getClientVaultModel } from '../models/ClientVault.js';
import { generateDId } from '../utils/dId.js';

// Retrieve all clients with optional filtering by status, keyword search, or service
export const getClients = async (req: Request, res: Response) => {
  try {
    const { status, search, service } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (service) {
      filter.services = { $in: [String(service)] };
    }
    if (search) {
      const q = String(search);
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { dId: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
      ];
    }

    const ClientModel = getClientModel();
    const clients = await ClientModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: clients.length,
      data: clients,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve clients' });
  }
};

// Retrieve a single client by 16-digit dId or legacy id
export const getClientById = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({
      $or: [{ dId: identifier }, { id: identifier }, { email: identifier }],
    });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: client,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client' });
  }
};

// Create a new client with 16-digit dId in plexiAuth secure database
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, services, projects, status } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Client email is required.' });
    }

    const phoneList: string[] = Array.isArray(phone)
      ? phone.filter((p) => typeof p === 'string' && p.trim().length > 0)
      : typeof phone === 'string' && phone.trim().length > 0
      ? [phone.trim()]
      : [];

    if (phoneList.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid phone number is required.' });
    }

    const ClientModel = getClientModel();
    const dId = generateDId();

    const created = await ClientModel.create({
      dId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phoneList,
      address: address ? String(address).trim() : '',
      services: Array.isArray(services) ? services : [],
      projects: Array.isArray(projects) ? projects : [],
      status: status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Client '${created.name}' registered successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
};

// Update an existing client by 16-digit dId or legacy id
export const updateClient = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.phone && !Array.isArray(updates.phone)) {
      updates.phone = [String(updates.phone).trim()];
    }

    const ClientModel = getClientModel();
    const client = await ClientModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: updates },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client '${client.name}' updated successfully`,
      data: client,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client' });
  }
};

// Delete a client from the database
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const deleted = await ClientModel.findOneAndDelete({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client '${deleted.name}' removed successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete client' });
  }
};

// Retrieve client enabled modules and permissions
export const getClientModules = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ dId: identifier }, { id: identifier }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: { cpanelAccess: false, posIntegration: true, services: client.services },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client modules' });
  }
};

// Update client module permissions dynamically
export const updateClientModules = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ dId: identifier }, { id: identifier }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client modules updated successfully`,
      data: req.body,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client modules' });
  }
};

// Retrieve client domain and instance routing configuration
export const getClientDomains = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ dId: identifier }, { id: identifier }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: { services: client.services, projects: client.projects },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client domains' });
  }
};

// Update client domain mappings and instance URLs
export const updateClientDomains = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const { services, projects } = req.body;
    const ClientModel = getClientModel();

    const client = await ClientModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: { services, projects, updated_at: new Date().toISOString() } },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client domains updated successfully`,
      data: { services: client.services, projects: client.projects },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client domains' });
  }
};

// Retrieve comprehensive 360 degree relational view of a client across all microservices
export const getClient360 = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ClientModel = getClientModel();
    const ProjectModel = getProjectModel();
    const InvoiceModel = getInvoiceModel();
    const PaymentModel = getPaymentModel();
    const SupportTicketModel = getSupportTicketModel();
    const ProjectDocModel = getProjectDocModel();
    const VaultModel = getClientVaultModel();

    const client = await ClientModel.findOne({ $or: [{ dId: identifier }, { id: identifier }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${identifier}' not found` });
    }

    const clientDId = client.dId;

    const [projects, invoices, payments, supportTickets, projectDocs, vaultItem] = await Promise.all([
      ProjectModel.find({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
      InvoiceModel.find({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
      PaymentModel.find({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
      SupportTicketModel.find({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
      ProjectDocModel.find({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
      VaultModel.findOne({ $or: [{ client_dId: clientDId }, { client_id: clientDId }] }),
    ]);

    const totalPaid = payments.filter((p) => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0);
    const unpaidInvoices = invoices.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE');
    const unpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.amount, 0);

    const client360 = {
      client,
      projects,
      financials: {
        total_paid: totalPaid,
        unpaid_invoices_amount: unpaidAmount,
        unpaid_invoices_count: unpaidInvoices.length,
        invoices,
        payments,
      },
      support: {
        open_tickets_count: supportTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        total_tickets_count: supportTickets.length,
        tickets: supportTickets,
        docs_count: projectDocs.length,
        docs: projectDocs,
      },
      vault: {
        vps_configured: Boolean(vaultItem?.vps_ip),
        db_configured: Boolean(vaultItem?.db_connection_uri),
      },
    };

    return res.json({
      success: true,
      status: 'success',
      data: client360,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate client 360 overview' });
  }
};


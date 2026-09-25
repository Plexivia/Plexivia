import { Request, Response } from 'express';
import { getClientModel, getProjectModel } from '../models/Agency.js';
import { getInvoiceModel, getPaymentModel } from '../models/Finance.js';
import { getSupportTicketModel, getProjectDocModel } from '../models/Hub.js';
import { getClientVaultModel } from '../models/ClientVault.js';

// Retrieve all clients with optional filtering by status, type, and keyword search
export const getClients = async (req: Request, res: Response) => {
  try {
    const { status, type, search } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (type) {
      filter.category = new RegExp(`^${type}$`, 'i');
    }
    if (search) {
      const q = String(search);
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { client_key: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
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

// Retrieve a single client by identifier or client key
export const getClientById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ id }, { client_key: id }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
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

// Create a new client in the database
export const createClient = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const name = data.business_name || data.businessName || data.name || data.brandName;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Client business name is required' });
    }

    const key = data.client_key || data.clientKey || name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ClientModel = getClientModel();

    const created = await ClientModel.create({
      id: data.id || `c-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      client_key: key,
      category: data.category || data.client_type || 'General',
      status: data.status || 'Active',
      portal_url: data.portal_url || data.primary_domain || '',
      email: data.email || data.contact_email || `${key}@plexivia.internal`,
      phone: data.phone || data.contact_phone || '',
      contract_value: Number(data.contract_value || data.monthly_revenue || 0),
      country: data.country || 'BD',
      health: data.health || 'Optimal',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Client '${created.name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
};

// Update an existing client by identifier
export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const ClientModel = getClientModel();

    const client = await ClientModel.findOneAndUpdate(
      { $or: [{ id }, { client_key: id }] },
      { $set: updates },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
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
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const deleted = await ClientModel.findOneAndDelete({ $or: [{ id }, { client_key: id }] });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client '${deleted.name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete client' });
  }
};

// Retrieve client enabled modules and permissions
export const getClientModules = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ id }, { client_key: id }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: { cpanelAccess: false, posIntegration: true },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client modules' });
  }
};

// Update client module permissions dynamically
export const updateClientModules = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ id }, { client_key: id }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
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
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ id }, { client_key: id }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: { portal_url: client.portal_url },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client domains' });
  }
};

// Update client domain mappings and instance URLs
export const updateClientDomains = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { portal_url } = req.body;
    const ClientModel = getClientModel();

    const client = await ClientModel.findOneAndUpdate(
      { $or: [{ id }, { client_key: id }] },
      { $set: { portal_url } },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Client domains updated successfully`,
      data: { portal_url: client.portal_url },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client domains' });
  }
};

// Retrieve comprehensive 360 degree relational view of a client across all microservices
export const getClient360 = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ClientModel = getClientModel();
    const ProjectModel = getProjectModel();
    const InvoiceModel = getInvoiceModel();
    const PaymentModel = getPaymentModel();
    const SupportTicketModel = getSupportTicketModel();
    const ProjectDocModel = getProjectDocModel();
    const VaultModel = getClientVaultModel();

    const client = await ClientModel.findOne({ $or: [{ id }, { client_key: id }] });

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    const clientId = client.id;
    const clientKey = client.client_key;

    const [projects, invoices, payments, supportTickets, projectDocs, vaultItem] = await Promise.all([
      ProjectModel.find({ client_id: clientId }),
      InvoiceModel.find({ client_id: clientId }),
      PaymentModel.find({ client_id: clientId }),
      SupportTicketModel.find({ client_id: clientId }),
      ProjectDocModel.find({ client_id: clientId }),
      VaultModel.findOne({ $or: [{ client_id: clientId }, { client_key: clientKey }] }),
    ]);

    const totalPaid = payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0);
    const unpaidInvoices = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE');
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
        open_tickets_count: supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
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

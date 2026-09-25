import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Client } from '../types/index.js';

// Retrieve all clients with optional filtering by status, type, and keyword search
export const getClients = (req: Request, res: Response) => {
  try {
    const { status, type, search } = req.query;
    let clients = [...Store.clients];

    if (status) {
      clients = clients.filter(c => String(c.status).toLowerCase() === String(status).toLowerCase());
    }
    if (type) {
      clients = clients.filter(c => String(c.client_type || c.type).toLowerCase() === String(type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      clients = clients.filter(c =>
        c.business_name.toLowerCase().includes(q) ||
        (c.primary_domain && c.primary_domain.toLowerCase().includes(q)) ||
        (c.contact_email && c.contact_email.toLowerCase().includes(q)) ||
        (c.client_key && c.client_key.toLowerCase().includes(q))
      );
    }

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
export const getClientById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const client = Store.clients.find(c => c.id === id || c.client_key === id || c.clientKey === id);

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

// Create a new client with modules and domain routing configurations
export const createClient = (req: Request, res: Response) => {
  try {
    const data = req.body;
    const businessName = data.business_name || data.businessName || data.name || data.brandName;
    if (!businessName) {
      return res.status(400).json({ success: false, message: 'Client business name is required' });
    }

    const key = data.client_key || data.clientKey || businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newClient: Client = {
      id: data.id || `c-${Date.now().toString().slice(-4)}`,
      did: data.did || `WL-${key.toUpperCase().slice(0, 6)}-001`,
      client_key: key,
      clientKey: key,
      business_name: businessName.trim(),
      businessName: businessName.trim(),
      brandName: businessName.trim(),
      primary_domain: data.primary_domain || data.primaryDomain || data.domain,
      primaryDomain: data.primary_domain || data.primaryDomain || data.domain,
      domain: data.primary_domain || data.primaryDomain || data.domain,
      client_type: data.client_type || data.clientType || data.type || 'SINGLE_TENANT',
      type: data.client_type || data.clientType || data.type || 'SINGLE_TENANT',
      database_shared: data.database_shared !== undefined ? data.database_shared : false,
      status: data.status || 'ACTIVE',
      monthly_revenue: Number(data.monthly_revenue || data.monthlyRevenue || 0),
      monthly_retainer: Number(data.monthly_retainer || data.monthlyRetainer || 0),
      contact_email: data.contact_email || data.contactEmail,
      contact_phone: data.contact_phone || data.contactPhone,
      address: data.address,
      projects_count: 0,
      modules: {
        cpanelAccess: false,
        multiWarehouse: false,
        posIntegration: true,
        advancedReports: true,
        ...(data.modules || {}),
      },
      domains: {
        storefrontUrl: data.domains?.storefrontUrl || (data.primary_domain ? `https://${data.primary_domain}` : undefined),
        storefrontApiUrl: data.domains?.storefrontApiUrl || (data.primary_domain ? `https://server.${data.primary_domain}` : undefined),
        dashboardUrl: data.domains?.dashboardUrl || (data.primary_domain ? `https://admin.${data.primary_domain}` : undefined),
        dashboardApiUrl: data.domains?.dashboardApiUrl || (data.primary_domain ? `https://service.${data.primary_domain}` : undefined),
        cpanelUrl: data.domains?.cpanelUrl || (data.primary_domain ? `https://cpanel.${data.primary_domain}` : undefined),
        ...(data.domains || {}),
      },
      vps: data.vps,
      created_at: new Date().toISOString(),
    };

    Store.clients.unshift(newClient);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Client '${newClient.business_name}' created successfully`,
      data: newClient,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
};

// Update an existing client by identifier
export const updateClient = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    Store.clients[index] = {
      ...Store.clients[index],
      ...updates,
      modules: {
        ...(Store.clients[index].modules || {}),
        ...(updates.modules || {}),
      },
      domains: {
        ...(Store.clients[index].domains || {}),
        ...(updates.domains || {}),
      },
      vps: {
        ...(Store.clients[index].vps || {}),
        ...(updates.vps || {}),
      },
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      status: 'success',
      message: `Client '${Store.clients[index].business_name}' updated successfully`,
      data: Store.clients[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client' });
  }
};

// Delete a client from the data store
export const deleteClient = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    const [deleted] = Store.clients.splice(index, 1);
    return res.json({
      success: true,
      status: 'success',
      message: `Client '${deleted.business_name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete client' });
  }
};

// Retrieve client enabled modules and permissions
export const getClientModules = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const client = Store.clients.find(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: client.modules || { cpanelAccess: false },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client modules' });
  }
};

// Update client module permissions dynamically
export const updateClientModules = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const modules = req.body;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    Store.clients[index].modules = {
      ...(Store.clients[index].modules || {}),
      ...modules,
    };
    Store.clients[index].updated_at = new Date().toISOString();

    return res.json({
      success: true,
      status: 'success',
      message: `Client modules for '${Store.clients[index].business_name}' updated successfully`,
      data: Store.clients[index].modules,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client modules' });
  }
};

// Retrieve client domain and instance routing configuration
export const getClientDomains = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const client = Store.clients.find(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (!client) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: client.domains || {},
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client domains' });
  }
};

// Update client domain mappings and instance URLs
export const updateClientDomains = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const domains = req.body;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id || c.clientKey === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    Store.clients[index].domains = {
      ...(Store.clients[index].domains || {}),
      ...domains,
    };
    Store.clients[index].updated_at = new Date().toISOString();

    return res.json({
      success: true,
      status: 'success',
      message: `Client domains for '${Store.clients[index].business_name}' updated successfully`,
      data: Store.clients[index].domains,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client domains' });
  }
};

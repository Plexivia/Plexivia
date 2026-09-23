import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Client } from '../types/index.js';

export const getClients = (req: Request, res: Response) => {
  try {
    const { status, type, search } = req.query;
    let clients = [...Store.clients];

    if (status) {
      clients = clients.filter(c => String(c.status).toLowerCase() === String(status).toLowerCase());
    }
    if (type) {
      clients = clients.filter(c => String(c.client_type).toLowerCase() === String(type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      clients = clients.filter(c =>
        c.business_name.toLowerCase().includes(q) ||
        c.primary_domain?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q)
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

export const getClientById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const client = Store.clients.find(c => c.id === id || c.client_key === id);

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

export const createClient = (req: Request, res: Response) => {
  try {
    const data = req.body;
    const businessName = data.business_name || data.businessName || data.name;
    if (!businessName) {
      return res.status(400).json({ success: false, message: 'Client business name is required' });
    }

    const newClient: Client = {
      id: data.id || `c-${Date.now().toString().slice(-4)}`,
      client_key: data.client_key || businessName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      business_name: businessName.trim(),
      primary_domain: data.primary_domain || data.primaryDomain,
      client_type: data.client_type || data.clientType || 'SINGLE_TENANT',
      database_shared: data.database_shared !== undefined ? data.database_shared : false,
      status: data.status || 'ACTIVE',
      monthly_revenue: Number(data.monthly_revenue || data.monthlyRevenue || 0),
      monthly_retainer: Number(data.monthly_retainer || data.monthlyRetainer || 0),
      contact_email: data.contact_email || data.contactEmail,
      contact_phone: data.contact_phone || data.contactPhone,
      address: data.address,
      projects_count: 0,
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

export const updateClient = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Client '${id}' not found` });
    }

    Store.clients[index] = {
      ...Store.clients[index],
      ...updates,
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

export const deleteClient = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.clients.findIndex(c => c.id === id || c.client_key === id);

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

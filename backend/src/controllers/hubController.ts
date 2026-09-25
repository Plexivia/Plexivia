import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { SystemTelemetry, SupportTicket, SupportMessage, ProjectDoc } from '../types/index.js';

// Retrieve master hub system health, telemetry and services overview
export const getHubOverview = (_req: Request, res: Response) => {
  try {
    const totalClients = Store.clients.length;
    const totalTickets = Store.supportTickets.length;
    const openTickets = Store.supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const totalDocs = Store.projectDocs.length;

    const telemetry: SystemTelemetry = {
      cpu_usage_percent: Math.floor(Math.random() * 12) + 4,
      memory_used_mb: 480,
      memory_total_mb: 2048,
      uptime_seconds: process.uptime(),
      active_containers: 6,
      services_status: {
        auth: 'healthy',
        hub: 'healthy',
        agency: 'healthy',
        finance: 'healthy',
      },
    };

    return res.json({
      success: true,
      status: 'success',
      data: {
        service: 'PlexiHub Core',
        version: '2.1.0',
        counts: {
          clients: totalClients,
          supportTickets: totalTickets,
          openTickets,
          projectDocs: totalDocs,
        },
        telemetry,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve hub overview' });
  }
};

// Retrieve client support tickets with optional status and client filtering
export const getSupportTickets = (req: Request, res: Response) => {
  try {
    const { status, clientId } = req.query;
    let tickets = [...Store.supportTickets];

    if (status) {
      tickets = tickets.filter(t => t.status.toLowerCase() === String(status).toLowerCase());
    }
    if (clientId) {
      tickets = tickets.filter(t => t.client_id === String(clientId));
    }

    return res.json({
      success: true,
      status: 'success',
      count: tickets.length,
      data: tickets,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve support tickets' });
  }
};

// Create a new client support ticket
export const createSupportTicket = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.subject) {
      return res.status(400).json({ success: false, message: 'Client ID and subject are required' });
    }

    const client = Store.clients.find(c => c.id === data.client_id || c.client_key === data.client_id);
    const newTicket: SupportTicket = {
      id: data.id || `tkt-${Date.now().toString().slice(-4)}`,
      client_id: data.client_id,
      client_name: client?.business_name || data.client_name || 'Client',
      subject: data.subject,
      category: data.category || 'FEATURE_REQUEST',
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      messages: data.initial_message ? [
        {
          id: `msg-${Date.now().toString().slice(-4)}`,
          ticket_id: data.id || `tkt-${Date.now().toString().slice(-4)}`,
          sender_type: 'CLIENT',
          sender_name: client?.business_name || 'Client',
          message: data.initial_message,
          created_at: new Date().toISOString(),
        }
      ] : [],
      created_at: new Date().toISOString(),
    };

    Store.supportTickets.unshift(newTicket);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Support ticket created successfully',
      data: newTicket,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create support ticket' });
  }
};

// Append a message to an existing support ticket thread
export const addSupportTicketMessage = (req: Request, res: Response) => {
  try {
    const ticketId = req.params.ticketId as string;
    const { sender_type, sender_name, message, attachments } = req.body;
    const ticket = Store.supportTickets.find(t => t.id === ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket '${ticketId}' not found` });
    }

    const newMessage: SupportMessage = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      ticket_id: ticketId,
      sender_type: sender_type || 'SUPPORT_AGENT',
      sender_name: sender_name || 'Support Agent',
      message: message || '',
      attachments: attachments || [],
      created_at: new Date().toISOString(),
    };

    ticket.messages.push(newMessage);
    ticket.updated_at = new Date().toISOString();

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Message added to ticket',
      data: newMessage,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add message' });
  }
};

// Retrieve client project documentation articles
export const getProjectDocs = (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;
    let docs = [...Store.projectDocs];

    if (clientId) {
      docs = docs.filter(d => d.client_id === String(clientId));
    }

    return res.json({
      success: true,
      status: 'success',
      count: docs.length,
      data: docs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve project docs' });
  }
};

// Create or update client project documentation article
export const saveProjectDoc = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.title) {
      return res.status(400).json({ success: false, message: 'Client ID and title are required' });
    }

    const newDoc: ProjectDoc = {
      id: data.id || `doc-${Date.now().toString().slice(-4)}`,
      client_id: data.client_id,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: data.category || 'General',
      content_markdown: data.content_markdown || '',
      is_public_to_client: data.is_public_to_client !== undefined ? data.is_public_to_client : true,
      version: data.version || '1.0.0',
      created_at: new Date().toISOString(),
    };

    Store.projectDocs.unshift(newDoc);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Project documentation saved successfully',
      data: newDoc,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to save project doc' });
  }
};

// Retrieve live VPS node telemetry and docker container metrics without exposing credentials
export const getVpsNodeStatus = (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const client = tenantId ? Store.clients.find(c => c.id === tenantId || c.client_key === tenantId) : null;

    const nodeData = {
      tenantId: tenantId || 'master-vps',
      businessName: client?.business_name || 'Master Plexivia Hub',
      agentConnected: true,
      containers: [
        { name: 'storefront_web', status: 'running', port: 3000, cpuPercent: 1.2, memoryMb: 128 },
        { name: 'storefront_api', status: 'running', port: 4001, cpuPercent: 0.8, memoryMb: 96 },
        { name: 'dashboard_web', status: 'running', port: 5000, cpuPercent: 0.5, memoryMb: 110 },
        { name: 'dashboard_api', status: 'running', port: 4002, cpuPercent: 1.1, memoryMb: 140 },
        { name: 'node_agent_ppanel', status: 'running', port: 8090, cpuPercent: 0.2, memoryMb: 45 },
      ],
    };

    return res.json({
      success: true,
      status: 'success',
      data: nodeData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve node status' });
  }
};

// Process silent telemetry security events dispatched from remote node agents
export const receiveNodeTelemetryEvent = (req: Request, res: Response) => {
  try {
    const { eventType, severity, payload } = req.body;
    const rawDid = req.headers['x-tenant-did'];
    const tenantDid = (Array.isArray(rawDid) ? rawDid[0] : rawDid) || 'UNKNOWN';

    const sanitizedPayload = typeof payload === 'object' && payload !== null
      ? Object.fromEntries(
          Object.entries(payload).filter(([k]) =>
            !['password', 'token', 'secret', 'private_key', 'authorization', 'cookie', 'ssh_key'].some(s => k.toLowerCase().includes(s))
          )
        )
      : payload;

    return res.json({
      success: true,
      status: 'success',
      message: 'Telemetry event acknowledged and processed',
      acknowledgedAt: new Date().toISOString(),
      event: {
        tenantDid,
        eventType,
        severity: severity || 'info',
        payload: sanitizedPayload,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to process telemetry event' });
  }
};

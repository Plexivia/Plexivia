import { apiFetch } from '@/services/api';
import { apiClient } from '@/lib/api-client';

const send = (endpoint, method, body) => apiFetch(endpoint, { method, body: body ? JSON.stringify(body) : undefined });

// Pulls the server's message out of an axios error so toasts show what actually failed
export const apiErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const CATEGORIES = ['VPS', 'DEPLOYMENT', 'BUG', 'BILLING', 'FEATURE'];

const toMessage = (m) => ({
  id: m.dId,
  authorType: m.author_type,
  authorName: m.author_name,
  authorAdminId: m.author_admin_dId || '',
  body: m.body,
  isInternalNote: !!m.is_internal_note,
  attachments: m.attachments || [],
  createdAt: m.created_at,
});

const toTicket = (t) => ({
  id: t.dId,
  ticketNumber: t.ticket_number,
  clientId: t.client_dId || t.client_id || '',
  clientName: t.client_name,
  projectId: t.project_dId || '',
  projectName: t.project_name || '',
  subject: t.subject,
  description: t.description,
  category: t.category,
  priority: t.priority,
  status: t.status,
  assignedTo: t.assigned_to || '',
  assignedToName: t.assigned_to_name || '',
  messages: (t.messages || []).map(toMessage),
  slaDueAt: t.sla_due_at || '',
  firstResponseAt: t.first_response_at || '',
  resolvedAt: t.resolved_at || '',
  closedAt: t.closed_at || '',
  isOverdue: !!t.is_overdue,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
});

export const supportApi = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return ((await apiFetch(`/support/tickets${qs ? `?${qs}` : ''}`))?.data || []).map(toTicket);
  },
  get: async (id) => toTicket((await apiFetch(`/support/tickets/${id}`)).data),
  create: async (payload) => toTicket((await send('/support/tickets', 'POST', payload)).data),
  reply: async (id, body, isInternalNote = false, attachments = []) =>
    toTicket((await send(`/support/tickets/${id}/messages`, 'POST', { message: body, is_internal_note: isInternalNote, attachments })).data),
  updateStatus: async (id, status, priority) => toTicket((await send(`/support/tickets/${id}/status`, 'PATCH', { status, priority })).data),
  assign: async (id, adminId) => toTicket((await send(`/support/tickets/${id}/assign`, 'PATCH', { assigned_to: adminId })).data),
  remove: (id) => send(`/support/tickets/${id}`, 'DELETE'),
};

// One file per call; sends raw bytes (not multipart), mirroring the avatar-upload pattern.
// Returns {name, url, size, mimeType}, the same shape AttachmentUploader produces.
export const uploadTicketAttachment = async (file) => {
  const buffer = await file.arrayBuffer();
  const { data } = await apiClient.post('/api/support/attachments', buffer, {
    headers: { 'Content-Type': file.type, 'X-File-Name': file.name },
  });
  return data.data;
};

export const clientSupportKeyApi = {
  generate: async (clientId) => (await send(`/clients/${clientId}/support-key`, 'POST')).data,
  revoke: (clientId) => send(`/clients/${clientId}/support-key`, 'DELETE'),
};

// Active admins, for the ticket assignee picker
export const supportAdminsApi = {
  list: async () => {
    const res = await apiFetch('/users?status=active');
    const rows = Array.isArray(res?.data) ? res.data : [];
    return rows
      .map((a) => ({ id: a.dId || '', name: a.full_name || a.email || 'Admin', role: a.role || '' }))
      .filter((a) => a.id);
  },
};

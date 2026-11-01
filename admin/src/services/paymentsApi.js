import { apiFetch } from '@/services/api';

// UI status labels <-> API status codes
const STATUS_TO_API = { Completed: 'SUCCESS', Pending: 'PENDING', Partial: 'PARTIAL', Failed: 'FAILED' };
const STATUS_FROM_API = Object.fromEntries(Object.entries(STATUS_TO_API).map(([ui, api]) => [api, ui]));

const send = (endpoint, method, body) => apiFetch(endpoint, { method, body: body ? JSON.stringify(body) : undefined });

// Pulls the server's message out of an axios error so toasts show what actually failed
export const apiErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const toSource = (s) => ({
  id: s.dId,
  name: s.name,
  description: s.description || '',
  linkType: s.link_type || 'none',
  status: s.status || 'Active',
  system: !!s.is_system,
  linkedPaymentsCount: s.payments_count || 0,
  totalReceived: s.total_received || 0,
  createdAt: s.created_at,
});

const fromSourceForm = (f) => ({ name: f.name, description: f.description, link_type: f.linkType, status: f.status });

export const toPayment = (p) => ({
  id: p.dId,
  paymentNumber: p.payment_number,
  invoiceId: p.invoice_id || '',
  paymentSourceId: p.payment_source_dId || '',
  paymentSource: p.payment_source_name || '',
  clientId: p.client_id || '',
  projectId: p.project_dId || '',
  projectName: p.project_name || '',
  customerName: p.payer_name || p.client_name || '',
  amount: p.total_amount ?? p.amount,
  paidAmount: p.amount,
  method: p.payment_method || '',
  paymentMethod: p.payment_method || '',
  trxId: p.transaction_reference || '',
  date: (p.paid_at || p.created_at || '').slice(0, 10),
  status: STATUS_FROM_API[p.status] || p.status,
  notes: p.notes || '',
  attachments: p.attachments || [],
});

// Form state from addNewPayment -> API body
export const fromPaymentForm = (f) => {
  const total = Number(f.amount) || 0;
  const received = f.paidAmount !== '' && f.paidAmount !== undefined ? Number(f.paidAmount) : total;
  return {
    payment_source_id: f.paymentSourceId,
    client_id: f.clientId || undefined,
    project_id: f.projectId || undefined,
    payer_name: f.customerName,
    invoice_id: f.invoiceId || undefined,
    total_amount: total,
    amount: received,
    payment_method: f.paymentMethod || undefined,
    transaction_ref: f.trxId || undefined,
    paid_at: f.date,
    status: STATUS_TO_API[f.status] || 'SUCCESS',
    notes: f.notes,
    attachments: f.attachments,
  };
};

export const paymentSourcesApi = {
  list: async () => ((await apiFetch('/accounting/payment-sources'))?.data || []).map(toSource),
  create: async (form) => toSource((await send('/accounting/payment-sources', 'POST', fromSourceForm(form))).data),
  update: async (id, form) => toSource((await send(`/accounting/payment-sources/${id}`, 'PUT', fromSourceForm(form))).data),
  remove: (id) => send(`/accounting/payment-sources/${id}`, 'DELETE'),
};

export const paymentsApi = {
  list: async () => ((await apiFetch('/accounting/payments'))?.data || []).map(toPayment),
  get: async (id) => toPayment((await apiFetch(`/accounting/payments/${id}`)).data),
  create: async (form) => toPayment((await send('/accounting/payments', 'POST', fromPaymentForm(form))).data),
  update: async (id, form) => toPayment((await send(`/accounting/payments/${id}`, 'PUT', fromPaymentForm(form))).data),
  updateStatus: (id, status) => send(`/accounting/payments/${id}`, 'PUT', { status: STATUS_TO_API[status] || status }),
  remove: (id) => send(`/accounting/payments/${id}`, 'DELETE'),
};

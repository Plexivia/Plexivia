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
  businessId: p.business_dId || '',
  businessName: p.business_name || '',
  customerName: p.payer_name || p.client_name || p.business_name || '',
  amount: p.total_amount ?? p.amount,
  paidAmount: p.amount,
  method: p.payment_method || '',
  paymentMethod: p.payment_method || '',
  paymentMethodId: p.payment_method_dId || '',
  charges: p.charges || [],
  chargeTotal: p.charge_total || 0,
  netAmount: p.net_amount ?? p.amount,
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
    business_id: f.businessId || undefined,
    payer_name: f.customerName,
    // invoice_id is assigned by the server; never sent
    total_amount: total,
    amount: received,
    payment_method: f.paymentMethod || undefined,
    payment_method_id: f.paymentMethodId || '',
    charges: f.charges || [],
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

// Bills: UI status labels <-> API status codes
const BILL_STATUS_TO_API = { Paid: 'PAID', Pending: 'PENDING', Partial: 'PARTIAL', Overdue: 'OVERDUE' };
const BILL_STATUS_FROM_API = Object.fromEntries(Object.entries(BILL_STATUS_TO_API).map(([ui, api]) => [api, ui]));

export const toBill = (b) => {
  const total = Number(b.amount) || 0;
  const paid = Number(b.paid_amount) || 0;
  return {
    id: b.dId,
    did: b.bill_number,
    title: b.title || b.vendor_name || '',
    vendor: b.vendor_name || '',
    billType: b.bill_type || '',
    clientId: b.client_dId || '',
    clientName: b.client_name || '',
    projectId: b.project_dId || '',
    projectName: b.project_name || '',
    totalAmount: total,
    // Amount before payment-method charges; older bills have no breakdown, so the total is the base
    billAmount: b.base_amount ?? total,
    baseAmount: b.base_amount ?? total,
    charges: b.charges || [],
    feeAmount: b.charge_total || 0,
    paymentFee: (b.charges || [])[0] || null,
    billingMethod: b.payment_method || '',
    paymentMethodId: b.payment_method_dId || '',
    paidAmount: paid,
    pendingAmount: Math.max(0, Math.round((total - paid) * 100) / 100),
    billingDate: (b.billing_date || b.created_at || '').slice(0, 10),
    dueDate: (b.due_date || '').slice(0, 10),
    status: BILL_STATUS_FROM_API[b.status] || b.status,
    lineItems: b.line_items || [],
    automated: !!b.external_ref,
    notes: b.notes || '',
    attachments: b.attachments || [],
  };
};

// Form state from addNewBill -> API body
export const fromBillForm = (f, asset, charges) => ({
  title: f.title,
  bill_type: f.billType || undefined,
  vendor_name: f.vendor || f.title,
  amount: Number(f.totalAmount) || 0,
  ...(charges ? { base_amount: Number(f.totalAmount) || 0, charges, payment_method_id: f.paymentMethodId || '' } : {}),
  paid_amount: Number(f.paidAmount) || 0,
  status: BILL_STATUS_TO_API[f.status] || 'PENDING',
  billing_date: f.billingDate,
  due_date: f.dueDate || '',
  project_dId: asset?.id || '',
  project_name: asset?.name || '',
  client_dId: asset?.clientId || '',
  client_name: asset?.clientName || '',
  notes: f.notes,
  attachments: f.attachments,
});

export const billsApi = {
  list: async () => ((await apiFetch('/accounting/bills'))?.data || []).map(toBill),
  get: async (id) => toBill((await apiFetch(`/accounting/bills/${id}`)).data),
  create: async (form, asset, charges) => toBill((await send('/accounting/bills', 'POST', fromBillForm(form, asset, charges))).data),
  update: async (id, form, asset, charges) => toBill((await send(`/accounting/bills/${id}`, 'PUT', fromBillForm(form, asset, charges))).data),
  updateStatus: (id, status) => send(`/accounting/bills/${id}`, 'PUT', { status: BILL_STATUS_TO_API[status] || status }),
  remove: (id) => send(`/accounting/bills/${id}`, 'DELETE'),
};

// Payment methods and their regular charges
const toMethod = (m) => ({
  id: m.dId,
  name: m.name,
  category: m.category || 'other',
  provider: m.provider || '',
  accountNumber: m.account_number || '',
  accountName: m.account_name || '',
  accountType: m.account_type || 'Personal',
  branchName: m.branch_name || '',
  routingNumber: m.routing_number || '',
  fees: m.fees || [],
  instructions: m.instructions || '',
  description: m.description || '',
  status: m.status || 'Active',
  isDefault: !!m.is_default,
  createdAt: m.created_at,
});

const fromMethodForm = (f) => ({
  name: f.name,
  category: f.category,
  provider: f.provider,
  account_number: f.accountNumber,
  account_name: f.accountName,
  account_type: f.accountType,
  branch_name: f.branchName,
  routing_number: f.routingNumber,
  fees: f.fees,
  instructions: f.instructions,
  description: f.description,
  status: f.status,
  is_default: f.isDefault,
});

export const paymentMethodsApi = {
  list: async () => ((await apiFetch('/accounting/payment-methods'))?.data || []).map(toMethod),
  create: async (form) => toMethod((await send('/accounting/payment-methods', 'POST', fromMethodForm(form))).data),
  update: async (id, form) => toMethod((await send(`/accounting/payment-methods/${id}`, 'PUT', fromMethodForm(form))).data),
  updateStatus: (id, status) => send(`/accounting/payment-methods/${id}`, 'PUT', { status }),
  remove: (id) => send(`/accounting/payment-methods/${id}`, 'DELETE'),
};

// The owner's own businesses (API uses snake_case, same field names as the form)
export const BUSINESS_FIELDS = [
  'name', 'legal_name', 'business_type', 'owner_name', 'email', 'phone', 'website', 'address',
  'trade_license', 'tin', 'bin', 'logo_url', 'admin_dashboard_url', 'frontend_url', 'notes', 'status',
];

const toBusiness = (b) => ({ id: b.dId, createdAt: b.created_at, ...Object.fromEntries(BUSINESS_FIELDS.map((k) => [k, b[k] ?? ''])) });
const fromBusinessForm = (f) => Object.fromEntries(BUSINESS_FIELDS.map((k) => [k, f[k] ?? '']));

export const businessesApi = {
  list: async () => ((await apiFetch('/accounting/businesses'))?.data || []).map(toBusiness),
  create: async (form) => toBusiness((await send('/accounting/businesses', 'POST', fromBusinessForm(form))).data),
  update: async (id, form) => toBusiness((await send(`/accounting/businesses/${id}`, 'PUT', fromBusinessForm(form))).data),
  remove: (id) => send(`/accounting/businesses/${id}`, 'DELETE'),
};

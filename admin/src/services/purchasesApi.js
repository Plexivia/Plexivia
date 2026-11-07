import { apiFetch } from '@/services/api';

const send = (endpoint, method, body) => apiFetch(endpoint, { method, body: body ? JSON.stringify(body) : undefined });

// Vendors (who stock is bought from)
export const vendorsApi = {
  list: async (q = '') => (await apiFetch(`/accounting/vendors${q ? `?q=${encodeURIComponent(q)}` : ''}`))?.data || [],
  create: async (body) => (await send('/accounting/vendors', 'POST', body)).data,
  update: async (id, body) => (await send(`/accounting/vendors/${id}`, 'PUT', body)).data,
  remove: (id) => send(`/accounting/vendors/${id}`, 'DELETE'),
};

// Product purchases; every change also updates the "Product Purchase" bill and Surokkha stock on the server
export const purchasesApi = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'ALL')).toString();
    return (await apiFetch(`/accounting/purchases${qs ? `?${qs}` : ''}`))?.data || [];
  },
  get: async (id) => (await apiFetch(`/accounting/purchases/${id}`)).data,
  stockItems: async () => (await apiFetch('/accounting/purchases/stock-items'))?.data || [],
  create: async (body) => (await send('/accounting/purchases', 'POST', body)).data,
  update: async (id, body) => (await send(`/accounting/purchases/${id}`, 'PUT', body)).data,
  receive: async (id, body = {}) => (await send(`/accounting/purchases/${id}/receive`, 'POST', body)).data,
  addPayment: async (id, body) => (await send(`/accounting/purchases/${id}/payments`, 'POST', body)).data,
  removePayment: async (id, paymentId) => (await send(`/accounting/purchases/${id}/payments/${paymentId}`, 'DELETE')).data,
  cancel: async (id, reason = '') => (await send(`/accounting/purchases/${id}/cancel`, 'POST', { reason })).data,
  resync: async (id) => (await send(`/accounting/purchases/${id}/resync`, 'POST')).data,
  syncCheck: async (id) => (await apiFetch(`/accounting/purchases/${id}/sync-check`)).data,
  resyncAll: async () => (await send('/accounting/purchases/resync-all', 'POST')).data,
};

// Formats a number as Taka
export const taka = (val) => `৳${(Number(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Short text for one purchase line, e.g. "MO × 5 Packet (50 pcs)"
export const lineText = (l) =>
  l.units_per_pack > 1
    ? `${l.short_name} × ${l.packs} ${l.pack_label || 'pack'} (${l.units} ${l.unit || 'pcs'})`
    : `${l.short_name} × ${l.units} ${l.unit || 'pcs'}`;

// Printable / shareable slip for a purchase, used by the quick view's Print, WhatsApp and Email actions
export const purchaseSlip = (p) =>
  p && {
    heading: 'Purchase Receipt',
    reference: p.purchase_number,
    rows: [
      { label: 'Vendor', value: p.vendor_name },
      { label: 'Vendor Phone', value: p.vendor_phone },
      { label: 'Order Date', value: String(p.order_date || '').slice(0, 10) },
      { label: 'Received', value: p.received_date ? String(p.received_date).slice(0, 10) : '' },
      ...p.lines.map((l) => ({ label: `${lineText(l)} @ ${taka(l.pack_price)}`, value: taka(l.total) })),
      ...(p.shipping ? [{ label: 'Shipping / carrying', value: taka(p.shipping) }] : []),
      ...(p.discount ? [{ label: 'Discount', value: `-${taka(p.discount)}` }] : []),
      ...p.payments.map((x) => ({
        label: `Paid via ${x.method}${x.transaction_reference ? ` (${x.transaction_reference})` : ''} · ${String(x.paid_at).slice(0, 10)}`,
        value: taka(x.amount),
      })),
      { label: 'Bill', value: p.bill_number },
      { label: 'Status', value: p.status === 'RECEIVED' && p.payment_status === 'PAID' ? 'Paid' : `${p.status} · ${p.payment_status}` },
    ],
    totals: [
      { label: 'Paid', value: taka(p.paid_amount) },
      { label: 'Due', value: taka(Math.max(0, p.total - p.paid_amount)) },
      { label: 'Total', value: taka(p.total) },
    ],
    notes: p.notes,
  };

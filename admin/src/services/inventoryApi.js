import { apiFetch } from '@/services/api';

const send = (endpoint, method, body) => apiFetch(endpoint, { method, body: body ? JSON.stringify(body) : undefined });

// Builds a query string from the non-empty filters
const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return s ? `?${s}` : '';
};

// Unit-level inventory of connected e-commerce stores, managed through each store's sync key
export const inventoryApi = {
  stores: async () => (await apiFetch('/inventory/stores'))?.data || [],
  items: (store, params) => apiFetch(`/inventory/${store}/items${qs(params)}`),
  createItem: async (store, body) => (await send(`/inventory/${store}/items`, 'POST', body)).data,
  updateItem: async (store, id, body) => (await send(`/inventory/${store}/items/${id}`, 'PUT', body)).data,
  adjustItem: async (store, id, body) => (await send(`/inventory/${store}/items/${id}/adjust`, 'POST', body)).data,
  movements: (store, params) => apiFetch(`/inventory/${store}/movements${qs(params)}`),
  receipts: (store, params) => apiFetch(`/inventory/${store}/receipts${qs(params)}`),
};

export const UNIT_OPTIONS = [
  { value: 'pcs', label: 'pcs (single piece)' },
  { value: 'pair', label: 'pair' },
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'litre', label: 'litre' },
  { value: 'meter', label: 'meter' },
];

// Pieces shown as the biggest pack that fits plus loose pieces, e.g. 53 pcs -> "5 Packet + 3 pcs"
export const packBreakdown = (quantity, packs = [], unit = 'pcs') => {
  const big = [...packs].filter((p) => p.unitsPerPack > 1 && p.unitsPerPack <= quantity).sort((a, b) => b.unitsPerPack - a.unitsPerPack)[0];
  if (!big || quantity <= 0) return '';
  const full = Math.floor(quantity / big.unitsPerPack);
  const loose = quantity % big.unitsPerPack;
  return `${full} ${big.label}${loose ? ` + ${loose} ${unit}` : ''}`;
};

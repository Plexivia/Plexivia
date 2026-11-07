import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth.js';
import { getSurokkhaConfig } from '../utils/surokkhaBillImport.js';
import { callSurokkha } from '../utils/purchaseSync.js';

type StoreConnector = { key: string; name: string; isConnected: () => Promise<boolean>; call: typeof callSurokkha };

// E-commerce stores whose inventory Plexivia can manage; add a connector here for each new store integration
const CONNECTORS: StoreConnector[] = [
  {
    key: 'surokkha',
    name: 'Surokkha Store',
    isConnected: async () => {
      const cfg = await getSurokkhaConfig();
      return Boolean(cfg.enabled && cfg.baseUrl && cfg.key);
    },
    call: callSurokkha,
  },
];

const QUERY_KEYS = ['search', 'status', 'page', 'limit', 'refId', 'type', 'q'];

// Finds the connector for :store, or answers 404
const connectorFor = (req: AuthedRequest, res: Response) => {
  const c = CONNECTORS.find((x) => x.key === String(req.params.store));
  if (!c) res.status(404).json({ success: false, message: 'Unknown store' });
  return c;
};

// Copies only the known list filters onto the store's query string
const queryString = (req: AuthedRequest) => {
  const qs = new URLSearchParams();
  QUERY_KEYS.forEach((k) => {
    if (req.query[k] !== undefined && req.query[k] !== '') qs.set(k, String(req.query[k]));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

// Sends a store call's reply back, keeping the store's own status code and message on failure
const relay = async (req: AuthedRequest, res: Response, path: string, method = 'GET', body?: any) => {
  const c = connectorFor(req, res);
  if (!c) return;
  try {
    const reply = await c.call(path, { method, body, raw: true, actor: req.auth?.email || 'admin' });
    return res.status(method === 'POST' && path.endsWith('/items') ? 201 : 200).json({ ...reply, success: true });
  } catch (err: any) {
    const status = err?.status && err.status >= 400 && err.status < 500 ? err.status : 502;
    return res.status(status).json({ success: false, message: err?.message || 'Store could not be reached' });
  }
};

// GET /inventory/stores — connected e-commerce stores, for the store picker
export const getInventoryStores = async (_req: AuthedRequest, res: Response) => {
  const rows = await Promise.all(CONNECTORS.map(async (c) => ({ key: c.key, name: c.name, connected: await c.isConnected().catch(() => false) })));
  return res.json({ success: true, data: rows });
};

// GET /inventory/:store/items
export const listItems = (req: AuthedRequest, res: Response) => relay(req, res, `/inventory/items${queryString(req)}`);

// POST /inventory/:store/items
export const createItem = (req: AuthedRequest, res: Response) => relay(req, res, '/inventory/items', 'POST', req.body || {});

// PUT /inventory/:store/items/:id
export const updateItem = (req: AuthedRequest, res: Response) =>
  relay(req, res, `/inventory/items/${encodeURIComponent(String(req.params.id))}`, 'PUT', req.body || {});

// POST /inventory/:store/items/:id/adjust
export const adjustItem = (req: AuthedRequest, res: Response) =>
  relay(req, res, `/inventory/items/${encodeURIComponent(String(req.params.id))}/adjust`, 'POST', req.body || {});

// GET /inventory/:store/movements
export const listMovements = (req: AuthedRequest, res: Response) => relay(req, res, `/inventory/movements${queryString(req)}`);

// GET /inventory/:store/receipts
export const listReceipts = (req: AuthedRequest, res: Response) => relay(req, res, `/inventory/receipts${queryString(req)}`);

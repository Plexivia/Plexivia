import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth.js';
import { getPaymentMethodModel, roundMoney } from '../models/Accounts.js';
import { getPurchaseModel, getVendorModel, IPurchase, nextPurchaseNumber, PurchaseStatus } from '../models/Purchase.js';
import { generateDId } from '../utils/dId.js';
import {
  fetchSurokkhaReceipt,
  fetchSurokkhaStockItems,
  queueStockSync,
  syncPurchaseStock,
  upsertPurchaseBill,
  retryPurchaseSyncs,
} from '../utils/purchaseSync.js';

class InputError extends Error {}

const OPEN_STATUSES: PurchaseStatus[] = ['DRAFT', 'ORDERED', 'RECEIVED'];
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const byIdQuery = (id: string | string[]) => ({ $or: [{ dId: String(id) }, { purchase_number: String(id) }] });
const nowIso = () => new Date().toISOString();

// Sends an error with the right status: 400 for bad input, 500 otherwise
const fail = (res: Response, err: any, fallback: string) =>
  res.status(err instanceof InputError ? 400 : 500).json({ success: false, message: err?.message || fallback });

// ---- Vendors ----

// GET /vendors — every active vendor, optionally searched by name or phone
export const getVendors = async (req: AuthedRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter: any = {};
    if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { phone: new RegExp(escapeRegex(q), 'i') }];
    const data = await getVendorModel().find(filter).sort({ name: 1 }).lean();
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, err, 'Failed to load vendors');
  }
};

// Clean vendor fields from the request body
const vendorFields = (body: any, partial = false) => {
  const out: Record<string, any> = {};
  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) throw new InputError('Vendor name is required');
    out.name = name.slice(0, 120);
  }
  ['phone', 'email', 'address', 'notes'].forEach((k) => {
    if (body[k] !== undefined) out[k] = String(body[k] || '').trim().slice(0, k === 'notes' || k === 'address' ? 500 : 120);
  });
  if (body.status !== undefined) out.status = body.status === 'Inactive' ? 'Inactive' : 'Active';
  return out;
};

// POST /vendors — adds a vendor
export const createVendor = async (req: AuthedRequest, res: Response) => {
  try {
    const fields = vendorFields(req.body || {});
    const data = await getVendorModel().create(fields);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return fail(res, err, 'Failed to create vendor');
  }
};

// PUT /vendors/:id — edits a vendor; open purchases keep the name they were saved with
export const updateVendor = async (req: AuthedRequest, res: Response) => {
  try {
    const fields = vendorFields(req.body || {}, true);
    const data = await getVendorModel().findOneAndUpdate({ dId: req.params.id }, { $set: { ...fields, updated_at: nowIso() } }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Vendor not found' });
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, err, 'Failed to update vendor');
  }
};

// DELETE /vendors/:id — hides a vendor (soft delete); its purchases stay
export const deleteVendor = async (req: AuthedRequest, res: Response) => {
  try {
    const data = await getVendorModel().findOneAndUpdate({ dId: req.params.id }, { $set: { is_active: false, deleted_at: nowIso() } }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Vendor not found' });
    return res.json({ success: true, message: 'Vendor removed' });
  } catch (err) {
    return fail(res, err, 'Failed to remove vendor');
  }
};

// ---- Purchases ----

// GET /purchases/stock-items — Surokkha's live stock items for the purchase form
export const getStockItems = async (_req: AuthedRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await fetchSurokkhaStockItems() });
  } catch (err: any) {
    return res.status(502).json({ success: false, message: err?.message || 'Could not reach Surokkha' });
  }
};

// Validates and prices lines (units = packs × units per pack); items already on the purchase stay allowed if Surokkha hid them
const buildLines = (raw: any, catalog: Map<string, any> | null, known: Set<string> = new Set()) => {
  if (!Array.isArray(raw) || raw.length === 0) throw new InputError('Add at least one item');
  return raw.map((l: any, i: number) => {
    const id = String(l?.stock_item_id || '').trim();
    if (!id) throw new InputError(`Line ${i + 1}: choose a stock item`);
    const item = catalog?.get(id);
    if (catalog && !item && !known.has(id)) throw new InputError(`Line ${i + 1}: stock item not found in Surokkha`);
    const packs = Number(l.packs);
    const perPack = Number(l.units_per_pack) || 1;
    const packPrice = Number(l.pack_price);
    if (!Number.isFinite(packs) || packs <= 0) throw new InputError(`Line ${i + 1}: quantity must be more than 0`);
    if (!Number.isInteger(perPack) || perPack < 1) throw new InputError(`Line ${i + 1}: units per pack must be a whole number`);
    if (!Number.isFinite(packPrice) || packPrice < 0) throw new InputError(`Line ${i + 1}: enter a valid price`);
    const units = Math.round(packs * perPack);
    if (units <= 0) throw new InputError(`Line ${i + 1}: quantity is too small`);
    const total = roundMoney(packs * packPrice);
    return {
      stock_item_id: id,
      short_name: String(item?.shortName || l.short_name || '').trim() || id,
      name: String(item?.name ?? l.name ?? ''),
      unit: String(item?.unit || l.unit || 'pcs'),
      pack_label: perPack > 1 ? String(l.pack_label || 'Pack').slice(0, 40) : '',
      packs,
      units_per_pack: perPack,
      units,
      pack_price: roundMoney(packPrice),
      unit_cost: Math.round((total / units) * 10000) / 10000,
      total,
    };
  });
};

// Validates one payment; the method name comes from Payment Methods when an id is given
const buildPayment = async (raw: any) => {
  const amount = roundMoney(raw?.amount);
  if (!(amount > 0)) throw new InputError('Payment amount must be more than 0');
  let method = String(raw?.method || '').trim();
  let methodDId: string | undefined;
  if (raw?.payment_method_id) {
    const pm: any = await getPaymentMethodModel().findOne({ dId: String(raw.payment_method_id) }).lean();
    if (!pm) throw new InputError('Payment method not found');
    method = pm.name;
    methodDId = pm.dId;
  }
  if (!method) throw new InputError('Choose how the payment was made');
  return {
    dId: generateDId(),
    method,
    payment_method_dId: methodDId,
    amount,
    transaction_reference: String(raw?.transaction_reference || '').trim().slice(0, 120),
    paid_at: raw?.paid_at ? new Date(raw.paid_at).toISOString() : nowIso(),
    note: String(raw?.note || '').trim().slice(0, 300),
  };
};

// Recomputes subtotal, total, paid amount and payment status
const recalc = (p: IPurchase) => {
  p.subtotal = roundMoney(p.lines.reduce((s, l) => s + l.total, 0));
  p.discount = roundMoney(Math.max(0, Number(p.discount) || 0));
  p.shipping = roundMoney(Math.max(0, Number(p.shipping) || 0));
  p.total = roundMoney(Math.max(0, p.subtotal - p.discount + p.shipping));
  p.paid_amount = roundMoney(p.payments.reduce((s, x) => s + x.amount, 0));
  if (p.paid_amount > p.total + 0.009) throw new InputError(`Paid (${p.paid_amount}) is more than the total (${p.total})`);
  p.payment_status = p.paid_amount <= 0 ? 'PENDING' : p.paid_amount + 0.009 >= p.total ? 'PAID' : 'PARTIAL';
};

// Loads Surokkha's items for validation; null when Surokkha cannot be reached (lines are then trusted as sent)
const loadCatalog = async (required: boolean) => {
  try {
    const items: any[] = await fetchSurokkhaStockItems();
    return new Map(items.map((i) => [String(i.id), i]));
  } catch (err: any) {
    if (required) throw new InputError(`Could not check items with Surokkha: ${err?.message || err}`);
    return null;
  }
};

// Copies vendor details onto the purchase from a saved vendor or the typed name
const applyVendor = async (p: any, body: any) => {
  if (body.vendor_id) {
    const v: any = await getVendorModel().findOne({ dId: String(body.vendor_id) }).lean();
    if (!v) throw new InputError('Vendor not found');
    p.vendor_dId = v.dId;
    p.vendor_name = v.name;
    p.vendor_phone = v.phone || '';
    p.vendor_email = v.email || '';
    return;
  }
  if (body.vendor_name !== undefined) {
    const name = String(body.vendor_name || '').trim();
    if (!name) throw new InputError('Vendor is required');
    p.vendor_dId = undefined;
    p.vendor_name = name.slice(0, 120);
  }
  if (body.vendor_phone !== undefined) p.vendor_phone = String(body.vendor_phone || '').trim().slice(0, 30);
  if (body.vendor_email !== undefined) p.vendor_email = String(body.vendor_email || '').trim().slice(0, 120);
};

// Saves the purchase, then keeps its bill and Surokkha's stock in step
const persist = async (p: any, stockChanged: boolean) => {
  if (stockChanged) queueStockSync(p, p.status === 'CANCELLED' ? 'cancel' : 'apply');
  p.updated_at = nowIso();
  await p.save();
  const bill: any = await upsertPurchaseBill(p);
  if (bill && (p.bill_dId !== bill.dId || p.bill_number !== bill.bill_number)) {
    p.bill_dId = bill.dId;
    p.bill_number = bill.bill_number;
    await p.save();
  }
  if (stockChanged) return syncPurchaseStock(p.dId);
  return p;
};

// Units per item, for spotting changes that affect stock
const stockKey = (lines: any[]) =>
  JSON.stringify(
    [...lines]
      .map((l) => [String(l.stock_item_id), Number(l.units), Number(l.total)])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])) || Number(a[1]) - Number(b[1]))
  );

// GET /purchases — list with status / vendor / text filters
export const getPurchases = async (req: AuthedRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.status) filter.status = String(req.query.status).toUpperCase();
    if (req.query.vendor) filter.vendor_dId = String(req.query.vendor);
    if (req.query.sync) filter['sync.status'] = String(req.query.sync);
    const q = String(req.query.q || '').trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ purchase_number: rx }, { vendor_name: rx }, { 'lines.short_name': rx }];
    }
    const data = await getPurchaseModel().find(filter).sort({ created_at: -1 }).limit(500).lean();
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, err, 'Failed to load purchases');
  }
};

// GET /purchases/:id
export const getPurchaseById = async (req: AuthedRequest, res: Response) => {
  try {
    const data = await getPurchaseModel().findOne(byIdQuery(req.params.id)).lean();
    if (!data) return res.status(404).json({ success: false, message: 'Purchase not found' });
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, err, 'Failed to load purchase');
  }
};

// POST /purchases — records a purchase as draft, ordered or already received
export const createPurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const status: PurchaseStatus = OPEN_STATUSES.includes(body.status) ? body.status : 'DRAFT';
    const catalog = await loadCatalog(false);
    const Purchase = getPurchaseModel();
    const p: any = new Purchase({
      purchase_number: await nextPurchaseNumber(),
      status,
      order_date: body.order_date ? new Date(body.order_date).toISOString() : nowIso(),
      received_date: status === 'RECEIVED' ? (body.received_date ? new Date(body.received_date).toISOString() : nowIso()) : undefined,
      discount: body.discount,
      shipping: body.shipping,
      notes: String(body.notes || '').slice(0, 1000),
      created_by: req.auth?.email,
      payments: [],
    });
    await applyVendor(p, body);
    if (!p.vendor_name) throw new InputError('Vendor is required');
    p.lines = buildLines(body.lines, catalog);
    for (const raw of Array.isArray(body.payments) ? body.payments : []) p.payments.push(await buildPayment(raw));
    recalc(p);
    const saved = await persist(p, status === 'RECEIVED');
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to create purchase');
  }
};

// PUT /purchases/:id — edits vendor, lines, dates, discount/shipping or moves draft → ordered → received
export const updatePurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    if (p.status === 'CANCELLED') throw new InputError('A cancelled purchase cannot be edited');

    const before = stockKey(p.lines);
    const wasReceived = p.status === 'RECEIVED';
    if (body.status !== undefined) {
      if (!OPEN_STATUSES.includes(body.status)) throw new InputError('Use cancel to cancel a purchase');
      if (wasReceived && body.status !== 'RECEIVED') throw new InputError('A received purchase cannot go back; cancel it instead');
      p.status = body.status;
    }
    await applyVendor(p, body);
    if (body.lines !== undefined) p.lines = buildLines(body.lines, await loadCatalog(false), new Set(p.lines.map((l: any) => String(l.stock_item_id))));
    if (body.order_date) p.order_date = new Date(body.order_date).toISOString();
    if (p.status === 'RECEIVED') p.received_date = body.received_date ? new Date(body.received_date).toISOString() : p.received_date || nowIso();
    if (body.discount !== undefined) p.discount = body.discount;
    if (body.shipping !== undefined) p.shipping = body.shipping;
    if (body.notes !== undefined) p.notes = String(body.notes || '').slice(0, 1000);
    recalc(p);

    const stockChanged = p.status === 'RECEIVED' && (!wasReceived || stockKey(p.lines) !== before);
    const saved = await persist(p, stockChanged);
    return res.json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to update purchase');
  }
};

// POST /purchases/:id/receive — goods arrived: adds the units to Surokkha stock
export const receivePurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    if (p.status === 'CANCELLED') throw new InputError('A cancelled purchase cannot be received');
    if (p.status === 'RECEIVED') return res.json({ success: true, data: p });
    p.status = 'RECEIVED';
    p.received_date = req.body?.received_date ? new Date(req.body.received_date).toISOString() : nowIso();
    recalc(p);
    const saved = await persist(p, true);
    return res.json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to receive purchase');
  }
};

// POST /purchases/:id/payments — records money paid to the vendor; the bill's paid amount follows
export const addPurchasePayment = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    if (p.status === 'CANCELLED') throw new InputError('A cancelled purchase cannot take payments');
    p.payments.push(await buildPayment(req.body));
    recalc(p);
    const saved = await persist(p, false);
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to add payment');
  }
};

// DELETE /purchases/:id/payments/:paymentId — removes a payment entered by mistake
export const removePurchasePayment = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    if (p.status === 'CANCELLED') throw new InputError('A cancelled purchase cannot be changed');
    const count = p.payments.length;
    p.payments = p.payments.filter((x: any) => x.dId !== req.params.paymentId);
    if (p.payments.length === count) return res.status(404).json({ success: false, message: 'Payment not found' });
    recalc(p);
    const saved = await persist(p, false);
    return res.json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to remove payment');
  }
};

// POST /purchases/:id/cancel — cancels the purchase, takes received units back out and removes the bill
export const cancelPurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    if (p.status === 'CANCELLED') return res.json({ success: true, data: p });
    const touchedStock = p.status === 'RECEIVED' || (p.sync?.version || 0) > 0;
    p.status = 'CANCELLED';
    if (req.body?.reason) p.notes = `${p.notes ? `${p.notes}\n` : ''}Cancelled: ${String(req.body.reason).slice(0, 300)}`;
    const saved = await persist(p, touchedStock);
    return res.json({ success: true, data: saved });
  } catch (err) {
    return fail(res, err, 'Failed to cancel purchase');
  }
};

// POST /purchases/:id/resync — pushes stock to Surokkha again and refreshes the bill
export const resyncPurchase = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    const needsStock = p.status === 'RECEIVED' || (p.status === 'CANCELLED' && (p.sync?.version || 0) > 0);
    if (needsStock && !p.sync?.action) p.sync.action = p.status === 'CANCELLED' ? 'cancel' : 'apply';
    if (needsStock) {
      p.sync.status = 'pending';
      p.sync.attempts = 0;
      p.markModified('sync');
    }
    const saved = await persist(p, false);
    const synced = needsStock ? await syncPurchaseStock(p.dId) : saved;
    return res.json({ success: true, data: synced });
  } catch (err) {
    return fail(res, err, 'Failed to resync purchase');
  }
};

// GET /purchases/:id/sync-check — compares this purchase with what Surokkha holds
export const checkPurchaseSync = async (req: AuthedRequest, res: Response) => {
  try {
    const p: any = await getPurchaseModel().findOne(byIdQuery(req.params.id)).lean();
    if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
    const remote: any = await fetchSurokkhaReceipt(p);
    const expected = p.status === 'RECEIVED' ? p.lines : [];
    const remoteLines = remote && remote.status !== 'cancelled' ? remote.lines : [];
    const want = new Map<string, number>();
    expected.forEach((l: any) => want.set(String(l.stock_item_id), (want.get(String(l.stock_item_id)) || 0) + l.units));
    const have = new Map<string, number>();
    remoteLines.forEach((l: any) => have.set(String(l.stockItemId), (have.get(String(l.stockItemId)) || 0) + l.units));
    const keys = [...new Set([...want.keys(), ...have.keys()])];
    const differences = keys
      .map((k) => ({ stock_item_id: k, plexivia_units: want.get(k) || 0, surokkha_units: have.get(k) || 0 }))
      .filter((d) => d.plexivia_units !== d.surokkha_units);
    return res.json({ success: true, data: { in_sync: differences.length === 0, differences, surokkha: remote } });
  } catch (err: any) {
    return res.status(502).json({ success: false, message: err?.message || 'Could not reach Surokkha' });
  }
};

// POST /purchases/resync-all — retries every pending or failed stock sync now
export const resyncAllPurchases = async (req: AuthedRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await retryPurchaseSyncs(`MANUAL:${req.auth?.email || 'user'}`) });
  } catch (err) {
    return fail(res, err, 'Failed to retry syncs');
  }
};

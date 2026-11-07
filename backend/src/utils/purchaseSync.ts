import { Cron } from 'croner';
import { getBillModel } from '../models/Finance.js';
import { roundMoney } from '../models/Accounts.js';
import { getPurchaseModel, IPurchase } from '../models/Purchase.js';
import { nextBillNumber } from '../controllers/accountingController.js';
import { getSurokkhaConfig, resolveSurokkhaAsset } from './surokkhaBillImport.js';
import { notify } from './realtime.js';

export const PURCHASE_BILL_TYPE = 'Product Purchase';
const RETRY_CRON = '*/15 * * * *';
const TIMEZONE = 'Asia/Dhaka';
const MAX_AUTO_ATTEMPTS = 20;
const REQUEST_TIMEOUT_MS = 15000;
let retryJob: Cron | null = null;

// Stable reference shared by the purchase, its bill and Surokkha's stock receipt
export const purchaseRef = (p: Pick<IPurchase, 'dId'>) => `plexivia-purchase:${p.dId}`;

// Connection to Surokkha from Settings → Integrations; throws a readable error while it is not set up
const surokkhaConnection = async () => {
  const cfg = await getSurokkhaConfig();
  if (!cfg.enabled || !cfg.baseUrl || !cfg.key) {
    throw new Error('Surokkha is not connected. Set the API URL and sync key in Settings → Integrations.');
  }
  return cfg;
};

// Calls a Surokkha /plexivia endpoint with the shared key; returns its data, or the whole reply when raw is set
export const callSurokkha = async (path: string, init: { method?: string; body?: any; actor?: string; raw?: boolean } = {}) => {
  const cfg = await surokkhaConnection();
  const res = await fetch(`${cfg.baseUrl}/plexivia${path}`, {
    method: init.method || 'GET',
    headers: {
      'x-plexivia-key': cfg.key,
      ...(init.actor ? { 'x-plexivia-actor': init.actor } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok || !body?.success) {
    const err: any = new Error(body?.message || `Surokkha responded ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return init.raw ? body : body.data;
};

// Active Surokkha stock items for the purchase form
export const fetchSurokkhaStockItems = () => callSurokkha('/stock-items');

// What Surokkha currently holds for one purchase, or null when it has nothing
export const fetchSurokkhaReceipt = async (p: Pick<IPurchase, 'dId'>) => {
  try {
    return await callSurokkha(`/stock-receipts/${encodeURIComponent(purchaseRef(p))}`);
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
};

// Payload Surokkha's stock receipt endpoint expects
const receiptPayload = (p: IPurchase) => ({
  externalRef: purchaseRef(p),
  version: p.sync?.version || 1,
  purchaseNumber: p.purchase_number,
  vendorName: p.vendor_name,
  vendorPhone: p.vendor_phone || '',
  receivedAt: p.received_date || new Date().toISOString(),
  notes: p.notes || '',
  lines: p.lines.map((l) => ({
    stockItemId: l.stock_item_id,
    packLabel: l.pack_label || '',
    packs: l.packs,
    unitsPerPack: l.units_per_pack,
    unitCost: l.unit_cost,
    total: l.total,
  })),
});

// Pushes the purchase's current stock state to Surokkha and records the outcome on the purchase
export const syncPurchaseStock = async (purchaseDId: string) => {
  const Purchase = getPurchaseModel();
  const p = await Purchase.findOne({ dId: purchaseDId });
  if (!p) throw new Error('Purchase not found');
  const action = p.sync?.action;
  if (!action) return p;
  try {
    if (action === 'apply') {
      await callSurokkha('/stock-receipts', { method: 'POST', body: receiptPayload(p) });
    } else {
      await callSurokkha(`/stock-receipts/${encodeURIComponent(purchaseRef(p))}/cancel`, {
        method: 'POST',
        body: { version: p.sync.version, note: `${p.purchase_number} cancelled in Plexivia` },
      });
    }
    p.sync.status = 'synced';
    p.sync.last_error = undefined;
    p.sync.synced_at = new Date().toISOString();
  } catch (err: any) {
    p.sync.status = 'failed';
    p.sync.last_error = String(err?.message || err).slice(0, 300);
  }
  p.sync.attempts = (p.sync.attempts || 0) + 1;
  p.markModified('sync');
  await p.save();
  return p;
};

// Marks the purchase as needing a stock push (apply or cancel) with a new version number
export const queueStockSync = (p: IPurchase, action: 'apply' | 'cancel') => {
  p.sync = {
    status: 'pending',
    action,
    version: (p.sync?.version || 0) + 1,
    attempts: 0,
    last_error: undefined,
    synced_at: p.sync?.synced_at,
  };
  p.markModified('sync');
};

// Short line text for the bill, e.g. "MO × 5 Packet (50 pcs)"
const lineLabel = (l: IPurchase['lines'][number]) =>
  l.units_per_pack > 1
    ? `${l.short_name} × ${l.packs} ${l.pack_label || 'pack'} (${l.units} ${l.unit || 'pcs'})`
    : `${l.short_name} × ${l.units} ${l.unit || 'pcs'}`;

// Keeps one "Product Purchase" bill in step with the purchase; cancelled purchases remove it from the books
export const upsertPurchaseBill = async (p: IPurchase) => {
  const Bill = getBillModel();
  const ref = purchaseRef(p);
  const existing: any = await Bill.findOne({ external_ref: ref }).setOptions({ withInactive: true });

  if (p.status === 'CANCELLED' || p.status === 'DRAFT') {
    if (existing && existing.is_active !== false) {
      existing.is_active = false;
      existing.deleted_at = new Date().toISOString();
      existing.notes = `${existing.notes || ''}\n${p.status === 'CANCELLED' ? 'Purchase cancelled' : 'Purchase moved back to draft'} ${new Date().toISOString().slice(0, 10)}`.trim();
      await existing.save();
    }
    return existing;
  }

  const cfg = await getSurokkhaConfig().catch(() => ({ projectDId: '' }) as any);
  const asset = await resolveSurokkhaAsset(cfg.projectDId).catch(() => null);
  const total = roundMoney(p.total);
  const paid = roundMoney(Math.min(total, p.paid_amount));
  const methods = [...new Set(p.payments.map((x) => x.method).filter(Boolean))];
  const lineItems = [
    ...p.lines.map((l) => ({ label: lineLabel(l), quantity: l.units, amount: roundMoney(l.total) })),
    ...(p.shipping ? [{ label: 'Shipping / carrying', quantity: 1, amount: roundMoney(p.shipping) }] : []),
    ...(p.discount ? [{ label: 'Discount', quantity: 1, amount: -roundMoney(p.discount) }] : []),
  ];
  const fields: Record<string, any> = {
    title: `Purchase ${p.purchase_number} - ${p.vendor_name}`,
    bill_type: PURCHASE_BILL_TYPE,
    vendor_name: p.vendor_name,
    category: 'OTHER',
    amount: total,
    base_amount: total,
    charges: [],
    charge_total: 0,
    paid_amount: paid,
    status: paid >= total && total > 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING',
    payment_method: methods.length === 1 ? methods[0] : methods.length > 1 ? 'Multiple' : undefined,
    payment_method_dId: methods.length === 1 ? p.payments.find((x) => x.method === methods[0])?.payment_method_dId : undefined,
    billing_date: p.received_date || p.order_date,
    line_items: lineItems,
    project_dId: asset?.dId || cfg.projectDId || undefined,
    project_name: asset?.name || asset?.project_name || 'Surokkha',
    client_dId: asset?.client_dId || undefined,
    notes: [
      `Product purchase ${p.purchase_number} (${p.status.toLowerCase()})`,
      p.vendor_phone ? `Vendor phone: ${p.vendor_phone}` : '',
      ...p.payments.map((x) => `Paid ${roundMoney(x.amount)} via ${x.method}${x.transaction_reference ? ` (${x.transaction_reference})` : ''} on ${String(x.paid_at).slice(0, 10)}`),
      p.notes || '',
    ]
      .filter(Boolean)
      .join('\n'),
    is_active: true,
    deleted_at: undefined,
  };

  if (existing) {
    existing.set(fields);
    await existing.save();
    return existing;
  }
  return Bill.create({ ...fields, bill_number: await nextBillNumber(), external_ref: ref });
};

// Pushes every purchase whose stock sync is pending or failed; owners hear about new failures
export const retryPurchaseSyncs = async (trigger = 'SCHEDULER_CRON') => {
  const cfg = await getSurokkhaConfig();
  if (!cfg.enabled || !cfg.baseUrl || !cfg.key) return { tried: 0, synced: 0, failed: 0 };
  const due = await getPurchaseModel()
    .find({ 'sync.status': { $in: ['pending', 'failed'] }, 'sync.attempts': { $lt: MAX_AUTO_ATTEMPTS } })
    .select('dId purchase_number')
    .sort({ updated_at: 1 })
    .limit(50)
    .lean();
  let synced = 0;
  const failed: string[] = [];
  for (const row of due) {
    const p = await syncPurchaseStock(row.dId);
    if (p.sync.status === 'synced') synced += 1;
    else failed.push(row.purchase_number);
  }
  if (failed.length && trigger === 'SCHEDULER_CRON') {
    await notify({
      type: 'purchase_sync_failed',
      audience: 'owner',
      title: 'Purchase stock sync to Surokkha failed',
      description: `${failed.slice(0, 5).join(', ')}${failed.length > 5 ? ` +${failed.length - 5} more` : ''}`,
      link: '/accounts/purchases',
    }).catch(() => {});
  }
  return { tried: due.length, synced, failed: failed.length };
};

// Starts the 15-minute catch-up job for purchases Surokkha has not confirmed yet
export const initPurchaseSyncScheduler = () => {
  retryJob?.stop();
  retryJob = new Cron(RETRY_CRON, { timezone: TIMEZONE, protect: true, name: 'purchase-stock-sync' }, () => {
    retryPurchaseSyncs('SCHEDULER_CRON').catch((err) => console.error('❌ [PurchaseSync]', err?.message || err));
  });
  console.log(`📦 [PurchaseSync] Stock sync retry scheduled, next run ${retryJob.nextRun()?.toISOString()}`);
};

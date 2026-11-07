import { Cron } from 'croner';
import { getBillModel, getPaymentModel, getPaymentSourceModel } from '../models/Finance.js';
import { getBusinessModel, nextMoneyReceiptNumber } from '../models/Accounts.js';
import { getProjectModel } from '../models/Agency.js';
import { getWhiteLabelEcommerceModel } from '../models/WhiteLabelEcommerce.js';
import { getOrCreateAppSettings } from '../models/Settings.js';
import { decryptText } from './security.js';
import { logSurokkhaSync } from '../models/SurokkhaSyncLog.js';
import { notify } from './realtime.js';

// Surokkha store's daily bills arrive as one Plexivia bill on the Surokkha asset
const IMPORT_CRON = '0 3 * * *';
const TIMEZONE = 'Asia/Dhaka';
// Days re-checked on every run, so a missed night fills itself in
const CATCH_UP_DAYS = 7;
let importJob: Cron | null = null;

// Connection comes from Settings → Integrations (database), never from .env.
// The API URL may be overridden by SUROKKHA_API_URL for local testing only.
export const getSurokkhaConfig = async () => {
  const sk: any = (await getOrCreateAppSettings()).integrations?.surokkha || {};
  return {
    enabled: Boolean(sk.enabled),
    baseUrl: (sk.api_url || process.env.SUROKKHA_API_URL || '').replace(/\/+$/, ''),
    key: sk.key_enc ? decryptText(sk.key_enc) : '',
    projectDId: process.env.SUROKKHA_PROJECT_DID || '',
    businessDId: process.env.SUROKKHA_BUSINESS_DID || '',
  };
};
const NOT_CONFIGURED = 'Surokkha is not connected. Set the API URL and sync key in Settings → Integrations.';
const assertConfigured = (cfg: { enabled: boolean; baseUrl: string; key: string }) => {
  if (!cfg.enabled || !cfg.baseUrl || !cfg.key) throw new Error(NOT_CONFIGURED);
};

// Bangladesh calendar day `offset` days from today
const bdDay = (offset: number) => new Date(Date.now() + 6 * 3600000 + offset * 86400000).toISOString().slice(0, 10);

const refFor = (day: string) => `surokkha-daily:${day}`;

// Pull one day's summary from Surokkha and store it as a single bill; skips days already imported
export const importSurokkhaDay = async (day: string, { syncPathao = true } = {}) => {
  const cfg = await getSurokkhaConfig();
  assertConfigured(cfg);

  const BillModel = getBillModel();
  if (await BillModel.exists({ external_ref: refFor(day) })) return { day, status: 'already imported' };

  const url = `${cfg.baseUrl}/plexivia/daily-bill-summary?date=${day}&sync=${syncPathao}`;
  const res = await fetch(url, { headers: { 'x-plexivia-key': cfg.key } });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok || !body?.success) throw new Error(body?.message || `Surokkha responded ${res.status}`);

  const summary = body.data;
  if (!summary.bills_count) return { day, status: 'no bills' };

  // The asset is a regular project or, for Surokkha, a white-label store
  const project: any = cfg.projectDId
    ? (await getProjectModel().findOne({ $or: [{ dId: cfg.projectDId }, { id: cfg.projectDId }] }).lean()) ||
      (await getWhiteLabelEcommerceModel()
        .findOne({ dId: cfg.projectDId })
        .lean()
        .then((w) => w && { dId: w.dId, name: w.name, client_dId: w.clientDId || undefined }))
    : null;
  const total = Number(summary.total) || 0;
  const paid = Math.min(total, Number(summary.paid) || 0);

  await BillModel.create({
    bill_number: `SRK-${day}`,
    external_ref: refFor(day),
    title: `Surokkha daily bills - ${day}`,
    bill_type: 'Daily Summary',
    vendor_name: 'Surokkha Store',
    category: 'OTHER',
    amount: total,
    paid_amount: paid,
    status: paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING',
    billing_date: `${day}T00:00:00.000+06:00`,
    project_dId: project?.dId || cfg.projectDId || undefined,
    project_name: project?.name || project?.project_name || 'Surokkha',
    client_dId: project?.client_dId || undefined,
    client_name: project?.client_name || undefined,
    line_items: summary.line_items || [],
    notes: `Imported from Surokkha (${summary.bills_count} bills). Pathao sync: ${summary.pathao_sync}.`,
  });
  return { day, status: 'imported', total };
};

const paymentRefFor = (day: string) => `surokkha-payments:${day}`;
const money = (n: number) => `৳${(Number(n) || 0).toLocaleString('en-IN')}`;

// The Surokkha business in Plexivia: SUROKKHA_BUSINESS_DID, else the business named "Surokkha…"
const findSurokkhaBusiness = async (businessDId: string): Promise<any> => {
  const Business = getBusinessModel();
  if (businessDId) return Business.findOne({ dId: businessDId }).lean();
  return Business.findOne({ name: /surokkha/i }).lean();
};

/**
 * One day's money received by Surokkha, recorded as ONE Plexivia payment from the business.
 * The order-by-order breakdown goes into the payment's notes as plain text.
 */
export const importSurokkhaPaymentsDay = async (day: string) => {
  const cfg = await getSurokkhaConfig();
  assertConfigured(cfg);

  const PaymentModel = getPaymentModel();
  if (await PaymentModel.exists({ external_ref: paymentRefFor(day) })) return { day, status: 'already imported' };

  const res = await fetch(`${cfg.baseUrl}/plexivia/daily-payment-summary?date=${day}`, { headers: { 'x-plexivia-key': cfg.key } });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok || !body?.success) throw new Error(body?.message || `Surokkha responded ${res.status}`);

  const summary = body.data;
  const orders: any[] = summary.orders || [];
  if (!orders.length) return { day, status: 'no payments' };

  const business = await findSurokkhaBusiness(cfg.businessDId);
  if (!business) throw new Error('Surokkha business not found in Accounts → Businesses (set SUROKKHA_BUSINESS_DID)');
  const source: any = await getPaymentSourceModel().findOne({ link_type: 'business', status: { $ne: 'Inactive' } }).lean();

  const total = Math.round(orders.reduce((acc, o) => acc + (Number(o.paid) || 0), 0) * 100) / 100;
  const byMethod = new Map<string, number>();
  orders.forEach((o) => byMethod.set(o.method || 'Other', (byMethod.get(o.method || 'Other') || 0) + (Number(o.paid) || 0)));

  // Plain-text breakdown: which order paid how much
  const details = [
    `Surokkha Store — payments received on ${day}`,
    `Business: ${business.name} · Orders: ${orders.length} · Total: ${money(total)}`,
    `By method: ${[...byMethod].map(([m, v]) => `${m} ${money(v)}`).join(', ')}`,
    '',
    ...orders.map(
      (o, i) =>
        `${i + 1}. #${o.order_number || '—'} · ${o.customer || 'Customer'}${o.phone ? ` (${o.phone})` : ''} · ${money(o.paid)}` +
        `${o.order_total && o.order_total !== o.paid ? ` of ${money(o.order_total)}` : ''} · ${o.method || ''}` +
        `${o.transaction_id ? ` · TrxID ${o.transaction_id}` : ''}${o.items ? `\n   ${o.items}` : ''}`
    ),
  ].join('\n');

  await PaymentModel.create({
    payment_number: `SRK-PAY-${day.replace(/-/g, '')}`,
    external_ref: paymentRefFor(day),
    // Always fully paid business revenue, so it gets a Money Receipt serial, e.g. 26MR001
    invoice_id: await nextMoneyReceiptNumber(new Date(`${day}T12:00:00+06:00`)),
    payment_source_dId: source?.dId,
    payment_source_name: source?.name || 'Business',
    business_dId: business.dId,
    business_name: business.name,
    payer_name: business.name,
    total_amount: total,
    amount: total,
    net_amount: total,
    charges: [],
    charge_total: 0,
    payment_method: byMethod.size === 1 ? [...byMethod.keys()][0] : 'Multiple',
    status: 'SUCCESS',
    notes: details,
    paid_at: `${day}T23:59:00.000+06:00`,
  });
  return { day, status: 'imported', total, orders: orders.length };
};

// Import both bills and payments for one day, logging each result for the dashboard
export const syncSurokkhaDay = async (day: string, trigger: string, { syncPathao = true } = {}) => {
  const out: any = { day };
  try {
    const r = await importSurokkhaDay(day, { syncPathao });
    out.bills = r;
    await logSurokkhaSync({ day, kind: 'bills', status: r.status as any, total: (r as any).total, trigger });
  } catch (err: any) {
    out.bills = { day, status: 'failed', error: err.message };
    await logSurokkhaSync({ day, kind: 'bills', status: 'failed', error: err.message, trigger });
  }
  try {
    const r = await importSurokkhaPaymentsDay(day);
    out.payments = r;
    await logSurokkhaSync({ day, kind: 'payments', status: r.status as any, total: (r as any).total, count: (r as any).orders, trigger });
  } catch (err: any) {
    out.payments = { day, status: 'failed', error: err.message };
    await logSurokkhaSync({ day, kind: 'payments', status: 'failed', error: err.message, trigger });
  }
  return out;
};

// Import every missing day of the last week, oldest first; Pathao is synced once for the newest day.
// Owners get one notification summing up what came in (or what failed).
export const runSurokkhaImport = async (trigger: string) => {
  const cfg = await getSurokkhaConfig();
  if (!cfg.enabled || !cfg.baseUrl || !cfg.key) return; // not connected yet: nothing to do
  const results: any[] = [];
  for (let offset = CATCH_UP_DAYS; offset >= 1; offset -= 1) {
    results.push(await syncSurokkhaDay(bdDay(-offset), trigger, { syncPathao: offset === 1 }));
  }
  const imported = results.filter((r) => r.payments?.status === 'imported');
  const failed = results.filter((r) => r.payments?.status === 'failed' || r.bills?.status === 'failed');
  if (imported.length) {
    const total = imported.reduce((acc, r) => acc + (Number(r.payments.total) || 0), 0);
    const orders = imported.reduce((acc, r) => acc + (Number(r.payments.orders) || 0), 0);
    console.log(`💰 [SurokkhaImport] ${trigger}: ${imported.length} day(s), ৳${total}, ${orders} orders`);
    await notify({
      type: 'surokkha_sync',
      audience: 'owner',
      title: `Surokkha: ৳${total.toLocaleString('en-IN')} payment added`,
      description: `${imported.map((r) => r.day).join(', ')} · ${orders} orders`,
      link: '/settings/integrations',
    });
  }
  if (failed.length) {
    const reason = failed[0].payments?.error || failed[0].bills?.error || 'unknown error';
    console.error(`❌ [SurokkhaImport] ${trigger}: ${failed.length} day(s) failed: ${reason}`);
    await notify({
      type: 'surokkha_sync_failed',
      audience: 'owner',
      title: 'Surokkha sync failed',
      description: `${failed.map((r) => r.day).join(', ')}: ${reason}`,
      link: '/settings/integrations',
    });
  }
};

// Start the nightly 3 AM (Dhaka) import; does nothing until Surokkha is configured
export const getSurokkhaNextRun = () => importJob?.nextRun()?.toISOString() || null;

export const initSurokkhaImportScheduler = () => {
  // Always scheduled; each run checks Settings → Integrations and skips while Surokkha is not connected
  importJob?.stop();
  importJob = new Cron(IMPORT_CRON, { timezone: TIMEZONE, protect: true, name: 'surokkha-import' }, () => runSurokkhaImport('SCHEDULER_CRON'));
  console.log(`🧾 [SurokkhaImport] Daily import scheduled, next run ${importJob.nextRun()?.toISOString()}`);
};

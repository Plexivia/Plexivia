import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth.js';
import { getOrCreateAppSettings, getAppSettingsModel } from '../models/Settings.js';
import { encryptText } from '../utils/security.js';
import { getSurokkhaConfig, getSurokkhaNextRun, syncSurokkhaDay } from '../utils/surokkhaBillImport.js';
import { getSurokkhaSyncLogModel } from '../models/SurokkhaSyncLog.js';
import { getPaymentModel, getBillModel } from '../models/Finance.js';

const ok = (res: Response, data: any, message?: string) => res.json({ success: true, ...(message ? { message } : {}), data });
const fail = (res: Response, code: number, message: string) => res.status(code).json({ success: false, message });

// Bangladesh calendar day `offset` days from today
const bdDay = (offset: number) => new Date(Date.now() + 6 * 3600000 + offset * 86400000).toISOString().slice(0, 10);

// The key itself is never sent back — only a hint of its last characters
const toView = (sk: any = {}) => ({
  enabled: Boolean(sk.enabled),
  apiUrl: sk.api_url || '',
  hasKey: Boolean(sk.key_enc),
  keyHint: sk.key_hint || '',
  keyUpdatedAt: sk.key_updated_at || null,
  lastTestAt: sk.last_test_at || null,
  lastTestOk: sk.last_test_ok ?? null,
  lastTestMessage: sk.last_test_message || '',
  nextRunAt: getSurokkhaNextRun(),
});

// GET /integrations/surokkha
export const getSurokkhaIntegration = async (_req: AuthedRequest, res: Response) => {
  const settings = await getOrCreateAppSettings();
  return ok(res, toView(settings.integrations?.surokkha));
};

// PUT /integrations/surokkha  { enabled, apiUrl, key? } — a new key replaces the old one immediately
export const updateSurokkhaIntegration = async (req: AuthedRequest, res: Response) => {
  const body = req.body || {};
  const set: Record<string, any> = { 'integrations.surokkha.enabled': Boolean(body.enabled), updated_at: new Date().toISOString() };
  if (body.apiUrl !== undefined) {
    const url = String(body.apiUrl || '').trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\/.+/i.test(url)) return fail(res, 400, 'API URL must start with http:// or https://');
    set['integrations.surokkha.api_url'] = url;
  }
  const key = String(body.key || '').trim();
  if (key) {
    if (key.length < 32) return fail(res, 400, 'Key must be at least 32 characters');
    set['integrations.surokkha.key_enc'] = encryptText(key);
    set['integrations.surokkha.key_hint'] = `…${key.slice(-4)}`;
    set['integrations.surokkha.key_updated_at'] = new Date().toISOString();
    set['integrations.surokkha.last_test_at'] = undefined;
    set['integrations.surokkha.last_test_ok'] = undefined;
  }
  await getOrCreateAppSettings();
  const doc: any = await getAppSettingsModel().findOneAndUpdate({ key: 'app' }, { $set: set }, { new: true }).lean();
  return ok(res, toView(doc?.integrations?.surokkha), 'Surokkha connection saved');
};

// POST /integrations/surokkha/test — asks Surokkha whether the keys match
export const testSurokkhaIntegration = async (_req: AuthedRequest, res: Response) => {
  const cfg = await getSurokkhaConfig();
  let okTest = false;
  let message = '';
  if (!cfg.baseUrl || !cfg.key) {
    message = 'Set the API URL and sync key first';
  } else {
    try {
      const r = await fetch(`${cfg.baseUrl}/plexivia/ping`, { headers: { 'x-plexivia-key': cfg.key }, signal: AbortSignal.timeout(10000) });
      const body: any = await r.json().catch(() => ({}));
      okTest = r.ok && Boolean(body?.success);
      message = okTest ? 'Connected — keys match' : r.status === 401 ? 'Keys do not match (or sync is off in Surokkha)' : body?.message || `Surokkha responded ${r.status}`;
    } catch (err: any) {
      message = `Could not reach Surokkha: ${err.message}`;
    }
  }
  const doc: any = await getAppSettingsModel()
    .findOneAndUpdate(
      { key: 'app' },
      { $set: { 'integrations.surokkha.last_test_at': new Date().toISOString(), 'integrations.surokkha.last_test_ok': okTest, 'integrations.surokkha.last_test_message': message } },
      { new: true }
    )
    .lean();
  return res.status(okTest ? 200 : 400).json({ success: okTest, message, data: toView(doc?.integrations?.surokkha) });
};

// GET /integrations/surokkha/status?days=30 — one row per day: what came in, what failed
export const getSurokkhaSyncStatus = async (req: AuthedRequest, res: Response) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
  const list = Array.from({ length: days }, (_, i) => bdDay(-(i + 1)));
  const [payments, bills, logs] = await Promise.all([
    getPaymentModel().find({ external_ref: { $in: list.map((d) => `surokkha-payments:${d}`) } }, { external_ref: 1, amount: 1, dId: 1, invoice_id: 1, notes: 1 }).lean(),
    getBillModel().find({ external_ref: { $in: list.map((d) => `surokkha-daily:${d}`) } }, { external_ref: 1, amount: 1 }).lean(),
    getSurokkhaSyncLogModel().find({ day: { $in: list } }).sort({ at: -1 }).lean(),
  ]);
  const payBy = new Map(payments.map((p: any) => [String(p.external_ref).split(':')[1], p]));
  const billBy = new Map(bills.map((b: any) => [String(b.external_ref).split(':')[1], b]));
  const lastLog = (day: string, kind: string) => logs.find((l: any) => l.day === day && l.kind === kind);

  const rows = list.map((day) => {
    const p: any = payBy.get(day);
    const pLog: any = lastLog(day, 'payments');
    const bLog: any = lastLog(day, 'bills');
    const orders = p ? (String(p.notes || '').match(/Orders: (\d+)/) || [])[1] : undefined;
    return {
      day,
      payment: p
        ? { status: 'imported', amount: p.amount, orders: orders ? Number(orders) : pLog?.count, paymentId: p.dId, invoiceId: p.invoice_id }
        : { status: pLog?.status === 'already imported' ? 'missing' : pLog?.status || 'not run', error: pLog?.error || '' },
      bill: billBy.get(day) ? { status: 'imported', amount: (billBy.get(day) as any).amount } : { status: bLog?.status || 'not run', error: bLog?.error || '' },
      lastRunAt: pLog?.at || bLog?.at || null,
      trigger: pLog?.trigger || bLog?.trigger || '',
    };
  });
  return ok(res, { nextRunAt: getSurokkhaNextRun(), rows });
};

// POST /integrations/surokkha/sync?date=YYYY-MM-DD — import that day now (skips what is already in)
export const syncSurokkhaNow = async (req: AuthedRequest, res: Response) => {
  const date = String(req.query.date || req.body?.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, 'date must be YYYY-MM-DD');
  const result = await syncSurokkhaDay(date, `MANUAL:${req.auth?.email || 'admin'}`);
  const failed = result.payments?.status === 'failed';
  return res.status(failed ? 502 : 200).json({ success: !failed, message: failed ? result.payments.error : undefined, data: result });
};

import { Cron } from 'croner';
import { getBillModel } from '../models/Finance.js';
import { getProjectModel } from '../models/Agency.js';
import { getWhiteLabelEcommerceModel } from '../models/WhiteLabelEcommerce.js';

// Surokkha store's daily bills arrive as one Plexivia bill on the Surokkha asset
const IMPORT_CRON = '0 3 * * *';
const TIMEZONE = 'Asia/Dhaka';
// Days re-checked on every run, so a missed night fills itself in
const CATCH_UP_DAYS = 7;
let importJob: Cron | null = null;

const getConfig = () => ({
  baseUrl: (process.env.SUROKKHA_API_URL || '').replace(/\/+$/, ''),
  key: process.env.SUROKKHA_SYNC_KEY || '',
  projectDId: process.env.SUROKKHA_PROJECT_DID || '',
});

// Bangladesh calendar day `offset` days from today
const bdDay = (offset: number) => new Date(Date.now() + 6 * 3600000 + offset * 86400000).toISOString().slice(0, 10);

const refFor = (day: string) => `surokkha-daily:${day}`;

// Pull one day's summary from Surokkha and store it as a single bill; skips days already imported
export const importSurokkhaDay = async (day: string, { syncPathao = true } = {}) => {
  const cfg = getConfig();
  if (!cfg.baseUrl || !cfg.key) throw new Error('SUROKKHA_API_URL and SUROKKHA_SYNC_KEY must be set');

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

// Import every missing day of the last week, oldest first; Pathao is synced once for the newest day
export const runSurokkhaImport = async (trigger: string) => {
  for (let offset = CATCH_UP_DAYS; offset >= 1; offset -= 1) {
    const day = bdDay(-offset);
    try {
      const result = await importSurokkhaDay(day, { syncPathao: offset === 1 });
      if (result.status === 'imported') console.log(`🧾 [SurokkhaImport] ${trigger}: ${day} imported (৳${result.total})`);
    } catch (err: any) {
      console.error(`❌ [SurokkhaImport] ${trigger}: ${day} failed:`, err.message);
    }
  }
};

// Start the nightly 3 AM (Dhaka) import; does nothing until Surokkha is configured
export const initSurokkhaImportScheduler = () => {
  const cfg = getConfig();
  if (!cfg.baseUrl || !cfg.key) {
    console.warn('⚠️ [SurokkhaImport] Not scheduled: SUROKKHA_API_URL / SUROKKHA_SYNC_KEY not set');
    return;
  }
  importJob?.stop();
  importJob = new Cron(IMPORT_CRON, { timezone: TIMEZONE, protect: true, name: 'surokkha-import' }, () => runSurokkhaImport('SCHEDULER_CRON'));
  console.log(`🧾 [SurokkhaImport] Daily import scheduled, next run ${importJob.nextRun()?.toISOString()}`);
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Database,
  CloudUpload,
  PlugZap,
  Save,
  KeyRound,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  HardDrive,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import * as SwitchUi from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/error-handler';
import { formatDateTime } from '@/utils/dateHelper';
import { useToast } from '@/context/ToastContext';

// The JSX switch carries no prop types, so treat it as a loosely typed component
const Switch = SwitchUi.Switch as React.FC<any>;

const BASE = '/api/v1/r2-backups';

interface BackupSettings {
  is_enabled: boolean;
  account_id: string;
  access_key_id: string;
  has_secret_access_key: boolean;
  secret_access_key_masked: string;
  has_api_token: boolean;
  api_token_masked: string;
  bucket_name: string;
  backup_enabled: boolean;
  backup_cron: string;
  backup_timezone: string;
  keep_daily_days: number;
  keep_weekly_weeks: number;
  last_test_status: string;
  last_test_message: string;
  last_backup_at: string | null;
  last_backup_status: string;
  last_backup_message: string;
  last_backup_size: string;
  next_backup_at: string | null;
  active_bucket: string;
  configured: boolean;
}

interface BackupRow {
  key: string;
  size: number;
  createdAt: string;
  kind: 'daily' | 'weekly';
  will_be_removed: boolean;
}

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs';
const LABEL_CLASS = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5';
const CARD_CLASS = 'p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs';
const SECONDARY_BTN =
  'flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/70 text-foreground border border-border text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50';
const PRIMARY_BTN =
  'flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all cursor-pointer disabled:opacity-50';

// Format a byte count as KB or MB
const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

const header = (title: string) => ({ column }: any) => <DataTableColumnHeader column={column} title={title} />;

// Render the Cloudflare R2 database backup settings, status and history page
export const BackupsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [backups, setBackups] = useState<BackupRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [newBucket, setNewBucket] = useState('plexivia-backups');

  // Load settings and the backup list from the API
  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const [s, l] = await Promise.all([apiClient.get(`${BASE}/settings`), apiClient.get(`${BASE}/list`)]);
      const data: BackupSettings = s.data.data;
      setSettings(data);
      setForm({ ...data, is_enabled: true, secret_access_key: '', api_token: '' });
      setBackups(l.data.data?.backups || []);
    } catch (err) {
      showToast('error', 'Backups', getApiErrorMessage(err, 'Failed to load backup settings.'));
    } finally {
      setLoadingList(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while a backup is running so the status and list refresh when it finishes
  useEffect(() => {
    if (settings?.last_backup_status !== 'running') return;
    const timer = setTimeout(load, 5000);
    return () => clearTimeout(timer);
  }, [settings, load]);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  // Run an API action with a busy flag and a toast for the outcome
  const run = async (name: string, action: () => Promise<any>, reload = true) => {
    setBusy(name);
    try {
      const res = await action();
      showToast('success', 'R2 Backups', res?.data?.message || 'Done.');
      if (reload) await load();
    } catch (err) {
      showToast('error', 'R2 Backups', getApiErrorMessage(err, 'Request failed.'));
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = () => run('save', () => apiClient.put(`${BASE}/settings`, form));
  const testConnection = () => run('test', () => apiClient.post(`${BASE}/settings/test`, form));
  const backupNow = () => run('backup', () => apiClient.post(`${BASE}/run`));
  const createBucket = () =>
    run('bucket', () =>
      apiClient.post(`${BASE}/bucket`, { bucket_name: newBucket, account_id: form.account_id, api_token: form.api_token })
    );

  // Download one backup archive through the authenticated API
  const download = async (key: string) => {
    setBusy(`dl:${key}`);
    try {
      const res = await apiClient.get(`${BASE}/download`, { params: { key }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || 'backup.ejson.gz';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('error', 'Download Failed', getApiErrorMessage(err, 'Could not download backup.'));
    } finally {
      setBusy(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'file',
        accessorFn: (b: BackupRow) => b.key,
        header: header('Backup File'),
        cell: ({ row }: any) => (
          <span className="flex items-center gap-2 min-w-0">
            <Database className="size-3.5 shrink-0 text-cyan-500" />
            <span className="truncate font-mono text-[11px] text-foreground">{row.original.key.split('/').pop()}</span>
          </span>
        ),
      },
      {
        id: 'created',
        accessorFn: (b: BackupRow) => b.createdAt,
        header: header('Created'),
        cell: ({ getValue }: any) => <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(getValue())}</span>,
      },
      {
        accessorKey: 'size',
        header: header('Size'),
        cell: ({ getValue }: any) => <span className="font-mono text-[11px] font-bold text-foreground">{formatBytes(getValue())}</span>,
      },
      {
        accessorKey: 'kind',
        header: header('Retention'),
        cell: ({ row }: any) =>
          row.original.will_be_removed ? (
            <span className="font-mono text-[11px] font-semibold text-rose-500">Removed on next run</span>
          ) : (
            <span className={`font-mono text-[11px] font-semibold ${row.original.kind === 'daily' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
              {row.original.kind === 'daily' ? 'Daily' : 'Weekly'}
            </span>
          ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }: any) => (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy === `dl:${row.original.key}`}
              onClick={() => download(row.original.key)}
              className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-sky-400 cursor-pointer disabled:opacity-50"
            >
              {busy === `dl:${row.original.key}` ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Download
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy]
  );

  const status = settings?.last_backup_status || 'never';
  const statusTone =
    status === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : status === 'failed'
        ? 'text-rose-600 dark:text-rose-400'
        : status === 'running'
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={HardDrive}
        title="R2 Backups"
        onRefresh={load}
        actions={
          <button onClick={backupNow} disabled={busy === 'backup' || status === 'running' || !settings?.configured} className={PRIMARY_BTN}>
            {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            <span>{status === 'running' ? 'Backing Up...' : 'Backup Now'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Last Backup</span>
            {status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : status === 'failed' ? <XCircle className="w-4 h-4 text-rose-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
          </div>
          <div className={`text-sm font-bold font-mono capitalize ${statusTone}`}>{status}</div>
          <div className="text-[11px] font-mono text-muted-foreground truncate" title={settings?.last_backup_message}>
            {settings?.last_backup_at ? formatDateTime(settings.last_backup_at) : 'No backup yet'}
            {settings?.last_backup_size ? ` • ${settings.last_backup_size}` : ''}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Next Scheduled</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-sm font-bold font-mono text-foreground">
            {settings?.next_backup_at ? formatDateTime(settings.next_backup_at) : 'Not scheduled'}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            {settings?.backup_cron} • {settings?.backup_timezone}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Bucket</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold font-mono text-foreground truncate">{settings?.active_bucket || '—'}</div>
          <div className="text-[11px] font-mono text-muted-foreground">
            {settings?.configured ? 'Credentials saved (encrypted)' : 'Credentials not set'}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Connection</span>
            <PlugZap className="w-4 h-4 text-sky-500" />
          </div>
          <div
            className={`text-sm font-bold font-mono capitalize ${settings?.last_test_status === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : settings?.last_test_status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}
          >
            {settings?.last_test_status || 'untested'}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground truncate" title={settings?.last_test_message}>
            {settings?.last_test_message || 'Run a connection test'}
          </div>
        </div>
      </div>

      {status === 'failed' && settings?.last_backup_message && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{settings.last_backup_message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${CARD_CLASS} lg:col-span-2 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">R2 Credentials & Schedule</h3>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Stored encrypted in database
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Account ID</label>
              <input value={form.account_id || ''} onChange={(e) => set('account_id', e.target.value)} placeholder="Cloudflare account ID" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Bucket Name</label>
              <input value={form.bucket_name || ''} onChange={(e) => set('bucket_name', e.target.value)} placeholder="plexivia-backups" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Access Key ID</label>
              <input value={form.access_key_id || ''} onChange={(e) => set('access_key_id', e.target.value)} placeholder="R2 S3 access key ID" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Secret Access Key</label>
              <input
                type="password"
                value={form.secret_access_key || ''}
                onChange={(e) => set('secret_access_key', e.target.value)}
                placeholder={settings?.has_secret_access_key ? `Saved (${settings.secret_access_key_masked}) — leave blank to keep` : 'R2 S3 secret access key'}
                className={INPUT_CLASS}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>Cloudflare API Token <span className="normal-case font-normal text-slate-400">(used to create buckets)</span></label>
              <input
                type="password"
                value={form.api_token || ''}
                onChange={(e) => set('api_token', e.target.value)}
                placeholder={settings?.has_api_token ? `Saved (${settings.api_token_masked}) — leave blank to keep` : 'Account API token with R2 edit permission'}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Schedule (cron)</label>
              <input value={form.backup_cron || ''} onChange={(e) => set('backup_cron', e.target.value)} placeholder="0 3 * * *" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Timezone</label>
              <input value={form.backup_timezone || ''} onChange={(e) => set('backup_timezone', e.target.value)} placeholder="Asia/Dhaka" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Keep Daily (days)</label>
              <input type="number" min={1} max={60} value={form.keep_daily_days ?? 7} onChange={(e) => set('keep_daily_days', Number(e.target.value))} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Keep Weekly (weeks)</label>
              <input type="number" min={0} max={52} value={form.keep_weekly_weeks ?? 5} onChange={(e) => set('keep_weekly_weeks', Number(e.target.value))} className={INPUT_CLASS} />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 cursor-pointer">
            <span>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Automatic daily backup</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Dumps both Plexivia databases to R2 on the schedule above</span>
            </span>
            <Switch checked={form.backup_enabled !== false} onCheckedChange={(v: boolean) => set('backup_enabled', v)} />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button onClick={testConnection} disabled={busy === 'test'} className={SECONDARY_BTN}>
              {busy === 'test' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />}
              Test Connection
            </button>
            <button onClick={saveSettings} disabled={busy === 'save'} className={PRIMARY_BTN}>
              {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </div>

        <div className={`${CARD_CLASS} space-y-4`}>
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">Create Bucket</h3>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Creates a new private R2 bucket in the Cloudflare account above using the API token, then sets it as the backup bucket.
          </p>
          <div>
            <label className={LABEL_CLASS}>New Bucket Name</label>
            <input value={newBucket} onChange={(e) => setNewBucket(e.target.value.toLowerCase())} className={INPUT_CLASS} />
          </div>
          <button onClick={createBucket} disabled={busy === 'bucket' || !newBucket} className={`${SECONDARY_BTN} w-full justify-center`}>
            {busy === 'bucket' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Create Bucket
          </button>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] leading-relaxed text-sky-700 dark:text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Backups also need an R2 S3 access key and secret that can write to the bucket. Secrets are stored encrypted and never shown again.</span>
          </div>
        </div>
      </div>

      <UnifiedDataTable
        columns={columns}
        data={backups}
        isLoading={loadingList}
        initialSorting={[{ id: 'created', desc: true }]}
        searchPlaceholder="Search backup files..."
        exportFilename="r2-backups"
        emptyTitle={settings?.configured ? 'No backups yet' : 'R2 is not configured yet'}
        emptyDescription={settings?.configured ? 'Run "Backup Now" to create the first one.' : 'Add credentials above, test the connection and save.'}
      />
    </div>
  );
};

export default BackupsPage;

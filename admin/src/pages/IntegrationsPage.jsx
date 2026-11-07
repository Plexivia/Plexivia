import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plug, Wand2, Eye, EyeOff, Copy, Save, PlugZap, RefreshCw, CheckCircle2, XCircle, MinusCircle, Clock, Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatLongDate } from '@/components/dashboard/accounts/RecordQuickView';

// 32 random bytes as 64 hex characters
const generateKey = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const money = (n) => `৳${(Number(n) || 0).toLocaleString('en-IN')}`;
const errMsg = (err, fallback) => err?.response?.data?.message || fallback;

// Day status chip for the sync table
const StatusChip = ({ status }) => {
  const map = {
    imported: { icon: CheckCircle2, label: 'Imported', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    'no payments': { icon: MinusCircle, label: 'No payments', cls: 'bg-muted text-muted-foreground border-border' },
    'no bills': { icon: MinusCircle, label: 'No bills', cls: 'bg-muted text-muted-foreground border-border' },
    failed: { icon: XCircle, label: 'Failed', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
    missing: { icon: XCircle, label: 'Deleted', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  };
  const m = map[status] || { icon: Clock, label: 'Not run', cls: 'bg-muted/50 text-muted-foreground border-border' };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      <Icon className="size-3" /> {m.label}
    </span>
  );
};

// Settings → Integrations: connect Surokkha Store and watch its nightly payment sync
export default function IntegrationsPage() {
  const [conn, setConn] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [syncingDay, setSyncingDay] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);

  const STATUS_DAYS = 60;

  const loadConn = useCallback(async () => {
    const { data } = await apiClient.get('/api/integrations/surokkha');
    setConn(data.data);
    setApiUrl(data.data.apiUrl || '');
  }, []);
  const loadStatus = useCallback(async () => {
    const { data } = await apiClient.get('/api/integrations/surokkha/status', { params: { days: STATUS_DAYS } });
    setStatus(data.data);
  }, []);

  useEffect(() => {
    loadConn().catch((err) => toast.error(errMsg(err, 'Could not load the Surokkha connection')));
    loadStatus().catch(() => {});
  }, [loadConn, loadStatus]);

  const save = async (patch = {}) => {
    setSaving(true);
    try {
      // Saving a new key switches the sync on; the switch itself can still turn it off
      const enabled = patch.enabled ?? (key ? true : Boolean(conn?.enabled));
      const { data } = await apiClient.put('/api/integrations/surokkha', { apiUrl, key, ...patch, enabled });
      setConn(data.data);
      setKey('');
      toast.success(data.message || 'Saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      const { data } = await apiClient.post('/api/integrations/surokkha/test', {});
      setConn(data.data);
      toast.success(data.message);
    } catch (err) {
      if (err?.response?.data?.data) setConn(err.response.data.data);
      toast.error(errMsg(err, 'Connection failed'));
    } finally {
      setTesting(false);
    }
  };

  const syncDay = async (day) => {
    setSyncingDay(day);
    try {
      const { data } = await apiClient.post('/api/integrations/surokkha/sync', { date: day });
      const p = data.data?.payments;
      toast.success(p?.status === 'imported' ? `${formatLongDate(day)}: ${money(p.total)} from ${p.orders} orders` : `${formatLongDate(day)}: ${p?.status}`);
      await loadStatus();
    } catch (err) {
      toast.error(errMsg(err, 'Sync failed'));
      await loadStatus().catch(() => {});
    } finally {
      setSyncingDay('');
    }
  };

  // Walks every day that isn't imported yet (oldest first) and syncs it one at a time —
  // the 7-day nightly catch-up can't reach a backlog this old on its own.
  const syncAll = async () => {
    const pending = rows.filter((r) => r.payment.status !== 'imported').map((r) => r.day).sort();
    if (!pending.length) {
      toast.success('Nothing to sync — every day in range is already imported');
      return;
    }
    setSyncingAll(true);
    let imported = 0;
    let total = 0;
    try {
      for (const day of pending) {
        setSyncingDay(day);
        try {
          const { data } = await apiClient.post('/api/integrations/surokkha/sync', { date: day });
          const p = data.data?.payments;
          if (p?.status === 'imported') {
            imported += 1;
            total += Number(p.total) || 0;
          }
        } catch {
          // Keep going — one bad day shouldn't stop the rest of the backlog
        }
      }
      await loadStatus();
      toast.success(imported ? `Synced ${imported} day(s) · ${money(total)} total` : 'No new payments found in that range');
    } finally {
      setSyncingDay('');
      setSyncingAll(false);
    }
  };

  const copyKey = async () => {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    toast.success('Key copied — paste the same key in Surokkha → Settings → Plexivia Sync');
  };

  const connected = conn?.enabled && conn?.hasKey && conn?.lastTestOk;
  const rows = status?.rows || [];
  const importedRows = rows.filter((r) => r.payment.status === 'imported');

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <HeaderTitle title="Integrations" icon={Plug} />

      {/* Connection card */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Surokkha Store</h2>
              <p className="text-xs text-muted-foreground">Every night at 3:00 AM the previous day's payments come in as one business payment.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {connected ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <MinusCircle className="size-3.5" /> {conn?.hasKey ? (conn?.enabled ? 'Not verified' : 'Off') : 'Not connected'}
              </span>
            )}
            <Switch checked={Boolean(conn?.enabled)} disabled={!conn || saving} onCheckedChange={(v) => save({ enabled: v, key: '' })} aria-label="Enable Surokkha sync" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Surokkha API URL</label>
            <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://admin.surokkha.store/api/v1" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Sync key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value.trim())}
                  placeholder={conn?.hasKey ? `Saved key ${conn.keyHint} — enter a new one to replace it` : 'Generate or paste (min 32 characters)'}
                  className="pr-16 font-mono text-xs"
                />
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2">
                  <button type="button" onClick={() => setShowKey((v) => !v)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted cursor-pointer" aria-label="Show or hide key">
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button type="button" onClick={() => setKey(generateKey())} className="rounded-md p-1.5 text-primary hover:bg-primary/10 cursor-pointer" title="Generate a random key" aria-label="Generate a random key">
                    <Wand2 className="size-4" />
                  </button>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={copyKey} disabled={!key} className="h-9 gap-1">
                <Copy className="size-3.5" /> Copy
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Use the same key in Surokkha → Settings → Plexivia Sync. It is stored encrypted and never shown again.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
          <div className="space-y-0.5 text-muted-foreground">
            <p>
              Last test: <span className="font-semibold text-foreground">{fmtTime(conn?.lastTestAt)}</span>
              {conn?.lastTestMessage && <span className={conn?.lastTestOk ? ' text-emerald-600' : ' text-rose-600'}> · {conn.lastTestMessage}</span>}
            </p>
            <p>
              Key changed: <span className="font-semibold text-foreground">{fmtTime(conn?.keyUpdatedAt)}</span> · Next run:{' '}
              <span className="font-semibold text-foreground">{fmtTime(status?.nextRunAt || conn?.nextRunAt)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={test} disabled={testing || !conn?.hasKey} className="gap-1.5">
              {testing ? <Loader2 className="size-3.5 animate-spin" /> : <PlugZap className="size-3.5" />} Test connection
            </Button>
            <Button size="sm" onClick={() => save()} disabled={saving || (key && key.length < 32)} className="gap-1.5">
              <Save className="size-3.5" /> Save
            </Button>
          </div>
        </div>
      </section>

      {/* Daily sync status */}
      <section className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Daily sync — last {STATUS_DAYS} days</h2>
            <p className="text-xs text-muted-foreground">
              {importedRows.length} days imported · {money(importedRows.reduce((a, r) => a + (Number(r.payment.amount) || 0), 0))} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncAll}
              disabled={syncingAll || !!syncingDay || !conn?.hasKey || !rows.some((r) => r.payment.status !== 'imported')}
              className="gap-1.5"
            >
              {syncingAll ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Sync all
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadStatus()} disabled={syncingAll} className="gap-1.5">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-bold">Day</th>
                <th className="px-4 py-2.5 font-bold">Payments</th>
                <th className="px-4 py-2.5 font-bold text-right">Amount</th>
                <th className="px-4 py-2.5 font-bold text-right">Orders</th>
                <th className="px-4 py-2.5 font-bold">Last run</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.day} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">{formatLongDate(r.day)}</td>
                  <td className="px-4 py-2.5">
                    <StatusChip status={r.payment.status} />
                    {r.payment.error && <p className="mt-1 max-w-xs truncate text-[11px] text-rose-600" title={r.payment.error}>{r.payment.error}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {r.payment.status === 'imported' ? (
                      <Link to="/accounts/payments" className="text-emerald-600 hover:underline">{money(r.payment.amount)}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.payment.orders ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtTime(r.lastRunAt)}
                    {r.trigger && <span className="block text-[10px]">{r.trigger.startsWith('MANUAL') ? 'Manual' : 'Nightly job'}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {r.payment.status !== 'imported' && (
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={!!syncingDay || syncingAll || !conn?.hasKey} onClick={() => syncDay(r.day)}>
                        {syncingDay === r.day ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} Sync now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">Loading…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

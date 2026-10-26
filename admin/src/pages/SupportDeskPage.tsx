import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LifeBuoy, Plus, RefreshCw, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getGenericErrorMessage } from '@/lib/error-handler';
import { useData } from '../context/DataContext';

interface Ticket {
  dId: string;
  ticket_number: string;
  client_id: string;
  client_name: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORIES = ['VPS', 'DEPLOYMENT', 'BUG', 'BILLING', 'FEATURE'];

const STATUS_TONE: Record<string, string> = {
  OPEN: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  IN_PROGRESS: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  WAITING_CLIENT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  RESOLVED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  CLOSED: 'bg-slate-500/15 text-slate-500',
};

const PRIORITY_TONE: Record<string, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-sky-500',
  HIGH: 'text-amber-500',
  URGENT: 'text-rose-500',
};

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500';

const label = (s: string) => s.replace(/_/g, ' ');

export const SupportDeskPage: React.FC = () => {
  const { clients } = useData();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ACTIVE');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client_id: '', subject: '', description: '', category: 'DEPLOYMENT', priority: 'MEDIUM' });

  const safeClients = Array.isArray(clients) ? clients : [];

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/hub/support/tickets');
      setTickets(data?.data || []);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const visible = useMemo(() => {
    if (filter === 'ALL') return tickets;
    if (filter === 'ACTIVE') return tickets.filter((t) => ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(t.status));
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const countFor = (f: string) =>
    f === 'ALL'
      ? tickets.length
      : f === 'ACTIVE'
      ? tickets.filter((t) => ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(t.status)).length
      : tickets.filter((t) => t.status === f).length;

  const changeStatus = async (ticket: Ticket, status: string) => {
    try {
      const { data } = await apiClient.patch(`/api/v1/hub/support/tickets/${ticket.dId}/status`, { status });
      setTickets((prev) => prev.map((t) => (t.dId === ticket.dId ? { ...t, ...data.data } : t)));
      toast.success(`${ticket.ticket_number} → ${label(status)}`);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not update the ticket.'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const client = safeClients.find((c: any) => (c.dId || c.id) === form.client_id) as any;
      await apiClient.post('/api/v1/hub/support/tickets', {
        ...form,
        client_name: client?.business_name || client?.name,
      });
      toast.success('Ticket created.');
      setForm({ client_id: '', subject: '', description: '', category: 'DEPLOYMENT', priority: 'MEDIUM' });
      setCreating(false);
      loadTickets();
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not create the ticket.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">Support Desk</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Client tickets, priorities and resolution status.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadTickets}
            title="Refresh"
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ACTIVE', 'ALL', ...STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 h-7 rounded-full text-[11px] font-mono font-bold cursor-pointer border transition ${
              filter === f
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label(f)} ({countFor(f)})
          </button>
        ))}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">New ticket</h2>
            <button type="button" onClick={() => setCreating(false)} className="p-1 text-slate-500 cursor-pointer" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className={inputClass} required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Select client…</option>
              {safeClients.map((c: any) => (
                <option key={c.dId || c.id} value={c.dId || c.id}>
                  {c.business_name || c.name || c.client_key}
                </option>
              ))}
            </select>
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <input className={inputClass} placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className={`${inputClass} min-h-[100px]`} placeholder="Describe the issue…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {safeClients.length === 0 && <p className="text-xs text-amber-500">Add a client first — every ticket belongs to a client.</p>}
          <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold cursor-pointer">
            {saving ? 'Creating…' : 'Create ticket'}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-slate-500">{loading ? 'Loading…' : 'No tickets here.'}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((t) => (
              <li key={t.dId} className="px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">{t.ticket_number}</span>
                    <span className={`text-[10px] font-mono font-bold ${PRIORITY_TONE[t.priority] || ''}`}>{t.priority}</span>
                    <span className="text-[10px] font-mono text-slate-400">{t.category}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.subject}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {t.client_name} · {new Date(t.created_at).toLocaleDateString()}
                    {t.description ? ` · ${t.description}` : ''}
                  </div>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => changeStatus(t, e.target.value)}
                  className={`text-[11px] font-mono font-bold px-2 h-7 rounded-md border-0 cursor-pointer ${STATUS_TONE[t.status] || ''}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{label(s)}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SupportDeskPage;

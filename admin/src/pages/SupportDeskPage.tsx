import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
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

  const columns = [
    {
      accessorKey: 'ticket_number',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Ticket" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs font-bold text-primary">{getValue()}</span>,
    },
    {
      id: 'subject',
      accessorFn: (t: Ticket) => `${t.subject} ${t.client_name} ${t.description || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }: any) => (
        <div className="min-w-0 max-w-[360px]">
          <div className="truncate font-semibold text-foreground">{row.original.subject}</div>
          {row.original.description && <div className="truncate text-xs text-muted-foreground">{row.original.description}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'client_name',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({ getValue }: any) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'category',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ getValue }: any) => <span className="font-mono text-[11px] text-muted-foreground">{getValue()}</span>,
    },
    {
      accessorKey: 'priority',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Priority" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ getValue }: any) => <span className={`font-mono text-[11px] font-bold ${PRIORITY_TONE[getValue()] || ''}`}>{getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ row }: any) => (
        <select
          value={row.original.status}
          onChange={(e) => changeStatus(row.original, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`h-7 cursor-pointer rounded-md border-0 px-2 font-mono text-[11px] font-bold ${STATUS_TONE[row.original.status] || ''}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{label(s)}</option>
          ))}
        </select>
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{new Date(getValue()).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={LifeBuoy}
        title="Support Desk"
        onRefresh={loadTickets}
        actions={
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        }
      />

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

      <UnifiedDataTable
        columns={columns}
        data={tickets}
        isLoading={loading && tickets.length === 0}
        searchPlaceholder="Search tickets by number, subject, or client..."
        facetedFilters={[
          { columnId: 'status', title: 'Status', options: STATUSES.map((v) => ({ label: label(v), value: v })) },
          { columnId: 'priority', title: 'Priority', options: PRIORITIES.map((v) => ({ label: v, value: v })) },
          { columnId: 'category', title: 'Category', options: CATEGORIES.map((v) => ({ label: v, value: v })) },
        ]}
        exportFilename="support-tickets"
        emptyTitle="No tickets here"
      />
    </div>
  );
};

export default SupportDeskPage;

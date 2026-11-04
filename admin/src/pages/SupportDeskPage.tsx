import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Clock,
  FileText,
  Image as ImageIcon,
  LifeBuoy,
  Loader2,
  Lock,
  Paperclip,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { API_BASE_URL } from '@/lib/api-client';
import {
  supportApi,
  supportAdminsApi,
  uploadTicketAttachment,
  apiErrorMessage,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
} from '@/services/supportApi';
import { useData } from '../context/DataContext';

interface Attachment {
  name?: string;
  url: string;
  size?: number;
  mimeType?: string;
}

interface TicketMessage {
  id: string;
  authorType: 'CLIENT' | 'ADMIN';
  authorName: string;
  authorAdminId: string;
  body: string;
  isInternalNote: boolean;
  attachments: Attachment[];
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  assignedToName: string;
  messages: TicketMessage[];
  slaDueAt: string;
  firstResponseAt: string;
  resolvedAt: string;
  closedAt: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminOption {
  id: string;
  name: string;
  role?: string;
}

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];

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

const label = (s: string) => String(s || '').replace(/_/g, ' ');

// Rounds a millisecond span down to the coarsest unit that still reads naturally
const fmtDuration = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Where the first-response SLA stands: already answered, still running, or missed
const slaState = (t: Ticket): { text: string; tone: string } => {
  if (t.firstResponseAt) {
    return {
      text: `answered in ${fmtDuration(Date.parse(t.firstResponseAt) - Date.parse(t.createdAt))}`,
      tone: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (!t.slaDueAt) return { text: '—', tone: 'text-muted-foreground' };
  if (['RESOLVED', 'CLOSED'].includes(t.status)) return { text: 'no reply sent', tone: 'text-muted-foreground' };
  const remaining = Date.parse(t.slaDueAt) - Date.now();
  if (remaining < 0) return { text: `overdue by ${fmtDuration(-remaining)}`, tone: 'text-rose-500 font-bold' };
  if (remaining < 2 * 3_600_000) return { text: `due in ${fmtDuration(remaining)}`, tone: 'text-amber-500 font-semibold' };
  return { text: `due in ${fmtDuration(remaining)}`, tone: 'text-muted-foreground' };
};

const isImageAttachment = (a: Attachment) =>
  /^image\//.test(a.mimeType || '') || /\.(png|jpe?g|webp|gif)$/i.test(a.url || '');

// Attachment URLs come back relative to the API origin
const fileHref = (a: Attachment) => (/^https?:\/\//i.test(a.url) ? a.url : `${API_BASE_URL}${a.url}`);

const AttachmentList: React.FC<{ items: Attachment[]; onRemove?: (a: Attachment) => void }> = ({ items, onRemove }) => {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-1">
      {items.map((a) => (
        <li
          key={a.url}
          className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px]"
        >
          {isImageAttachment(a) ? (
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          )}
          <a
            href={fileHref(a)}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate font-medium hover:underline"
            title={a.name || a.url}
          >
            {a.name || a.url.split('/').pop()}
          </a>
          <span className="shrink-0 text-muted-foreground">{fmtSize(a.size)}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a)}
              className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export const SupportDeskPage: React.FC = () => {
  const { clients } = useData();
  const { ticketId } = useParams<{ ticketId?: string }>();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Ticket | null>(null);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_dId: '',
    subject: '',
    description: '',
    category: 'DEPLOYMENT',
    priority: 'MEDIUM',
  });

  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [internalNote, setInternalNote] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const safeClients = Array.isArray(clients) ? clients : [];

  const loadTickets = async () => {
    setLoading(true);
    try {
      setTickets(await supportApi.list());
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    supportAdminsApi
      .list()
      .then(setAdmins)
      .catch(() => setAdmins([]));
  }, []);

  // Deep link from the notification bell: /support/:ticketId opens that thread straight away
  useEffect(() => {
    if (!ticketId) return;
    supportApi
      .get(ticketId)
      .then(setActive)
      .catch((err: any) => toast.error(apiErrorMessage(err, 'That ticket could not be opened.')));
  }, [ticketId]);

  // Keep the newest message in view, and start every thread with an empty composer
  useEffect(() => {
    if (active) threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [active?.id, active?.messages.length]);

  useEffect(() => {
    setDraft('');
    setDraftAttachments([]);
    setInternalNote(false);
  }, [active?.id]);

  const upsert = (t: Ticket) => {
    setTickets((prev) => (prev.some((x) => x.id === t.id) ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev]));
    setActive((prev) => (prev && prev.id === t.id ? t : prev));
  };

  const stats = useMemo(() => {
    const live = tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status));
    return {
      open: live.length,
      unanswered: live.filter((t) => !t.firstResponseAt).length,
      overdue: tickets.filter((t) => t.isOverdue).length,
      urgent: live.filter((t) => t.priority === 'URGENT').length,
    };
  }, [tickets]);

  const openTicket = async (row: Ticket) => {
    setActive(row);
    try {
      // The list payload is already complete, but re-reading avoids replying into a stale thread
      upsert(await supportApi.get(row.id));
    } catch {
      /* keep the row we already have on screen */
    }
  };

  const changeStatus = async (ticket: Ticket, status: string) => {
    try {
      upsert(await supportApi.updateStatus(ticket.id, status));
      toast.success(`${ticket.ticketNumber} → ${label(status)}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update the ticket.'));
    }
  };

  const changePriority = async (ticket: Ticket, priority: string) => {
    try {
      upsert(await supportApi.updateStatus(ticket.id, undefined, priority));
      toast.success(`${ticket.ticketNumber} → ${priority}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not change the priority.'));
    }
  };

  const changeAssignee = async (ticket: Ticket, adminId: string) => {
    try {
      const updated = await supportApi.assign(ticket.id, adminId);
      upsert(updated);
      toast.success(adminId ? `Assigned to ${updated.assignedToName || 'admin'}` : 'Assignee cleared');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not assign the ticket.'));
    }
  };

  const addFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: Attachment[] = [];
    for (const file of files) {
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
        toast.error(`${file.name}: attach a PNG, JPEG, WebP, GIF or PDF.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name}: larger than 5 MB.`);
        continue;
      }
      try {
        uploaded.push(await uploadTicketAttachment(file));
      } catch (err) {
        toast.error(apiErrorMessage(err, `${file.name}: upload failed.`));
      }
    }
    setDraftAttachments((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const body = draft.trim();
    if (!body) {
      toast.error('Write something before sending.');
      return;
    }
    setSending(true);
    try {
      upsert(await supportApi.reply(active.id, body, internalNote, draftAttachments));
      setDraft('');
      setDraftAttachments([]);
      toast.success(internalNote ? 'Internal note saved.' : 'Reply sent to the client.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not send the reply.'));
    } finally {
      setSending(false);
    }
  };

  const deleteTicket = async () => {
    if (!active) return;
    setDeleting(true);
    try {
      await supportApi.remove(active.id);
      setTickets((prev) => prev.filter((t) => t.id !== active.id));
      setActive(null);
      toast.success('Ticket deleted.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete the ticket.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await supportApi.create(form);
      upsert(created);
      setForm({ client_dId: '', subject: '', description: '', category: 'DEPLOYMENT', priority: 'MEDIUM' });
      setCreating(false);
      toast.success(`${created.ticketNumber} created.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not create the ticket.'));
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'ticketNumber',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Ticket" />,
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-primary">{row.original.ticketNumber}</span>
            {row.original.isOverdue && (
              <span title="First-response SLA missed" className="flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'subject',
        accessorFn: (t: Ticket) => `${t.subject} ${t.clientName} ${t.description || ''}`,
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }: any) => (
          <div className="min-w-0 max-w-[320px]">
            <div className="truncate font-semibold text-foreground">{row.original.subject}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.messages.length > 1 ? `${row.original.messages.length} messages · ` : ''}
              {row.original.description || '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'clientName',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client" />,
        cell: ({ row }: any) => (
          <div className="min-w-0">
            <div className="truncate text-muted-foreground">{row.original.clientName || '—'}</div>
            {row.original.projectName && (
              <div className="truncate text-[11px] text-muted-foreground/70">{row.original.projectName}</div>
            )}
          </div>
        ),
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
        cell: ({ row }: any) => (
          <select
            value={row.original.priority}
            onChange={(e) => changePriority(row.original, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`h-7 cursor-pointer rounded-md border-0 bg-transparent px-1 font-mono text-[11px] font-bold ${PRIORITY_TONE[row.original.priority] || ''}`}
          >
            {PRIORITIES.map((p: string) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        ),
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
            {STATUSES.map((s: string) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: 'assignee',
        accessorFn: (t: Ticket) => t.assignedToName || 'Unassigned',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Assignee" />,
        filterFn: 'arrIncludesSome' as const,
        cell: ({ row }: any) => (
          <select
            value={row.original.assignedTo}
            onChange={(e) => changeAssignee(row.original, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="h-7 max-w-[130px] cursor-pointer truncate rounded-md border-0 bg-transparent px-1 text-[11px] text-muted-foreground"
          >
            <option value="">Unassigned</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: 'sla',
        accessorFn: (t: Ticket) => t.slaDueAt || '',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="First response" />,
        cell: ({ row }: any) => {
          const sla = slaState(row.original);
          return <span className={`font-mono text-[11px] ${sla.tone}`}>{sla.text}</span>;
        },
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ getValue }: any) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(getValue())}</span>
        ),
      },
    ],
    [admins]
  );

  const activeSla = active ? slaState(active) : null;

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={LifeBuoy}
        title="Support Desk"
        onRefresh={loadTickets}
        actions={
          <button
            onClick={() => setCreating(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" /> New Ticket
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Open tickets', value: stats.open, tone: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'Awaiting first reply', value: stats.unanswered, tone: 'text-indigo-500' },
          { label: 'SLA overdue', value: stats.overdue, tone: 'text-rose-500' },
          { label: 'Urgent & open', value: stats.urgent, tone: 'text-amber-500' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className={`font-mono text-2xl font-bold ${card.tone}`}>{card.value}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">New ticket</h2>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="btn-close cursor-pointer p-1 text-slate-500"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              className={inputClass}
              required
              value={form.client_dId}
              onChange={(e) => setForm({ ...form, client_dId: e.target.value })}
            >
              <option value="">Select client…</option>
              {safeClients.map((c: any) => (
                <option key={c.dId || c.id} value={c.dId || c.id}>
                  {c.business_name || c.client_name || c.client_key}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <input
            className={inputClass}
            placeholder="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-[100px]`}
            placeholder="Describe the issue — this becomes the first message in the thread…"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {safeClients.length === 0 && (
            <p className="text-xs text-amber-500">Add a client first — every ticket belongs to a client.</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create ticket'}
          </button>
        </form>
      )}

      <UnifiedDataTable
        columns={columns}
        data={tickets}
        isLoading={loading && tickets.length === 0}
        searchPlaceholder="Search tickets by number, subject, or client..."
        onRowClick={openTicket}
        facetedFilters={[
          { columnId: 'status', title: 'Status', options: STATUSES.map((v: string) => ({ label: label(v), value: v })) },
          { columnId: 'priority', title: 'Priority', options: PRIORITIES.map((v: string) => ({ label: v, value: v })) },
          { columnId: 'category', title: 'Category', options: CATEGORIES.map((v: string) => ({ label: v, value: v })) },
          {
            columnId: 'assignee',
            title: 'Assignee',
            options: [
              { label: 'Unassigned', value: 'Unassigned' },
              ...admins.map((a) => ({ label: a.name, value: a.name })),
            ],
          },
        ]}
        exportFilename="support-tickets"
        emptyTitle="No tickets here"
        emptyDescription="Client tickets arrive here the moment they are submitted from a client dashboard."
      />

      <Sheet open={!!active} onOpenChange={(next: boolean) => !next && setActive(null)}>
        <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
          {active && (
            <>
              <SheetHeader className="gap-3 border-b p-5 pr-12">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{active.ticketNumber}</span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${STATUS_TONE[active.status] || ''}`}>
                      {label(active.status)}
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${PRIORITY_TONE[active.priority] || ''}`}>
                      {active.priority}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{active.category}</span>
                  </div>
                  <SheetTitle className="text-base font-semibold leading-snug">{active.subject}</SheetTitle>
                  <SheetDescription className="text-xs">
                    {active.clientName}
                    {active.projectName ? ` · ${active.projectName}` : ''} · opened {fmtDateTime(active.createdAt)}
                  </SheetDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={active.status}
                    onChange={(e) => changeStatus(active, e.target.value)}
                    className={`h-8 cursor-pointer rounded-md border-0 px-2 font-mono text-[11px] font-bold ${STATUS_TONE[active.status] || ''}`}
                  >
                    {STATUSES.map((s: string) => (
                      <option key={s} value={s}>
                        {label(s)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={active.priority}
                    onChange={(e) => changePriority(active, e.target.value)}
                    className={`h-8 cursor-pointer rounded-md border bg-transparent px-2 font-mono text-[11px] font-bold ${PRIORITY_TONE[active.priority] || ''}`}
                  >
                    {PRIORITIES.map((p: string) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    value={active.assignedTo}
                    onChange={(e) => changeAssignee(active, e.target.value)}
                    className="h-8 cursor-pointer rounded-md border bg-transparent px-2 text-[11px] text-foreground"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <span className={`flex items-center gap-1 font-mono text-[11px] ${activeSla?.tone}`}>
                    <Clock className="h-3 w-3" /> {activeSla?.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="ml-auto cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                    title="Delete ticket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/20 p-5">
                {active.messages.map((m) => {
                  const mine = m.authorType === 'ADMIN';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-xl border px-3 py-2 ${
                          m.isInternalNote
                            ? 'border-amber-500/40 bg-amber-500/10'
                            : mine
                              ? 'border-cyan-500/30 bg-cyan-500/10'
                              : 'border-border bg-card'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                          <span className="font-bold">{m.authorName}</span>
                          <span>{fmtDateTime(m.createdAt)}</span>
                          {m.isInternalNote && (
                            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                              <Lock className="h-3 w-3" /> internal
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{m.body}</p>
                        <AttachmentList items={m.attachments} />
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={sendReply} className="space-y-2 border-t p-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={internalNote ? 'Internal note — the client never sees this…' : 'Reply to the client…'}
                  className={`${inputClass} min-h-[88px] resize-y`}
                />
                <AttachmentList
                  items={draftAttachments}
                  onRemove={(a) => setDraftAttachments((prev) => prev.filter((x) => x.url !== a.url))}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
                    {uploading ? 'Uploading…' : 'Attach'}
                  </button>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={internalNote}
                      onChange={(e) => setInternalNote(e.target.checked)}
                      className="cursor-pointer accent-amber-500"
                    />
                    Internal note
                  </label>
                  <button
                    type="submit"
                    disabled={sending || uploading || !draft.trim()}
                    className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {internalNote ? 'Save note' : 'Send reply'}
                  </button>
                </div>
                {!internalNote && (
                  <p className="text-[11px] text-muted-foreground">
                    Sending a reply emails the client and moves an open ticket into progress.
                  </p>
                )}
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={deleteTicket}
        isDeleting={deleting}
        title={`Delete ${active?.ticketNumber || 'this ticket'}?`}
        description="The ticket and its whole conversation are hidden from the dashboard. The client can no longer see or reply to it."
      />
    </div>
  );
};

export default SupportDeskPage;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  MailOpen,
  Inbox,
  Send,
  Star,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  RefreshCw,
  PenSquare,
  ArrowLeft,
  Paperclip,
  Search,
  ChevronLeft,
  ChevronRight,
  Reply,
  ReplyAll,
  Forward,
  Copy,
  Clock,
  CornerDownRight,
  RotateCcw,
  Settings,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getGenericErrorMessage } from '@/lib/error-handler';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { subscribeRealtime, useNotificationStore } from '@/store/useNotificationStore';

interface Address {
  name: string;
  address: string;
}

interface MessageSummary {
  id: string;
  folder: string;
  messageId?: string;
  threadId?: string;
  from: Address;
  to: Address[];
  cc: Address[];
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  attachments: { filename: string; size: number; contentType: string }[];
}

interface MessageDetail extends MessageSummary {
  bodyText: string;
  bodyHtml: string;
  thread: (MessageSummary & { bodyText: string })[];
}

interface FolderInfo {
  id: string;
  name: string;
  total: number;
  unread: number;
}

interface MailSettings {
  imap: { isEnabled: boolean; host: string; port: number; secure: boolean; user: string; hasPassword: boolean };
  forwardTo: string;
  smtpSender: string;
  active: { user: string; host: string; source: string } | null;
}

const FOLDER_ICONS: Record<string, React.ElementType> = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  drafts: FileText,
  junk: ShieldAlert,
  trash: Trash2,
};

const DEFAULT_FOLDERS: FolderInfo[] = ['inbox', 'starred', 'sent', 'drafts', 'junk', 'trash'].map((id) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  total: 0,
  unread: 0,
}));

const PAGE_SIZE = 25;

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-cyan-500';

const iconBtn =
  'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-40';

const formatAddress = (a?: Address) => (a ? (a.name ? `${a.name} <${a.address}>` : a.address) : '');
const displayName = (a?: Address) => a?.name || a?.address || 'Unknown';

// Relative time for list rows
const timeAgo = (value: string) => {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString();
};

// Renders untrusted email HTML in a script-free sandbox that grows to fit its content
const EmailHtmlPreview: React.FC<{ html: string }> = ({ html }) => {
  const ref = useRef<HTMLIFrameElement>(null);

  const fit = () => {
    const doc = ref.current?.contentDocument;
    if (!doc?.body || !ref.current) return;
    ref.current.style.height = `${Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 200) + 8}px`;
  };

  const handleLoad = () => {
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent =
      'html,body{margin:0;padding:16px;box-sizing:border-box;font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1e293b;background:#fff;word-break:break-word}img{max-width:100%!important;height:auto!important}table{max-width:100%!important}a{color:#0891b2}';
    doc.head?.appendChild(style);
    doc.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    fit();
    setTimeout(fit, 200);
    setTimeout(fit, 800);
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-white">
      <iframe
        ref={ref}
        title="Message"
        srcDoc={html}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={handleLoad}
        className="w-full block border-0 min-h-[220px]"
      />
    </div>
  );
};

export const WebmailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const connected = useNotificationStore((s) => s.connected);

  const [folder, setFolder] = useState('inbox');
  const [folders, setFolders] = useState<FolderInfo[]>(DEFAULT_FOLDERS);
  const [mailbox, setMailbox] = useState('');
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState<string[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [opening, setOpening] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState({ to: '', cc: '', subject: '', text: '', inReplyTo: '', threadId: '' });

  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isTrash = folder === 'trash';
  const isJunk = folder === 'junk';

  const loadFolders = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/v1/hub/webmail/folders');
      if (Array.isArray(data?.data)) setFolders(data.data);
      setMailbox(data?.mailbox || '');
    } catch {
      // Counts stay as they were
    }
  }, []);

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get('/api/v1/hub/webmail/messages', {
          params: { folder, page, limit: PAGE_SIZE, q: query || undefined, unread: unreadOnly ? 'true' : undefined },
        });
        setMessages(data?.data || []);
        setPagination(data?.pagination || { page: 1, total: 0, totalPages: 1 });
      } catch (err: any) {
        setError(getGenericErrorMessage(err, 'Could not load the mailbox.'));
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [folder, page, query, unreadOnly]
  );

  const refreshAll = useCallback(
    (silent = false) => {
      loadMessages(silent);
      loadFolders();
    },
    [loadMessages, loadFolders]
  );

  const openMessage = useCallback(async (id: string) => {
    setSelectedId(id);
    setOpening(true);
    setReplyText('');
    try {
      const { data } = await apiClient.get(`/api/v1/hub/webmail/messages/${id}`);
      setSelected(data?.data || null);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not open the message.'));
      setSelectedId(null);
    } finally {
      setOpening(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Debounce search typing
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Open a message linked from Overview or a notification (?id=)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setFolder('inbox');
      openMessage(id);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Live updates: new mail and changes made in other tabs
  useEffect(
    () =>
      subscribeRealtime((event) => {
        if (event === 'webmail:new' || event === 'webmail:updated') refreshAll(true);
      }),
    [refreshAll]
  );

  const changeFolder = (id: string) => {
    setFolder(id);
    setPage(1);
    setChecked([]);
    setSelectedId(null);
    setSelected(null);
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/api/v1/hub/webmail/sync');
      toast.success('Mailbox synchronized.');
      refreshAll(true);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Sync failed. Check the mailbox settings.'));
    } finally {
      setSyncing(false);
    }
  };

  const runBatch = async (ids: string[], action: string, message?: string) => {
    if (!ids.length) return;
    try {
      await apiClient.post('/api/v1/hub/webmail/messages/batch', { ids, action });
      if (message) toast.success(message);
      setChecked([]);
      if (selectedId && ids.includes(selectedId) && ['trash', 'restore', 'junk', 'notJunk', 'delete'].includes(action)) {
        setSelectedId(null);
        setSelected(null);
      }
      refreshAll(true);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Action failed.'));
    }
  };

  const toggleStar = async (m: MessageSummary) => {
    const isStarred = !m.isStarred;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isStarred } : x)));
    if (selected?.id === m.id) setSelected({ ...selected, isStarred });
    try {
      await apiClient.patch(`/api/v1/hub/webmail/messages/${m.id}/flags`, { isStarred });
      loadFolders();
    } catch {
      toast.error('Could not update the star.');
      refreshAll(true);
    }
  };

  const removeMessages = (ids: string[]) => {
    if (isTrash) setConfirmDelete(ids);
    else runBatch(ids, 'trash', `${ids.length > 1 ? `${ids.length} messages` : 'Message'} moved to Trash.`);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard.');
  };

  // Compose helpers -----------------------------------------------------------

  const openCompose = (preset: Partial<typeof draft> = {}) => {
    setDraft({ to: '', cc: '', subject: '', text: '', inReplyTo: '', threadId: '', ...preset });
    setShowCc(Boolean(preset.cc));
    setComposeOpen(true);
  };

  const quoted = (m: MessageDetail) =>
    `\n\n---\nOn ${new Date(m.date).toLocaleString()}, ${formatAddress(m.from)} wrote:\n${(m.bodyText || m.snippet)
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')}`;

  const replySubject = (s: string) => (/^re:/i.test(s) ? s : `Re: ${s}`);

  const replyAll = () => {
    if (!selected) return;
    const self = mailbox.toLowerCase();
    const cc = [...selected.to, ...selected.cc]
      .map((a) => a.address)
      .filter((a) => a && a !== self && a !== selected.from.address)
      .join(', ');
    openCompose({
      to: selected.from.address,
      cc,
      subject: replySubject(selected.subject),
      text: quoted(selected),
      inReplyTo: selected.messageId || '',
      threadId: selected.threadId || selected.messageId || '',
    });
  };

  const forward = () => {
    if (!selected) return;
    openCompose({
      subject: /^fwd?:/i.test(selected.subject) ? selected.subject : `Fwd: ${selected.subject}`,
      text: `\n\n---------- Forwarded message ----------\nFrom: ${formatAddress(selected.from)}\nDate: ${new Date(selected.date).toLocaleString()}\nSubject: ${selected.subject}\nTo: ${selected.to.map(formatAddress).join(', ')}\n\n${selected.bodyText || selected.snippet}`,
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await apiClient.post('/api/v1/hub/webmail/send', {
        to: draft.to,
        cc: draft.cc || undefined,
        subject: draft.subject || '(no subject)',
        text: draft.text,
        inReplyTo: draft.inReplyTo || undefined,
        threadId: draft.threadId || undefined,
      });
      toast.success(data?.message || 'Email sent.');
      setComposeOpen(false);
      refreshAll(true);
      if (selectedId && draft.inReplyTo) openMessage(selectedId);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not send the email.'));
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      await apiClient.post('/api/v1/hub/webmail/send', {
        to: folder === 'sent' ? selected.to[0]?.address : selected.from.address,
        subject: replySubject(selected.subject),
        text: replyText.trim() + quoted(selected),
        inReplyTo: selected.messageId,
        threadId: selected.threadId || selected.messageId,
      });
      toast.success('Reply sent.');
      setReplyText('');
      openMessage(selected.id);
      refreshAll(true);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not send the reply.'));
    } finally {
      setReplying(false);
    }
  };

  const allChecked = messages.length > 0 && checked.length === messages.length;
  const currentFolder = folders.find((f) => f.id === folder);

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-foreground font-mono tracking-tight">Webmail</h1>
            <span
              title={connected ? 'Live: new mail appears instantly' : 'Live updates reconnecting'}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-muted-foreground'
              }`}
            >
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{mailbox || 'Mailbox not configured'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSettingsOpen(true)}
            title="Mail settings"
            className="p-2.5 bg-card hover:bg-muted text-muted-foreground rounded-xl border border-border transition cursor-pointer shadow-xs"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={syncNow}
            disabled={syncing}
            title="Sync with mail server"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-card hover:bg-muted text-muted-foreground rounded-xl border border-border transition cursor-pointer shadow-xs text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-cyan-500' : ''}`} />
            <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
          </button>
          <button
            onClick={() => openCompose()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <PenSquare className="w-4 h-4" /> Compose
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,370px)_minmax(0,1fr)] gap-0 rounded-xl border border-border bg-card overflow-hidden shadow-xs min-h-[640px]">
        {/* Folders */}
        <nav className="flex xl:flex-col gap-1 overflow-x-auto md:col-span-2 xl:col-span-1 p-3 bg-muted/20 border-b xl:border-b-0 xl:border-r border-border">
          {folders.map((f) => {
            const Icon = FOLDER_ICONS[f.id] || Inbox;
            const active = folder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => changeFolder(f.id)}
                className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[13px] font-medium cursor-pointer transition shrink-0 ${
                  active ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-bold' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.name}
                {(f.unread > 0 || (f.id === 'starred' && f.total > 0)) && (
                  <span
                    className={`ml-auto pl-2 text-[10px] font-bold ${
                      active ? '' : f.unread > 0 ? 'text-primary' : 'text-muted-foreground/70'
                    }`}
                  >
                    {f.unread > 0 ? f.unread : f.total}
                  </span>
                )}
              </button>
            );
          })}
          <div className="hidden xl:flex items-center gap-1.5 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> SSL IMAP · SMTP
          </div>
        </nav>

        {/* Message list */}
        <section
          className={`border-r border-border bg-background overflow-hidden flex-col min-w-0 ${
            selectedId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-border space-y-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground/70" />
              <input
                className={`${inputClass} pl-8 pr-8 h-9 text-xs`}
                placeholder="Search sender, subject, text…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-2 top-2 p-0.5 text-muted-foreground/70 hover:text-slate-700 cursor-pointer" title="Clear">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground px-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allChecked}
                  onChange={() => setChecked(allChecked ? [] : messages.map((m) => m.id))}
                  className="w-3.5 h-3.5 accent-cyan-600 cursor-pointer"
                />
                {checked.length > 0 ? (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[11px] font-semibold mr-1">{checked.length}</span>
                    <button className={iconBtn} title="Mark as read" onClick={() => runBatch(checked, 'markRead')}>
                      <MailOpen className="w-3.5 h-3.5" />
                    </button>
                    <button className={iconBtn} title="Mark as unread" onClick={() => runBatch(checked, 'markUnread')}>
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button className={iconBtn} title="Star" onClick={() => runBatch(checked, 'star')}>
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    {isJunk ? (
                      <button className={iconBtn} title="Not junk" onClick={() => runBatch(checked, 'notJunk', 'Moved to Inbox.')}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      !isTrash && (
                        <button className={iconBtn} title="Mark as junk" onClick={() => runBatch(checked, 'junk', 'Moved to Junk.')}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                    {isTrash && (
                      <button className={iconBtn} title="Restore" onClick={() => runBatch(checked, 'restore', 'Restored.')}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className={`${iconBtn} hover:!text-rose-500`} title={isTrash ? 'Delete forever' : 'Move to Trash'} onClick={() => removeMessages(checked)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setUnreadOnly((v) => !v);
                      setPage(1);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition ${
                      unreadOnly ? 'bg-cyan-500/15 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {unreadOnly ? 'Unread only' : currentFolder?.name || folder}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-0.5 text-[11px] shrink-0">
                <span className="font-mono">
                  {pagination.total === 0 ? '0' : `${(pagination.page - 1) * PAGE_SIZE + 1}–${Math.min(pagination.page * PAGE_SIZE, pagination.total)}`} of {pagination.total}
                </span>
                <button className={iconBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} title="Newer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className={iconBtn} disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} title="Older">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-border/60 max-h-[600px] overflow-y-auto flex-1">
            {loading && messages.length === 0 &&
              [1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="px-4 py-3 space-y-2 animate-pulse">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted/60" />
                </li>
              ))}
            {error && <li className="px-4 py-6 text-xs text-rose-500">{error}</li>}
            {!error && !loading && messages.length === 0 && (
              <li className="py-16 px-4 text-center space-y-2">
                <Inbox className="w-9 h-9 mx-auto text-muted-foreground/30" />
                <p className="text-sm font-semibold text-foreground">No messages</p>
                <p className="text-xs text-muted-foreground">{query ? 'Nothing matches your search.' : `${currentFolder?.name || 'This folder'} is empty.`}</p>
              </li>
            )}
            {messages.map((m) => {
              const isSelected = selectedId === m.id;
              const counterpart = folder === 'sent' ? `To: ${m.to.map(displayName).join(', ')}` : displayName(m.from);
              return (
                <li
                  key={m.id}
                  onClick={() => openMessage(m.id)}
                  className={`relative flex items-start gap-2 px-3 py-2.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-500/10 shadow-[inset_3px_0_0_0_rgb(6,182,212)]'
                      : m.isRead
                        ? 'hover:bg-muted/40'
                        : 'bg-cyan-500/[0.03] hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    aria-label="Select message"
                    checked={checked.includes(m.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => setChecked((prev) => (prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]))}
                    className="mt-0.5 w-3.5 h-3.5 accent-cyan-600 cursor-pointer shrink-0"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(m);
                    }}
                    title={m.isStarred ? 'Unstar' : 'Star'}
                    className={`mt-0.5 shrink-0 cursor-pointer ${m.isStarred ? 'text-amber-500' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${m.isStarred ? 'fill-amber-500' : ''}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${m.isRead ? 'text-muted-foreground' : 'font-bold text-foreground'}`}>
                        {counterpart}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 shrink-0">
                        {m.attachments?.length > 0 && <Paperclip className="w-3 h-3" />}
                        {timeAgo(m.date)}
                      </span>
                    </div>
                    <div className={`text-xs truncate mt-0.5 ${m.isRead ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>{m.subject}</div>
                    <div className="text-[11px] truncate mt-0.5 text-muted-foreground/70">{m.snippet}</div>
                  </div>
                  {!m.isRead && <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0 mt-1.5" />}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Reader */}
        <section
          className={`bg-background min-h-[420px] min-w-0 flex-col ${
            selectedId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {opening && !selected ? (
            <div className="p-6 text-xs text-muted-foreground">Opening…</div>
          ) : selected ? (
            <article className="flex flex-col h-full min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
                <div className="flex items-center gap-0.5">
                  <button
                    className={`${iconBtn} md:hidden`}
                    title="Back"
                    onClick={() => {
                      setSelectedId(null);
                      setSelected(null);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button className={iconBtn} title="Reply" onClick={() => openCompose({ to: selected.from.address, subject: replySubject(selected.subject), text: quoted(selected), inReplyTo: selected.messageId || '', threadId: selected.threadId || selected.messageId || '' })}>
                    <Reply className="w-4 h-4" />
                  </button>
                  <button className={iconBtn} title="Reply all" onClick={replyAll}>
                    <ReplyAll className="w-4 h-4" />
                  </button>
                  <button className={iconBtn} title="Forward" onClick={forward}>
                    <Forward className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-0.5">
                  <button className={`${iconBtn} ${selected.isStarred ? '!text-amber-500' : ''}`} title={selected.isStarred ? 'Unstar' : 'Star'} onClick={() => toggleStar(selected)}>
                    <Star className={`w-4 h-4 ${selected.isStarred ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    className={iconBtn}
                    title="Mark as unread"
                    onClick={() => {
                      runBatch([selected.id], 'markUnread');
                      setSelectedId(null);
                      setSelected(null);
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  {isJunk ? (
                    <button className={iconBtn} title="Not junk" onClick={() => runBatch([selected.id], 'notJunk', 'Moved to Inbox.')}>
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    !isTrash && (
                      <button className={iconBtn} title="Mark as junk" onClick={() => runBatch([selected.id], 'junk', 'Moved to Junk.')}>
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    )
                  )}
                  {isTrash && (
                    <button className={iconBtn} title="Restore" onClick={() => runBatch([selected.id], 'restore', 'Restored.')}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button className={`${iconBtn} hover:!text-rose-500`} title={isTrash ? 'Delete forever' : 'Move to Trash'} onClick={() => removeMessages([selected.id])}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Header */}
              <header className="px-4 pt-4 pb-3 space-y-3 min-w-0">
                <h2 className="text-base font-bold text-foreground break-words">{selected.subject}</h2>
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-cyan-500/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {displayName(selected.from).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">{displayName(selected.from)}</span>
                      <span className="text-xs text-muted-foreground font-mono truncate">&lt;{selected.from.address}&gt;</span>
                      <button onClick={() => copy(selected.from.address)} className="p-0.5 text-muted-foreground/70 hover:text-foreground cursor-pointer" title="Copy address">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">To: {selected.to.map(formatAddress).join(', ') || '—'}</div>
                    {selected.cc?.length > 0 && <div className="text-[11px] text-muted-foreground truncate">Cc: {selected.cc.map(formatAddress).join(', ')}</div>}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground/70">
                      <Clock className="w-3 h-3" /> {new Date(selected.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </header>

              {/* Body */}
              <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto max-h-[60vh] min-w-0">
                {selected.bodyHtml ? (
                  <EmailHtmlPreview html={selected.bodyHtml} />
                ) : (
                  <pre className="p-4 rounded-xl bg-muted/40 border border-border text-sm whitespace-pre-wrap break-words font-sans text-foreground">
                    {selected.bodyText}
                  </pre>
                )}

                {selected.attachments?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" /> Attachments ({selected.attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((a, i) => (
                        <span key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border text-xs">
                          <FileText className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="font-medium truncate max-w-[160px]">{a.filename}</span>
                          <span className="text-[10px] text-muted-foreground/70">{Math.ceil((a.size || 0) / 1024)} KB</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.thread?.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Conversation ({selected.thread.length + 1})</p>
                    {selected.thread.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openMessage(t.id)}
                        className="w-full text-left p-3 rounded-lg bg-muted/30 border border-border hover:border-cyan-500/40 text-xs space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground truncate">
                            {t.folder === 'sent' ? 'You' : displayName(t.from)}
                          </span>
                          <span className="font-mono text-[10px] shrink-0">{new Date(t.date).toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">{t.bodyText || t.snippet}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick reply */}
              {!isTrash && (
                <form onSubmit={handleQuickReply} className="p-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground truncate">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-500" />
                      Reply to {folder === 'sent' ? displayName(selected.to[0]) : displayName(selected.from)}
                    </span>
                    <span className="shrink-0">Sent from support SMTP</span>
                  </div>
                  <textarea
                    className={`${inputClass} text-xs min-h-[72px] resize-y font-sans`}
                    placeholder="Write a quick reply…"
                    value={replyText}
                    disabled={replying}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleQuickReply(e);
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/70 font-mono">Ctrl + Enter to send</span>
                    <button
                      type="submit"
                      disabled={!replyText.trim() || replying}
                      className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {replying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {replying ? 'Sending…' : 'Send reply'}
                    </button>
                  </div>
                </form>
              )}
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/70">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No message selected</h3>
              <p className="text-xs text-muted-foreground max-w-xs">Pick an email to read it, see the conversation, and reply.</p>
            </div>
          )}
        </section>
      </div>

      {/* Compose */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title={draft.inReplyTo ? 'Reply' : 'New message'} subtitle="Sent from the support SMTP account" maxWidth="2xl">
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">To</label>
              {!showCc && (
                <button type="button" onClick={() => setShowCc(true)} className="text-[11px] text-primary hover:underline cursor-pointer">
                  + Cc
                </button>
              )}
            </div>
            <input className={inputClass} placeholder="recipient@example.com, another@example.com" required value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
          </div>
          {showCc && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Cc</label>
              <input className={inputClass} placeholder="cc@example.com" value={draft.cc} onChange={(e) => setDraft({ ...draft, cc: e.target.value })} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Subject</label>
            <input className={inputClass} placeholder="Subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Message</label>
            <textarea className={`${inputClass} min-h-[240px] font-sans`} placeholder="Write your message…" required value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setComposeOpen(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold cursor-pointer">
              {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) runBatch(confirmDelete, 'delete', 'Deleted permanently.');
          setConfirmDelete(null);
        }}
        title="Delete forever"
        message={`Permanently delete ${confirmDelete && confirmDelete.length > 1 ? `${confirmDelete.length} messages` : 'this message'} from the mail server? This cannot be undone.`}
        confirmText="Delete forever"
      />

      <MailSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          loadFolders();
          setTimeout(() => refreshAll(true), 3000);
        }}
      />
    </div>
  );
};

// Mailbox account settings: dashboard override with .env fallback
const MailSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaved: () => void }> = ({ isOpen, onClose, onSaved }) => {
  const [settings, setSettings] = useState<MailSettings | null>(null);
  const [form, setForm] = useState({ isEnabled: false, host: '', port: 993, secure: true, user: '', password: '', forwardTo: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoadError('');
    apiClient
      .get('/api/v1/hub/webmail/settings')
      .then(({ data }) => {
        const s: MailSettings = data?.data;
        setSettings(s);
        setForm({ ...s.imap, password: '', forwardTo: s.forwardTo || '' });
      })
      .catch((err) => setLoadError(getGenericErrorMessage(err, 'Could not load mail settings.')));
  }, [isOpen]);

  const test = async () => {
    setTesting(true);
    try {
      const body = form.isEnabled ? form : {};
      const { data } = await apiClient.post('/api/v1/hub/webmail/settings/test', body);
      toast.success(data?.message || 'Connected.');
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Connection failed.'));
    } finally {
      setTesting(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { forwardTo, password, ...imap } = form;
      await apiClient.put('/api/v1/hub/webmail/settings', { imap: { ...imap, ...(password ? { password } : {}) }, forwardTo });
      toast.success('Mail settings saved. Reconnecting…');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not save settings.'));
    } finally {
      setSaving(false);
    }
  };

  const label = 'text-xs font-semibold text-foreground mb-1 block';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mail settings" subtitle="Inbox account and forwarding" maxWidth="lg">
      {loadError ? (
        <p className="text-xs text-rose-500">{loadError}</p>
      ) : (
        <form onSubmit={save} className="space-y-4">
          {settings && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] font-mono space-y-1 text-muted-foreground">
              <div>
                Inbox: <strong>{settings.active?.user || 'not configured'}</strong>
                {settings.active && <span className="text-muted-foreground/70"> · from {settings.active.source === 'database' ? 'dashboard settings' : '.env'}</span>}
              </div>
              <div>Sending: <strong>{settings.smtpSender || 'SMTP not configured'}</strong> <span className="text-muted-foreground/70">· from .env</span></div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input type="checkbox" className="accent-cyan-600" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} />
            Use a custom inbox account (overrides .env)
          </label>

          <fieldset disabled={!form.isEnabled} className="grid grid-cols-1 sm:grid-cols-[1fr_110px] gap-3 disabled:opacity-50">
            <div>
              <label className={label}>IMAP host</label>
              <input className={inputClass} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="imap.hostinger.com" />
            </div>
            <div>
              <label className={label}>Port</label>
              <input className={inputClass} type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={inputClass} type="email" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} placeholder="admin@example.com" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" className="accent-cyan-600" checked={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.checked })} /> SSL/TLS
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Password</label>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={settings?.imap.hasPassword ? 'Saved — leave blank to keep' : 'Mailbox password'}
              />
            </div>
          </fieldset>

          <div>
            <label className={label}>Forward new inbox mail to (optional)</label>
            <input className={inputClass} type="email" value={form.forwardTo} onChange={(e) => setForm({ ...form, forwardTo: e.target.value })} placeholder="Leave blank to turn forwarding off" />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button type="button" onClick={test} disabled={testing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} /> Test connection
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold cursor-pointer">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default WebmailPage;

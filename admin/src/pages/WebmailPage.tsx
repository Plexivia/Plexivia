import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Inbox, Send, ShieldAlert, Trash2, RefreshCw, PenSquare, ArrowLeft, Paperclip } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getGenericErrorMessage } from '@/lib/error-handler';

interface MessageSummary {
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: string;
  seen: boolean;
}

interface MessageDetail extends MessageSummary {
  text: string;
  html: string;
  attachments: { filename?: string; size: number; contentType: string }[];
}

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'junk', label: 'Junk', icon: ShieldAlert },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500';

export const WebmailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [folder, setFolder] = useState('inbox');
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [mailbox, setMailbox] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [opening, setOpening] = useState(false);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState({ to: '', subject: '', text: '' });

  const loadMessages = async (target = folder) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/api/v1/hub/webmail/messages', { params: { folder: target } });
      setMessages(data?.data || []);
      setMailbox(data?.mailbox || '');
    } catch (err: any) {
      setError(getGenericErrorMessage(err, 'Could not load the mailbox.'));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (uid: number, target = folder) => {
    setComposing(false);
    setOpening(true);
    try {
      const { data } = await apiClient.get(`/api/v1/hub/webmail/messages/${uid}`, { params: { folder: target } });
      setSelected(data?.data || null);
      setMessages((prev) => prev.map((m) => (m.uid === uid ? { ...m, seen: true } : m)));
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not open the message.'));
    } finally {
      setOpening(false);
    }
  };

  useEffect(() => {
    loadMessages(folder);
    setSelected(null);
  }, [folder]);

  // Open a message linked from the Overview page (?uid=)
  useEffect(() => {
    const uid = Number(searchParams.get('uid'));
    if (uid) {
      openMessage(uid, 'inbox');
      setSearchParams({}, { replace: true });
    }
  }, []);

  const startReply = () => {
    if (!selected) return;
    const address = selected.from.match(/<([^>]+)>/)?.[1] || selected.from;
    setDraft({
      to: address,
      subject: selected.subject.startsWith('Re:') ? selected.subject : `Re: ${selected.subject}`,
      text: `\n\n---\nOn ${new Date(selected.date).toLocaleString()}, ${selected.from} wrote:\n${selected.text}`,
    });
    setComposing(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await apiClient.post('/api/v1/hub/webmail/send', draft);
      toast.success(data?.message || 'Email sent.');
      setDraft({ to: '', subject: '', text: '' });
      setComposing(false);
    } catch (err: any) {
      toast.error(getGenericErrorMessage(err, 'Could not send the email.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">Webmail</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{mailbox || 'Support mailbox'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadMessages()}
            title="Refresh"
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              setSelected(null);
              setDraft({ to: '', subject: '', text: '' });
              setComposing(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <PenSquare className="w-4 h-4" /> Compose
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] xl:grid-cols-[150px_minmax(0,320px)_minmax(0,1fr)] gap-4">
        {/* Folders */}
        <nav className="flex xl:flex-col gap-1 overflow-x-auto md:col-span-2 xl:col-span-1">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFolder(f.id)}
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[13px] font-medium cursor-pointer transition shrink-0 ${
                folder === f.id
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
              {f.id === 'inbox' && messages.some((m) => !m.seen) && folder === 'inbox' && (
                <span className="ml-auto text-[10px] font-bold">{messages.filter((m) => !m.seen).length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Message list */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto">
            {error && <li className="px-4 py-6 text-xs text-rose-500">{error}</li>}
            {!error && !loading && messages.length === 0 && <li className="px-4 py-6 text-xs text-slate-500">No messages.</li>}
            {messages.map((m) => (
              <li key={m.uid}>
                <button
                  onClick={() => openMessage(m.uid)}
                  className={`w-full text-left px-4 py-2.5 cursor-pointer transition ${
                    selected?.uid === m.uid ? 'bg-cyan-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs truncate ${m.seen ? 'text-slate-500 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                      {folder === 'sent' ? m.to : m.from}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${m.seen ? 'text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{m.subject}</div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Reader / composer */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 min-h-[300px]">
          {composing ? (
            <form onSubmit={handleSend} className="p-4 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">New message</h2>
              <input className={inputClass} type="email" placeholder="To" required value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
              <input className={inputClass} placeholder="Subject" required value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
              <textarea className={`${inputClass} min-h-[220px] font-sans`} placeholder="Write your message…" required value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {sending ? 'Sending…' : 'Send'}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          ) : opening ? (
            <div className="p-6 text-xs text-slate-500">Opening…</div>
          ) : selected ? (
            <article className="flex flex-col h-full">
              <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selected.subject}</h2>
                  <button onClick={() => setSelected(null)} className="md:hidden p-1 text-slate-500 cursor-pointer" title="Back">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">From: {selected.from}</div>
                <div className="text-xs text-slate-500">To: {selected.to}</div>
                <div className="text-[11px] font-mono text-slate-400">{new Date(selected.date).toLocaleString()}</div>
              </header>
              {selected.html ? (
                <iframe title="Message" sandbox="" srcDoc={selected.html} className="w-full flex-1 min-h-[420px] bg-white rounded-b-xl" />
              ) : (
                <pre className="p-4 text-sm whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">{selected.text}</pre>
              )}
              {selected.attachments.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                  {selected.attachments.map((a, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Paperclip className="w-3 h-3" /> {a.filename || 'attachment'} ({Math.ceil(a.size / 1024)} KB)
                    </span>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <button onClick={startReply} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer">
                  Reply
                </button>
              </div>
            </article>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-xs text-slate-500">Select a message to read it.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WebmailPage;

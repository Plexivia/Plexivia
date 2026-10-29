import { HeaderTitle } from '@/components/common/HeaderTitle';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Building2,
  LifeBuoy,
  Mail,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useData } from '../context/DataContext';

interface InboxItem {
  id: string;
  subject: string;
  from: { name: string; address: string };
  date: string;
  isRead: boolean;
}

interface TicketItem {
  dId: string;
  ticket_number: string;
  subject: string;
  client_name: string;
  priority: string;
  status: string;
}

const cardClass =
  'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs';

export const OverviewPage: React.FC = () => {
  const { projects, tasks, clients, refreshAll, loading } = useData();
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [mailError, setMailError] = useState('');

  const loadExtras = async () => {
    setMailError('');
    const [mailRes, ticketRes] = await Promise.allSettled([
      apiClient.get('/api/v1/hub/webmail/messages', { params: { folder: 'inbox', limit: 20 } }),
      apiClient.get('/api/v1/hub/support/tickets'),
    ]);
    if (mailRes.status === 'fulfilled') {
      setInbox(mailRes.value.data?.data || []);
      setMailError('');
    } else {
      setMailError('Mailbox unavailable');
    }
    if (ticketRes.status === 'fulfilled') setTickets(ticketRes.value.data?.data || []);
  };

  useEffect(() => {
    loadExtras();
  }, []);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const openTickets = tickets.filter((t) => ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(t.status));
  const unreadMail = inbox.filter((m) => !m.isRead);

  const stats = [
    { label: 'Unread Mail', value: unreadMail.length, icon: Mail, to: '/webmail', tone: 'text-cyan-500' },
    { label: 'Open Tickets', value: openTickets.length, icon: LifeBuoy, to: '/support', tone: 'text-amber-500' },
    { label: 'Projects', value: safeProjects.length, icon: FolderKanban, to: '/projects', tone: 'text-indigo-500' },
    { label: 'Open Tasks', value: safeTasks.filter((t) => t.status !== 'DONE').length, icon: CheckSquare, to: '/tasks', tone: 'text-emerald-500' },
    { label: 'Clients', value: safeClients.length, icon: Building2, to: '/clients', tone: 'text-sky-500' },
  ];

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={LayoutDashboard}
        title="Overview"
        onRefresh={() => { refreshAll(); loadExtras(); }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${cardClass} p-4 hover:border-cyan-500/50 transition`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.tone}`} />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className={cardClass}>
          <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" /> Latest Mail
            </h2>
            <Link to="/webmail" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline">
              Open Webmail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </header>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {mailError && <li className="px-4 py-6 text-xs text-rose-500">{mailError}</li>}
            {!mailError && inbox.length === 0 && <li className="px-4 py-6 text-xs text-slate-500">No messages.</li>}
            {inbox.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link to={`/webmail?id=${m.id}`} className="block px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs truncate ${m.isRead ? 'text-slate-500 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                      {m.from?.name || m.from?.address}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${m.isRead ? 'text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{m.subject}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-amber-500" /> Open Support Tickets
            </h2>
            <Link to="/support" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline">
              Support Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </header>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {openTickets.length === 0 && <li className="px-4 py-6 text-xs text-slate-500">No open tickets.</li>}
            {openTickets.slice(0, 6).map((t) => (
              <li key={t.dId} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{t.subject}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t.ticket_number} · {t.client_name}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                  {t.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default OverviewPage;

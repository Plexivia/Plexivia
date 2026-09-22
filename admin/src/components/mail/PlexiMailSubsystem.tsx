import React, { useState } from 'react';
import { Mail, Send, RefreshCw, Server, CheckCircle2, Clock, Filter, Search, FileText, ShieldCheck } from 'lucide-react';
import { EmailLogEntry, EmailTemplate } from '../../types';
import { ComposeEmailModal } from './ComposeEmailModal';

interface PlexiMailSubsystemProps {
  mailHealth: any;
  emailLogs: EmailLogEntry[];
  templates: EmailTemplate[];
  onSendEmail: (data: { recipient: string; subject: string; template: string; bodyHtml: string }) => Promise<void>;
  onRefreshLogs: () => Promise<void>;
  isLoading: boolean;
}

export const PlexiMailSubsystem: React.FC<PlexiMailSubsystemProps> = ({
  mailHealth,
  emailLogs,
  templates,
  onSendEmail,
  onRefreshLogs,
  isLoading
}) => {
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const safeEmailLogs = Array.isArray(emailLogs) ? emailLogs : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];

  const filteredLogs = safeEmailLogs.filter((log) => {
    const matchesSearch =
      (log.recipient || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (log.subject || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (log.template || '').toLowerCase().includes(filterText.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Mail Subsystem Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                plexiMail Subsystem
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Spacemail Relay (mail.spacemail.com:465)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> BullMQ Active
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Enterprise Email Dispatch & Backup Notification Relay
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Transactional email engine managing automated Cloudflare R2 backup notifications to <code className="text-cyan-300 font-mono">admin@plexivia.com</code>, client invoicing, and SRE incident alerts.
            </p>
          </div>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-500/20 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Compose & Dispatch Email</span>
          </button>
        </div>
      </div>

      {/* SMTP Metrics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>SMTP Server</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono">mail.spacemail.com</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">Port 465 (SSL/TLS 1.3)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Primary Notification Inbox</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate">admin@plexivia.com</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Automated Cron Backups</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Redis Queue (BullMQ)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">0 Pending / Healthy</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Avg dispatch: 42ms</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Templates Configured</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{safeTemplates.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for automated triggers</div>
        </div>
      </div>

      {/* Interactive Email Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Email Dispatch Logs ({filteredLogs.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              History of all transactional and automated system emails dispatched via Spacemail
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter logs by recipient or subject..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-none w-64"
              />
            </div>

            <button
              onClick={onRefreshLogs}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Recipient</th>
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Template</th>
                <th className="pb-3 font-semibold">Relay</th>
                <th className="pb-3 font-semibold">Dispatched (UTC)</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/60 transition">
                  <td className="py-3 font-semibold text-white">
                    <span className={log.recipient === 'admin@plexivia.com' ? 'text-cyan-300 font-bold' : ''}>
                      {log.recipient}
                    </span>
                  </td>
                  <td className="py-3 text-slate-200 max-w-xs truncate" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                      {log.template}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {log.smtpServer || 'mail.spacemail.com:465'}
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {new Date(log.timestamp || log.queued_at || Date.now()).toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.status === 'SENT' || log.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : log.status === 'QUEUED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        templates={safeTemplates}
        onSendEmail={onSendEmail}
      />
    </div>
  );
};

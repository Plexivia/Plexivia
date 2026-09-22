import React, { useState } from 'react';
import { X, Mail, Send, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmailTemplate } from '../../types';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
  onSendEmail: (data: { recipient: string; subject: string; template: string; bodyHtml: string }) => Promise<void>;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSendEmail
}) => {
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(safeTemplates[0]?.id || 'cloudflare_r2_backup_report');
  const [recipient, setRecipient] = useState<string>('admin@plexivia.com');
  const [subject, setSubject] = useState<string>('[Plexivia Backup] PostgreSQL Automated Daily Backup - SUCCESS (2026-09-19)');
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = safeTemplates.find(t => t.id === tmplId);
    if (tmpl) {
      setRecipient(tmpl.defaultRecipient || 'admin@plexivia.com');
      setSubject(tmpl.subject || '');
    }
  };

  const currentTemplate = safeTemplates.find(t => t.id === selectedTemplateId) || safeTemplates[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject) return;

    setIsSending(true);
    try {
      await onSendEmail({
        recipient,
        subject,
        template: selectedTemplateId,
        bodyHtml: currentTemplate?.htmlPreview || '<p>Email content</p>'
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compose & Dispatch Email</h3>
              <p className="text-xs text-slate-400 font-mono">
                Relay: <span className="text-cyan-400 font-semibold">mail.spacemail.com:465</span> (SSL/TLS 1.3)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Template Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Pre-Engineered Template</span>
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {safeTemplates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Recipient Address</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. admin@plexivia.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* HTML Preview Frame */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Template HTML Live Preview</span>
            </label>
            <div
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-48 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: currentTemplate?.htmlPreview || '' }}
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold transition shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Email via Spacemail'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

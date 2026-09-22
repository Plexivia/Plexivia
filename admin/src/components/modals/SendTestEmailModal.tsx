import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Mail, Send, CheckCircle2, Shield } from 'lucide-react';

interface SendTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendTestEmailModal: React.FC<SendTestEmailModalProps> = ({ isOpen, onClose }) => {
  const { sendTestEmail } = useData();
  const [recipient, setRecipient] = useState('admin@plexivia.com');
  const [subject, setSubject] = useState('[PlexiMail] Spacemail Relay Verification Test');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim()) return;

    setLoading(true);
    try {
      await sendTestEmail(recipient.trim(), subject.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Spacemail Test Relay"
      subtitle="Send a live test payload through mail.spacemail.com:465 SMTP socket"
      maxWidth="lg"
    >
      <form onSubmit={handleSend} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Relay Host:</span>
            <span className="text-cyan-400 font-bold">mail.spacemail.com:465</span>
          </div>
          <div className="flex justify-between">
            <span>Encryption:</span>
            <span className="text-emerald-400 font-bold">TLS 1.3 / Direct SSL</span>
          </div>
          <div className="flex justify-between">
            <span>Sender Envelope:</span>
            <span className="text-slate-200">system@plexivia.com</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Recipient Email *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="operator@domain.com"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-950/50 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Transmitting via Spacemail...' : 'Send Relay Payload'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

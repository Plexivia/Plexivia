import React, { useEffect, useState } from 'react';
import { KeyRound, Eye, EyeOff, Sparkles, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { RoleBadge } from '../common/Badge';
import type { User } from '../../types';

interface ResetPasswordModalProps {
  user: User | null;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs';

// Generate a strong random password with upper, lower, digit and symbol characters
const generateStrongPassword = (): string => {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghjkmnpqrstuvwxyz', '23456789', '@#$%&*!'];
  const pick = (chars: string) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  const parts = [...sets.map(pick), ...Array.from({ length: 8 }, () => pick(sets.join('')))];
  for (let i = parts.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  return parts.join('');
};

// Render modal for an admin to set a new password for a team member
export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose }) => {
  const { resetUserPassword } = useData();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPassword('');
    setConfirm('');
    setVisible(false);
    setCopied(false);
    setError('');
  }, [user]);

  // Copy the current password to the clipboard
  const copyPassword = async (value = password) => {
    if (!value || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fill both fields with a generated password and copy it
  const handleGenerate = () => {
    const generated = generateStrongPassword();
    setPassword(generated);
    setConfirm(generated);
    setVisible(true);
    setError('');
    copyPassword(generated);
  };

  // Validate and submit the new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await resetUserPassword(user.dId || user.email || user.id, password);
      onClose();
    } catch {
      // Toast already shown by the data context
    } finally {
      setLoading(false);
    }
  };

  const name = user?.full_name || user?.name || 'User';

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Reset Password" subtitle="Set a new sign-in password for this team member" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-slate-900 dark:text-white">{name}</div>
            <div className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</div>
          </div>
          {user?.role && <RoleBadge role={user.role} />}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">New Password *</label>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate
            </button>
          </div>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={visible ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Minimum 8 characters"
              className={INPUT_CLASS}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button type="button" onClick={() => copyPassword()} title="Copy" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button type="button" onClick={() => setVisible((v) => !v)} title={visible ? 'Hide' : 'Show'} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password *</label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={visible ? 'text' : 'password'}
              required
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError('');
              }}
              placeholder="Re-enter the password"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          The account is activated and the member is emailed that their password changed. Share the new password with them directly.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;

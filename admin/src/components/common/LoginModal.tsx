import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import { Shield, Lock, Mail, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

// Render multi-step agency authentication modal
export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLoginModalOpen) return null;

  // Handle email check step
  const handleEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await apiClient.post('/api/v1/auth/login/check-email', { email: email.trim() });
      setStep('password');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'No account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password submission step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email.trim(), password);
      setStep('email');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => {
        closeLoginModal();
        setStep('email');
        setErrorMsg('');
      }}
      title="Plexivia Agency Authentication"
      subtitle="Enter your verified Plexivia agency credentials"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs text-cyan-300">
            Internal microservice gateway for agency developers, designers, PMs, and SRE team.
          </p>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailNext} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Agency Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Checking Account...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-sans"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Plexivia'}</span>
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

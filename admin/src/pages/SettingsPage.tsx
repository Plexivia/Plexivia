import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Key,
  Shield,
  Save,
  Moon,
  Sun,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [apiKey, setApiKey] = useState('plx_live_94f8a29b3c7d1e0f5432a');
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    updateCurrentUser({
      full_name: fullName,
      email,
    });
    setTimeout(() => {
      setLoading(false);
      showToast('success', 'Settings Saved', 'Operator configuration updated.');
    }, 400);
  };

  const regenerateApiKey = () => {
    const newKey = 'plx_live_' + Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 10);
    setApiKey(newKey);
    showToast('info', 'API Key Rotated', 'Ensure downstream microservices update their header token.');
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
          Operator Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage operator authentication, API Gateway tokens, Spacemail notifications, and microservice cluster preferences.
        </p>
      </div>

      {/* Operator Profile Card */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">
            Operator Profile & Authentication
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Operator Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Agency Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* API Gateway & JWT Secret Management */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Key className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">
            Central API Gateway Access Tokens
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Use this Bearer key for external CI/CD webhooks, automated backup scripts (`make backup`), and REST API authentication at <code className="text-cyan-400 font-mono">https://api.plexivia.com</code>.
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="text-amber-400 font-bold truncate pr-3">{apiKey}</div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyKey}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey ? 'Copied' : 'Copy Key'}
            </button>
            <button
              onClick={regenerateApiKey}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Rotate
            </button>
          </div>
        </div>
      </div>

      {/* Theme & Display Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sun className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">
            Display & UI Appearance
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-xs font-bold text-white font-mono block">
              Color Theme Mode: {theme === 'dark' ? 'Cyberpunk Dark (Recommended)' : 'Clean Slate Light'}
            </span>
            <span className="text-[11px] text-slate-400">
              Toggle between high-contrast cyberpunk dark palette and crisp daylight theme.
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" /> Switch to Light
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400" /> Switch to Dark
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

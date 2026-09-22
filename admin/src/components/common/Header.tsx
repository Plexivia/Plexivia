import React from 'react';
import { ShieldCheck, Server, Terminal, Radio, Mail, GitFork, HardDrive, RefreshCw } from 'lucide-react';
import { SystemVersion } from '../../types/index';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemVersion: SystemVersion | null;
  isWsConnected: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemVersion,
  isWsConnected,
  onRefresh,
  isRefreshing
}) => {
  const tabs = [
    { id: 'overview', label: 'Ops Command Center', icon: Radio, badge: 'LIVE' },
    { id: 'cpanel', label: 'cPanel Fleet Manager', icon: Server, badge: '14.128.14.223' },
    { id: 'guard', label: 'plexiGuard SRE', icon: ShieldCheck, badge: isWsConnected ? 'STREAMING' : 'CONNECTING' },
    { id: 'mail', label: 'plexiMail Subsystem', icon: Mail, badge: 'SMTP 465' },
    { id: 'gitea', label: 'Gitea Private Git', icon: GitFork, badge: 'Port 3001' },
    { id: 'backup', label: 'Cloudflare R2 & Version', icon: HardDrive, badge: systemVersion?.version ? ('v' + systemVersion.version) : 'v0.0.0' }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Ecosystem Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Plexivia
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Microservices Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Production Master VPS (SG-01)</span>
              </p>
            </div>
          </div>

          {/* Real-time Status Indicators & Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
                <span className="text-slate-300">WS Telemetry:</span>
                <span className={isWsConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {isWsConnected ? '1000ms Sync' : 'Simulating'}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="text-slate-300">
                Baseline: <span className="text-cyan-400 font-semibold">{systemVersion?.baseline || 'v0.0.0'}</span>
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Fleet'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap ${isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

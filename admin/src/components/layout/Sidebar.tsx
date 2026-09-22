import React from 'react';
import { NavTab } from '../../types';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  KanbanSquare,
  Building2,
  Timer,
  Users,
  Server,
  ShieldCheck,
  Mail,
  GitBranch,
  Database,
  Settings,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { clients, tasks, users, fleet, repos, activeTimer } = useData();

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeFleet = Array.isArray(fleet) ? fleet : [];
  const safeRepos = Array.isArray(repos) ? repos : [];

  const activeTasksCount = safeTasks.filter(t => t.status !== 'DONE').length;
  const onlineFleetCount = safeFleet.filter(n => n.status === 'ONLINE').length;

  const formatTimerSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'projects' as NavTab,
      label: 'Projects & Kanban',
      icon: KanbanSquare,
      badge: `${activeTasksCount} open`,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'clients' as NavTab,
      label: 'Clients Directory',
      icon: Building2,
      badge: `${safeClients.length}`,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'timer' as NavTab,
      label: 'Time Tracker',
      icon: Timer,
      badge: activeTimer ? (activeTimer.isRunning ? `⏱ ${formatTimerSeconds(activeTimer.seconds)}` : 'Paused') : undefined,
      badgeColor: activeTimer ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : undefined,
    },
    {
      id: 'team' as NavTab,
      label: 'Agency Team',
      icon: Users,
      badge: `${safeUsers.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'fleet' as NavTab,
      label: 'VPS Fleet (cPanel)',
      icon: Server,
      badge: `${onlineFleetCount}/${safeFleet.length}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'sre' as NavTab,
      label: 'SRE Telemetry',
      icon: ShieldCheck,
      badge: 'plexiGuard',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'mail' as NavTab,
      label: 'Mail Subsystem',
      icon: Mail,
      badge: 'Spacemail',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'git' as NavTab,
      label: 'Private Git (Gitea)',
      icon: GitBranch,
      badge: `${safeRepos.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'backups' as NavTab,
      label: 'Version & Backups',
      icon: Database,
      badge: 'R2 Cloud',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950/95 dark:bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight font-mono">
                  Plexi<span className="text-cyan-400">Hub</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-semibold">
                  PROD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Agency Mission Control</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
            Agency Workspace
          </div>

          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
            Infrastructure & SRE Fleet
          </div>

          {navItems.slice(5).map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Fleet Pulse Widget */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                  All Nodes Nominal
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  PostgreSQL 16 • R2 Backup OK
                </div>
              </div>
            </div>
            <a
              href="https://guard.plexivia.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Open plexiGuard Telemetry"
              className="text-slate-400 hover:text-cyan-400 p-1 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

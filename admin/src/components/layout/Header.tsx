import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { RoleBadge } from '../common/Badge';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  Play,
  Pause,
  Square,
  UserCheck,
  ChevronDown,
  Command
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onToggleNotifications,
  unreadNotificationsCount = 2,
}) => {
  const { user, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeTimer, pauseTimer, resumeTimer, stopTimer } = useData();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const formatTimer = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const prefix = hours > 0 ? `${hours}:` : '';
    return `${prefix}${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 lg:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all w-44 sm:w-64 md:w-80 justify-between group shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate font-mono">Search projects, nodes, clients...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Active Timer Pill if running */}
        {activeTimer && (
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wider">
                {formatTimer(activeTimer.seconds)}
              </span>
            </div>

            <span className="text-[11px] text-amber-400/80 max-w-[120px] truncate border-l border-amber-500/30 pl-2">
              {activeTimer.taskTitle}
            </span>

            <div className="flex items-center gap-1 pl-1">
              {activeTimer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  title="Pause Timer"
                  className="p-1 text-amber-300 hover:text-white rounded hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  title="Resume Timer"
                  className="p-1 text-amber-300 hover:text-white rounded hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => stopTimer()}
                title="Stop & Log Time"
                className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch theme`}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={onToggleNotifications}
          title="Activity & System Alerts"
          className="relative p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
          )}
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group cursor-pointer"
          >
            <img
              src={user.avatar}
              alt={user.full_name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/40"
            />
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {user.full_name}
                </span>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-scale-up">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white font-mono">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    Switch Operator Identity
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Terminate Operator Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

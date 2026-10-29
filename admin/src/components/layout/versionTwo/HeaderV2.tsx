import React, { useState } from 'react';
import { Bell, Menu, Moon, Search, Sparkles, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';
import { useAppStore } from '@/store/useAppStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface HeaderV2Props {
  isMobileOpen: boolean;
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

// Keys that must survive a cache clean so the user stays signed in with the same theme
const PRESERVED_STORAGE_KEYS = ['accessToken', 'refreshToken', 'user', 'plexivia_theme'];

const iconButtonClass =
  'relative flex size-8 shrink-0 items-center justify-center rounded-full border border-v2-primary bg-v2-shell text-v2-primary transition-colors hover:bg-v2-primary/10 cursor-pointer';

// Clears browser caches and non-session storage, then reloads the app
const cleanAppCache = async () => {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
  sessionStorage.clear();
  Object.keys(localStorage)
    .filter((key) => !PRESERVED_STORAGE_KEYS.includes(key))
    .forEach((key) => localStorage.removeItem(key));
  window.location.reload();
};

// Renders the TailAdmin-style always-dark top navbar for layout version two
export const HeaderV2 = ({ isMobileOpen, onToggleSidebar, onOpenNotifications }: HeaderV2Props) => {
  const { theme, toggleTheme } = useThemeStore();
  const { setSearchModalOpen } = useAppStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [isCleaning, setIsCleaning] = useState(false);
  const isDark = theme === 'dark';

  // Runs the cache clean once and shows a busy state until the page reloads
  const handleCleanCache = () => {
    if (isCleaning) return;
    setIsCleaning(true);
    cleanAppCache().catch(() => setIsCleaning(false));
  };

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-v2-border bg-v2-shell">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-1.5 lg:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-400 text-amber-400 transition-colors hover:bg-amber-400/10 cursor-pointer"
          >
            {isMobileOpen ? <X className="size-4" /> : <Menu className="size-4 rtl:-scale-x-100" />}
          </button>

          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden h-8 items-center gap-2 rounded-lg border border-white/15 bg-white/10 ps-2.5 pe-1.5 text-xs text-white/70 transition-colors hover:bg-white/15 xl:flex xl:w-[260px] cursor-pointer"
          >
            <Search className="size-3.5 text-white/60" />
            <span className="flex-1 text-start">Search...</span>
            <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search"
            className={cn(iconButtonClass, 'xl:hidden')}
          >
            <Search className="size-4" />
          </button>

          <button
            type="button"
            onClick={handleCleanCache}
            disabled={isCleaning}
            title="Clear cached data and reload"
            className="flex h-7 items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 text-[11px] font-medium text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className={cn('size-3.5', isCleaning && 'animate-spin')} />
            <span className="hidden sm:inline">{isCleaning ? 'Cleaning...' : 'Clean Cache'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={iconButtonClass}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : 'Notifications'}
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-v2-primary text-black transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white ring-2 ring-v2-shell">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderV2;

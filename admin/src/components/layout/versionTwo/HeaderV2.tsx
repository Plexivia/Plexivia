import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';
import { useAppStore } from '@/store/useAppStore';

interface HeaderV2User {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  subRole?: string;
  avatar?: string;
  avatarUrl?: string;
  photoUrl?: string;
}

interface HeaderV2Props {
  user?: HeaderV2User | null;
  isMobileOpen: boolean;
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

const iconButtonClass =
  'relative flex size-11 shrink-0 items-center justify-center rounded-full border border-v2-primary bg-v2-shell text-v2-primary transition-colors hover:bg-v2-primary/10 cursor-pointer';

// Renders the TailAdmin-style always-dark top navbar for layout version two
export const HeaderV2 = ({ user = null, isMobileOpen, onToggleSidebar, onOpenNotifications, onLogout }: HeaderV2Props) => {
  const { theme, toggleTheme } = useThemeStore();
  const { setSearchModalOpen } = useAppStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'User';
  const avatar = user?.avatar || user?.avatarUrl || user?.photoUrl;
  const roleLabel = user?.subRole ? user.subRole.replace(/_/g, ' ') : user?.role || 'Staff';

  useEffect(() => {
    // Closes the user menu when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-v2-border bg-v2-shell">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-3 lg:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-v2-primary text-v2-primary transition-colors hover:bg-v2-primary/10 lg:size-11 cursor-pointer"
          >
            {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5 rtl:-scale-x-100" />}
          </button>

          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden h-11 items-center gap-3 rounded-lg border border-v2-primary bg-v2-surface ps-4 pe-2.5 text-sm text-v2-muted transition-colors hover:border-v2-primary/80 xl:flex xl:w-[430px] cursor-pointer"
          >
            <Search className="size-5 text-v2-muted" />
            <span className="flex-1 text-start">Search or type command...</span>
            <kbd className="rounded-lg border border-v2-border bg-white/5 px-1.5 py-1 font-mono text-xs text-v2-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search"
            className={cn(iconButtonClass, 'xl:hidden')}
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className={iconButtonClass}
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className={iconButtonClass}
          >
            <Bell className="size-5" />
            <span className="absolute top-0.5 end-0 flex size-2 rounded-full bg-orange-400">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-75" />
            </span>
          </button>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 text-white cursor-pointer"
            >
              <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-v2-primary/15 text-sm font-bold text-v2-primary">
                {avatar ? <img src={avatar} alt={displayName} className="size-full object-cover" /> : displayName[0].toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:block">{displayName}</span>
              <ChevronDown className={cn('hidden size-4 text-v2-muted transition-transform sm:block', isUserMenuOpen && 'rotate-180')} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute end-0 mt-4 flex w-64 flex-col rounded-2xl border border-v2-border bg-v2-shell p-3 shadow-2xl">
                <div className="px-1 pb-3">
                  <span className="block text-sm font-medium text-white">{displayName}</span>
                  <span className="block text-xs capitalize text-v2-muted">{roleLabel}</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-v2-border pt-3">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 hover:text-rose-400 cursor-pointer"
                  >
                    <LogOut className="size-5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderV2;

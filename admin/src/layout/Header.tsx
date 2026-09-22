import React from 'react';
import { Menu, Sun, Moon, Palette, Search } from 'lucide-react';
import { useDashboard } from '../providers/DashboardProvider';
import { useTheme } from '../theme/ThemeProvider';
import { Breadcrumbs } from './Breadcrumbs';

export interface HeaderProps {
  title?: string | React.ReactNode;
  breadcrumbs?: boolean;
  searchSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

export function Header({
  title,
  breadcrumbs = true,
  searchSlot,
  rightSlot,
  actionsSlot,
  className = '',
  showThemeToggle = true,
}: HeaderProps) {
  const { toggleMobileMenu, branding } = useDashboard();
  const { isDark, setMode, applyPreset, presets } = useTheme();

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border transition-colors ${className}`}
    >
      {/* Left: Mobile Toggle & Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          {title ? (
            typeof title === 'string' ? (
              <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
            ) : (
              title
            )
          ) : breadcrumbs ? (
            <Breadcrumbs />
          ) : (
            <span className="font-semibold text-sm text-foreground">{branding.title}</span>
          )}
        </div>
      </div>

      {/* Center: Search Slot (if provided) */}
      {searchSlot && (
        <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
          {searchSlot}
        </div>
      )}

      {/* Right: Actions, Theme Switcher & Right Slot */}
      <div className="flex items-center gap-2">
        {actionsSlot}

        {showThemeToggle && (
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setMode(isDark ? 'light' : 'dark')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-all"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Quick Preset Selector */}
            <div className="relative group">
              <button
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                title="Theme Presets"
              >
                <Palette className="w-4 h-4 text-[var(--primary)]" />
              </button>

              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-48 p-1.5 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Presets
                </div>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted flex items-center gap-2 text-card-foreground transition-colors"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: preset.config.colors?.primary }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {rightSlot}
      </div>
    </header>
  );
}

import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  Search,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/useThemeStore';
import { useAppStore } from '@/store/useAppStore';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface TopBreadcrumbBarProps {
  breadcrumbs?: BreadcrumbItem[];
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function TopBreadcrumbBar({
  breadcrumbs,
  showBack = true,
  actions,
}: TopBreadcrumbBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { setSearchModalOpen } = useAppStore();

  // Automatically derive breadcrumbs from current path if not explicitly provided
  const derivedBreadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
      return [{ label: 'Overview' }];
    }

    return pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const formattedLabel = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return {
        label: formattedLabel,
        path: index === pathSegments.length - 1 ? undefined : path,
      };
    });
  }, [breadcrumbs, location.pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Back button & Breadcrumb path */}
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Overview"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Home</span>
          </Link>

          {derivedBreadcrumbs.map((crumb, idx) => {
            const isLast = idx === derivedBreadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                {isLast || !crumb.path ? (
                  <span className="text-foreground font-semibold truncate max-w-[150px] sm:max-w-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Search, Theme Toggle, Notification & Custom Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search Shortcut */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-muted-foreground text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0" />
          )}
        </Button>

        {/* Notifications Icon Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full ring-2 ring-background" />
        </Button>

        {/* Extra actions if provided */}
        {actions}
      </div>
    </header>
  );
}

export default TopBreadcrumbBar;

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageBarStore } from '@/store/usePageBarStore';

/**
 * Universal page bar for Plexivia ERP.
 *
 * Inside the V2 layout it renders into the full-width #v2-page-bar slot under the navbar
 * (background spans the full width, content is held to the page max width).
 * Elsewhere it falls back to rendering inline.
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.subtitle] - Accepted for compatibility; not shown in the page bar
 * @param {string} [props.description] - Alias for subtitle
 * @param {React.ReactNode|string|Function} [props.icon] - Lucide icon name, component, or element
 * @param {string} [props.badge] - Optional badge / pill tag text
 * @param {React.ReactNode} [props.actions] - Right side page actions (export, reset, filters)
 * @param {React.ReactNode} [props.children] - Action slot fallback
 * @param {boolean} [props.showBack=true] - Show the back button
 * @param {boolean} [props.showRefresh=true] - Show the refresh button
 * @param {boolean} [props.auto=false] - Internal: marks the automatic bar so it does not hide itself
 * @param {Function} [props.onRefresh] - Custom refresh handler (defaults to reloading the route)
 * @param {string} [props.className] - Additional container class names
 * @param {string} [props.titleClassName] - Additional title class names
 * @param {string} [props.subtitleClassName] - Additional subtitle class names
 */
export function HeaderTitle({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  actions,
  children,
  showBack = true,
  showRefresh = true,
  onRefresh,
  auto = false,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const actionElements = actions || children;

  useEffect(() => {
    setSlot(document.getElementById('v2-page-bar'));
  }, []);

  // A page that renders its own bar tells the automatic one to step aside
  useEffect(() => (auto ? undefined : usePageBarStore.getState().register()), [auto]);

  // Goes to the previous page, or the overview when there is no history
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/overview');
  };

  // Uses the page's own refresh when given, otherwise re-renders the current route
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (!onRefresh) return navigate(0);
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  const renderIcon = (iconClass) => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'string') {
      const IconComponent = LucideIcons[Icon] || LucideIcons.FileText;
      return <IconComponent className={cn(iconClass, 'shrink-0')} />;
    }
    const IconComponent = Icon;
    return <IconComponent className={cn(iconClass, 'shrink-0')} />;
  };

  const bar = (
    <div className={cn('no-print w-full select-none border-b border-white/10 bg-[#161a20] text-white', className)}>
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        {/* Left: Back + Title */}
        <div className="flex min-w-0 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              title="Go back"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white transition-colors hover:bg-rose-500 cursor-pointer"
            >
              <LucideIcons.ArrowLeft className="size-4" />
            </button>
          )}
          {renderIcon('size-5 text-v2-primary')}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={cn('truncate text-base font-bold tracking-tight text-white', titleClassName)}>
                {title}
              </h1>
              {badge && (
                <span
                  className="hidden max-w-xs truncate rounded-full border border-v2-primary/30 bg-v2-primary/15 px-2 py-0.5 text-[10px] font-semibold text-v2-primary sm:inline-block"
                  title={typeof badge === 'string' ? badge : undefined}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Refresh + page actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {showRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh"
              className="flex size-8 items-center justify-center rounded-lg bg-sky-500 text-white transition-colors hover:bg-sky-400 cursor-pointer"
            >
              <LucideIcons.RotateCw className={cn('size-4', refreshing && 'animate-spin')} />
            </button>
          )}
          {actionElements}
        </div>
      </div>
    </div>
  );

  return slot ? createPortal(bar, slot) : bar;
}

/**
 * Reusable Mode Switcher for Document Studio / Printables (Edit Form vs Print Preview)
 */
export function HeaderModeSwitcher({
  viewMode = 'form',
  onModeChange,
  editLabel = 'Edit Form',
  previewLabel = 'Print Preview',
  className = '',
}) {
  return (
    <div className={cn('bg-white/10 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 border border-white/15', className)}>
      <button
        type="button"
        onClick={() => onModeChange('form')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'form'
            ? 'bg-white text-black shadow-md font-bold'
            : 'text-sky-100/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <LucideIcons.Edit3 className="size-3.5" />
        <span>{editLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange('preview')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'preview'
            ? 'bg-white text-black shadow-md font-bold'
            : 'text-sky-100/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <LucideIcons.CheckCircle2 className="size-3.5 text-emerald-600" />
        <span>{previewLabel}</span>
      </button>
    </div>
  );
}

export default HeaderTitle;

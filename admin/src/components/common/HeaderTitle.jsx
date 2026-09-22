import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Universal Header Title component for Plexivia ERP.
 * 
 * Renders the signature Dark Blue / Sky Indigo gradient banner with glowing ambient lighting,
 * high-contrast typography, and flexible action toolbars across all app pages and Document Studio.
 * 
 * @param {Object} props
 * @param {string} props.title - Main header title
 * @param {string} [props.subtitle] - Subtitle / description text
 * @param {string} [props.description] - Alias for subtitle
 * @param {React.ReactNode|string|Function} [props.icon] - Lucide icon name, component, or element
 * @param {string} [props.badge] - Optional badge / pill tag text
 * @param {React.ReactNode} [props.actions] - Right side action elements (buttons, filters, toolbars)
 * @param {React.ReactNode} [props.children] - Additional elements or action slot fallback
 * @param {'general'|'printables'|'printable'} [props.variant='general'] - Variation layout style
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
  variant = 'general',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  const resolvedSubtitle = subtitle || description;
  const actionElements = actions || children;

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

  return (
    <div
      className={cn(
        'no-print bg-gradient-to-r from-sky-950 via-indigo-950 to-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden transition-all select-none',
        className
      )}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Heading & Description */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className={cn(
                'text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5',
                titleClassName
              )}
            >
              {renderIcon('size-6 text-sky-400')}
              <span className="truncate">{title}</span>
            </h1>
            {badge && (
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 truncate max-w-xs sm:max-w-md inline-block"
                title={typeof badge === 'string' ? badge : undefined}
              >
                {badge}
              </span>
            )}
          </div>

          {resolvedSubtitle && (
            <p
              className={cn(
                'text-xs sm:text-[13px] text-sky-100/80 max-w-3xl leading-relaxed',
                subtitleClassName
              )}
            >
              {resolvedSubtitle}
            </p>
          )}
        </div>

        {/* Right: Actions Container */}
        {actionElements && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actionElements}
          </div>
        )}
      </div>
    </div>
  );
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

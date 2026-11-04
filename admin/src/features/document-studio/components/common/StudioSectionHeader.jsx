import React from 'react';

/**
 * Section bar used across every Document Studio form.
 *
 * Neutral surface + border with a primary-tinted icon, so the forms follow the
 * dashboard's own palette instead of the hardcoded blue bars they used to have.
 * `children` is the right-hand slot (running totals, an "Add item" button).
 */
export function StudioSectionHeader({ icon: Icon, title, children, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-xs ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="size-4 shrink-0 text-primary" />}
        <span className="truncate">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default StudioSectionHeader;

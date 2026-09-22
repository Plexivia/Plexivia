import React from 'react';
import { cn } from '@/lib/utils';

export interface HeaderTitleProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function HeaderTitle({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}: HeaderTitleProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}

export default HeaderTitle;

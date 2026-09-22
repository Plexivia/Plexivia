import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There is no data available to display at this moment.',
  icon,
  actionLabel,
  onAction,
  className = '',
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50',
        className
      )}
    >
      <div className="p-3.5 rounded-2xl bg-muted text-muted-foreground mb-4">
        {icon || <PackageOpen className="w-8 h-8 stroke-1" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default" size="sm">
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}

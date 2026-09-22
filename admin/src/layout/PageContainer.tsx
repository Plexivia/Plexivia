import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  title,
  subtitle,
  breadcrumbs,
  showBreadcrumbs = false,
  actions,
  className = '',
  maxWidth = '7xl',
}: PageContainerProps) {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 mx-auto w-full ${MAX_WIDTH_MAP[maxWidth]} ${className}`}>
      {/* Page Header (if title or breadcrumbs are present) */}
      {(title || showBreadcrumbs || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
          <div className="space-y-1">
            {showBreadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Page Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}

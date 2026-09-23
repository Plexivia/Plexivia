import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  toasts?: React.ReactNode;
  modals?: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

/**
 * Universal Dashboard Shell & Container Layout.
 * 
 * Features:
 * - Fluid SidebarInset auto-width adjusting (Sidebar collapsed 48px <-> expanded 256px)
 * - Fixed/Sticky top navbar height (56px / h-14)
 * - Strict viewport height constraint: h-[calc(100vh-3.5rem)] with internal scroll only
 * - Viewport container constraint: max-w-[1440px] 3xl:max-w-[1600px] mx-auto
 * - Responsive padding: p-4 (mobile), sm:p-6 (tablet), lg:p-8 (desktop)
 */
export function DashboardLayout({
  sidebar,
  header,
  children,
  toasts = null,
  modals = null,
  className = '',
  mainClassName = '',
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn('flex h-[100dvh] max-h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-background text-foreground transition-colors', className)}>
        {/* Navigation Sidebar */}
        {sidebar}

        {/* Main Application Inset (Auto-adjusts width as sidebar collapses or expands) */}
        <SidebarInset className="flex flex-1 flex-col min-w-0 h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
          {/* Sticky Header (Fixed 56px / h-14 height) */}
          {header}

          {/* Dynamic Content View Container (Stable scrollbar-gutter prevents width jitter between pages) */}
          <main
            className={cn(
              'flex-1 min-h-0 overflow-y-auto w-full scrollbar-theme',
              mainClassName
            )}
            style={{ scrollbarGutter: 'stable' }}
          >
            <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {children}
            </div>
          </main>

          {/* Global Utilities */}
          {toasts}
          {modals}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;

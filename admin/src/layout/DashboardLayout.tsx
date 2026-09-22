import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDashboard } from '../providers/DashboardProvider';
import { cn } from '../lib/utils';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  headerTitle?: string | React.ReactNode;
  headerRightSlot?: React.ReactNode;
  headerSearchSlot?: React.ReactNode;
  headerActionsSlot?: React.ReactNode;
  sidebarHeaderSlot?: React.ReactNode;
  sidebarFooterSlot?: React.ReactNode;
  hideSidebar?: boolean;
  hideHeader?: boolean;
  className?: string;
  contentClassName?: string;
}

export function DashboardLayout({
  children,
  headerTitle,
  headerRightSlot,
  headerSearchSlot,
  headerActionsSlot,
  sidebarHeaderSlot,
  sidebarFooterSlot,
  hideSidebar = false,
  hideHeader = false,
  className = '',
  contentClassName = '',
}: DashboardLayoutProps) {
  const { sidebarCollapsed } = useDashboard();

  return (
    <div className={cn('min-h-screen bg-background text-foreground transition-colors', className)}>
      {/* Dynamic Sidebar */}
      {!hideSidebar && (
        <Sidebar
          headerSlot={sidebarHeaderSlot}
          footerSlot={sidebarFooterSlot}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          !hideSidebar && (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64')
        )}
      >
        {/* Header */}
        {!hideHeader && (
          <Header
            title={headerTitle}
            rightSlot={headerRightSlot}
            searchSlot={headerSearchSlot}
            actionsSlot={headerActionsSlot}
          />
        )}

        {/* Page View Body */}
        <main className={cn('flex-1 w-full', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}

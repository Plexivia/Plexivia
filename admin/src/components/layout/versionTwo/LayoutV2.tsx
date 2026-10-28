import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { MenuGroup } from '@/types/index';
import { SidebarV2 } from './SidebarV2';
import { HeaderV2 } from './HeaderV2';

interface LayoutV2Props {
  menuGroups: MenuGroup[];
  user?: any;
  onLogout: () => void;
  onOpenNotifications: () => void;
  modals?: React.ReactNode;
  toasts?: React.ReactNode;
  children: React.ReactNode;
}

const DESKTOP_BREAKPOINT = 1024;

// Renders the TailAdmin-style dashboard shell with an always-dark sidebar and navbar
export const LayoutV2 = ({ menuGroups, user, onLogout, onOpenNotifications, modals = null, toasts = null, children }: LayoutV2Props) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Collapses the desktop sidebar or opens the mobile drawer depending on screen width
  const handleToggleSidebar = () => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      setIsExpanded((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  // Closes the mobile drawer after a navigation link is clicked
  const handleNavigate = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <SidebarV2
        menuGroups={menuGroups}
        user={user}
        isExpanded={isExpanded}
        isHovered={isHovered}
        isMobileOpen={isMobileOpen}
        onHoverChange={setIsHovered}
        onNavigate={handleNavigate}
      />

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out',
          isExpanded || isHovered ? 'lg:ms-[290px]' : 'lg:ms-[90px]'
        )}
      >
        <HeaderV2
          user={user}
          isMobileOpen={isMobileOpen}
          onToggleSidebar={handleToggleSidebar}
          onOpenNotifications={onOpenNotifications}
          onLogout={onLogout}
        />
        <main className="mx-auto w-full max-w-[1440px] space-y-6 p-4 md:p-6">
          {children}
        </main>
      </div>

      {toasts}
      {modals}
    </div>
  );
};

export default LayoutV2;

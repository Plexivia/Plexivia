import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { NAVIGATION_MENU_GROUPS } from '@/constants/navigation';
import { usePageBarStore } from '@/store/usePageBarStore';
import { useData } from '@/context/DataContext';

interface NavNode {
  title: string;
  url?: string;
  icon?: React.ElementType;
  items?: NavNode[];
}

// Flatten the sidebar tree into one list of linkable entries
const flatten = (nodes: NavNode[], acc: NavNode[] = []): NavNode[] => {
  nodes.forEach((n) => {
    if (n.url) acc.push(n);
    if (n.items) flatten(n.items, acc);
  });
  return acc;
};

const NAV_ENTRIES = flatten(NAVIGATION_MENU_GROUPS.flatMap((g) => g.items as NavNode[]));

// Title and icon for the current route, using the longest matching sidebar entry
const resolve = (pathname: string) => {
  const match = NAV_ENTRIES.filter((n) => pathname === n.url || pathname.startsWith(`${n.url}/`)).sort(
    (a, b) => (b.url?.length || 0) - (a.url?.length || 0)
  )[0];
  if (match) return { title: match.title, icon: match.icon };
  const last = pathname.split('/').filter(Boolean).pop() || 'overview';
  return { title: last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), icon: LayoutDashboard };
};

// Page bar (back, title, refresh) for every page that does not render its own
export const AutoPageBar: React.FC = () => {
  const { pathname } = useLocation();
  const hasCustomBar = usePageBarStore((s) => s.custom > 0);
  const queryClient = useQueryClient();
  const { refreshAll } = useData();
  const { title, icon } = useMemo(() => resolve(pathname), [pathname]);

  if (hasCustomBar) return null;

  return (
    <HeaderTitle
      auto
      title={title}
      icon={icon}
      onRefresh={async () => {
        await Promise.all([refreshAll(), queryClient.invalidateQueries()]);
        window.dispatchEvent(new Event('plexivia:refresh'));
      }}
    />
  );
};

export default AutoPageBar;

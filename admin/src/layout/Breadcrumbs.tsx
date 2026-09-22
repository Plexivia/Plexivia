import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useDashboard } from '../providers/DashboardProvider';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className = '', showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const { navigation } = useDashboard();

  // If custom items are not provided, auto generate from pathname and navigation
  const resolvedItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const paths = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];

    let currentPath = '';
    paths.forEach((segment) => {
      currentPath += `/${segment}`;
      // Find matching nav item label if any
      let matchedLabel = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      const findInNav = (navs: any[]) => {
        for (const n of navs) {
          if (n.path === currentPath) {
            matchedLabel = n.label;
            return;
          }
          if (n.children) findInNav(n.children);
        }
      };
      findInNav(navigation);

      result.push({
        label: matchedLabel,
        path: currentPath,
      });
    });

    return result;
  }, [items, location.pathname, navigation]);

  return (
    <nav className={`flex items-center space-x-1.5 text-xs text-muted-foreground ${className}`}>
      {showHome && (
        <Link
          to="/"
          className="flex items-center hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>
      )}

      {resolvedItems.map((item, index) => {
        const isLast = index === resolvedItems.length - 1;
        return (
          <React.Fragment key={item.path || index}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            {isLast || !item.path ? (
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

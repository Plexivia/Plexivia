import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuGroup, MenuItem } from '@/types/index';
import brandLogoImg from '@/assets/brand-dark.png';
import brandIconImg from '@/assets/brand-icon-dark.png';

interface SidebarV2Props {
  menuGroups: MenuGroup[];
  user?: {
    name?: string;
    fullName?: string;
    email?: string;
    role?: string;
    subRole?: string;
    sub_role?: string;
    designation?: string;
    avatar?: string;
    avatarUrl?: string;
    photoUrl?: string;
  } | null;
  brandPath?: string;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  onHoverChange: (hovered: boolean) => void;
  onNavigate: () => void;
  onLogout: () => void;
}

// Returns the navigation path of a menu item
const getItemPath = (item: MenuItem) => item.url || item.path || item.href || '';

// Returns the display label of a menu item or group
const getItemLabel = (item: MenuItem) => item.title || item.name || item.label || '';

// Checks whether the user's role is allowed to see a menu entry
const isRoleAllowed = (
  entry: { roles?: string[]; excludeRoles?: string[] },
  role: string,
  subRole: string
) => {
  if (entry.roles?.length && !entry.roles.includes(role) && !entry.roles.includes(subRole)) return false;
  if (entry.excludeRoles?.length && (entry.excludeRoles.includes(role) || entry.excludeRoles.includes(subRole))) return false;
  return true;
};

// Renders a menu icon component with a fallback icon
const MenuIcon = ({ icon, className }: { icon?: any; className?: string }) => {
  const IconComponent = icon || FileText;
  return <IconComponent className={cn('size-5 shrink-0 transition-colors', className)} />;
};

// Renders the TailAdmin-style always-dark navigation sidebar for layout version two
export const SidebarV2 = ({
  menuGroups,
  user = null,
  brandPath = '/overview',
  isExpanded,
  isHovered,
  isMobileOpen,
  onHoverChange,
  onNavigate,
  onLogout,
}: SidebarV2Props) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const showFull = isExpanded || isHovered || isMobileOpen;
  // Labels stay mounted and fade with the width animation instead of popping in and out
  const fadeClass = cn('whitespace-nowrap transition-opacity duration-200', showFull ? 'opacity-100 delay-100' : 'opacity-0 lg:pointer-events-none');
  const userRole = String(user?.role || '').toLowerCase();
  const userSubRole = String(user?.subRole || user?.sub_role || user?.designation || '').toLowerCase();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'User';
  const avatar = user?.avatar || user?.avatarUrl || user?.photoUrl;
  const roleLabel = user?.subRole ? user.subRole.replace(/_/g, ' ') : user?.role || 'Staff';

  useEffect(() => {
    // Closes the user menu when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Checks whether a menu item matches the current route
  const isItemActive = (item: MenuItem) => {
    if (item.isSectionLabel) return false;
    if (item.activePaths?.includes(location.pathname)) return true;
    const itemPath = getItemPath(item);
    if (!itemPath) return false;
    if (itemPath === '/' || item.exact) return location.pathname === itemPath;
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);
  };

  // Checks whether any child of a parent menu item matches the current route
  const hasActiveChild = (item: MenuItem) => (item.items || item.childItems || []).some(isItemActive);

  useEffect(() => {
    const activeParent = menuGroups
      .flatMap((group) => group.items)
      .find((item) => hasActiveChild(item));
    if (activeParent) setOpenSubmenu(getItemPath(activeParent) || getItemLabel(activeParent));
  }, [location.pathname, menuGroups]);

  // Opens or closes a parent menu item's submenu
  const toggleSubmenu = (id: string) => {
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };

  // Renders a parent menu item with its collapsible submenu
  const renderParentItem = (item: MenuItem, children: MenuItem[]) => {
    const id = getItemPath(item) || getItemLabel(item);
    const isOpen = openSubmenu === id && showFull;
    const isActive = hasActiveChild(item);

    return (
      <li key={id}>
        <button
          type="button"
          onClick={() => toggleSubmenu(id)}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
            isActive || isOpen ? 'bg-v2-primary/12 text-v2-primary' : 'text-white hover:bg-white/5 hover:text-v2-primary',
          )}
        >
          <MenuIcon icon={item.icon} className={isActive || isOpen ? 'text-v2-primary' : 'text-white group-hover:text-v2-primary'} />
          <span className={cn('truncate', fadeClass)}>{getItemLabel(item)}</span>
          <ChevronDown className={cn('ms-auto size-4 shrink-0 transition-all duration-200', fadeClass, isOpen && 'rotate-180')} />
        </button>
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <ul className="overflow-hidden ms-9 space-y-1">
            {children
              .filter((child) => isRoleAllowed(child, userRole, userSubRole))
              .map((child, idx) =>
                child.isSectionLabel ? (
                  <li
                    key={`label-${idx}`}
                    className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-v2-muted"
                  >
                    {getItemLabel(child)}
                  </li>
                ) : (
                  <li key={getItemPath(child) || idx} className={idx === 0 ? 'mt-1' : ''}>
                    <Link
                      to={getItemPath(child)}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isItemActive(child)
                          ? 'bg-v2-primary/12 text-v2-primary'
                          : 'text-white hover:bg-white/5 hover:text-v2-primary'
                      )}
                    >
                      {child.icon && <MenuIcon icon={child.icon} className="size-4" />}
                      <span className="truncate">{getItemLabel(child)}</span>
                    </Link>
                  </li>
                )
              )}
          </ul>
        </div>
      </li>
    );
  };

  // Renders a single navigation link menu item
  const renderLinkItem = (item: MenuItem) => {
    const isActive = isItemActive(item);

    return (
      <li key={getItemPath(item) || getItemLabel(item)}>
        <Link
          to={getItemPath(item)}
          onClick={onNavigate}
          title={showFull ? undefined : getItemLabel(item)}
          className={cn(
            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive ? 'bg-v2-primary/12 text-v2-primary' : 'text-white hover:bg-white/5 hover:text-v2-primary',
          )}
        >
          <MenuIcon icon={item.icon} className={isActive ? 'text-v2-primary' : 'text-white group-hover:text-v2-primary'} />
          <span className={cn('truncate', fadeClass)}>{getItemLabel(item)}</span>
          {item.badge && (
            <span className={cn('ms-auto rounded-full bg-v2-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-v2-primary', fadeClass)}>
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      onMouseEnter={() => !isExpanded && onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={cn(
        'fixed top-0 start-0 z-50 flex h-dvh flex-col overflow-hidden border-e border-v2-border bg-v2-shell px-3 text-white transition-[width,translate] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        showFull ? 'w-[250px]' : 'w-[72px]',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        'lg:translate-x-0 rtl:lg:translate-x-0'
      )}
    >
      <div className="flex h-16 shrink-0 items-center ps-2">
        <Link to={brandPath} onClick={onNavigate} className="relative block h-9 w-[180px]">
          <img
            src={brandLogoImg}
            alt="Plexivia"
            className={cn('absolute inset-y-0 start-0 h-9 w-auto max-w-[180px] object-contain transition-opacity duration-200', showFull ? 'opacity-100 delay-100' : 'opacity-0')}
          />
          <img
            src={brandIconImg}
            alt=""
            className={cn('absolute top-0.5 start-0 size-8 object-contain transition-opacity duration-200', showFull ? 'opacity-0' : 'opacity-100')}
          />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto pb-6 no-scrollbar">
        {menuGroups.map((group, groupIdx) => {
          if (!isRoleAllowed(group as any, userRole, userSubRole)) return null;
          const groupLabel = group.groupLabel || group.label;

          return (
            <div key={groupLabel || groupIdx} className="mb-5">
              <h2 className="relative mb-3 flex h-5 items-center ps-3 text-xs uppercase leading-5 text-v2-muted">
                <span className={fadeClass}>{groupLabel || 'Menu'}</span>
                <MoreHorizontal
                  className={cn('absolute start-3.5 size-5 transition-opacity duration-200', showFull ? 'opacity-0' : 'opacity-100')}
                />
              </h2>
              <ul className="flex flex-col gap-1">
                {group.items
                  .filter((item) => isRoleAllowed(item, userRole, userSubRole))
                  .map((item) => {
                    const children = item.items || item.childItems;
                    return children?.length ? renderParentItem(item, children) : renderLinkItem(item);
                  })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User profile menu pinned to the bottom of the sidebar */}
      <div ref={userMenuRef} className="relative shrink-0 border-t border-v2-border py-3">
        {isUserMenuOpen && (
          <div className="absolute bottom-full start-0 mb-2 flex w-full min-w-[220px] flex-col rounded-xl border border-v2-border bg-v2-shell p-2 shadow-2xl">
            <div className="px-2 pb-2">
              <span className="block truncate text-sm font-medium text-white">{displayName}</span>
              <span className="block truncate text-xs text-v2-muted">{user?.email}</span>
              <span className="block text-xs capitalize text-v2-muted">{roleLabel}</span>
            </div>
            <div className="border-t border-v2-border pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/5 hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          title={showFull ? undefined : displayName}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-white transition-colors hover:bg-white/5 cursor-pointer'
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-v2-primary/15 text-xs font-bold text-v2-primary">
            {avatar ? <img src={avatar} alt={displayName} className="size-full object-cover" /> : displayName[0].toUpperCase()}
          </span>
          <span className={cn('flex min-w-0 flex-1 items-center gap-2.5', fadeClass)}>
              <span className="min-w-0 flex-1 text-start">
                <span className="block truncate text-sm font-medium">{displayName}</span>
                <span className="block truncate text-[11px] capitalize text-v2-muted">{roleLabel}</span>
              </span>
              <ChevronUp className={cn('size-4 shrink-0 text-v2-muted transition-transform', !isUserMenuOpen && 'rotate-180')} />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarV2;

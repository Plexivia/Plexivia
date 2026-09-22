import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, ChevronDown, LogOut, User as UserIcon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useDashboard } from '../providers/DashboardProvider';
import { NavItemConfig } from '../providers/types';
import { cn } from '../lib/utils';

export interface SidebarProps {
  navigation?: NavItemConfig[];
  className?: string;
  footerSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
}

function resolveIcon(icon: string | React.ReactNode) {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon;

  const IconComponent = (LucideIcons as Record<string, any>)[icon];
  if (IconComponent) {
    return <IconComponent className="w-4 h-4 shrink-0" />;
  }
  return null;
}

export function Sidebar({
  navigation: propNav,
  className = '',
  footerSlot,
  headerSlot,
}: SidebarProps) {
  const location = useLocation();
  const {
    navigation: contextNav,
    branding,
    user,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    hasRole,
    hasPermission,
    config,
  } = useDashboard();

  const navItems = propNav || contextNav;
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Check active item
  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Keep parent menus expanded if child route is active
  useEffect(() => {
    const updated: Record<string, boolean> = {};
    const checkSub = (items: NavItemConfig[]) => {
      items.forEach((item) => {
        if (item.children) {
          const childActive = item.children.some((c) => isActive(c.path));
          if (childActive) {
            updated[item.id] = true;
          }
          checkSub(item.children);
        }
      });
    };
    checkSub(navItems);
    setOpenMenus((prev) => ({ ...prev, ...updated }));
  }, [location.pathname, navItems]);

  const toggleSubmenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items by role & permission
  const visibleItems = navItems.filter((item) => {
    if (item.roles && !hasRole(item.roles)) return false;
    if (item.permissions && !hasPermission(item.permissions)) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
          'bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)]',
          sidebarCollapsed ? 'w-20' : 'w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)]">
          {headerSlot ? (
            headerSlot
          ) : (
            <div className="flex items-center gap-3 overflow-hidden">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.title}
                  className="w-8 h-8 rounded object-contain shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {branding.title.charAt(0)}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate tracking-tight text-[var(--sidebar-foreground)]">
                    {branding.title}
                  </span>
                  {branding.subtitle && (
                    <span className="text-[11px] text-[var(--sidebar-foreground)]/60 truncate">
                      {branding.subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] hover:bg-white/10 transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {visibleItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.id];
            const active = isActive(item.path) || (hasChildren && item.children?.some((c) => isActive(c.path)));

            if (item.isSection) {
              if (sidebarCollapsed) return <div key={item.id} className="h-px bg-white/10 my-2" />;
              return (
                <div
                  key={item.id}
                  className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-[var(--sidebar-foreground)]/50 uppercase"
                >
                  {item.label}
                </div>
              );
            }

            if (hasChildren) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                      active
                        ? 'bg-[var(--sidebar-active)] text-white shadow-xs'
                        : 'text-[var(--sidebar-foreground)]/80 hover:text-white hover:bg-white/5',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {resolveIcon(item.icon)}
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 text-[var(--sidebar-foreground)]/60 transition-transform duration-200',
                          isOpen && 'rotate-90 text-white'
                        )}
                      />
                    )}
                  </button>

                  {/* Submenu Items */}
                  {!sidebarCollapsed && isOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[var(--sidebar-border)] ml-5">
                      {item.children
                        ?.filter((child) => {
                          if (child.roles && !hasRole(child.roles)) return false;
                          if (child.permissions && !hasPermission(child.permissions)) return false;
                          return true;
                        })
                        .map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <Link
                              key={child.id}
                              to={child.path || '#'}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                                childActive
                                  ? 'bg-[var(--sidebar-active)]/80 text-white font-semibold'
                                  : 'text-[var(--sidebar-foreground)]/70 hover:text-white hover:bg-white/5'
                              )}
                            >
                              <span className="truncate">{child.label}</span>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--primary)] text-white">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path || '#'}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-[var(--sidebar-active)] text-white shadow-xs'
                    : 'text-[var(--sidebar-foreground)]/80 hover:text-white hover:bg-white/5',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  {resolveIcon(item.icon)}
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-[var(--primary)] text-white font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Area */}
        {footerSlot ? (
          footerSlot
        ) : (
          <div className="p-3 border-t border-[var(--sidebar-border)] bg-black/10">
            {user && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-[var(--sidebar-foreground)]/60 capitalize truncate">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>

                {!sidebarCollapsed && config.onLogout && (
                  <button
                    onClick={() => config.onLogout?.()}
                    className="p-1.5 rounded-md text-[var(--sidebar-foreground)]/60 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

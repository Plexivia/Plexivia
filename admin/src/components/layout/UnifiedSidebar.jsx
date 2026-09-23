import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
  ChevronRight,
  Globe,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import brandLogoImg from '@/assets/brand-dark.png';
import { APP_NAME, APP_VERSION } from '@/configs/appConfig';

/**
 * Universal Sidebar Component for Dashboard Template.
 * 
 * Features:
 * - space-y-3 spacing between menu items
 * - Pure white icons on active / selected state and on hover
 * - Unified responsive collapsible behavior (icon collapse 48px <-> expanded 256px)
 * - Brand header with logo, title, and collapse trigger
 * - Smooth collapsible submenus with indicator lines
 * - Footer with user profile info, role badge, and Sign Out action
 */
export function UnifiedSidebar({
  menuGroups = [],
  activeChecker = null,
  onItemSelect = null,
  brandTitle = '',
  brandSubtitle = '',
  brandPath = '/',
  logo = brandLogoImg,
  user = null,
  onLogout = () => {},
  onProfileClick = null,
  lang = 'EN',
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [openMenus, setOpenMenus] = useState({});

  const isItemActive = (item) => {
    if (!item) return false;
    if (activeChecker) return activeChecker(item);
    const itemPath = item.url || item.path || item.href;
    if (!itemPath) return false;
    if (itemPath === '/') return location.pathname === '/';
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  // Keep parent menus persistently open when any child is active to prevent collapsible accordion flicker
  React.useEffect(() => {
    if (!Array.isArray(menuGroups)) return;
    setOpenMenus((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      
      menuGroups.forEach((group) => {
        group.items?.forEach((item) => {
          const children = item.childItems || item.items;
          if (children?.some((child) => isItemActive(child))) {
            const id = item.id || item.url || item.path || item.name || item.title;
            if (!next[id]) {
              next[id] = true;
              hasChanges = true;
            }
          }
        });
      });
      
      return hasChanges ? next : prev;
    });
  }, [menuGroups, location.pathname, activeChecker]);

  const toggleGroup = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGroupClick = (id) => {
    if (isCollapsed) {
      setOpen(true);
      setOpenMenus((prev) => ({
        ...prev,
        [id]: true,
      }));
    } else {
      toggleGroup(id);
    }
  };

  const handleNavClick = (e, item) => {
    const itemPath = item.url || item.path || item.href;
    if (onItemSelect) {
      if (e && e.preventDefault) e.preventDefault();
      onItemSelect(item);
    } else if (itemPath) {
      if (e && e.preventDefault) e.preventDefault();
      navigate(itemPath);
    }
    if (isCollapsed) {
      setOpen(true);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderIcon = (icon, extraClassName = '') => {
    if (!icon) {
      return <LucideIcons.FileText className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-200', extraClassName)} />;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && (icon.$$typeof || icon.render))) {
      const IconComponent = icon;
      return <IconComponent className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-200', extraClassName)} />;
    }
    if (typeof icon === 'string') {
      const IconComponent = LucideIcons[icon] || LucideIcons.FileText;
      return <IconComponent className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-200', extraClassName)} />;
    }
    return <LucideIcons.FileText className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-200', extraClassName)} />;
  };

  const userRole = String(user?.role || '').toLowerCase();
  const userSubRole = String(user?.subRole || user?.sub_role || user?.designation || '').toLowerCase();

  return (
    <SidebarPrimitive
      collapsible="icon"
      className={cn(
        'border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out select-none',
        className
      )}
    >
      {/* Brand Header */}
      <SidebarHeader className="h-16 border-b border-sidebar-border px-3 flex items-center justify-center transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="size-9 rounded-full border border-cyan-500/30 hover:border-cyan-400/50 bg-sidebar-accent hover:bg-sidebar-accent/80 text-cyan-300 hover:text-white flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 cursor-pointer"
            title={'Open Sidebar'}
            aria-label="Open Sidebar"
          >
            <Menu className="w-4 h-4 text-cyan-300 hover:text-white" />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <Link
              to={brandPath}
              onClick={(e) => {
                if (location.pathname === brandPath) {
                  e.preventDefault();
                  return;
                }
                if (isCollapsed) {
                  setOpen(true);
                }
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
              className="flex items-center justify-start gap-2.5 cursor-pointer group/brand overflow-hidden text-left"
            >
              {brandTitle || brandSubtitle ? (
                <>
                  <div className="size-9 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-white/10">
                    {logo ? (
                      <img src={logo} alt={brandTitle} className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 text-left items-start">
                    {brandTitle && (
                      <span className="font-bold text-sm text-sidebar-foreground tracking-tight truncate leading-tight">
                        {brandTitle}
                      </span>
                    )}
                    {brandSubtitle && (
                      <span className="text-[10px] text-cyan-300/80 font-semibold uppercase tracking-wider mt-0.5">
                        {brandSubtitle}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start justify-center py-0.5">
                  <img
                    src={logo}
                    alt="Plexivia"
                    className="h-6.5 w-auto max-w-[150px] object-contain transition-transform duration-200 hover:scale-[1.02]"
                  />
                  <span className="text-[10px] font-mono font-medium text-cyan-400/80 tracking-wide mt-0.5">
                    v{APP_VERSION}
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (isMobile) setOpenMobile(false);
              }}
              className="size-7 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 border border-sidebar-border text-cyan-300 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
              title={'Close Sidebar'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-2 space-y-4">
        {menuGroups.map((group, groupIdx) => {
          // Role filtering for groups
          if (group.roles && group.roles.length > 0) {
            const hasRole = group.roles.includes(userRole) || group.roles.includes(userSubRole);
            if (!hasRole) return null;
          }
          if (group.excludeRoles && group.excludeRoles.length > 0) {
            const isExcluded = group.excludeRoles.includes(userRole) || group.excludeRoles.includes(userSubRole);
            if (isExcluded) return null;
          }

          const groupLabel = lang === 'BN' ? (group.groupLabelBn || group.labelBn || group.groupLabel || group.label) : (group.groupLabel || group.label);
          const groupId = group.id || `group-${groupLabel || groupIdx}`;
          const isGroupOpen = openMenus[groupId] ?? true;

          return (
            <Collapsible
              key={groupIdx}
              open={isGroupOpen}
              onOpenChange={() => toggleGroup(groupId)}
              className="group/collapsible-group"
            >
              <SidebarGroup className="p-0">
                {groupLabel && (
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="px-3 pt-2 pb-1 text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase flex items-center justify-between cursor-pointer hover:text-cyan-300 select-none group/label">
                      <span>{groupLabel}</span>
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 group-hover/label:text-cyan-200',
                          isGroupOpen && 'rotate-90',
                          'group-data-[collapsible=icon]:hidden'
                        )}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {/* Applied space-y-3 between menu items */}
                    <SidebarMenu className="space-y-3">
                      {group.items?.map((item, itemIdx) => {
                        // Role filtering for items
                        if (item.roles && item.roles.length > 0) {
                          const hasRole = item.roles.includes(userRole) || item.roles.includes(userSubRole);
                          if (!hasRole) return null;
                        }
                        if (item.excludeRoles && item.excludeRoles.length > 0) {
                          const isExcluded = item.excludeRoles.includes(userRole) || item.excludeRoles.includes(userSubRole);
                          if (isExcluded) return null;
                        }

                        const childList = item.childItems || item.items;
                        const hasChildren = Array.isArray(childList) && childList.length > 0;
                        const itemLabel = lang === 'BN' ? (item.nameBn || item.titleBn || item.name || item.title || item.label) : (item.name || item.title || item.label);
                        const itemId = item.id || item.url || item.path || item.name || item.title || `item-${groupIdx}-${itemIdx}`;

                        if (hasChildren) {
                          const isAnyChildActive = childList.some((child) => isItemActive(child));
                          const isCollapsibleOpen = openMenus[itemId] ?? isAnyChildActive;

                          return (
                            <Collapsible
                              key={itemIdx}
                              open={isCollapsibleOpen}
                              onOpenChange={() => toggleGroup(itemId)}
                              className="group/collapsible"
                            >
                              <SidebarMenuItem>
                                <SidebarMenuButton
                                  tooltip={itemLabel}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleGroupClick(itemId);
                                  }}
                                  className={cn(
                                    'group w-full justify-between cursor-pointer font-medium text-sm py-2 px-3 rounded-xl transition-all duration-200 text-sidebar-foreground hover:text-white hover:bg-sidebar-accent',
                                    isAnyChildActive &&
                                      'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-xs'
                                  )}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {renderIcon(
                                      item.icon,
                                      cn(
                                        isAnyChildActive
                                          ? 'text-cyan-300'
                                          : 'text-cyan-400 group-hover:text-white'
                                      )
                                    )}
                                    <span className="truncate group-hover:text-white">{itemLabel}</span>
                                  </div>
                                  <ChevronRight
                                    className={cn(
                                      'w-4 h-4 transition-transform duration-200',
                                      isAnyChildActive
                                        ? 'text-cyan-300'
                                        : 'text-cyan-400 group-hover:text-white',
                                      isCollapsibleOpen && 'rotate-90',
                                      'group-data-[collapsible=icon]:hidden'
                                    )}
                                  />
                                </SidebarMenuButton>
                                <CollapsibleContent>
                                  {/* Submenu with space-y-2 */}
                                  <SidebarMenuSub className="ml-5 border-l-2 border-cyan-400/30 pl-3 my-2 space-y-2">
                                    {childList.map((subItem, subIdx) => {
                                      if (subItem.roles && subItem.roles.length > 0) {
                                        const hasRole = subItem.roles.includes(userRole) || subItem.roles.includes(userSubRole);
                                        if (!hasRole) return null;
                                      }
                                      if (subItem.excludeRoles && subItem.excludeRoles.length > 0) {
                                        const isExcluded = subItem.excludeRoles.includes(userRole) || subItem.excludeRoles.includes(userSubRole);
                                        if (isExcluded) return null;
                                      }
                                      const isSubActive = isItemActive(subItem);
                                      const subLabel = lang === 'BN' ? (subItem.nameBn || subItem.titleBn || subItem.name || subItem.title || subItem.label) : (subItem.name || subItem.title || subItem.label);

                                      return (
                                        <SidebarMenuSubItem key={subIdx}>
                                          <SidebarMenuSubButton
                                            isActive={isSubActive}
                                            onClick={(e) => handleNavClick(e, subItem)}
                                            className={cn(
                                              'group cursor-pointer text-[13px] rounded-lg py-2 px-2.5 flex items-center gap-2 transition-all duration-200',
                                              isSubActive
                                                ? '!bg-gradient-to-r !from-cyan-500 !to-cyan-600 !text-slate-950 font-bold shadow-xs'
                                                : 'text-sidebar-foreground/85 hover:text-white hover:bg-sidebar-accent font-medium'
                                            )}
                                          >
                                            {subItem.icon &&
                                              renderIcon(
                                                subItem.icon,
                                                cn(
                                                  'w-4 h-4 shrink-0 transition-colors',
                                                  isSubActive
                                                    ? '!text-slate-950 group-hover:!text-slate-950'
                                                    : 'text-cyan-400 group-hover:text-white'
                                                )
                                              )}
                                            <span
                                              className={cn(
                                                'truncate transition-colors',
                                                isSubActive
                                                  ? '!text-slate-950 group-hover:!text-slate-950 font-bold'
                                                  : 'group-hover:text-white'
                                              )}
                                            >
                                              {subLabel}
                                            </span>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          );
                        }

                        const isActive = isItemActive(item);

                        return (
                          <SidebarMenuItem key={itemIdx}>
                            <SidebarMenuButton
                              isActive={isActive}
                              tooltip={itemLabel}
                              onClick={(e) => handleNavClick(e, item)}
                              className={cn(
                                'group cursor-pointer text-sm font-medium py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-between',
                                isActive
                                  ? '!bg-gradient-to-r !from-cyan-500 !to-cyan-600 !text-slate-950 font-bold shadow-xs'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {renderIcon(
                                  item.icon,
                                  cn(
                                    'w-4.5 h-4.5 shrink-0 transition-colors',
                                    isActive
                                      ? '!text-slate-950 group-hover:!text-slate-950'
                                      : 'text-cyan-400 group-hover:text-white'
                                  )
                                )}
                                <span
                                  className={cn(
                                    'truncate transition-colors',
                                    isActive
                                      ? '!text-slate-950 group-hover:!text-slate-950 font-bold'
                                      : 'group-hover:text-white'
                                  )}
                                >
                                  {itemLabel}
                                </span>
                              </div>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none shrink-0',
                                    isActive
                                      ? 'bg-slate-950/20 text-slate-950'
                                      : item.badgeVariant === 'secondary'
                                      ? 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      {/* Footer Info */}
      <SidebarFooter className="border-t border-sidebar-border p-2 flex items-center justify-center overflow-hidden transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onProfileClick}
            className="relative size-9 rounded-full border border-cyan-500/40 bg-sidebar-accent hover:bg-sidebar-accent/80 text-cyan-300 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer mx-auto shadow-xs"
            title={user?.name || user?.fullName || 'My Profile'}
            aria-label="Profile"
          >
            {user?.avatar || user?.avatarUrl || user?.photoUrl ? (
              <img
                src={user.avatar || user.avatarUrl || user.photoUrl}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="font-bold text-xs text-white">
                {user?.name ? user.name[0].toUpperCase() : user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </span>
            )}
            <span className="ring-sidebar absolute right-0 bottom-0 block size-2.5 rounded-full bg-emerald-400 ring-2" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl bg-sidebar-accent border border-sidebar-border w-full overflow-hidden shadow-xs">
            <div
              onClick={onProfileClick}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title={user?.name || user?.fullName || 'My Profile'}
            >
              <div className="relative size-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.avatar || user?.avatarUrl || user?.photoUrl ? (
                  <img
                    src={user.avatar || user.avatarUrl || user.photoUrl}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : user?.fullName ? user.fullName[0].toUpperCase() : 'U'
                )}
                <span className="ring-sidebar absolute right-0 bottom-0 block size-2.5 rounded-full bg-emerald-400 ring-2" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-sidebar-foreground truncate leading-tight">
                  {user?.name || user?.fullName || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10.5px] text-cyan-300/80 font-medium truncate mt-0.5 capitalize">
                  {user?.subRole ? user.subRole.replace(/_/g, ' ') : (user?.role || 'Staff')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="size-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
              title={lang === 'BN' ? 'Logout' : 'Sign Out'}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

export default UnifiedSidebar;

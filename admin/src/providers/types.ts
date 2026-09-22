import React from 'react';
import { ThemeConfig } from '../theme/types';

export interface CompanyInfo {
  name: string;
  tagline?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxNumber?: string;
  registrationNumber?: string;
  signatureUrl?: string;
  sealUrl?: string;
  currency?: string;
  currencySymbol?: string;
}

export interface BrandingConfig {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  logoCollapsedUrl?: string;
  logoSquareUrl?: string;
  faviconUrl?: string;
  copyrightText?: string;
}

export interface DashboardUser {
  id?: string | number;
  name: string;
  email?: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  avatarUrl?: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  path?: string;
  icon?: string | React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  roles?: string[];
  permissions?: string[];
  children?: NavItemConfig[];
  isSection?: boolean;
  external?: boolean;
  disabled?: boolean;
}

export interface DashboardConfig {
  branding: BrandingConfig;
  companyInfo?: CompanyInfo;
  navigation: NavItemConfig[];
  user?: DashboardUser;
  theme?: ThemeConfig;
  defaultThemePreset?: string;
  onLogout?: () => void | Promise<void>;
  onNavigate?: (path: string) => void;
}

export interface DashboardContextValue {
  config: DashboardConfig;
  branding: BrandingConfig;
  companyInfo: CompanyInfo;
  navigation: NavItemConfig[];
  user?: DashboardUser;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  hasRole: (roles?: string[]) => boolean;
  hasPermission: (permissions?: string[]) => boolean;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  updateBranding: (branding: Partial<BrandingConfig>) => void;
}

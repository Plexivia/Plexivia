import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DashboardConfig, DashboardContextValue, CompanyInfo, BrandingConfig, NavItemConfig } from './types';
import { ThemeProvider } from '../theme/ThemeProvider';

const DashboardContext = createContext<DashboardContextValue | null>(null);

export interface DashboardProviderProps {
  children: React.ReactNode;
  config: DashboardConfig;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Agency Enterprise',
  tagline: 'Leading Business Solutions',
  address: 'Commercial Area, City',
  country: 'Bangladesh',
  phone: '+880 1700-000000',
  email: 'info@agency.com',
  currency: 'BDT',
  currencySymbol: '৳',
};

const DEFAULT_BRANDING: BrandingConfig = {
  title: 'Agency Dashboard',
  subtitle: 'Enterprise Workspace',
};

function DashboardInnerProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: DashboardConfig;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => ({
    ...DEFAULT_COMPANY_INFO,
    ...(config.companyInfo || {}),
  }));

  const [branding, setBranding] = useState<BrandingConfig>(() => ({
    ...DEFAULT_BRANDING,
    ...(config.branding || {}),
  }));

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const hasRole = useCallback(
    (roles?: string[]) => {
      if (!roles || roles.length === 0) return true;
      if (!config.user) return false;
      const userRoles = [
        config.user.role,
        ...(config.user.roles || []),
      ].filter(Boolean);
      return roles.some((r) => userRoles.includes(r));
    },
    [config.user]
  );

  const hasPermission = useCallback(
    (permissions?: string[]) => {
      if (!permissions || permissions.length === 0) return true;
      if (!config.user || !config.user.permissions) return false;
      return permissions.some((p) => config.user!.permissions!.includes(p));
    },
    [config.user]
  );

  const updateCompanyInfo = useCallback((info: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const updateBranding = useCallback((newBranding: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
  }, []);

  const value: DashboardContextValue = useMemo(
    () => ({
      config,
      branding,
      companyInfo,
      navigation: config.navigation || [],
      user: config.user,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileMenuOpen,
      setMobileMenuOpen,
      toggleMobileMenu,
      hasRole,
      hasPermission,
      updateCompanyInfo,
      updateBranding,
    }),
    [
      config,
      branding,
      companyInfo,
      sidebarCollapsed,
      mobileMenuOpen,
      toggleSidebar,
      toggleMobileMenu,
      hasRole,
      hasPermission,
      updateCompanyInfo,
      updateBranding,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function DashboardProvider({ children, config }: DashboardProviderProps) {
  return (
    <ThemeProvider
      defaultTheme={config.theme}
      defaultPreset={config.defaultThemePreset || 'emerald'}
    >
      <DashboardInnerProvider config={config}>
        {children}
      </DashboardInnerProvider>
    </ThemeProvider>
  );
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

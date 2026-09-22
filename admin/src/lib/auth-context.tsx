import React, { createContext, useContext } from 'react';
import { useDashboard } from '../providers/DashboardProvider';

export interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  role?: string;
  hasRole?: (roles: string[]) => boolean;
  hasPermission?: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
});

export function AuthProvider({ children, value }: { children: React.ReactNode; value?: AuthContextType }) {
  return <AuthContext.Provider value={value || { user: null, isAuthenticated: false }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  try {
    const dashboard = useDashboard();
    if (dashboard?.user) {
      return {
        user: dashboard.user,
        isAuthenticated: true,
        role: dashboard.user.role,
        hasRole: dashboard.hasRole,
        hasPermission: dashboard.hasPermission,
      };
    }
  } catch {
    // Fallback if used outside DashboardProvider
  }

  const context = useContext(AuthContext);
  return context;
}

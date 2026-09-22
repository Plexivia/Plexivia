import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => apiClient.getActiveUser());
  const [token, setToken] = useState<string | null>(() => apiClient.getToken());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('plexi:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('plexi:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiClient.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    apiClient.clearToken();
    setToken(null);
    // Re-prompt login modal or keep guest mode
    setIsLoginModalOpen(true);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    apiClient.setActiveUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

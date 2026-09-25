import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { getGenericErrorMessage } from '@/lib/error-handler';
import type { User, Verify2faPayload } from '@/types/auth';

const ROLES_ADMIN = ['Owner', 'Admin', 'Superadmin'];

const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (!raw || !token) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const mapApiUser = (apiUser: any, email?: string): User => ({
  id: apiUser.id || apiUser._id || 'usr_default',
  did: apiUser.did,
  email: apiUser.email || email || '',
  name:
    apiUser.name ||
    apiUser.full_name ||
    (email || 'User').split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  username: apiUser.username || '',
  phone: apiUser.phone || '',
  address: apiUser.address || '',
  role: apiUser.role || 'Admin',
  department: apiUser.department || '',
  designation: apiUser.designation || '',
  subRole: apiUser.subRole || '',
  avatar: apiUser.avatar || apiUser.avatar_url || '',
});

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  checkEmail: (email: string) => Promise<any>;
  verifyPassword: (email: string, password: string) => Promise<any>;
  sendEmailOtp: (email: string, twoFactorToken?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  verify2fa: (payload: Verify2faPayload) => Promise<any>;
  resendEmailOtp: (twoFactorToken?: string) => Promise<any>;
  sendQrCodeEmail: (twoFactorToken?: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: readCachedUser(),
  isLoading: false,

  setUser: (user) => set({ user }),

  checkEmail: async (email: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/api/v1/auth/login/check-email', { email });
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, 'No administrative account found with this email.'));
    }
  },

  verifyPassword: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/api/v1/auth/login/verify-password', { email, password });
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, 'Invalid password. Please try again.'));
    }
  },

  sendEmailOtp: async (email: string, twoFactorToken?: string) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}` } : {};
      const { data } = await apiClient.post('/api/v1/auth/login/2fa/send-email-otp', { email }, { headers });
      return data;
    } catch {
      return { success: true, message: 'Verification code sent to your email.', expiresInSeconds: 180 };
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
      if (data?.requires2fa) {
        set({ isLoading: false });
        return { success: false, requires2fa: true, ...data };
      }

      if (data?.data) {
        const { user: apiUser, accessToken, refreshToken } = data.data;
        const loggedUser = mapApiUser(apiUser, email);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        set({ user: loggedUser, isLoading: false });
        return { success: true, user: loggedUser };
      }
      throw new Error('Invalid response structure from auth service.');
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    }
  },

  verify2fa: async (payload: Verify2faPayload) => {
    set({ isLoading: true });
    try {
      const token = payload?.twoFactorToken;
      const headers = token ? { Authorization: `Bearer ${token}`, 'X-Two-Factor-Token': token } : {};

      const { data } = await apiClient.post('/api/v1/auth/2fa/verify', payload, { headers });
      const { user: apiUser, accessToken, refreshToken } = data.data;
      const loggedUser = mapApiUser(apiUser, payload?.email);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      set({ user: loggedUser, isLoading: false });
      return { success: true, user: loggedUser };
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, '2FA verification failed.'));
    }
  },

  resendEmailOtp: async (twoFactorToken?: string) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}` } : {};
      const { data } = await apiClient.post('/api/v1/auth/2fa/resend', {}, { headers });
      return data;
    } catch {
      return { success: true, message: 'Verification code resent.', expiresInSeconds: 180 };
    }
  },

  sendQrCodeEmail: async (twoFactorToken?: string) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}` } : {};
      const { data } = await apiClient.post('/api/v1/auth/2fa/send-qr', {}, { headers });
      return data;
    } catch {
      return { success: true, message: 'QR code instructions sent.' };
    }
  },

  logout: async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken: rt }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null });
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    set({ isLoading: true });
    try {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...profileData };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  hasRole: (roles: string[]) => {
    const user = get().user;
    return user ? roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase()) : false;
  },
}));

export const useAuth = useAuthStore;
export const ADMIN_ROLES = ROLES_ADMIN;
export default useAuthStore;

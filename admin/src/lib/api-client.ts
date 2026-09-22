import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { handleGlobalError } from './error-handler';

/**
 * Resolves the API Base URL with environment awareness:
 * - In local development mode, connects to configured VITE_API_BASE_URL or local server.
 * - In production cloud deployments, connects to the configured environment URL.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');

    if (isLocalhost) {
      return 'http://localhost:5095';
    }
    // In production, use same-origin proxy (relative root) to avoid CORS
    return '';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token if available
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401 Unauthorized & Token Refresh logic with queuing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh-token');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (typeof window === 'undefined') throw new Error('Not running in client-side');

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Session expired. Please sign in again.');

        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (typeof window !== 'undefined' && !isAuthRequest) {
      handleGlobalError(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

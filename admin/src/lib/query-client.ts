import { QueryClient } from '@tanstack/react-query';
import { handleGlobalError } from './error-handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Do not retry 401 or 403 or 404
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        handleGlobalError(error);
      },
    },
  },
});

export default queryClient;

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes';
import '@/configs/i18n';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton theme="dark" />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

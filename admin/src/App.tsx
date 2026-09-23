import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Toaster } from 'sonner';
import { AppRoutes } from '@/routes';
import '@/configs/i18n';

// Purge legacy local storage cache on application startup
const purgeLegacyStorage = () => {
  if (typeof window === 'undefined') return;
  const legacyKeys = [
    'plexi_data_users',
    'plexi_data_clients',
    'plexi_data_projects',
    'plexi_data_tasks',
    'plexi_data_fleet',
    'plexi_data_services',
    'plexi_data_backups',
    'plexi_data_repos',
    'plexi_data_mail',
    'plexi_data_timelogs',
    'plexi_data_activities',
    'plexi_data_stats'
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));
};

// Root application component mounting providers and routes
export const App: React.FC = () => {
  useEffect(() => {
    purgeLegacyStorage();
  }, []);

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

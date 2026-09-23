import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import './index.css';

// Synchronously purge legacy mock data stored in browser localStorage
if (typeof window !== 'undefined') {
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);

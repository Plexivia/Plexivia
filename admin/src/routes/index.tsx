import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UnifiedSidebar } from '@/components/layout/UnifiedSidebar';
import { TopBreadcrumbBar } from '@/components/layout/TopBreadcrumbBar';
import { ToastContainer } from '@/components/common/ToastContainer';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary';
import { NotificationDrawer } from '@/components/layout/NotificationDrawer';
import { LoginModal } from '@/components/common/LoginModal';
import { LoginPage } from '@/components/auth/LoginPage';
import { NAVIGATION_MENU_GROUPS } from '@/constants/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// Modals
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { CreateClientModal } from '@/components/modals/CreateClientModal';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';

// Pages
import { UsersPage } from '@/pages/UsersPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { TasksPage } from '@/pages/TasksPage';
import { ClientsDirectoryPage } from '@/pages/ClientsDirectoryPage';
import { AgencyTeamPage } from '@/pages/AgencyTeamPage';
import { DocumentStudioPage } from '@/features/document-studio/pages/DocumentStudioPage';

// Route Guards
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (user && token) {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}

// Authenticated layout shell wrapper
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <ProtectedRoute>
      <GlobalErrorBoundary>
        <DashboardLayout
          sidebar={
            <UnifiedSidebar
              menuGroups={NAVIGATION_MENU_GROUPS}
              brandPath="/projects"
              user={user}
              onLogout={logout}
            />
          }
          header={<TopBreadcrumbBar />}
          toasts={<ToastContainer />}
          modals={
            <>
              <GlobalSearchModal />
              <NotificationDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
              <LoginModal />
            </>
          }
        >
          {children}
        </DashboardLayout>
      </GlobalErrorBoundary>
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />

      {/* Main Dashboard Shell Routes */}
      <Route
        path="/"
        element={<Navigate to="/projects" replace />}
      />
      <Route
        path="/users"
        element={
          <AppShell>
            <UsersPage />
          </AppShell>
        }
      />
      <Route
        path="/projects"
        element={
          <AppShell>
            <ProjectsPage />
          </AppShell>
        }
      />
      <Route
        path="/tasks"
        element={
          <AppShell>
            <TasksPage />
          </AppShell>
        }
      />
      <Route
        path="/clients"
        element={
          <AppShell>
            <ClientsDirectoryPage />
          </AppShell>
        }
      />
      <Route
        path="/team"
        element={
          <AppShell>
            <AgencyTeamPage />
          </AppShell>
        }
      />
      <Route
        path="/documents"
        element={
          <AppShell>
            <DocumentStudioPage />
          </AppShell>
        }
      />
      <Route
        path="/documents/*"
        element={
          <AppShell>
            <DocumentStudioPage />
          </AppShell>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default AppRoutes;

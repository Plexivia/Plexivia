import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { useData } from '@/context/DataContext';
import { Task, TaskStatus, VPSNode, NavTab } from '@/types';

// Modals
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { CreateClientModal } from '@/components/modals/CreateClientModal';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { TriggerBackupModal } from '@/components/modals/TriggerBackupModal';
import { SendTestEmailModal } from '@/components/modals/SendTestEmailModal';
import { SSHConsoleModal } from '@/components/modals/SSHConsoleModal';

// Pages
import { OverviewPage } from '@/pages/OverviewPage';
import { ProjectsKanbanPage } from '@/pages/ProjectsKanbanPage';
import { ClientsDirectoryPage } from '@/pages/ClientsDirectoryPage';
import { TimeTrackerPage } from '@/pages/TimeTrackerPage';
import { AgencyTeamPage } from '@/pages/AgencyTeamPage';
import { VPSFleetPage } from '@/pages/VPSFleetPage';
import { SRETelemetryPage } from '@/pages/SRETelemetryPage';
import { MailSubsystemPage } from '@/pages/MailSubsystemPage';
import { PrivateGitPage } from '@/pages/PrivateGitPage';
import { VersionBackupPage } from '@/pages/VersionBackupPage';
import { SettingsPage } from '@/pages/SettingsPage';
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
    return <Navigate to="/" replace />;
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
              brandPath="/"
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
  const navigate = useNavigate();
  const { fleet } = useData();

  // Global modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('TODO');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTriggerBackupOpen, setIsTriggerBackupOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [sshNode, setSshNode] = useState<VPSNode | null>(null);

  const handleOpenCreateTask = (status: TaskStatus = 'TODO') => {
    setCreateTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleOpenSSH = () => {
    setSshNode(fleet[0] || null);
  };

  const handleNavigate = (tab: NavTab) => {
    if (tab === 'overview') navigate('/');
    else navigate(`/${tab}`);
  };

  return (
    <>
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
          element={
            <AppShell>
              <OverviewPage
                onNavigate={handleNavigate}
                onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                onOpenCreateClient={() => setIsCreateClientOpen(true)}
                onOpenCreateTask={() => handleOpenCreateTask('TODO')}
                onOpenTriggerBackup={() => setIsTriggerBackupOpen(true)}
                onOpenSendEmail={() => setIsSendEmailOpen(true)}
                onOpenSSH={handleOpenSSH}
                onOpenTaskDetail={task => setSelectedTask(task)}
              />
            </AppShell>
          }
        />
        <Route
          path="/projects"
          element={
            <AppShell>
              <ProjectsKanbanPage />
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
          path="/timer"
          element={
            <AppShell>
              <TimeTrackerPage />
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
          path="/fleet"
          element={
            <AppShell>
              <VPSFleetPage />
            </AppShell>
          }
        />
        <Route
          path="/sre"
          element={
            <AppShell>
              <SRETelemetryPage />
            </AppShell>
          }
        />
        <Route
          path="/mail"
          element={
            <AppShell>
              <MailSubsystemPage />
            </AppShell>
          }
        />
        <Route
          path="/git"
          element={
            <AppShell>
              <PrivateGitPage />
            </AppShell>
          }
        />
        <Route
          path="/backups"
          element={
            <AppShell>
              <VersionBackupPage />
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
        <Route
          path="/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Shared Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultStatus={createTaskStatus}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TriggerBackupModal
        isOpen={isTriggerBackupOpen}
        onClose={() => setIsTriggerBackupOpen(false)}
      />

      <SendTestEmailModal
        isOpen={isSendEmailOpen}
        onClose={() => setIsSendEmailOpen(false)}
      />

      <SSHConsoleModal
        node={sshNode}
        isOpen={!!sshNode}
        onClose={() => setSshNode(null)}
      />
    </>
  );
}

export default AppRoutes;

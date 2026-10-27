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

import { OverviewPage } from '@/pages/OverviewPage';
import { WebmailPage } from '@/pages/WebmailPage';
import { SupportDeskPage } from '@/pages/SupportDeskPage';
import { UsersPage } from '@/pages/UsersPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { TasksPage } from '@/pages/TasksPage';
import { ClientsDirectoryPage } from '@/pages/ClientsDirectoryPage';
import { AgencyTeamPage } from '@/pages/AgencyTeamPage';
import { DocumentStudioPage } from '@/features/document-studio/pages/DocumentStudioPage';

import { BalanceOverview as BalanceOverviewPage } from '@/pages/accounts/balanceOverview';
import { AddNewBillPage } from '@/pages/accounts/addNewBill';
import { AllBillsPage } from '@/pages/accounts/allBills';
import { BillTypesPage } from '@/pages/accounts/billTypes';
import { AddNewPaymentPage } from '@/pages/accounts/addNewPayment';
import { AllPaymentsPage } from '@/pages/accounts/allPayments';
import { PaymentTypesPage, PaymentMethodsPage } from '@/pages/accounts/paymentTypes';
import { InvestorsPage } from '@/pages/accounts/investors';
import { InvestmentsListPage } from '@/pages/accounts/investmentsList';

import { BillingPage } from '@/pages/billing/billingOverview';
import { BillingsPage } from '@/pages/billing/billings';
import { PaymentsPage } from '@/pages/billing/payments';

// Guards routes that require an authenticated user session
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Redirects authenticated users away from public login routes
export const PublicAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (user && token) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};

// Renders the authenticated dashboard layout shell around page content
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <ProtectedRoute>
      <GlobalErrorBoundary>
        <DashboardLayout
          sidebar={
            <UnifiedSidebar
              menuGroups={NAVIGATION_MENU_GROUPS}
              brandPath="/overview"
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
};

// Defines all application routes for the admin dashboard
export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/overview" replace />}
      />
      <Route
        path="/overview"
        element={
          <AppShell>
            <OverviewPage />
          </AppShell>
        }
      />
      <Route
        path="/webmail"
        element={
          <AppShell>
            <WebmailPage />
          </AppShell>
        }
      />
      <Route
        path="/support"
        element={
          <AppShell>
            <SupportDeskPage />
          </AppShell>
        }
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
        path="/accounts"
        element={
          <AppShell>
            <BalanceOverviewPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/balance"
        element={
          <AppShell>
            <BalanceOverviewPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/bills"
        element={
          <AppShell>
            <AllBillsPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/bills/new"
        element={
          <AppShell>
            <AddNewBillPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/bills/types"
        element={
          <AppShell>
            <BillTypesPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/payments"
        element={
          <AppShell>
            <AllPaymentsPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/payments/new"
        element={
          <AppShell>
            <AddNewPaymentPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/payments/methods"
        element={
          <AppShell>
            <PaymentMethodsPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/payments/types"
        element={
          <AppShell>
            <PaymentTypesPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/payment-methods"
        element={
          <AppShell>
            <PaymentMethodsPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/investors"
        element={
          <AppShell>
            <InvestorsPage />
          </AppShell>
        }
      />
      <Route
        path="/accounts/investments"
        element={
          <AppShell>
            <InvestmentsListPage />
          </AppShell>
        }
      />

      <Route
        path="/billing"
        element={
          <AppShell>
            <BillingPage />
          </AppShell>
        }
      />
      <Route
        path="/billing/billings"
        element={
          <AppShell>
            <BillingsPage />
          </AppShell>
        }
      />
      <Route
        path="/billing/payments"
        element={
          <AppShell>
            <PaymentsPage />
          </AppShell>
        }
      />

      <Route
        path="/dashboard/accounts"
        element={<Navigate to="/accounts/balance" replace />}
      />
      <Route
        path="/dashboard/accounts/balance"
        element={<Navigate to="/accounts/balance" replace />}
      />
      <Route
        path="/dashboard/accounts/bills"
        element={<Navigate to="/accounts/bills" replace />}
      />
      <Route
        path="/dashboard/accounts/bills/new"
        element={<Navigate to="/accounts/bills/new" replace />}
      />
      <Route
        path="/dashboard/accounts/bills/types"
        element={<Navigate to="/accounts/bills/types" replace />}
      />
      <Route
        path="/dashboard/accounts/payments"
        element={<Navigate to="/accounts/payments" replace />}
      />
      <Route
        path="/dashboard/accounts/payments/new"
        element={<Navigate to="/accounts/payments/new" replace />}
      />
      <Route
        path="/dashboard/accounts/payments/methods"
        element={<Navigate to="/accounts/payments/methods" replace />}
      />
      <Route
        path="/dashboard/accounts/payments/types"
        element={<Navigate to="/accounts/payments/types" replace />}
      />
      <Route
        path="/dashboard/accounts/investors"
        element={<Navigate to="/accounts/investors" replace />}
      />
      <Route
        path="/dashboard/accounts/investments"
        element={<Navigate to="/accounts/investments" replace />}
      />
      <Route
        path="/dashboard/billing"
        element={<Navigate to="/billing" replace />}
      />
      <Route
        path="/dashboard/billing/billings"
        element={<Navigate to="/billing/billings" replace />}
      />
      <Route
        path="/dashboard/billing/payments"
        element={<Navigate to="/billing/payments" replace />}
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

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
};

export default AppRoutes;

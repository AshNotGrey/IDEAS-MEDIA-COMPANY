import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAdminAuth } from "./hooks/useAdminAuth.js";

// Import critical components (not lazy loaded)
import AdminLogin from "./components/auth/AdminLogin.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./components/Dashboard.jsx"));
const Campaigns = lazy(() => import("./pages/Campaigns.jsx"));
const Users = lazy(() => import("./pages/Users.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const MediaLibrary = lazy(() => import("./pages/MediaLibrary.jsx"));
const EmailTemplates = lazy(() => import("./pages/EmailTemplates.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const SessionManagement = lazy(() => import("./components/auth/SessionManagement.jsx"));
const AdminInvites = lazy(() => import("./components/auth/AdminInvites.jsx"));
const AdminRegistration = lazy(() => import("./components/auth/AdminRegistration.jsx"));
const AdminVerification = lazy(() => import("./components/auth/AdminVerification.jsx"));
const SecurityDashboard = lazy(() => import("./components/security/SecurityDashboard.jsx"));
const SecuritySettings = lazy(() => import("./components/security/SecuritySettings.jsx"));
const AuditLogs = lazy(() => import("./components/security/AuditLogs.jsx"));
const ThreatIntelligence = lazy(() => import("./components/security/ThreatIntelligence.jsx"));
const AutomatedResponse = lazy(() => import("./components/security/AutomatedResponse.jsx"));
const AdminHierarchy = lazy(() => import("./components/security/AdminHierarchy.jsx"));
const ComplianceReporting = lazy(() => import("./components/security/ComplianceReporting.jsx"));

// Loading component
const PageLoader = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='flex flex-col items-center gap-3'>
      <div className='w-8 h-8 border-2 border-ideas-accent border-t-transparent rounded-full animate-spin' />
      <p className='text-sm text-gray-600 dark:text-gray-400 font-medium'>Loading...</p>
    </div>
  </div>
);

// Suspense wrapper
const SuspenseWrapper = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

/**
 * Protected route wrapper for admin routes
 */
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
}

/**
 * Guest route wrapper for login page
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
}

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <GuestRoute>
        <AdminLogin />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: <AdminRegistration />,
  },

  // Protected admin routes with layout
  {
    path: "/",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "sessions",
        element: (
          <SuspenseWrapper>
            <SessionManagement />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin-invites",
        element: (
          <SuspenseWrapper>
            <AdminInvites />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin-verification",
        element: (
          <SuspenseWrapper>
            <AdminVerification />
          </SuspenseWrapper>
        ),
      },
      {
        path: "security",
        element: (
          <SuspenseWrapper>
            <SecurityDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "security-settings",
        element: (
          <SuspenseWrapper>
            <SecuritySettings />
          </SuspenseWrapper>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <SuspenseWrapper>
            <AuditLogs />
          </SuspenseWrapper>
        ),
      },
      {
        path: "threat-intelligence",
        element: (
          <SuspenseWrapper>
            <ThreatIntelligence />
          </SuspenseWrapper>
        ),
      },
      {
        path: "automated-response",
        element: (
          <SuspenseWrapper>
            <AutomatedResponse />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin-hierarchy",
        element: (
          <SuspenseWrapper>
            <AdminHierarchy />
          </SuspenseWrapper>
        ),
      },
      {
        path: "compliance-reporting",
        element: (
          <SuspenseWrapper>
            <ComplianceReporting />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <Users />
          </SuspenseWrapper>
        ),
      },
      {
        path: "campaigns",
        element: (
          <SuspenseWrapper>
            <Campaigns />
          </SuspenseWrapper>
        ),
      },
      {
        path: "bookings",
        element: (
          <div className='p-6'>
            <div className='text-center py-12'>
              <h2 className='text-2xl font-bold text-black dark:text-white mb-4'>
                Booking Management
              </h2>
              <p className='text-subtle'>Booking management interface coming in Phase 2</p>
            </div>
          </div>
        ),
      },
      {
        path: "services",
        element: (
          <SuspenseWrapper>
            <Services />
          </SuspenseWrapper>
        ),
      },
      {
        path: "galleries",
        element: (
          <div className='p-6'>
            <div className='text-center py-12'>
              <h2 className='text-2xl font-bold text-black dark:text-white mb-4'>
                Gallery Management
              </h2>
              <p className='text-subtle'>Gallery management interface coming in Phase 2</p>
            </div>
          </div>
        ),
      },
      {
        path: "reviews",
        element: (
          <div className='p-6'>
            <div className='text-center py-12'>
              <h2 className='text-2xl font-bold text-black dark:text-white mb-4'>
                Review Management
              </h2>
              <p className='text-subtle'>Review management interface coming in Phase 2</p>
            </div>
          </div>
        ),
      },
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <Analytics />
          </SuspenseWrapper>
        ),
      },
      {
        path: "media",
        element: (
          <SuspenseWrapper>
            <MediaLibrary />
          </SuspenseWrapper>
        ),
      },
      {
        path: "email-templates",
        element: (
          <SuspenseWrapper>
            <EmailTemplates />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <Settings />
          </SuspenseWrapper>
        ),
      },
      {
        path: "",
        element: <Navigate to='/dashboard' replace />,
      },
    ],
  },

  // Catch all route
  {
    path: "*",
    element: <Navigate to='/dashboard' replace />,
  },
]);

/**
 * AppRouter provides the main router for the admin application.
 */
export default function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

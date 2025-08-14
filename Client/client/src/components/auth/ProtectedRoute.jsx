import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Loading component for auth state verification
 */
const AuthLoading = () => (
  <div className='min-h-screen flex items-center justify-center bg-ideas-white dark:bg-ideas-black'>
    <div className='flex flex-col items-center space-y-4'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-ideas-blue'></div>
      <p className='text-ideas-gray-600 dark:text-ideas-gray-400'>Verifying authentication...</p>
    </div>
  </div>
);

/**
 * ProtectedRoute component that guards routes requiring authentication
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect to if not authenticated (default: "/signin")
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {boolean} props.requireGuest - Whether user should NOT be authenticated (default: false)
 *
 * @returns {React.ReactNode} Protected component or redirect
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/signin",
  requireAuth = true,
  requireGuest = false,
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Memoize route checking logic to prevent unnecessary recalculations
  // Sensitive routes that require both email and ID verification for enhanced security
  const sensitiveRoutes = useMemo(
    () => ["/checkout", "/settings", "/makeover", "/photoshoot", "/equipment"],
    []
  );
  const requiresVerification = useMemo(
    () => sensitiveRoutes.some((route) => location.pathname.startsWith(route)),
    [sensitiveRoutes, location.pathname]
  );

  // Show loading state while checking authentication
  if (loading) {
    return <AuthLoading />;
  }

  // Guest-only routes (signin, signup, etc.) - redirect if authenticated
  if (requireGuest && isAuthenticated) {
    // Redirect to intended destination or dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    // Prevent redirect loops by checking if we're already at the target
    if (location.pathname !== from) {
      return <Navigate to={from} replace />;
    }
  }

  // Protected routes - redirect if not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    // Prevent redirect loops by checking if we're already at the redirect target
    if (location.pathname !== redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
  }

  // Additional checks for authenticated users
  if (requireAuth && isAuthenticated) {
    // Check if user account is active
    if (user && user.isActive === false && location.pathname !== "/account-deactivated") {
      return <Navigate to='/account-deactivated' state={{ from: location }} replace />;
    }

    // Check if user account is locked
    if (user && user.isLocked === true && location.pathname !== "/account-locked") {
      return <Navigate to='/account-locked' state={{ from: location }} replace />;
    }

    // Check if email verification is required for sensitive routes
    if (
      requiresVerification &&
      user &&
      !user.isEmailVerified &&
      location.pathname !== "/email-verification-required"
    ) {
      return (
        <Navigate
          to='/email-verification-required'
          state={{ from: location, requireVerification: true }}
          replace
        />
      );
    }

    // Check if ID verification is required for sensitive routes
    if (
      requiresVerification &&
      user &&
      !user.isFullyVerified &&
      location.pathname !== "/id-verification-required"
    ) {
      return (
        <Navigate
          to='/id-verification-required'
          state={{ from: location, requireVerification: true }}
          replace
        />
      );
    }
  }

  // Render the protected component
  return children;
};

/**
 * Convenience components for common use cases
 */
export const RequireAuth = ({ children, redirectTo }) => (
  <ProtectedRoute requireAuth={true} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const RequireGuest = ({ children, redirectTo }) => (
  <ProtectedRoute requireGuest={true} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;

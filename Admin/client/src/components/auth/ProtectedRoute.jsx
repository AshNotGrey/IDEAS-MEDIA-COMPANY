import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-ideas-accent/10 to-ideas-accentLight/20'>
        <div className='text-center'>
          <Loader2 size={48} className='animate-spin text-ideas-accent mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-black dark:text-white mb-2'>
            Loading Admin Console
          </h2>
          <p className='text-subtle'>Please wait while we verify your credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;

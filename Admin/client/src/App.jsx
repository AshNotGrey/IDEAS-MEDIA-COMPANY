import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./graphql/hooks/useAdmin.js";

// Import your components here
// import AdminLogin from './components/auth/AdminLogin';
// import Dashboard from './components/Dashboard';
// import UserManagement from './components/UserManagement';
// etc.

function App() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className='App'>
        <Routes>
          {/* Public routes */}
          <Route
            path='/login'
            element={
              isAuthenticated ? (
                <Navigate to='/dashboard' replace />
              ) : (
                <div>Admin Login Component</div>
              )
            }
          />

          {/* Protected routes */}
          <Route
            path='/dashboard'
            element={
              isAuthenticated ? <div>Dashboard Component</div> : <Navigate to='/login' replace />
            }
          />
          <Route
            path='/users'
            element={
              isAuthenticated ? (
                <div>User Management Component</div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/bookings'
            element={
              isAuthenticated ? (
                <div>Booking Management Component</div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/services'
            element={
              isAuthenticated ? (
                <div>Service Management Component</div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/galleries'
            element={
              isAuthenticated ? (
                <div>Gallery Management Component</div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/reviews'
            element={
              isAuthenticated ? (
                <div>Review Management Component</div>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          {/* Default redirect */}
          <Route
            path='/'
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

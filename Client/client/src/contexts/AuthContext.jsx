import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth as useAuthHook } from "../graphql/hooks/useAuth";

/**
 * AuthContext provides authentication state and methods globally
 */
const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  forgotPassword: () => {},
  resetPassword: () => {},
  verifyEmail: () => {},
  changePassword: () => {},
  updateProfile: () => {},
  refetchUser: () => {},
});

/**
 * AuthProvider component that wraps the app and provides auth state
 *
 * This maintains backward compatibility with existing useAuth hook usage
 * while providing global state management through React Context.
 */
export const AuthProvider = ({ children }) => {
  const authData = useAuthHook();
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure initial auth state is loaded
  useEffect(() => {
    if (!authData.loading) {
      setIsInitialized(true);
    }
  }, [authData.loading]);

  const value = useMemo(
    () => ({
      ...authData,
      loading: authData.loading || !isInitialized,
    }),
    [authData, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 *
 * This provides the same interface as the original useAuth hook
 * but uses the global context for consistent state across components.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

export const useAdminAuth = () => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminUser');

        if (storedToken && storedAdmin && !authService.isTokenExpired(storedToken)) {
            setToken(storedToken);
            setAdmin(JSON.parse(storedAdmin));
            setIsAuthenticated(true);
        } else if (storedToken && authService.isTokenExpired(storedToken)) {
            // Token is expired, try to refresh
            handleTokenRefresh();
        }
        setLoading(false);
    }, []);

    // Check current user on mount and when token changes
    useEffect(() => {
        if (token && !authService.isTokenExpired(token)) {
            checkCurrentUser();
        }
    }, [token]);

    const checkCurrentUser = async () => {
        try {
            const userData = await authService.getCurrentUser(token);
            setAdmin(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to get current user:', error);
            if (error.message.includes('Authentication required') ||
                error.message.includes('Invalid token') ||
                error.message.includes('Token expired')) {
                logout();
            }
        }
    };

    const handleTokenRefresh = useCallback(async () => {
        try {
            const storedRefresh = localStorage.getItem('adminRefreshToken');
            if (!storedRefresh) {
                logout();
                return;
            }

            const response = await authService.refreshToken(storedRefresh);
            const { token: newToken, refreshToken: newRefreshToken, user: adminData } = response;

            if (newToken) {
                localStorage.setItem('adminToken', newToken);
                if (newRefreshToken) localStorage.setItem('adminRefreshToken', newRefreshToken);
                localStorage.setItem('adminUser', JSON.stringify(adminData));

                setToken(newToken);
                setAdmin(adminData);
                setIsAuthenticated(true);
                return newToken;
            }
            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return null;
        }
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            const { token: authToken, refreshToken, user: adminData } = response;

            // Store in localStorage
            localStorage.setItem('adminToken', authToken);
            if (refreshToken) localStorage.setItem('adminRefreshToken', refreshToken);
            localStorage.setItem('adminUser', JSON.stringify(adminData));

            // Store device info if remember me is enabled
            if (credentials.rememberMe && credentials.deviceInfo) {
                localStorage.setItem('adminDeviceInfo', JSON.stringify(credentials.deviceInfo));
                localStorage.setItem('adminRememberMe', 'true');
            }

            // Update state
            setToken(authToken);
            setAdmin(adminData);
            setIsAuthenticated(true);

            return { success: true, admin: adminData, token: authToken, refreshToken };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('adminRefreshToken');
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminDeviceInfo');
            localStorage.removeItem('adminRememberMe');
            setToken(null);
            setAdmin(null);
            setIsAuthenticated(false);
        }
    };

    const refreshAccessToken = useCallback(async () => {
        return handleTokenRefresh();
    }, [handleTokenRefresh]);

    // Auto-refresh token before expiration
    useEffect(() => {
        if (!token) return;

        const expiration = authService.getTokenExpiration(token);
        if (!expiration) return;

        const timeUntilExpiry = expiration.getTime() - Date.now();
        const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0); // Refresh 5 minutes before expiry

        const timer = setTimeout(() => {
            handleTokenRefresh();
        }, refreshTime);

        return () => clearTimeout(timer);
    }, [token, handleTokenRefresh]);

    return {
        admin,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshAccessToken,
        checkCurrentUser,
    };
};

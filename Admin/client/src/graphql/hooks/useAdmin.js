import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    ADMIN_LOGIN,
    GET_CURRENT_ADMIN,
    GET_ALL_USERS,
    CREATE_USER,
    UPDATE_USER,
    DELETE_USER,
    TOGGLE_USER_STATUS,
    GET_DASHBOARD_STATS,
    GET_ANALYTICS
} from '../queries/admin.js';

export const useAdminAuth = () => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get current admin query
    const { data: currentAdminData, loading: adminLoading, refetch: refetchAdmin } = useQuery(GET_CURRENT_ADMIN, {
        skip: !token,
        errorPolicy: 'ignore'
    });

    // Admin login mutation
    const [adminLoginMutation] = useMutation(ADMIN_LOGIN);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminUser');

        if (storedToken && storedAdmin) {
            setToken(storedToken);
            setAdmin(JSON.parse(storedAdmin));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Update admin when currentAdminData changes
    useEffect(() => {
        if (currentAdminData?.currentAdmin) {
            setAdmin(currentAdminData.currentAdmin);
            localStorage.setItem('adminUser', JSON.stringify(currentAdminData.currentAdmin));
        }
    }, [currentAdminData]);

    const login = async (credentials) => {
        try {
            const { data } = await adminLoginMutation({
                variables: { input: credentials }
            });

            const { token: authToken, refreshToken, admin: adminData } = data.adminLogin;

            // Store in localStorage
            localStorage.setItem('adminToken', authToken);
            if (refreshToken) localStorage.setItem('adminRefreshToken', refreshToken);
            localStorage.setItem('adminUser', JSON.stringify(adminData));

            // Update state
            setToken(authToken);
            setAdmin(adminData);
            setIsAuthenticated(true);

            return { success: true, admin: adminData, token: authToken, refreshToken };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setAdmin(null);
        setIsAuthenticated(false);
    };

    return {
        admin,
        token,
        isAuthenticated,
        loading: loading || adminLoading,
        login,
        logout,
        refetchAdmin
    };
};

export const useUserManagement = () => {
    // Queries
    const {
        data: usersData,
        loading: usersLoading,
        error: usersError,
        refetch: refetchUsers
    } = useQuery(GET_ALL_USERS, {
        fetchPolicy: 'cache-and-network'
    });

    // Mutations
    const [createUserMutation, { loading: createLoading }] = useMutation(CREATE_USER, {
        refetchQueries: [{ query: GET_ALL_USERS }],
        awaitRefetchQueries: true
    });

    const [updateUserMutation, { loading: updateLoading }] = useMutation(UPDATE_USER, {
        refetchQueries: [{ query: GET_ALL_USERS }],
        awaitRefetchQueries: true
    });

    const [deleteUserMutation, { loading: deleteLoading }] = useMutation(DELETE_USER, {
        refetchQueries: [{ query: GET_ALL_USERS }],
        awaitRefetchQueries: true
    });

    const [toggleUserStatusMutation, { loading: toggleLoading }] = useMutation(TOGGLE_USER_STATUS, {
        refetchQueries: [{ query: GET_ALL_USERS }],
        awaitRefetchQueries: true
    });

    const createUser = async (userData) => {
        try {
            const { data } = await createUserMutation({
                variables: { input: userData }
            });
            return { success: true, user: data.createUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            const { data } = await updateUserMutation({
                variables: { id: userId, input: userData }
            });
            return { success: true, user: data.updateUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteUser = async (userId) => {
        try {
            const { data } = await deleteUserMutation({
                variables: { id: userId }
            });
            return { success: true, user: data.deleteUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            const { data } = await toggleUserStatusMutation({
                variables: { id: userId }
            });
            return { success: true, user: data.toggleUserStatus };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        users: usersData?.users || [],
        loading: usersLoading,
        error: usersError,
        createLoading,
        updateLoading,
        deleteLoading,
        toggleLoading,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        refetchUsers
    };
};

export const useDashboard = () => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_DASHBOARD_STATS, {
        fetchPolicy: 'cache-and-network',
        pollInterval: 30000 // Poll every 30 seconds for live updates
    });

    return {
        dashboardStats: data?.dashboardStats,
        loading,
        error,
        refetch
    };
};

export const useAnalytics = (startDate, endDate) => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_ANALYTICS, {
        variables: { startDate, endDate },
        skip: !startDate || !endDate,
        fetchPolicy: 'cache-and-network'
    });

    return {
        analytics: data?.analytics,
        loading,
        error,
        refetch
    };
}; 
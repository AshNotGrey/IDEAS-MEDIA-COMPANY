import { useQuery, useMutation } from '@apollo/client';
import {
    GET_ALL_USERS,
    CREATE_USER,
    UPDATE_USER,
    DELETE_USER,
    TOGGLE_USER_STATUS,
    GET_DASHBOARD_STATS,
    GET_ANALYTICS
} from '../queries/admin.js';

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

// Legacy analytics hook - use useAnalytics from useAnalytics.js for comprehensive analytics
export const useLegacyAnalytics = (startDate, endDate) => {
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
        analytics: data?.getRevenueAnalytics,
        loading,
        error,
        refetch
    };
}; 
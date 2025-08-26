import { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
    GET_USERS,
    GET_USER,
    GET_USER_BY_EMAIL,
    GET_USER_STATS,
    GET_VERIFICATION_QUEUE,
    GET_LOCKED_ACCOUNTS,
    CREATE_ADMIN,
    UPDATE_USER,
    DELETE_USER,
    ACTIVATE_USER,
    DEACTIVATE_USER,
    UPDATE_USER_ROLE,
    APPROVE_VERIFICATION,
    REJECT_VERIFICATION,
    UNLOCK_ACCOUNT,
    RESET_LOGIN_ATTEMPTS,
    BULK_UPDATE_USERS,
    BULK_DELETE_USERS,
} from '../queries/users.js';

// Hook for user list with filtering, sorting, and pagination
export const useUsers = (options = {}) => {
    const {
        filter = {},
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...queryOptions
    } = options;

    const {
        data,
        loading,
        error,
        refetch,
        fetchMore,
    } = useQuery(GET_USERS, {
        variables: { filter, page, limit, sortBy, sortOrder },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...queryOptions,
    });

    const users = data?.users?.users || [];
    const pagination = {
        total: data?.users?.total || 0,
        page: data?.users?.page || 1,
        limit: data?.users?.limit || 20,
        totalPages: data?.users?.totalPages || 0,
    };

    return {
        users,
        pagination,
        loading,
        error,
        refetch,
        fetchMore,
    };
};

// Hook for individual user
export const useUser = (id, options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_USER, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all',
        ...options,
    });

    return {
        user: data?.user,
        loading,
        error,
        refetch,
    };
};

// Hook for user by email
export const useUserByEmail = (email, options = {}) => {
    const { data, loading, error } = useQuery(GET_USER_BY_EMAIL, {
        variables: { email },
        skip: !email,
        errorPolicy: 'all',
        ...options,
    });

    return {
        user: data?.userByEmail,
        loading,
        error,
    };
};

// Hook for user statistics
export const useUserStats = (options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_USER_STATS, {
        errorPolicy: 'all',
        ...options,
    });

    return {
        stats: data?.userStats,
        loading,
        error,
        refetch,
    };
};

// Hook for verification queue
export const useVerificationQueue = (options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_VERIFICATION_QUEUE, {
        errorPolicy: 'all',
        ...options,
    });

    return {
        queue: data?.verificationQueue || [],
        loading,
        error,
        refetch,
    };
};

// Hook for locked accounts
export const useLockedAccounts = (options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_LOCKED_ACCOUNTS, {
        errorPolicy: 'all',
        ...options,
    });

    return {
        lockedAccounts: data?.lockedAccounts || [],
        loading,
        error,
        refetch,
    };
};

// Hook for user mutations
export const useUserMutations = () => {
    const client = useApolloClient();
    const [loading, setLoading] = useState(false);

    const [createAdminMutation] = useMutation(CREATE_ADMIN);
    const [updateUserMutation] = useMutation(UPDATE_USER);
    const [deleteUserMutation] = useMutation(DELETE_USER);
    const [activateUserMutation] = useMutation(ACTIVATE_USER);
    const [deactivateUserMutation] = useMutation(DEACTIVATE_USER);
    const [updateUserRoleMutation] = useMutation(UPDATE_USER_ROLE);
    const [approveVerificationMutation] = useMutation(APPROVE_VERIFICATION);
    const [rejectVerificationMutation] = useMutation(REJECT_VERIFICATION);
    const [unlockAccountMutation] = useMutation(UNLOCK_ACCOUNT);
    const [resetLoginAttemptsMutation] = useMutation(RESET_LOGIN_ATTEMPTS);
    const [bulkUpdateUsersMutation] = useMutation(BULK_UPDATE_USERS);
    const [bulkDeleteUsersMutation] = useMutation(BULK_DELETE_USERS);

    const refetchQueries = () => {
        client.refetchQueries({
            include: [GET_USERS, GET_USER_STATS, GET_VERIFICATION_QUEUE, GET_LOCKED_ACCOUNTS],
        });
    };

    const createAdmin = async (input) => {
        setLoading(true);
        try {
            const result = await createAdminMutation({
                variables: { input },
                refetchQueries: [{ query: GET_USERS }],
            });
            return result.data?.createAdmin;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id, input) => {
        setLoading(true);
        try {
            const result = await updateUserMutation({
                variables: { id, input },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id } }],
            });
            return result.data?.updateUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        setLoading(true);
        try {
            const result = await deleteUserMutation({
                variables: { id },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER_STATS }],
            });
            return result.data?.deleteUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const activateUser = async (id) => {
        setLoading(true);
        try {
            const result = await activateUserMutation({
                variables: { id },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id } }],
            });
            return result.data?.activateUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deactivateUser = async (id) => {
        setLoading(true);
        try {
            const result = await deactivateUserMutation({
                variables: { id },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id } }],
            });
            return result.data?.deactivateUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (id, role, permissions = []) => {
        setLoading(true);
        try {
            const result = await updateUserRoleMutation({
                variables: { id, role, permissions },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id } }],
            });
            return result.data?.updateUserRole;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const approveVerification = async (userId, type) => {
        setLoading(true);
        try {
            const result = await approveVerificationMutation({
                variables: { userId, type },
                refetchQueries: [
                    { query: GET_USERS },
                    { query: GET_USER, variables: { id: userId } },
                    { query: GET_VERIFICATION_QUEUE },
                ],
            });
            return result.data?.approveVerification;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const rejectVerification = async (userId, type, reason) => {
        setLoading(true);
        try {
            const result = await rejectVerificationMutation({
                variables: { userId, type, reason },
                refetchQueries: [
                    { query: GET_USERS },
                    { query: GET_USER, variables: { id: userId } },
                    { query: GET_VERIFICATION_QUEUE },
                ],
            });
            return result.data?.rejectVerification;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const unlockAccount = async (id) => {
        setLoading(true);
        try {
            const result = await unlockAccountMutation({
                variables: { id },
                refetchQueries: [
                    { query: GET_USERS },
                    { query: GET_USER, variables: { id } },
                    { query: GET_LOCKED_ACCOUNTS },
                ],
            });
            return result.data?.unlockAccount;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetLoginAttempts = async (id) => {
        setLoading(true);
        try {
            const result = await resetLoginAttemptsMutation({
                variables: { id },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id } }],
            });
            return result.data?.resetLoginAttempts;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const bulkUpdateUsers = async (ids, input) => {
        setLoading(true);
        try {
            const result = await bulkUpdateUsersMutation({
                variables: { ids, input },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER_STATS }],
            });
            return result.data?.bulkUpdateUsers;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const bulkDeleteUsers = async (ids) => {
        setLoading(true);
        try {
            const result = await bulkDeleteUsersMutation({
                variables: { ids },
                refetchQueries: [{ query: GET_USERS }, { query: GET_USER_STATS }],
            });
            return result.data?.bulkDeleteUsers;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createAdmin,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        updateUserRole,
        approveVerification,
        rejectVerification,
        unlockAccount,
        resetLoginAttempts,
        bulkUpdateUsers,
        bulkDeleteUsers,
        refetchQueries,
    };
};

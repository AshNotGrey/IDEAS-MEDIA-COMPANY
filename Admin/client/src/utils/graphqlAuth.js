/**
 * Utility for adding authentication headers to GraphQL operations
 * This is used when making GraphQL calls that require authentication
 */

export const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return {};

    return {
        authorization: `Bearer ${token}`,
        'x-admin-access': 'true',
    };
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    // Check if token is expired
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const getTokenExpiration = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return new Date(payload.exp * 1000);
    } catch {
        return null;
    }
};

export const shouldRefreshToken = () => {
    const expiration = getTokenExpiration();
    if (!expiration) return false;

    // Refresh if token expires in less than 5 minutes
    const timeUntilExpiry = expiration.getTime() - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000;
};

/**
 * Helper function to create authenticated GraphQL operations
 * Use this when you need to make GraphQL calls that require authentication
 */
export const createAuthenticatedOperation = (operation) => {
    const headers = getAuthHeaders();
    if (!headers.authorization) {
        throw new Error('Authentication required for this operation');
    }

    return {
        ...operation,
        context: {
            ...operation.context,
            headers: {
                ...operation.context?.headers,
                ...headers,
            },
        },
    };
};

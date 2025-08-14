import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Refresh flow for admin client
const refreshAccessToken = async () => {
    try {
        const storedRefresh = localStorage.getItem('adminRefreshToken');
        if (!storedRefresh) return null;
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-refresh-token': storedRefresh
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.token) {
            localStorage.setItem('adminToken', data.token);
            if (data.refreshToken) localStorage.setItem('adminRefreshToken', data.refreshToken);
            return data.token;
        }
        return null;
    } catch (_) {
        return null;
    }
};

// HTTP link to your GraphQL server
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4001/admin-graphql', // Admin server GraphQL path
});

// Auth link to include JWT token in headers
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem('adminToken');

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
            'x-admin-access': 'true', // Flag for admin access
        }
    };
});

// Error link to handle GraphQL and network errors
const errorLink = onError(async ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        for (const { message, locations, path } of graphQLErrors) {
            console.error(
                `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
            );

            // Handle authentication errors
            if (message.includes('Authentication required') ||
                message.includes('Invalid token') ||
                message.includes('Admin access required')) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    const oldHeaders = operation.getContext().headers || {};
                    operation.setContext({ headers: { ...oldHeaders, authorization: `Bearer ${newToken}` } });
                    return forward(operation);
                }
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/signin';
            }
        }
    }

    if (networkError) {
        console.error(`Network error: ${networkError}`);

        // Handle network errors (server down, etc.)
        const statusCode = networkError.statusCode || networkError.status;
        if (statusCode === 401 || statusCode === 403) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const oldHeaders = operation.getContext().headers || {};
                operation.setContext({ headers: { ...oldHeaders, authorization: `Bearer ${newToken}` } });
                return forward(operation);
            }
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/signin';
        }
    }
});

// Cache configuration with admin-specific policies
const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                // Cache policies for admin data that updates frequently
                bookings: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                galleries: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                reviews: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                products: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                services: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                users: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
                pendingReviews: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
            },
        },
    },
});

// Create Apollo Client
const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

export default client; 
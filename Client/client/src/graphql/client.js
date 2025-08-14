import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const refreshAccessToken = async () => {
    try {
        const storedRefresh = localStorage.getItem('refreshToken');
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
            localStorage.setItem('token', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            return data.token;
        }
        return null;
    } catch (_) {
        return null;
    }
};

// HTTP link to your GraphQL server
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
});

// Auth link to include JWT token in headers
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem('token');

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
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
            if (message.includes('Authentication required') || message.includes('Invalid token')) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    const oldHeaders = operation.getContext().headers || {};
                    operation.setContext({ headers: { ...oldHeaders, authorization: `Bearer ${newToken}` } });
                    return forward(operation);
                }

                // Only redirect to signin if user was previously authenticated
                // This allows guests to use local cart without interruption
                const wasAuthenticated = localStorage.getItem('token') || localStorage.getItem('user');
                if (wasAuthenticated) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                } else {
                    // Guest user - just log the error, don't redirect
                    console.warn('GraphQL operation requires authentication, skipping for guest user');
                }
            }
        }
    }

    if (networkError) {
        console.error(`Network error: ${networkError}`);

        // Handle network errors (server down, etc.)
        const statusCode = networkError.statusCode || networkError.status;
        if (statusCode === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const oldHeaders = operation.getContext().headers || {};
                operation.setContext({ headers: { ...oldHeaders, authorization: `Bearer ${newToken}` } });
                return forward(operation);
            }

            // Only redirect to signin if user was previously authenticated
            // This allows guests to use local cart without interruption
            const wasAuthenticated = localStorage.getItem('token') || localStorage.getItem('user');
            if (wasAuthenticated) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            } else {
                // Guest user - just log the error, don't redirect
                console.warn('Network request requires authentication, skipping for guest user');
            }
        }
    }
});

// Cache configuration
const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                // Cache policies for lists that might be updated frequently
                bookings: {
                    merge(_, incoming) {
                        return incoming;
                    },
                },
                galleries: {
                    merge(_, incoming) {
                        return incoming;
                    },
                },
                reviews: {
                    merge(_, incoming) {
                        return incoming;
                    },
                },
                products: {
                    merge(_, incoming) {
                        return incoming;
                    },
                },
                services: {
                    merge(_, incoming) {
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
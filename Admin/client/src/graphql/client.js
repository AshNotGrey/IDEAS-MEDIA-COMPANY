import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP link to your GraphQL server
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4001/graphql', // Different port for admin server
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
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
                `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
            );

            // Handle authentication errors
            if (message.includes('Authentication required') ||
                message.includes('Invalid token') ||
                message.includes('Admin access required')) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/signin';
            }
        });
    }

    if (networkError) {
        console.error(`Network error: ${networkError}`);

        // Handle network errors (server down, etc.)
        if (networkError.statusCode === 401 || networkError.statusCode === 403) {
            localStorage.removeItem('adminToken');
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
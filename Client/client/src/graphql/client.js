import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

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
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
                `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
            );

            // Handle authentication errors
            if (message.includes('Authentication required') || message.includes('Invalid token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            }
        });
    }

    if (networkError) {
        console.error(`Network error: ${networkError}`);

        // Handle network errors (server down, etc.)
        if (networkError.statusCode === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
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
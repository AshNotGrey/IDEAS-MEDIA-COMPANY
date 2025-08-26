import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// HTTP link to your GraphQL server (for non-auth operations only)
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4001/admin-graphql',
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

// Create a lazy Apollo Client that only initializes when needed
let clientInstance = null;

const createClient = () => {
    if (!clientInstance) {
        clientInstance = new ApolloClient({
            link: httpLink,
            cache,
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'cache-first',
                    errorPolicy: 'all',
                    // Disable all background polling and updates
                    pollInterval: 0,
                    notifyOnNetworkStatusChange: false,
                },
                query: {
                    fetchPolicy: 'cache-first',
                    errorPolicy: 'all',
                    // Disable background refetching
                    notifyOnNetworkStatusChange: false,
                },
                mutate: {
                    errorPolicy: 'all',
                    // Disable automatic cache updates
                    update: undefined,
                },
                // Disable all subscriptions and real-time features
                subscribe: {
                    errorPolicy: 'all',
                },
            },
            // Disable automatic features that cause background requests
            connectToDevTools: false,
        });
    }
    return clientInstance;
};

// Export a function that creates the client only when needed
const client = createClient();

export default client; 
/**
 * Utility to dynamically add Apollo Client when GraphQL is needed
 * This prevents background requests until GraphQL is actually used
 */

import React from 'react';
import { ApolloProvider } from '@apollo/client';

let apolloClient = null;

// Lazy load Apollo Client only when needed
const getApolloClient = async () => {
    if (!apolloClient) {
        const { default: client } = await import('../graphql/client.js');
        apolloClient = client;
    }
    return apolloClient;
};

/**
 * Dynamic Apollo Provider that only initializes when needed
 * Wrap your app with this when you need GraphQL
 */
export const DynamicApolloProvider = ({ children }) => {
    const [client, setClient] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getApolloClient().then(client => {
            setClient(client);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading GraphQL client...</div>;
    }

    if (!client) {
        return children; // Fallback if client fails to load
    }

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
};

/**
 * Hook to check if Apollo Client is available
 */
export const useApolloAvailable = () => {
    const [available, setAvailable] = React.useState(false);

    React.useEffect(() => {
        getApolloClient().then(() => setAvailable(true));
    }, []);

    return available;
};

/**
 * Function to manually initialize Apollo Client
 * Call this when you're ready to use GraphQL
 */
export const initializeApollo = async () => {
    return await getApolloClient();
};

import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

// Import all typeDefs
import userTypeDefs from './typeDefs/user.type.js';
import productTypeDefs from './typeDefs/product.type.js';
import bookingTypeDefs from './typeDefs/booking.type.js';
import serviceTypeDefs from './typeDefs/service.type.js';
import galleryTypeDefs from './typeDefs/gallery.type.js';
import reviewTypeDefs from './typeDefs/review.type.js';
import orderTypeDefs from './typeDefs/order.type.js';
import campaignTypeDefs from './typeDefs/campaign.type.js';
import notificationTypeDefs from './typeDefs/notification.type.js';
import settingsTypeDefs from './typeDefs/settings.type.js';
import auditLogTypeDefs from './typeDefs/auditLog.type.js';

// Import all resolvers
import userResolvers from './resolvers/user.resolver.js';
import productResolvers from './resolvers/product.resolver.js';
import bookingResolvers from './resolvers/booking.resolver.js';
import serviceResolvers from './resolvers/service.resolver.js';
import galleryResolvers from './resolvers/gallery.resolver.js';
import reviewResolvers from './resolvers/review.resolver.js';
import orderResolvers from './resolvers/order.resolver.js';
import campaignResolvers from './resolvers/campaign.resolver.js';
import notificationResolvers from './resolvers/notification.resolver.js';
import settingsResolvers from './resolvers/settings.resolver.js';
import auditLogResolvers from './resolvers/auditLog.resolver.js';

// Base GraphQL schema for common scalars and directives
const baseTypeDefs = `
  scalar JSON
  scalar Upload
  scalar Date
  
  directive @auth(requires: [String!]) on FIELD_DEFINITION
  directive @admin(requires: [String!]) on FIELD_DEFINITION
  directive @owner on FIELD_DEFINITION
  directive @rateLimit(max: Int!, window: String!) on FIELD_DEFINITION

  # Common shared types
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
  
  type Subscription {
    _empty: String
  }
`;

// Merge all typeDefs and resolvers
const typeDefs = mergeTypeDefs([
    baseTypeDefs,
    userTypeDefs,
    productTypeDefs,
    bookingTypeDefs,
    serviceTypeDefs,
    galleryTypeDefs,
    reviewTypeDefs,
    orderTypeDefs,
    campaignTypeDefs,
    notificationTypeDefs,
    settingsTypeDefs,
    auditLogTypeDefs,
]);

const resolvers = mergeResolvers([
    userResolvers,
    productResolvers,
    bookingResolvers,
    serviceResolvers,
    galleryResolvers,
    reviewResolvers,
    orderResolvers,
    campaignResolvers,
    notificationResolvers,
    settingsResolvers,
    auditLogResolvers,
]);

// Authentication middleware
const authMiddleware = (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // TODO: Implement JWT verification
    return { token, user: req.user };
};

// Audit logging middleware
const auditMiddleware = async (req, resolverName, args, result, error) => {
    // TODO: Implement audit logging for mutations
    if (resolverName.includes('Mutation') && req.user) {
        const { createAuditLog } = await import('../mongoDB/index.js');
        try {
            await createAuditLog.utils.createAuditLog(
                resolverName,
                { user: req.user._id, userInfo: { name: req.user.name, email: req.user.email, role: req.user.role } },
                { resourceType: 'graphql', resourceName: resolverName },
                { status: error ? 'failure' : 'success', message: error?.message },
                { request: { method: 'POST', url: '/graphql' } }
            );
        } catch (auditError) {
            console.error('Audit logging failed:', auditError);
        }
    }
};

// Enhanced context function
const createContext = ({ req, res }) => {
    const auth = authMiddleware(req);

    return {
        req,
        res,
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.user,
        isAdmin: auth.user?.role === 'admin' || auth.user?.role === 'super_admin',
        isSuperAdmin: auth.user?.role === 'super_admin',
        // Helper functions for common operations
        requireAuth: () => {
            if (!auth.user) throw new Error('Authentication required');
        },
        requireAdmin: () => {
            if (!auth.user || !['admin', 'super_admin', 'manager'].includes(auth.user.role)) {
                throw new Error('Admin access required');
            }
        },
        requireSuperAdmin: () => {
            if (!auth.user || auth.user.role !== 'super_admin') {
                throw new Error('Super admin access required');
            }
        },
        checkPermission: (permission) => {
            if (!auth.user?.permissions?.includes(permission)) {
                throw new Error(`Permission ${permission} required`);
            }
        },
        // Audit logging helper
        audit: (action, target, result, details = {}) => {
            return auditMiddleware(req, action, {}, result, null);
        }
    };
};

// Plugin for authentication and authorization
const authPlugin = {
    requestDidStart() {
        return {
            didResolveOperation(requestContext) {
                // TODO: Check rate limiting here
            },
            willSendResponse(requestContext) {
                // TODO: Log response metrics
            }
        };
    }
};

// Plugin for audit logging
const auditPlugin = {
    requestDidStart() {
        return {
            didEncounterErrors(requestContext) {
                // Log GraphQL errors
                console.error('GraphQL Error:', requestContext.errors);
            }
        };
    }
};

// Helper function to create Apollo Server v4 instance
const createApolloServer = (options = {}) => {
    return new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            authPlugin,
            auditPlugin,
            ...(options.plugins || [])
        ],
        formatError: (error) => {
            // Log errors but don't expose internal details in production
            console.error('GraphQL Error:', error);

            if (process.env.NODE_ENV === 'production') {
                // Hide internal error details in production
                if (error.message.includes('ValidationError') ||
                    error.message.includes('CastError') ||
                    error.message.includes('MongoError')) {
                    return new Error('An internal error occurred');
                }
            }

            return error;
        },
        introspection: process.env.NODE_ENV !== 'production',
        ...options,
    });
};

// Helper function to apply Apollo Server middleware to Express app
const applyApolloMiddleware = async (app, server, options = {}) => {
    await server.start();

    const defaultOptions = {
        context: createContext,
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    };

    app.use(
        '/graphql',
        expressMiddleware(server, {
            ...defaultOptions,
            ...options,
            context: async ({ req, res }) => {
                const baseContext = await createContext({ req, res });
                const customContext = options.context ? await options.context({ req, res }) : {};
                return { ...baseContext, ...customContext };
            }
        })
    );
};

// Helper function for subscription server setup
const createSubscriptionServer = (httpServer, options = {}) => {
    // TODO: Implement WebSocket subscriptions using graphql-ws
    return {
        start: () => console.log('Subscription server started'),
        stop: () => console.log('Subscription server stopped')
    };
};

export {
    typeDefs,
    resolvers,
    createApolloServer,
    applyApolloMiddleware,
    createSubscriptionServer,
    createContext,
    authMiddleware,
    auditMiddleware,
    // Legacy exports for backward compatibility
    ApolloServer,
    expressMiddleware
};

// Additional utilities
export const utils = {
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
    },
    authenticate: authMiddleware,
    authorize: (roles = []) => (user) => {
        if (!user) throw new Error('Authentication required');
        if (roles.length > 0 && !roles.includes(user.role)) {
            throw new Error('Insufficient permissions');
        }
        return true;
    }
}; 
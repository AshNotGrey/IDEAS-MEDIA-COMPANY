import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import colors from 'colors';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from correct file
config({
    path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}.local`)
});


// Import shared package with Apollo Server v4 helpers
import {
    createApolloServer,
    applyApolloMiddleware,
    createContext
} from '@ideal-photography/shared/graphql/index.js';

import {
    connectDB,
    initializeDB,
    models
} from '@ideal-photography/shared/mongoDB/index.js';

const app = express();
const PORT = parseInt(process.env.PORT) || 4001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration for admin
app.use(cors({
    origin: [
        process.env.ADMIN_URL || 'http://localhost:3001',
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan('combined', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Ideal Photography Admin Server',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Ideal Photography Admin Server',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        dependencies: {
            database: { status: 'unknown' }
        }
    };

    try {
        await mongoose.connection.db.admin().ping();
        healthCheck.dependencies.database.status = 'healthy';
        healthCheck.dependencies.database.readyState = mongoose.connection.readyState;
    } catch (error) {
        healthCheck.status = 'unhealthy';
        healthCheck.dependencies.database.status = 'unhealthy';
        healthCheck.dependencies.database.error = error.message;
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

// Authentication middleware (placeholder - implement your auth logic)
const authenticateUser = (req, res, next) => {
    // TODO: Implement JWT authentication similar to Client server
    // For now, we'll just pass through
    req.user = null;
    req.isAuthenticated = false;
    next();
};

// Apply authentication to GraphQL endpoint
app.use('/graphql', authenticateUser);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch all handler for SPA
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/graphql') || req.path.startsWith('/health')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Start server function
const startServer = async () => {
    try {
        console.log('🚀 Starting Ideal Photography Admin Server...'.cyan);

        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...'.yellow);
        await connectDB(process.env.MONGODB_URI);

        // Initialize database
        console.log('🔧 Initializing database...'.yellow);
        await initializeDB();

        // Create Apollo Server instance with admin-specific context
        console.log('🌐 Setting up GraphQL server...'.yellow);
        const server = createApolloServer({
            context: ({ req, res }) => {
                const baseContext = createContext({ req, res });
                return {
                    ...baseContext,
                    // Admin-specific context
                    isAdminServer: true,
                    requireAdmin: () => {
                        if (!req.user || !['admin', 'super_admin', 'manager'].includes(req.user.role)) {
                            throw new Error('Admin access required');
                        }
                    }
                };
            },
            plugins: [
                {
                    requestDidStart() {
                        return {
                            didResolveOperation(requestContext) {
                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`Admin GraphQL Operation: ${requestContext.request.operationName}`.green);
                                }
                            },
                            didEncounterErrors(requestContext) {
                                console.error('Admin GraphQL Errors:', requestContext.errors);
                            }
                        };
                    }
                }
            ]
        });

        // Apply Apollo Server middleware
        await applyApolloMiddleware(app, server, {
            context: ({ req, res }) => {
                const baseContext = createContext({ req, res });
                return {
                    ...baseContext,
                    isAdminServer: true,
                    clientType: 'admin',
                    version: process.env.npm_package_version || '1.0.0'
                };
            }
        });

        // Start the server
        const httpServer = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50).green);
            console.log('🎉 ADMIN SERVER READY!'.green.bold);
            console.log('='.repeat(50).green);
            console.log(`🌍 Server URL: http://localhost:${PORT}`.cyan);
            console.log(`🚀 GraphQL URL: http://localhost:${PORT}/graphql`.cyan);
            console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`.cyan);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`.cyan);
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
            console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log('='.repeat(50).green);
            console.log('\n📝 Admin logs will appear below:'.gray);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Admin Server received ${signal}. Starting graceful shutdown...`.yellow);

            httpServer.close(async () => {
                console.log('🔒 Admin HTTP server closed.'.gray);

                try {
                    await mongoose.connection.close();
                    console.log('🗄️ Database connection closed.'.gray);

                    await server.stop();
                    console.log('🌐 Admin GraphQL server stopped.'.gray);

                    console.log('✅ Admin graceful shutdown completed.'.green);
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during admin shutdown:', error);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                console.error('⏰ Admin server could not close connections in time, forcefully shutting down'.red);
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err, promise) => {
            console.error('🚨 Admin Unhandled Promise Rejection:'.red.bold, err);
            gracefulShutdown('unhandledRejection');
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('🚨 Admin Uncaught Exception:'.red.bold, err);
            gracefulShutdown('uncaughtException');
        });

    } catch (error) {
        console.error('❌ Failed to start Admin server:'.red.bold, error);
        process.exit(1);
    }
};

// Start the server only if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startServer();
}

export default app; 
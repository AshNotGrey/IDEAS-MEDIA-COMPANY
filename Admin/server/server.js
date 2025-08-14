import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    PORT,
    NODE_ENV,
    CLIENT_URL,
    ADMIN_URL,
    MONGODB_URI,
    PACKAGE_VERSION,
    JWT_SECRET,
} from './config/env.js';
import colors from 'colors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhooks.js';
import notificationsRoutes from './routes/notifications.js';
import authMiddleware from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// env is initialized by importing from ./config/env.js


// Import shared package with Apollo Server v5 helpers
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

// Security middleware (aligned more closely with client needs)
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
    origin: function (origin, callback) {
        const allowedOrigins = new Set([
            ADMIN_URL || 'http://localhost:3003',
            CLIENT_URL || 'http://localhost:3002',
            'http://localhost:3001',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
        ]);

        if (!origin) return callback(null, true);

        if (allowedOrigins.has(origin)) return callback(null, true);

        try {
            const { hostname } = new URL(origin);
            if (
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname === '::1' ||
                hostname.startsWith('192.168.') ||
                hostname.endsWith('.local')
            ) {
                return callback(null, true);
            }
        } catch (_) { }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware (clean, colorized, and filtered)
const methodColor = (method) => {
    switch (method) {
        case 'GET':
            return colors.cyan(method);
        case 'POST':
            return colors.green(method);
        case 'PUT':
        case 'PATCH':
            return colors.yellow(method);
        case 'DELETE':
            return colors.red(method);
        default:
            return colors.white(method);
    }
};

const statusColor = (status) => {
    if (status >= 500) return colors.red(status);
    if (status >= 400) return colors.yellow(status);
    if (status >= 300) return colors.cyan(status);
    return colors.green(status);
};

const shouldSkipLogging = (req, res) => {
    const pathToCheck = req.path || req.url || '';
    if (NODE_ENV === 'test') return true;
    if (req.method === 'OPTIONS') return true;
    if (pathToCheck === '/favicon.ico') return true;
    if (pathToCheck.startsWith('/api-docs') || pathToCheck.includes('swagger')) return true;
    if (pathToCheck.startsWith('/health') || pathToCheck.startsWith('/status')) return true;
    // In production, only log warnings/errors
    if (NODE_ENV === 'production' && res.statusCode < 400) return true;
    return false;
};

app.use(morgan((tokens, req, res) => {
    const method = methodColor(tokens.method(req, res));
    const url = tokens.url(req, res);
    const status = Number(tokens.status(req, res)) || 0;
    const coloredStatus = statusColor(status);
    const responseTime = tokens['response-time'](req, res) || '0';
    const length = tokens.res(req, res, 'content-length') || '0';
    return `➡️  ${method} ${url} ${coloredStatus} ${responseTime} ms ${colors.gray(`${length}b`)}`;
}, { skip: shouldSkipLogging }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy
app.set('trust proxy', 1);

// Global rate limiter (exclude health/status)
const globalLimiter = new RateLimiterMemory({
    keyPrefix: 'admin_global',
    points: 100,
    duration: 900,
});
const globalRateLimit = async (req, res, next) => {
    if (req.path.startsWith('/health') || req.path.startsWith('/status')) return next();
    try {
        await globalLimiter.consume(req.ip);
        return next();
    } catch (rej) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.round(rej.msBeforeNext / 1000) || 1
        });
    }
};
app.use(globalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Ideal Photography Admin Server',
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: PACKAGE_VERSION
    });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Ideal Photography Admin Server',
        uptime: process.uptime(),
        environment: NODE_ENV,
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

// Remove placeholder auth; rely on shared GraphQL context auth verification

// OpenAPI docs
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth and webhook routes
app.use('/api/auth/me', authMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/notifications', notificationsRoutes);

// Serve static files in production
if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch all handler for SPA
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/graphql') || req.path.startsWith('/health')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Error handling and 404 (after routes)
app.use(errorMiddleware);
app.use('/api/*', notFoundMiddleware);

// Start server function
const startServer = async () => {
    try {
        console.log('🚀 Starting Ideal Photography Admin Server...'.cyan);

        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...'.yellow);
        await connectDB(MONGODB_URI);

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
                                if (NODE_ENV === 'development') {
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
                    version: PACKAGE_VERSION
                };
            },
            cors: {
                origin: function (origin, callback) {
                    const allowedOrigins = new Set([
                        ADMIN_URL || 'http://localhost:3003',
                        'http://localhost:5173',
                        'http://localhost:5174',
                    ]);
                    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
                    try {
                        const { hostname } = new URL(origin);
                        if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.endsWith('.local')) {
                            return callback(null, true);
                        }
                    } catch (_) { }
                    return callback(new Error('Not allowed by CORS'));
                },
                credentials: true
            },
            path: '/admin-graphql'
        });

        // Start the server
        const httpServer = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50).green);
            console.log('🎉 ADMIN SERVER READY!'.green.bold);
            console.log('='.repeat(50).green);
            console.log(`🌍 Server URL: http://localhost:${PORT}`.cyan);
            console.log(`🚀 GraphQL URL: http://localhost:${PORT}/admin-graphql`.cyan);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`.cyan);
            console.log(`📦 Environment: ${NODE_ENV}`.yellow);
            console.log(`🔐 JWT Secret: ${JWT_SECRET ? '✅ Configured' : '❌ Missing'}`.yellow);
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
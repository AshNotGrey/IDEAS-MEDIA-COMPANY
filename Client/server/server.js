import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    PORT,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS,
    NODE_ENV,
    isDevelopment,
    CLIENT_URL,
    ADMIN_URL,
    MONGODB_URI,
    PACKAGE_VERSION,
    JWT_SECRET,
    PAYSTACK_SECRET_KEY,
    CLOUDINARY_CLOUD_NAME,
} from './config/env.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// env is initialized by importing from ./config/env.js

// Import shared modules
import {
    connectDB,
    initializeDB,
    models,
    utils
} from '@ideal-photography/shared/mongoDB/index.js';

import {
    createApolloServer,
    applyApolloMiddleware,
    createContext
} from '@ideal-photography/shared/graphql/index.js';

// Import middleware
import authMiddleware from './middleware/auth.js';
import uploadMiddleware from './middleware/upload.js';
import { errorMiddleware } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import webhookRoutes from './routes/webhooks.js';
import paymentsRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';
import notificationsRoutes from './routes/notifications.js';
import campaignRoutes from './routes/campaign.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();
// PORT is imported from env

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'middleware',
    points: RATE_LIMIT_MAX_REQUESTS,
    duration: RATE_LIMIT_WINDOW_SECONDS,
});

const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.round(rejRes.msBeforeNext) || 1000
        });
    }
};

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
            scriptSrc: ["'self'", "https://js.paystack.co"],
            connectSrc: ["'self'", "https://api.paystack.co"],
            frameSrc: ["'self'", "https://js.paystack.co"]
        }
    }
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = new Set([
            CLIENT_URL || 'http://localhost:5173',
            ADMIN_URL || 'http://localhost:5176',
        ]);

        // Allow requests with no origin like curl/postman or same-origin
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        // During development, allow any localhost or local network origins
        if (isDevelopment) {
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
            } catch (_) {
                // fall through to rejection below
            }
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// General middleware
app.use(compression());

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
    if (!isDevelopment && res.statusCode < 400) return true;
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

// Rate limiting (apply to all routes except health checks)
app.use((req, res, next) => {
    if (req.path.startsWith('/health') || req.path.startsWith('/status')) {
        return next();
    }
    return rateLimitMiddleware(req, res, next);
});

// Mount webhooks BEFORE JSON body parsing to preserve raw body for signature verification
app.use('/api/webhooks', webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Authentication middleware (applied globally, but optional)
app.use(authMiddleware);

// Health check routes (before other routes)
app.use('/health', healthRoutes);
app.use('/status', healthRoutes);

// OpenAPI docs
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/campaigns', campaignRoutes);

// Serve static files in production
if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch all handler for SPA
    app.get('*', (req, res, next) => {
        // Skip API routes and GraphQL
        if (req.path.startsWith('/api') || req.path.startsWith('/graphql')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Error handling middleware
app.use(errorMiddleware);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `API endpoint ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Active Client Server'
    });
});

// Database connection and server startup
async function startServer() {
    try {
        console.log('🚀 Starting Ideal Photography Client Server...'.cyan.bold);

        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...'.yellow);
        await connectDB(MONGODB_URI);

        // Initialize database
        console.log('🔧 Initializing database...'.yellow);
        await initializeDB();

        // Create Apollo GraphQL server
        console.log('🌐 Setting up GraphQL server...'.yellow);

        const apolloServer = createApolloServer({
            context: ({ req, res }) => createContext({ req, res }),
            plugins: [
                {
                    requestDidStart() {
                        return {
                            didResolveOperation(requestContext) {
                                if (isDevelopment) {
                                    console.log(`GraphQL Operation: ${requestContext.request.operationName}`.green);
                                }
                            },
                            didEncounterErrors(requestContext) {
                                console.error('GraphQL Errors:', requestContext.errors);
                            }
                        };
                    }
                }
            ]
        });


        // Apply GraphQL middleware
        await applyApolloMiddleware(app, apolloServer, {
            cors: corsOptions,
            context: ({ req, res }) => {
                return {
                    ...createContext({ req, res }),
                    // Add any client-specific context
                    clientType: 'customer',
                    version: PACKAGE_VERSION
                };
            }
        });

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50).green);
            console.log('🎉 CLIENT SERVER READY!'.green.bold);
            console.log('='.repeat(50).green);
            console.log(`🌍 Server URL: http://localhost:${PORT}`.cyan);
            console.log(`🚀 GraphQL URL: http://localhost:${PORT}/graphql`.cyan);
            console.log(`🔍 OpenAPI URL: http://localhost:${PORT}/openapi.json`.cyan);
            console.log(`🔍 Swagger URL: http://localhost:${PORT}/api-docs`.cyan);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`.cyan);
            console.log(`📦 Environment: ${NODE_ENV}`.yellow);
            console.log(`🔐 JWT Secret: ${JWT_SECRET ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log(`💳 Paystack: ${PAYSTACK_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log(`☁️ Cloudinary: ${CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log('='.repeat(50).green);
            console.log('\n📝 Logs will appear below:'.gray);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`.yellow);

            // Stop accepting new connections
            server.close(async () => {
                console.log('🔒 HTTP server closed.'.gray);

                try {
                    // Close database connection
                    await mongoose.connection.close();
                    console.log('🗄️ Database connection closed.'.gray);

                    // Stop Apollo server
                    await apolloServer.stop();
                    console.log('🌐 GraphQL server stopped.'.gray);

                    console.log('✅ Graceful shutdown completed.'.green);
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force close after 30 seconds
            setTimeout(() => {
                console.error('⏰ Could not close connections in time, forcefully shutting down'.red);
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err, promise) => {
            console.error('🚨 Unhandled Promise Rejection:'.red.bold, err);
            gracefulShutdown('unhandledRejection');
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('🚨 Uncaught Exception:'.red.bold, err);
            gracefulShutdown('uncaughtException');
        });

    } catch (error) {
        console.error('❌ Failed to start server:'.red.bold, error);
        process.exit(1);
    }
}

// Start the server
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startServer();
}

export default app; 
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from correct file
config({
    path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}.local`)
});

// Import shared modules
import {
    connectDB,
    initializeDB,
    models,
    utils
} from '@ideal-photography/shared/mongoDB/index.js';

import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
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
import healthRoutes from './routes/health.js';

const app = express();
const PORT = parseInt(process.env.PORT) || 4000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'middleware',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900, // 15 minutes
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
        const allowedOrigins = [
            process.env.CLIENT_URL || 'http://localhost:3000',
            process.env.ADMIN_URL || 'http://localhost:3001',
            'http://localhost:3000',
            'http://localhost:3001'
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// General middleware
app.use(compression());
app.use(morgan('combined', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
}));

// Rate limiting (apply to all routes except health checks)
app.use((req, res, next) => {
    if (req.path.startsWith('/health') || req.path.startsWith('/status')) {
        return next();
    }
    return rateLimitMiddleware(req, res, next);
});

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/webhooks', webhookRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
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

// Database connection and server startup
async function startServer() {
    try {
        console.log('🚀 Starting Ideal Photography Client Server...'.cyan.bold);

        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...'.yellow);
        await connectDB(process.env.MONGODB_URI);

        // Initialize database
        console.log('🔧 Initializing database...'.yellow);
        await initializeDB();

        // Create Apollo GraphQL server
        console.log('🌐 Setting up GraphQL server...'.yellow);

        const apolloServer = createApolloServer({
            context: ({ req, res }) => createContext({ req, res }),
            plugins: [
                ApolloServerPluginLandingPageGraphQLPlayground(), // 👈 Add this line
                {
                    requestDidStart() {
                        return {
                            didResolveOperation(requestContext) {
                                if (process.env.NODE_ENV === 'development') {
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
                    version: process.env.npm_package_version || '1.0.0'
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
            console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`.cyan);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`.cyan);
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
            console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log(`💳 Paystack: ${process.env.PAYSTACK_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`.yellow);
            console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing'}`.yellow);
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
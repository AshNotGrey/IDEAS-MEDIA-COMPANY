import express from 'express';
import { models } from '@ideal-photography/shared/mongoDB/index.js';

const router = express.Router();

/**
 * Basic health check
 */
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});

/**
 * Detailed health check with dependencies
 */
router.get('/detailed', async (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        dependencies: {
            database: { status: 'unknown' },
            memory: {
                usage: process.memoryUsage(),
                free: (await import('os')).freemem(),
                total: (await import('os')).totalmem()
            },
            cpu: {
                load: (await import('os')).loadavg(),
                cores: (await import('os')).cpus().length
            }
        }
    };

    try {
        // Check database connection
        await models.mongoose.connection.db.admin().ping();
        healthCheck.dependencies.database.status = 'healthy';
        healthCheck.dependencies.database.readyState = models.mongoose.connection.readyState;
    } catch (error) {
        healthCheck.status = 'unhealthy';
        healthCheck.dependencies.database.status = 'unhealthy';
        healthCheck.dependencies.database.error = error.message;
    }

    // Check environment variables
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET'
    ];

    healthCheck.dependencies.environment = {
        status: 'healthy',
        missing: []
    };

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            healthCheck.dependencies.environment.missing.push(envVar);
            healthCheck.dependencies.environment.status = 'unhealthy';
            healthCheck.status = 'unhealthy';
        }
    }

    // Check optional services
    healthCheck.dependencies.services = {
        paystack: process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured',
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured',
        emailjs: process.env.EMAILJS_SERVICE_ID ? 'configured' : 'not_configured'
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

/**
 * Readiness probe (for Kubernetes/Docker)
 */
router.get('/ready', async (req, res) => {
    try {
        // Check if we can query the database
        await models.mongoose.connection.db.admin().ping();

        res.json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'not_ready',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Liveness probe (for Kubernetes/Docker)
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router; 
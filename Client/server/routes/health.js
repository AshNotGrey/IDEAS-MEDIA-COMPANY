import express from 'express';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { NODE_ENV, PACKAGE_VERSION, PAYSTACK_SECRET_KEY, CLOUDINARY_CLOUD_NAME, EMAILJS_SERVICE_ID } from '../config/env.js';

const router = express.Router();

/**
 * Basic health check
 */
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: PACKAGE_VERSION
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
        environment: NODE_ENV,
        version: PACKAGE_VERSION,
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

    // Check critical configuration via centralized env
    const requiredConfig = {
        MONGODB_URI: process.env.MONGODB_URI, // populated by env loader
        JWT_SECRET: process.env.JWT_SECRET,
    };

    healthCheck.dependencies.environment = {
        status: 'healthy',
        missing: []
    };

    for (const [key, value] of Object.entries(requiredConfig)) {
        if (!value) {
            healthCheck.dependencies.environment.missing.push(key);
            healthCheck.dependencies.environment.status = 'unhealthy';
            healthCheck.status = 'unhealthy';
        }
    }

    // Check optional services
    healthCheck.dependencies.services = {
        paystack: PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured',
        cloudinary: CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured',
        emailjs: EMAILJS_SERVICE_ID ? 'configured' : 'not_configured'
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
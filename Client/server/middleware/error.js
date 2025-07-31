import { utils } from '@ideal-photography/shared/mongoDB/index.js';

/**
 * Global error handling middleware
 * This should be the last middleware in the chain
 */
const errorMiddleware = (err, req, res, next) => {
    // Log error details
    console.error('Error caught by middleware:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        user: req.user?.email || 'Anonymous',
        timestamp: new Date().toISOString()
    });

    // Default error response
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        code = 'VALIDATION_ERROR';
        message = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.name === 'CastError') {
        status = 400;
        code = 'INVALID_ID';
        message = 'Invalid ID format';
    } else if (err.code === 11000) {
        status = 400;
        code = 'DUPLICATE_ERROR';
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    } else if (err.name === 'JsonWebTokenError') {
        status = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && status === 500) {
        message = 'Something went wrong! Please try again later.';
    }

    // Log to audit system for critical errors
    if (status >= 500 && req.user) {
        utils.createAuditLog(
            'system.error',
            { user: req.user._id, userInfo: { name: req.user.name, email: req.user.email } },
            { resourceType: 'system', resourceName: 'error_handler' },
            { status: 'failure', message: err.message },
            {
                request: {
                    method: req.method,
                    url: req.url,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                },
                metadata: { stack: err.stack }
            }
        ).catch(auditErr => {
            console.error('Failed to create audit log:', auditErr);
        });
    }

    res.status(status).json({
        error: code,
        message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

/**
 * 404 Not Found handler
 */
const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
};

/**
 * Async error handler wrapper
 * Use this to wrap async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export {
    errorMiddleware,
    notFoundMiddleware,
    asyncHandler
}; 
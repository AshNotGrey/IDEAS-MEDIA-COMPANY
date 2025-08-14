import { utils } from '@ideal-photography/shared/mongoDB/index.js';
import { NODE_ENV } from '../config/env.js';

// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
    console.error('Admin Error caught by middleware:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        user: req.user?.username || 'Anonymous',
        timestamp: new Date().toISOString()
    });

    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';

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
        const field = Object.keys(err.keyValue || {})[0];
        message = field ? `${field} already exists` : 'Duplicate value';
    } else if (err.name === 'JsonWebTokenError') {
        status = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    }

    if (NODE_ENV === 'production' && status === 500) {
        message = 'Something went wrong! Please try again later.';
    }

    if (status >= 500 && req.user) {
        utils.createAuditLog(
            'system.error',
            { user: req.user._id, userInfo: { username: req.user.username, role: req.user.role } },
            { resourceType: 'system', resourceName: 'admin_error_handler' },
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
            console.error('Failed to create admin audit log:', auditErr);
        });
    }

    res.status(status).json({
        error: code,
        message,
        timestamp: new Date().toISOString(),
        ...(NODE_ENV === 'development' && { stack: err.stack, details: err })
    });
};

// 404 Not Found handler
const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
};

// Async wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export { errorMiddleware, notFoundMiddleware, asyncHandler };



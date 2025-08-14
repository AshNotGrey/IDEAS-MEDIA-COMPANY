import jwt from 'jsonwebtoken';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
} from '../config/env.js';

/**
 * Authentication middleware for JWT token verification
 * This middleware is applied globally but makes authentication optional
 * Individual routes/resolvers can require authentication as needed
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        // If no token, continue without authentication
        if (!token) {
            req.user = null;
            req.isAuthenticated = false;
            return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch user from database
        const user = await models.User.findById(decoded.userId).select('-password');

        if (!user) {
            req.user = null;
            req.isAuthenticated = false;
            return next();
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Account Deactivated',
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                error: 'Account Locked',
                message: 'Your account is temporarily locked due to too many failed login attempts. Please try again later.'
            });
        }

        // Attach user to request
        req.user = user;
        req.isAuthenticated = true;
        req.token = token;

        // Helper functions
        req.requireAuth = () => {
            if (!req.user) {
                throw new Error('Authentication required');
            }
        };

        req.requireRole = (roles) => {
            if (!req.user) {
                throw new Error('Authentication required');
            }
            if (Array.isArray(roles) && !roles.includes(req.user.role)) {
                throw new Error('Insufficient permissions');
            }
            if (typeof roles === 'string' && req.user.role !== roles) {
                throw new Error('Insufficient permissions');
            }
        };

        req.requirePermission = (permission) => {
            if (!req.user) {
                throw new Error('Authentication required');
            }
            if (!req.user.permissions || !req.user.permissions.includes(permission)) {
                throw new Error(`Permission ${permission} required`);
            }
        };

        req.requireVerification = () => {
            if (!req.user) {
                throw new Error('Authentication required');
            }
            if (!req.user.isFullyVerified) {
                throw new Error('Account verification required');
            }
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'The provided authentication token is invalid.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token Expired',
                message: 'Your session has expired. Please log in again.',
                expired: true
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Authentication Error',
            message: 'An error occurred during authentication.'
        });
    }
};

/**
 * Middleware to require authentication
 * Use this on routes that must have an authenticated user
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication Required',
            message: 'You must be logged in to access this resource.'
        });
    }
    next();
};

/**
 * Middleware to require specific role(s)
 * @param {string|Array} roles - Required role(s)
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication Required',
                message: 'You must be logged in to access this resource.'
            });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient Permissions',
                message: 'You do not have permission to access this resource.',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

/**
 * Middleware to require specific permission
 * @param {string} permission - Required permission
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication Required',
                message: 'You must be logged in to access this resource.'
            });
        }

        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return res.status(403).json({
                error: 'Insufficient Permissions',
                message: `Permission ${permission} is required to access this resource.`,
                required: permission,
                current: req.user.permissions || []
            });
        }

        next();
    };
};

/**
 * Middleware to require account verification
 */
const requireVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication Required',
            message: 'You must be logged in to access this resource.'
        });
    }

    if (!req.user.isFullyVerified) {
        return res.status(403).json({
            error: 'Verification Required',
            message: 'Your account must be fully verified to access this resource.',
            verification: {
                nin: req.user.verification.nin.status,
                driversLicense: req.user.verification.driversLicense.status
            }
        });
    }

    next();
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @param {string} type - Token type ('access' or 'refresh')
 */
const generateToken = (user, type = 'access') => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        type,
        aud: 'client',
        iss: 'ideal-photography'
    };

    const secret = type === 'refresh' ? JWT_REFRESH_SECRET : JWT_SECRET;

    const expiresIn = type === 'refresh' ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

export default authMiddleware;

export {
    requireAuth,
    requireRole,
    requirePermission,
    requireVerification,
    generateToken,
    verifyRefreshToken
}; 
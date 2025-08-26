import jwt from 'jsonwebtoken';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { JWT_SECRET } from '../config/env.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        if (!token) {
            req.user = null;
            req.isAuthenticated = false;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.adminId || decoded.userId; // backward compatibility
        const admin = await models.Admin.findById(adminId).select('-password');
        if (!admin) {
            req.user = null;
            req.isAuthenticated = false;
            return next();
        }
        if (!admin.isActive) {
            return res.status(403).json({ error: 'Account Deactivated' });
        }
        if (admin.isLocked) {
            return res.status(423).json({ error: 'Account Locked' });
        }
        if (!admin.isVerified) {
            return res.status(403).json({ error: 'Admin not verified' });
        }
        req.user = admin;
        req.isAuthenticated = true;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid Token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token Expired', expired: true });
        }
        return res.status(500).json({ error: 'Authentication Error' });
    }
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
    if (!req.user || !req.isAuthenticated) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

export default authMiddleware;
export { requireAuth };



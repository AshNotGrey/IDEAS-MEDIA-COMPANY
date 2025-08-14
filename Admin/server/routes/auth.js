import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { JWT_SECRET, JWT_REFRESH_SECRET, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS } from '../config/env.js';
import authMiddleware from '../middleware/auth.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const generateToken = (admin, type = 'access') => {
    const payload = { adminId: admin._id, username: admin.username, role: admin.role, type, aud: 'admin', iss: 'ideal-photography' };
    const secret = type === 'refresh' ? JWT_REFRESH_SECRET : JWT_SECRET;
    const expiresIn = type === 'refresh' ? (process.env.JWT_REFRESH_EXPIRES_IN || '7d') : (process.env.JWT_EXPIRES_IN || '30m');
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

// Rate limiter for auth endpoints
const authLimiter = new RateLimiterMemory({
    keyPrefix: 'admin_auth',
    points: Math.max(10, Math.floor(RATE_LIMIT_MAX_REQUESTS / 5)),
    duration: Math.max(60, RATE_LIMIT_WINDOW_SECONDS)
});

const rateLimit = async (req, res, next) => {
    try {
        await authLimiter.consume(req.ip);
        return next();
    } catch (rej) {
        return res.status(429).json({ error: 'Too Many Requests', retryAfter: Math.round(rej.msBeforeNext / 1000) });
    }
};

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({
        message: 'Admin Auth status',
        authenticated: !!req.user,
        user: req.user ? { id: req.user._id, username: req.user.username, role: req.user.role } : null
    });
});

// Admin login by username + password
router.post('/login', rateLimit, async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        const admin = await models.Admin.findOne({ username: String(username).trim() });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await admin.comparePassword(password);
        if (!valid) {
            await admin.incLoginAttempts();
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!['admin', 'manager', 'super_admin'].includes(admin.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        if (!admin.isActive) return res.status(403).json({ error: 'Account deactivated' });
        if (admin.isLocked) return res.status(423).json({ error: 'Account locked' });
        if (!admin.isVerified) return res.status(403).json({ error: 'Admin not verified' });
        await admin.resetLoginAttempts();
        admin.lastLogin = new Date();
        await admin.save();
        const token = generateToken(admin, 'access');
        // Issue refresh token and persist for rotation
        const refreshToken = generateToken(admin, 'refresh');
        const decoded = jwt.decode(refreshToken);
        const expiresAt = new Date(decoded.exp * 1000);
        const deviceMeta = {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            deviceId: req.get('x-device-id') || undefined,
            deviceName: req.get('x-device-name') || undefined,
            platform: req.get('x-device-platform') || undefined,
            browser: req.get('x-device-browser') || undefined,
        };
        await models.RefreshToken.create({ admin: admin._id, token: refreshToken, expiresAt, ...deviceMeta });
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.json({ token, refreshToken, user: safeAdmin, expiresIn: process.env.JWT_EXPIRES_IN || '30m' });
    } catch (err) {
        return res.status(500).json({ error: 'Login failed', message: err.message });
    }
});

router.post('/refresh', rateLimit, async (req, res) => {
    try {
        const token = req.headers['x-refresh-token'] || (req.body && req.body.refreshToken);
        if (!token) return res.status(400).json({ error: 'Refresh token is required' });
        const decoded = verifyRefreshToken(token);
        // Ensure token exists and not revoked
        const stored = await models.RefreshToken.findOne({ token });
        if (!stored || stored.revoked) return res.status(401).json({ error: 'Invalid refresh token' });
        const adminId = decoded.adminId || decoded.userId;
        const admin = await models.Admin.findById(adminId).select('-password');
        if (!admin || !['admin', 'manager', 'super_admin'].includes(admin.role)) return res.status(403).json({ error: 'Admin access required' });
        const accessToken = generateToken(admin, 'access');
        // Rotate refresh token
        const newRefresh = generateToken(admin, 'refresh');
        const newDecoded = jwt.decode(newRefresh);
        const expiresAt = new Date(newDecoded.exp * 1000);
        stored.revoked = true;
        stored.replacedByToken = newRefresh;
        stored.lastUsedAt = new Date();
        await stored.save();
        const deviceMeta = {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            deviceId: req.get('x-device-id') || stored.deviceId,
            deviceName: req.get('x-device-name') || stored.deviceName,
            platform: req.get('x-device-platform') || stored.platform,
            browser: req.get('x-device-browser') || stored.browser,
        };
        await models.RefreshToken.create({ admin: admin._id, token: newRefresh, expiresAt, ...deviceMeta });
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.json({ token: accessToken, refreshToken: newRefresh, user: safeAdmin, expiresIn: process.env.JWT_EXPIRES_IN || '30m' });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers['x-refresh-token'] || (req.body && req.body.refreshToken);
        if (token) {
            const stored = await models.RefreshToken.findOne({ token });
            if (stored && !stored.revoked) {
                stored.revoked = true;
                await stored.save();
            }
        }
    } catch (_) { }
    return res.json({ success: true });
});

router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    return res.json(req.user);
});

// GET /api/auth/sessions - list active sessions for current admin
router.get('/sessions', authMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const sessions = await models.RefreshToken.find({ admin: req.user._id, revoked: { $ne: true } })
        .select('-token')
        .sort({ updatedAt: -1 });
    return res.json({ sessions });
});

// POST /api/auth/sessions/revoke - revoke a specific session by id (manager/super_admin or self-owned)
router.post('/sessions/revoke', authMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    const record = await models.RefreshToken.findOne({ _id: sessionId, admin: req.user._id });
    if (!record) return res.status(404).json({ error: 'Session not found' });
    if (!record.revoked) {
        record.revoked = true;
        record.lastUsedAt = new Date();
        await record.save();
    }
    return res.json({ success: true });
});

// POST /api/auth/sessions/revoke-all - revoke all sessions except current device
router.post('/sessions/revoke-all', authMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const exceptDeviceId = req.get('x-device-id');
    const filter = { admin: req.user._id, revoked: { $ne: true } };
    if (exceptDeviceId) {
        Object.assign(filter, { deviceId: { $ne: exceptDeviceId } });
    }
    await models.RefreshToken.updateMany(filter, { $set: { revoked: true, lastUsedAt: new Date() } });
    return res.json({ success: true });
});

// Create an invite code (super_admin or manager)
router.post('/invites', authMiddleware, rateLimit, async (req, res) => {
    try {
        if (!req.user || !['super_admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        const { role = 'admin', permissions = [], ttlMinutes = 60 } = req.body || {};
        const code = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + Math.max(5, ttlMinutes) * 60 * 1000);
        const invite = await models.AdminInvite.create({
            code,
            createdBy: req.user._id,
            role,
            permissions,
            expiresAt
        });
        return res.status(201).json({ code, role: invite.role, expiresAt: invite.expiresAt });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create invite', message: err.message });
    }
});

// Register admin using invite code OR request verification by existing admin
router.post('/register', rateLimit, async (req, res) => {
    try {
        const { username, password, code, verifierUsername } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const existing = await models.Admin.findOne({ username: String(username).trim() });
        if (existing) return res.status(409).json({ error: 'Username already taken' });

        let role = 'admin';
        let permissions = [];
        let verifiedBy = null;
        let verifiedAt = null;
        let isVerified = false;

        if (code) {
            const invite = await models.AdminInvite.findOne({ code, used: false });
            if (!invite) return res.status(400).json({ error: 'Invalid invite code' });
            if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite code expired' });
            role = invite.role || role;
            permissions = invite.permissions || [];
            isVerified = true;
        } else if (verifierUsername) {
            const verifier = await models.Admin.findOne({ username: String(verifierUsername).trim(), isVerified: true, isActive: true });
            if (!verifier) return res.status(400).json({ error: 'Verifier not found or not eligible' });
            // Require later explicit verification action
            verifiedBy = null;
            verifiedAt = null;
            isVerified = false;
        } else {
            return res.status(400).json({ error: 'Provide an invite code or verifierUsername' });
        }

        const admin = await models.Admin.create({
            username: String(username).trim(),
            password,
            role,
            permissions,
            isVerified,
            verifiedBy,
            verifiedAt
        });

        if (code) {
            await models.AdminInvite.updateOne({ code }, { $set: { used: true, usedBy: admin._id, usedAt: new Date() } });
        }

        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.status(201).json({ user: safeAdmin, requiresVerification: !isVerified });
    } catch (err) {
        return res.status(500).json({ error: 'Admin registration failed', message: err.message });
    }
});

// Verify a pending admin (super_admin or manager)
router.post('/verify', authMiddleware, rateLimit, async (req, res) => {
    try {
        if (!req.user || !['super_admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        const { username } = req.body || {};
        if (!username) return res.status(400).json({ error: 'Username is required' });
        const admin = await models.Admin.findOne({ username: String(username).trim() });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        if (admin.isVerified) return res.status(400).json({ error: 'Admin already verified' });
        admin.isVerified = true;
        admin.verifiedBy = req.user._id;
        admin.verifiedAt = new Date();
        await admin.save();
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.json({ user: safeAdmin });
    } catch (err) {
        return res.status(500).json({ error: 'Verification failed', message: err.message });
    }
});

export default router;



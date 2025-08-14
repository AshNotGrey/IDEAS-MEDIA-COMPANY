import express from 'express';
import jwt from 'jsonwebtoken';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { generateToken, verifyRefreshToken } from '../middleware/auth.js';

// Rate limiter for sensitive auth endpoints
const limiter = new RateLimiterMemory({ keyPrefix: 'client_auth', points: 10, duration: 60 });
const rateLimit = async (req, res, next) => {
    try { await limiter.consume(req.ip); return next(); } catch (rej) { return res.status(429).json({ error: 'Too Many Requests', retryAfter: Math.round(rej.msBeforeNext / 1000) }); }
};

const router = express.Router();

// Placeholder auth routes
// These will be fully implemented when integrating with GraphQL resolvers

router.get('/status', (req, res) => {
    res.json({
        message: 'Auth service is available',
        authenticated: !!req.user,
        user: req.user ? {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        } : null
    });
});

// POST /api/auth/register
router.post('/register', rateLimit, async (req, res) => {
    try {
        const { name, email, password, phone, nin, driversLicense, referrerInfo } = req.body || {};
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!nin && !driversLicense) {
            return res.status(400).json({ error: "Either NIN or Driver's License is required" });
        }
        const existing = await models.User.findOne({ email: String(email).toLowerCase() });
        if (existing) return res.status(409).json({ error: 'User with this email already exists' });
        const user = await models.User.create({
            name,
            email: String(email).toLowerCase(),
            password,
            phone,
            verification: {
                nin: { number: nin || null, status: nin ? 'pending' : 'not_submitted' },
                driversLicense: { number: driversLicense || null, status: driversLicense ? 'pending' : 'not_submitted' }
            },
            referrerInfo
        });
        const token = generateToken(user, 'access');
        const refreshToken = generateToken(user, 'refresh');
        // Persist refresh token (rotation-ready)
        try {
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
            await models.RefreshToken.create({ user: user._id, token: refreshToken, expiresAt, ...deviceMeta });
        } catch (_) { }
        const safeUser = user.toObject();
        delete safeUser.password;
        return res.status(201).json({ token, refreshToken, user: safeUser, expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    } catch (err) {
        return res.status(500).json({ error: 'Registration failed', message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', rateLimit, async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        const user = await models.User.findOne({ email: String(email).toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        const valid = await user.comparePassword(password);
        if (!valid) {
            await user.incLoginAttempts();
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
        if (user.isLocked) return res.status(423).json({ error: 'Account locked' });
        await user.resetLoginAttempts();
        const token = generateToken(user, 'access');
        const refreshToken = generateToken(user, 'refresh');
        // Persist refresh token (rotation-ready)
        try {
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
            await models.RefreshToken.create({ user: user._id, token: refreshToken, expiresAt, ...deviceMeta });
        } catch (_) { }
        const safeUser = user.toObject();
        delete safeUser.password;
        return res.json({ token, refreshToken, user: safeUser, expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    } catch (err) {
        return res.status(500).json({ error: 'Login failed', message: err.message });
    }
});

// POST /api/auth/refresh (supports rotation with persistence, but remains backward compatible)
router.post('/refresh', rateLimit, async (req, res) => {
    try {
        const token = req.headers['x-refresh-token'] || (req.body && req.body.refreshToken);
        if (!token) return res.status(400).json({ error: 'Refresh token is required' });

        // Verify structurally
        const decoded = verifyRefreshToken(token);

        const user = await models.User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive || user.isLocked) return res.status(403).json({ error: 'User not allowed' });

        // Try persistent path first
        const stored = await models.RefreshToken.findOne({ token });
        if (stored && !stored.revoked) {
            const accessToken = generateToken(user, 'access');
            // Rotate refresh token
            const newRefresh = generateToken(user, 'refresh');
            try {
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
                await models.RefreshToken.create({ user: user._id, token: newRefresh, expiresAt, ...deviceMeta });
            } catch (_) { }
            const safeUser = user.toObject();
            delete safeUser.password;
            return res.json({ token: accessToken, refreshToken: newRefresh, user: safeUser, expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
        }

        // Backward compatible: if not found in DB, still issue new access token only
        const accessToken = generateToken(user, 'access');
        const safeUser = user.toObject();
        delete safeUser.password;
        return res.json({ token: accessToken, user: safeUser, expiresIn: process.env.JWT_EXPIRES_IN || '15m', note: 'Legacy stateless refresh accepted; rotation not applied' });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// POST /api/auth/logout - revoke presented refresh token
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers['x-refresh-token'] || (req.body && req.body.refreshToken);
        if (!token) return res.json({ success: true });
        const stored = await models.RefreshToken.findOne({ token });
        if (stored && !stored.revoked) {
            stored.revoked = true;
            stored.lastUsedAt = new Date();
            await stored.save();
        }
        return res.json({ success: true });
    } catch (_) {
        return res.json({ success: true });
    }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    return res.json(req.user);
});

// GET /api/auth/sessions - list active sessions for current user
router.get('/sessions', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const sessions = await models.RefreshToken.find({ user: req.user._id, revoked: { $ne: true } })
        .select('-token')
        .sort({ updatedAt: -1 });
    return res.json({ sessions });
});

// POST /api/auth/sessions/revoke - revoke a specific session by token id
router.post('/sessions/revoke', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    const record = await models.RefreshToken.findOne({ _id: sessionId, user: req.user._id });
    if (!record) return res.status(404).json({ error: 'Session not found' });
    if (!record.revoked) {
        record.revoked = true;
        record.lastUsedAt = new Date();
        await record.save();
    }
    return res.json({ success: true });
});

// POST /api/auth/sessions/revoke-all - revoke all sessions except current device (optional)
router.post('/sessions/revoke-all', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const exceptDeviceId = req.get('x-device-id');
    const filter = { user: req.user._id, revoked: { $ne: true } };
    if (exceptDeviceId) {
        Object.assign(filter, { deviceId: { $ne: exceptDeviceId } });
    }
    await models.RefreshToken.updateMany(filter, { $set: { revoked: true, lastUsedAt: new Date() } });
    return res.json({ success: true });
});

export default router;

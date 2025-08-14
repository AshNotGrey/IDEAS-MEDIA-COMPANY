import jwt from 'jsonwebtoken';
import { models } from '../../mongoDB/index.js';

const adminResolvers = {
    Query: {
        currentAdmin: async (_, __, { user }) => {
            if (!user || !['admin', 'manager', 'super_admin'].includes(user.role)) return null;
            return user;
        },
    },
    Mutation: {
        adminLogin: async (_, { input }, context) => {
            const admin = await models.Admin.findOne({ username: input.username.trim() });
            if (!admin) throw new Error('Invalid credentials');
            const valid = await admin.comparePassword(input.password);
            if (!valid) {
                await admin.incLoginAttempts();
                throw new Error('Invalid credentials');
            }
            if (!admin.isActive) throw new Error('Account deactivated');
            if (admin.isLocked) throw new Error('Account locked');
            if (!admin.isVerified) throw new Error('Admin not verified');
            await admin.resetLoginAttempts();
            admin.lastLogin = new Date();
            await admin.save();
            const token = jwt.sign({ adminId: admin._id, role: admin.role, type: 'access', aud: 'admin', iss: 'ideal-photography' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30m' });
            const refreshToken = jwt.sign({ adminId: admin._id, role: admin.role, type: 'refresh', aud: 'admin', iss: 'ideal-photography' }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
            const safe = admin.toObject();
            delete safe.password;
            const response = { token, refreshToken, admin: safe, expiresIn: process.env.JWT_EXPIRES_IN || '30m' };
            try { await context?.audit?.('Mutation.adminLogin', {}, { status: 'success' }); } catch (_) { }
            return response;
        },
        createAdminInvite: async (_, { input }, { user, ...context }) => {
            if (!user || !['super_admin', 'manager'].includes(user.role)) throw new Error('Admin access required');
            const crypto = await import('crypto');
            const code = crypto.randomBytes(16).toString('hex');
            const ttl = Math.max(5, input.ttlMinutes || 60);
            const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
            const invite = await models.AdminInvite.create({
                code,
                createdBy: user._id,
                role: input.role || 'admin',
                permissions: input.permissions || [],
                expiresAt
            });
            const result = { code: invite.code, role: invite.role, expiresAt: invite.expiresAt.toISOString() };
            try { await context?.audit?.('Mutation.createAdminInvite', {}, { status: 'success' }); } catch (_) { }
            return result;
        },
        registerAdmin: async (_, { input }, context) => {
            const { username, password, code, verifierUsername } = input;
            if (!username || !password) throw new Error('Username and password are required');
            const existing = await models.Admin.findOne({ username: username.trim() });
            if (existing) throw new Error('Username already taken');
            let role = 'admin';
            let permissions = [];
            let verifiedBy = null;
            let verifiedAt = null;
            let isVerified = false;
            if (code) {
                const invite = await models.AdminInvite.findOne({ code, used: false });
                if (!invite) throw new Error('Invalid invite code');
                if (invite.expiresAt < new Date()) throw new Error('Invite code expired');
                role = invite.role || role;
                permissions = invite.permissions || [];
                isVerified = true;
            } else if (verifierUsername) {
                const verifier = await models.Admin.findOne({ username: verifierUsername.trim(), isVerified: true, isActive: true });
                if (!verifier) throw new Error('Verifier not found or ineligible');
            } else {
                throw new Error('Provide an invite code or verifierUsername');
            }
            const admin = await models.Admin.create({ username: username.trim(), password, role, permissions, isVerified, verifiedBy, verifiedAt });
            if (code) {
                await models.AdminInvite.updateOne({ code }, { $set: { used: true, usedBy: admin._id, usedAt: new Date() } });
            }
            try { await context?.audit?.('Mutation.registerAdmin', {}, { status: 'success' }); } catch (_) { }
            return admin;
        },
        verifyAdmin: async (_, { username }, { user, ...context }) => {
            if (!user || !['super_admin', 'manager'].includes(user.role)) throw new Error('Admin access required');
            const admin = await models.Admin.findOne({ username: username.trim() });
            if (!admin) throw new Error('Admin not found');
            if (admin.isVerified) return admin;
            admin.isVerified = true;
            admin.verifiedBy = user._id;
            admin.verifiedAt = new Date();
            await admin.save();
            try { await context?.audit?.('Mutation.verifyAdmin', {}, { status: 'success' }); } catch (_) { }
            return admin;
        },
    },
};

export default adminResolvers;



import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { models } from '../../mongoDB/index.js';
import {
    sendMail,
    buildVerificationEmail,
    buildResetPasswordEmail,
    buildWelcomeEmail,
    buildIDVerificationStatusEmail
} from '../../utils/email.js';
import {
    sendWelcomeNotification,
    sendVerificationNotification,
    sendAdminNewUserNotification,
    sendAdminVerificationNotification,
    getActiveAdminIds,
    checkNotificationPreferences
} from '../../utils/notifications.js';
import { QueryBuilder, queryMonitor } from '../../utils/queryOptimization.js';
import { cache, CacheKeys, CacheTTL, CacheInvalidation, withCache } from '../../utils/caching.js';
import { ResponseOptimizer, DataTransformer } from '../../utils/responseOptimization.js';
import { jobQueue } from '../../utils/backgroundJobs.js';

const userResolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) return null;
            return user;
        },

        users: withCache(
            (args) => CacheKeys.userList(args),
            CacheTTL.SHORT
        )(async (_, { filter = {}, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }) => {
            const queryId = `users_${Date.now()}`;
            queryMonitor.startQuery(queryId, 'users_list', 'users');

            try {
                // Use optimized query builder
                const pipeline = QueryBuilder.users.list(filter, { page, limit, sortBy, sortOrder: sortOrder === "desc" ? -1 : 1 });
                const countPipeline = QueryBuilder.users.count(filter);

                const [users, countResult] = await Promise.all([
                    models.User.aggregate(pipeline),
                    models.User.aggregate(countPipeline)
                ]);

                const total = countResult[0]?.total || 0;
                const transformedUsers = DataTransformer.transformArray(users);

                const result = ResponseOptimizer.paginate(transformedUsers, page, limit, total);

                queryMonitor.endQuery(queryId);
                return result;
            } catch (error) {
                queryMonitor.endQuery(queryId);
                throw error;
            }
        }),

        user: async (_, { id }) => {
            return await models.User.findById(id);
        },

        userByEmail: async (_, { email }) => {
            return await models.User.findOne({ email: email.toLowerCase() });
        },

        // Admin-only analytics queries
        userStats: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            const [
                totalUsers,
                activeUsers,
                verifiedUsers,
                newUsersThisMonth,
                usersByRole
            ] = await Promise.all([
                models.User.countDocuments(),
                models.User.countDocuments({ isActive: true }),
                models.User.countDocuments({ isEmailVerified: true }),
                models.User.countDocuments({
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }),
                models.User.aggregate([
                    { $group: { _id: '$role', count: { $sum: 1 } } },
                    { $project: { role: '$_id', count: 1, _id: 0 } }
                ])
            ]);

            return {
                totalUsers,
                activeUsers,
                verifiedUsers,
                newUsersThisMonth,
                usersByRole
            };
        },

        verificationQueue: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            return await models.User.find({
                $or: [
                    { 'verification.nin.status': 'pending' },
                    { 'verification.driversLicense.status': 'pending' }
                ]
            }).sort({ 'verification.nin.submittedAt': -1, 'verification.driversLicense.submittedAt': -1 });
        },

        lockedAccounts: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            return await models.User.find({
                lockUntil: { $gt: new Date() }
            }).sort({ lockUntil: -1 });
        }
    },

    Mutation: {
        register: async (_, { input }, context) => {
            try {
                // Check if user already exists
                const existingUser = await models.User.findOne({ email: input.email.toLowerCase() });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }

                // Validate that at least one verification document is provided
                if (!input.nin && !input.driversLicense) {
                    throw new Error('Either NIN or Driver\'s License is required');
                }

                // Create user with verification data
                const userData = {
                    name: input.name,
                    email: input.email.toLowerCase(),
                    password: input.password,
                    phone: input.phone,
                    verification: {
                        nin: {
                            number: input.nin || null,
                            status: input.nin ? 'pending' : 'not_submitted'
                        },
                        driversLicense: {
                            number: input.driversLicense || null,
                            status: input.driversLicense ? 'pending' : 'not_submitted'
                        }
                    },
                    referrerInfo: input.referrerInfo
                };

                const user = await models.User.create(userData);

                // Send welcome email and notifications using background jobs
                try {
                    const preferences = await checkNotificationPreferences(user._id);

                    // Queue welcome email job
                    if (preferences.email) {
                        jobQueue.add('send-welcome-email', {
                            userId: user._id.toString(),
                            email: user.email,
                            firstName: user.name.split(' ')[0]
                        }, { priority: 10 }); // High priority for welcome emails
                    }

                    // Send email verification automatically
                    const emailToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    await models.User.findByIdAndUpdate(user._id, {
                        emailVerificationToken: emailToken,
                        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    });

                    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
                    const verifyUrl = `${baseUrl}/email-verification?token=${encodeURIComponent(emailToken)}&email=${encodeURIComponent(user.email)}`;
                    const { html, text } = buildVerificationEmail({ name: user.name, url: verifyUrl });

                    // Send verification email (high priority background job)
                    jobQueue.add('send-email-verification', {
                        to: user.email,
                        subject: 'Verify your email address - IDEAS MEDIA COMPANY',
                        html,
                        text
                    }, { priority: 9 }); // High priority for verification emails

                    // Send welcome push notification (immediate for better UX)
                    if (preferences.push) {
                        await sendWelcomeNotification(user._id, user.name);
                    }

                    // Notify admins of new user registration
                    const adminIds = await getActiveAdminIds();
                    if (adminIds.length > 0) {
                        await sendAdminNewUserNotification(adminIds, user);
                    }

                } catch (notificationError) {
                    console.error('Failed to send welcome notifications:', notificationError);
                    // Don't fail registration if notifications fail
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'access' },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
                );

                const response = {
                    token,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '3d'
                };
                try { await context?.audit?.('Mutation.register', {}, { status: 'success' }); } catch (_) { }
                return response;
            } catch (error) {
                try { await context?.audit?.('Mutation.register', {}, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        // Backward-compatible alias for older clients querying `registerUser`
        registerUser: async (_, { input }, context) => {
            return await userResolvers.Mutation.register(_, { input }, context);
        },

        login: async (_, { input }, context) => {
            try {
                const user = await models.User.findOne({ email: input.email.toLowerCase() });
                if (!user) {
                    // Increment attempts for non-existent user would leak info; skip DB write
                    throw new Error('Invalid email or password');
                }

                const isValidPassword = await user.comparePassword(input.password);
                if (!isValidPassword) {
                    await user.incLoginAttempts();
                    throw new Error('Invalid email or password');
                }

                if (!user.isActive) {
                    throw new Error('Account is deactivated');
                }

                if (user.isLocked) {
                    throw new Error('Account is locked due to too many failed attempts');
                }

                // Reset login attempts on successful login
                await user.resetLoginAttempts();

                // Update last login timestamp (on successful login only)
                user.lastLogin = new Date();
                await user.save();

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'access' },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
                );

                const response = {
                    token,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '3d'
                };
                try { await context?.audit?.('Mutation.login', {}, { status: 'success' }); } catch (_) { }
                return response;
            } catch (error) {
                try { await context?.audit?.('Mutation.login', {}, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        logout: async (_, __, context) => {
            // Stateless JWT
            try { await context?.audit?.('Mutation.logout', {}, { status: 'success' }); } catch (_) { }
            return true;
        },

        refreshToken: async (_, __, { req, ...context }) => {
            try {
                const headerToken = req.headers['x-refresh-token'];
                const bodyToken = (req.body && req.body.refreshToken) || null;
                const providedToken = headerToken || bodyToken;
                if (!providedToken) {
                    throw new Error('Refresh token is required');
                }
                const decoded = jwt.verify(providedToken, process.env.JWT_REFRESH_SECRET);
                if (decoded.aud && decoded.aud !== 'client') {
                    throw new Error('Invalid refresh token');
                }
                const user = await models.User.findById(decoded.userId).select('-password');
                if (!user || !user.isActive || user.isLocked) {
                    throw new Error('User not allowed');
                }
                const accessToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'access' },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
                );
                const response = {
                    token: accessToken,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '3d'
                };
                try { await context?.audit?.('Mutation.refreshToken', {}, { status: 'success' }); } catch (_) { }
                return response;
            } catch (error) {
                try { await context?.audit?.('Mutation.refreshToken', {}, { status: 'failure', message: 'Invalid refresh token' }); } catch (_) { }
                throw new Error('Invalid refresh token');
            }
        },

        changePassword: async (_, { currentPassword, newPassword }, { user, ...context }) => {
            if (!user) throw new Error('Authentication required');
            const dbUser = await models.User.findById(user._id);
            const isValid = await dbUser.comparePassword(currentPassword);
            if (!isValid) throw new Error('Current password is incorrect');
            dbUser.password = newPassword;
            await dbUser.save();
            try { await context?.audit?.('Mutation.changePassword', {}, { status: 'success' }); } catch (_) { }
            return true;
        },

        forgotPassword: async (_, { email }, context) => {
            try {
                const user = await models.User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    // Don't reveal if user exists or not
                    try { await context?.audit?.('Mutation.forgotPassword', {}, { status: 'success' }); } catch (_) { }
                    return true;
                }

                // Generate reset token
                const resetToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'password_reset' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                user.passwordResetToken = resetToken;
                user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
                await user.save();

                // Send email with reset link
                const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;
                const { html, text } = buildResetPasswordEmail({ name: user.name, url: resetUrl });
                try {
                    await sendMail({ to: user.email, subject: 'Reset your password', html, text });
                } catch (mailErr) {
                    console.error('Failed to send reset email:', mailErr);
                }

                try { await context?.audit?.('Mutation.forgotPassword', {}, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                throw new Error('Failed to process password reset request');
            }
        },

        resetPassword: async (_, { token, newPassword }, context) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.aud && decoded.aud !== 'client') {
                    throw new Error('Invalid or expired reset token');
                }
                const user = await models.User.findById(decoded.userId);

                if (!user || user.passwordResetToken !== token || user.passwordResetExpires < new Date()) {
                    throw new Error('Invalid or expired reset token');
                }

                user.password = newPassword;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();

                try { await context?.audit?.('Mutation.resetPassword', {}, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                throw new Error('Failed to reset password');
            }
        },

        verifyEmail: async (_, { token }, context) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.aud && decoded.aud !== 'client') {
                    throw new Error('Invalid or expired verification token');
                }
                const user = await models.User.findById(decoded.userId);

                if (!user || user.emailVerificationToken !== token || user.emailVerificationExpires < new Date()) {
                    throw new Error('Invalid or expired verification token');
                }

                user.isEmailVerified = true;
                user.emailVerificationToken = undefined;
                user.emailVerificationExpires = undefined;
                await user.save();

                try { await context?.audit?.('Mutation.verifyEmail', {}, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                throw new Error('Failed to verify email');
            }
        },

        sendEmailVerification: async (_, __, { user, ...context }) => {
            if (!user) throw new Error('Authentication required');
            try {
                const emailToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                await models.User.findByIdAndUpdate(user._id, {
                    emailVerificationToken: emailToken,
                    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
                });
                const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const verifyUrl = `${baseUrl}/email-verification?token=${encodeURIComponent(emailToken)}&email=${encodeURIComponent(user.email)}`;
                const { html, text } = buildVerificationEmail({ name: user.name, url: verifyUrl });
                try {
                    await sendMail({ to: user.email, subject: 'Verify your email', html, text });
                } catch (mailErr) {
                    console.error('Failed to send verification email:', mailErr);
                }
                try { await context?.audit?.('Mutation.sendEmailVerification', {}, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                throw new Error('Failed to send verification email');
            }
        },

        submitVerificationDocument: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            try {
                const updateData = {};
                updateData[`verification.${input.type}.number`] = input.number;
                updateData[`verification.${input.type}.status`] = 'pending';
                updateData[`verification.${input.type}.submittedAt`] = new Date();

                // Only set document if provided
                if (input.document) {
                    updateData[`verification.${input.type}.document`] = input.document;
                }

                await models.User.findByIdAndUpdate(user._id, updateData);

                // Notify admins of new verification submission
                try {
                    const adminIds = await getActiveAdminIds();
                    if (adminIds.length > 0) {
                        await sendAdminVerificationNotification(adminIds, user, input.type);
                    }
                } catch (notificationError) {
                    console.error('Failed to send admin verification notification:', notificationError);
                }

                return {
                    success: true,
                    message: 'ID verification submitted successfully'
                };
            } catch (error) {
                throw new Error('Failed to submit ID verification');
            }
        },

        // Admin user management mutations
        updateUser: async (_, { id, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedUser = await models.User.findByIdAndUpdate(id, input, { new: true });
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                // Invalidate related caches
                CacheInvalidation.user(id);

                try { await context?.audit?.('Mutation.updateUser', { userId: id }, { status: 'success' }); } catch (_) { }
                return DataTransformer.transformDocument(updatedUser);
            } catch (error) {
                try { await context?.audit?.('Mutation.updateUser', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        activateUser: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedUser = await models.User.findByIdAndUpdate(
                    id,
                    { isActive: true },
                    { new: true }
                );
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                try { await context?.audit?.('Mutation.activateUser', { userId: id }, { status: 'success' }); } catch (_) { }
                return updatedUser;
            } catch (error) {
                try { await context?.audit?.('Mutation.activateUser', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        deactivateUser: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedUser = await models.User.findByIdAndUpdate(
                    id,
                    { isActive: false },
                    { new: true }
                );
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                try { await context?.audit?.('Mutation.deactivateUser', { userId: id }, { status: 'success' }); } catch (_) { }
                return updatedUser;
            } catch (error) {
                try { await context?.audit?.('Mutation.deactivateUser', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updateUserRole: async (_, { id, role, permissions }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // Users can only have 'client' role - this is for updating user permissions within client role
                const updatedUser = await models.User.findByIdAndUpdate(
                    id,
                    { permissions }, // Only update permissions, role stays 'client'
                    { new: true }
                );
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                try { await context?.audit?.('Mutation.updateUserRole', { userId: id, permissions }, { status: 'success' }); } catch (_) { }
                return updatedUser;
            } catch (error) {
                try { await context?.audit?.('Mutation.updateUserRole', { userId: id, permissions }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        approveVerification: async (_, { userId, type }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updateData = {};
                updateData[`verification.${type}.status`] = 'verified';
                updateData[`verification.${type}.verifiedAt`] = new Date();
                updateData[`verification.${type}.rejectionReason`] = undefined;

                const updatedUser = await models.User.findByIdAndUpdate(userId, updateData, { new: true });
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                // Send verification approval email and notification
                try {
                    const preferences = await checkNotificationPreferences(userId);

                    // Send verification approval email (background job)
                    if (preferences.email) {
                        jobQueue.add('send-id-verification-status', {
                            userId: updatedUser._id.toString(),
                            email: updatedUser.email,
                            name: updatedUser.name,
                            type,
                            status: 'verified'
                        }, { priority: 8 }); // High priority for verification status
                    }

                    // Send verification approval push notification
                    if (preferences.push) {
                        await sendVerificationNotification(userId, type, 'verified');
                    }

                } catch (notificationError) {
                    console.error('Failed to send verification approval notifications:', notificationError);
                }

                try { await context?.audit?.('Mutation.approveVerification', { userId, type }, { status: 'success' }); } catch (_) { }
                return {
                    success: true,
                    message: `${type} verification approved successfully`
                };
            } catch (error) {
                try { await context?.audit?.('Mutation.approveVerification', { userId, type }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        rejectVerification: async (_, { userId, type, reason }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updateData = {};
                updateData[`verification.${type}.status`] = 'rejected';
                updateData[`verification.${type}.rejectionReason`] = reason;
                updateData[`verification.${type}.verifiedAt`] = undefined;

                const updatedUser = await models.User.findByIdAndUpdate(userId, updateData, { new: true });
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                // Send verification rejection email and notification
                try {
                    const preferences = await checkNotificationPreferences(userId);

                    // Send verification rejection email (background job)
                    if (preferences.email) {
                        jobQueue.add('send-id-verification-status', {
                            userId: updatedUser._id.toString(),
                            email: updatedUser.email,
                            name: updatedUser.name,
                            type,
                            status: 'rejected',
                            reason
                        }, { priority: 8 }); // High priority for verification status
                    }

                    // Send verification rejection push notification
                    if (preferences.push) {
                        await sendVerificationNotification(userId, type, 'rejected', reason);
                    }

                } catch (notificationError) {
                    console.error('Failed to send verification rejection notifications:', notificationError);
                }

                try { await context?.audit?.('Mutation.rejectVerification', { userId, type, reason }, { status: 'success' }); } catch (_) { }
                return {
                    success: true,
                    message: `${type} verification rejected`
                };
            } catch (error) {
                try { await context?.audit?.('Mutation.rejectVerification', { userId, type, reason }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        unlockAccount: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedUser = await models.User.findByIdAndUpdate(
                    id,
                    {
                        $unset: { lockUntil: 1, loginAttempts: 1 }
                    },
                    { new: true }
                );
                if (!updatedUser) {
                    throw new Error('User not found');
                }

                try { await context?.audit?.('Mutation.unlockAccount', { userId: id }, { status: 'success' }); } catch (_) { }
                return updatedUser;
            } catch (error) {
                try { await context?.audit?.('Mutation.unlockAccount', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        resetLoginAttempts: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const targetUser = await models.User.findById(id);
                if (!targetUser) {
                    throw new Error('User not found');
                }

                await targetUser.resetLoginAttempts();
                const updatedUser = await models.User.findById(id);

                try { await context?.audit?.('Mutation.resetLoginAttempts', { userId: id }, { status: 'success' }); } catch (_) { }
                return updatedUser;
            } catch (error) {
                try { await context?.audit?.('Mutation.resetLoginAttempts', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkUpdateUsers: async (_, { ids, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                await models.User.updateMany({ _id: { $in: ids } }, input);
                const updatedUsers = await models.User.find({ _id: { $in: ids } });

                try { await context?.audit?.('Mutation.bulkUpdateUsers', { userIds: ids }, { status: 'success' }); } catch (_) { }
                return updatedUsers;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkUpdateUsers', { userIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        deleteUser: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const deletedUser = await models.User.findByIdAndDelete(id);
                if (!deletedUser) {
                    throw new Error('User not found');
                }

                try { await context?.audit?.('Mutation.deleteUser', { userId: id }, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                try { await context?.audit?.('Mutation.deleteUser', { userId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkDeleteUsers: async (_, { ids }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                await models.User.deleteMany({ _id: { $in: ids } });

                try { await context?.audit?.('Mutation.bulkDeleteUsers', { userIds: ids }, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkDeleteUsers', { userIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        }
    }
};

export default userResolvers; 
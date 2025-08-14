import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { models } from '../../mongoDB/index.js';
import { sendMail, buildVerificationEmail, buildResetPasswordEmail } from '../../utils/email.js';

const userResolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) return null;
            return user;
        },

        users: async (_, { filter = {}, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }) => {
            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

            let query = {};

            if (filter.role) query.role = filter.role;
            if (filter.isActive !== undefined) query.isActive = filter.isActive;
            if (filter.isEmailVerified !== undefined) query.isEmailVerified = filter.isEmailVerified;
            if (filter.search) {
                query.$or = [
                    { name: { $regex: filter.search, $options: 'i' } },
                    { email: { $regex: filter.search, $options: 'i' } }
                ];
            }

            const [users, total] = await Promise.all([
                models.User.find(query).sort(sort).skip(skip).limit(limit),
                models.User.countDocuments(query)
            ]);

            return {
                users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        },

        user: async (_, { id }) => {
            return await models.User.findById(id);
        },

        userByEmail: async (_, { email }) => {
            return await models.User.findOne({ email: email.toLowerCase() });
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

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'access' },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
                );

                const response = {
                    token,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
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
                    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
                );

                const response = {
                    token,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
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
                    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, aud: 'client', iss: 'ideal-photography', type: 'refresh' },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
                );
                const response = {
                    token: accessToken,
                    refreshToken,
                    user,
                    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
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
                updateData[`verification.${input.type}.document`] = input.document;
                updateData[`verification.${input.type}.status`] = 'pending';
                updateData[`verification.${input.type}.submittedAt`] = new Date();

                await models.User.findByIdAndUpdate(user._id, updateData);

                return {
                    success: true,
                    message: 'Verification document submitted successfully'
                };
            } catch (error) {
                throw new Error('Failed to submit verification document');
            }
        }
    }
};

export default userResolvers; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { models } from '../../mongoDB/index.js';

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
        register: async (_, { input }) => {
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
                    name: `${input.firstName} ${input.lastName}`,
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
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' }
                );

                return {
                    token,
                    user,
                    expiresIn: '7d'
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        login: async (_, { input }) => {
            try {
                const user = await models.User.findOne({ email: input.email.toLowerCase() });
                if (!user) {
                    throw new Error('Invalid email or password');
                }

                const isValidPassword = await user.comparePassword(input.password);
                if (!isValidPassword) {
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

                // Update last login
                user.lastLogin = new Date();
                await user.save();

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' }
                );

                return {
                    token,
                    user,
                    expiresIn: '7d'
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        forgotPassword: async (_, { email }) => {
            try {
                const user = await models.User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    // Don't reveal if user exists or not
                    return true;
                }

                // Generate reset token
                const resetToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                user.passwordResetToken = resetToken;
                user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
                await user.save();

                // TODO: Send email with reset link

                return true;
            } catch (error) {
                throw new Error('Failed to process password reset request');
            }
        },

        resetPassword: async (_, { token, newPassword }) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await models.User.findById(decoded.userId);

                if (!user || user.passwordResetToken !== token || user.passwordResetExpires < new Date()) {
                    throw new Error('Invalid or expired reset token');
                }

                user.password = newPassword;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();

                return true;
            } catch (error) {
                throw new Error('Failed to reset password');
            }
        },

        verifyEmail: async (_, { token }) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await models.User.findById(decoded.userId);

                if (!user || user.emailVerificationToken !== token || user.emailVerificationExpires < new Date()) {
                    throw new Error('Invalid or expired verification token');
                }

                user.isEmailVerified = true;
                user.emailVerificationToken = undefined;
                user.emailVerificationExpires = undefined;
                await user.save();

                return true;
            } catch (error) {
                throw new Error('Failed to verify email');
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
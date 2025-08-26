import jwt from 'jsonwebtoken';
import { models } from '../../mongoDB/index.js';

const adminResolvers = {
    Query: {
        currentAdmin: async (_, __, { user }) => {
            if (!user || !['admin', 'manager', 'super_admin'].includes(user.role)) return null;
            return user;
        },

        dashboardStats: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // Get basic counts
                const totalUsers = await models.User.countDocuments();
                const totalBookings = await models.Booking.countDocuments();
                const totalRevenue = await models.Booking.aggregate([
                    { $match: { paymentStatus: 'paid' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]);
                const pendingReviews = await models.Review.countDocuments({
                    isPublished: false
                });
                const activeGalleries = await models.Gallery.countDocuments({
                    isPublished: true
                });

                // Get recent bookings (last 5)
                const recentBookings = await models.Booking.find()
                    .populate('client', 'name email')
                    .populate('service', 'name')
                    .sort({ createdAt: -1 })
                    .limit(5);

                // Get monthly revenue data
                const monthlyRevenue = await models.Booking.aggregate([
                    { $match: { paymentStatus: 'paid' } },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            revenue: { $sum: '$totalAmount' },
                            bookings: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } },
                    { $limit: 12 }
                ]);

                // Get popular services
                const popularServices = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: '$service',
                            bookings: { $sum: 1 },
                            revenue: { $sum: '$totalAmount' }
                        }
                    },
                    { $sort: { bookings: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: 'services',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'serviceInfo'
                        }
                    }
                ]);

                return {
                    totalUsers,
                    totalBookings,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    pendingReviews,
                    activeGalleries,
                    recentBookings,
                    monthlyRevenue: monthlyRevenue.map(month => ({
                        month: new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long' }),
                        revenue: month.revenue,
                        bookings: month.bookings
                    })),
                    popularServices
                };
            } catch (error) {
                throw new Error('Failed to fetch dashboard stats');
            }
        },

        // Advanced Analytics Resolvers
        getRevenueAnalytics: async (_, { startDate, endDate, period = 'daily' }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const end = endDate ? new Date(endDate) : new Date();

                // Group by period (daily, weekly, monthly)
                let groupBy;
                switch (period) {
                    case 'weekly':
                        groupBy = {
                            year: { $year: '$createdAt' },
                            week: { $week: '$createdAt' }
                        };
                        break;
                    case 'monthly':
                        groupBy = {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        };
                        break;
                    default: // daily
                        groupBy = {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        };
                }

                const revenueData = await models.Booking.aggregate([
                    {
                        $match: {
                            paymentStatus: 'paid',
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: groupBy,
                            revenue: { $sum: '$totalAmount' },
                            bookings: { $sum: 1 },
                            avgOrderValue: { $avg: '$totalAmount' }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
                ]);

                // Calculate growth rates
                const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
                const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);

                return {
                    period,
                    data: revenueData,
                    totalRevenue,
                    totalBookings,
                    avgOrderValue: totalRevenue / (totalBookings || 1),
                    growthRate: 0 // Calculate based on comparison periods
                };
            } catch (error) {
                throw new Error('Failed to fetch revenue analytics');
            }
        },

        getBookingAnalytics: async (_, { period = 'monthly', limit = 12 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // Booking trends over time
                const bookingTrends = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            total: { $sum: 1 },
                            confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
                            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                            revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } }
                        }
                    },
                    { $sort: { '_id.year': -1, '_id.month': -1 } },
                    { $limit: limit }
                ]);

                // Booking status distribution
                const statusDistribution = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                // Peak booking hours
                const peakHours = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: { $hour: '$createdAt' },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } }
                ]);

                // Service popularity
                const servicePopularity = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: '$service',
                            bookings: { $sum: 1 },
                            revenue: { $sum: '$totalAmount' }
                        }
                    },
                    { $sort: { bookings: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'services',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'serviceInfo'
                        }
                    }
                ]);

                return {
                    bookingTrends: bookingTrends.reverse(),
                    statusDistribution,
                    peakHours,
                    servicePopularity
                };
            } catch (error) {
                throw new Error('Failed to fetch booking analytics');
            }
        },

        getUserAnalytics: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // User growth over time
                const userGrowth = await models.User.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            newUsers: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': -1, '_id.month': -1 } },
                    { $limit: 12 }
                ]);

                // User verification status
                const verificationStats = await models.User.aggregate([
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            emailVerified: { $sum: { $cond: ['$emailVerified', 1, 0] } },
                            idVerified: { $sum: { $cond: [{ $eq: ['$verification.idDocument.status', 'verified'] }, 1, 0] } },
                            active: { $sum: { $cond: ['$active', 1, 0] } }
                        }
                    }
                ]);

                // User activity patterns
                const activityPatterns = await models.Booking.aggregate([
                    {
                        $group: {
                            _id: '$client',
                            bookingCount: { $sum: 1 },
                            totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
                            lastBooking: { $max: '$createdAt' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgBookingsPerUser: { $avg: '$bookingCount' },
                            avgSpentPerUser: { $avg: '$totalSpent' },
                            totalActiveUsers: { $sum: 1 }
                        }
                    }
                ]);

                // Geographic distribution (if location data available)
                const geographicData = await models.User.aggregate([
                    { $match: { 'location.country': { $exists: true } } },
                    {
                        $group: {
                            _id: '$location.country',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]);

                return {
                    userGrowth: userGrowth.reverse(),
                    verificationStats: verificationStats[0] || {
                        total: 0,
                        emailVerified: 0,
                        idVerified: 0,
                        active: 0
                    },
                    activityPatterns: activityPatterns[0] || {
                        avgBookingsPerUser: 0,
                        avgSpentPerUser: 0,
                        totalActiveUsers: 0
                    },
                    geographicData
                };
            } catch (error) {
                throw new Error('Failed to fetch user analytics');
            }
        },

        getServiceAnalytics: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // Service performance metrics
                const servicePerformance = await models.Service.aggregate([
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: '_id',
                            foreignField: 'service',
                            as: 'bookings'
                        }
                    },
                    {
                        $addFields: {
                            totalBookings: { $size: '$bookings' },
                            totalRevenue: {
                                $sum: {
                                    $map: {
                                        input: { $filter: { input: '$bookings', cond: { $eq: ['$$this.paymentStatus', 'paid'] } } },
                                        as: 'booking',
                                        in: '$$booking.totalAmount'
                                    }
                                }
                            },
                            avgRating: { $avg: '$bookings.rating' }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            category: 1,
                            basePrice: 1,
                            totalBookings: 1,
                            totalRevenue: 1,
                            avgRating: 1,
                            isActive: 1,
                            featured: 1
                        }
                    },
                    { $sort: { totalRevenue: -1 } }
                ]);

                // Category performance
                const categoryPerformance = await models.Service.aggregate([
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: '_id',
                            foreignField: 'service',
                            as: 'bookings'
                        }
                    },
                    {
                        $group: {
                            _id: '$category',
                            totalServices: { $sum: 1 },
                            activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
                            totalBookings: { $sum: { $size: '$bookings' } },
                            totalRevenue: {
                                $sum: {
                                    $sum: {
                                        $map: {
                                            input: { $filter: { input: '$bookings', cond: { $eq: ['$$this.paymentStatus', 'paid'] } } },
                                            as: 'booking',
                                            in: '$$booking.totalAmount'
                                        }
                                    }
                                }
                            },
                            avgPrice: { $avg: '$basePrice' }
                        }
                    },
                    { $sort: { totalRevenue: -1 } }
                ]);

                // Pricing analysis
                const pricingAnalysis = await models.Service.aggregate([
                    {
                        $group: {
                            _id: '$category',
                            minPrice: { $min: '$basePrice' },
                            maxPrice: { $max: '$basePrice' },
                            avgPrice: { $avg: '$basePrice' },
                            count: { $sum: 1 }
                        }
                    }
                ]);

                return {
                    servicePerformance,
                    categoryPerformance,
                    pricingAnalysis
                };
            } catch (error) {
                throw new Error('Failed to fetch service analytics');
            }
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



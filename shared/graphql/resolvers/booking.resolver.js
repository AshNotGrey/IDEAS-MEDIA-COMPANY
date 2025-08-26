import { models } from '../../mongoDB/index.js';
import { sendMail, buildBookingConfirmationEmail, buildPaymentConfirmationEmail } from '../../utils/email.js';
import {
    sendBookingNotification,
    sendPaymentNotification,
    sendAdminNewBookingNotification,
    getActiveAdminIds,
    checkNotificationPreferences
} from '../../utils/notifications.js';

const bookingResolvers = {
    Query: {
        bookings: async (_, { filter = {}, page = 1, limit = 20, sortBy = "date", sortOrder = "desc" }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

            let query = {};

            // Apply filters
            if (filter.status) query.status = filter.status;
            if (filter.paid !== undefined) query.paid = filter.paid;
            if (filter.clientId) query.client = filter.clientId;
            if (filter.productId) query.product = filter.productId;
            if (filter.dateFrom) query.date = { ...query.date, $gte: new Date(filter.dateFrom) };
            if (filter.dateTo) query.date = { ...query.date, $lte: new Date(filter.dateTo) };
            if (filter.search) {
                // Search in client name or email
                const users = await models.User.find({
                    $or: [
                        { name: { $regex: filter.search, $options: 'i' } },
                        { email: { $regex: filter.search, $options: 'i' } }
                    ]
                }).select('_id');
                const userIds = users.map(u => u._id);

                if (userIds.length > 0) {
                    query.client = { $in: userIds };
                } else {
                    // No matching users, return empty result
                    return {
                        bookings: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    };
                }
            }

            const [bookings, total] = await Promise.all([
                models.Booking.find(query)
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                models.Booking.countDocuments(query)
            ]);

            return {
                bookings,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        },

        booking: async (_, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            return await models.Booking.findById(id)
                .populate('client', 'name email phone avatar')
                .populate('product', 'name category price description');
        },

        bookingStats: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

            const [
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                cancelledBookings,
                thisMonthBookings,
                thisWeekBookings,
                unpaidBookings,
                totalRevenue,
                thisMonthRevenue
            ] = await Promise.all([
                models.Booking.countDocuments(),
                models.Booking.countDocuments({ status: 'pending' }),
                models.Booking.countDocuments({ status: 'confirmed' }),
                models.Booking.countDocuments({ status: 'completed' }),
                models.Booking.countDocuments({ status: 'cancelled' }),
                models.Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
                models.Booking.countDocuments({ createdAt: { $gte: startOfWeek } }),
                models.Booking.countDocuments({ paid: false, status: { $in: ['confirmed', 'completed'] } }),
                models.Booking.aggregate([
                    { $match: { status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]).then(result => result[0]?.total || 0),
                models.Booking.aggregate([
                    { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]).then(result => result[0]?.total || 0)
            ]);

            return {
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                cancelledBookings,
                thisMonthBookings,
                thisWeekBookings,
                unpaidBookings,
                totalRevenue,
                thisMonthRevenue
            };
        },

        upcomingBookings: async (_, { limit = 10 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return await models.Booking.find({
                date: { $gte: today },
                status: { $in: ['confirmed', 'pending'] }
            })
                .populate('client', 'name email phone')
                .populate('product', 'name category')
                .sort({ date: 1, time: 1 })
                .limit(limit);
        },

        todaysBookings: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            return await models.Booking.find({
                date: { $gte: startOfDay, $lte: endOfDay }
            })
                .populate('client', 'name email phone')
                .populate('product', 'name category')
                .sort({ time: 1 });
        }
    },

    Mutation: {
        createBooking: async (_, { input }, { user, ...context }) => {
            try {
                const booking = await models.Booking.create({
                    ...input,
                    client: input.clientId,
                    product: input.productId
                });

                const populatedBooking = await models.Booking.findById(booking._id)
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price');

                // Send booking confirmation email and notifications
                try {
                    const preferences = await checkNotificationPreferences(populatedBooking.client._id);

                    // Send booking confirmation email
                    if (preferences.email) {
                        const { html, text } = buildBookingConfirmationEmail({
                            name: populatedBooking.client.name,
                            booking: populatedBooking,
                            product: populatedBooking.product,
                            client: populatedBooking.client
                        });
                        await sendMail({
                            to: populatedBooking.client.email,
                            subject: '🎉 Booking Confirmed - IDEAS MEDIA COMPANY',
                            html,
                            text
                        });
                    }

                    // Send booking confirmation push notification
                    if (preferences.push) {
                        await sendBookingNotification(
                            populatedBooking.client._id,
                            populatedBooking,
                            populatedBooking.product
                        );
                    }

                    // Notify admins of new booking
                    const adminIds = await getActiveAdminIds();
                    if (adminIds.length > 0) {
                        await sendAdminNewBookingNotification(
                            adminIds,
                            populatedBooking,
                            populatedBooking.client,
                            populatedBooking.product
                        );
                    }

                } catch (notificationError) {
                    console.error('Failed to send booking confirmation notifications:', notificationError);
                }

                try { await context?.audit?.('Mutation.createBooking', { bookingId: booking._id }, { status: 'success' }); } catch (_) { }
                return populatedBooking;
            } catch (error) {
                try { await context?.audit?.('Mutation.createBooking', {}, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updateBooking: async (_, { id, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedBooking = await models.Booking.findByIdAndUpdate(
                    id,
                    input,
                    { new: true }
                )
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price');

                if (!updatedBooking) {
                    throw new Error('Booking not found');
                }

                try { await context?.audit?.('Mutation.updateBooking', { bookingId: id }, { status: 'success' }); } catch (_) { }
                return updatedBooking;
            } catch (error) {
                try { await context?.audit?.('Mutation.updateBooking', { bookingId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updateBookingStatus: async (_, { id, status }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updatedBooking = await models.Booking.findByIdAndUpdate(
                    id,
                    { status },
                    { new: true }
                )
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price');

                if (!updatedBooking) {
                    throw new Error('Booking not found');
                }

                try { await context?.audit?.('Mutation.updateBookingStatus', { bookingId: id, status }, { status: 'success' }); } catch (_) { }
                return updatedBooking;
            } catch (error) {
                try { await context?.audit?.('Mutation.updateBookingStatus', { bookingId: id, status }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updatePaymentStatus: async (_, { id, paid, paymentMethod }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const updateData = { paid };
                if (paymentMethod) {
                    updateData.paymentMethod = paymentMethod;
                }

                const updatedBooking = await models.Booking.findByIdAndUpdate(
                    id,
                    updateData,
                    { new: true }
                )
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price');

                if (!updatedBooking) {
                    throw new Error('Booking not found');
                }

                // Send payment confirmation email and notification if payment was marked as completed
                if (paid) {
                    try {
                        const preferences = await checkNotificationPreferences(updatedBooking.client._id);

                        // Send payment confirmation email
                        if (preferences.email) {
                            const { html, text } = buildPaymentConfirmationEmail({
                                name: updatedBooking.client.name,
                                booking: updatedBooking,
                                paymentMethod,
                                transactionId: updatedBooking._id.toString() // Use booking ID as transaction reference
                            });
                            await sendMail({
                                to: updatedBooking.client.email,
                                subject: '💳 Payment Confirmed - IDEAS MEDIA COMPANY',
                                html,
                                text
                            });
                        }

                        // Send payment confirmation push notification
                        if (preferences.push) {
                            await sendPaymentNotification(
                                updatedBooking.client._id,
                                updatedBooking.totalAmount,
                                updatedBooking._id
                            );
                        }

                    } catch (notificationError) {
                        console.error('Failed to send payment confirmation notifications:', notificationError);
                    }
                }

                try { await context?.audit?.('Mutation.updatePaymentStatus', { bookingId: id, paid }, { status: 'success' }); } catch (_) { }
                return updatedBooking;
            } catch (error) {
                try { await context?.audit?.('Mutation.updatePaymentStatus', { bookingId: id, paid }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        assignBooking: async (_, { id, adminId }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                // Verify admin exists
                const admin = await models.Admin.findById(adminId);
                if (!admin) {
                    throw new Error('Invalid admin user');
                }

                const updatedBooking = await models.Booking.findByIdAndUpdate(
                    id,
                    { assignedTo: adminId },
                    { new: true }
                )
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price')
                    .populate('assignedTo', 'username role');

                if (!updatedBooking) {
                    throw new Error('Booking not found');
                }

                try { await context?.audit?.('Mutation.assignBooking', { bookingId: id, adminId }, { status: 'success' }); } catch (_) { }
                return updatedBooking;
            } catch (error) {
                try { await context?.audit?.('Mutation.assignBooking', { bookingId: id, adminId }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        deleteBooking: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const deletedBooking = await models.Booking.findByIdAndDelete(id);
                if (!deletedBooking) {
                    throw new Error('Booking not found');
                }

                try { await context?.audit?.('Mutation.deleteBooking', { bookingId: id }, { status: 'success' }); } catch (_) { }
                return true;
            } catch (error) {
                try { await context?.audit?.('Mutation.deleteBooking', { bookingId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkUpdateBookings: async (_, { ids, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                await models.Booking.updateMany({ _id: { $in: ids } }, input);
                const updatedBookings = await models.Booking.find({ _id: { $in: ids } })
                    .populate('client', 'name email phone')
                    .populate('product', 'name category price');

                try { await context?.audit?.('Mutation.bulkUpdateBookings', { bookingIds: ids }, { status: 'success' }); } catch (_) { }
                return updatedBookings;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkUpdateBookings', { bookingIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        }
    }
};

export default bookingResolvers; 
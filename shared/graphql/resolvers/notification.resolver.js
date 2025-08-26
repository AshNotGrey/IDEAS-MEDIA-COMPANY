import { models } from '../../mongoDB/index.js';
import { sendMail } from '../../utils/email.js';
import { jobQueue } from '../../utils/backgroundJobs.js';

const notificationResolvers = {
    Query: {
        // Get user notifications with pagination
        notifications: async (_, { filter = {}, page = 1, limit = 20 }, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const skip = (page - 1) * limit;

                // Build query for user notifications
                const query = {
                    $or: [
                        { 'recipients.users': user._id },
                        { 'recipients.broadcast': true },
                        { 'recipients.roles': user.role }
                    ],
                    'channels.inApp': true,
                    status: 'sent'
                };

                // Apply filters
                if (filter.type) query.type = filter.type;
                if (filter.category) query.category = filter.category;
                if (filter.unreadOnly) {
                    // Add read status logic here when implementing read tracking
                }

                const [notifications, total] = await Promise.all([
                    models.Notification.find(query)
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .populate('createdBy', 'name email'),
                    models.Notification.countDocuments(query)
                ]);

                return {
                    items: notifications,
                    totalItems: total,
                    currentPage: page,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPreviousPage: page > 1
                };
            } catch (error) {
                throw new Error(`Failed to fetch notifications: ${error.message}`);
            }
        },

        // Get notification by ID
        notification: async (_, { id }, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const notification = await models.Notification.findById(id)
                    .populate('createdBy', 'name email');

                if (!notification) {
                    throw new Error('Notification not found');
                }

                // Check if user has access to this notification
                const hasAccess =
                    notification.recipients.users.includes(user._id) ||
                    notification.recipients.broadcast ||
                    notification.recipients.roles.includes(user.role);

                if (!hasAccess) {
                    throw new Error('Access denied');
                }

                return notification;
            } catch (error) {
                throw new Error(`Failed to fetch notification: ${error.message}`);
            }
        },

        // Get unread notification count
        unreadNotificationCount: async (_, __, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const count = await models.Notification.countDocuments({
                    $or: [
                        { 'recipients.users': user._id },
                        { 'recipients.broadcast': true },
                        { 'recipients.roles': user.role }
                    ],
                    'channels.inApp': true,
                    status: 'sent',
                    // Add read status logic here when implementing read tracking
                });

                return count;
            } catch (error) {
                throw new Error(`Failed to get unread count: ${error.message}`);
            }
        }
    },

    Mutation: {
        // Mark notification as read
        markNotificationAsRead: async (_, { id }, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const notification = await models.Notification.findById(id);
                if (!notification) {
                    throw new Error('Notification not found');
                }

                // Check access
                const hasAccess =
                    notification.recipients.users.includes(user._id) ||
                    notification.recipients.broadcast ||
                    notification.recipients.roles.includes(user.role);

                if (!hasAccess) {
                    throw new Error('Access denied');
                }

                // Record the read action (you might want to create a separate model for read status)
                await notification.recordOpen('inApp');

                return { success: true, message: 'Notification marked as read' };
            } catch (error) {
                throw new Error(`Failed to mark as read: ${error.message}`);
            }
        },

        // Mark all notifications as read
        markAllNotificationsAsRead: async (_, __, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                await models.Notification.updateMany({
                    $or: [
                        { 'recipients.users': user._id },
                        { 'recipients.broadcast': true },
                        { 'recipients.roles': user.role }
                    ],
                    'channels.inApp': true,
                    status: 'sent'
                }, {
                    $set: { 'deliveryStatus.inApp.opened': true, 'deliveryStatus.inApp.openedAt': new Date() }
                });

                return { success: true, message: 'All notifications marked as read' };
            } catch (error) {
                throw new Error(`Failed to mark all as read: ${error.message}`);
            }
        },

        // Delete notification (soft delete)
        deleteNotification: async (_, { id }, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const notification = await models.Notification.findById(id);
                if (!notification) {
                    throw new Error('Notification not found');
                }

                // Only allow deletion for the user's own notifications
                const hasAccess = notification.recipients.users.includes(user._id);
                if (!hasAccess) {
                    throw new Error('Access denied');
                }

                // Remove user from recipients instead of deleting the notification
                await models.Notification.findByIdAndUpdate(id, {
                    $pull: { 'recipients.users': user._id }
                });

                return { success: true, message: 'Notification deleted' };
            } catch (error) {
                throw new Error(`Failed to delete notification: ${error.message}`);
            }
        },

        // Create notification (admin only)
        createNotification: async (_, { input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }

            try {
                const notificationData = {
                    ...input,
                    createdBy: user._id,
                    status: input.sendImmediately ? 'sent' : 'draft'
                };

                const notification = await models.Notification.create(notificationData);

                // If sending immediately, queue the delivery
                if (input.sendImmediately) {
                    jobQueue.add('deliver-notification', {
                        notificationId: notification._id.toString()
                    }, { priority: 7 });
                }

                return notification;
            } catch (error) {
                throw new Error(`Failed to create notification: ${error.message}`);
            }
        },

        // Update user notification preferences
        updateNotificationPreferences: async (_, { input }, { user }) => {
            if (!user) throw new Error('Authentication required');

            try {
                const updatedUser = await models.User.findByIdAndUpdate(
                    user._id,
                    { 'preferences.notifications': input },
                    { new: true }
                );

                return updatedUser.preferences.notifications;
            } catch (error) {
                throw new Error(`Failed to update preferences: ${error.message}`);
            }
        }
    }
};

export default notificationResolvers; 
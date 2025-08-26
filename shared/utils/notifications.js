import webpush from 'web-push';
import { models } from '../mongoDB/index.js';

// Configure web-push if VAPID keys are available
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@ideasmediacompany.com';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * Send push notification to specific user
 */
export async function sendNotificationToUser(userId, notification) {
    try {
        if (!vapidPublicKey || !vapidPrivateKey) {
            console.warn('VAPID keys not configured, skipping push notification');
            return { success: false, error: 'VAPID not configured' };
        }

        // Get user's active push subscriptions
        const subscriptions = await models.PushSubscription.find({
            user: userId,
            isActive: true
        });

        if (subscriptions.length === 0) {
            return { success: false, error: 'No active subscriptions found' };
        }

        const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icons/idealphotography-logo-192x192.png',
            badge: notification.badge || '/icons/idealphotography-logo-96x96.png',
            url: notification.url || '/',
            data: notification.data || {},
            actions: notification.actions || [],
            tag: notification.tag || 'default',
            timestamp: Date.now()
        });

        const results = [];

        for (const subscription of subscriptions) {
            try {
                const result = await webpush.sendNotification(subscription.subscription, payload);
                results.push({
                    endpoint: subscription.endpoint,
                    status: result.statusCode,
                    success: true
                });

                // Update last sent timestamp
                await models.PushSubscription.findByIdAndUpdate(subscription._id, {
                    lastSentAt: new Date()
                });

            } catch (error) {
                console.error('Failed to send push notification:', error);
                results.push({
                    endpoint: subscription.endpoint,
                    error: error.message,
                    success: false
                });

                // If subscription is invalid (410, 404), mark as inactive
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await models.PushSubscription.findByIdAndUpdate(subscription._id, {
                        isActive: false
                    });
                }
            }
        }

        const successCount = results.filter(r => r.success).length;
        return {
            success: successCount > 0,
            results,
            successCount,
            totalCount: subscriptions.length
        };

    } catch (error) {
        console.error('Error sending notification to user:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send push notification to multiple users
 */
export async function sendNotificationToUsers(userIds, notification) {
    const results = [];

    for (const userId of userIds) {
        const result = await sendNotificationToUser(userId, notification);
        results.push({ userId, ...result });
    }

    return results;
}

/**
 * Send notification for welcome message
 */
export async function sendWelcomeNotification(userId, userName) {
    return await sendNotificationToUser(userId, {
        title: '🎉 Welcome to IDEAS MEDIA COMPANY!',
        body: `Hi ${userName}! Thanks for joining us. Start exploring our services!`,
        url: '/dashboard',
        tag: 'welcome',
        data: { type: 'welcome', userId }
    });
}

/**
 * Send notification for booking confirmation
 */
export async function sendBookingNotification(userId, booking, product) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    return await sendNotificationToUser(userId, {
        title: '📅 Booking Confirmed',
        body: `Your ${product?.name || 'session'} on ${bookingDate} at ${booking.time} is confirmed!`,
        url: `/bookings/${booking._id}`,
        tag: 'booking',
        data: {
            type: 'booking_confirmed',
            bookingId: booking._id,
            date: booking.date,
            time: booking.time
        }
    });
}

/**
 * Send notification for booking reminder
 */
export async function sendBookingReminderNotification(userId, booking, product, reminderType = '24h') {
    const reminderText = reminderType === '24h' ? 'tomorrow' : 'soon';

    return await sendNotificationToUser(userId, {
        title: '⏰ Session Reminder',
        body: `Don't forget your ${product?.name || 'session'} ${reminderText} at ${booking.time}!`,
        url: `/bookings/${booking._id}`,
        tag: 'reminder',
        data: {
            type: 'booking_reminder',
            bookingId: booking._id,
            reminderType,
            date: booking.date,
            time: booking.time
        }
    });
}

/**
 * Send notification for payment confirmation
 */
export async function sendPaymentNotification(userId, amount, bookingId = null) {
    return await sendNotificationToUser(userId, {
        title: '💳 Payment Confirmed',
        body: `Your payment of ₦${amount?.toLocaleString()} has been successfully processed!`,
        url: bookingId ? `/bookings/${bookingId}` : '/payments',
        tag: 'payment',
        data: {
            type: 'payment_confirmed',
            amount,
            bookingId,
            timestamp: Date.now()
        }
    });
}

/**
 * Send notification for ID verification status
 */
export async function sendVerificationNotification(userId, type, status, reason = null) {
    const documentType = type === 'nin' ? 'NIN' : 'Driver\'s License';

    let title, body, url;
    if (status === 'verified') {
        title = '✅ Verification Approved';
        body = `Your ${documentType} has been approved! You now have full access.`;
        url = '/profile';
    } else if (status === 'rejected') {
        title = '❌ Verification Update';
        body = `Your ${documentType} verification needs attention. Check details.`;
        url = '/verification';
    }

    return await sendNotificationToUser(userId, {
        title,
        body,
        url,
        tag: 'verification',
        data: {
            type: 'id_verification',
            documentType: type,
            status,
            reason
        }
    });
}

/**
 * Send admin notification for new user registration
 */
export async function sendAdminNewUserNotification(adminIds, newUser) {
    const notification = {
        title: '👤 New User Registration',
        body: `${newUser.name} just registered and needs verification!`,
        url: `/users/${newUser._id}`,
        tag: 'admin_new_user',
        data: {
            type: 'new_user_registration',
            userId: newUser._id,
            userName: newUser.name,
            userEmail: newUser.email
        }
    };

    return await sendNotificationToUsers(adminIds, notification);
}

/**
 * Send admin notification for new booking
 */
export async function sendAdminNewBookingNotification(adminIds, booking, client, product) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const notification = {
        title: '📅 New Booking',
        body: `${client.name} booked ${product?.name || 'a session'} for ${bookingDate}!`,
        url: `/bookings/${booking._id}`,
        tag: 'admin_new_booking',
        data: {
            type: 'new_booking',
            bookingId: booking._id,
            clientId: client._id,
            productId: product?._id,
            date: booking.date
        }
    };

    return await sendNotificationToUsers(adminIds, notification);
}

/**
 * Send admin notification for verification submission
 */
export async function sendAdminVerificationNotification(adminIds, user, type) {
    const documentType = type === 'nin' ? 'NIN' : 'Driver\'s License';

    const notification = {
        title: '🔍 Verification Needed',
        body: `${user.name} submitted ${documentType} for verification`,
        url: `/users/${user._id}/verification`,
        tag: 'admin_verification',
        data: {
            type: 'verification_submission',
            userId: user._id,
            documentType: type,
            userName: user.name
        }
    };

    return await sendNotificationToUsers(adminIds, notification);
}

/**
 * Check user notification preferences
 */
export async function checkNotificationPreferences(userId) {
    try {
        const user = await models.User.findById(userId).select('preferences');
        return {
            email: user?.preferences?.notifications?.email ?? true,
            sms: user?.preferences?.notifications?.sms ?? false,
            push: user?.preferences?.notifications?.push ?? true
        };
    } catch (error) {
        console.error('Error checking notification preferences:', error);
        return { email: true, sms: false, push: true }; // Default preferences
    }
}

/**
 * Get active admin user IDs for notifications
 */
export async function getActiveAdminIds() {
    try {
        const admins = await models.Admin.find({
            isActive: true,
            isVerified: true
        }).select('_id');
        return admins.map(admin => admin._id);
    } catch (error) {
        console.error('Error getting active admin IDs:', error);
        return [];
    }
}

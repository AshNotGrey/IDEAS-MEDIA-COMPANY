import { useMemo } from "react";
import { useNotifications } from "../utils/useNotifications";

/**
 * Custom hook for calculating notification totals and statistics
 * 
 * Provides computed values for notifications, counts, and useful statistics
 * that can be used across different components.
 *
 * @returns {Object} Notification totals and statistics
 *   @property {number} unreadCount - Number of unread notifications
 *   @property {number} totalCount - Total number of notifications
 *   @property {boolean} hasUnread - Whether there are unread notifications
 *   @property {boolean} hasNotifications - Whether there are any notifications
 *   @property {Array} notificationTypes - Array of unique notification types
 *   @property {Object} typeBreakdown - Breakdown of notifications by type
 *   @property {Object} categoryBreakdown - Breakdown of notifications by category
 *   @property {Object} priorityBreakdown - Breakdown of notifications by priority
 */
export default function useNotificationTotals() {
    const { notifications, unreadCount, totalCount } = useNotifications();

    const notificationStats = useMemo(() => {
        // Check if there are unread notifications
        const hasUnread = unreadCount > 0;
        const hasNotifications = totalCount > 0;

        // Get unique notification types
        const notificationTypes = [...new Set(notifications.map(n => n.type))];

        // Create type breakdown
        const typeBreakdown = notifications.reduce((acc, notification) => {
            const type = notification.type || 'unknown';
            if (!acc[type]) {
                acc[type] = {
                    count: 0,
                    unreadCount: 0,
                    notifications: []
                };
            }
            acc[type].count += 1;
            acc[type].unreadCount += notification.read ? 0 : 1;
            acc[type].notifications.push(notification);
            return acc;
        }, {});

        // Create category breakdown
        const categoryBreakdown = notifications.reduce((acc, notification) => {
            const category = notification.category || 'unknown';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    unreadCount: 0,
                    notifications: []
                };
            }
            acc[category].count += 1;
            acc[category].unreadCount += notification.read ? 0 : 1;
            acc[category].notifications.push(notification);
            return acc;
        }, {});

        // Create priority breakdown
        const priorityBreakdown = notifications.reduce((acc, notification) => {
            const priority = notification.priority || 'normal';
            if (!acc[priority]) {
                acc[priority] = {
                    count: 0,
                    unreadCount: 0,
                    notifications: []
                };
            }
            acc[priority].count += 1;
            acc[priority].unreadCount += notification.read ? 0 : 1;
            acc[priority].notifications.push(notification);
            return acc;
        }, {});

        return {
            unreadCount,
            totalCount,
            hasUnread,
            hasNotifications,
            notificationTypes,
            typeBreakdown,
            categoryBreakdown,
            priorityBreakdown
        };
    }, [notifications, unreadCount, totalCount]);

    return notificationStats;
} 
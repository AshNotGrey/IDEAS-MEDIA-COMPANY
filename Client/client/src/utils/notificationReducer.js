// Initial notification state
export const initialNotificationState = {
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    loading: false,
    error: null,
    lastFetched: null,
    settings: {
        inApp: true,
        email: true,
        sms: false,
        push: false,
        sound: true,
        autoDismiss: true,
        dismissAfter: 5000
    }
};

// Notification reducer for state management
export const notificationReducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload
            };

        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                loading: false
            };

        case "SET_NOTIFICATIONS": {
            const notifications = action.payload;
            const unreadCount = notifications.filter(n => !n.read).length;
            return {
                ...state,
                notifications,
                unreadCount,
                totalCount: notifications.length,
                loading: false,
                error: null,
                lastFetched: new Date().toISOString()
            };
        }

        case "ADD_NOTIFICATION": {
            const newNotification = action.payload;
            const updatedNotifications = [newNotification, ...state.notifications];
            const newUnreadCount = state.unreadCount + (newNotification.read ? 0 : 1);
            return {
                ...state,
                notifications: updatedNotifications,
                unreadCount: newUnreadCount,
                totalCount: updatedNotifications.length
            };
        }

        case "MARK_AS_READ": {
            const { notificationId } = action.payload;
            const markedNotifications = state.notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true, readAt: new Date().toISOString() }
                    : notification
            );
            const markedUnreadCount = Math.max(0, state.unreadCount - 1);
            return {
                ...state,
                notifications: markedNotifications,
                unreadCount: markedUnreadCount
            };
        }

        case "MARK_ALL_AS_READ": {
            const allReadNotifications = state.notifications.map(notification =>
                !notification.read
                    ? { ...notification, read: true, readAt: new Date().toISOString() }
                    : notification
            );
            return {
                ...state,
                notifications: allReadNotifications,
                unreadCount: 0
            };
        }

        case "REMOVE_NOTIFICATION": {
            const { id } = action.payload;
            const filteredNotifications = state.notifications.filter(n => n.id !== id);
            const removedUnreadCount = filteredNotifications.filter(n => !n.read).length;
            return {
                ...state,
                notifications: filteredNotifications,
                unreadCount: removedUnreadCount,
                totalCount: filteredNotifications.length
            };
        }

        case "CLEAR_NOTIFICATIONS":
            return {
                ...state,
                notifications: [],
                unreadCount: 0,
                totalCount: 0
            };

        case "UPDATE_SETTINGS":
            return {
                ...state,
                settings: { ...state.settings, ...action.payload }
            };

        case "SET_LAST_FETCHED":
            return {
                ...state,
                lastFetched: action.payload
            };

        default:
            return state;
    }
}; 
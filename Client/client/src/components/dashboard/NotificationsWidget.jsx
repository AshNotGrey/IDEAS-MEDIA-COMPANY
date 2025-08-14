import React from "react";
import { Bell, Check, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../utils/useNotifications";
import useNotificationTotals from "../../hooks/useNotificationTotals";
import Button from "../Button";

/**
 * NotificationsWidget Component
 *
 * Displays recent notifications with quick actions
 */
const NotificationsWidget = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const { unreadCount } = useNotificationTotals();

  // Get the most recent 3 notifications
  const recentNotifications = notifications?.slice(0, 3) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return "📅";
      case "order":
        return "📦";
      case "payment":
        return "💳";
      case "promotion":
        return "🎉";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50/50 dark:bg-red-900/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10";
      case "low":
        return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10";
      default:
        return "border-l-gray-300 bg-gray-50/50 dark:bg-gray-800/50";
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleRemove = (notificationId) => {
    removeNotification(notificationId);
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg relative'>
            <Bell className='w-5 h-5 text-ideas-accent' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <h3 className='text-lg font-semibold'>Notifications</h3>
        </div>
        <Button variant='text' size='sm' onClick={() => navigate("/notifications")}>
          View All
        </Button>
      </div>

      {recentNotifications.length === 0 ? (
        <div className='text-center py-8'>
          <Bell className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-subtle'>No new notifications</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.read ? "bg-opacity-100" : "opacity-75"
              } transition-all duration-200`}>
              <div className='flex items-start justify-between gap-3'>
                <div className='flex items-start gap-3 flex-1 min-w-0'>
                  <span className='text-lg flex-shrink-0 mt-0.5'>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <h4
                      className={`text-sm font-medium ${
                        !notification.read
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}>
                      {notification.title}
                    </h4>
                    <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                      {notification.message}
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatDate(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className='w-2 h-2 bg-ideas-accent rounded-full flex-shrink-0'></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='flex items-center gap-1 flex-shrink-0'>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className='p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors'
                      title='Mark as read'>
                      <Check className='w-3 h-3' />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(notification.id)}
                    className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
                    title='Remove'>
                    <X className='w-3 h-3' />
                  </button>
                </div>
              </div>

              {/* Action Button if available */}
              {notification.actionUrl && (
                <div className='mt-3 pt-2 border-t border-gray-200 dark:border-gray-700'>
                  <Button
                    variant='text'
                    size='sm'
                    leftIcon={<Eye className='w-3 h-3' />}
                    onClick={() => navigate(notification.actionUrl)}>
                    {notification.actionText || "View Details"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {unreadCount > 3 && (
        <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center'>
          <Button variant='primary' size='sm' onClick={() => navigate("/notifications")}>
            {unreadCount - 3} more notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;

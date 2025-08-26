import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Settings,
  Mail,
  Shield,
  CreditCard,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";

/**
 * Notifications page component with real-time updates and history
 */
const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notification data (replace with actual GraphQL queries)
  const mockNotifications = [
    {
      id: "1",
      title: "Welcome to IDEAS MEDIA COMPANY! 🎉",
      message: "Thank you for joining us. Complete your profile to get started.",
      type: "system",
      category: "success",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      content: {
        actionButtons: [{ text: "Complete Profile", action: "/settings", style: "primary" }],
      },
    },
    {
      id: "2",
      title: "Email Verification Required",
      message: "Please verify your email address to access all features.",
      type: "verification",
      category: "warning",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: false,
      content: {
        actionButtons: [{ text: "Verify Email", action: "/email-verification", style: "primary" }],
      },
    },
    {
      id: "3",
      title: "ID Verification Approved ✓",
      message:
        "Your NIN verification has been approved. You now have access to all booking features.",
      type: "verification",
      category: "success",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
    },
    {
      id: "4",
      title: "Booking Confirmation",
      message: "Your photoshoot booking for December 25th has been confirmed.",
      type: "booking",
      category: "info",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true,
      content: {
        actionButtons: [{ text: "View Booking", action: "/dashboard", style: "secondary" }],
      },
    },
    {
      id: "5",
      title: "Payment Successful",
      message: "Your payment of ₦25,000 for photoshoot booking has been processed.",
      type: "payment",
      category: "success",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
    },
  ];

  useEffect(() => {
    // Simulate loading notifications
    const loadNotifications = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
      setLoading(false);
    };

    loadNotifications();
  }, []);

  const getIcon = (type, category) => {
    const iconProps = { size: 20 };

    if (category === "success") return <CheckCircle {...iconProps} className='text-green-500' />;
    if (category === "warning") return <AlertTriangle {...iconProps} className='text-yellow-500' />;
    if (category === "error") return <AlertCircle {...iconProps} className='text-red-500' />;

    switch (type) {
      case "verification":
        return <Shield {...iconProps} className='text-blue-500' />;
      case "booking":
        return <Calendar {...iconProps} className='text-purple-500' />;
      case "payment":
        return <CreditCard {...iconProps} className='text-green-500' />;
      case "system":
        return <Bell {...iconProps} className='text-gray-500' />;
      default:
        return <Info {...iconProps} className='text-blue-500' />;
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto px-gutter py-section'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8'></div>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-gray-200 dark:bg-gray-700 rounded-lg h-20'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-gutter py-section'>
      {/* Header */}
      <motion.div
        className='flex items-center justify-between mb-8'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <div className='flex items-center gap-4'>
          <h1 className='section-title mb-0'>Notifications</h1>
          {unreadCount > 0 && (
            <span className='bg-ideas-accent text-white text-sm px-2 py-1 rounded-full'>
              {unreadCount} new
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {unreadCount > 0 && (
            <Button
              variant='secondary'
              size='sm'
              onClick={markAllAsRead}
              className='flex items-center gap-2'>
              <CheckCheck size={16} />
              Mark all read
            </Button>
          )}
          <Button variant='secondary' size='sm' to='/settings' className='flex items-center gap-2'>
            <Settings size={16} />
            Preferences
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className='flex flex-wrap gap-2 mb-6'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}>
        {[
          { key: "all", label: "All", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          {
            key: "system",
            label: "System",
            count: notifications.filter((n) => n.type === "system").length,
          },
          {
            key: "verification",
            label: "Verification",
            count: notifications.filter((n) => n.type === "verification").length,
          },
          {
            key: "booking",
            label: "Bookings",
            count: notifications.filter((n) => n.type === "booking").length,
          },
          {
            key: "payment",
            label: "Payments",
            count: notifications.filter((n) => n.type === "payment").length,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? "bg-ideas-accent text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}>
            {label} {count > 0 && <span className='ml-1'>({count})</span>}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}>
        {filteredNotifications.length === 0 ? (
          <div className='text-center py-12'>
            <BellOff size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {filter === "unread"
                ? "All caught up! Check back later for new updates."
                : "You'll see notifications here when you have them."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                notification.isRead
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true, amount: 0.2 }}>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 mt-1'>
                  {getIcon(notification.type, notification.category)}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <h3
                        className={`font-medium ${
                          notification.isRead
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-900 dark:text-white"
                        }`}>
                        {notification.title}
                      </h3>
                      <p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
                        {notification.message}
                      </p>
                      <p className='text-gray-500 dark:text-gray-500 text-xs mt-2'>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    <div className='flex items-center gap-2'>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className='p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          title='Mark as read'>
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className='p-1 rounded text-gray-400 hover:text-red-500'
                        title='Delete notification'>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {notification.content?.actionButtons && (
                    <div className='flex gap-2 mt-3'>
                      {notification.content.actionButtons.map((button, idx) => (
                        <Button
                          key={idx}
                          variant={button.style === "primary" ? "primary" : "secondary"}
                          size='sm'
                          to={button.action}
                          className='text-sm'>
                          {button.text}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Load More (if needed) */}
      {filteredNotifications.length > 0 && (
        <motion.div
          className='text-center mt-8'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true, amount: 0.2 }}>
          <Button variant='secondary' size='sm'>
            Load more notifications
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;

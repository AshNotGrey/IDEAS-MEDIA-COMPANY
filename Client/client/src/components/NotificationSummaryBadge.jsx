import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import useNotificationTotals from "../hooks/useNotificationTotals";

/**
 * NotificationSummaryBadge Component
 *
 * A comprehensive notification summary component showing unread count and total notifications.
 * Can be used in headers, sidebars, or as a quick notification overview.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the component ('sm', 'md', 'lg')
 * @param {boolean} [props.showTotal] - Whether to show the total notification count
 * @param {boolean} [props.clickable] - Whether the component is clickable (links to notifications)
 * @param {string} [props.variant] - Component variant ('compact', 'detailed', 'minimal')
 * @returns {JSX.Element}
 */
export default function NotificationSummaryBadge({
  className = "",
  size = "md",
  showTotal = true,
  clickable = true,
  variant = "compact",
}) {
  const { unreadCount, totalCount } = useNotificationTotals();

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variants = {
    compact: "flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg",
    detailed:
      "flex flex-col items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3",
    minimal: "flex items-center gap-1 text-gray-600 dark:text-gray-400",
  };

  const content = (
    <div className={`${variants[variant]} ${sizeClasses[size]} ${className}`}>
      <Bell className={iconSizes[size]} />

      {variant === "detailed" ? (
        <>
          <span className='font-medium'>{unreadCount} unread</span>
          {showTotal && (
            <span className='text-xs text-gray-500 dark:text-gray-400'>{totalCount} total</span>
          )}
        </>
      ) : (
        <>
          <span className='font-medium'>{unreadCount}</span>
          {showTotal && <span className='text-gray-500 dark:text-gray-400'>/{totalCount}</span>}
        </>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        to='/notifications'
        className='block hover:opacity-80 transition-opacity'
        aria-label={`Notifications: ${unreadCount} unread, ${totalCount} total`}>
        {content}
      </Link>
    );
  }

  return content;
}

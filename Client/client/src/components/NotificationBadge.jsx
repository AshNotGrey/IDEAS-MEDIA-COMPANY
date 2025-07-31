import useNotificationTotals from "../hooks/useNotificationTotals";

/**
 * NotificationBadge Component
 *
 * A standalone badge component that displays the current unread notification count.
 * Can be used independently in headers, sidebars, or other UI elements.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the badge ('sm', 'md', 'lg')
 * @param {boolean} [props.showZero] - Whether to show badge when count is 0
 * @param {boolean} [props.animated] - Whether to show animations
 * @param {string} [props.variant] - Badge variant ('default', 'minimal', 'outline')
 * @returns {JSX.Element}
 */
export default function NotificationBadge({
  className = "",
  size = "md",
  showZero = false,
  animated = true,
  variant = "default",
}) {
  const { unreadCount } = useNotificationTotals();

  const sizeClasses = {
    sm: "text-[8px] px-1.5 py-0.5 min-w-[16px]",
    md: "text-[10px] px-2 py-1 min-w-[18px]",
    lg: "text-[12px] px-2.5 py-1.5 min-w-[20px]",
  };

  const variants = {
    default: "bg-ideas-accent text-white",
    minimal: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    outline: "bg-transparent border border-ideas-accent text-ideas-accent",
  };

  // Don't render if count is 0 and showZero is false
  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        ${sizeClasses[size]}
        ${variants[variant]}
        ${animated && unreadCount > 0 ? "animate-pulse" : ""}
        ${className}
      `}
      aria-label={`${unreadCount} unread notifications`}>
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

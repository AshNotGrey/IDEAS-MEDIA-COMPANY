import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useCartTotals from "../hooks/useCartTotals";

/**
 * CartIcon Component
 *
 * A reusable cart icon that displays the current cart item count and links to the cart page.
 * Automatically syncs with the cart state and provides visual feedback.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the icon ('sm', 'md', 'lg')
 * @param {boolean} [props.showCount] - Whether to show the item count badge
 * @param {string} [props.variant] - Icon variant ('icon', 'button', 'minimal')
 * @param {boolean} [props.animated] - Whether to show animations on hover
 * @returns {JSX.Element}
 */
export default function CartIcon({
  className = "",
  size = "md",
  showCount = true,
  variant = "icon",
  animated = true,
}) {
  const { itemCount } = useCartTotals();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const badgeSizes = {
    sm: "text-[8px] -top-1 -right-1 min-w-[14px]",
    md: "text-[10px] -top-1 -right-1 sm:-top-2 sm:-right-2 min-w-[16px]",
    lg: "text-[12px] -top-2 -right-2 min-w-[18px]",
  };

  const variants = {
    icon: `
      ${sizeClasses[size]}
      text-black dark:text-white 
      p-1 hover:bg-gray-100 dark:hover:bg-gray-800 
      rounded-md transition-colors
    `,
    button: `
      flex items-center gap-2 px-3 py-2
      text-black dark:text-white 
      hover:bg-gray-100 dark:hover:bg-gray-800 
      rounded-md transition-colors
    `,
    minimal: `
      ${sizeClasses[size]}
      text-black dark:text-white 
      hover:opacity-80 
      transition-opacity
    `,
  };

  const buttonClass = `${variants[variant]} ${className}`;

  return (
    <Link
      to='/cart'
      className={`relative ${buttonClass}`}
      aria-label={`Cart (${itemCount} items)`}
      title={`Cart (${itemCount} items)`}>
      {/* Shopping Cart Icon */}
      <div
        className={`inline-block ${animated ? "hover:scale-105 transition-transform duration-200" : ""}`}>
        <ShoppingCart className={iconSizes[size]} />
      </div>
      {/* Item Count Badge */}
      {showCount && itemCount > 0 && (
        <span
          className={`
            absolute ${badgeSizes[size]} 
            bg-ideas-accent text-white text-xs
            rounded-full px-1 text-center font-medium
            ${animated ? "animate-pulse" : ""}
          `}>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

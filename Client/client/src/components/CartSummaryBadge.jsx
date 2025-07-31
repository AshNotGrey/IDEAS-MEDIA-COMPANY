import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useCartTotals from "../hooks/useCartTotals";
import formatPrice from "../utils/format";

/**
 * CartSummaryBadge Component
 *
 * A comprehensive cart summary component that shows item count and total price.
 * Can be used in headers, sidebars, or as a quick cart overview.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the component ('sm', 'md', 'lg')
 * @param {boolean} [props.showPrice] - Whether to show the total price
 * @param {boolean} [props.clickable] - Whether the component is clickable (links to cart)
 * @param {string} [props.variant] - Component variant ('compact', 'detailed', 'minimal')
 * @returns {JSX.Element}
 */
export default function CartSummaryBadge({
  className = "",
  size = "md",
  showPrice = true,
  clickable = true,
  variant = "compact",
}) {
  const { itemCount, total, isEmpty } = useCartTotals();

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
      <ShoppingCart className={iconSizes[size]} />

      {variant === "detailed" ? (
        <>
          <span className='font-medium'>{itemCount} items</span>
          {showPrice && !isEmpty && (
            <span className='text-xs text-gray-500 dark:text-gray-400'>{formatPrice(total)}</span>
          )}
        </>
      ) : (
        <>
          <span className='font-medium'>{itemCount}</span>
          {showPrice && !isEmpty && (
            <span className='text-gray-500 dark:text-gray-400'>{formatPrice(total)}</span>
          )}
        </>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        to='/cart'
        className='block hover:opacity-80 transition-opacity'
        aria-label={`Cart: ${itemCount} items, ${formatPrice(total)}`}>
        {content}
      </Link>
    );
  }

  return content;
}

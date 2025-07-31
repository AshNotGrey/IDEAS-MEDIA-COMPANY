import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../utils/useWishlist";

/**
 * WishlistButton Component
 *
 * A button component that allows users to add/remove items from their wishlist.
 * Shows filled heart when item is in wishlist, outline heart when not.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object} props.item - The product item to add to wishlist
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size of the button ('sm', 'md', 'lg')
 * @returns {JSX.Element}
 */
const WishlistButton = ({ item, className = "", size = "md" }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(item.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

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

  return (
    <button
      onClick={handleToggleWishlist}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        bg-white/90 
        dark:bg-gray-800/90 
        backdrop-blur-sm 
        shadow-lg 
        hover:shadow-xl 
        transition-all 
        duration-200 
        flex 
        items-center 
        justify-center
        ${
          isWishlisted
            ? "text-red-500 hover:text-red-600"
            : "text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
        }
        ${className}
      `}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
      <Heart className={`${iconSizes[size]} ${isWishlisted ? "fill-current" : ""}`} />
    </button>
  );
};

export default WishlistButton;

import React from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import formatPrice from "../utils/format";
import Button from "./Button";

/**
 * WishlistItem Component
 *
 * Represents a single item in the wishlist with image, title, price,
 * and action buttons for moving to cart or removing from wishlist.
 *
 * @component
 * @param {Object} props - Props object
 * @param {string} props.image - Product image URL
 * @param {string} props.title - Product name
 * @param {number} props.price - Current price per unit
 * @param {number} props.originalPrice - Original price before discount
 * @param {Function} props.onMoveToCart - Handler for moving item to cart
 * @param {Function} props.onRemove - Handler for removing item from wishlist
 * @returns {JSX.Element}
 */
const WishlistItem = ({ image, title, price, originalPrice, onMoveToCart, onRemove }) => {
  return (
    <div className='card card-hover flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4'>
      {/* Product Image */}
      <img src={image} alt={title} className='w-full sm:w-32 h-32 object-cover rounded-lg' />

      {/* Product Info */}
      <div className='flex-1 w-full'>
        <h3 className='text-lg font-heading font-semibold mb-1'>{title}</h3>

        {/* Price */}
        <div className='text-base leading-snug'>
          <span className='font-bold'>{formatPrice(price)}</span>
          {originalPrice > price && (
            <span className='ml-2 text-sm text-subtle line-through'>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 mt-3'>
          <Button
            variant='primary'
            size='sm'
            icon={<ShoppingCart className='w-4 h-4' />}
            onClick={onMoveToCart}>
            Move to Cart
          </Button>
          <Button
            variant='text'
            color='red'
            size='sm'
            icon={<Trash2 className='w-4 h-4' />}
            onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      {/* Wishlist Icon */}
      <div className='flex items-center justify-center h-full sm:h-auto'>
        <Heart className='w-6 h-6 text-red-500 fill-current' />
      </div>
    </div>
  );
};

export default WishlistItem;

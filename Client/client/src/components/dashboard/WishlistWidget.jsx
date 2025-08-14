import React from "react";
import { Heart, ShoppingCart, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../utils/useWishlist";
import { useCart } from "../../utils/useCart";
import formatPrice from "../../utils/format";
import Button from "../Button";

/**
 * WishlistWidget Component
 *
 * Displays wishlist items with quick actions
 */
const WishlistWidget = () => {
  const navigate = useNavigate();
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  // Get first 3 items for preview
  const previewItems = wishlistItems?.slice(0, 3) || [];

  const handleMoveToCart = (item) => {
    // Convert wishlist item to cart item format
    const cartItem = {
      ...item,
      quantity: 1,
    };
    addToCart(cartItem);
    removeItem(item.id);
  };

  const handleRemoveFromWishlist = (itemId) => {
    removeItem(itemId);
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg relative'>
            <Heart className='w-5 h-5 text-ideas-accent' />
            {wishlistItems.length > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
              </span>
            )}
          </div>
          <h3 className='text-lg font-semibold'>Wishlist</h3>
        </div>
        <Button variant='text' size='sm' onClick={() => navigate("/wishlist")}>
          View All
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <div className='text-center py-8'>
          <Heart className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-subtle mb-4'>No items in wishlist</p>
          <Button variant='primary' size='sm' onClick={() => navigate("/mini-mart")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          {/* Wishlist Items Preview */}
          <div className='space-y-3 mb-4'>
            {previewItems.map((item) => (
              <div
                key={item.id}
                className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/50 transition-colors'>
                <div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0'>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className='w-full h-full object-cover' />
                  ) : (
                    <div className='text-gray-400 text-lg'>
                      {item.type === "service" ? "📅" : "📦"}
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                    {item.title}
                  </h4>
                  <div className='flex items-center justify-between mt-1'>
                    <span className='text-xs text-gray-600 dark:text-gray-400'>
                      {item.type === "service" ? "Service" : "Product"}
                    </span>
                    <span className='text-sm font-medium text-ideas-accent'>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-1 flex-shrink-0'>
                  <Button
                    variant='text'
                    size='icon'
                    onClick={() => handleMoveToCart(item)}
                    title='Move to cart'
                    className='text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'>
                    <ShoppingCart className='w-3 h-3' />
                  </Button>
                  <Button
                    variant='text'
                    size='icon'
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    title='Remove from wishlist'
                    className='text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'>
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more items indicator */}
          {wishlistItems.length > 3 && (
            <div className='text-center py-2 border-t border-gray-200 dark:border-gray-700 mb-4'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                +{wishlistItems.length - 3} more item{wishlistItems.length - 3 !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-2'>
            <Button
              variant='primary'
              size='md'
              fullWidth={true}
              leftIcon={<ShoppingCart className='w-4 h-4' />}
              onClick={() => {
                // Move all items to cart
                wishlistItems.forEach((item) => {
                  const cartItem = { ...item, quantity: 1 };
                  addToCart(cartItem);
                });
                // Clear wishlist
                wishlistItems.forEach((item) => removeItem(item.id));
                navigate("/cart");
              }}>
              Move All to Cart
            </Button>
            <Button
              variant='secondary'
              size='sm'
              fullWidth={true}
              leftIcon={<Plus className='w-4 h-4' />}
              onClick={() => navigate("/mini-mart")}>
              Add More Items
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistWidget;

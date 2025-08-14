import React from "react";
import { ShoppingCart, Plus, CreditCard, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../utils/useCart";
import useCartTotals from "../../hooks/useCartTotals";
import formatPrice from "../../utils/format";
import Button from "../Button";

/**
 * CartWidget Component
 *
 * Displays cart summary with quick actions
 */
const CartWidget = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCart();
  const { itemCount, total } = useCartTotals();

  // Get first 2 items for preview
  const previewItems = items?.slice(0, 2) || [];

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    // change to use toast later
    clearCart();
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg relative'>
            <ShoppingCart className='w-5 h-5 text-ideas-accent' />
            {itemCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-ideas-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </div>
          <h3 className='text-lg font-semibold'>Your Cart</h3>
        </div>
        <Button variant='text' size='sm' onClick={() => navigate("/cart")}>
          View Cart
        </Button>
      </div>

      {items.length === 0 ? (
        <div className='text-center py-8'>
          <ShoppingCart className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-subtle mb-4'>Your cart is empty</p>
          <Button variant='text' size='sm' onClick={() => navigate("/mini-mart")}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items Preview */}
          <div className='space-y-3 mb-4'>
            {previewItems.map((item) => (
              <div
                key={item.id}
                className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0'>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className='w-full h-full object-cover' />
                  ) : (
                    <div className='text-gray-400 text-xs'>
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
                      {item.type === "service" ? "Service" : `Qty: ${item.quantity}`}
                    </span>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0'
                  title='Remove item'>
                  <Trash2 className='w-3 h-3' />
                </button>
              </div>
            ))}
          </div>

          {/* Show more items indicator */}
          {items.length > 2 && (
            <div className='text-center py-2 border-t border-gray-200 dark:border-gray-700 mb-4'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                +{items.length - 2} more item{items.length - 2 !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Cart Summary */}
          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-600 dark:text-gray-300'>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
              <span className='text-lg font-bold text-gray-900 dark:text-white'>
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-2'>
            <Button
              variant='primary'
              size='md'
              fullWidth={true}
              leftIcon={<CreditCard className='w-4 h-4' />}
              onClick={() => navigate("/checkout")}>
              Checkout
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='secondary'
                size='sm'
                fullWidth={true}
                leftIcon={<Plus className='w-4 h-4' />}
                onClick={() => navigate("/mini-mart")}>
                Add More
              </Button>
              <Button
                variant='text'
                size='sm'
                onClick={handleClearCart}
                className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'>
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartWidget;

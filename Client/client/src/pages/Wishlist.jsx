import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import WishlistItem from "../components/WishlistItem";
import { useWishlist } from "../utils/useWishlist";
import { useCart } from "../utils/useCart";

import Button from "../components/Button";

/**
 * Wishlist Page
 *
 * Displays user's saved items with options to move to cart or remove.
 *
 * @component
 * @returns {JSX.Element}
 */
const Wishlist = () => {
  const navigate = useNavigate();
  const { items: wishlistItems, removeFromWishlist, clearWishlist, moveToCart } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (id) => {
    // First move the item from wishlist (this returns the item)
    moveToCart(id);

    // Find the item that was moved
    const itemToMove = wishlistItems.find((item) => item.id === id);
    if (itemToMove) {
      // Add to cart with quantity 1
      addItem({
        ...itemToMove,
        quantity: 1,
      });
    }
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
  };

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      clearWishlist();
    }
  };

  // Ensure wishlistItems is always an array
  const items = wishlistItems || [];
  const isEmpty = items.length === 0;

  return (
    <section className='max-w-6xl mx-auto px-4 py-section'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='section-title'>My Wishlist</h1>
        {!isEmpty && (
          <Button
            onClick={handleClearWishlist}
            variant='text'
            color='red'
            size='sm'
            icon={<Trash2 className='w-4 h-4' />}>
            Clear All
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className='card text-center flex flex-col items-center gap-4'>
          <Heart className='w-12 h-12 text-ideas-accent' />
          <p className='text-lg text-subtle'>Your wishlist is currently empty.</p>
          <div className='flex flex-col sm:flex-row gap-3 mt-4'>
            <Button onClick={() => navigate("/equipment")} variant='primary' size='sm'>
              Browse Products
            </Button>
            <Button
              onClick={() => navigate("/cart")}
              variant='secondary'
              size='sm'
              icon={<ShoppingCart className='w-4 h-4' />}>
              View Cart
            </Button>
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Wishlist Items */}
          {items.map((item) => (
            <WishlistItem
              key={item.id}
              {...item}
              onMoveToCart={() => handleMoveToCart(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}

          {/* Summary */}
          <div className='card p-4 mt-6'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
              <span className='text-subtle'>
                {items.length} item{items.length !== 1 ? "s" : ""} in wishlist
              </span>
              <div className='flex gap-3'>
                <Button onClick={() => navigate("/equipment")} variant='secondary' size='sm'>
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => navigate("/cart")}
                  variant='primary'
                  size='sm'
                  icon={<ShoppingCart className='w-4 h-4' />}>
                  View Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Wishlist;

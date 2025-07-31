import React from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../utils/useCart";
import { populateCartWithDemoData } from "../utils/demoData";
import Button from "../components/Button";

/**
 * Cart Page
 *
 * Displays all cart items and a summary panel.
 * If the cart is empty, shows a placeholder and CTAs.
 *
 * @component
 * @returns {JSX.Element}
 */
const Cart = () => {
  const navigate = useNavigate();
  const {
    items: cartItems,
    subtotal,
    discount,
    // shipping,
    updateQuantity,
    removeItem,
    addItem,
  } = useCart();

  const handleIncrease = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrease = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemove = (id) => {
    removeItem(id);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate("/checkout");
  };

  const handlePopulateDemoData = () => {
    populateCartWithDemoData(addItem);
  };

  // Ensure cartItems is always an array
  const items = cartItems || [];
  const isEmpty = items.length === 0;

  return (
    <section className='max-w-6xl mx-auto px-4 py-section'>
      <h1 className='section-title mb-6'>Your Cart</h1>

      {isEmpty ? (
        <div className='card text-center flex flex-col items-center gap-4'>
          <ShoppingCart className='w-12 h-12 text-ideas-accent' />
          <p className='text-lg text-subtle'>Your cart is currently empty.</p>
          <div className='flex flex-col sm:flex-row gap-3 mt-4'>
            <Button
              onClick={() => navigate("/equipment")}
              variant='primary'
              className='px-6 py-2 text-sm'>
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate("/wishlist")}
              variant='secondary'
              className='px-6 py-2 text-sm'>
              Go to Wishlist
            </Button>
            {/* todo: Remove after testing */}
            <Button
              onClick={handlePopulateDemoData}
              variant='secondary'
              className='px-6 py-2 text-sm border-dashed'>
              Load Demo Items
            </Button>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8'>
          {/* === Cart Items === */}
          <div className='flex flex-col gap-6'>
            {items.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                onIncrease={() => handleIncrease(item.id)}
                onDecrease={() => handleDecrease(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>

          {/* === Cart Summary === */}
          <div className='lg:col-start-2 lg:col-end-3 flex flex-col gap-4'>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              // shipping={shipping}
              onCheckout={handleCheckout}
            />

            {/* Additional Actions */}
            <div className='card p-4'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  onClick={() => navigate("/equipment")}
                  variant='secondary'
                  className='flex-1 px-4 py-2 text-sm'>
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => navigate("/wishlist")}
                  variant='secondary'
                  className='flex-1 px-4 py-2 text-sm'>
                  <Heart className='w-4 h-4 mr-2' />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;

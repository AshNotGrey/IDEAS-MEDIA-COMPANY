import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import BookingEditModal from "../components/BookingEditModal";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../utils/useCart";
import Button from "../components/Button";

/**
 * EXAMPLE: Enhanced Cart Page with Edit Functionality
 * 
 * This demonstrates how to integrate the booking edit modal
 * with the cart page for editing service and rental bookings.
 * 
 * To use this:
 * 1. Replace your existing Cart.jsx with this implementation
 * 2. Import and use BookingEditModal
 * 3. Add the edit functionality to your cart context
 */
const EnhancedCartWithEdit = () => {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState(null);
  
  const {
    items: cartItems,
    subtotal,
    discount,
    updateQuantity,
    removeItem,
    updateItem, // You'd need to add this to your cart context
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
    navigate("/checkout");
  };

  const handleEditBooking = (item) => {
    setEditingItem(item);
  };

  const handleSaveBookingChanges = async (itemId, newDetails) => {
    // Update the item in cart with new booking details
    const updatedItem = {
      ...cartItems.find(item => item.id === itemId),
      ...(newDetails.type === "service" 
        ? { serviceDetails: newDetails }
        : { rentalDetails: newDetails }
      )
    };
    
    // Update cart (you'd need to implement updateItem in your cart context)
    updateItem(itemId, updatedItem);
    
    console.log("Updated booking:", updatedItem);
  };

  const items = cartItems || [];
  const isEmpty = items.length === 0;

  return (
    <>
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
                Shop Equipment
              </Button>
              <Button
                onClick={() => navigate("/makeover-bookings")}
                variant='secondary'
                className='px-6 py-2 text-sm'>
                Book Services
              </Button>
              <Button
                onClick={() => navigate("/wishlist")}
                variant='secondary'
                className='px-6 py-2 text-sm'>
                Go to Wishlist
              </Button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8'>
            {/* Cart Items */}
            <div className='flex flex-col gap-6'>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onIncrease={() => handleIncrease(item.id)}
                  onDecrease={() => handleDecrease(item.id)}
                  onRemove={() => handleRemove(item.id)}
                  onEditBooking={() => handleEditBooking(item)}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div className='lg:col-start-2 lg:col-end-3 flex flex-col gap-4'>
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                onCheckout={handleCheckout}
              />

              {/* Additional Actions */}
              <div className='card p-4'>
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    onClick={() => navigate("/equipment")}
                    variant='secondary'
                    className='flex-1 px-4 py-2 text-sm'>
                    Shop Equipment
                  </Button>
                  <Button
                    onClick={() => navigate("/makeover-bookings")}
                    variant='secondary'
                    className='flex-1 px-4 py-2 text-sm'>
                    Book Services
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

      {/* Booking Edit Modal */}
      <BookingEditModal
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveBookingChanges}
      />
    </>
  );
};

export default EnhancedCartWithEdit;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import BookingEditModal from "../components/BookingEditModal";
import BulkEditModal from "../components/BulkEditModal";
import { Heart, ShoppingCart, Edit3 } from "lucide-react";
import { useCart } from "../utils/useCart";

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
  const [editingItem, setEditingItem] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const {
    items: cartItems,
    subtotal,
    discount,
    // shipping,
    updateQuantity,
    removeItem,
    addItem,
    updateItem,
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

  const handleEditBooking = (item) => {
    setEditingItem(item);
  };

  const handleSaveBookingChanges = async (itemId, newDetails) => {
    // Find the item to update
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    // Create updated item with new booking details
    const updatedItem = {
      ...item,
      ...(newDetails.type === "service"
        ? { serviceDetails: newDetails }
        : { rentalDetails: newDetails }),
    };

    // Recalculate price for rentals if duration changed
    if (newDetails.type === "rental") {
      const startDate = new Date(newDetails.startDate);
      const endDate = new Date(newDetails.endDate);
      const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const dailyRate =
        item.rentalDetails?.dailyRate || item.price / (item.rentalDetails?.duration || 1);
      const totalRental = dailyRate * duration;
      const securityDeposit = dailyRate * 0.2;

      updatedItem.price = totalRental + securityDeposit;
      updatedItem.rentalDetails = {
        ...newDetails,
        duration,
        dailyRate,
        totalRental,
        securityDeposit,
      };
    }

    // Update cart (you'd need to implement updateItem in your cart context)
    if (updateItem) {
      updateItem(itemId, updatedItem);
    } else {
      // Fallback: remove and re-add
      removeItem(itemId);
      addItem(updatedItem);
    }

    console.log("Updated booking:", updatedItem);
  };

  const handleBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const handleBulkSave = (updatedItems) => {
    updatedItems.forEach((item) => {
      if (updateItem) {
        updateItem(item.id, item);
      } else {
        removeItem(item.id);
        addItem(item);
      }
    });
  };

  // Ensure cartItems is always an array
  const items = cartItems || [];
  const isEmpty = items.length === 0;
  const timeBasedItems = items.filter((item) => item.type === "service" || item.type === "rental");
  const hasTimeBasedItems = timeBasedItems.length > 0;

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
              Shop Equipment
            </Button>
            <Button
              onClick={() => navigate("/makeover")}
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
          {/* === Cart Items === */}
          <div className='flex flex-col gap-6'>
            {/* Bulk Edit Button */}
            {hasTimeBasedItems && (
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                  Your Items ({items.length})
                </h2>
                <Button
                  variant='secondary'
                  size='sm'
                  leftIcon={<Edit3 className='w-4 h-4' />}
                  onClick={handleBulkEdit}
                  className='shadow-sm hover:shadow-md transition-shadow'>
                  Bulk Edit ({timeBasedItems.length})
                </Button>
              </div>
            )}

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

          {/* === Cart Summary === */}
          <div className='lg:col-start-2 lg:col-end-3 flex flex-col gap-4'>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              // shipping={shipping}
              onCheckout={handleCheckout}
            />

            {/* Additional Actions */}
            <div className='card px-2 py-4'>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Button
                  onClick={() => navigate("/equipment")}
                  variant='secondary'
                  className='flex-1 px-4 py-2 text-sm'>
                  Shop Equipment
                </Button>
                <Button
                  onClick={() => navigate("/makeover")}
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

      {/* Booking Edit Modal */}
      <BookingEditModal
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveBookingChanges}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        items={timeBasedItems}
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        onSave={handleBulkSave}
      />
    </section>
  );
};

export default Cart;

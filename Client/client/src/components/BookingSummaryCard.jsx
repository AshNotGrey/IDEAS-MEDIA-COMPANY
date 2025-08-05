import React, { useEffect, useRef, useState } from "react";
import { Calendar, Clock, CreditCard, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import formatPrice from "../utils/format";
import { useCart as useLocalCart } from "../utils/useCart";
import { useCart as useServerCart } from "../graphql/hooks/useOrders";
import Button from "./Button";

/**
 * BookingSummaryCard Component
 *
 * Displays a summary of the selected booking with pricing and details.
 * Automatically focuses the "Book Now" button when a selection is made
 * to improve user experience and accessibility.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object} props.selected - Selected booking item
 * @param {Date} props.date - Selected date
 * @param {string} props.time - Selected time
 * @returns {JSX.Element}
 */
const BookingSummaryCard = ({ selected, date, time }) => {
  const bookNowButtonRef = useRef(null);
  const navigate = useNavigate();
  const { addItem } = useLocalCart(); // Local cart for offline functionality
  const { addToCart: addToServerCart, addLoading } = useServerCart(); // Server cart for sync
  const [isAdded, setIsAdded] = useState(false);

  // Autofocus the Book Now button when a selection is made
  useEffect(() => {
    if (selected && bookNowButtonRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        bookNowButtonRef.current?.focus();
      }, 100);
    }
  }, [selected]);

  if (!selected) {
    return (
      <div className='card w-full md:w-1/3 h-fit'>
        <h3 className='text-lg font-semibold mb-4'>Booking Summary</h3>
        <p className='text-subtle text-center py-8'>Select a service to see details</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddToCart = async () => {
    const bookingItem = {
      id: `service-${selected.id}-${Date.now()}`,
      productId: selected.id,
      type: "service",
      title: selected.title,
      description: selected.description,
      image: selected.image || "/images/idealPhotography-Asset product-placeholder.png",
      price: selected.price,
      quantity: 1,
      serviceDetails: {
        date: date.toISOString().split("T")[0],
        time: time,
        duration: selected.duration || 120,
        specialRequests: selected.specialRequests || [],
      },
    };

    // Add to local cart for immediate UI feedback
    addItem(bookingItem);
    setIsAdded(true);

    // Also try to sync with server cart
    try {
      const result = await addToServerCart(bookingItem);
      if (result.success) {
        console.log("Service synced to server cart:", result.order);
      }
    } catch (error) {
      console.warn("Failed to sync to server cart:", error);
      // Local cart still works as fallback
    }

    // Reset the success state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);

    console.log("Service added to cart:", bookingItem);
  };

  const handleBookNow = () => {
    handleAddToCart();
    // Navigate to cart after a brief delay to show the success state
    setTimeout(() => {
      navigate("/cart");
    }, 1000);
  };

  return (
    <div className='card w-full h-fit'>
      <h3 className='text-lg font-semibold mb-4'>Booking Summary</h3>

      <div className='space-y-4'>
        {/* Service Details */}
        <div className='border-b border-gray-200 dark:border-gray-700 pb-4'>
          <h4 className='font-medium mb-2'>{selected.title}</h4>
          <p className='text-subtle text-sm'>{selected.description}</p>
        </div>

        {/* Date & Time */}
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Calendar className='w-4 h-4 text-ideas-accent' />
            <div>
              <p className='text-sm font-medium'>Date</p>
              <p className='text-sm text-subtle'>{formatDate(date)}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Clock className='w-4 h-4 text-ideas-accent' />
            <div>
              <p className='text-sm font-medium'>Time</p>
              <p className='text-sm text-subtle'>{time}</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium'>Service Fee</span>
            <span>{formatPrice(selected.price)}</span>
          </div>
          <div className='flex justify-between items-center text-lg font-bold'>
            <span>Total</span>
            <span>{formatPrice(selected.price)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-3'>
          {/* Add to Cart Button */}
          <Button
            variant={isAdded ? "success" : "secondary"}
            size='lg'
            fullWidth={true}
            leftIcon={isAdded ? <Plus className='w-5 h-5' /> : <ShoppingCart className='w-5 h-5' />}
            animated={true}
            onClick={handleAddToCart}
            disabled={isAdded || addLoading}
            loading={addLoading}>
            {isAdded ? "Added to Cart!" : addLoading ? "Adding..." : "Add to Cart"}
          </Button>

          {/* Book Now Button */}
          <Button
            ref={bookNowButtonRef}
            variant='primary'
            size='lg'
            fullWidth={true}
            leftIcon={<CreditCard className='w-5 h-5' />}
            animated={true}
            onClick={handleBookNow}>
            Book Now
          </Button>
        </div>

        {/* Additional Info */}
        <div className='text-xs text-subtle text-center space-y-1'>
          <p>✓ Add to cart to book multiple services</p>
          <p>✓ Book Now to proceed directly to checkout</p>
          <p>Payment will be processed securely</p>
          <p>Free cancellation up to 24 hours before</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryCard;

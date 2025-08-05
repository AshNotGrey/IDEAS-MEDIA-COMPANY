import React, { useEffect, useRef, useState } from "react";
import { Calendar, Clock, CreditCard, ShoppingCart, Plus, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import formatPrice from "../utils/format";
import { useCart as useLocalCart } from "../utils/useCart";
import { useCart as useServerCart } from "../graphql/hooks/useOrders";
import Button from "./Button";
import RefereeForm from "./RefereeForm";

/**
 * RentalBookingCard Component
 *
 * Displays rental booking summary with dates, times, and pricing.
 * Includes referee information form and quantity selection.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object} props.selected - Selected equipment item
 * @param {Date} props.startDate - Rental start date
 * @param {Date} props.endDate - Rental end date
 * @param {string} props.pickupTime - Pickup time
 * @param {string} props.returnTime - Return time
 * @returns {JSX.Element}
 */
const RentalBookingCard = ({ selected, startDate, endDate, pickupTime, returnTime }) => {
  const rentNowButtonRef = useRef(null);
  const navigate = useNavigate();
  const { items: cartItems, addItem } = useLocalCart();
  const { addToCart: addToServerCart, addLoading } = useServerCart();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [referee, setReferee] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Calculate rental duration and pricing with extended period discounts
  const calculateDuration = () => {
    if (!startDate || !endDate) return 1;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const duration = calculateDuration();
  const dailyRate = selected ? selected.price : 0;
  const baseTotal = dailyRate * duration * quantity;

  // Calculate discount for extended periods
  const getDiscountedTotal = () => {
    if (duration >= 7) {
      return baseTotal * 0.85; // 15% discount for 7+ days
    } else if (duration >= 3) {
      return baseTotal * 0.9; // 10% discount for 3-6 days
    } else if (duration > 1) {
      return baseTotal * 0.95; // 5% discount for 2 days
    }
    return baseTotal; // No discount for single day
  };

  const totalPrice = getDiscountedTotal();

  // Check if referee information is complete
  const isRefereeComplete = referee.name.trim() && referee.email.trim() && referee.phone.trim();

  // Check if all required information is complete
  const isFormComplete =
    startDate &&
    endDate &&
    pickupTime &&
    returnTime &&
    isRefereeComplete &&
    quantity > 0 &&
    quantity <= (selected?.stock || 0);

  // Helper function to check if this exact rental item is already in cart
  const isItemInCart = () => {
    if (!selected || !cartItems || !startDate || !endDate) return false;

    const rentalStartDate = startDate.toISOString().split("T")[0];
    const rentalEndDate = endDate.toISOString().split("T")[0];

    return cartItems.some(
      (item) =>
        item.type === "rental" &&
        item.productId === selected.id &&
        item.rentalDetails?.startDate === rentalStartDate &&
        item.rentalDetails?.endDate === rentalEndDate &&
        item.rentalDetails?.pickupTime === pickupTime &&
        item.rentalDetails?.returnTime === returnTime &&
        item.quantity === quantity
    );
  };

  // Autofocus the Rent Now button when a selection is made
  useEffect(() => {
    if (selected && rentNowButtonRef.current) {
      setTimeout(() => {
        rentNowButtonRef.current?.focus();
      }, 100);
    }
  }, [selected]);

  if (!selected) {
    return (
      <div className='card w-full h-fit'>
        <h3 className='text-lg font-semibold mb-4'>Rental Summary</h3>
        <p className='text-subtle text-center py-8'>Select equipment to see rental details</p>
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
    if (!selected || !startDate || !endDate || !pickupTime || !returnTime) {
      return Promise.reject(new Error("Missing rental details"));
    }

    // Validate referee information
    // todo use react-toastify once we've implemented it
    if (!referee.name || !referee.email || !referee.phone) {
      alert("Please provide complete referee information before proceeding.");
      return Promise.reject(new Error("Incomplete referee information"));
    }

    // Validate quantity against stock
    if (quantity <= 0 || quantity > (selected.stock || 0)) {
      alert(`Please select a valid quantity (1-${selected.stock || 0} available).`);
      return Promise.reject(new Error("Invalid quantity"));
    }

    const rentalItem = {
      id: `rental-${selected.id}-${Date.now()}`,
      productId: selected.id,
      type: "rental",
      title: selected.title,
      description: selected.description,
      image: selected.image || "/images/idealPhotography-Asset product-placeholder.png",
      price: totalPrice,
      quantity: quantity,
      rentalDetails: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        pickupTime,
        returnTime,
        duration,
        dailyRate,
        baseTotal,
        discountApplied: duration > 1,
        discountPercent: duration >= 7 ? 15 : duration >= 3 ? 10 : duration > 1 ? 5 : 0,
        totalPrice: totalPrice,
        referee: {
          name: referee.name,
          email: referee.email,
          phone: referee.phone,
        },
      },
    };

    // Add to local cart
    addItem(rentalItem);

    // Try to sync with server cart
    try {
      await addToServerCart({
        productId: selected.id,
        quantity: 1,
        rentalPeriod: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          pickupTime,
          returnTime,
          referee: {
            name: referee.name,
            email: referee.email,
            phone: referee.phone,
          },
        },
      });

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    } catch (error) {
      console.error("Failed to sync with server cart:", error);
    }
  };

  const handleRentNow = async () => {
    try {
      // Only add to cart if this exact item isn't already in cart
      if (!isItemInCart()) {
        await handleAddToCart();
      }
      navigate("/cart");
    } catch (error) {
      // Don't navigate if validation fails
      console.error("Rental validation failed:", error.message);
    }
  };

  return (
    <div className='card w-full h-fit'>
      <h3 className='text-lg font-semibold mb-4'>Rental Summary</h3>

      {/* Selected Item */}
      <div className='flex gap-4 mb-6'>
        <img
          src={selected.image || "/images/idealPhotography-Asset product-placeholder.png"}
          alt={selected.title}
          className='w-16 h-16 object-cover rounded-lg'
        />
        <div className='flex-1'>
          <h4 className='font-medium text-lg'>{selected.title}</h4>
          <p className='text-sm text-subtle'>{selected.description}</p>
        </div>
      </div>

      {/* Rental Details */}
      <div className='space-y-4 mb-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='w-4 h-4 text-ideas-accent' />
            <span className='font-medium'>Dates:</span>
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Clock className='w-4 h-4 text-ideas-accent' />
            <span className='font-medium'>Times:</span>
            <span>
              {pickupTime} - {returnTime}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Package className='w-4 h-4 text-ideas-accent' />
            <span className='font-medium'>Duration:</span>
            <span>
              {duration} day{duration !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Details */}
      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6'>
        <h4 className='font-semibold mb-3'>Pricing Breakdown</h4>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Duration:</span>
            <span className='font-medium'>
              {duration} day{duration !== 1 ? "s" : ""}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Daily Rate:</span>
            <span className='font-medium'>{formatPrice(dailyRate)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Quantity:</span>
            <span className='font-medium'>
              {quantity} unit{quantity !== 1 ? "s" : ""}
            </span>
          </div>
          {duration > 1 && (
            <div className='flex justify-between text-sm text-subtle'>
              <span>Extended Period Discount:</span>
              <span className='text-green-600'>
                {duration >= 7 ? "15% off" : duration >= 3 ? "10% off" : "5% off"}
              </span>
            </div>
          )}
          <hr className='my-2' />
          <div className='flex justify-between text-lg font-bold'>
            <span>Total Cost:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6'>
        <h4 className='font-semibold mb-3'>Quantity Selection</h4>
        <div className='space-y-2'>
          <label className='block text-sm font-medium'>
            Number of units (Max: {selected?.stock || 0} available)
          </label>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
              -
            </button>
            <span className='w-16 text-center font-medium'>{quantity}</span>
            <button
              type='button'
              onClick={() => setQuantity(Math.min(selected?.stock || 0, quantity + 1))}
              className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
              +
            </button>
          </div>
          {quantity > (selected?.stock || 0) && (
            <p className='text-sm text-red-600 dark:text-red-400'>
              Only {selected?.stock || 0} units available
            </p>
          )}
        </div>
      </div>

      {/* Referee Form */}
      <RefereeForm referee={referee} setReferee={setReferee} required={true} />

      {/* Action Buttons */}
      <div className='flex gap-3 mt-6 w-full'>
        <Button
          variant='secondary'
          size='sm'
          fullWidth
          leftIcon={<ShoppingCart className='w-4 h-4' />}
          onClick={handleAddToCart}
          loading={addLoading}
          disabled={!isFormComplete || addLoading || isItemInCart()}
          className={`transition-all duration-300 ${
            isAdded ? "bg-green-100 border-green-300 text-green-700" : ""
          }`}>
          {isItemInCart() ? "In Cart" : isAdded ? "Added!" : "Add to Cart"}
        </Button>
        <Button
          ref={rentNowButtonRef}
          variant='primary'
          size='sm'
          fullWidth
          leftIcon={<CreditCard className='w-4 h-4' />}
          onClick={handleRentNow}
          disabled={!isFormComplete || addLoading}>
          {isItemInCart() ? "Go to Cart" : "Rent Now"}
        </Button>
      </div>

      <p className='text-xs text-subtle text-center mt-4'>
        By proceeding, you agree to our rental terms and conditions
      </p>
    </div>
  );
};

export default RentalBookingCard;

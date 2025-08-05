import React from "react";
import { MinusIcon, PlusIcon, Trash2, Calendar, Clock, Package } from "lucide-react";
import formatPrice from "../utils/format";
import Button from "./Button";
/**
 * CartItem Component
 *
 * Represents a single item in the shopping cart with image, title, price,
 * quantity controls, subtotal, and a remove button.
 *
 * @component
 * @param {Object} props - Props object
 * @param {string} props.image - Product image URL
 * @param {string} props.title - Product name
 * @param {number} props.price - Current price per unit
 * @param {number} props.originalPrice - Original price before discount
 * @param {number} props.quantity - Quantity selected
 * @param {Function} props.onIncrease - Handler for increasing quantity
 * @param {Function} props.onDecrease - Handler for decreasing quantity
 * @param {Function} props.onRemove - Handler for removing item from cart
 * @returns {JSX.Element}
 */
const CartItem = ({
  image,
  title,
  price,
  originalPrice,
  quantity,
  type,
  serviceDetails,
  rentalDetails,
  onIncrease,
  onDecrease,
  onRemove,
  onEditBooking,
}) => {
  const isService = type === "service";
  const isRental = type === "rental";
  const isTimeBasedItem = isService || isRental;
  return (
    <div className='card card-hover p-4 sm:p-6'>
      {/* Row 1: Image (Mobile) / Image + Details (Desktop) */}
      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
        {/* Product Image */}
        <div className='flex-shrink-0'>
          <img
            src={image}
            alt={title}
            className='w-full h-48 sm:h-32 lg:w-32 lg:h-32 object-cover rounded-lg shadow-sm'
          />
        </div>

        {/* Product Details */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-lg font-heading font-semibold mb-2 text-black dark:text-white line-clamp-2'>
            {title}
          </h3>

          {/* Price */}
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-xl font-bold text-ideas-accent'>{formatPrice(price)}</span>
            {originalPrice > price && (
              <span className='text-sm text-subtle line-through'>{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Service-specific details */}
      {isService && serviceDetails && (
        <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            {serviceDetails.date && (
              <span className='flex items-center gap-1'>
                <Calendar className='w-4 h-4 text-ideas-accent' />
                {new Date(serviceDetails.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {serviceDetails.time && (
              <span className='flex items-center gap-1'>
                <Clock className='w-4 h-4 text-ideas-accent' />
                {serviceDetails.time}
              </span>
            )}
          </div>
          {serviceDetails.specialRequests?.length > 0 && (
            <div className='mt-2 text-xs text-subtle'>
              <strong>Special requests:</strong> {serviceDetails.specialRequests.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Rental-specific details */}
      {isRental && rentalDetails && (
        <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <span className='flex items-center gap-1'>
              <Calendar className='w-4 h-4 text-ideas-accent' />
              {new Date(rentalDetails.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              →{" "}
              {new Date(rentalDetails.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className='flex items-center gap-1'>
              <Clock className='w-4 h-4 text-ideas-accent' />
              {rentalDetails.pickupTime} - {rentalDetails.returnTime}
            </span>
            <span className='flex items-center gap-1'>
              <Package className='w-4 h-4 text-ideas-accent' />
              {rentalDetails.duration} day{rentalDetails.duration !== 1 ? "s" : ""}
            </span>
          </div>
          {rentalDetails.referee && (
            <div className='mt-2 text-xs'>
              <span className='text-blue-600'>
                Reference: {rentalDetails.referee.name} ({rentalDetails.referee.phone})
              </span>
            </div>
          )}
          {rentalDetails.discountApplied && (
            <div className='mt-1 text-xs'>
              <span className='text-green-600'>
                Extended Period Discount: {rentalDetails.discountPercent}% off
              </span>
            </div>
          )}
        </div>
      )}

      {/* Row 2: Quantity Controls & Actions */}
      <div className='flex flex-row items-center justify-between mt-4 lg:mt-6'>
        {/* Quantity Controls - Hide for time-based items since they're typically 1-time bookings */}
        {!isTimeBasedItem ? (
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-subtle'>Quantity:</span>
            <div className='flex items-center gap-2'>
              <Button
                variant='secondary'
                size='sm'
                className='w-8 h-8 p-0 flex items-center justify-center'
                onClick={onDecrease}
                disabled={quantity <= 1}>
                <MinusIcon className='w-4 h-4' />
              </Button>
              <span className='text-lg font-semibold w-12 text-center'>{quantity}</span>
              <Button
                variant='secondary'
                size='sm'
                className='w-8 h-8 p-0 flex items-center justify-center'
                onClick={onIncrease}>
                <PlusIcon className='w-4 h-4' />
              </Button>
              {/* Remove Button */}
              <Button
                variant='text'
                color='red'
                size='sm'
                onClick={onRemove}
                className='hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md'>
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-subtle'>
              {isService ? "Service Booking" : "Equipment Rental"}
            </span>
            {/* Edit Button for time-based items */}
            <Button
              variant='secondary'
              size='sm'
              className='px-3 py-1 text-xs'
              onClick={onEditBooking}>
              Edit Booking
            </Button>
            {/* Remove Button for time-based items */}
            <Button
              variant='text'
              color='red'
              size='sm'
              onClick={onRemove}
              className='hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md'>
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )}

        {/* Subtotal & Actions */}
        <div className='flex flex-row items-center gap-4'>
          {/* Subtotal */}
          <div className='text-center sm:text-right'>
            <p className='text-sm text-subtle'>Subtotal</p>
            <p className='text-xl font-bold text-ideas-accent'>{formatPrice(price * quantity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

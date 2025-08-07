import React from "react";
import PropTypes from "prop-types";
import { ShoppingBag, Calendar, Clock, Package, Tag } from "lucide-react";

/**
 * OrderSummary Component
 *
 * Displays a summary of cart items with pricing breakdown including subtotal,
 * discounts, and total. Handles both service and product items with appropriate
 * display formatting.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.cartItems - Array of cart items
 * @param {number} props.subtotal - Subtotal amount
 * @param {number} props.discount - Discount amount
 * @param {number} props.total - Total amount
 * @returns {JSX.Element} Rendered order summary
 */
const OrderSummary = ({ cartItems, subtotal, discount, total }) => {
  return (
    <div className='card p-4'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='p-2 bg-ideas-accent/10 rounded-lg'>
          <ShoppingBag className='w-5 h-5 text-ideas-accent' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Order Summary</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {cartItems?.length || 0} item{cartItems?.length !== 1 ? "s" : ""} in your order
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className='space-y-4 mb-6'>
        {cartItems?.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              item.type === "service"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            }`}>
            <div className='flex justify-between items-start gap-4'>
              <div className='flex-1 min-w-0'>
                {/* Item Title */}
                <div className='flex items-center gap-2 mb-2'>
                  {item.type === "service" ? (
                    <Calendar className='w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0' />
                  ) : (
                    <Package className='w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0' />
                  )}
                  <h4 className='font-semibold text-gray-900 dark:text-white truncate'>
                    {item.title}
                  </h4>
                </div>

                {/* Service Details */}
                {item.type === "service" && item.serviceDetails && (
                  <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      <span>{new Date(item.serviceDetails.date).toLocaleDateString()}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      <span>{item.serviceDetails.time}</span>
                    </div>
                  </div>
                )}

                {/* Product Quantity */}
                {item.type !== "service" && (
                  <div className='flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2'>
                    <Package className='w-3 h-3' />
                    <span>Quantity: {item.quantity}</span>
                  </div>
                )}

                {/* Item Type Badge */}
                <div className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-ideas-accent/10 text-ideas-accent'>
                  <Tag className='w-3 h-3' />
                  {item.type === "service" ? "Service Booking" : "Product"}
                </div>
              </div>

              {/* Price */}
              <div className='text-right flex-shrink-0'>
                <p className='font-bold text-lg text-gray-900 dark:text-white'>
                  ₦{(item.price * (item.quantity || 1)).toLocaleString()}
                </p>
                {item.quantity > 1 && (
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    ₦{item.price.toLocaleString()} each
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-gray-600 dark:text-gray-300'>Subtotal</span>
          <span className='font-medium text-gray-900 dark:text-white'>
            ₦{subtotal?.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className='flex justify-between items-center text-sm'>
            <span className='text-green-600 dark:text-green-400 flex items-center gap-1'>
              <Tag className='w-3 h-3' />
              Discount
            </span>
            <span className='font-medium text-green-600 dark:text-green-400'>
              -₦{discount?.toLocaleString()}
            </span>
          </div>
        )}

        <div className='border-t border-gray-300 dark:border-gray-600 pt-3'>
          <div className='flex justify-between items-center'>
            <span className='text-lg font-bold text-gray-900 dark:text-white'>Total</span>
            <span className='text-2xl font-bold text-ideas-accent'>₦{total?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
        <div className='flex items-start gap-2'>
          <div className='w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
          <div className='text-xs text-blue-700 dark:text-blue-300'>
            <p className='font-medium mb-1'>What's included:</p>
            <ul className='space-y-1 text-blue-600 dark:text-blue-400'>
              <li>• Secure payment processing</li>
              <li>• Free cancellation up to 24 hours before</li>
              <li>• Professional service guarantee</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number,
      type: PropTypes.string,
      serviceDetails: PropTypes.shape({
        date: PropTypes.string,
        time: PropTypes.string,
      }),
    })
  ),
  subtotal: PropTypes.number,
  discount: PropTypes.number,
  total: PropTypes.number,
};

OrderSummary.defaultProps = {
  cartItems: [],
  subtotal: 0,
  discount: 0,
  total: 0,
};

export default OrderSummary;

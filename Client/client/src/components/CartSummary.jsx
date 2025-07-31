import React from "react";
import formatPrice from "../utils/format";
import Button from "./Button";
/**
 * CartSummary Component
 *
 * Displays the summary of cart totals including subtotal, discounts, and final total.
 * Shipping is not displayed since items are picked up at HQ.
 *
 * @component
 * @param {Object} props - Props object
 * @param {number} props.subtotal - Total before discount or tax
 * @param {number} [props.discount] - Discount amount applied (optional)
 * @param {number} [props.shipping] - Shipping cost (always 0 for HQ pickup)
 * @param {Function} props.onCheckout - Handler for proceeding to checkout
 * @returns {JSX.Element}
 */
const CartSummary = ({ subtotal, discount = 0, onCheckout }) => {
  // const total = subtotal - discount + shipping;
  const total = subtotal - discount;

  return (
    <aside className='card p-6 w-full sm:max-w-sm mx-auto'>
      <h2 className='text-xl font-heading font-bold mb-4'>Order Summary</h2>

      <div className='flex justify-between text-sm mb-2'>
        <span className='text-subtle'>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className='flex justify-between text-sm mb-2'>
          <span className='text-subtle text-green-600 dark:text-green-400'>Discount</span>
          <span className='text-green-600 dark:text-green-400'>−{formatPrice(discount)}</span>
        </div>
      )}

      <div className='divider my-4' />

      <div className='flex justify-between font-semibold text-base mb-4'>
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <div className='text-xs text-subtle text-center mb-4'>
        * Items will be picked up at our HQ
      </div>

      <Button
        variant='primary'
        size='lg'
        className='w-full'
        onClick={onCheckout}
        aria-label='Proceed to Checkout'
        disabled={total === 0}
        animated={true}>
        Proceed to Checkout
      </Button>
    </aside>
  );
};

export default CartSummary;

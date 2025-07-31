import React, { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

/**
 * PaymentForm Component
 *
 * A modern payment form component that can be integrated with various payment gateways.
 * Currently shows a placeholder for payment integration.
 *
 * @component
 * @param {Object} props - Props object
 * @param {number} props.amount - Total amount to charge
 * @param {string} props.currency - Currency code (default: 'NGN')
 * @param {Function} props.onPaymentSuccess - Callback for successful payment
 * @param {Function} props.onPaymentError - Callback for payment errors
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element}
 */
const PaymentForm = ({
  amount,
  currency = "NGN",
  onPaymentSuccess,
  onPaymentError,
  loading = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Implement actual payment gateway integration
    // This is a placeholder for future payment integration

    console.log("Payment form submitted:", {
      amount,
      currency,
      paymentMethod,
    });

    // Simulate payment processing
    setTimeout(() => {
      if (onPaymentSuccess) {
        onPaymentSuccess({
          reference: "DEMO-" + Date.now(),
          amount,
          currency,
          status: "success",
        });
      }
    }, 2000);
  };

  return (
    <div className='space-y-6'>
      {/* Payment Method Selection */}
      <div>
        <h3 className='text-lg font-semibold mb-3'>Payment Method</h3>
        <div className='space-y-2'>
          <label className='flex items-center space-x-3 cursor-pointer'>
            <input
              type='radio'
              name='paymentMethod'
              value='card'
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='text-ideas-accent'
            />
            <CreditCard className='w-5 h-5' />
            <span>Credit/Debit Card</span>
          </label>

          <label className='flex items-center space-x-3 cursor-pointer'>
            <input
              type='radio'
              name='paymentMethod'
              value='bank'
              checked={paymentMethod === "bank"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='text-ideas-accent'
            />
            <span>Bank Transfer</span>
          </label>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        {paymentMethod === "card" && (
          <>
            <div>
              <label className='block text-sm font-medium mb-2'>Card Number</label>
              <input
                type='text'
                placeholder='1234 5678 9012 3456'
                className='input w-full'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Expiry Date</label>
                <input type='text' placeholder='MM/YY' className='input w-full' required />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>CVV</label>
                <input type='text' placeholder='123' className='input w-full' required />
              </div>
            </div>
          </>
        )}

        {paymentMethod === "bank" && (
          <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-subtle'>
              Bank transfer details will be provided after order confirmation.
            </p>
          </div>
        )}

        {/* Amount Display */}
        <div className='border-t pt-4'>
          <div className='flex justify-between items-center'>
            <span className='font-semibold'>Total Amount:</span>
            <span className='text-xl font-bold'>
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading}
          className='btn-primary w-full py-3 flex items-center justify-center space-x-2'>
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className='w-5 h-5' />
              <span>Pay Securely</span>
            </>
          )}
        </button>

        {/* Security Notice */}
        <p className='text-xs text-subtle text-center'>
          Your payment information is encrypted and secure.
        </p>
      </form>
    </div>
  );
};

export default PaymentForm;

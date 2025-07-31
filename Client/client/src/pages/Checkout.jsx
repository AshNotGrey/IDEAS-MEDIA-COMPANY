import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from "../utils/useCart";
import PaymentForm from "../components/PaymentForm";
import Button from "../components/Button";

/**
 * Checkout Page
 *
 * Integrates React Context for global cart/checkout state and react-hook-form
 * for controlled form inputs. Preps for Paystack payment gateway.
 *
 * @component
 * @returns {JSX.Element}
 */
const Checkout = () => {
  const navigate = useNavigate();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const { register, handleSubmit } = useForm();

  // Cart context state for cart + checkout info
  const {
    items: cartItems,
    subtotal,
    discount,
    total,
    email,
    customerInfo,
    setEmail,
    setCustomerInfo,
    clearCart,
  } = useCart();

  /**
   * Submit handler
   *
   * @param {Object} data - Collected form data
   */

  const onSubmit = (data) => {
    // Update cart context with form data
    setEmail(data.email);
    setCustomerInfo({
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
    });

    // Show payment form
    setIsPaymentProcessing(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    setPaymentComplete(true);
    setIsPaymentProcessing(false);
    clearCart(); // Clear cart after successful payment

    // TODO: Send order to backend
    console.log("Order completed:", {
      customerData: customerInfo,
      orderTotal: total,
      cartItems: cartItems,
      paymentData: paymentData,
    });
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    setIsPaymentProcessing(false);
    alert("Payment failed. Please try again.");
  };

  return (
    <section className='max-w-4xl mx-auto px-4 py-section'>
      <h1 className='section-title mb-6'>Checkout</h1>

      {paymentComplete ? (
        <div className='card text-center p-8'>
          <div className='text-green-500 text-6xl mb-4'>✓</div>
          <h2 className='text-2xl font-bold mb-2'>Order Successful!</h2>
          <p className='text-subtle mb-4'>Your order has been placed successfully.</p>
          <Button onClick={() => navigate("/account")} variant='primary' size='lg'>
            View Orders
          </Button>
        </div>
      ) : isPaymentProcessing ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Customer Info Summary */}
          <div className='card p-6'>
            <h2 className='text-lg font-semibold mb-4'>Order Summary</h2>
            <div className='space-y-2 text-sm'>
              <p>
                <strong>Name:</strong> {customerInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Phone:</strong> {customerInfo.phone}
              </p>
              <p>
                <strong>Address:</strong> {customerInfo.address}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className='card p-6'>
            <PaymentForm
              amount={total}
              currency='NGN'
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              loading={isPaymentProcessing}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* === Contact & Shipping Form === */}
          <div className='card flex flex-col gap-4'>
            <h2 className='text-lg font-semibold mb-2'>Contact & Pickup Info</h2>

            <input
              type='text'
              placeholder='Full Name'
              defaultValue={customerInfo.name}
              {...register("name", { required: true })}
              className='input'
            />
            <input
              type='email'
              placeholder='Email'
              defaultValue={email || customerInfo.email}
              {...register("email", { required: true })}
              className='input'
            />
            <input
              type='tel'
              placeholder='Phone'
              defaultValue={customerInfo.phone}
              {...register("phone", { required: true })}
              className='input'
            />
            <input
              type='text'
              placeholder='Address (for billing purposes)'
              defaultValue={customerInfo.address}
              {...register("address", { required: true })}
              className='input'
            />
            <input
              type='text'
              placeholder='City'
              defaultValue={customerInfo.city}
              {...register("city")}
              className='input'
            />
            <select {...register("country")} className='input' defaultValue={customerInfo.country}>
              <option value=''>Country</option>
              <option value='NG'>Nigeria</option>
              <option value='GH'>Ghana</option>
              <option value='KE'>Kenya</option>
              <option value='UK'>United Kingdom</option>
            </select>

            <div className='text-sm text-subtle bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md'>
              <strong>Pickup Information:</strong> All items will be picked up at our headquarters.
              You will receive pickup instructions via email after payment confirmation.
            </div>
          </div>

          {/* === Order Summary + Paystack === */}
          <div className='card flex flex-col justify-between gap-6'>
            <div>
              <h2 className='text-lg font-semibold mb-2'>Order Summary</h2>
              <div className='flex justify-between text-sm mb-2'>
                <span className='text-subtle'>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm mb-2'>
                <span className='text-subtle text-green-600 dark:text-green-400'>Discount</span>
                <span className='text-green-600 dark:text-green-400'>−${discount.toFixed(2)}</span>
              </div>
              <div className='divider my-4' />
              <div className='flex justify-between font-semibold text-base'>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className='text-xs text-subtle text-center mt-2'>
                * Items will be picked up at our HQ
              </div>
            </div>

            <Button
              type='submit'
              variant='primary'
              size='lg'
              className='w-full'
              disabled={cartItems.length === 0}>
              {cartItems.length === 0 ? "Cart is Empty" : "Complete Order"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default Checkout;

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

    // Separate services and products for order processing
    const services = cartItems.filter((item) => item.type === "service");
    const products = cartItems.filter((item) => item.type !== "service");

    // TODO: Send order to backend
    console.log("Order completed:", {
      customerData: customerInfo,
      orderTotal: total,
      cartItems: cartItems,
      services: services,
      products: products,
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
          {/* Customer Information Form */}
          <div className='card p-6'>
            <h2 className='text-lg font-semibold mb-4'>Customer Information</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Full Name</label>
                <input
                  {...register("name", { required: true })}
                  type='text'
                  className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                  placeholder='Enter your full name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Email Address</label>
                <input
                  {...register("email", { required: true })}
                  type='email'
                  className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                  placeholder='Enter your email'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Phone Number</label>
                <input
                  {...register("phone", { required: true })}
                  type='tel'
                  className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                  placeholder='Enter your phone number'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Address</label>
                <input
                  {...register("address", { required: true })}
                  type='text'
                  className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                  placeholder='Enter your address'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>City</label>
                  <input
                    {...register("city", { required: true })}
                    type='text'
                    className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                    placeholder='City'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Country</label>
                  <input
                    {...register("country", { required: true })}
                    type='text'
                    className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput'
                    placeholder='Country'
                  />
                </div>
              </div>
            </div>
            <Button type='submit' variant='primary' size='lg' fullWidth={true} className='mt-6'>
              Proceed to Payment
            </Button>
          </div>

          {/* Order Summary */}
          <div className='card p-6'>
            <h2 className='text-lg font-semibold mb-4'>Order Summary</h2>
            <div className='space-y-4 mb-6'>
              {cartItems?.map((item) => (
                <div key={item.id} className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h4 className='font-medium'>{item.title}</h4>
                    {item.type === "service" && item.serviceDetails && (
                      <div className='text-sm text-subtle mt-1'>
                        <p>📅 {new Date(item.serviceDetails.date).toLocaleDateString()}</p>
                        <p>⏰ {item.serviceDetails.time}</p>
                      </div>
                    )}
                    {item.type !== "service" && (
                      <p className='text-sm text-subtle'>Qty: {item.quantity}</p>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      ₦{(item.price * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
              <div className='flex justify-between items-center mb-2'>
                <span>Subtotal</span>
                <span>₦{subtotal?.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between items-center mb-2 text-green-600'>
                  <span>Discount</span>
                  <span>-₦{discount?.toLocaleString()}</span>
                </div>
              )}
              <div className='flex justify-between items-center text-lg font-bold'>
                <span>Total</span>
                <span>₦{total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default Checkout;

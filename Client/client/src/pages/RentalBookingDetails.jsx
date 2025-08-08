import React from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import formatPrice from "../utils/format";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * RentalBookingDetails Page
 *
 * Displays detailed information about a specific rental booking.
 * Shows booking status, equipment details, and rental period.
 *
 * @component
 * @returns {JSX.Element}
 */
const RentalBookingDetails = () => {
  const { id } = useParams();

  // Demo booking data - in real app, fetch based on id
  const booking = {
    id: id,
    orderNumber: "RENT-" + id,
    status: "confirmed",
    equipment: {
      title: "Canon EOS R5 Mirrorless Camera",
      image: "/images/idealPhotography-Asset product-placeholder.png",
      price: 3599.99,
      originalPrice: 3899.99,
    },
    rentalPeriod: {
      startDate: "2024-08-01",
      endDate: "2024-08-03",
      pickupTime: "09:00",
      returnTime: "17:00",
      duration: 3,
    },
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 800 000 0000",
    },
    pickupLocation: {
      address: "123 Photography Studio, Lagos",
      coordinates: { lat: 6.5244, lng: 3.3792 },
    },
    pricing: {
      dailyRate: 119.99,
      totalDays: 3,
      subtotal: 359.97,
      deposit: 500.0,
      total: 859.97,
    },
    notes: "Please handle with care. Equipment is professional grade.",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className='max-w-4xl mx-auto px-4 py-section'>
      <div className='mb-8'>
        <motion.h1
          className='section-title mb-2'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          Rental Booking Details
        </motion.h1>
        <motion.p
          className='text-subtle'
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          Order #{booking.orderNumber}
        </motion.p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Content */}
        <motion.div
          className='lg:col-span-2 space-y-6'
          variants={containerVariants}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.2 }}>
          {/* Equipment Details */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-xl font-semibold mb-4'>Equipment</h2>
            <div className='flex gap-4'>
              <img
                src={booking.equipment.image}
                alt={booking.equipment.title}
                className='w-24 h-24 object-cover rounded-lg'
              />
              <div className='flex-1'>
                <h3 className='font-semibold'>{booking.equipment.title}</h3>
                <p className='text-subtle text-sm mb-2'>
                  Daily Rate: {formatPrice(booking.pricing.dailyRate)}
                </p>
                <div className='flex items-center gap-4 text-sm'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rental Period */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-xl font-semibold mb-4'>Rental Period</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center gap-3'>
                <Calendar className='w-5 h-5 text-ideas-accent' />
                <div>
                  <p className='font-medium'>Pickup Date</p>
                  <p className='text-subtle text-sm'>
                    {formatDate(booking.rentalPeriod.startDate)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Calendar className='w-5 h-5 text-ideas-accent' />
                <div>
                  <p className='font-medium'>Return Date</p>
                  <p className='text-subtle text-sm'>{formatDate(booking.rentalPeriod.endDate)}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Clock className='w-5 h-5 text-ideas-accent' />
                <div>
                  <p className='font-medium'>Pickup Time</p>
                  <p className='text-subtle text-sm'>{booking.rentalPeriod.pickupTime}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Clock className='w-5 h-5 text-ideas-accent' />
                <div>
                  <p className='font-medium'>Return Time</p>
                  <p className='text-subtle text-sm'>{booking.rentalPeriod.returnTime}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pickup Location */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-xl font-semibold mb-4'>Pickup Location</h2>
            <div className='flex items-start gap-3'>
              <MapPin className='w-5 h-5 text-ideas-accent mt-1' />
              <div>
                <p className='font-medium'>{booking.pickupLocation.address}</p>
                <p className='text-subtle text-sm mt-1'>
                  Coordinates: {booking.pickupLocation.coordinates.lat},{" "}
                  {booking.pickupLocation.coordinates.lng}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          {booking.notes && (
            <motion.div className='card' variants={itemVariants}>
              <h2 className='text-xl font-semibold mb-4'>Special Notes</h2>
              <p className='text-subtle'>{booking.notes}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className='space-y-6'
          variants={containerVariants}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.2 }}>
          {/* Customer Info */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-lg font-semibold mb-4'>Customer Information</h2>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <User className='w-4 h-4 text-ideas-accent' />
                <span>{booking.customer.name}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-ideas-accent' />
                <span className='text-sm'>{booking.customer.email}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Phone className='w-4 h-4 text-ideas-accent' />
                <span className='text-sm'>{booking.customer.phone}</span>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-lg font-semibold mb-4'>Pricing Summary</h2>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Daily Rate</span>
                <span>{formatPrice(booking.pricing.dailyRate)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Duration</span>
                <span>{booking.pricing.totalDays} days</span>
              </div>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>{formatPrice(booking.pricing.subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Security Deposit</span>
                <span>{formatPrice(booking.pricing.deposit)}</span>
              </div>
              <div className='border-t pt-2 flex justify-between font-semibold'>
                <span>Total</span>
                <span>{formatPrice(booking.pricing.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div className='card' variants={itemVariants}>
            <h2 className='text-lg font-semibold mb-4'>Actions</h2>
            <div className='space-y-3'>
              <button className='btn-primary w-full'>Download Receipt</button>
              <button className='btn-secondary w-full'>Contact Support</button>
              {booking.status === "confirmed" && (
                <button className='btn text-red-600 hover:text-red-800 w-full'>
                  Cancel Booking
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RentalBookingDetails;

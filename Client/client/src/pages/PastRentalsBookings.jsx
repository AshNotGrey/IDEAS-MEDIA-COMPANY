import React from "react";
import { motion } from "framer-motion";

/**
 * PastRentalsBookings page component.
 * Displays user’s history of rentals and bookings.
 *
 * @component
 * @returns {JSX.Element} The rendered PastRentalsBookings page.
 */
const PastRentalsBookings = () => {
  return (
    <section className='max-w-4xl mx-auto px-gutter py-section'>
      <header className='mb-8 text-center'>
        <motion.h1
          className='section-title mb-2'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          Past Rentals & Bookings
        </motion.h1>
        <motion.p
          className='text-subtle max-w-xl mx-auto'
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          viewport={{ once: true, amount: 0.3 }}>
          View your past equipment rentals, photoshoot sessions, makeovers and more. You can
          download receipts or book again.
        </motion.p>
      </header>

      {/* Card block for history or fallback */}
      <motion.div
        className='card text-center'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}>
        <p className='text-lg text-subtle mb-4'>Rental and booking history coming soon.</p>
        <button className='btn-primary px-6 py-2 mt-2'>Explore Services</button>
      </motion.div>
    </section>
  );
};

export default PastRentalsBookings;

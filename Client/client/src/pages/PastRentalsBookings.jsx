import React from "react";

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
        <h1 className='section-title mb-2'>Past Rentals & Bookings</h1>
        <p className='text-subtle max-w-xl mx-auto'>
          View your past equipment rentals, photoshoot sessions, makeovers and more. You can
          download receipts or book again.
        </p>
      </header>

      {/* Card block for history or fallback */}
      <div className='card text-center'>
        <p className='text-lg text-subtle mb-4'>Rental and booking history coming soon.</p>
        <button className='btn-primary px-6 py-2 mt-2'>Explore Services</button>
      </div>
    </section>
  );
};

export default PastRentalsBookings;

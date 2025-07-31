import React from "react";
/**
 * BookingSummaryCard displays a summary of the selected makeover booking,
 * including the makeover type, date, time, and price, with a confirmation button.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.selected - The selected makeover object containing title and price.
 * @param {Date} props.date - The selected date for the booking.
 * @param {string} props.time - The selected time for the booking.
 * @returns {JSX.Element|null} The rendered booking summary card, or null if no makeover is selected.
 */

export default function BookingSummaryCard({ selected, date, time }) {
  if (!selected) return null;

  return (
    <div className='card space-y-2'>
      <h4 className='text-lg font-heading mb-2'>Booking Summary</h4>
      <p>
        <span className='font-medium'>Makeover:</span> {selected.title}
      </p>
      <p>
        <span className='font-medium'>Date:</span> {date?.toDateString()}
      </p>
      <p>
        <span className='font-medium'>Time:</span> {time}
      </p>
      <p className='text-ideas-accent font-semibold mt-2'>₦{selected.price.toLocaleString()}</p>
      <button className='btn-primary w-full mt-4'>Confirm Booking</button>
    </div>
  );
}

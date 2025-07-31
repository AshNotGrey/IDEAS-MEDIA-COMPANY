import React from "react";

/**
 * SessionCard component
 * Renders session booking details for photoshoots, makeovers, etc.
 *
 * @param {Object} props
 * @param {string} props.image - Image URL of the session type
 * @param {string} props.title - Session title (e.g., "Studio Shoot")
 * @param {string} props.date - Date of session (e.g., "2025-08-10")
 * @param {string} props.time - Time of session (e.g., "3:00 PM")
 * @param {string} props.status - Booking status (e.g., "upcoming", "completed")
 * @param {Function} [props.onRebook] - Optional rebook handler
 * @returns {JSX.Element}
 */
const SessionCard = ({ image, title, date, time, status, onRebook }) => {
  return (
    <div className='card card-hover flex flex-col sm:flex-row items-center gap-4'>
      <img src={image} alt={title} className='w-full sm:w-40 h-32 object-cover rounded-lg' />
      <div className='flex-1 w-full text-left'>
        <h2 className='text-xl font-semibold mb-1'>{title}</h2>
        <p className='text-subtle mb-1'>
          📅 {date} &nbsp;&nbsp; ⏰ {time}
        </p>
        <p className='text-sm font-medium capitalize text-ideas-accent'>{status}</p>
      </div>
      {onRebook && <button className='btn-primary px-4 py-2 mt-2 sm:mt-0'>Rebook</button>}
    </div>
  );
};

export default SessionCard;

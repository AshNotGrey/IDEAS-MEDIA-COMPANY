import React, { useState } from "react";
import CalendarView from "./CalendarView";
import AvailabilityChecker from "./AvailabilityChecker";
import { Calendar, Clock } from "lucide-react";
import Button from "./Button";

/**
 * RentalDateTimePicker Component
 *
 * Allows users to select rental period dates and pickup/return times
 * for equipment rentals with validation and smart defaults.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Date} props.startDate - Rental start date
 * @param {Function} props.setStartDate - Set start date handler
 * @param {Date} props.endDate - Rental end date
 * @param {Function} props.setEndDate - Set end date handler
 * @param {string} props.pickupTime - Pickup time
 * @param {Function} props.setPickupTime - Set pickup time handler
 * @param {string} props.returnTime - Return time
 * @param {Function} props.setReturnTime - Set return time handler
 * @returns {JSX.Element}
 */
const RentalDateTimePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  pickupTime,
  setPickupTime,
  returnTime,
  setReturnTime,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  // Generate time options (business hours: 8 AM - 6 PM)
  const timeOptions = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      timeOptions.push(timeString);
    }
  }

  // Get tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Calculate minimum end date (day after start date)
  const getMinEndDate = () => {
    if (!startDate) return minDate;
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    setStartDate(newStartDate);

    // Auto-adjust end date if it's before or same as start date
    if (endDate <= newStartDate) {
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setEndDate(newEndDate);
    }
  };

  const handleCalendarDateSelect = (start, end) => {
    setStartDate(start);
    if (end) {
      setEndDate(end);
    } else if (start) {
      // Auto-set end date to next day if only start selected
      const nextDay = new Date(start);
      nextDay.setDate(start.getDate() + 1);
      setEndDate(nextDay);
    }
  };

  // Mock unavailable dates - in real app, this would come from API
  const unavailableDates = ["2024-01-15", "2024-01-16", "2024-01-20", "2024-01-25"];

  return (
    <div className='space-y-6'>
      {/* Rental Period */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Rental Period</h3>
          <Button
            variant='secondary'
            size='sm'
            leftIcon={<Calendar className='w-4 h-4' />}
            onClick={() => setShowCalendar(!showCalendar)}>
            {showCalendar ? "Hide Calendar" : "Show Calendar"}
          </Button>
        </div>

        {showCalendar ? (
          <div className='mb-6'>
            <CalendarView
              startDate={startDate}
              endDate={endDate}
              onDateSelect={handleCalendarDateSelect}
              unavailableDates={unavailableDates}
              isRangeMode={true}
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Start Date</label>
              <input
                type='date'
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={handleStartDateChange}
                min={minDate}
                className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>End Date</label>
              <input
                type='date'
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                min={getMinEndDate()}
                className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Availability Checker */}
      <AvailabilityChecker
        startDate={startDate}
        endDate={endDate}
        type='rental'
        itemId='sample-equipment-id'
        onAvailabilityChange={setIsAvailable}
      />

      {/* Pickup & Return Times */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Pickup & Return Times</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Pickup Time</label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
              required>
              <option value=''>Select pickup time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Return Time</label>
            <select
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
              required>
              <option value=''>Select return time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {!isAvailable && (
              <p className='text-xs text-red-600 mt-1'>Some selected dates are unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Rental Guidelines */}
      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
        <h4 className='text-sm font-semibold mb-2'>Rental Guidelines</h4>
        <ul className='text-xs text-subtle space-y-1'>
          <li>• Equipment must be picked up and returned during business hours</li>
          <li>• Security deposit is refundable upon equipment return in good condition</li>
          <li>• Late returns incur additional daily charges</li>
          <li>• All equipment comes with usage instructions and support</li>
        </ul>
      </div>
    </div>
  );
};

export default RentalDateTimePicker;

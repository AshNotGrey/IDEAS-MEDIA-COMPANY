import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, Loader } from "lucide-react";

/**
 * AvailabilityChecker Component
 *
 * Checks and displays availability for rental dates and service bookings.
 * Shows real-time availability status and suggests alternative dates.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Date} props.startDate - Start date to check
 * @param {Date} props.endDate - End date to check (for rentals)
 * @param {string} props.time - Time to check (for services)
 * @param {string} props.type - "rental" or "service"
 * @param {string} props.itemId - Item ID to check availability for
 * @param {Function} props.onAvailabilityChange - Callback when availability changes
 * @returns {JSX.Element}
 */
const AvailabilityChecker = ({ startDate, endDate, time, type, itemId, onAvailabilityChange }) => {
  const [availability, setAvailability] = useState({
    status: "checking", // 'checking', 'available', 'unavailable', 'limited'
    message: "",
    alternatives: [],
    conflictDates: [],
  });

  // Mock availability data - in real app, this would come from API
  const mockBookedDates = [
    { date: "2024-01-15", type: "rental" },
    { date: "2024-01-16", type: "service" },
    { date: "2024-01-20", type: "rental" },
    { date: "2024-01-25", type: "service" },
  ];

  const mockBookedTimes = {
    "2024-01-17": ["09:00", "14:00", "16:00"],
    "2024-01-18": ["10:00", "11:00", "15:00"],
  };

  useEffect(() => {
    checkAvailability();
  }, [startDate, endDate, time, type, itemId]);

  const checkAvailability = async () => {
    setAvailability((prev) => ({ ...prev, status: "checking" }));

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (type === "rental") {
      checkRentalAvailability();
    } else {
      checkServiceAvailability();
    }
  };

  const checkRentalAvailability = () => {
    const dateRange = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dateRange.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const conflicts = dateRange.filter((date) =>
      mockBookedDates.some((booking) => booking.date === date && booking.type === "rental")
    );

    if (conflicts.length === 0) {
      setAvailability({
        status: "available",
        message: "Equipment is available for your selected dates",
        alternatives: [],
        conflictDates: [],
      });
      onAvailabilityChange?.(true);
    } else if (conflicts.length < dateRange.length) {
      setAvailability({
        status: "limited",
        message: `Equipment unavailable on ${conflicts.length} day(s): ${conflicts.join(", ")}`,
        alternatives: getSuggestedDates(),
        conflictDates: conflicts,
      });
      onAvailabilityChange?.(false);
    } else {
      setAvailability({
        status: "unavailable",
        message: "Equipment is not available for your selected dates",
        alternatives: getSuggestedDates(),
        conflictDates: conflicts,
      });
      onAvailabilityChange?.(false);
    }
  };

  const checkServiceAvailability = () => {
    const dateStr = startDate.toISOString().split("T")[0];
    const bookedTimes = mockBookedTimes[dateStr] || [];

    if (!bookedTimes.includes(time)) {
      setAvailability({
        status: "available",
        message: "Time slot is available",
        alternatives: [],
        conflictDates: [],
      });
      onAvailabilityChange?.(true);
    } else {
      const availableTimes = [];
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          if (!bookedTimes.includes(timeSlot)) {
            availableTimes.push(timeSlot);
          }
        }
      }

      setAvailability({
        status: "unavailable",
        message: "Selected time slot is not available",
        alternatives: availableTimes.slice(0, 6), // Show first 6 alternatives
        conflictDates: [],
      });
      onAvailabilityChange?.(false);
    }
  };

  const getSuggestedDates = () => {
    const suggestions = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const suggestedDate = new Date(today);
      suggestedDate.setDate(today.getDate() + i);
      const dateStr = suggestedDate.toISOString().split("T")[0];

      const isAvailable = !mockBookedDates.some(
        (booking) => booking.date === dateStr && booking.type === type
      );

      if (isAvailable) {
        suggestions.push({
          date: dateStr,
          display: suggestedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        });
      }

      if (suggestions.length >= 5) break;
    }

    return suggestions;
  };

  const getStatusIcon = () => {
    switch (availability.status) {
      case "checking":
        return <Loader className='w-4 h-4 animate-spin text-blue-500' />;
      case "available":
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case "limited":
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case "unavailable":
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (availability.status) {
      case "available":
        return "text-green-600  border-green-200";
      case "limited":
        return "text-yellow-600 border-yellow-200";
      case "unavailable":
        return "text-red-600  border-red-200";
      default:
        return "text-blue-600  border-blue-200";
    }
  };

  return (
    <div className={`p-3 rounded-lg border bg-inherit ${getStatusColor()}`}>
      <div className='flex items-center gap-2 mb-2'>
        {getStatusIcon()}
        <span className='text-sm font-medium'>
          {availability.status === "checking" ? "Checking availability..." : "Availability Status"}
        </span>
      </div>

      {availability.status !== "checking" && (
        <>
          <p className='text-sm mb-3'>{availability.message}</p>

          {availability.alternatives.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs font-medium '>
                {type === "rental" ? "Suggested dates:" : "Available times:"}
              </p>
              <div className='flex flex-wrap gap-1'>
                {availability.alternatives.map((alt, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-50 rounded text-xs'>
                    {type === "rental" ? (
                      <>
                        <Calendar className='w-3 h-3' />
                        {alt.display}
                      </>
                    ) : (
                      <>
                        <Clock className='w-3 h-3' />
                        {alt}
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvailabilityChecker;

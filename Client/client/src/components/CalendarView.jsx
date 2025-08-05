import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

/**
 * CalendarView Component
 *
 * A calendar interface for selecting rental dates with visual availability indicators.
 * Shows available/unavailable dates and allows range selection.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Date} props.startDate - Selected start date
 * @param {Date} props.endDate - Selected end date
 * @param {Function} props.onDateSelect - Date selection handler
 * @param {Array} props.unavailableDates - Array of unavailable date strings
 * @param {boolean} props.isRangeMode - Whether to select date ranges (for rentals)
 * @returns {JSX.Element}
 */
const CalendarView = ({
  startDate,
  endDate,
  onDateSelect,
  unavailableDates = [],
  isRangeMode = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startCalendar);

    while (days.length < 42) {
      // 6 weeks * 7 days
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (!isRangeMode) {
      onDateSelect(date, date);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDateSelect(date, null);
    } else if (date < startDate) {
      // Clicked before start date, make it the new start
      onDateSelect(date, null);
    } else {
      // Complete the range
      onDateSelect(startDate, date);
    }
  };

  const isDateDisabled = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return date < tomorrow || unavailableDates.includes(dateStr);
  };

  const isDateSelected = (date) => {
    if (!startDate) return false;

    if (!isRangeMode) {
      return date.toDateString() === startDate.toDateString();
    }

    if (!endDate) {
      return date.toDateString() === startDate.toDateString();
    }

    return date >= startDate && date <= endDate;
  };

  const isDateInHoverRange = (date) => {
    if (!isRangeMode || !startDate || endDate || !hoverDate) return false;

    const rangeStart = startDate < hoverDate ? startDate : hoverDate;
    const rangeEnd = startDate < hoverDate ? hoverDate : startDate;

    return date >= rangeStart && date <= rangeEnd;
  };

  const isDateUnavailable = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return unavailableDates.includes(dateStr);
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getDayClassName = (date) => {
    const baseClass =
      "w-10 h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors";

    if (isDateDisabled(date)) {
      return `${baseClass} text-gray-300 cursor-not-allowed`;
    }

    if (!isCurrentMonth(date)) {
      return `${baseClass} text-gray-400 hover:bg-gray-100`;
    }

    if (isDateSelected(date)) {
      if (
        !isRangeMode ||
        !endDate ||
        date.toDateString() === startDate?.toDateString() ||
        date.toDateString() === endDate?.toDateString()
      ) {
        return `${baseClass} bg-ideas-accent text-white font-semibold`;
      }
      return `${baseClass} bg-ideas-accent bg-opacity-20 text-ideas-accent`;
    }

    if (isDateInHoverRange(date)) {
      return `${baseClass} bg-ideas-accent bg-opacity-10 text-ideas-accent`;
    }

    if (isDateUnavailable(date)) {
      return `${baseClass} bg-red-100 text-red-600 relative`;
    }

    if (date.toDateString() === today.toDateString()) {
      return `${baseClass} border-2 border-ideas-accent text-ideas-accent hover:bg-ideas-accent hover:text-white`;
    }

    return `${baseClass} hover:bg-gray-100`;
  };

  const calendarDays = getCalendarDays();
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className='bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={goToPreviousMonth}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
          <ChevronLeft className='w-5 h-5' />
        </button>

        <h3 className='text-lg font-semibold'>{monthYear}</h3>

        <button
          onClick={goToNextMonth}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
          <ChevronRight className='w-5 h-5' />
        </button>
      </div>

      {/* Weekday headers */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className='text-center text-xs font-medium text-gray-500 py-2'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((date, index) => (
          <div
            key={index}
            className={getDayClassName(date)}
            onClick={() => handleDateClick(date)}
            onMouseEnter={() => setHoverDate(date)}
            onMouseLeave={() => setHoverDate(null)}>
            <span>{date.getDate()}</span>
            {isDateUnavailable(date) && isCurrentMonth(date) && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-0.5 h-8 bg-red-400 rotate-45'></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex flex-wrap gap-4 text-xs'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-ideas-accent rounded'></div>
            <span>Selected</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-red-100 border border-red-200 rounded relative'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-0.5 h-3 bg-red-400 rotate-45'></div>
              </div>
            </div>
            <span>Unavailable</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 border-2 border-ideas-accent rounded'></div>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Selection info */}
      {startDate && (
        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='w-4 h-4 text-blue-600' />
            <span>
              {isRangeMode
                ? endDate
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : `${startDate.toLocaleDateString()} (select end date)`
                : startDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

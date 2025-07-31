import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

/**
 * DateTimePicker Component
 *
 * A custom date and time picker with better styling and UX.
 * Always visible with inline calendar and time selection.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Date} props.date - Selected date
 * @param {Function} props.setDate - Date setter function
 * @param {string} props.time - Selected time
 * @param {Function} props.setTime - Time setter function
 * @param {React.RefObject} props.pickerRef - Ref for focus management
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Rendered date/time picker
 */
const DateTimePicker = ({ date, setDate, time, setTime, className = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(date));
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add previous month's days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const selectDate = (selectedDate) => {
    setDate(selectedDate);
    setShowCalendar(false);
  };

  const isToday = (dayDate) => {
    const today = new Date();
    return dayDate.toDateString() === today.toDateString();
  };

  const isSelected = (dayDate) => {
    return dayDate.toDateString() === date.toDateString();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const timeOptions = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Date Selection */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-black dark:text-white'>Select Date</label>

        <div className='relative'>
          <Button
            variant='secondary'
            fullWidth={true}
            leftIcon={<Calendar className='w-4 h-4' />}
            onClick={() => setShowCalendar(!showCalendar)}
            className='justify-start text-left'>
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div
              ref={calendarRef}
              className='absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4'>
              {/* Calendar Header */}
              <div className='flex items-center justify-between mb-4'>
                <Button variant='text' size='sm' onClick={() => navigateMonth(-1)} className='p-1'>
                  <ChevronLeft className='w-4 h-4' />
                </Button>

                <h3 className='text-sm font-semibold text-black dark:text-white'>
                  {formatMonthYear(currentMonth)}
                </h3>

                <Button variant='text' size='sm' onClick={() => navigateMonth(1)} className='p-1'>
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>

              {/* Days of Week */}
              <div className='grid grid-cols-7 gap-1 mb-2'>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className='text-xs font-medium text-center text-black/60 dark:text-white/60 py-1'>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-1'>
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => selectDate(day.date)}
                    className={`
                      w-8 h-8 text-xs rounded-md transition-colors
                      ${
                        day.isCurrentMonth
                          ? "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          : "text-black/30 dark:text-white/30"
                      }
                      ${
                        isToday(day.date)
                          ? "bg-ideas-accent/20 text-ideas-accent font-semibold"
                          : ""
                      }
                      ${isSelected(day.date) ? "bg-ideas-accent text-white font-semibold" : ""}
                    `}>
                    {day.date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Selection */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-black dark:text-white'>Select Time</label>

        <div className='grid grid-cols-4 gap-2'>
          {timeOptions.map((timeOption) => (
            <Button
              key={timeOption}
              variant={time === timeOption ? "secondary" : "text"}
              size='sm'
              onClick={() => setTime(timeOption)}
              className='text-xs'>
              {timeOption}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='flex gap-2'>
        <Button
          variant='text'
          size='sm'
          onClick={() => {
            const today = new Date();
            setDate(today);
            setCurrentMonth(today);
          }}
          className='text-xs'>
          Today
        </Button>
        <Button
          variant='text'
          size='sm'
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDate(tomorrow);
            setCurrentMonth(tomorrow);
          }}
          className='text-xs'>
          Tomorrow
        </Button>
      </div>
    </div>
  );
};

export default DateTimePicker;

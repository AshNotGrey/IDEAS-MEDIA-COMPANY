import React from "react";
import DatePicker from "react-date-picker";
import TimePicker from "react-time-picker";

export default function DateTimePicker({
  date,
  setDate,
  time,
  setTime,
  pickerRef,
  className = "",
}) {
  return (
    <form className={`space-y-4 ${className}`} onSubmit={(e) => e.preventDefault()}>
      <DatePicker
        onChange={setDate}
        value={date}
        ref={pickerRef}
        className='input w-full'
        calendarClassName='bg-white dark:bg-ideas-darkInput rounded shadow-lg'
      />
      <TimePicker onChange={setTime} value={time} className='input w-full' disableClock />
    </form>
  );
}

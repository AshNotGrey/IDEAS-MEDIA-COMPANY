import React, { useState } from "react";
import MakeoverCard from "../components/MakeoverCard";
import BookingSummaryCard from "../components/BookingSummaryCard";
import DateTimePicker from "../components/DateTimePicker";
import ServiceFilterSort from "../components/ServiceFilterSort";
import { useServiceFilters } from "../hooks/useServiceFilters";
import { MAKEOVERS } from "../constants";

export default function MakeoverBooking() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("12:00");

  // Use the service filters hook
  const {
    services: filteredServices,
    availableCategories,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    dateRange,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleDateRangeChange,
    stats,
  } = useServiceFilters(MAKEOVERS);

  const handleSelect = (item) => {
    setSelected(item);
  };

  return (
    <div className='max-w-7xl mx-auto px-gutter py-section'>
      <h1 className='section-title mb-8'>Makeover Bookings</h1>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <ServiceFilterSort
          services={MAKEOVERS}
          onFilterChange={handleFilterChange}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          availableCategories={availableCategories}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          serviceType='makeover'
        />
      </div>

      {/* Results Summary */}
      {stats.hasActiveFilters && (
        <div className='mb-6 p-4 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg'>
          <p className='text-sm text-black/60 dark:text-white/60'>
            Showing {stats.filtered} of {stats.total} makeover services
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Column — Makeover Cards */}
        <div className='space-y-4'>
          {filteredServices.length > 0 ? (
            filteredServices.map((item) => (
              <MakeoverCard key={item.id} service={item} onSelect={handleSelect} />
            ))
          ) : (
            <div className='text-center py-12'>
              <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
                No makeover services found
              </div>
              <p className='text-black/60 dark:text-white/60'>
                Try adjusting your search terms or filters to find the service you need.
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Booking Details */}
        <div className='space-y-6'>
          {selected ? (
            <>
              <div className='card w-full h-fit mb-4'>
                <h2 className='text-xl font-semibold mb-4'>Booking Details</h2>
                <DateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />
              </div>
              <BookingSummaryCard selected={selected} date={date} time={time} />
            </>
          ) : (
            <div className='text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg'>
              <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
                Select a service to book
              </div>
              <p className='text-black/60 dark:text-white/60'>
                Choose a makeover service from the left to start your booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

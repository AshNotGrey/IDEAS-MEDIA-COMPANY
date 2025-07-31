import React, { useState, useRef } from "react";
import MakeoverCard from "../components/MakeoverCard";
import BookingSummaryCard from "../components/BookingSummaryCard";
import DateTimePicker from "../components/DateTimePicker";
import ServiceFilterSort from "../components/ServiceFilterSort";
import { useServiceFilters } from "../hooks/useServiceFilters";

// Enhanced makeover services data
const MAKEOVERS = [
  {
    id: "bridal",
    title: "Bridal Glam",
    description: "For your special day",
    price: 50000,
    category: "bridal",
    duration: "long",
    createdAt: "2024-01-15",
    tags: ["bridal", "wedding", "glamorous"],
  },
  {
    id: "matte",
    title: "Matte Finish",
    description: "Smooth & bold",
    price: 30000,
    category: "casual",
    duration: "short",
    createdAt: "2024-01-10",
    tags: ["matte", "casual", "natural"],
  },
  {
    id: "traditional",
    title: "Traditional Look",
    description: "Cultural richness",
    price: 40000,
    category: "traditional",
    duration: "medium",
    createdAt: "2024-01-20",
    tags: ["traditional", "cultural", "heritage"],
  },
  {
    id: "party",
    title: "Party Glam",
    description: "Perfect for celebrations",
    price: 35000,
    category: "party",
    duration: "medium",
    createdAt: "2024-01-12",
    tags: ["party", "celebration", "glamorous"],
  },
  {
    id: "natural",
    title: "Natural Beauty",
    description: "Enhance your natural features",
    price: 25000,
    category: "natural",
    duration: "short",
    createdAt: "2024-01-08",
    tags: ["natural", "minimal", "everyday"],
  },
  {
    id: "vintage",
    title: "Vintage Glam",
    description: "Classic retro style",
    price: 45000,
    category: "vintage",
    duration: "long",
    createdAt: "2024-01-18",
    tags: ["vintage", "retro", "classic"],
  },
];

export default function MakeoverBooking() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("12:00");
  const pickerRef = useRef(null);

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
    setTimeout(() => pickerRef.current?.focus?.(), 100);
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
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Makeover Cards */}
        <div className='w-full lg:w-1/2 space-y-4'>
          {filteredServices.length > 0 ? (
            filteredServices.map((item) => (
              <MakeoverCard
                key={item.id}
                item={item}
                selectedId={selected?.id}
                onSelect={handleSelect}
              />
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

        {/* Right Panel — Date & Summary */}
        {selected && (
          <>
            <DateTimePicker
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              pickerRef={pickerRef}
            />

            <BookingSummaryCard selected={selected} date={date} time={time} />
          </>
        )}
      </div>
    </div>
  );
}

import React from "react";
import SessionCard from "../components/SessionCard";
import ServiceFilterSort from "../components/ServiceFilterSort";
import { useServiceFilters } from "../hooks/useServiceFilters";

// Enhanced photoshoot services data
const PHOTOSHOOT_SERVICES = [
  {
    id: "outdoor-lifestyle",
    title: "Outdoor Lifestyle Shoot",
    description: "Natural outdoor photography in beautiful locations",
    price: 45000,
    category: "outdoor",
    duration: "medium",
    createdAt: "2024-01-15",
    tags: ["outdoor", "lifestyle", "natural"],
  },
  {
    id: "studio-portrait",
    title: "Studio Portrait Session",
    description: "Professional studio portraits with lighting setup",
    price: 35000,
    category: "studio",
    duration: "short",
    createdAt: "2024-01-10",
    tags: ["studio", "portrait", "professional"],
  },
  {
    id: "family-session",
    title: "Family Photography",
    description: "Capture precious family moments",
    price: 55000,
    category: "family",
    duration: "long",
    createdAt: "2024-01-20",
    tags: ["family", "group", "memories"],
  },
  {
    id: "wedding-engagement",
    title: "Wedding & Engagement",
    description: "Special moments for your big day",
    price: 75000,
    category: "wedding",
    duration: "long",
    createdAt: "2024-01-12",
    tags: ["wedding", "engagement", "romantic"],
  },
  {
    id: "product-photography",
    title: "Product Photography",
    description: "Professional product shots for business",
    price: 25000,
    category: "commercial",
    duration: "short",
    createdAt: "2024-01-08",
    tags: ["product", "commercial", "business"],
  },
  {
    id: "event-coverage",
    title: "Event Coverage",
    description: "Complete event photography coverage",
    price: 65000,
    category: "event",
    duration: "long",
    createdAt: "2024-01-18",
    tags: ["event", "coverage", "celebration"],
  },
];

/**
 * PhotoshootBookings page component.
 * Renders a photoshoot booking list with search, filter, and sort functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered PhotoshootBookings page.
 */
const PhotoshootBookings = () => {
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
  } = useServiceFilters(PHOTOSHOOT_SERVICES);

  return (
    <section className='max-w-7xl mx-auto px-gutter py-section'>
      <header className='mb-8 text-center'>
        <h1 className='section-title mb-2'>Photoshoot Bookings</h1>
        <p className='text-black/60 dark:text-white/60 max-w-xl mx-auto'>
          Browse and book professional photoshoot sessions. Filter by type, price, and availability.
        </p>
      </header>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <ServiceFilterSort
          services={PHOTOSHOOT_SERVICES}
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
          serviceType='photoshoot'
        />
      </div>

      {/* Results Summary */}
      {stats.hasActiveFilters && (
        <div className='mb-6 p-4 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg'>
          <p className='text-sm text-black/60 dark:text-white/60'>
            Showing {stats.filtered} of {stats.total} photoshoot services
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredServices.map((service) => (
            <SessionCard
              key={service.id}
              {...service}
              onRebook={() => alert(`Booking ${service.title} triggered!`)}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
            No photoshoot services found
          </div>
          <p className='text-black/60 dark:text-white/60'>
            Try adjusting your search terms or filters to find the service you need.
          </p>
        </div>
      )}
    </section>
  );
};

export default PhotoshootBookings;

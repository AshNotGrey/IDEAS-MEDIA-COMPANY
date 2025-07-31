import React from "react";
import ServiceFilterSort from "../components/ServiceFilterSort";
import { useServiceFilters } from "../hooks/useServiceFilters";

// Enhanced event coverage services data
const EVENT_SERVICES = [
  {
    id: "wedding-coverage",
    title: "Wedding Photography",
    description: "Complete wedding day coverage with professional editing",
    price: 150000,
    category: "wedding",
    duration: "long",
    createdAt: "2024-01-15",
    tags: ["wedding", "ceremony", "reception"],
  },
  {
    id: "corporate-event",
    title: "Corporate Events",
    description: "Professional coverage for business events and conferences",
    price: 80000,
    category: "corporate",
    duration: "medium",
    createdAt: "2024-01-10",
    tags: ["corporate", "business", "professional"],
  },
  {
    id: "birthday-party",
    title: "Birthday Celebrations",
    description: "Capture special birthday moments and celebrations",
    price: 45000,
    category: "celebration",
    duration: "short",
    createdAt: "2024-01-20",
    tags: ["birthday", "celebration", "party"],
  },
  {
    id: "graduation-ceremony",
    title: "Graduation Ceremony",
    description: "Document your academic achievements",
    price: 60000,
    category: "graduation",
    duration: "medium",
    createdAt: "2024-01-12",
    tags: ["graduation", "academic", "achievement"],
  },
  {
    id: "product-launch",
    title: "Product Launch Events",
    description: "Professional coverage for product launches and exhibitions",
    price: 95000,
    category: "commercial",
    duration: "medium",
    createdAt: "2024-01-08",
    tags: ["product", "launch", "commercial"],
  },
  {
    id: "anniversary-celebration",
    title: "Anniversary Celebrations",
    description: "Capture milestone anniversary moments",
    price: 70000,
    category: "celebration",
    duration: "medium",
    createdAt: "2024-01-18",
    tags: ["anniversary", "celebration", "milestone"],
  },
];

/**
 * EventCoverage page component.
 * Renders event coverage services with search, filter, and sort functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered EventCoverage page.
 */
const EventCoverage = () => {
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
  } = useServiceFilters(EVENT_SERVICES);

  return (
    <section className='max-w-7xl mx-auto px-gutter py-section'>
      <header className='mb-8 text-center'>
        <h1 className='section-title mb-2'>Event Coverage</h1>
        <p className='text-black/60 dark:text-white/60 max-w-xl mx-auto'>
          Professional event photography coverage for all your special occasions.
        </p>
      </header>

      {/* Hero Section */}
      <div className='bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg text-center transition-shadow hover:shadow-md mb-8'>
        <div className='mb-4 h-48 bg-gradient-to-r from-ideas-accent to-ideas-accentHover rounded flex items-center justify-center'>
          <div className='text-white text-center'>
            <h2 className='text-2xl font-bold mb-2'>Professional Event Coverage</h2>
            <p className='text-lg'>From weddings to corporate events, we capture every moment</p>
          </div>
        </div>
      </div>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <ServiceFilterSort
          services={EVENT_SERVICES}
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
          serviceType='event'
        />
      </div>

      {/* Results Summary */}
      {stats.hasActiveFilters && (
        <div className='mb-6 p-4 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg'>
          <p className='text-sm text-black/60 dark:text-white/60'>
            Showing {stats.filtered} of {stats.total} event coverage services
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className='bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg transition-shadow hover:shadow-md p-6'>
              <h3 className='text-lg font-semibold mb-2'>{service.title}</h3>
              <p className='text-black/60 dark:text-white/60 mb-4'>{service.description}</p>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-bold'>₦{service.price.toLocaleString()}</span>
                <button
                  className='bg-ideas-accent text-white px-4 py-2 rounded-lg hover:bg-ideas-accentHover transition-colors'
                  onClick={() => alert(`Booking ${service.title} triggered!`)}>
                  Book Now
                </button>
              </div>
              <div className='mt-3 flex flex-wrap gap-1'>
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className='text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
            No event coverage services found
          </div>
          <p className='text-black/60 dark:text-white/60'>
            Try adjusting your search terms or filters to find the service you need.
          </p>
        </div>
      )}
    </section>
  );
};

export default EventCoverage;

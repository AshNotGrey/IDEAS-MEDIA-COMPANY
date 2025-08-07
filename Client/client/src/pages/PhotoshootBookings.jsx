import React, { useState } from "react";
import PhotoshootCard from "../components/PhotoshootCard";
import BookingSummaryCard from "../components/BookingSummaryCard";
import DateTimePicker from "../components/DateTimePicker";
import ServiceFilterSort from "../components/ServiceFilterSort";
import ServiceDetailsModal from "../components/ServiceDetailsModal";
import Pagination from "../components/Pagination";
import { useServiceFilters } from "../hooks/useServiceFilters";
import { useResponsivePagination } from "../hooks/useResponsivePagination";
import { PHOTOSHOOTS } from "../constants";

export default function PhotoshootBookings() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("12:00");

  // Modal state for service details
  const [modalService, setModalService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get responsive items per page
  const itemsPerPage = useResponsivePagination();

  // Use the service filters hook
  const {
    services: filteredServices,
    availableCategories,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    dateRange,
    currentPage,
    totalPages,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleDateRangeChange,
    handlePageChange,
    stats,
  } = useServiceFilters(PHOTOSHOOTS, itemsPerPage);

  const handleSelect = (item) => {
    setSelected(item);
  };

  const handleViewDetails = (service) => {
    setModalService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalService(null);
  };

  const handleBookFromModal = (service) => {
    setSelected(service);
    setIsModalOpen(false);
    setModalService(null);
  };

  return (
    <div className='max-w-7xl mx-auto px-gutter py-section'>
      <h1 className='section-title mb-8'>Photoshoot Bookings</h1>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <ServiceFilterSort
          services={PHOTOSHOOTS}
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

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
        {/* Left Column — Photoshoot Cards */}
        <div className='lg:col-span-2'>
          {filteredServices.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6'>
                {filteredServices.map((item) => (
                  <PhotoshootCard
                    key={item.id}
                    service={item}
                    onSelect={handleSelect}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className='mt-8'>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={stats.filtered}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
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
        </div>

        {/* Right Column — Booking Details */}
        <div className='lg:col-span-1'>
          <div className='sticky top-8 space-y-6'>
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
                  Choose a photoshoot service to start your booking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={modalService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBook={handleBookFromModal}
      />
    </div>
  );
}

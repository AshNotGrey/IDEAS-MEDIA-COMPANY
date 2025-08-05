import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import RentalBookingCard from "../components/RentalBookingCard";
import RentalDateTimePicker from "../components/RentalDateTimePicker";
import FilterSortSearch from "../components/FilterSortSearch";
import Pagination from "../components/Pagination";
import { useProductFilters } from "../hooks/useProductFilters";
import { useResponsivePagination } from "../hooks/useResponsivePagination";
import { DUMMY_PRODUCTS } from "../constants";

/**
 * EquipmentRentals page component.
 * Renders a grid of equipment rental products with search, filter, and sort functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered EquipmentRentals page.
 */
const EquipmentRentals = () => {
  const navigate = useNavigate();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [endDate, setEndDate] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  });
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("17:00");

  // Filter to only show equipment (cameras, lenses, lighting)
  const equipmentProducts = DUMMY_PRODUCTS.filter((product) =>
    ["cameras", "lenses", "lighting"].includes(product.category)
  );

  // Get responsive items per page
  const itemsPerPage = useResponsivePagination();

  // Use the product filters hook
  const {
    products: filteredProducts,
    availableCategories,
    availableTags,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    priceRange,
    currentPage,
    totalPages,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handlePriceRangeChange,
    handlePageChange,
    stats,
  } = useProductFilters(equipmentProducts, itemsPerPage);

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleSelectEquipment = (product) => {
    setSelectedEquipment(product);
  };

  return (
    <div className='max-w-7xl mx-auto px-gutter py-section'>
      <h1 className='section-title mb-8'>Equipment Rentals</h1>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <FilterSortSearch
          products={equipmentProducts}
          onFilterChange={handleFilterChange}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          availableCategories={availableCategories}
          availableTags={availableTags}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
        />
      </div>

      {/* Results Summary */}
      {stats.hasActiveFilters && (
        <div className='mb-6 p-4 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg'>
          <p className='text-sm text-black/60 dark:text-white/60'>
            Showing {stats.filtered} of {stats.total} equipment items
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8'>
        {/* Left Column — Equipment Grid */}
        <div className='space-y-6'>
          {filteredProducts.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6'>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onViewDetails={() => handleViewDetails(product)}
                    onAddToCart={() => handleSelectEquipment(product)}
                    isRental={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={stats.filtered}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className='text-center py-12'>
              <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
                No equipment found
              </div>
              <p className='text-black/60 dark:text-white/60'>
                Try adjusting your search terms or filters to find the equipment you need.
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Rental Booking */}
        <div className='space-y-6'>
          {selectedEquipment ? (
            <>
              <div className='card w-full h-fit'>
                <h2 className='text-xl font-semibold mb-4'>Rental Details</h2>
                <RentalDateTimePicker
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  pickupTime={pickupTime}
                  setPickupTime={setPickupTime}
                  returnTime={returnTime}
                  setReturnTime={setReturnTime}
                />
              </div>
              <RentalBookingCard
                selected={selectedEquipment}
                startDate={startDate}
                endDate={endDate}
                pickupTime={pickupTime}
                returnTime={returnTime}
              />
            </>
          ) : (
            <div className='text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg'>
              <div className='text-black/60 dark:text-white/60 text-lg mb-2'>
                Select equipment to rent
              </div>
              <p className='text-black/60 dark:text-white/60'>
                Choose equipment from the left to configure your rental dates and times.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentRentals;

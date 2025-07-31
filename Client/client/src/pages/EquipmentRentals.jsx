import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FilterSortSearch from "../components/FilterSortSearch";
import Pagination from "../components/Pagination";
import { useProductFilters } from "../hooks/useProductFilters";
import { DUMMY_PRODUCTS } from "../constants";
import { useCart } from "../utils/useCart";

/**
 * EquipmentRentals page component.
 * Renders a grid of equipment rental products with search, filter, and sort functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered EquipmentRentals page.
 */
const EquipmentRentals = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Filter to only show equipment (cameras, lenses, lighting)
  const equipmentProducts = DUMMY_PRODUCTS.filter((product) =>
    ["cameras", "lenses", "lighting"].includes(product.category)
  );

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
  } = useProductFilters(equipmentProducts);

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = (product) => {
    addItem({
      ...product,
      quantity: 1,
    });
  };

  return (
    <section className='max-w-7xl mx-auto px-4 py-section'>
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

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onViewDetails={() => handleViewDetails(product)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className='mt-8'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={stats.filtered}
              itemsPerPage={12}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className='text-center py-12'>
          <div className='text-black/60 dark:text-white/60 text-lg mb-2'>No equipment found</div>
          <p className='text-black/60 dark:text-white/60'>
            Try adjusting your search terms or filters to find the equipment you need.
          </p>
        </div>
      )}
    </section>
  );
};

export default EquipmentRentals;

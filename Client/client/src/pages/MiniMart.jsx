import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FilterSortSearch from "../components/FilterSortSearch";
import Pagination from "../components/Pagination";
import { useProductFilters } from "../hooks/useProductFilters";
import { useResponsivePagination } from "../hooks/useResponsivePagination";
import { DUMMY_PRODUCTS } from "../constants";
import { useCart } from "../utils/useCart";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * MiniMart page component.
 * Renders a grid of product cards with search, filter, and sort functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered MiniMart page.
 */
const MiniMart = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();

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
  } = useProductFilters(DUMMY_PRODUCTS, itemsPerPage);

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
    <div className='max-w-7xl mx-auto px-gutter py-section'>
      <motion.h1
        className='section-title mb-8'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        Mini Mart
      </motion.h1>

      {/* Filter, Sort, and Search */}
      <div className='mb-8'>
        <FilterSortSearch
          products={DUMMY_PRODUCTS}
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
            Showing {stats.filtered} of {stats.total} products
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <motion.div
            className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6'
            variants={containerVariants}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}>
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  {...product}
                  onViewDetails={() => handleViewDetails(product)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              </motion.div>
            ))}
          </motion.div>

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
          <div className='text-black/60 dark:text-white/60 text-lg mb-2'>No products found</div>
          <p className='text-black/60 dark:text-white/60'>
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default MiniMart;

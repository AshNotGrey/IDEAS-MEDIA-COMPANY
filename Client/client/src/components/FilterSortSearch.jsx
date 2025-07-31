import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, X, ChevronDown } from "lucide-react";
import Button from "./Button";

/**
 * FilterSortSearch Component
 *
 * A comprehensive component that provides search, sort, and filter functionality
 * for product listings. Includes responsive design and theme compliance.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products to filter/sort
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Object} props.filters - Current filter state
 * @param {string} props.sortBy - Current sort field
 * @param {string} props.sortOrder - Current sort order (asc/desc)
 * @param {Function} props.onSortChange - Callback when sort changes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {Array} props.availableCategories - Available categories for filtering
 * @param {Array} props.availableTags - Available tags for filtering
 * @param {Object} props.priceRange - Price range filter {min, max}
 * @param {Function} props.onPriceRangeChange - Callback when price range changes
 * @returns {JSX.Element} Rendered filter/sort/search component
 */
const FilterSortSearch = ({
  products = [],
  onFilterChange,
  filters = {},
  sortBy = "latest",
  sortOrder = "desc",
  onSortChange,
  searchTerm = "",
  onSearchChange,
  availableCategories = [],
  availableTags = [],
  priceRange = { min: 0, max: 10000 },
  onPriceRangeChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        onSearchChange(localSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, onSearchChange]);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (type, value) => {
    const newRange = { ...localPriceRange, [type]: value };
    setLocalPriceRange(newRange);
    onPriceRangeChange(newRange);
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    setLocalPriceRange({ min: 0, max: 10000 });
    onFilterChange(clearedFilters);
    onPriceRangeChange({ min: 0, max: 10000 });
  };

  const hasActiveFilters =
    Object.keys(localFilters).length > 0 || localPriceRange.min > 0 || localPriceRange.max < 10000;

  const sortOptions = [
    { value: "latest", label: "Latest", icon: SortDesc },
    { value: "rating", label: "Rating", icon: SortDesc },
    { value: "name-asc", label: "A-Z", icon: SortAsc },
    { value: "name-desc", label: "Z-A", icon: SortDesc },
    { value: "price-asc", label: "Price: Low to High", icon: SortAsc },
    { value: "price-desc", label: "Price: High to Low", icon: SortDesc },
    { value: "reviews", label: "Most Reviews", icon: SortDesc },
  ];

  const getProductStats = () => {
    const filteredProducts = products.filter((product) => {
      // Apply search filter
      if (localSearchTerm && !product.title.toLowerCase().includes(localSearchTerm.toLowerCase())) {
        return false;
      }

      // Apply category filter
      if (localFilters.category && product.category !== localFilters.category) {
        return false;
      }

      // Apply tag filter
      if (localFilters.tags && localFilters.tags.length > 0) {
        const productTags = product.tags || [];
        if (!localFilters.tags.some((tag) => productTags.includes(tag))) {
          return false;
        }
      }

      // Apply price range filter
      if (product.price < localPriceRange.min || product.price > localPriceRange.max) {
        return false;
      }

      // Apply availability filter
      if (localFilters.availability === "in-stock" && product.stock === 0) {
        return false;
      }

      return true;
    });

    return {
      total: products.length,
      filtered: filteredProducts.length,
    };
  };

  const stats = getProductStats();

  return (
    <div className='w-full space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5' />
        <input
          type='text'
          placeholder='Search products...'
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        {/* Results Count */}
        <div className='text-sm text-black/60 dark:text-white/60'>
          Showing {stats.filtered} of {stats.total} products
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          {/* Filter Button */}
          <Button
            variant='text'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='flex items-center gap-2'
            size='sm'>
            <Filter className='w-4 h-4' />
            Filters
            {hasActiveFilters && (
              <span className='bg-ideas-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {Object.keys(localFilters).length +
                  (localPriceRange.min > 0 || localPriceRange.max < 10000 ? 1 : 0)}
              </span>
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className='relative'>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                onSortChange(field, order);
              }}
              className='appearance-none bg-ideas-lightInput dark:bg-ideas-darkInput border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-transparent cursor-pointer'>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 dark:text-white/60 w-4 h-4 pointer-events-none' />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className='bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Filters</h3>
            <div className='flex items-center gap-2'>
              {hasActiveFilters && (
                <Button
                  variant='text'
                  onClick={clearAllFilters}
                  size='sm'
                  className='text-red-600 hover:text-red-700'>
                  Clear All
                </Button>
              )}
              <Button variant='text' onClick={() => setIsFilterOpen(false)} size='sm'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className='font-medium mb-3'>Category</h4>
              <div className='space-y-2'>
                {availableCategories.map((category) => (
                  <label key={category} className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='category'
                      value={category}
                      checked={localFilters.category === category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className='text-ideas-accent focus:ring-ideas-accent'
                    />
                    <span className='text-sm capitalize'>{category}</span>
                  </label>
                ))}
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='category'
                    value=''
                    checked={!localFilters.category}
                    onChange={() => handleFilterChange("category", "")}
                    className='text-ideas-accent focus:ring-ideas-accent'
                  />
                  <span className='text-sm'>All Categories</span>
                </label>
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <h4 className='font-medium mb-3'>Tags</h4>
              <div className='flex flex-wrap gap-2'>
                {availableTags.map((tag) => (
                  <label key={tag} className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={localFilters.tags?.includes(tag) || false}
                      onChange={(e) => {
                        const currentTags = localFilters.tags || [];
                        const newTags = e.target.checked
                          ? [...currentTags, tag]
                          : currentTags.filter((t) => t !== tag);
                        handleFilterChange("tags", newTags);
                      }}
                      className='text-ideas-accent focus:ring-ideas-accent'
                    />
                    <span className='text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded'>
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <h4 className='font-medium mb-3'>Price Range</h4>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>
                  Min Price
                </label>
                <input
                  type='number'
                  value={localPriceRange.min}
                  onChange={(e) => handlePriceRangeChange("min", Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                  placeholder='0'
                />
              </div>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>
                  Max Price
                </label>
                <input
                  type='number'
                  value={localPriceRange.max}
                  onChange={(e) => handlePriceRangeChange("max", Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                  placeholder='10000'
                />
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h4 className='font-medium mb-3'>Availability</h4>
            <div className='space-y-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='availability'
                  value=''
                  checked={!localFilters.availability}
                  onChange={() => handleFilterChange("availability", "")}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>All Items</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='availability'
                  value='in-stock'
                  checked={localFilters.availability === "in-stock"}
                  onChange={(e) => handleFilterChange("availability", e.target.value)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>In Stock Only</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSortSearch;

import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, X, ChevronDown, Calendar, Clock } from "lucide-react";
import Button from "./Button";

/**
 * ServiceFilterSort Component
 *
 * A specialized filter component for service booking pages (makeover, photoshoot, events)
 * with date/time filtering and service-specific options.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.services - Array of services to filter/sort
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Object} props.filters - Current filter state
 * @param {string} props.sortBy - Current sort field
 * @param {string} props.sortOrder - Current sort order (asc/desc)
 * @param {Function} props.onSortChange - Callback when sort changes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {Array} props.availableCategories - Available service categories
 * @param {Object} props.dateRange - Date range filter {start, end}
 * @param {Function} props.onDateRangeChange - Callback when date range changes
 * @param {string} props.serviceType - Type of service (makeover, photoshoot, event)
 * @returns {JSX.Element} Rendered service filter/sort component
 */
const ServiceFilterSort = ({
  services = [],
  onFilterChange,
  filters = {},
  sortBy = "latest",
  sortOrder = "desc",
  onSortChange,
  searchTerm = "",
  onSearchChange,
  availableCategories = [],
  dateRange = { start: "", end: "" },
  onDateRangeChange,
  serviceType = "service",
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localDateRange, setLocalDateRange] = useState(dateRange);

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
    setLocalDateRange(dateRange);
  }, [dateRange]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (type, value) => {
    const newRange = { ...localDateRange, [type]: value };
    setLocalDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    setLocalDateRange({ start: "", end: "" });
    onFilterChange(clearedFilters);
    onDateRangeChange({ start: "", end: "" });
  };

  const hasActiveFilters =
    Object.keys(localFilters).length > 0 || localDateRange.start || localDateRange.end;

  const sortOptions = [
    { value: "latest", label: "Latest", icon: SortDesc },
    { value: "price-asc", label: "Price: Low to High", icon: SortAsc },
    { value: "price-desc", label: "Price: High to Low", icon: SortDesc },
    { value: "name-asc", label: "A-Z", icon: SortAsc },
    { value: "name-desc", label: "Z-A", icon: SortDesc },
    { value: "duration", label: "Duration", icon: SortAsc },
  ];

  const getServiceStats = () => {
    const filteredServices = services.filter((service) => {
      // Apply search filter
      if (localSearchTerm && !service.title.toLowerCase().includes(localSearchTerm.toLowerCase())) {
        return false;
      }

      // Apply category filter
      if (localFilters.category && service.category !== localFilters.category) {
        return false;
      }

      // Apply price range filter
      if (localFilters.minPrice && service.price < localFilters.minPrice) {
        return false;
      }
      if (localFilters.maxPrice && service.price > localFilters.maxPrice) {
        return false;
      }

      // Apply duration filter
      if (localFilters.duration && service.duration !== localFilters.duration) {
        return false;
      }

      return true;
    });

    return {
      total: services.length,
      filtered: filteredServices.length,
    };
  };

  const stats = getServiceStats();

  return (
    <div className='w-full space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5' />
        <input
          type='text'
          placeholder={`Search ${serviceType} services...`}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        {/* Results Count */}
        <div className='text-sm text-black/60 dark:text-white/60'>
          Showing {stats.filtered} of {stats.total} {serviceType} services
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          {/* Filter Button */}
          <Button
            variant='secondary'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='flex items-center gap-2'
            size='sm'>
            <Filter className='w-4 h-4' />
            Filters
            {hasActiveFilters && (
              <span className='bg-ideas-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {Object.keys(localFilters).length +
                  (localDateRange.start || localDateRange.end ? 1 : 0)}
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
                  variant='ghost'
                  onClick={clearAllFilters}
                  size='sm'
                  className='text-red-600 hover:text-red-700'>
                  Clear All
                </Button>
              )}
              <Button variant='ghost' onClick={() => setIsFilterOpen(false)} size='sm'>
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
                  value={localFilters.minPrice || ""}
                  onChange={(e) => handleFilterChange("minPrice", Number(e.target.value) || "")}
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
                  value={localFilters.maxPrice || ""}
                  onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value) || "")}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                  placeholder='100000'
                />
              </div>
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <h4 className='font-medium mb-3'>Duration</h4>
            <div className='space-y-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='duration'
                  value=''
                  checked={!localFilters.duration}
                  onChange={() => handleFilterChange("duration", "")}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Any Duration</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='duration'
                  value='short'
                  checked={localFilters.duration === "short"}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Short (1-2 hours)</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='duration'
                  value='medium'
                  checked={localFilters.duration === "medium"}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Medium (3-4 hours)</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='duration'
                  value='long'
                  checked={localFilters.duration === "long"}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Long (5+ hours)</span>
              </label>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h4 className='font-medium mb-3 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              Available Dates
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>From</label>
                <input
                  type='date'
                  value={localDateRange.start}
                  onChange={(e) => handleDateRangeChange("start", e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                />
              </div>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>To</label>
                <input
                  type='date'
                  value={localDateRange.end}
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFilterSort;

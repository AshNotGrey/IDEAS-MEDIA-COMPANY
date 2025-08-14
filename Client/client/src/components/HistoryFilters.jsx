import React, { useState } from "react";
import { Search, Filter, Calendar, DollarSign, ChevronDown, X } from "lucide-react";
import Button from "./Button";

/**
 * HistoryFilters Component
 *
 * Provides filtering and search functionality for the history page
 */
const HistoryFilters = ({ filters, onFiltersChange, stats }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      type: "all",
      status: "all",
      dateRange: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      hasReceipts: false,
      needsReview: false,
      sortBy: "newest",
    });
    setIsFilterOpen(false);
  };

  const typeOptions = [
    { value: "all", label: "All Types", count: stats?.total || 0 },
    { value: "rental", label: "Equipment Rentals", count: stats?.byType?.rental || 0 },
    { value: "photoshoot", label: "Photoshoots", count: stats?.byType?.photoshoot || 0 },
    { value: "makeover", label: "Makeovers", count: stats?.byType?.makeover || 0 },
    { value: "shop", label: "Shop Orders", count: stats?.byType?.shop || 0 },
  ];

  const statusOptions = [
    { value: "all", label: "All Status", count: stats?.total || 0 },
    { value: "completed", label: "Completed", count: stats?.byStatus?.completed || 0 },
    { value: "upcoming", label: "Upcoming", count: stats?.byStatus?.upcoming || 0 },
    { value: "cancelled", label: "Cancelled", count: stats?.byStatus?.cancelled || 0 },
    { value: "refunded", label: "Refunded", count: stats?.byStatus?.refunded || 0 },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisYear", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount_high", label: "Amount: High to Low" },
    { value: "amount_low", label: "Amount: Low to High" },
  ];

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "search") return value.trim() !== "";
    if (key === "type") return value !== "all";
    if (key === "status") return value !== "all";
    if (key === "dateRange") return value !== "all";
    if (key === "sortBy") return value !== "newest";
    if (typeof value === "boolean") return value;
    return value !== "" && value !== undefined && value !== null;
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search?.trim()) count++;
    if (filters.type !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    if (filters.hasReceipts) count++;
    if (filters.needsReview) count++;
    return count;
  };

  return (
    <div className='w-full space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5' />
        <input
          type='text'
          placeholder='Search by reference, item name...'
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange("search", "")}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 dark:text-white/60 hover:text-ideas-accent'>
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        {/* Results Count */}
        <div className='text-sm text-black/60 dark:text-white/60'>
          Showing {stats?.filtered || stats?.total || 0} of {stats?.total || 0} transactions
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
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className='relative'>
            <select
              value={filters.sortBy || "newest"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
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
                  onClick={handleClearFilters}
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Transaction Type Filter */}
            <div>
              <h4 className='font-medium mb-3'>Transaction Type</h4>
              <div className='space-y-2'>
                {typeOptions.map((option) => (
                  <label key={option.value} className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='type'
                      value={option.value}
                      checked={
                        filters.type === option.value || (!filters.type && option.value === "all")
                      }
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className='text-ideas-accent focus:ring-ideas-accent'
                    />
                    <span className='text-sm'>
                      {option.label} ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className='font-medium mb-3'>Status</h4>
              <div className='space-y-2'>
                {statusOptions.map((option) => (
                  <label key={option.value} className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='status'
                      value={option.value}
                      checked={
                        filters.status === option.value ||
                        (!filters.status && option.value === "all")
                      }
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className='text-ideas-accent focus:ring-ideas-accent'
                    />
                    <span className='text-sm'>
                      {option.label} ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h4 className='font-medium mb-3'>
                <Calendar className='w-4 h-4 inline mr-1' />
                Date Range
              </h4>
              <div className='space-y-3'>
                <select
                  value={filters.dateRange || "all"}
                  onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'>
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Custom Date Range */}
                {filters.dateRange === "custom" && (
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-xs text-black/60 dark:text-white/60 mb-1'>
                        Start Date
                      </label>
                      <input
                        type='date'
                        value={filters.startDate || ""}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-black/60 dark:text-white/60 mb-1'>
                        End Date
                      </label>
                      <input
                        type='date'
                        value={filters.endDate || ""}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Range Filter */}
          <div>
            <h4 className='font-medium mb-3'>
              <DollarSign className='w-4 h-4 inline mr-1' />
              Amount Range (₦)
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>
                  Min Amount
                </label>
                <input
                  type='number'
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : "")
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                  placeholder='0'
                />
              </div>
              <div>
                <label className='block text-sm text-black/60 dark:text-white/60 mb-1'>
                  Max Amount
                </label>
                <input
                  type='number'
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : "")
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-ideas-lightInput dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent'
                  placeholder='No limit'
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h4 className='font-medium mb-3'>Additional Options</h4>
            <div className='flex flex-wrap gap-4'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.hasReceipts || false}
                  onChange={(e) => handleFilterChange("hasReceipts", e.target.checked)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Has Receipts</span>
              </label>

              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.needsReview || false}
                  onChange={(e) => handleFilterChange("needsReview", e.target.checked)}
                  className='text-ideas-accent focus:ring-ideas-accent'
                />
                <span className='text-sm'>Needs Review</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2'>
          {filters.search && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-ideas-accent/10 text-ideas-accent rounded-full text-sm'>
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange("search", "")}
                className='hover:text-ideas-accentHover'>
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.type !== "all" && filters.type && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-ideas-accent/10 text-ideas-accent rounded-full text-sm'>
              Type: {typeOptions.find((o) => o.value === filters.type)?.label}
              <button
                onClick={() => handleFilterChange("type", "all")}
                className='hover:text-ideas-accentHover'>
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.status !== "all" && filters.status && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-ideas-accent/10 text-ideas-accent rounded-full text-sm'>
              Status: {statusOptions.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange("status", "all")}
                className='hover:text-ideas-accentHover'>
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.dateRange !== "all" && filters.dateRange && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-ideas-accent/10 text-ideas-accent rounded-full text-sm'>
              Date: {dateRangeOptions.find((o) => o.value === filters.dateRange)?.label}
              <button
                onClick={() => handleFilterChange("dateRange", "all")}
                className='hover:text-ideas-accentHover'>
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-ideas-accent/10 text-ideas-accent rounded-full text-sm'>
              Amount: ₦{filters.minAmount || 0} - ₦{filters.maxAmount || "∞"}
              <button
                onClick={() => {
                  handleFilterChange("minAmount", "");
                  handleFilterChange("maxAmount", "");
                }}
                className='hover:text-ideas-accentHover'>
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  ChevronDown,
  X,
  TrendingUp,
  Clock,
  Tag,
} from "lucide-react";
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
    { value: "all", label: "All Types", count: stats?.total || 0, icon: Tag },
    { value: "rental", label: "Equipment Rentals", count: stats?.byType?.rental || 0, icon: Tag },
    { value: "photoshoot", label: "Photoshoots", count: stats?.byType?.photoshoot || 0, icon: Tag },
    { value: "makeover", label: "Makeovers", count: stats?.byType?.makeover || 0, icon: Tag },
    { value: "shop", label: "Shop Orders", count: stats?.byType?.shop || 0, icon: Tag },
  ];

  const statusOptions = [
    { value: "all", label: "All Status", count: stats?.total || 0, icon: Clock },
    { value: "completed", label: "Completed", count: stats?.byStatus?.completed || 0, icon: Clock },
    { value: "upcoming", label: "Upcoming", count: stats?.byStatus?.upcoming || 0, icon: Clock },
    { value: "cancelled", label: "Cancelled", count: stats?.byStatus?.cancelled || 0, icon: Clock },
    { value: "refunded", label: "Refunded", count: stats?.byStatus?.refunded || 0, icon: Clock },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisYear", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: TrendingUp },
    { value: "oldest", label: "Oldest First", icon: TrendingUp },
    { value: "amount_high", label: "Amount: High to Low", icon: TrendingUp },
    { value: "amount_low", label: "Amount: Low to High", icon: TrendingUp },
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
    <div className='w-full space-y-6'>
      {/* Search Bar */}
      <div className='relative group'>
        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
          <Search className='w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-ideas-accent transition-colors duration-200' />
        </div>
        <input
          type='text'
          placeholder='Search by reference, item name, or description...'
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className='w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange("search", "")}
            className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200'>
            <X className='w-5 h-5' />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        {/* Results Count */}
        <div className='flex items-center gap-2 text-sm'>
          <div className='w-2 h-2 bg-ideas-accent rounded-full'></div>
          <span className='text-gray-600 dark:text-gray-400'>
            Showing{" "}
            <span className='font-semibold text-ideas-black dark:text-ideas-white'>
              {stats?.filtered || stats?.total || 0}
            </span>{" "}
            of{" "}
            <span className='font-semibold text-ideas-black dark:text-ideas-white'>
              {stats?.total || 0}
            </span>{" "}
            transactions
          </span>
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
          {/* Filter Button */}
          <Button
            variant='text'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='flex items-center gap-2 group hover:shadow-lg transition-all duration-200'
            size='md'>
            <Filter className='w-4 h-4' />
            Filters
            {hasActiveFilters && (
              <span className='bg-ideas-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse'>
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className='relative group'>
            <select
              value={filters.sortBy || "newest"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className='appearance-none w-full sm:w-auto bg-white dark:bg-ideas-darkInput border-2 border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 pr-12 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent cursor-pointer shadow-sm hover:shadow-md transition-all duration-200'>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none group-hover:text-ideas-accent transition-colors duration-200' />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className='bg-white dark:bg-ideas-darkInput border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 space-y-8 shadow-lg dark:shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-ideas-accent to-ideas-accentLight rounded-xl flex items-center justify-center'>
                <Filter className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-ideas-black dark:text-ideas-white'>
                  Advanced Filters
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Refine your search results
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {hasActiveFilters && (
                <Button
                  variant='text'
                  onClick={handleClearFilters}
                  size='sm'
                  className='text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-all duration-200'>
                  Clear All
                </Button>
              )}
              <Button
                variant='text'
                onClick={() => setIsFilterOpen(false)}
                size='sm'
                className='hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-all duration-200'>
                <X className='w-5 h-5' />
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
            {/* Transaction Type Filter */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Tag className='w-5 h-5 text-ideas-accent' />
                <h4 className='font-semibold text-ideas-black dark:text-ideas-white'>
                  Transaction Type
                </h4>
              </div>
              <div className='space-y-3'>
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className='flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-all duration-200'>
                    <input
                      type='radio'
                      name='type'
                      value={option.value}
                      checked={
                        filters.type === option.value || (!filters.type && option.value === "all")
                      }
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className='w-4 h-4 text-ideas-accent focus:ring-ideas-accent focus:ring-2 focus:ring-offset-2'
                    />
                    <span className='text-sm flex-1'>{option.label}</span>
                    <span className='text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full font-medium'>
                      {option.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Clock className='w-5 h-5 text-ideas-accent' />
                <h4 className='font-semibold text-ideas-black dark:text-ideas-white'>Status</h4>
              </div>
              <div className='space-y-3'>
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className='flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-all duration-200'>
                    <input
                      type='radio'
                      name='status'
                      value={option.value}
                      checked={
                        filters.status === option.value ||
                        (!filters.status && option.value === "all")
                      }
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className='w-4 h-4 text-ideas-accent focus:ring-ideas-accent focus:ring-2 focus:ring-offset-2'
                    />
                    <span className='text-sm flex-1'>{option.label}</span>
                    <span className='text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full font-medium'>
                      {option.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Calendar className='w-5 h-5 text-ideas-accent' />
                <h4 className='font-semibold text-ideas-black dark:text-ideas-white'>Date Range</h4>
              </div>
              <div className='space-y-4'>
                <select
                  value={filters.dateRange || "all"}
                  onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'>
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Custom Date Range */}
                {filters.dateRange === "custom" && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Start Date
                      </label>
                      <input
                        type='date'
                        value={filters.startDate || ""}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                        End Date
                      </label>
                      <input
                        type='date'
                        value={filters.endDate || ""}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Range Filter */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-5 h-5 text-ideas-accent' />
              <h4 className='font-semibold text-ideas-black dark:text-ideas-white'>
                Amount Range (₦)
              </h4>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Minimum Amount
                </label>
                <input
                  type='number'
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : "")
                  }
                  className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'
                  placeholder='0'
                />
              </div>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Maximum Amount
                </label>
                <input
                  type='number'
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : "")
                  }
                  className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-ideas-darkInput text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ideas-accent focus:border-ideas-accent transition-all duration-200 shadow-sm hover:shadow-md'
                  placeholder='No limit'
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-ideas-black dark:text-ideas-white'>
              Additional Options
            </h4>
            <div className='flex flex-wrap gap-6'>
              <label className='flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-all duration-200'>
                <input
                  type='checkbox'
                  checked={filters.hasReceipts || false}
                  onChange={(e) => handleFilterChange("hasReceipts", e.target.checked)}
                  className='w-4 h-4 text-ideas-accent focus:ring-ideas-accent focus:ring-2 focus:ring-offset-2 rounded'
                />
                <span className='text-sm font-medium text-ideas-black dark:text-ideas-white'>
                  Has Receipts
                </span>
              </label>

              <label className='flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-all duration-200'>
                <input
                  type='checkbox'
                  checked={filters.needsReview || false}
                  onChange={(e) => handleFilterChange("needsReview", e.target.checked)}
                  className='w-4 h-4 text-ideas-accent focus:ring-ideas-accent focus:ring-2 focus:ring-offset-2 rounded'
                />
                <span className='text-sm font-medium text-ideas-black dark:text-ideas-white'>
                  Needs Review
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-3'>
          {filters.search && (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ideas-accent/10 to-ideas-accent/5 text-ideas-accent border border-ideas-accent/20 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200'>
              <Search className='w-4 h-4' />"{filters.search}"
              <button
                onClick={() => handleFilterChange("search", "")}
                className='hover:text-ideas-accentHover transition-colors duration-200'>
                <X className='w-4 h-4' />
              </button>
            </span>
          )}
          {filters.type !== "all" && filters.type && (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200'>
              <Tag className='w-4 h-4' />
              {typeOptions.find((o) => o.value === filters.type)?.label}
              <button
                onClick={() => handleFilterChange("type", "all")}
                className='hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200'>
                <X className='w-4 h-4' />
              </button>
            </span>
          )}
          {filters.status !== "all" && filters.status && (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200'>
              <Clock className='w-4 h-4' />
              {statusOptions.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange("status", "all")}
                className='hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200'>
                <X className='w-4 h-4' />
              </button>
            </span>
          )}
          {filters.dateRange !== "all" && filters.dateRange && (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200'>
              <Calendar className='w-4 h-4' />
              {dateRangeOptions.find((o) => o.value === filters.dateRange)?.label}
              <button
                onClick={() => handleFilterChange("dateRange", "all")}
                className='hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200'>
                <X className='w-4 h-4' />
              </button>
            </span>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200'>
              <DollarSign className='w-4 h-4' />₦{filters.minAmount || 0} - ₦
              {filters.maxAmount || "∞"}
              <button
                onClick={() => {
                  handleFilterChange("minAmount", "");
                  handleFilterChange("maxAmount", "");
                }}
                className='hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-200'>
                <X className='w-4 h-4' />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;

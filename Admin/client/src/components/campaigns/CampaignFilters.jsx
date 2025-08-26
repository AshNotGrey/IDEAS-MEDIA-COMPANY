import React, { useState, useEffect } from "react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  MapPinIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const CampaignFilters = ({ filters, onFiltersChange, onClearFilters, totalResults }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const campaignTypes = [
    { value: "hero_carousel", label: "Hero Carousel" },
    { value: "banner", label: "Banner Advertisement" },
    { value: "popup", label: "Popup/Modal" },
    { value: "notification", label: "Push Notification" },
    { value: "theme_override", label: "Theme Override" },
  ];

  const campaignPlacements = [
    { value: "top_banner", label: "Top Banner" },
    { value: "homepage", label: "Homepage" },
    { value: "product_pages", label: "Product Pages" },
    { value: "category_pages", label: "Category Pages" },
    { value: "blog_posts", label: "Blog Posts" },
    { value: "landing_pages", label: "Landing Pages" },
    { value: "checkout", label: "Checkout Pages" },
    { value: "404_pages", label: "404 Pages" },
    { value: "all_pages", label: "All Pages" },
  ];

  const campaignStatuses = [
    { value: "draft", label: "Draft" },
    { value: "pending_review", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "this_year", label: "This year" },
    { value: "custom", label: "Custom range" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (range) => {
    if (range === "custom") {
      // Custom date range logic would go here
      return;
    }

    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case "yesterday":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case "last_7_days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case "last_30_days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        endDate = now;
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    handleFilterChange("dateRange", range);
    handleFilterChange("startDate", startDate);
    handleFilterChange("endDate", endDate);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.placement && filters.placement.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.dateRange && filters.dateRange !== "all") count++;
    if (filters.isActive !== undefined) count++;
    if (filters.isScheduled !== undefined) count++;
    return count;
  };

  const clearFilter = (key) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className='bg-white shadow rounded-lg border border-gray-200'>
      {/* Filter Header */}
      <div className='px-4 py-3 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <FunnelIcon className='h-5 w-5 text-gray-500' />
            <h3 className='text-lg font-medium text-gray-900'>Filters</h3>
            {activeFiltersCount > 0 && (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-500'>{totalResults} campaigns found</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-gray-400 hover:text-gray-600'>
              {isExpanded ? <XMarkIcon className='h-5 w-5' /> : <FunnelIcon className='h-5 w-5' />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className='px-4 py-3 border-b border-gray-200'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search campaigns by title, description, or tags...'
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className='px-4 py-4 space-y-4'>
          {/* Basic Filters Row */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Campaign Type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <TagIcon className='h-4 w-4 inline mr-1' />
                Campaign Type
              </label>
              <select
                multiple
                value={localFilters.type || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleFilterChange("type", selectedOptions);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                size='4'>
                {campaignTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Placement */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <MapPinIcon className='h-4 w-4 inline mr-1' />
                Placement
              </label>
              <select
                multiple
                value={localFilters.placement || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleFilterChange("placement", selectedOptions);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                size='4'>
                {campaignPlacements.map((placement) => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <ChartBarIcon className='h-4 w-4 inline mr-1' />
                Status
              </label>
              <select
                multiple
                value={localFilters.status || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleFilterChange("status", selectedOptions);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                size='4'>
                {campaignStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Priority</label>
              <select
                multiple
                value={localFilters.priority || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleFilterChange("priority", selectedOptions);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                size='4'>
                {priorityLevels.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range and Status Filters Row */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {/* Date Range */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <CalendarIcon className='h-4 w-4 inline mr-1' />
                Date Range
              </label>
              <select
                value={localFilters.dateRange || "all"}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'>
                <option value='all'>All time</option>
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Active Status</label>
              <select
                value={
                  localFilters.isActive === undefined ? "all" : localFilters.isActive.toString()
                }
                onChange={(e) => {
                  const value = e.target.value === "all" ? undefined : e.target.value === "true";
                  handleFilterChange("isActive", value);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'>
                <option value='all'>All</option>
                <option value='true'>Active only</option>
                <option value='false'>Inactive only</option>
              </select>
            </div>

            {/* Scheduled Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Scheduled Status
              </label>
              <select
                value={
                  localFilters.isScheduled === undefined
                    ? "all"
                    : localFilters.isScheduled.toString()
                }
                onChange={(e) => {
                  const value = e.target.value === "all" ? undefined : e.target.value === "true";
                  handleFilterChange("isScheduled", value);
                }}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'>
                <option value='all'>All</option>
                <option value='true'>Scheduled only</option>
                <option value='false'>Not scheduled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700'>Active filters:</span>
              <div className='flex flex-wrap gap-2'>
                {filters.search && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    Search: "{filters.search}"
                    <button
                      onClick={() => clearFilter("search")}
                      className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500'>
                      ×
                    </button>
                  </span>
                )}
                {filters.type && filters.type.length > 0 && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Type: {filters.type.length} selected
                    <button
                      onClick={() => clearFilter("type")}
                      className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500'>
                      ×
                    </button>
                  </span>
                )}
                {filters.status && filters.status.length > 0 && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                    Status: {filters.status.length} selected
                    <button
                      onClick={() => clearFilter("status")}
                      className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500'>
                      ×
                    </button>
                  </span>
                )}
                {filters.dateRange && filters.dateRange !== "all" && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                    Date: {dateRanges.find((r) => r.value === filters.dateRange)?.label}
                    <button
                      onClick={() => clearFilter("dateRange")}
                      className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500'>
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClearFilters} className='text-sm text-gray-500 hover:text-gray-700'>
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignFilters;

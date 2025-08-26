import React from "react";
import { Filter, X, Calendar } from "lucide-react";

const MediaFilters = ({ filters, onChange, onReset }) => {
  const categories = [
    { value: "", label: "All Categories" },
    { value: "gallery", label: "Gallery" },
    { value: "service_image", label: "Service Image" },
    { value: "profile_image", label: "Profile Image" },
    { value: "thumbnail", label: "Thumbnail" },
    { value: "document", label: "Document" },
    { value: "logo", label: "Logo" },
    { value: "banner", label: "Banner" },
    { value: "portfolio", label: "Portfolio" },
    { value: "equipment", label: "Equipment" },
    { value: "other", label: "Other" },
  ];

  const types = [
    { value: "", label: "All Types" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "document", label: "Documents" },
    { value: "audio", label: "Audio" },
    { value: "other", label: "Other" },
  ];

  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className='space-y-4'>
      {/* Filter Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Advanced Filters
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className='flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'>
            <X className='w-3 h-3' />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Category Filter */}
        <div>
          <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Category
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>
            File Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>
            From Date
          </label>
          <div className='relative'>
            <input
              type='date'
              value={filters.dateFrom || ""}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
            />
            <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'>
            To Date
          </label>
          <div className='relative'>
            <input
              type='date'
              value={filters.dateTo || ""}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
            />
            <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Tags (comma-separated)
        </label>
        <input
          type='text'
          value={filters.tags?.join(", ") || ""}
          onChange={(e) => {
            const tags = e.target.value
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0);
            handleFilterChange("tags", tags);
          }}
          placeholder='Enter tags to filter by...'
          className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
        />

        {/* Tag Suggestions (if needed in the future) */}
        {filters.tags && filters.tags.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
            {filters.tags.map((tag, index) => (
              <span
                key={index}
                className='inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md'>
                {tag}
                <button
                  onClick={() => {
                    const newTags = filters.tags.filter((_, i) => i !== index);
                    handleFilterChange("tags", newTags);
                  }}
                  className='ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className='pt-3 border-t border-gray-200 dark:border-gray-600'>
          <div className='text-xs text-gray-600 dark:text-gray-400 mb-2'>Active Filters:</div>
          <div className='flex flex-wrap gap-2'>
            {filters.category && (
              <span className='inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded'>
                Category: {categories.find((c) => c.value === filters.category)?.label}
                <button
                  onClick={() => handleFilterChange("category", "")}
                  className='ml-1 text-blue-600 dark:text-blue-400'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}

            {filters.type && (
              <span className='inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded'>
                Type: {types.find((t) => t.value === filters.type)?.label}
                <button
                  onClick={() => handleFilterChange("type", "")}
                  className='ml-1 text-green-600 dark:text-green-400'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}

            {filters.dateFrom && (
              <span className='inline-flex items-center px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded'>
                From: {filters.dateFrom}
                <button
                  onClick={() => handleFilterChange("dateFrom", "")}
                  className='ml-1 text-orange-600 dark:text-orange-400'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}

            {filters.dateTo && (
              <span className='inline-flex items-center px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded'>
                To: {filters.dateTo}
                <button
                  onClick={() => handleFilterChange("dateTo", "")}
                  className='ml-1 text-red-600 dark:text-red-400'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaFilters;

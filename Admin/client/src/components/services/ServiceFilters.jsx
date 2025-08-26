import React, { useState } from "react";
import { X, Search, Filter } from "lucide-react";

const ServiceFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "portrait", label: "Portrait Photography" },
    { value: "wedding", label: "Wedding Photography" },
    { value: "event", label: "Event Photography" },
    { value: "commercial", label: "Commercial Photography" },
    { value: "fashion", label: "Fashion Photography" },
    { value: "landscape", label: "Landscape Photography" },
    { value: "product", label: "Product Photography" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "name", label: "Service Name" },
    { value: "basePrice", label: "Base Price" },
    { value: "category", label: "Category" },
  ];

  const handleLocalFilterChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const resetFilters = {
      page: 1,
      limit: 20,
      search: "",
      category: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  return (
    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <Filter className='w-5 h-5 text-purple-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Filter Services</h3>
        </div>
        <button
          onClick={onClose}
          className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
          <X className='w-5 h-5' />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Search */}
        <div className='lg:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Search Services
          </label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              value={localFilters.search}
              onChange={(e) => handleLocalFilterChange("search", e.target.value)}
              placeholder='Search by name, description, or tags...'
              className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Category
          </label>
          <select
            value={localFilters.category}
            onChange={(e) => handleLocalFilterChange("category", e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Sort By
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleLocalFilterChange("sortBy", e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Order
          </label>
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleLocalFilterChange("sortOrder", e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            <option value='desc'>Descending</option>
            <option value='asc'>Ascending</option>
          </select>
        </div>

        {/* Page Size */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Items per page
          </label>
          <select
            value={localFilters.limit}
            onChange={(e) => handleLocalFilterChange("limit", parseInt(e.target.value))}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          onClick={resetFilters}
          className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
          Reset Filters
        </button>
        <button
          onClick={applyFilters}
          className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default ServiceFilters;

import React, { useState } from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';

const UserFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  resultCount = 0 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      role: '',
      isActive: '',
      isEmailVerified: '',
      verificationStatus: '',
      search: '',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '' && value !== null);

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input pl-10 w-full"
          />
          {localFilters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`btn-secondary flex items-center gap-2 ${
            showAdvancedFilters ? 'bg-ideas-accent text-white' : ''
          }`}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(localFilters).filter(value => value !== '' && value !== null).length}
            </span>
          )}
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="card p-4 space-y-4">
          <h4 className="font-medium text-black dark:text-white mb-4">Advanced Filters</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={localFilters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="input w-full"
              >
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Account Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Status
              </label>
              <select
                value={localFilters.isActive || ''}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Email Verification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Status
              </label>
              <select
                value={localFilters.isEmailVerified || ''}
                onChange={(e) => handleFilterChange('isEmailVerified', e.target.value)}
                className="input w-full"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            {/* ID Verification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Verification
              </label>
              <select
                value={localFilters.verificationStatus || ''}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                className="input w-full"
              >
                <option value="">All</option>
                <option value="not_submitted">Not Submitted</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleFilterChange('verificationStatus', 'pending')}
              className="btn-secondary-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
            >
              Pending Verification
            </button>
            <button
              onClick={() => handleFilterChange('isActive', 'false')}
              className="btn-secondary-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
            >
              Inactive Users
            </button>
            <button
              onClick={() => handleFilterChange('isEmailVerified', 'false')}
              className="btn-secondary-sm bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400"
            >
              Unverified Email
            </button>
            <button
              onClick={() => handleFilterChange('role', 'admin')}
              className="btn-secondary-sm bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400"
            >
              Admin Users
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-subtle">
        {hasActiveFilters ? (
          <span>
            Found <strong>{resultCount.toLocaleString()}</strong> users matching your filters
          </span>
        ) : (
          <span>
            Showing all <strong>{resultCount.toLocaleString()}</strong> users
          </span>
        )}
      </div>
    </div>
  );
};

export default UserFilters;

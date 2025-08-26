import React, { useState } from "react";
import { X, Filter } from "lucide-react";

const SettingsFilters = ({ onClose }) => {
  const [filters, setFilters] = useState({
    accessLevel: "",
    environment: "",
    isSecret: "",
    isModified: "",
    requiresRestart: "",
  });

  const accessLevels = [
    { value: "public", label: "Public" },
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" },
    { value: "system", label: "System" },
  ];

  const environments = [
    { value: "all", label: "All Environments" },
    { value: "development", label: "Development" },
    { value: "staging", label: "Staging" },
    { value: "production", label: "Production" },
  ];

  const booleanOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      accessLevel: "",
      environment: "",
      isSecret: "",
      isModified: "",
      requiresRestart: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
        <div className='flex items-center'>
          <Filter className='h-4 w-4 text-gray-500 mr-2' />
          <h3 className='text-sm font-medium text-gray-900'>Filters</h3>
        </div>
        <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
          <X className='h-4 w-4' />
        </button>
      </div>

      {/* Filter Options */}
      <div className='p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          {/* Access Level */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1'>Access Level</label>
            <select
              value={filters.accessLevel}
              onChange={(e) => handleFilterChange("accessLevel", e.target.value)}
              className='w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              <option value=''>All Levels</option>
              {accessLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Environment */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1'>Environment</label>
            <select
              value={filters.environment}
              onChange={(e) => handleFilterChange("environment", e.target.value)}
              className='w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              <option value=''>All Environments</option>
              {environments.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>

          {/* Is Secret */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1'>Secret Settings</label>
            <select
              value={filters.isSecret}
              onChange={(e) => handleFilterChange("isSecret", e.target.value)}
              className='w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Is Modified */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1'>Modified</label>
            <select
              value={filters.isModified}
              onChange={(e) => handleFilterChange("isModified", e.target.value)}
              className='w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Requires Restart */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1'>Requires Restart</label>
            <select
              value={filters.requiresRestart}
              onChange={(e) => handleFilterChange("requiresRestart", e.target.value)}
              className='w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        {hasActiveFilters && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-xs text-gray-500'>
              {Object.values(filters).filter((v) => v !== "").length} active filter(s)
            </span>
            <button
              onClick={clearFilters}
              className='text-xs text-blue-600 hover:text-blue-800 font-medium'>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsFilters;

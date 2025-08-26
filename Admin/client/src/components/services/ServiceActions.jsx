import React, { useState } from "react";
import { Edit, Trash2, Download, Upload, Eye, EyeOff, Star, StarOff, X, Check } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const ServiceActions = ({ selectedCount, onBulkUpdate, onBulkDelete, loading }) => {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState("");

  const handleBulkAction = () => {
    const actions = {
      activate: { isActive: true },
      deactivate: { isActive: false },
      feature: { featured: true },
      unfeature: { featured: false },
    };

    if (bulkAction && actions[bulkAction]) {
      onBulkUpdate(actions[bulkAction]);
      setShowBulkActions(false);
      setBulkAction("");
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} service(s)?`)) {
      onBulkDelete();
    }
  };

  return (
    <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <span className='text-sm font-medium text-purple-800 dark:text-purple-200'>
            {selectedCount} service{selectedCount !== 1 ? "s" : ""} selected
          </span>

          {!showBulkActions ? (
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setShowBulkActions(true)}
                className='flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700'
                disabled={loading}>
                <Edit className='w-4 h-4 mr-1' />
                Bulk Actions
              </button>

              <button
                onClick={handleBulkDelete}
                className='flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700'
                disabled={loading}>
                {loading ? (
                  <LoadingSpinner size='sm' className='mr-1' />
                ) : (
                  <Trash2 className='w-4 h-4 mr-1' />
                )}
                Delete Selected
              </button>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className='px-3 py-1.5 text-sm border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-purple-900/40 dark:text-purple-100'>
                <option value=''>Select action...</option>
                <option value='activate'>Activate Services</option>
                <option value='deactivate'>Deactivate Services</option>
                <option value='feature'>Add to Featured</option>
                <option value='unfeature'>Remove from Featured</option>
              </select>

              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                className='flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                {loading ? (
                  <LoadingSpinner size='sm' className='mr-1' />
                ) : (
                  <Check className='w-4 h-4 mr-1' />
                )}
                Apply
              </button>

              <button
                onClick={() => {
                  setShowBulkActions(false);
                  setBulkAction("");
                }}
                className='flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600'>
                <X className='w-4 h-4 mr-1' />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => onBulkUpdate({ isActive: true })}
            className='p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors'
            title='Activate selected services'
            disabled={loading}>
            <Eye className='w-4 h-4' />
          </button>

          <button
            onClick={() => onBulkUpdate({ isActive: false })}
            className='p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
            title='Deactivate selected services'
            disabled={loading}>
            <EyeOff className='w-4 h-4' />
          </button>

          <button
            onClick={() => onBulkUpdate({ featured: true })}
            className='p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors'
            title='Add to featured'
            disabled={loading}>
            <Star className='w-4 h-4' />
          </button>

          <button
            onClick={() => onBulkUpdate({ featured: false })}
            className='p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
            title='Remove from featured'
            disabled={loading}>
            <StarOff className='w-4 h-4' />
          </button>

          <div className='w-px h-6 bg-purple-300 dark:bg-purple-600 mx-2' />

          <button
            className='p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors'
            title='Export selected services'
            disabled={loading}>
            <Download className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceActions;

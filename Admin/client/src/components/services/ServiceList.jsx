import React from "react";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Camera,
  Clock,
  DollarSign,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const ServiceList = ({
  services,
  total,
  page,
  totalPages,
  loading,
  selectedServices,
  onSelectService,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onPageChange,
  deleteLoading,
}) => {
  if (loading && !services.length) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!loading && services.length === 0) {
    return (
      <div className='text-center py-12'>
        <Camera className='w-12 h-12 mx-auto text-gray-400 mb-4' />
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
          No services found
        </h3>
        <p className='text-gray-500 dark:text-gray-400'>
          Get started by creating your first service.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration) => {
    if (duration.min === duration.max) {
      return `${duration.min}h`;
    }
    return `${duration.min}-${duration.max}h`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      portrait: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      wedding: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      event: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      commercial: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      fashion: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      landscape: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      product: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={selectedServices.length === services.length && services.length > 0}
              onChange={onSelectAll}
              className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
            />
            <span className='ml-3 text-sm font-medium text-gray-900 dark:text-white'>
              {selectedServices.length > 0
                ? `${selectedServices.length} selected`
                : `${total} services`}
            </span>
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            Page {page} of {totalPages}
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className='overflow-hidden'>
        {services.map((service) => (
          <div
            key={service._id}
            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              selectedServices.includes(service._id) ? "bg-purple-50 dark:bg-purple-900/20" : ""
            }`}>
            <div className='px-6 py-4'>
              <div className='flex items-start justify-between'>
                {/* Left Content */}
                <div className='flex items-start space-x-4 flex-1'>
                  <input
                    type='checkbox'
                    checked={selectedServices.includes(service._id)}
                    onChange={() => onSelectService(service._id)}
                    className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1'
                  />

                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                            {service.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(service.category)}`}>
                            {service.category}
                          </span>
                          {service.featured && (
                            <Star className='w-4 h-4 text-yellow-500 fill-current' />
                          )}
                          {!service.isActive && (
                            <span className='px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full'>
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className='text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>
                          {service.description}
                        </p>

                        <div className='flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400'>
                          <div className='flex items-center'>
                            <DollarSign className='w-4 h-4 mr-1' />
                            {formatCurrency(service.basePrice)}
                            {service.priceStructure.type === "hourly" && "/hr"}
                          </div>
                          <div className='flex items-center'>
                            <Clock className='w-4 h-4 mr-1' />
                            {formatDuration(service.duration)}
                          </div>
                          <div className='text-xs'>{service.priceStructure.type}</div>
                        </div>

                        {service.includes && service.includes.length > 0 && (
                          <div className='mt-3'>
                            <div className='flex flex-wrap gap-1'>
                              {service.includes.slice(0, 3).map((item, index) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'>
                                  {item}
                                </span>
                              ))}
                              {service.includes.length > 3 && (
                                <span className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'>
                                  +{service.includes.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => onToggleStatus(service._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isActive
                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                    title={service.isActive ? "Deactivate" : "Activate"}>
                    {service.isActive ? (
                      <Eye className='w-4 h-4' />
                    ) : (
                      <EyeOff className='w-4 h-4' />
                    )}
                  </button>

                  <button
                    onClick={() => onToggleFeatured(service._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.featured
                        ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title={service.featured ? "Remove from featured" : "Add to featured"}>
                    {service.featured ? (
                      <Star className='w-4 h-4 fill-current' />
                    ) : (
                      <StarOff className='w-4 h-4' />
                    )}
                  </button>

                  <button
                    onClick={() => onEdit(service)}
                    className='p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                    title='Edit service'>
                    <Edit2 className='w-4 h-4' />
                  </button>

                  <button
                    onClick={() => onDelete(service._id)}
                    className='p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                    title='Delete service'
                    disabled={deleteLoading}>
                    {deleteLoading ? <LoadingSpinner size='sm' /> : <Trash2 className='w-4 h-4' />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} results
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className='p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                <ChevronLeft className='w-4 h-4' />
              </button>

              <div className='flex items-center space-x-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pageNum === page
                          ? "bg-purple-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className='p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;

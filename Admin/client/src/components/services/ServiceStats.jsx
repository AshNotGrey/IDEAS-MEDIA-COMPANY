import React from "react";
import { Camera, Eye, Star, BarChart3, DollarSign, Package } from "lucide-react";

const ServiceStats = ({ stats }) => {
  if (!stats) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
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
    <div className='space-y-6'>
      {/* Main Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Services</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.totalServices}
              </p>
            </div>
            <div className='bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg'>
              <Package className='w-6 h-6 text-purple-600' />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Active Services
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.activeServices}
              </p>
            </div>
            <div className='bg-green-100 dark:bg-green-900/20 p-3 rounded-lg'>
              <Eye className='w-6 h-6 text-green-600' />
            </div>
          </div>
          <div className='mt-2'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {stats.inactiveServices} inactive
            </span>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Featured Services
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.featuredServices}
              </p>
            </div>
            <div className='bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg'>
              <Star className='w-6 h-6 text-yellow-600' />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Avg. Price</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.avgPricing.length > 0
                  ? formatCurrency(
                      stats.avgPricing.reduce((acc, cat) => acc + cat.avgPrice, 0) /
                        stats.avgPricing.length
                    )
                  : formatCurrency(0)}
              </p>
            </div>
            <div className='bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg'>
              <DollarSign className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Category Distribution */}
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center mb-4'>
            <BarChart3 className='w-5 h-5 text-purple-600 mr-2' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              Category Distribution
            </h3>
          </div>

          <div className='space-y-3'>
            {stats.categoryStats.map((category) => (
              <div key={category._id} className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category._id)}`}>
                    {category._id}
                  </span>
                </div>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>
                  {category.count} services
                </div>
              </div>
            ))}

            {stats.categoryStats.length === 0 && (
              <p className='text-gray-500 dark:text-gray-400 text-center py-4'>
                No category data available
              </p>
            )}
          </div>
        </div>

        {/* Pricing by Category */}
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center mb-4'>
            <DollarSign className='w-5 h-5 text-green-600 mr-2' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              Pricing by Category
            </h3>
          </div>

          <div className='space-y-3'>
            {stats.avgPricing.map((pricing) => (
              <div key={pricing._id} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(pricing._id)}`}>
                    {pricing._id}
                  </span>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {formatCurrency(pricing.avgPrice)}
                  </span>
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  Range: {formatCurrency(pricing.minPrice)} - {formatCurrency(pricing.maxPrice)}
                </div>
              </div>
            ))}

            {stats.avgPricing.length === 0 && (
              <p className='text-gray-500 dark:text-gray-400 text-center py-4'>
                No pricing data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceStats;

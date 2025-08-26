import React from "react";
import { Star, DollarSign, Calendar, TrendingUp } from "lucide-react";

const ServicePerformance = ({ data, categoryData, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>{title}</h3>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No service performance data available
        </div>
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

  const getCategoryColor = (category) => {
    const colors = {
      portrait: "bg-blue-500",
      wedding: "bg-pink-500",
      event: "bg-green-500",
      commercial: "bg-purple-500",
      fashion: "bg-yellow-500",
      landscape: "bg-emerald-500",
      product: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const topServices = data.slice(0, 5);
  const maxRevenue = Math.max(...topServices.map((s) => s.totalRevenue));

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <Star className='w-5 h-5 text-yellow-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>{title}</h3>
        </div>
        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
          <TrendingUp className='w-4 h-4 mr-1' />
          Top performing
        </div>
      </div>

      {/* Top Services */}
      <div className='space-y-4 mb-6'>
        <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
          Top Services by Revenue
        </h4>

        {topServices.map((service, index) => {
          const revenuePercentage = (service.totalRevenue / maxRevenue) * 100;

          return (
            <div key={service._id} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    #{index + 1}
                  </span>
                  <div>
                    <div className='text-sm font-medium text-gray-900 dark:text-white'>
                      {service.name}
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400'>
                      <span
                        className={`px-2 py-1 rounded-full text-white ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                      {service.featured && (
                        <span className='flex items-center'>
                          <Star className='w-3 h-3 text-yellow-500 fill-current mr-1' />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>
                    {formatCurrency(service.totalRevenue)}
                  </div>
                  <div className='flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400'>
                    <span>{service.totalBookings} bookings</span>
                    {service.avgRating && (
                      <span className='flex items-center'>
                        <Star className='w-3 h-3 text-yellow-500 fill-current mr-1' />
                        {service.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue Bar */}
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(service.category)}`}
                  style={{ width: `${revenuePercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Performance */}
      {categoryData && categoryData.length > 0 && (
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
            Category Performance
          </h4>

          <div className='grid grid-cols-1 gap-3'>
            {categoryData.slice(0, 4).map((category) => (
              <div
                key={category._id}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category._id)}`} />
                  <div>
                    <div className='text-sm font-medium text-gray-900 dark:text-white capitalize'>
                      {category._id}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {category.totalServices} services • {category.activeServices} active
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>
                    {formatCurrency(category.totalRevenue)}
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {category.totalBookings} bookings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <DollarSign className='w-4 h-4 text-green-600' />
          </div>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {formatCurrency(data.reduce((sum, service) => sum + service.totalRevenue, 0))}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total Revenue</div>
        </div>

        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <Calendar className='w-4 h-4 text-blue-600' />
          </div>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {data.reduce((sum, service) => sum + service.totalBookings, 0)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total Bookings</div>
        </div>

        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <Star className='w-4 h-4 text-yellow-600' />
          </div>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {(
              data.reduce((sum, service) => sum + (service.avgRating || 0), 0) / data.length
            ).toFixed(1)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Avg Rating</div>
        </div>
      </div>
    </div>
  );
};

export default ServicePerformance;

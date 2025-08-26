import React from "react";
import { TrendingUp, DollarSign } from "lucide-react";

const RevenueChart = ({ data, period, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>{title}</h3>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No revenue data available for the selected period
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxBookings = Math.max(...data.map((d) => d.bookings));

  const formatDate = (dateObj) => {
    if (period === "monthly") {
      const date = new Date(dateObj.year, dateObj.month - 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else if (period === "weekly") {
      return `Week ${dateObj.week}, ${dateObj.year}`;
    } else {
      const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <DollarSign className='w-5 h-5 text-green-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>{title}</h3>
        </div>
        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
          <TrendingUp className='w-4 h-4 mr-1' />
          {period} view
        </div>
      </div>

      {/* Chart Area */}
      <div className='relative h-64 mb-4'>
        <div className='absolute inset-0 flex items-end justify-between space-x-1'>
          {data.map((item, index) => {
            const revenueHeight = (item.revenue / maxRevenue) * 100;
            const bookingHeight = (item.bookings / maxBookings) * 100;

            return (
              <div key={index} className='flex-1 flex flex-col items-center group'>
                {/* Revenue Bar */}
                <div className='relative w-full max-w-8 mb-1'>
                  <div
                    className='bg-green-500 rounded-t transition-all duration-300 group-hover:bg-green-600'
                    style={{ height: `${revenueHeight}%`, minHeight: "2px" }}
                    title={`Revenue: ${formatCurrency(item.revenue)}`}
                  />

                  {/* Tooltip on Hover */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
                    <div className='bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap'>
                      {formatCurrency(item.revenue)}
                      <br />
                      {item.bookings} bookings
                    </div>
                  </div>
                </div>

                {/* Date Label */}
                <div className='text-xs text-gray-500 dark:text-gray-400 text-center transform -rotate-45 origin-center mt-2'>
                  {formatDate(item._id)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className='absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 -ml-16'>
          <span>{formatCurrency(maxRevenue)}</span>
          <span>{formatCurrency(maxRevenue * 0.75)}</span>
          <span>{formatCurrency(maxRevenue * 0.5)}</span>
          <span>{formatCurrency(maxRevenue * 0.25)}</span>
          <span>₦0</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total Revenue</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {data.reduce((sum, item) => sum + item.bookings, 0)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total Bookings</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {formatCurrency(
              data.reduce((sum, item) => sum + item.revenue, 0) /
                (data.reduce((sum, item) => sum + item.bookings, 0) || 1)
            )}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Avg Order</div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;

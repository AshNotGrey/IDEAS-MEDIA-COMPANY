import React from "react";
import { Calendar, TrendingUp } from "lucide-react";

const BookingTrends = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>{title}</h3>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No booking data available
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total));

  const formatMonth = (dateObj) => {
    const date = new Date(dateObj.year, dateObj.month - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-500",
      completed: "bg-blue-500",
      cancelled: "bg-red-500",
      pending: "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <Calendar className='w-5 h-5 text-blue-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>{title}</h3>
        </div>
        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
          <TrendingUp className='w-4 h-4 mr-1' />
          Monthly view
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className='relative h-64 mb-4'>
        <div className='absolute inset-0 flex items-end justify-between space-x-1'>
          {data.map((item, index) => {
            const totalHeight = (item.total / maxTotal) * 100;
            const confirmedPercent = (item.confirmed / item.total) * 100;
            const completedPercent = (item.completed / item.total) * 100;
            const cancelledPercent = (item.cancelled / item.total) * 100;
            const pendingPercent = 100 - confirmedPercent - completedPercent - cancelledPercent;

            return (
              <div key={index} className='flex-1 flex flex-col items-center group'>
                {/* Stacked Bar */}
                <div className='relative w-full max-w-8 mb-1'>
                  <div
                    className='relative rounded transition-all duration-300'
                    style={{ height: `${totalHeight}%`, minHeight: "4px" }}>
                    {/* Completed (Blue) */}
                    <div
                      className='bg-blue-500 absolute bottom-0 w-full transition-all duration-300'
                      style={{ height: `${completedPercent}%` }}
                    />
                    {/* Confirmed (Green) */}
                    <div
                      className='bg-green-500 absolute w-full transition-all duration-300'
                      style={{
                        bottom: `${completedPercent}%`,
                        height: `${confirmedPercent}%`,
                      }}
                    />
                    {/* Pending (Yellow) */}
                    <div
                      className='bg-yellow-500 absolute w-full transition-all duration-300'
                      style={{
                        bottom: `${completedPercent + confirmedPercent}%`,
                        height: `${pendingPercent}%`,
                      }}
                    />
                    {/* Cancelled (Red) */}
                    <div
                      className='bg-red-500 absolute top-0 w-full rounded-t transition-all duration-300'
                      style={{ height: `${cancelledPercent}%` }}
                    />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
                    <div className='bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap'>
                      Total: {item.total}
                      <br />
                      Completed: {item.completed}
                      <br />
                      Confirmed: {item.confirmed}
                      <br />
                      Cancelled: {item.cancelled}
                    </div>
                  </div>
                </div>

                {/* Month Label */}
                <div className='text-xs text-gray-500 dark:text-gray-400 text-center mt-2'>
                  {formatMonth(item._id)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className='absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 -ml-8'>
          <span>{maxTotal}</span>
          <span>{Math.round(maxTotal * 0.75)}</span>
          <span>{Math.round(maxTotal * 0.5)}</span>
          <span>{Math.round(maxTotal * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Legend */}
      <div className='flex items-center justify-center space-x-4 text-xs'>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-blue-500 rounded mr-1'></div>
          <span className='text-gray-600 dark:text-gray-400'>Completed</span>
        </div>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-green-500 rounded mr-1'></div>
          <span className='text-gray-600 dark:text-gray-400'>Confirmed</span>
        </div>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-yellow-500 rounded mr-1'></div>
          <span className='text-gray-600 dark:text-gray-400'>Pending</span>
        </div>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-red-500 rounded mr-1'></div>
          <span className='text-gray-600 dark:text-gray-400'>Cancelled</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {data.reduce((sum, item) => sum + item.total, 0)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total Bookings</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {Math.round(
              (data.reduce((sum, item) => sum + item.completed, 0) /
                (data.reduce((sum, item) => sum + item.total, 0) || 1)) *
                100
            )}
            %
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Completion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default BookingTrends;

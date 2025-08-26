import React from "react";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

const UserGrowth = ({ data, verificationStats, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>{title}</h3>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No user growth data available
        </div>
      </div>
    );
  }

  const maxUsers = Math.max(...data.map((d) => d.newUsers));

  const formatMonth = (dateObj) => {
    const date = new Date(dateObj.year, dateObj.month - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const calculateGrowthRate = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1].newUsers;
    const previous = data[data.length - 2].newUsers;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const growthRate = calculateGrowthRate();

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <Users className='w-5 h-5 text-purple-600 mr-2' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>{title}</h3>
        </div>
        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
          <TrendingUp className='w-4 h-4 mr-1' />
          {growthRate >= 0 ? "+" : ""}
          {growthRate.toFixed(1)}%
        </div>
      </div>

      {/* User Growth Chart */}
      <div className='relative h-40 mb-6'>
        <div className='absolute inset-0 flex items-end justify-between space-x-1'>
          {data.map((item, index) => {
            const height = (item.newUsers / maxUsers) * 100;

            return (
              <div key={index} className='flex-1 flex flex-col items-center group'>
                {/* Growth Bar */}
                <div className='relative w-full max-w-6 mb-1'>
                  <div
                    className='bg-purple-500 rounded-t transition-all duration-300 group-hover:bg-purple-600'
                    style={{ height: `${height}%`, minHeight: "2px" }}
                  />

                  {/* Tooltip on Hover */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
                    <div className='bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap'>
                      {item.newUsers} new users
                      <br />
                      {formatMonth(item._id)}
                    </div>
                  </div>
                </div>

                {/* Month Label */}
                <div className='text-xs text-gray-500 dark:text-gray-400 text-center transform -rotate-45 origin-center mt-1'>
                  {formatMonth(item._id)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className='absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 -ml-6'>
          <span>{maxUsers}</span>
          <span>{Math.round(maxUsers * 0.75)}</span>
          <span>{Math.round(maxUsers * 0.5)}</span>
          <span>{Math.round(maxUsers * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Verification Stats */}
      {verificationStats && (
        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
            User Verification Status
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center'>
                <UserCheck className='w-4 h-4 text-green-600 mr-2' />
                <span className='text-sm text-gray-600 dark:text-gray-400'>Email Verified</span>
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {verificationStats.emailVerified}/{verificationStats.total}
              </div>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center'>
                <UserCheck className='w-4 h-4 text-blue-600 mr-2' />
                <span className='text-sm text-gray-600 dark:text-gray-400'>ID Verified</span>
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {verificationStats.idVerified}/{verificationStats.total}
              </div>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center'>
                <Users className='w-4 h-4 text-purple-600 mr-2' />
                <span className='text-sm text-gray-600 dark:text-gray-400'>Active Users</span>
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {verificationStats.active}/{verificationStats.total}
              </div>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center'>
                <UserX className='w-4 h-4 text-red-600 mr-2' />
                <span className='text-sm text-gray-600 dark:text-gray-400'>Inactive</span>
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {verificationStats.total - verificationStats.active}/{verificationStats.total}
              </div>
            </div>
          </div>

          {/* Verification Rates */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-600 dark:text-gray-400'>Email Verification Rate</span>
              <span className='text-gray-900 dark:text-white font-medium'>
                {Math.round((verificationStats.emailVerified / verificationStats.total) * 100)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
              <div
                className='bg-green-500 h-1 rounded-full transition-all duration-300'
                style={{
                  width: `${(verificationStats.emailVerified / verificationStats.total) * 100}%`,
                }}
              />
            </div>

            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-600 dark:text-gray-400'>ID Verification Rate</span>
              <span className='text-gray-900 dark:text-white font-medium'>
                {Math.round((verificationStats.idVerified / verificationStats.total) * 100)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
              <div
                className='bg-blue-500 h-1 rounded-full transition-all duration-300'
                style={{
                  width: `${(verificationStats.idVerified / verificationStats.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className='grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {data.reduce((sum, item) => sum + item.newUsers, 0)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Total New Users</div>
        </div>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-900 dark:text-white'>
            {Math.round(data.reduce((sum, item) => sum + item.newUsers, 0) / data.length)}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>Avg per Month</div>
        </div>
      </div>
    </div>
  );
};

export default UserGrowth;

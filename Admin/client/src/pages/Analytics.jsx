import React, { useState } from "react";
import { Calendar, TrendingUp, Users, DollarSign, BarChart3, PieChart } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import RevenueChart from "../components/analytics/RevenueChart.jsx";
import BookingTrends from "../components/analytics/BookingTrends.jsx";
import UserGrowth from "../components/analytics/UserGrowth.jsx";
import ServicePerformance from "../components/analytics/ServicePerformance.jsx";

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [period, setPeriod] = useState("daily");

  // Mock data - replace with real REST API calls when needed
  const mockAnalytics = {
    revenueAnalytics: {
      totalRevenue: 1250000,
      totalBookings: 89,
      avgOrderValue: 14045,
      growthRate: 12.5,
      dailyData: [
        { date: "2024-01-01", revenue: 45000, bookings: 3 },
        { date: "2024-01-02", revenue: 52000, bookings: 4 },
        { date: "2024-01-03", revenue: 38000, bookings: 2 },
        { date: "2024-01-04", revenue: 61000, bookings: 5 },
        { date: "2024-01-05", revenue: 48000, bookings: 3 },
      ],
    },
    bookingAnalytics: {
      totalBookings: 89,
      completedBookings: 67,
      pendingBookings: 12,
      cancelledBookings: 10,
      dailyData: [
        { date: "2024-01-01", bookings: 3, completed: 2, pending: 1 },
        { date: "2024-01-02", bookings: 4, completed: 3, pending: 1 },
        { date: "2024-01-03", bookings: 2, completed: 1, pending: 1 },
        { date: "2024-01-04", bookings: 5, completed: 4, pending: 1 },
        { date: "2024-01-05", bookings: 3, completed: 2, pending: 1 },
      ],
    },
    userAnalytics: {
      totalUsers: 1250,
      newUsers: 45,
      activeUsers: 890,
      inactiveUsers: 360,
      dailyData: [
        { date: "2024-01-01", newUsers: 3, activeUsers: 45 },
        { date: "2024-01-02", newUsers: 5, activeUsers: 52 },
        { date: "2024-01-03", newUsers: 2, activeUsers: 38 },
        { date: "2024-01-04", newUsers: 7, activeUsers: 61 },
        { date: "2024-01-05", newUsers: 4, activeUsers: 48 },
      ],
    },
    serviceAnalytics: {
      totalServices: 15,
      popularServices: [
        { name: "Wedding Photography", bookings: 25, revenue: 450000 },
        { name: "Portrait Sessions", bookings: 18, revenue: 180000 },
        { name: "Event Coverage", bookings: 15, revenue: 240000 },
        { name: "Product Photography", bookings: 12, revenue: 120000 },
        { name: "Family Sessions", bookings: 10, revenue: 100000 },
      ],
    },
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Analytics & Reports</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Comprehensive business intelligence and performance insights
          </p>
        </div>

        {/* Date Range Controls */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <Calendar className='w-4 h-4 text-gray-500' />
            <input
              type='date'
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm'
            />
            <span className='text-gray-500'>to</span>
            <input
              type='date'
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm'
            />
          </div>

          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm'>
            <option value='daily'>Daily</option>
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {mockAnalytics.revenueAnalytics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Revenue
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ₦{mockAnalytics.revenueAnalytics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                <DollarSign className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-green-600 dark:text-green-400'>
                +{mockAnalytics.revenueAnalytics.growthRate}%
              </span>
              <span className='text-gray-500 dark:text-gray-400 ml-1'>from last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Bookings
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {mockAnalytics.bookingAnalytics.totalBookings}
                </p>
              </div>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                <Calendar className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <TrendingUp className='w-4 h-4 text-blue-500 mr-1' />
              <span className='text-blue-600 dark:text-blue-400'>+8%</span>
              <span className='text-gray-500 dark:text-gray-400 ml-1'>from last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Users</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {mockAnalytics.userAnalytics.totalUsers}
                </p>
              </div>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
                <Users className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <TrendingUp className='w-4 h-4 text-purple-500 mr-1' />
              <span className='text-purple-600 dark:text-purple-400'>+15%</span>
              <span className='text-gray-500 dark:text-gray-400 ml-1'>from last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Avg Order Value
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ₦{mockAnalytics.revenueAnalytics.avgOrderValue.toLocaleString()}
                </p>
              </div>
              <div className='p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg'>
                <BarChart3 className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <TrendingUp className='w-4 h-4 text-orange-500 mr-1' />
              <span className='text-orange-600 dark:text-orange-400'>+5%</span>
              <span className='text-gray-500 dark:text-gray-400 ml-1'>from last month</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Revenue Trends
          </h3>
          <RevenueChart data={mockAnalytics.revenueAnalytics.dailyData} />
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Booking Trends
          </h3>
          <BookingTrends data={mockAnalytics.bookingAnalytics.dailyData} />
        </div>
      </div>

      {/* Additional Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>User Growth</h3>
          <UserGrowth data={mockAnalytics.userAnalytics.dailyData} />
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Service Performance
          </h3>
          <ServicePerformance data={mockAnalytics.serviceAnalytics.popularServices} />
        </div>
      </div>

      {/* Service Breakdown */}
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Top Performing Services
        </h3>
        <div className='space-y-4'>
          {mockAnalytics.serviceAnalytics.popularServices.map((service, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center'>
                  <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>{service.name}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {service.bookings} bookings
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-gray-900 dark:text-white'>
                  ₦{service.revenue.toLocaleString()}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {((service.revenue / mockAnalytics.revenueAnalytics.totalRevenue) * 100).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

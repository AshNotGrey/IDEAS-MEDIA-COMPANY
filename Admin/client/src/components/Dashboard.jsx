import React from "react";
import StatsCard from "./dashboard/StatsCard.jsx";
import RecentActivity from "./dashboard/RecentActivity.jsx";
import QuickActions from "./dashboard/QuickActions.jsx";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - replace with real REST API calls when needed
  const mockStats = {
    totalUsers: 1250,
    totalBookings: 89,
    totalRevenue: 1250000,
    pendingReviews: 12,
    activeGalleries: 8,
    recentBookings: [
      {
        id: 1,
        customerName: "John Doe",
        service: "Wedding Photography",
        date: "2024-01-15",
        amount: 150000,
      },
      {
        id: 2,
        customerName: "Jane Smith",
        service: "Portrait Session",
        date: "2024-01-14",
        amount: 45000,
      },
      {
        id: 3,
        customerName: "Mike Johnson",
        service: "Event Coverage",
        date: "2024-01-13",
        amount: 80000,
      },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 1250000, bookings: 89 },
      { month: "Dec", revenue: 980000, bookings: 67 },
      { month: "Nov", revenue: 1100000, bookings: 78 },
      { month: "Oct", revenue: 920000, bookings: 65 },
    ],
    popularServices: [
      { name: "Wedding Photography", bookings: 25, revenue: 450000 },
      { name: "Portrait Sessions", bookings: 18, revenue: 180000 },
      { name: "Event Coverage", bookings: 15, revenue: 240000 },
    ],
  };

  const mockRevenueAnalytics = {
    totalRevenue: 1250000,
    totalBookings: 89,
    avgOrderValue: 14045,
    growthRate: 12.5,
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700'>
        <div className='px-6 py-4'>
          <h1 className='text-2xl font-heading font-bold text-black dark:text-white'>Dashboard</h1>
          <p className='text-subtle mt-1'>
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <StatsCard
            title='Total Users'
            value={mockStats.totalUsers}
            icon='users'
            trend='+12%'
            trendDirection='up'
            color='blue'
          />
          <StatsCard
            title='Total Bookings'
            value={mockStats.totalBookings}
            icon='calendar'
            trend='+8%'
            trendDirection='up'
            color='green'
          />
          <StatsCard
            title='Total Revenue'
            value={`₦${mockStats.totalRevenue?.toLocaleString() || "0"}`}
            icon='dollar'
            trend={
              mockRevenueAnalytics?.growthRate
                ? `${mockRevenueAnalytics.growthRate > 0 ? "+" : ""}${mockRevenueAnalytics.growthRate.toFixed(1)}%`
                : "+15%"
            }
            trendDirection={mockRevenueAnalytics?.growthRate > 0 ? "up" : "down"}
            color='purple'
          />
          <StatsCard
            title='Pending Reviews'
            value={mockStats.pendingReviews}
            icon='message-circle'
            trend='-3%'
            trendDirection='down'
            color='orange'
          />
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Quick Actions */}
          <div className='lg:col-span-1'>
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className='lg:col-span-2'>
            <RecentActivity
              recentBookings={mockStats.recentBookings || []}
              monthlyRevenue={mockStats.monthlyRevenue || []}
              popularServices={mockStats.popularServices || []}
            />
          </div>
        </div>

        {/* Additional Stats */}
        {mockStats.monthlyRevenue && mockStats.monthlyRevenue.length > 0 && (
          <div className='card'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-black dark:text-white'>
                Monthly Revenue Overview
              </h3>
              <Link
                to='/analytics'
                className='inline-flex items-center px-3 py-2 text-sm font-medium text-ideas-accent hover:text-ideas-accent-dark bg-ideas-accent/10 hover:bg-ideas-accent/20 rounded-lg transition-colors'>
                <BarChart3 className='w-4 h-4 mr-2' />
                View Full Analytics
              </Link>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {mockStats.monthlyRevenue.slice(-4).map((month, index) => (
                <div key={index} className='text-center'>
                  <div className='text-2xl font-bold text-ideas-accent'>
                    ₦{month.revenue?.toLocaleString() || "0"}
                  </div>
                  <div className='text-sm text-subtle capitalize'>{month.month}</div>
                  <div className='text-xs text-subtle'>{month.bookings} bookings</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Analytics Preview */}
        {mockRevenueAnalytics && (
          <div className='card'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-black dark:text-white'>
                30-Day Performance
              </h3>
              <Link
                to='/analytics'
                className='text-sm text-ideas-accent hover:text-ideas-accent-dark font-medium'>
                View Details →
              </Link>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-xl font-bold text-green-600'>
                  ₦{mockRevenueAnalytics.totalRevenue?.toLocaleString() || "0"}
                </div>
                <div className='text-sm text-subtle'>Total Revenue</div>
              </div>
              <div className='text-center'>
                <div className='text-xl font-bold text-blue-600'>
                  {mockRevenueAnalytics.totalBookings || 0}
                </div>
                <div className='text-sm text-subtle'>Total Bookings</div>
              </div>
              <div className='text-center'>
                <div className='text-xl font-bold text-purple-600'>
                  ₦{mockRevenueAnalytics.avgOrderValue?.toLocaleString() || "0"}
                </div>
                <div className='text-sm text-subtle'>Avg Order Value</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

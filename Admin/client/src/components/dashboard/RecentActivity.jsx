import React from "react";
import { Calendar, Clock, MapPin, DollarSign, Star } from "lucide-react";

const RecentActivity = ({ recentBookings, monthlyRevenue, popularServices }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className='space-y-6'>
      {/* Recent Bookings */}
      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-black dark:text-white'>Recent Bookings</h3>
          <button className='text-sm text-ideas-accent hover:text-ideas-accentHover font-medium'>
            View All
          </button>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <div className='space-y-3'>
            {recentBookings.slice(0, 5).map((booking, index) => (
              <div
                key={booking.id || booking._id || index}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
                      <Calendar size={20} className='text-ideas-accent' />
                    </div>
                    <div>
                      <p className='font-medium text-black dark:text-white'>
                        {booking.customerName || booking.client?.name || "Unknown Client"}
                      </p>
                      <p className='text-sm text-subtle'>
                        {booking.service || booking.product?.name || "Unknown Service"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status || "Unknown"}
                    </span>
                  </div>
                  <p className='text-sm font-medium text-black dark:text-white'>
                    ₦{(booking.amount || booking.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className='text-xs text-subtle'>{formatDate(booking.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <Calendar size={48} className='text-gray-300 dark:text-gray-600 mx-auto mb-3' />
            <p className='text-subtle'>No recent bookings</p>
          </div>
        )}
      </div>

      {/* Popular Services */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-black dark:text-white mb-4'>Popular Services</h3>

        {popularServices && popularServices.length > 0 ? (
          <div className='space-y-3'>
            {popularServices.slice(0, 5).map((service, index) => (
              <div
                key={service.name || service.service?._id || index}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-ideas-accent/10 rounded-full flex items-center justify-center text-sm font-bold text-ideas-accent'>
                    {index + 1}
                  </div>
                  <div>
                    <p className='font-medium text-black dark:text-white'>
                      {service.name || service.service?.name || "Unknown Service"}
                    </p>
                    <p className='text-sm text-subtle capitalize'>
                      {service.category || service.service?.category || "General"}
                    </p>
                  </div>
                </div>

                <div className='text-right'>
                  <p className='text-sm font-medium text-black dark:text-white'>
                    {service.bookings || service.bookingCount || 0} bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <Star size={48} className='text-gray-300 dark:text-gray-600 mx-auto mb-3' />
            <p className='text-subtle'>No service data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

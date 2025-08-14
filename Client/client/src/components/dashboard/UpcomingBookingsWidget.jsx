import React from "react";
import { Calendar, Clock, MapPin, DollarSign, Edit3, X, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../../graphql/hooks/useBookings";
import { useAuth } from "../../contexts/AuthContext";
import formatPrice from "../../utils/format";
import Button from "../Button";

/**
 * UpcomingBookingsWidget Component
 *
 * Displays the next 3 upcoming bookings with quick actions
 */
const UpcomingBookingsWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, loading, error } = useBookings(user?.id);

  // Filter and sort upcoming bookings
  const upcomingBookings =
    bookings
      ?.filter((booking) => {
        const bookingDate = new Date(booking.serviceDetails?.date || booking.date);
        return bookingDate >= new Date() && booking.status !== "cancelled";
      })
      ?.sort((a, b) => {
        const dateA = new Date(a.serviceDetails?.date || a.date);
        const dateB = new Date(b.serviceDetails?.date || b.date);
        return dateA - dateB;
      })
      ?.slice(0, 3) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "in_progress":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/50";
    }
  };

  const handlePayBalance = (booking) => {
    // Navigate to payment with booking context
    navigate(`/checkout?bookingId=${booking.id}&type=booking`);
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Calendar className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Upcoming Bookings</h3>
        </div>
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-20'></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Calendar className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Upcoming Bookings</h3>
        </div>
        <div className='text-center py-4'>
          <p className='text-red-600 dark:text-red-400 text-sm'>Failed to load bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Calendar className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Upcoming Bookings</h3>
        </div>
        <Button variant='text' size='sm' onClick={() => navigate("/history")}>
          View All
        </Button>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className='text-center py-8'>
          <Calendar className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-subtle mb-4'>No upcoming bookings</p>
          <Button variant='primary' size='sm' onClick={() => navigate("/photoshoot")}>
            Book a Service
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className='p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/50 transition-colors'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-medium text-gray-900 dark:text-white truncate'>
                    {booking.service?.title || booking.title}
                  </h4>
                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      <span>{formatDate(booking.serviceDetails?.date || booking.date)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      <span>{booking.serviceDetails?.time || booking.time}</span>
                    </div>
                    {booking.serviceDetails?.location?.address && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        <span className='truncate max-w-20'>
                          {booking.serviceDetails.location.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status?.replace("_", " ") || "pending"}
                  </span>
                  {booking.totalAmount && (
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {formatPrice(booking.totalAmount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='flex items-center gap-2'>
                <Button
                  variant='text'
                  size='sm'
                  leftIcon={<Edit3 className='w-3 h-3' />}
                  onClick={() => navigate(`/bookings/${booking.id}/edit`)}>
                  Edit
                </Button>
                {booking.status === "pending" && booking.balanceAmount > 0 && (
                  <Button
                    variant='primary'
                    size='sm'
                    leftIcon={<CreditCard className='w-3 h-3' />}
                    onClick={() => handlePayBalance(booking)}>
                    Pay Balance
                  </Button>
                )}
                <Button
                  variant='text'
                  size='sm'
                  leftIcon={<X className='w-3 h-3' />}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  onClick={() => navigate(`/bookings/${booking.id}/cancel`)}>
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingBookingsWidget;

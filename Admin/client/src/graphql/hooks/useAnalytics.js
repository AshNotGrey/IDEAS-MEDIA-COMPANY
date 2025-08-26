import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Analytics Queries
const GET_REVENUE_ANALYTICS = gql`
  query GetRevenueAnalytics($startDate: String, $endDate: String, $period: String) {
    getRevenueAnalytics(startDate: $startDate, endDate: $endDate, period: $period) {
      period
      data {
        _id {
          year
          month
          day
          week
        }
        revenue
        bookings
        avgOrderValue
      }
      totalRevenue
      totalBookings
      avgOrderValue
      growthRate
    }
  }
`;

const GET_BOOKING_ANALYTICS = gql`
  query GetBookingAnalytics($period: String, $limit: Int) {
    getBookingAnalytics(period: $period, limit: $limit) {
      bookingTrends {
        _id {
          year
          month
        }
        total
        confirmed
        completed
        cancelled
        revenue
      }
      statusDistribution {
        _id
        count
      }
      peakHours {
        _id
        count
      }
      servicePopularity {
        _id
        bookings
        revenue
        serviceInfo {
          name
          category
        }
      }
    }
  }
`;

const GET_USER_ANALYTICS = gql`
  query GetUserAnalytics {
    getUserAnalytics {
      userGrowth {
        _id {
          year
          month
        }
        newUsers
      }
      verificationStats {
        total
        emailVerified
        idVerified
        active
      }
      activityPatterns {
        avgBookingsPerUser
        avgSpentPerUser
        totalActiveUsers
      }
      geographicData {
        _id
        count
      }
    }
  }
`;

const GET_SERVICE_ANALYTICS = gql`
  query GetServiceAnalytics {
    getServiceAnalytics {
      servicePerformance {
        _id
        name
        category
        basePrice
        totalBookings
        totalRevenue
        avgRating
        isActive
        featured
      }
      categoryPerformance {
        _id
        totalServices
        activeServices
        totalBookings
        totalRevenue
        avgPrice
      }
      pricingAnalysis {
        _id
        minPrice
        maxPrice
        avgPrice
        count
      }
    }
  }
`;

export const useAnalytics = (dateRange = {}, period = 'daily') => {
    // Revenue Analytics
    const {
        data: revenueData,
        loading: revenueLoading,
        error: revenueError,
        refetch: refetchRevenue
    } = useQuery(GET_REVENUE_ANALYTICS, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            period
        },
        errorPolicy: 'all'
    });

    // Booking Analytics
    const {
        data: bookingData,
        loading: bookingLoading,
        error: bookingError,
        refetch: refetchBooking
    } = useQuery(GET_BOOKING_ANALYTICS, {
        variables: { period, limit: 12 },
        errorPolicy: 'all'
    });

    // User Analytics
    const {
        data: userData,
        loading: userLoading,
        error: userError,
        refetch: refetchUser
    } = useQuery(GET_USER_ANALYTICS, {
        errorPolicy: 'all'
    });

    // Service Analytics
    const {
        data: serviceData,
        loading: serviceLoading,
        error: serviceError,
        refetch: refetchService
    } = useQuery(GET_SERVICE_ANALYTICS, {
        errorPolicy: 'all'
    });

    const loading = revenueLoading || bookingLoading || userLoading || serviceLoading;
    const error = revenueError || bookingError || userError || serviceError;

    const refetch = async () => {
        await Promise.all([
            refetchRevenue(),
            refetchBooking(),
            refetchUser(),
            refetchService()
        ]);
    };

    return {
        revenueAnalytics: revenueData?.getRevenueAnalytics,
        bookingAnalytics: bookingData?.getBookingAnalytics,
        userAnalytics: userData?.getUserAnalytics,
        serviceAnalytics: serviceData?.getServiceAnalytics,
        loading,
        error,
        refetch
    };
};

// Individual hooks for specific analytics
export const useRevenueAnalytics = (dateRange, period) => {
    const { data, loading, error, refetch } = useQuery(GET_REVENUE_ANALYTICS, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            period
        },
        errorPolicy: 'all'
    });

    return {
        data: data?.getRevenueAnalytics,
        loading,
        error,
        refetch
    };
};

export const useBookingAnalytics = (period = 'monthly', limit = 12) => {
    const { data, loading, error, refetch } = useQuery(GET_BOOKING_ANALYTICS, {
        variables: { period, limit },
        errorPolicy: 'all'
    });

    return {
        data: data?.getBookingAnalytics,
        loading,
        error,
        refetch
    };
};

export const useUserAnalytics = () => {
    const { data, loading, error, refetch } = useQuery(GET_USER_ANALYTICS, {
        errorPolicy: 'all'
    });

    return {
        data: data?.getUserAnalytics,
        loading,
        error,
        refetch
    };
};

export const useServiceAnalytics = () => {
    const { data, loading, error, refetch } = useQuery(GET_SERVICE_ANALYTICS, {
        errorPolicy: 'all'
    });

    return {
        data: data?.getServiceAnalytics,
        loading,
        error,
        refetch
    };
};

import { gql } from '@apollo/client';
import { USER_FULL_FRAGMENT } from '../fragments/user.js';

// User Management
export const GET_ALL_USERS = gql`
  query GetAllUsers($filter: UserFilter) {
    users(filter: $filter) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const TOGGLE_USER_STATUS = gql`
  mutation ToggleUserStatus($id: ID!) {
    toggleUserStatus(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

// Dashboard Analytics
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalBookings
      totalRevenue
      pendingReviews
      activeGalleries
      recentBookings {
        _id
        status
        totalAmount
        createdAt
        client {
          name
          email
        }
        service {
          name
        }
      }
      monthlyRevenue {
        month
        revenue
        bookings
      }
      popularServices {
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

// Advanced Analytics Queries
export const GET_REVENUE_ANALYTICS = gql`
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

export const GET_BOOKING_ANALYTICS = gql`
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

export const GET_USER_ANALYTICS = gql`
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

export const GET_SERVICE_ANALYTICS = gql`
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

// Legacy Analytics (keeping for compatibility)
export const GET_ANALYTICS = gql`
  query GetAnalytics($startDate: String!, $endDate: String!) {
    getRevenueAnalytics(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      totalBookings
      avgOrderValue
      data {
        _id {
          year
          month
          day
        }
        revenue
        bookings
      }
    }
  }
`; 
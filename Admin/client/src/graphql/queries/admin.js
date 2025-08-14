import { gql } from '@apollo/client';
import { ADMIN_FULL_FRAGMENT } from '../fragments/admin.js';

// Admin Authentication
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      token
      admin {
        ...AdminFull
      }
    }
  }
  ${ADMIN_FULL_FRAGMENT}
`;

export const GET_CURRENT_ADMIN = gql`
  query GetCurrentAdmin {
    currentAdmin {
      ...AdminFull
    }
  }
  ${ADMIN_FULL_FRAGMENT}
`;

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
        client {
          name
          email
        }
        product {
          name
        }
        date
        status
        totalAmount
      }
      monthlyRevenue {
        month
        revenue
        bookings
      }
      popularServices {
        service {
          _id
          name
        }
        bookingCount
      }
    }
  }
`;

// Business Analytics
export const GET_ANALYTICS = gql`
  query GetAnalytics($startDate: String!, $endDate: String!) {
    analytics(startDate: $startDate, endDate: $endDate) {
      bookingStats {
        total
        completed
        cancelled
        pending
        revenue
      }
      serviceStats {
        service {
          _id
          name
          category
        }
        bookings
        revenue
      }
      clientStats {
        newClients
        returningClients
        averageBookingValue
      }
      galleryStats {
        totalViews
        totalDownloads
        mostViewedGallery {
          _id
          title
          stats {
            views
          }
        }
      }
    }
  }
`; 
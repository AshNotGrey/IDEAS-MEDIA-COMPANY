import { gql } from 'graphql-tag';

export default gql`
  type Admin {
    _id: ID!
    username: String!
    role: AdminRole!
    permissions: [String!]!
    isActive: Boolean!
    isVerified: Boolean!
    isLocked: Boolean
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  enum AdminRole {
    admin
    manager
    super_admin
  }

  input AdminLoginInput {
    username: String!
    password: String!
  }

  input AdminRegisterInput {
    username: String!
    password: String!
    code: String
    verifierUsername: String
  }

  input CreateAdminInviteInput {
    role: AdminRole = admin
    permissions: [String!]
    ttlMinutes: Int = 60
  }

  type AdminAuthResponse {
    token: String!
    refreshToken: String
    admin: Admin!
    expiresIn: String!
  }

  type AdminInviteResponse {
    code: String!
    role: AdminRole!
    expiresAt: String!
  }

  # Analytics Types
  type RevenueAnalytics {
    period: String!
    data: [RevenueDataPoint!]!
    totalRevenue: Float!
    totalBookings: Int!
    avgOrderValue: Float!
    growthRate: Float!
  }

  type RevenueDataPoint {
    _id: DateGroup!
    revenue: Float!
    bookings: Int!
    avgOrderValue: Float!
  }

  type DateGroup {
    year: Int!
    month: Int
    day: Int
    week: Int
  }

  type BookingAnalytics {
    bookingTrends: [BookingTrend!]!
    statusDistribution: [StatusCount!]!
    peakHours: [HourCount!]!
    servicePopularity: [ServicePopularityData!]!
  }

  type BookingTrend {
    _id: DateGroup!
    total: Int!
    confirmed: Int!
    completed: Int!
    cancelled: Int!
    revenue: Float!
  }

  type StatusCount {
    _id: String!
    count: Int!
  }

  type HourCount {
    _id: Int!
    count: Int!
  }

  type ServicePopularityData {
    _id: ID!
    bookings: Int!
    revenue: Float!
    serviceInfo: [Service!]!
  }

  type UserAnalytics {
    userGrowth: [UserGrowthData!]!
    verificationStats: UserVerificationStats!
    activityPatterns: UserActivityPatterns!
    geographicData: [GeographicData!]!
  }

  type UserGrowthData {
    _id: DateGroup!
    newUsers: Int!
  }

  type UserVerificationStats {
    total: Int!
    emailVerified: Int!
    idVerified: Int!
    active: Int!
  }

  type UserActivityPatterns {
    avgBookingsPerUser: Float!
    avgSpentPerUser: Float!
    totalActiveUsers: Int!
  }

  type GeographicData {
    _id: String!
    count: Int!
  }

  type ServiceAnalytics {
    servicePerformance: [ServicePerformanceData!]!
    categoryPerformance: [CategoryPerformanceData!]!
    pricingAnalysis: [PricingAnalysisData!]!
  }

  type ServicePerformanceData {
    _id: ID!
    name: String!
    category: String!
    basePrice: Float!
    totalBookings: Int!
    totalRevenue: Float!
    avgRating: Float
    isActive: Boolean!
    featured: Boolean!
  }

  type CategoryPerformanceData {
    _id: String!
    totalServices: Int!
    activeServices: Int!
    totalBookings: Int!
    totalRevenue: Float!
    avgPrice: Float!
  }

  type PricingAnalysisData {
    _id: String!
    minPrice: Float!
    maxPrice: Float!
    avgPrice: Float!
    count: Int!
  }

  type DashboardStats {
    totalUsers: Int!
    totalBookings: Int!
    totalRevenue: Float!
    pendingReviews: Int!
    activeGalleries: Int!
    recentBookings: [Booking!]!
    monthlyRevenue: [MonthlyRevenueData!]!
    popularServices: [ServicePopularityData!]!
  }

  type MonthlyRevenueData {
    month: String!
    revenue: Float!
    bookings: Int!
  }

  extend type Query {
    currentAdmin: Admin
    dashboardStats: DashboardStats!
    getRevenueAnalytics(startDate: String, endDate: String, period: String): RevenueAnalytics!
    getBookingAnalytics(period: String, limit: Int): BookingAnalytics!
    getUserAnalytics: UserAnalytics!
    getServiceAnalytics: ServiceAnalytics!
  }

  extend type Mutation {
    adminLogin(input: AdminLoginInput!): AdminAuthResponse!
    createAdminInvite(input: CreateAdminInviteInput!): AdminInviteResponse! @admin
    registerAdmin(input: AdminRegisterInput!): Admin!
    verifyAdmin(username: String!): Admin! @admin
  }
`;



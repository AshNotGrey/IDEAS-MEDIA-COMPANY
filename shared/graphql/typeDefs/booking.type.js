import { gql } from 'graphql-tag';

export default gql`
  type Booking {
    _id: ID!
    client: User!
    product: Product!
    date: String!
    time: String!
    duration: Int!
    location: LocationInfo!
    status: BookingStatus!
    totalAmount: Float!
    paid: Boolean!
    paymentMethod: String
    notes: String
    specialRequests: [String!]!
    contactInfo: ContactInfo!
    createdAt: String!
    updatedAt: String!
  }

  type LocationInfo {
    type: LocationType!
    address: String
    coordinates: Coordinates
  }

  type ContactInfo {
    phone: String
    email: String
    alternateContact: String
  }

  type Coordinates {
    lat: Float
    lng: Float
  }

  enum LocationType {
    studio
    outdoor
    client_location
  }

  enum BookingStatus {
    pending
    confirmed
    in_progress
    completed
    cancelled
  }

  input BookingInput {
    productId: ID!
    date: String!
    time: String!
    duration: Int!
    location: LocationInput!
    notes: String
    specialRequests: [String!]
    contactInfo: ContactInfoInput!
  }

  input LocationInput {
    type: LocationType!
    address: String
    coordinates: CoordinatesInput
  }

  input ContactInfoInput {
    phone: String
    email: String
    alternateContact: String
  }

  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }

  # Response Types
  type BookingsResponse {
    bookings: [Booking!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type BookingStats {
    totalBookings: Int!
    pendingBookings: Int!
    confirmedBookings: Int!
    completedBookings: Int!
    cancelledBookings: Int!
    thisMonthBookings: Int!
    thisWeekBookings: Int!
    unpaidBookings: Int!
    totalRevenue: Float!
    thisMonthRevenue: Float!
  }

  # Input Types
  input BookingFilterInput {
    status: BookingStatus
    paid: Boolean
    clientId: ID
    productId: ID
    dateFrom: String
    dateTo: String
    search: String
  }

  input UpdateBookingInput {
    date: String
    time: String
    duration: Int
    location: LocationInput
    status: BookingStatus
    totalAmount: Float
    paid: Boolean
    paymentMethod: String
    notes: String
    specialRequests: [String!]
    contactInfo: ContactInfoInput
  }

  extend type Query {
    bookings(
      filter: BookingFilterInput
      page: Int = 1
      limit: Int = 20
      sortBy: String = "date"
      sortOrder: String = "desc"
    ): BookingsResponse
    
    booking(id: ID!): Booking
    bookingStats: BookingStats
    upcomingBookings(limit: Int = 10): [Booking!]!
    todaysBookings: [Booking!]!
  }

  extend type Mutation {
    createBooking(input: BookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    updatePaymentStatus(id: ID!, paid: Boolean!, paymentMethod: String): Booking!
    assignBooking(id: ID!, adminId: ID!): Booking!
    deleteBooking(id: ID!): Boolean!
    bulkUpdateBookings(ids: [ID!]!, input: UpdateBookingInput!): [Booking!]!
  }
`; 
import { gql } from '@apollo/client';

// Booking fragments
const BOOKING_BASIC_FRAGMENT = gql`
  fragment BookingBasic on Booking {
    _id
    date
    time
    duration
    status
    totalAmount
    paid
    paymentMethod
    createdAt
    updatedAt
  }
`;

const BOOKING_FULL_FRAGMENT = gql`
  fragment BookingFull on Booking {
    _id
    client {
      _id
      name
      email
      phone
      avatar
    }
    product {
      _id
      name
      category
      price
      description
    }
    date
    time
    duration
    location {
      type
      address
      coordinates {
        lat
        lng
      }
    }
    status
    totalAmount
    paid
    paymentMethod
    notes
    specialRequests
    contactInfo {
      phone
      email
      alternateContact
    }
    assignedTo {
      _id
      name
      email
    }
    createdAt
    updatedAt
  }
`;

// Booking queries
export const GET_BOOKINGS = gql`
  query GetBookings(
    $filter: BookingFilterInput
    $page: Int = 1
    $limit: Int = 20
    $sortBy: String = "date"
    $sortOrder: String = "desc"
  ) {
    bookings(
      filter: $filter
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      bookings {
        ...BookingFull
      }
      total
      page
      limit
      totalPages
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const GET_BOOKING_STATS = gql`
  query GetBookingStats {
    bookingStats {
      totalBookings
      pendingBookings
      confirmedBookings
      completedBookings
      cancelledBookings
      thisMonthBookings
      thisWeekBookings
      unpaidBookings
      totalRevenue
      thisMonthRevenue
    }
  }
`;

export const GET_UPCOMING_BOOKINGS = gql`
  query GetUpcomingBookings($limit: Int = 10) {
    upcomingBookings(limit: $limit) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const GET_TODAYS_BOOKINGS = gql`
  query GetTodaysBookings {
    todaysBookings {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

// Booking mutations
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
    updateBooking(id: $id, input: $input) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: BookingStatus!) {
    updateBookingStatus(id: $id, status: $status) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($id: ID!, $paid: Boolean!, $paymentMethod: String) {
    updatePaymentStatus(id: $id, paid: $paid, paymentMethod: $paymentMethod) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const ASSIGN_BOOKING = gql`
  mutation AssignBooking($id: ID!, $adminId: ID!) {
    assignBooking(id: $id, adminId: $adminId) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;

export const BULK_UPDATE_BOOKINGS = gql`
  mutation BulkUpdateBookings($ids: [ID!]!, $input: UpdateBookingInput!) {
    bulkUpdateBookings(ids: $ids, input: $input) {
      ...BookingFull
    }
  }
  ${BOOKING_FULL_FRAGMENT}
`;

export { BOOKING_BASIC_FRAGMENT, BOOKING_FULL_FRAGMENT };
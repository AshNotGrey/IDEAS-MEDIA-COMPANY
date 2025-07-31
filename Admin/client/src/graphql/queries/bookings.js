import { gql } from '@apollo/client';

// Import fragments from client package (assuming they're shared)
const BOOKING_WITH_RELATIONS_FRAGMENT = gql`
  fragment BookingWithRelations on Booking {
    _id
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
    client {
      _id
      name
      email
      role
    }
    product {
      _id
      name
      price
      category
    }
    createdAt
    updatedAt
  }
`;

// Admin Booking Queries
export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings($filter: BookingFilter) {
    bookings(filter: $filter) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const GET_UPCOMING_BOOKINGS = gql`
  query GetUpcomingBookings {
    upcomingBookings {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

// Admin Booking Mutations
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $input: BookingInput!) {
    updateBooking(id: $id, input: $input) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const MARK_BOOKING_PAID = gql`
  mutation MarkBookingPaid($id: ID!, $paymentMethod: String!) {
    markBookingPaid(id: $id, paymentMethod: $paymentMethod) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`; 
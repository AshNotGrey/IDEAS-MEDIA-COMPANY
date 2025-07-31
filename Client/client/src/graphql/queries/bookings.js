import { gql } from '@apollo/client';
import { BOOKING_WITH_RELATIONS_FRAGMENT } from '../fragments/booking.js';

// Booking Queries
export const GET_USER_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    userBookings(userId: $userId) {
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

// Booking Mutations
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

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      ...BookingWithRelations
    }
  }
  ${BOOKING_WITH_RELATIONS_FRAGMENT}
`;

// Availability Queries
export const CHECK_AVAILABILITY = gql`
  query CheckAvailability($date: String!, $duration: Int!) {
    checkAvailability(date: $date, duration: $duration) {
      available
      suggestedTimes
    }
  }
`;

export const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($startDate: String!, $endDate: String!) {
    getAvailableSlots(startDate: $startDate, endDate: $endDate) {
      date
      availableSlots {
        time
        duration
      }
    }
  }
`; 
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

  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
  }

  type Mutation {
    createBooking(input: BookingInput!): Booking!
  }
`; 
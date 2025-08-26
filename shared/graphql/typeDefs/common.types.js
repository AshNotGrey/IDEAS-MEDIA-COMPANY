import { gql } from 'graphql-tag';

export const commonTypes = gql`
  # Common input types used across multiple resolvers
  input SortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }

  # Common response types
  type PaginationInfo {
    currentPage: Int!
    totalPages: Int!
    totalItems: Int!
    itemsPerPage: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  # Date and time types
  scalar DateTime
  scalar Date
  scalar Time

  # Range types for filtering
  type DateRange {
    from: DateTime
    to: DateTime
  }

  input DateRangeInput {
    from: DateTime
    to: DateTime
  }

  type NumberRange {
    min: Float
    max: Float
  }

  input NumberRangeInput {
    min: Float
    max: Float
  }

  # JSON scalar for flexible data
  scalar JSON

  # Location and address types
  type LocationInfo {
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    coordinates: Coordinates
  }

  input LocationInfoInput {
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    coordinates: CoordinatesInput
  }

  type Coordinates {
    latitude: Float!
    longitude: Float!
  }

  input CoordinatesInput {
    latitude: Float!
    longitude: Float!
  }

  # Cancellation and refund types
  type CancellationInfo {
    reason: String
    requestedAt: DateTime
    processedAt: DateTime
    refundAmount: Float
    refundMethod: String
  }

  input CancellationInfoInput {
    reason: String!
    refundAmount: Float
    refundMethod: String
  }

  # CTA (Call to Action) types
  input CTAInput {
    text: String!
    url: String
    action: String
    style: String
  }

  # Login and authentication types
  input LoginInput {
    username: String!
    password: String!
    rememberMe: Boolean
  }

  # Generic notification types
  type GenericNotification {
    id: ID!
    type: String!
    title: String!
    message: String!
    isRead: Boolean!
    createdAt: DateTime!
    data: JSON
  }
`;

export default commonTypes;

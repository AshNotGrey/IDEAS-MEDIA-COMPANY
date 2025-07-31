import { gql } from 'graphql-tag';

const reviewTypeDefs = gql`
  type Review {
    _id: ID!
    client: User!
    booking: Booking!
    service: Service
    rating: Int!
    title: String!
    comment: String!
    categories: ReviewCategories
    isApproved: Boolean!
    isFeatured: Boolean!
    isPublic: Boolean!
    response: ReviewResponse
    helpful: ReviewHelpful!
    photos: [String!]
    metadata: ReviewMetadata
    createdAt: String
    updatedAt: String
  }

  type ReviewCategories {
    communication: Int
    quality: Int
    professionalism: Int
    value: Int
    timeliness: Int
  }

  type ReviewResponse {
    text: String!
    date: String!
    respondedBy: User!
  }

  type ReviewHelpful {
    count: Int!
    users: [User!]
  }

  type ReviewMetadata {
    source: String!
    ip: String
    userAgent: String
  }

  input ReviewInput {
    client: ID!
    booking: ID!
    service: ID
    rating: Int!
    title: String!
    comment: String!
    categories: ReviewCategoriesInput
    photos: [String!]
  }

  input ReviewCategoriesInput {
    communication: Int
    quality: Int
    professionalism: Int
    value: Int
    timeliness: Int
  }

  input ReviewResponseInput {
    text: String!
    respondedBy: ID!
  }

  input ReviewFilter {
    client: ID
    rating: Int
    isApproved: Boolean
    isFeatured: Boolean
    isPublic: Boolean
  }

  type Query {
    reviews(filter: ReviewFilter): [Review!]!
    review(id: ID!): Review
    publicReviews: [Review!]!
    featuredReviews: [Review!]!
    clientReviews(clientId: ID!): [Review!]!
    pendingReviews: [Review!]!
    averageRating: Float!
  }

  type Mutation {
    createReview(input: ReviewInput!): Review!
    updateReview(id: ID!, input: ReviewInput!): Review!
    deleteReview(id: ID!): Review!
    approveReview(id: ID!): Review!
    rejectReview(id: ID!): Review!
    toggleReviewFeatured(id: ID!): Review!
    respondToReview(id: ID!, response: ReviewResponseInput!): Review!
    markReviewHelpful(id: ID!, userId: ID!): Review!
    unmarkReviewHelpful(id: ID!, userId: ID!): Review!
  }
`;

export default reviewTypeDefs; 
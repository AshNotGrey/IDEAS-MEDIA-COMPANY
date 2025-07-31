import { gql } from '@apollo/client';
import { REVIEW_WITH_RELATIONS_FRAGMENT } from '../fragments/review.js';

// Review Queries
export const GET_PUBLIC_REVIEWS = gql`
  query GetPublicReviews {
    publicReviews {
      ...ReviewWithRelations
    }
  }
  ${REVIEW_WITH_RELATIONS_FRAGMENT}
`;

export const GET_FEATURED_REVIEWS = gql`
  query GetFeaturedReviews {
    featuredReviews {
      ...ReviewWithRelations
    }
  }
  ${REVIEW_WITH_RELATIONS_FRAGMENT}
`;

export const GET_CLIENT_REVIEWS = gql`
  query GetClientReviews($clientId: ID!) {
    clientReviews(clientId: $clientId) {
      ...ReviewWithRelations
    }
  }
  ${REVIEW_WITH_RELATIONS_FRAGMENT}
`;

export const GET_AVERAGE_RATING = gql`
  query GetAverageRating {
    averageRating
  }
`;

// Review Mutations
export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      ...ReviewWithRelations
    }
  }
  ${REVIEW_WITH_RELATIONS_FRAGMENT}
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: ReviewInput!) {
    updateReview(id: $id, input: $input) {
      ...ReviewWithRelations
    }
  }
  ${REVIEW_WITH_RELATIONS_FRAGMENT}
`;

export const MARK_REVIEW_HELPFUL = gql`
  mutation MarkReviewHelpful($id: ID!, $userId: ID!) {
    markReviewHelpful(id: $id, userId: $userId) {
      _id
      helpful {
        count
        users {
          _id
        }
      }
    }
  }
`;

export const UNMARK_REVIEW_HELPFUL = gql`
  mutation UnmarkReviewHelpful($id: ID!, $userId: ID!) {
    unmarkReviewHelpful(id: $id, userId: $userId) {
      _id
      helpful {
        count
        users {
          _id
        }
      }
    }
  }
`; 
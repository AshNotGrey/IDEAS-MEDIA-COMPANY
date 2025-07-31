import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from './user.js';
import { BOOKING_BASIC_FRAGMENT } from './booking.js';
import { SERVICE_BASIC_FRAGMENT } from './service.js';

export const REVIEW_BASIC_FRAGMENT = gql`
  fragment ReviewBasic on Review {
    _id
    rating
    title
    comment
    categories {
      communication
      quality
      professionalism
      value
      timeliness
    }
    isApproved
    isFeatured
    isPublic
    response {
      text
      date
      respondedBy {
        ...UserBasic
      }
    }
    helpful {
      count
      users {
        ...UserBasic
      }
    }
    photos
    metadata {
      source
      ip
      userAgent
    }
    createdAt
    updatedAt
  }
  ${USER_BASIC_FRAGMENT}
`;

export const REVIEW_WITH_RELATIONS_FRAGMENT = gql`
  fragment ReviewWithRelations on Review {
    ...ReviewBasic
    client {
      ...UserBasic
    }
    booking {
      ...BookingBasic
    }
    service {
      ...ServiceBasic
    }
  }
  ${REVIEW_BASIC_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
  ${BOOKING_BASIC_FRAGMENT}
  ${SERVICE_BASIC_FRAGMENT}
`; 
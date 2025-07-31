import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from './user.js';
import { PRODUCT_BASIC_FRAGMENT } from './product.js';

export const BOOKING_BASIC_FRAGMENT = gql`
  fragment BookingBasic on Booking {
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
    createdAt
    updatedAt
  }
`;

export const BOOKING_WITH_RELATIONS_FRAGMENT = gql`
  fragment BookingWithRelations on Booking {
    ...BookingBasic
    client {
      ...UserBasic
    }
    product {
      ...ProductBasic
    }
  }
  ${BOOKING_BASIC_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
  ${PRODUCT_BASIC_FRAGMENT}
`; 
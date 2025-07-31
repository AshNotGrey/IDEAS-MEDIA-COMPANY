import { gql } from '@apollo/client';

export const PRODUCT_BASIC_FRAGMENT = gql`
  fragment ProductBasic on Product {
    _id
    name
    description
    price
    category
    duration
    images
    features
    isActive
    maxBookings
    tags
    createdAt
    updatedAt
  }
`;

export const PRODUCT_FULL_FRAGMENT = gql`
  fragment ProductFull on Product {
    ...ProductBasic
  }
  ${PRODUCT_BASIC_FRAGMENT}
`; 
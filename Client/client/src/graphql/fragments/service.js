import { gql } from '@apollo/client';

export const SERVICE_BASIC_FRAGMENT = gql`
  fragment ServiceBasic on Service {
    _id
    name
    description
    category
    basePrice
    priceStructure {
      type
      additionalHourRate
      packageDetails
    }
    duration {
      min
      max
    }
    includes
    addOns {
      name
      description
      price
    }
    equipment
    deliverables {
      photos {
        digital
        prints
      }
      editedPhotos
      deliveryTime
      format
    }
    isActive
    featured
    images
    tags
    createdAt
    updatedAt
  }
`;

export const SERVICE_FULL_FRAGMENT = gql`
  fragment ServiceFull on Service {
    ...ServiceBasic
  }
  ${SERVICE_BASIC_FRAGMENT}
`; 
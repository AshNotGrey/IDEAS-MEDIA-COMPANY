import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from './user.js';

export const ORDER_BASIC_FRAGMENT = gql`
  fragment OrderBasic on Order {
    _id
    orderNumber
    uuid
    orderType
    status
    pricing {
      subtotal
      discountTotal
      taxTotal
      shippingTotal
      securityDeposit
      total
      currency
    }
    workflow {
      placedAt
      confirmedAt
      preparedAt
      deliveredAt
      completedAt
      cancelledAt
    }
    payment {
      method
      status
      paystack {
        reference
        paidAt
      }
      amounts {
        paid
        refunded
        pending
      }
    }
    receipt {
      generated
      generatedAt
      url
      emailSent
    }
    createdAt
    updatedAt
  }
`;

export const ORDER_ITEM_FRAGMENT = gql`
  fragment OrderItem on OrderItem {
    _id
    productInfo {
      name
      sku
      type
      category
      images {
        thumbnail
      }
    }
    quantity
    unitPrice
    discount {
      type
      value
      reason
    }
    subtotal
    rentalPeriod {
      startDate
      endDate
      duration
      pickupTime
      returnTime
    }
    serviceDetails {
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
      specialRequests
    }
    status
  }
`;

export const ORDER_WITH_ITEMS_FRAGMENT = gql`
  fragment OrderWithItems on Order {
    ...OrderBasic
    items {
      ...OrderItem
    }
  }
  ${ORDER_BASIC_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

export const ORDER_WITH_RELATIONS_FRAGMENT = gql`
  fragment OrderWithRelations on Order {
    ...OrderWithItems
    customer {
      ...UserBasic
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
`;

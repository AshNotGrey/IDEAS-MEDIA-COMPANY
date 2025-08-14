import { gql } from '@apollo/client';

// Order/Cart mutations and queries
export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      order {
        _id
        orderNumber
        items {
          _id
          productInfo {
            name
            sku
            type
            category
          }
          quantity
          unitPrice
          subtotal
          serviceDetails {
            date
            time
            duration
            location {
              type
              address
            }
            specialRequests
          }
        }
        pricing {
          subtotal
          total
          currency
        }
      }
      message
    }
  }
`;

export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      _id
      orderNumber
      items {
        _id
        productInfo {
          name
          sku
          type
          category
        }
        quantity
        unitPrice
        subtotal
        serviceDetails {
          date
          time
          duration
          location {
            type
            address
          }
          specialRequests
        }
      }
      pricing {
        subtotal
        total
        currency
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      order {
        _id
        orderNumber
        items {
          _id
          productInfo {
            name
            sku
            type
            category
          }
          quantity
          unitPrice
          subtotal
        }
        pricing {
          subtotal
          total
          currency
        }
      }
      message
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      order {
        _id
        orderNumber
        items {
          _id
          productInfo {
            name
            sku
            type
            category
          }
          quantity
          unitPrice
          subtotal
        }
        pricing {
          subtotal
          total
          currency
        }
      }
      message
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      order {
        _id
        orderNumber
        items {
          _id
        }
        pricing {
          subtotal
          total
          currency
        }
      }
      message
    }
  }
`;

export const PROCEED_TO_CHECKOUT = gql`
  mutation ProceedToCheckout($input: CheckoutInput!) {
    proceedToCheckout(input: $input) {
      _id
      orderNumber
      status
      pricing {
        subtotal
        total
        currency
      }
    }
  }
`;

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($orderId: ID!, $input: PaymentInput!) {
    initiatePayment(orderId: $orderId, input: $input) {
      success
      order {
        _id
        orderNumber
        status
      }
      paymentUrl
      reference
      message
    }
  }
`;

// History Queries
export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: ID!, $filters: OrderFiltersInput) {
    userOrders(userId: $userId, filters: $filters) {
      _id
      orderNumber
      uuid
      orderType
      status
      items {
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
        subtotal
        rentalPeriod {
          startDate
          endDate
          duration
        }
        serviceDetails {
          date
          time
          duration
          location {
            type
            address
          }
          specialRequests
        }
        status
      }
      pricing {
        subtotal
        discountTotal
        total
        currency
      }
      workflow {
        placedAt
        confirmedAt
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
      }
      receipt {
        generated
        url
      }
      fulfillment {
        method
        location
        scheduledDate
        scheduledTime
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($userId: ID!, $filters: TransactionFiltersInput) {
    userTransactions(userId: $userId, filters: $filters) {
      _id
      reference
      type
      amount
      currency
      status
      paidAt
      order {
        _id
        orderNumber
        orderType
      }
      booking {
        _id
        date
        time
        product {
          _id
          name
          type
        }
      }
      createdAt
      updatedAt
    }
  }
`;
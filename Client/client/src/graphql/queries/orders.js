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
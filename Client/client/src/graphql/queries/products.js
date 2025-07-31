import { gql } from '@apollo/client';
import { PRODUCT_FULL_FRAGMENT } from '../fragments/product.js';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilter) {
    products(filter: $filter) {
      ...ProductFull
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFull
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    featuredProducts {
      ...ProductFull
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
`;

// Product Search
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($searchTerm: String!, $filter: ProductFilter) {
    searchProducts(searchTerm: $searchTerm, filter: $filter) {
      ...ProductFull
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
`;

// Product Categories
export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    productCategories {
      category
      count
    }
  }
`; 
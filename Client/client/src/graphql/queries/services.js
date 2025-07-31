import { gql } from '@apollo/client';
import { SERVICE_FULL_FRAGMENT } from '../fragments/service.js';

// Service Queries
export const GET_SERVICES = gql`
  query GetServices($filter: ServiceFilter) {
    services(filter: $filter) {
      ...ServiceFull
    }
  }
  ${SERVICE_FULL_FRAGMENT}
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      ...ServiceFull
    }
  }
  ${SERVICE_FULL_FRAGMENT}
`;

export const GET_FEATURED_SERVICES = gql`
  query GetFeaturedServices {
    featuredServices {
      ...ServiceFull
    }
  }
  ${SERVICE_FULL_FRAGMENT}
`;

export const GET_SERVICES_BY_CATEGORY = gql`
  query GetServicesByCategory($category: String!) {
    servicesByCategory(category: $category) {
      ...ServiceFull
    }
  }
  ${SERVICE_FULL_FRAGMENT}
`;

// Service Categories
export const GET_SERVICE_CATEGORIES = gql`
  query GetServiceCategories {
    serviceCategories {
      category
      count
      averagePrice
    }
  }
`; 
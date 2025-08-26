import { gql } from '@apollo/client';

// Service fragments
export const SERVICE_FRAGMENT = gql`
  fragment ServiceInfo on Service {
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

// Admin Queries
export const GET_ALL_SERVICES = gql`
  ${SERVICE_FRAGMENT}
  query GetAllServices(
    $page: Int = 1
    $limit: Int = 20
    $search: String
    $category: String
    $sortBy: String = "createdAt"
    $sortOrder: String = "desc"
  ) {
    allServices(
      page: $page
      limit: $limit
      search: $search
      category: $category
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      services {
        ...ServiceInfo
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_SERVICE_STATS = gql`
  query GetServiceStats {
    serviceStats {
      totalServices
      activeServices
      inactiveServices
      featuredServices
      categoryStats {
        _id
        count
      }
      avgPricing {
        _id
        avgPrice
        minPrice
        maxPrice
      }
    }
  }
`;

export const GET_SERVICE_BY_ID = gql`
  ${SERVICE_FRAGMENT}
  query GetServiceById($id: ID!) {
    service(id: $id) {
      ...ServiceInfo
    }
  }
`;

// Client Queries (for public use)
export const GET_FEATURED_SERVICES = gql`
  ${SERVICE_FRAGMENT}
  query GetFeaturedServices {
    featuredServices {
      ...ServiceInfo
    }
  }
`;

export const GET_SERVICES_BY_CATEGORY = gql`
  ${SERVICE_FRAGMENT}
  query GetServicesByCategory($category: String!) {
    servicesByCategory(category: $category) {
      ...ServiceInfo
    }
  }
`;

export const GET_SERVICES = gql`
  ${SERVICE_FRAGMENT}
  query GetServices($filter: ServiceFilter) {
    services(filter: $filter) {
      ...ServiceInfo
    }
  }
`;

// Mutations
export const CREATE_SERVICE = gql`
  ${SERVICE_FRAGMENT}
  mutation CreateService($input: ServiceInput!) {
    createService(input: $input) {
      ...ServiceInfo
    }
  }
`;

export const UPDATE_SERVICE = gql`
  ${SERVICE_FRAGMENT}
  mutation UpdateService($id: ID!, $input: ServiceInput!) {
    updateService(id: $id, input: $input) {
      ...ServiceInfo
    }
  }
`;

export const DELETE_SERVICE = gql`
  ${SERVICE_FRAGMENT}
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      ...ServiceInfo
    }
  }
`;

export const TOGGLE_SERVICE_STATUS = gql`
  ${SERVICE_FRAGMENT}
  mutation ToggleServiceStatus($id: ID!) {
    toggleServiceStatus(id: $id) {
      ...ServiceInfo
    }
  }
`;

export const TOGGLE_SERVICE_FEATURED = gql`
  ${SERVICE_FRAGMENT}
  mutation ToggleServiceFeatured($id: ID!) {
    toggleServiceFeatured(id: $id) {
      ...ServiceInfo
    }
  }
`;

export const BULK_UPDATE_SERVICES = gql`
  ${SERVICE_FRAGMENT}
  mutation BulkUpdateServices($ids: [ID!]!, $input: UpdateServiceInput!) {
    bulkUpdateServices(ids: $ids, input: $input) {
      ...ServiceInfo
    }
  }
`;

export const BULK_DELETE_SERVICES = gql`
  mutation BulkDeleteServices($ids: [ID!]!) {
    bulkDeleteServices(ids: $ids)
  }
`;

import { gql } from 'graphql-tag';

const serviceTypeDefs = gql`
  type Service {
    _id: ID!
    name: String!
    description: String!
    category: String!
    basePrice: Float!
    priceStructure: PriceStructure!
    duration: DurationRange!
    includes: [String!]
    addOns: [AddOn!]
    equipment: [String!]
    deliverables: Deliverables!
    isActive: Boolean!
    featured: Boolean!
    images: [String!]
    tags: [String!]
    createdAt: String
    updatedAt: String
  }

  type PriceStructure {
    type: String!
    additionalHourRate: Float
    packageDetails: String
  }

  type DurationRange {
    min: Int!
    max: Int!
  }

  type AddOn {
    name: String!
    description: String
    price: Float!
  }

  type Deliverables {
    photos: PhotoDeliverables!
    editedPhotos: Int!
    deliveryTime: String!
    format: [String!]!
  }

  type PhotoDeliverables {
    digital: Int!
    prints: Int!
  }

  input ServiceInput {
    name: String!
    description: String!
    category: String!
    basePrice: Float!
    priceStructure: PriceStructureInput!
    duration: DurationRangeInput!
    includes: [String!]
    addOns: [AddOnInput!]
    equipment: [String!]
    deliverables: DeliverablesInput!
    featured: Boolean
    images: [String!]
    tags: [String!]
  }

  input PriceStructureInput {
    type: String!
    additionalHourRate: Float
    packageDetails: String
  }

  input DurationRangeInput {
    min: Int!
    max: Int!
  }

  input AddOnInput {
    name: String!
    description: String
    price: Float!
  }

  input DeliverablesInput {
    photos: PhotoDeliverablesInput!
    editedPhotos: Int!
    deliveryTime: String!
    format: [String!]!
  }

  input PhotoDeliverablesInput {
    digital: Int!
    prints: Int!
  }

  input ServiceFilter {
    category: String
    isActive: Boolean
    featured: Boolean
    minPrice: Float
    maxPrice: Float
  }

  type Query {
    services(filter: ServiceFilter): [Service!]!
    service(id: ID!): Service
    featuredServices: [Service!]!
    servicesByCategory(category: String!): [Service!]!
  }

  type Mutation {
    createService(input: ServiceInput!): Service!
    updateService(id: ID!, input: ServiceInput!): Service!
    deleteService(id: ID!): Service!
    toggleServiceStatus(id: ID!): Service!
    toggleServiceFeatured(id: ID!): Service!
  }
`;

export default serviceTypeDefs; 
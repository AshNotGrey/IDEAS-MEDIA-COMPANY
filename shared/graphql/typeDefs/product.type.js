import { gql } from 'graphql-tag';

const productTypeDefs = gql`
  type Product {
    _id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    duration: Int
    images: [String!]
    features: [String!]
    isActive: Boolean!
    maxBookings: Int!
    tags: [String!]
    createdAt: String
    updatedAt: String
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    category: String!
    duration: Int
    images: [String!]
    features: [String!]
    maxBookings: Int
    tags: [String!]
  }

  input ProductFilter {
    category: String
    isActive: Boolean
    minPrice: Float
    maxPrice: Float
    tags: [String!]
  }

  type Query {
    products(filter: ProductFilter): [Product!]!
    product(id: ID!): Product
    featuredProducts: [Product!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!, input: ProductInput!): Product!
    toggleProductStatus(id: ID!): Product!
  }
`;

export default productTypeDefs; 
import { gql } from 'graphql-tag';

const galleryTypeDefs = gql`
  type Gallery {
    _id: ID!
    title: String!
    description: String
    category: String!
    images: [GalleryImage!]!
    coverImage: String
    isPublished: Boolean!
    featured: Boolean!
    tags: [String!]
    createdBy: User!
    createdAt: String
    updatedAt: String
  }

  type GalleryImage {
    url: String!
    caption: String
    alt: String
    order: Int!
    metadata: ImageMetadata
  }

  type ImageMetadata {
    width: Int
    height: Int
    size: Int
    format: String
  }

  type GallerySettings {
    allowDownload: Boolean!
    allowShare: Boolean!
    watermark: Boolean!
    rightClickProtection: Boolean!
  }

  type GalleryStats {
    views: Int!
    downloads: Int!
    shares: Int!
  }

  input GalleryInput {
    title: String!
    description: String
    category: String!
    images: [GalleryImageInput!]!
    coverImage: String
    isPublished: Boolean
    featured: Boolean
    tags: [String!]
  }

  input GalleryImageInput {
    url: String!
    caption: String
    alt: String
    order: Int
    metadata: ImageMetadataInput
  }

  input ImageMetadataInput {
    width: Int
    height: Int
    size: Int
    format: String
  }

  input GallerySettingsInput {
    allowDownload: Boolean
    allowShare: Boolean
    watermark: Boolean
    rightClickProtection: Boolean
  }

  # Response Types for Admin
  type GalleriesResponse {
    galleries: [Gallery!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type GalleryStats {
    totalGalleries: Int!
    publishedGalleries: Int!
    unpublishedGalleries: Int!
    featuredGalleries: Int!
    categoryStats: [CategoryStat!]!
    monthlyStats: [MonthlyStat!]!
  }

  type CategoryStat {
    _id: String!
    count: Int!
  }

  type MonthlyStat {
    _id: MonthYear!
    count: Int!
  }

  type MonthYear {
    year: Int!
    month: Int!
  }

  # Update Input for bulk operations
  input UpdateGalleryInput {
    title: String
    description: String
    category: String
    images: [GalleryImageInput!]
    coverImage: String
    isPublished: Boolean
    featured: Boolean
    tags: [String!]
  }

  input GalleryFilter {
    category: String
    isPublished: Boolean
    featured: Boolean
  }

  extend type Query {
    galleries(filter: GalleryFilter): [Gallery!]!
    gallery(id: ID!): Gallery
    publicGalleries: [Gallery!]!
    featuredGalleries: [Gallery!]!
    
    # Admin-only queries
    galleryStats: GalleryStats!
    allGalleries(
      page: Int = 1
      limit: Int = 20
      search: String
      category: String
      published: Boolean
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): GalleriesResponse!
  }

  extend type Mutation {
    createGallery(input: GalleryInput!): Gallery!
    updateGallery(id: ID!, input: GalleryInput!): Gallery!
    deleteGallery(id: ID!): Gallery!
    toggleGalleryPublished(id: ID!): Gallery!
    toggleGalleryFeatured(id: ID!): Gallery!
    addImageToGallery(galleryId: ID!, image: GalleryImageInput!): Gallery!
    removeImageFromGallery(galleryId: ID!, imageUrl: String!): Gallery!
    
    # Admin bulk operations
    bulkUpdateGalleries(ids: [ID!]!, input: UpdateGalleryInput!): [Gallery!]!
    bulkDeleteGalleries(ids: [ID!]!): Boolean!
  }
`;

export default galleryTypeDefs; 
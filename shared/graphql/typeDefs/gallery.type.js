import { gql } from 'graphql-tag';

const galleryTypeDefs = gql`
  type Gallery {
    _id: ID!
    title: String!
    description: String
    category: String!
    coverImage: String!
    images: [GalleryImage!]!
    client: User
    booking: Booking
    isPublic: Boolean!
    isFeatured: Boolean!
    accessCode: String
    settings: GallerySettings!
    stats: GalleryStats!
    tags: [String!]
    expiresAt: String
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
    coverImage: String!
    images: [GalleryImageInput!]!
    client: ID
    booking: ID
    isPublic: Boolean
    isFeatured: Boolean
    accessCode: String
    settings: GallerySettingsInput
    tags: [String!]
    expiresAt: String
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

  input GalleryFilter {
    category: String
    isPublic: Boolean
    isFeatured: Boolean
    client: ID
  }

  type Query {
    galleries(filter: GalleryFilter): [Gallery!]!
    gallery(id: ID!): Gallery
    publicGalleries: [Gallery!]!
    featuredGalleries: [Gallery!]!
    clientGalleries(clientId: ID!): [Gallery!]!
    galleryByAccessCode(accessCode: String!): Gallery
  }

  type Mutation {
    createGallery(input: GalleryInput!): Gallery!
    updateGallery(id: ID!, input: GalleryInput!): Gallery!
    deleteGallery(id: ID!): Gallery!
    toggleGalleryPublic(id: ID!): Gallery!
    toggleGalleryFeatured(id: ID!): Gallery!
    incrementGalleryViews(id: ID!): Gallery!
    addImageToGallery(galleryId: ID!, image: GalleryImageInput!): Gallery!
    removeImageFromGallery(galleryId: ID!, imageUrl: String!): Gallery!
  }
`;

export default galleryTypeDefs; 
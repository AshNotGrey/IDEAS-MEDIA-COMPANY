import { gql } from 'graphql-tag';

export const mediaTypeDefs = gql`
  # Media Types
  type Media {
    _id: ID!
    filename: String!
    originalName: String!
    mimeType: String!
    fileSize: Int!
    cloudinaryId: String!
    url: String!
    secureUrl: String!
    type: MediaType!
    category: MediaCategory!
    dimensions: MediaDimensions
    format: String
    folder: String!
    tags: [String!]!
    alt: String
    description: String
    isPublic: Boolean!
    isActive: Boolean!
    usageCount: Int!
    lastUsed: DateTime
    usedBy: [MediaUsage!]!
    uploadedBy: User!
    uploaderModel: String!
    transformations: MediaTransformations
    seo: MediaSEO
    version: Int!
    originalMedia: Media
    status: MediaStatus!
    expiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Virtual fields
    fileExtension: String
    isImage: Boolean
    isVideo: Boolean
    isDocument: Boolean
    formattedSize: String
  }

  type MediaDimensions {
    width: Int
    height: Int
  }

  type MediaTransformations {
    thumbnail: String
    small: String
    medium: String
    large: String
    optimized: String
  }

  type MediaUsage {
    model: String!
    modelId: ID!
    field: String
    usedAt: DateTime!
  }

  type MediaSEO {
    title: String
    keywords: [String!]
    caption: String
  }

  type MediaResponse {
    media: [Media!]!
    pagination: PaginationInfo!
  }

  type MediaStats {
    totalFiles: Int!
    totalSize: Float!
    byType: [MediaTypeStats!]!
  }

  type MediaTypeStats {
    _id: String!
    count: Int!
    totalSize: Float!
    avgSize: Float!
  }

  type UploadResponse {
    success: Boolean!
    message: String!
    media: Media
    errors: [String!]
  }

  type MultipleUploadResponse {
    success: Boolean!
    message: String!
    successful: [UploadResult!]!
    failed: [UploadError!]!
    summary: UploadSummary!
  }

  type UploadResult {
    success: Boolean!
    filename: String!
    media: Media!
  }

  type UploadError {
    success: Boolean!
    filename: String!
    error: String!
  }

  type UploadSummary {
    total: Int!
    successful: Int!
    failed: Int!
  }

  type FolderContents {
    resources: [CloudinaryResource!]!
    next_cursor: String
    total_count: Int
  }

  type CloudinaryResource {
    public_id: String!
    format: String!
    version: Int!
    resource_type: String!
    type: String!
    created_at: String!
    bytes: Int!
    width: Int
    height: Int
    url: String!
    secure_url: String!
  }

  # Enums
  enum MediaType {
    image
    video
    document
    audio
    other
  }

  enum MediaCategory {
    gallery
    service_image
    profile_image
    thumbnail
    document
    logo
    banner
    portfolio
    equipment
    verification
    email_template
    other
  }

  enum MediaStatus {
    uploading
    processing
    ready
    failed
    archived
  }

  enum MediaSortBy {
    createdAt
    updatedAt
    filename
    fileSize
    usageCount
    lastUsed
  }

  # Input Types
  input MediaFilterInput {
    category: MediaCategory
    type: MediaType
    tags: [String!]
    status: MediaStatus
    isPublic: Boolean
    search: String
    uploadedBy: ID
    dateFrom: DateTime
    dateTo: DateTime
  }

  input MediaUpdateInput {
    alt: String
    description: String
    tags: [String!]
    category: MediaCategory
    isPublic: Boolean
    seo: MediaSEOInput
  }

  input MediaSEOInput {
    title: String
    keywords: [String!]
    caption: String
  }

  input MediaSortInput {
    field: MediaSortBy!
    direction: SortDirection!
  }

  input UploadConfigInput {
    category: MediaCategory
    folder: String
    tags: [String!]
    alt: String
    description: String
    isPublic: Boolean
  }

  # Queries
  extend type Query {
    # Get media files with filtering and pagination
    getMedia(
      filter: MediaFilterInput
      sort: MediaSortInput
      page: Int = 1
      limit: Int = 20
    ): MediaResponse!

    # Get single media file by ID
    getMediaById(id: ID!): Media

    # Get media by category
    getMediaByCategory(
      category: MediaCategory!
      limit: Int = 50
    ): [Media!]!

    # Get media uploaded by user
    getMediaByUploader(
      uploaderId: ID!
      uploaderModel: String = "User"
    ): [Media!]!

    # Get media usage statistics
    getMediaStats: MediaStats!

    # Get folder contents from Cloudinary
    getFolderContents(
      folderPath: String!
      maxResults: Int = 50
      nextCursor: String
    ): FolderContents!

    # Search media files
    searchMedia(
      query: String!
      filters: MediaFilterInput
      limit: Int = 20
    ): [Media!]!
  }

  # Mutations
  extend type Mutation {
    # Update media metadata
    updateMedia(
      id: ID!
      input: MediaUpdateInput!
    ): Media!

    # Delete media file
    deleteMedia(id: ID!): Boolean!

    # Delete multiple media files
    deleteMultipleMedia(ids: [ID!]!): Boolean!

    # Create folder in Cloudinary
    createMediaFolder(folderPath: String!): Boolean!

    # Record media usage
    recordMediaUsage(
      mediaId: ID!
      modelName: String!
      modelId: ID!
      field: String
    ): Media!

    # Update media tags
    updateMediaTags(
      id: ID!
      tags: [String!]!
      action: TagAction = REPLACE
    ): Media!

    # Archive/Unarchive media
    toggleMediaArchive(id: ID!): Media!

    # Bulk update media
    bulkUpdateMedia(
      ids: [ID!]!
      updates: MediaUpdateInput!
    ): [Media!]!
  }

  enum TagAction {
    REPLACE
    ADD
    REMOVE
  }
`;

export default mediaTypeDefs;

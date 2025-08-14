import { gql } from 'graphql-tag';

export default gql`
  # User Types
  type User {
    _id: ID!
    uuid: String!
    name: String!
    email: String!
    role: UserRole!
    permissions: [String!]!
    phone: String
    alternatePhone: String
    address: Address
    isActive: Boolean!
    isEmailVerified: Boolean!
    verification: UserVerification!
    referrerInfo: ReferrerInfo
    preferences: UserPreferences!
    avatar: String
    bio: String
    socialMedia: SocialMedia
    lastLogin: String
    isFullyVerified: Boolean
    verificationStatus: VerificationStatusEnum
    isLocked: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type Address {
    street: String
    city: String
    state: String
    country: String
    postalCode: String
  }

  type UserVerification {
    nin: VerificationStatus!
    driversLicense: VerificationStatus!
  }

  type VerificationStatus {
    status: VerificationStatusEnum!
    number: String
    document: String
    submittedAt: String
    verifiedAt: String
    rejectionReason: String
    expiryDate: String
  }

  type ReferrerInfo {
    name: String
    phone: String
    email: String
    relationship: String
  }

  type UserPreferences {
    theme: ThemeEnum!
    notifications: NotificationPreferences!
    newsletter: Boolean!
  }

  type NotificationPreferences {
    email: Boolean!
    sms: Boolean!
    push: Boolean!
  }

  type SocialMedia {
    instagram: String
    facebook: String
    twitter: String
    linkedin: String
  }

  # Enums
  enum UserRole {
    client
    admin
    manager
    super_admin
  }

  enum VerificationStatusEnum {
    not_submitted
    pending
    verified
    rejected
  }

  enum ThemeEnum {
    light
    dark
    auto
  }

  # Input Types
  input RegisterInput {
    name: String!
    email: String!
    password: String!
    phone: String!
    nin: String
    driversLicense: String
    referrerInfo: ReferrerInfoInput
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    phone: String
    alternatePhone: String
    address: AddressInput
    bio: String
    socialMedia: SocialMediaInput
    preferences: UserPreferencesInput
  }

  input AddressInput {
    street: String
    city: String
    state: String
    country: String
    postalCode: String
  }

  input ReferrerInfoInput {
    name: String!
    phone: String!
    email: String
    relationship: String!
  }

  input UserPreferencesInput {
    theme: ThemeEnum
    notifications: NotificationPreferencesInput
    newsletter: Boolean
  }

  input NotificationPreferencesInput {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  input SocialMediaInput {
    instagram: String
    facebook: String
    twitter: String
    linkedin: String
  }

  input VerificationDocumentInput {
    type: String! # "nin" or "driversLicense"
    number: String!
    document: String! # File path/URL
  }

  input UserFilterInput {
    role: UserRole
    isActive: Boolean
    isEmailVerified: Boolean
    verificationStatus: VerificationStatusEnum
    search: String
  }

  input CreateAdminInput {
    name: String!
    email: String!
    password: String!
    role: UserRole!
    permissions: [String!]
    bio: String
  }

  # Response Types
  type AuthResponse {
    token: String!
    refreshToken: String
    user: User!
    expiresIn: String!
  }

  type UsersResponse {
    users: [User!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type VerificationResponse {
    success: Boolean!
    message: String!
  }

  # Queries
  type Query {
    # Public queries
    me: User

    # Admin queries
    users(
      filter: UserFilterInput
      page: Int = 1
      limit: Int = 20
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): UsersResponse

    user(id: ID!): User
    userByEmail(email: String!): User
    
    # Analytics queries
    userStats: UserStats
    verificationQueue: [User!]!
    lockedAccounts: [User!]!
  }

  type UserStats {
    totalUsers: Int!
    activeUsers: Int!
    verifiedUsers: Int!
    newUsersThisMonth: Int!
    usersByRole: [RoleCount!]!
  }

  type RoleCount {
    role: UserRole!
    count: Int!
  }

  # Mutations
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthResponse!
    # Backward compatibility: alias for older clients
    registerUser(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!
    refreshToken: AuthResponse!
    
    # Password management
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    
    # Email verification
    sendEmailVerification: Boolean!
    verifyEmail(token: String!): Boolean!
    
    # Profile management
    updateProfile(input: UpdateUserInput!): User!
    uploadAvatar(file: String!): User!
    deleteAvatar: User!
    
    # Document verification
    submitVerificationDocument(input: VerificationDocumentInput!): VerificationResponse!
    
    # Admin mutations
    createAdmin(input: CreateAdminInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    activateUser(id: ID!): User!
    deactivateUser(id: ID!): User!
    updateUserRole(id: ID!, role: UserRole!, permissions: [String!]): User!
    
    # Verification management (Admin only)
    approveVerification(userId: ID!, type: String!): VerificationResponse!
    rejectVerification(userId: ID!, type: String!, reason: String!): VerificationResponse!
    
    # Account management
    unlockAccount(id: ID!): User!
    resetLoginAttempts(id: ID!): User!
    
    # Bulk operations
    bulkUpdateUsers(ids: [ID!]!, input: UpdateUserInput!): [User!]!
    bulkDeleteUsers(ids: [ID!]!): Boolean!
  }

  # Subscriptions
  type Subscription {
    userUpdated: User!
    newUserRegistered: User!
    verificationSubmitted: User!
  }
`; 
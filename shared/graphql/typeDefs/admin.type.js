import { gql } from 'graphql-tag';

export default gql`
  type Admin {
    _id: ID!
    username: String!
    role: AdminRole!
    permissions: [String!]!
    isActive: Boolean!
    isVerified: Boolean!
    isLocked: Boolean
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  enum AdminRole {
    admin
    manager
    super_admin
  }

  input AdminLoginInput {
    username: String!
    password: String!
  }

  input AdminRegisterInput {
    username: String!
    password: String!
    code: String
    verifierUsername: String
  }

  input CreateAdminInviteInput {
    role: AdminRole = admin
    permissions: [String!]
    ttlMinutes: Int = 60
  }

  type AdminAuthResponse {
    token: String!
    refreshToken: String
    admin: Admin!
    expiresIn: String!
  }

  type AdminInviteResponse {
    code: String!
    role: AdminRole!
    expiresAt: String!
  }

  extend type Query {
    currentAdmin: Admin
  }

  extend type Mutation {
    adminLogin(input: AdminLoginInput!): AdminAuthResponse!
    createAdminInvite(input: CreateAdminInviteInput!): AdminInviteResponse! @admin
    registerAdmin(input: AdminRegisterInput!): Admin!
    verifyAdmin(username: String!): Admin! @admin
  }
`;



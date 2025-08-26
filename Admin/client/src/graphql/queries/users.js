import { gql } from '@apollo/client';

// User fragments
const USER_BASIC_FRAGMENT = gql`
  fragment UserBasic on User {
    _id
    uuid
    name
    email
    role
    isActive
    isEmailVerified
    isFullyVerified
    verificationStatus
    isLocked
    lastLogin
    createdAt
    updatedAt
  }
`;

const USER_FULL_FRAGMENT = gql`
  fragment UserFull on User {
    _id
    uuid
    name
    email
    role
    permissions
    phone
    alternatePhone
    address {
      street
      city
      state
      country
      postalCode
    }
    isActive
    isEmailVerified
    verification {
      nin {
        status
        number
        document
        submittedAt
        verifiedAt
        rejectionReason
      }
      driversLicense {
        status
        number
        document
        submittedAt
        verifiedAt
        rejectionReason
        expiryDate
      }
    }
    referrerInfo {
      name
      phone
      email
      relationship
    }
    preferences {
      theme
      notifications {
        email
        sms
        push
      }
      newsletter
    }
    avatar
    bio
    socialMedia {
      instagram
      facebook
      twitter
      linkedin
    }
    lastLogin
    isFullyVerified
    verificationStatus
    isLocked
    createdAt
    updatedAt
  }
`;

// User queries
export const GET_USERS = gql`
  query GetUsers(
    $filter: UserFilterInput
    $page: Int = 1
    $limit: Int = 20
    $sortBy: String = "createdAt"
    $sortOrder: String = "desc"
  ) {
    users(
      filter: $filter
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      users {
        ...UserFull
      }
      total
      page
      limit
      totalPages
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      totalUsers
      activeUsers
      verifiedUsers
      newUsersThisMonth
      usersByRole {
        role
        count
      }
    }
  }
`;

export const GET_VERIFICATION_QUEUE = gql`
  query GetVerificationQueue {
    verificationQueue {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const GET_LOCKED_ACCOUNTS = gql`
  query GetLockedAccounts {
    lockedAccounts {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

// User mutations
export const CREATE_ADMIN = gql`
  mutation CreateAdmin($input: CreateAdminInput!) {
    createAdmin(input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: UserRole!, $permissions: [String!]) {
    updateUserRole(id: $id, role: $role, permissions: $permissions) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const APPROVE_VERIFICATION = gql`
  mutation ApproveVerification($userId: ID!, $type: String!) {
    approveVerification(userId: $userId, type: $type) {
      success
      message
    }
  }
`;

export const REJECT_VERIFICATION = gql`
  mutation RejectVerification($userId: ID!, $type: String!, $reason: String!) {
    rejectVerification(userId: $userId, type: $type, reason: $reason) {
      success
      message
    }
  }
`;

export const UNLOCK_ACCOUNT = gql`
  mutation UnlockAccount($id: ID!) {
    unlockAccount(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const RESET_LOGIN_ATTEMPTS = gql`
  mutation ResetLoginAttempts($id: ID!) {
    resetLoginAttempts(id: $id) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const BULK_UPDATE_USERS = gql`
  mutation BulkUpdateUsers($ids: [ID!]!, $input: UpdateUserInput!) {
    bulkUpdateUsers(ids: $ids, input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const BULK_DELETE_USERS = gql`
  mutation BulkDeleteUsers($ids: [ID!]!) {
    bulkDeleteUsers(ids: $ids)
  }
`;

export { USER_BASIC_FRAGMENT, USER_FULL_FRAGMENT };

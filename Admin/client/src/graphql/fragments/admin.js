import { gql } from '@apollo/client';

export const ADMIN_BASIC_FRAGMENT = gql`
  fragment AdminBasic on Admin {
    _id
    username
    role
    isActive
    isVerified
    createdAt
    updatedAt
  }
`;

export const ADMIN_FULL_FRAGMENT = gql`
  fragment AdminFull on Admin {
    ...AdminBasic
    permissions
    lastLogin
  }
  ${ADMIN_BASIC_FRAGMENT}
`;



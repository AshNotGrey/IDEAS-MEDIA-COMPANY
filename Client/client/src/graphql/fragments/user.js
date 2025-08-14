import { gql } from '@apollo/client';

export const USER_BASIC_FRAGMENT = gql`
  fragment UserBasic on User {
    _id
    name
    email
    role
    createdAt
    updatedAt
  }
`;

export const USER_FULL_FRAGMENT = gql`
  fragment UserFull on User {
    ...UserBasic
    isEmailVerified
    isFullyVerified
    verificationStatus
    isLocked
    isActive
    verification {
      nin {
        status
        number
        submittedAt
        verifiedAt
        rejectionReason
      }
      driversLicense {
        status
        number
        submittedAt
        verifiedAt
        rejectionReason
        expiryDate
      }
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
    phone
    avatar
  }
  ${USER_BASIC_FRAGMENT}
`; 
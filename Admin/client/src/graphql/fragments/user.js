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
  }
  ${USER_BASIC_FRAGMENT}
`; 
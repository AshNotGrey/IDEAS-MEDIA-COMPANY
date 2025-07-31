import { gql } from '@apollo/client';
import { USER_FULL_FRAGMENT } from '../fragments/user.js';

// Authentication Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

// Authentication Mutations
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      token
      user {
        ...UserFull
      }
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      message
      user {
        ...UserFull
      }
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      message
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`; 
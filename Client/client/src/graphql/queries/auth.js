import { gql } from '@apollo/client';
import { USER_FULL_FRAGMENT } from '../fragments/user.js';

// Authentication Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser: me {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`;

// Authentication Mutations
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
        ...UserFull
      }
      expiresIn
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser: login(input: $input) {
      token
      refreshToken
      user {
        ...UserFull
      }
      expiresIn
    }
  }
  ${USER_FULL_FRAGMENT}
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const SEND_EMAIL_VERIFICATION = gql`
  mutation SendEmailVerification {
    sendEmailVerification
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      ...UserFull
    }
  }
  ${USER_FULL_FRAGMENT}
`; 
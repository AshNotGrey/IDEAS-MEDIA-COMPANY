import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from './user.js';
import { BOOKING_BASIC_FRAGMENT } from './booking.js';

export const GALLERY_IMAGE_FRAGMENT = gql`
  fragment GalleryImage on GalleryImage {
    url
    caption
    alt
    order
    metadata {
      width
      height
      size
      format
    }
  }
`;

export const GALLERY_BASIC_FRAGMENT = gql`
  fragment GalleryBasic on Gallery {
    _id
    title
    description
    category
    coverImage
    images {
      ...GalleryImage
    }
    isPublic
    isFeatured
    accessCode
    settings {
      allowDownload
      allowShare
      watermark
      rightClickProtection
    }
    stats {
      views
      downloads
      shares
    }
    tags
    expiresAt
    createdAt
    updatedAt
  }
  ${GALLERY_IMAGE_FRAGMENT}
`;

export const GALLERY_WITH_RELATIONS_FRAGMENT = gql`
  fragment GalleryWithRelations on Gallery {
    ...GalleryBasic
    client {
      ...UserBasic
    }
    booking {
      ...BookingBasic
    }
  }
  ${GALLERY_BASIC_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
  ${BOOKING_BASIC_FRAGMENT}
`; 
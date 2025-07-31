import { gql } from '@apollo/client';
import { GALLERY_WITH_RELATIONS_FRAGMENT } from '../fragments/gallery.js';

// Gallery Queries
export const GET_PUBLIC_GALLERIES = gql`
  query GetPublicGalleries {
    publicGalleries {
      ...GalleryWithRelations
    }
  }
  ${GALLERY_WITH_RELATIONS_FRAGMENT}
`;

export const GET_FEATURED_GALLERIES = gql`
  query GetFeaturedGalleries {
    featuredGalleries {
      ...GalleryWithRelations
    }
  }
  ${GALLERY_WITH_RELATIONS_FRAGMENT}
`;

export const GET_CLIENT_GALLERIES = gql`
  query GetClientGalleries($clientId: ID!) {
    clientGalleries(clientId: $clientId) {
      ...GalleryWithRelations
    }
  }
  ${GALLERY_WITH_RELATIONS_FRAGMENT}
`;

export const GET_GALLERY_BY_ACCESS_CODE = gql`
  query GetGalleryByAccessCode($accessCode: String!) {
    galleryByAccessCode(accessCode: $accessCode) {
      ...GalleryWithRelations
    }
  }
  ${GALLERY_WITH_RELATIONS_FRAGMENT}
`;

export const GET_GALLERY = gql`
  query GetGallery($id: ID!) {
    gallery(id: $id) {
      ...GalleryWithRelations
    }
  }
  ${GALLERY_WITH_RELATIONS_FRAGMENT}
`;

// Gallery Mutations
export const INCREMENT_GALLERY_VIEWS = gql`
  mutation IncrementGalleryViews($id: ID!) {
    incrementGalleryViews(id: $id) {
      _id
      stats {
        views
        downloads
        shares
      }
    }
  }
`; 
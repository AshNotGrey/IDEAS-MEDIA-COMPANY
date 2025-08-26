import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL Queries
const GET_MEDIA = gql`
  query GetMedia($filter: MediaFilterInput, $sort: MediaSortInput, $page: Int, $limit: Int) {
    getMedia(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      media {
        _id
        filename
        originalName
        mimeType
        fileSize
        cloudinaryId
        url
        secureUrl
        type
        category
        dimensions {
          width
          height
        }
        format
        folder
        tags
        alt
        description
        isPublic
        isActive
        usageCount
        lastUsed
        uploadedBy {
          _id
          name
          username
          email
        }
        uploaderModel
        transformations {
          thumbnail
          small
          medium
          large
          optimized
        }
        status
        createdAt
        updatedAt
        formattedSize
        isImage
        isVideo
        isDocument
      }
      pagination {
        currentPage
        totalPages
        totalItems
        itemsPerPage
        hasNextPage
        hasPrevPage
      }
    }
  }
`;

const GET_MEDIA_BY_ID = gql`
  query GetMediaById($id: ID!) {
    getMediaById(id: $id) {
      _id
      filename
      originalName
      mimeType
      fileSize
      cloudinaryId
      url
      secureUrl
      type
      category
      dimensions {
        width
        height
      }
      format
      folder
      tags
      alt
      description
      isPublic
      isActive
      usageCount
      lastUsed
      usedBy {
        model
        modelId
        field
        usedAt
      }
      uploadedBy {
        _id
        name
        username
        email
      }
      uploaderModel
      transformations {
        thumbnail
        small
        medium
        large
        optimized
      }
      seo {
        title
        keywords
        caption
      }
      status
      createdAt
      updatedAt
      formattedSize
      isImage
      isVideo
      isDocument
    }
  }
`;

const GET_MEDIA_STATS = gql`
  query GetMediaStats {
    getMediaStats {
      totalFiles
      totalSize
      byType {
        _id
        count
        totalSize
        avgSize
      }
    }
  }
`;

const SEARCH_MEDIA = gql`
  query SearchMedia($query: String!, $filters: MediaFilterInput, $limit: Int) {
    searchMedia(query: $query, filters: $filters, limit: $limit) {
      _id
      filename
      originalName
      url
      type
      category
      tags
      alt
      description
      createdAt
      uploadedBy {
        name
      }
      transformations {
        thumbnail
      }
    }
  }
`;

// GraphQL Mutations
const UPDATE_MEDIA = gql`
  mutation UpdateMedia($id: ID!, $input: MediaUpdateInput!) {
    updateMedia(id: $id, input: $input) {
      _id
      alt
      description
      tags
      category
      isPublic
      seo {
        title
        keywords
        caption
      }
    }
  }
`;

const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`;

const DELETE_MULTIPLE_MEDIA = gql`
  mutation DeleteMultipleMedia($ids: [ID!]!) {
    deleteMultipleMedia(ids: $ids)
  }
`;

const UPDATE_MEDIA_TAGS = gql`
  mutation UpdateMediaTags($id: ID!, $tags: [String!]!, $action: TagAction) {
    updateMediaTags(id: $id, tags: $tags, action: $action) {
      _id
      tags
    }
  }
`;

const BULK_UPDATE_MEDIA = gql`
  mutation BulkUpdateMedia($ids: [ID!]!, $updates: MediaUpdateInput!) {
    bulkUpdateMedia(ids: $ids, updates: $updates) {
      _id
      alt
      description
      tags
      category
      isPublic
    }
  }
`;

const RECORD_MEDIA_USAGE = gql`
  mutation RecordMediaUsage($mediaId: ID!, $modelName: String!, $modelId: ID!, $field: String) {
    recordMediaUsage(mediaId: $mediaId, modelName: $modelName, modelId: $modelId, field: $field) {
      _id
      usageCount
      lastUsed
    }
  }
`;

export const useMedia = (filters = {}, pagination = { page: 1, limit: 20 }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Main media query
    const {
        data: mediaData,
        loading,
        error,
        refetch,
        fetchMore
    } = useQuery(GET_MEDIA, {
        variables: {
            filter: filters,
            sort: { field: 'createdAt', direction: 'DESC' },
            page: pagination.page,
            limit: pagination.limit
        },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true
    });

    // Media stats query
    const {
        data: statsData,
        loading: statsLoading,
        refetch: refetchStats
    } = useQuery(GET_MEDIA_STATS, {
        errorPolicy: 'all'
    });

    // Search query (only when needed)
    const {
        data: searchData,
        loading: searchLoading,
        refetch: executeSearch
    } = useQuery(SEARCH_MEDIA, {
        variables: {
            query: searchQuery,
            filters: filters,
            limit: 20
        },
        skip: !searchQuery,
        errorPolicy: 'all'
    });

    // Mutations
    const [updateMediaMutation] = useMutation(UPDATE_MEDIA, {
        refetchQueries: [{ query: GET_MEDIA }],
        awaitRefetchQueries: true
    });

    const [deleteMediaMutation] = useMutation(DELETE_MEDIA, {
        refetchQueries: [{ query: GET_MEDIA }, { query: GET_MEDIA_STATS }],
        awaitRefetchQueries: true
    });

    const [deleteMultipleMutation] = useMutation(DELETE_MULTIPLE_MEDIA, {
        refetchQueries: [{ query: GET_MEDIA }, { query: GET_MEDIA_STATS }],
        awaitRefetchQueries: true
    });

    const [updateTagsMutation] = useMutation(UPDATE_MEDIA_TAGS);
    const [bulkUpdateMutation] = useMutation(BULK_UPDATE_MEDIA);
    const [recordUsageMutation] = useMutation(RECORD_MEDIA_USAGE);

    // Update search results when search data changes
    useEffect(() => {
        if (searchData?.searchMedia) {
            setSearchResults(searchData.searchMedia);
        }
    }, [searchData]);

    // Media operations
    const updateMedia = async (id, input) => {
        try {
            const { data } = await updateMediaMutation({
                variables: { id, input }
            });
            return data.updateMedia;
        } catch (error) {
            throw new Error(`Failed to update media: ${error.message}`);
        }
    };

    const deleteMedia = async (id) => {
        try {
            await deleteMediaMutation({
                variables: { id }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to delete media: ${error.message}`);
        }
    };

    const deleteMultiple = async (ids) => {
        try {
            await deleteMultipleMutation({
                variables: { ids }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to delete multiple media: ${error.message}`);
        }
    };

    const updateTags = async (id, tags, action = 'REPLACE') => {
        try {
            const { data } = await updateTagsMutation({
                variables: { id, tags, action }
            });
            return data.updateMediaTags;
        } catch (error) {
            throw new Error(`Failed to update tags: ${error.message}`);
        }
    };

    const bulkUpdate = async (ids, updates) => {
        try {
            const { data } = await bulkUpdateMutation({
                variables: { ids, updates }
            });
            return data.bulkUpdateMedia;
        } catch (error) {
            throw new Error(`Failed to bulk update: ${error.message}`);
        }
    };

    const recordUsage = async (mediaId, modelName, modelId, field) => {
        try {
            const { data } = await recordUsageMutation({
                variables: { mediaId, modelName, modelId, field }
            });
            return data.recordMediaUsage;
        } catch (error) {
            throw new Error(`Failed to record usage: ${error.message}`);
        }
    };

    // Search functionality
    const search = async (query) => {
        setSearchQuery(query);
        if (query) {
            await executeSearch();
        } else {
            setSearchResults([]);
        }
    };

    // Upload functions (using REST API)
    const uploadSingle = async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        Object.keys(options).forEach(key => {
            if (options[key] !== undefined) {
                formData.append(key, options[key]);
            }
        });

        try {
            const response = await fetch('/api/upload/single', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            // Refetch data after successful upload
            refetch();
            refetchStats();

            return result.data.media;
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    };

    const uploadMultiple = async (files, options = {}) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('files', file);
        });

        Object.keys(options).forEach(key => {
            if (options[key] !== undefined) {
                formData.append(key, options[key]);
            }
        });

        try {
            const response = await fetch('/api/upload/multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            // Refetch data after successful upload
            refetch();
            refetchStats();

            return result.data;
        } catch (error) {
            throw new Error(`Multiple upload failed: ${error.message}`);
        }
    };

    // Folder operations
    const createFolder = async (folderPath) => {
        try {
            const response = await fetch('/api/upload/folders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ folderPath })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            return true;
        } catch (error) {
            throw new Error(`Create folder failed: ${error.message}`);
        }
    };

    // Load more functionality
    const loadMore = async () => {
        if (mediaData?.getMedia?.pagination?.hasNextPage) {
            try {
                await fetchMore({
                    variables: {
                        page: mediaData.getMedia.pagination.currentPage + 1
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return previousResult;

                        return {
                            getMedia: {
                                ...fetchMoreResult.getMedia,
                                media: [
                                    ...previousResult.getMedia.media,
                                    ...fetchMoreResult.getMedia.media
                                ]
                            }
                        };
                    }
                });
            } catch (error) {
                console.error('Load more failed:', error);
            }
        }
    };

    return {
        // Data
        media: mediaData?.getMedia?.media || [],
        pagination: mediaData?.getMedia?.pagination,
        stats: statsData?.getMediaStats,
        searchResults,

        // Loading states
        loading,
        statsLoading,
        searchLoading,

        // Error
        error,

        // Operations
        refetch,
        updateMedia,
        deleteMedia,
        deleteMultiple,
        updateTags,
        bulkUpdate,
        recordUsage,
        search,
        uploadSingle,
        uploadMultiple,
        createFolder,
        loadMore
    };
};

// Hook for single media item
export const useMediaItem = (id) => {
    const { data, loading, error, refetch } = useQuery(GET_MEDIA_BY_ID, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all'
    });

    return {
        media: data?.getMediaById,
        loading,
        error,
        refetch
    };
};

// Hook for media search
export const useMediaSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});

    const { data, loading, error, refetch } = useQuery(SEARCH_MEDIA, {
        variables: {
            query: searchQuery,
            filters,
            limit: 50
        },
        skip: !searchQuery,
        errorPolicy: 'all'
    });

    const search = (query, searchFilters = {}) => {
        setSearchQuery(query);
        setFilters(searchFilters);
        if (query) {
            refetch();
        }
    };

    return {
        results: data?.searchMedia || [],
        loading,
        error,
        search
    };
};

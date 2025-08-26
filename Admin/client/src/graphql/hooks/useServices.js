import { useQuery, useMutation } from '@apollo/client';
import { useState, useCallback } from 'react';
import {
    GET_ALL_SERVICES,
    GET_SERVICE_STATS,
    GET_SERVICE_BY_ID,
    GET_FEATURED_SERVICES,
    GET_SERVICES_BY_CATEGORY,
    GET_SERVICES,
    CREATE_SERVICE,
    UPDATE_SERVICE,
    DELETE_SERVICE,
    TOGGLE_SERVICE_STATUS,
    TOGGLE_SERVICE_FEATURED,
    BULK_UPDATE_SERVICES,
    BULK_DELETE_SERVICES
} from '../queries/services.js';

export const useServices = (options = {}) => {
    const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

    const [filters, setFilters] = useState({
        page,
        limit,
        search,
        category,
        sortBy,
        sortOrder
    });

    // Query for all services with filters and pagination
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices
    } = useQuery(GET_ALL_SERVICES, {
        variables: filters,
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true
    });

    // Query for service statistics
    const {
        data: statsData,
        loading: statsLoading,
        error: statsError,
        refetch: refetchStats
    } = useQuery(GET_SERVICE_STATS, {
        errorPolicy: 'all'
    });

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1 // Reset to page 1 for new filters
        }));
    }, []);

    // Mutations
    const [createServiceMutation, { loading: createLoading }] = useMutation(CREATE_SERVICE, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [updateServiceMutation, { loading: updateLoading }] = useMutation(UPDATE_SERVICE, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [deleteServiceMutation, { loading: deleteLoading }] = useMutation(DELETE_SERVICE, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [toggleStatusMutation, { loading: toggleStatusLoading }] = useMutation(TOGGLE_SERVICE_STATUS, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [toggleFeaturedMutation, { loading: toggleFeaturedLoading }] = useMutation(TOGGLE_SERVICE_FEATURED, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [bulkUpdateMutation, { loading: bulkUpdateLoading }] = useMutation(BULK_UPDATE_SERVICES, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    const [bulkDeleteMutation, { loading: bulkDeleteLoading }] = useMutation(BULK_DELETE_SERVICES, {
        refetchQueries: [GET_ALL_SERVICES, GET_SERVICE_STATS],
        awaitRefetchQueries: true
    });

    // Mutation handlers
    const createService = useCallback(async (input) => {
        try {
            const result = await createServiceMutation({ variables: { input } });
            return result.data.createService;
        } catch (error) {
            throw new Error(error.message || 'Failed to create service');
        }
    }, [createServiceMutation]);

    const updateService = useCallback(async (id, input) => {
        try {
            const result = await updateServiceMutation({ variables: { id, input } });
            return result.data.updateService;
        } catch (error) {
            throw new Error(error.message || 'Failed to update service');
        }
    }, [updateServiceMutation]);

    const deleteService = useCallback(async (id) => {
        try {
            const result = await deleteServiceMutation({ variables: { id } });
            return result.data.deleteService;
        } catch (error) {
            throw new Error(error.message || 'Failed to delete service');
        }
    }, [deleteServiceMutation]);

    const toggleServiceStatus = useCallback(async (id) => {
        try {
            const result = await toggleStatusMutation({ variables: { id } });
            return result.data.toggleServiceStatus;
        } catch (error) {
            throw new Error(error.message || 'Failed to toggle service status');
        }
    }, [toggleStatusMutation]);

    const toggleServiceFeatured = useCallback(async (id) => {
        try {
            const result = await toggleFeaturedMutation({ variables: { id } });
            return result.data.toggleServiceFeatured;
        } catch (error) {
            throw new Error(error.message || 'Failed to toggle service featured status');
        }
    }, [toggleFeaturedMutation]);

    const bulkUpdateServices = useCallback(async (ids, input) => {
        try {
            const result = await bulkUpdateMutation({ variables: { ids, input } });
            return result.data.bulkUpdateServices;
        } catch (error) {
            throw new Error(error.message || 'Failed to bulk update services');
        }
    }, [bulkUpdateMutation]);

    const bulkDeleteServices = useCallback(async (ids) => {
        try {
            const result = await bulkDeleteMutation({ variables: { ids } });
            return result.data.bulkDeleteServices;
        } catch (error) {
            throw new Error(error.message || 'Failed to bulk delete services');
        }
    }, [bulkDeleteMutation]);

    return {
        // Data
        services: servicesData?.allServices?.services || [],
        total: servicesData?.allServices?.total || 0,
        page: servicesData?.allServices?.page || 1,
        totalPages: servicesData?.allServices?.totalPages || 1,
        stats: statsData?.serviceStats || null,

        // Loading states
        loading: servicesLoading || statsLoading,
        createLoading,
        updateLoading,
        deleteLoading,
        toggleStatusLoading,
        toggleFeaturedLoading,
        bulkUpdateLoading,
        bulkDeleteLoading,

        // Errors
        error: servicesError || statsError,

        // Filter management
        filters,
        updateFilters,

        // Actions
        createService,
        updateService,
        deleteService,
        toggleServiceStatus,
        toggleServiceFeatured,
        bulkUpdateServices,
        bulkDeleteServices,
        refetch: refetchServices,
        refetchStats
    };
};

// Hook for single service
export const useService = (id) => {
    const { data, loading, error, refetch } = useQuery(GET_SERVICE_BY_ID, {
        variables: { id },
        errorPolicy: 'all',
        skip: !id
    });

    return {
        service: data?.service || null,
        loading,
        error,
        refetch
    };
};

// Hook for featured services (client-facing)
export const useFeaturedServices = () => {
    const { data, loading, error, refetch } = useQuery(GET_FEATURED_SERVICES, {
        errorPolicy: 'all'
    });

    return {
        services: data?.featuredServices || [],
        loading,
        error,
        refetch
    };
};

// Hook for services by category (client-facing)
export const useServicesByCategory = (category) => {
    const { data, loading, error, refetch } = useQuery(GET_SERVICES_BY_CATEGORY, {
        variables: { category },
        errorPolicy: 'all',
        skip: !category
    });

    return {
        services: data?.servicesByCategory || [],
        loading,
        error,
        refetch
    };
};

// Hook for filtered services (client-facing)
export const useFilteredServices = (filter = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_SERVICES, {
        variables: { filter },
        errorPolicy: 'all'
    });

    return {
        services: data?.services || [],
        loading,
        error,
        refetch
    };
};

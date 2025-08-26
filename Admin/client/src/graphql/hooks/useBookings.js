import { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
    GET_BOOKINGS,
    GET_BOOKING,
    GET_BOOKING_STATS,
    GET_UPCOMING_BOOKINGS,
    GET_TODAYS_BOOKINGS,
    CREATE_BOOKING,
    UPDATE_BOOKING,
    UPDATE_BOOKING_STATUS,
    UPDATE_PAYMENT_STATUS,
    ASSIGN_BOOKING,
    DELETE_BOOKING,
    BULK_UPDATE_BOOKINGS,
} from '../queries/bookings.js';

// Hook for booking list with filtering, sorting, and pagination
export const useBookings = (options = {}) => {
    const {
        filter = {},
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc',
        ...queryOptions
    } = options;

    const {
        data,
        loading,
        error,
        refetch,
        fetchMore,
    } = useQuery(GET_BOOKINGS, {
        variables: { filter, page, limit, sortBy, sortOrder },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...queryOptions,
    });

    const bookings = data?.bookings?.bookings || [];
    const pagination = {
        total: data?.bookings?.total || 0,
        page: data?.bookings?.page || 1,
        limit: data?.bookings?.limit || 20,
        totalPages: data?.bookings?.totalPages || 0,
    };

    return {
        bookings,
        pagination,
        loading,
        error,
        refetch,
        fetchMore,
    };
};

// Hook for individual booking
export const useBooking = (id, options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_BOOKING, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all',
        ...options,
    });

    return {
        booking: data?.booking,
        loading,
        error,
        refetch,
    };
};

// Hook for booking statistics
export const useBookingStats = (options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_BOOKING_STATS, {
        errorPolicy: 'all',
        ...options,
    });

    return {
        stats: data?.bookingStats,
        loading,
        error,
        refetch,
    };
};

// Hook for upcoming bookings
export const useUpcomingBookings = (limit = 10, options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_UPCOMING_BOOKINGS, {
        variables: { limit },
        errorPolicy: 'all',
        ...options,
    });

    return {
        upcomingBookings: data?.upcomingBookings || [],
        loading,
        error,
        refetch,
    };
};

// Hook for today's bookings
export const useTodaysBookings = (options = {}) => {
    const { data, loading, error, refetch } = useQuery(GET_TODAYS_BOOKINGS, {
        errorPolicy: 'all',
        ...options,
    });

    return {
        todaysBookings: data?.todaysBookings || [],
        loading,
        error,
        refetch,
    };
};

// Hook for booking mutations
export const useBookingMutations = () => {
    const client = useApolloClient();
    const [loading, setLoading] = useState(false);

    const [createBookingMutation] = useMutation(CREATE_BOOKING);
    const [updateBookingMutation] = useMutation(UPDATE_BOOKING);
    const [updateBookingStatusMutation] = useMutation(UPDATE_BOOKING_STATUS);
    const [updatePaymentStatusMutation] = useMutation(UPDATE_PAYMENT_STATUS);
    const [assignBookingMutation] = useMutation(ASSIGN_BOOKING);
    const [deleteBookingMutation] = useMutation(DELETE_BOOKING);
    const [bulkUpdateBookingsMutation] = useMutation(BULK_UPDATE_BOOKINGS);

    const refetchQueries = () => {
        client.refetchQueries({
            include: [GET_BOOKINGS, GET_BOOKING_STATS, GET_UPCOMING_BOOKINGS, GET_TODAYS_BOOKINGS],
        });
    };

    const createBooking = async (input) => {
        setLoading(true);
        try {
            const result = await createBookingMutation({
                variables: { input },
                refetchQueries: [{ query: GET_BOOKINGS }, { query: GET_BOOKING_STATS }],
            });
            return result.data?.createBooking;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateBooking = async (id, input) => {
        setLoading(true);
        try {
            const result = await updateBookingMutation({
                variables: { id, input },
                refetchQueries: [
                    { query: GET_BOOKINGS },
                    { query: GET_BOOKING, variables: { id } },
                    { query: GET_BOOKING_STATS },
                ],
            });
            return result.data?.updateBooking;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (id, status) => {
        setLoading(true);
        try {
            const result = await updateBookingStatusMutation({
                variables: { id, status },
                refetchQueries: [
                    { query: GET_BOOKINGS },
                    { query: GET_BOOKING, variables: { id } },
                    { query: GET_BOOKING_STATS },
                    { query: GET_UPCOMING_BOOKINGS },
                    { query: GET_TODAYS_BOOKINGS },
                ],
            });
            return result.data?.updateBookingStatus;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (id, paid, paymentMethod = null) => {
        setLoading(true);
        try {
            const result = await updatePaymentStatusMutation({
                variables: { id, paid, paymentMethod },
                refetchQueries: [
                    { query: GET_BOOKINGS },
                    { query: GET_BOOKING, variables: { id } },
                    { query: GET_BOOKING_STATS },
                ],
            });
            return result.data?.updatePaymentStatus;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const assignBooking = async (id, adminId) => {
        setLoading(true);
        try {
            const result = await assignBookingMutation({
                variables: { id, adminId },
                refetchQueries: [
                    { query: GET_BOOKINGS },
                    { query: GET_BOOKING, variables: { id } },
                ],
            });
            return result.data?.assignBooking;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (id) => {
        setLoading(true);
        try {
            const result = await deleteBookingMutation({
                variables: { id },
                refetchQueries: [{ query: GET_BOOKINGS }, { query: GET_BOOKING_STATS }],
            });
            return result.data?.deleteBooking;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const bulkUpdateBookings = async (ids, input) => {
        setLoading(true);
        try {
            const result = await bulkUpdateBookingsMutation({
                variables: { ids, input },
                refetchQueries: [{ query: GET_BOOKINGS }, { query: GET_BOOKING_STATS }],
            });
            return result.data?.bulkUpdateBookings;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createBooking,
        updateBooking,
        updateBookingStatus,
        updatePaymentStatus,
        assignBooking,
        deleteBooking,
        bulkUpdateBookings,
        refetchQueries,
    };
};

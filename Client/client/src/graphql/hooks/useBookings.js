import { useMutation, useQuery } from '@apollo/client';
import {
    GET_USER_BOOKINGS,
    GET_BOOKING,
    CREATE_BOOKING,
    UPDATE_BOOKING,
    CANCEL_BOOKING,
    CHECK_AVAILABILITY,
    GET_AVAILABLE_SLOTS
} from '../queries/bookings.js';

export const useBookings = (userId) => {
    // Queries
    const {
        data: bookingsData,
        loading: bookingsLoading,
        error: bookingsError,
        refetch: refetchBookings
    } = useQuery(GET_USER_BOOKINGS, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'cache-and-network'
    });

    // Mutations
    const [createBookingMutation, { loading: createLoading }] = useMutation(CREATE_BOOKING, {
        refetchQueries: [{ query: GET_USER_BOOKINGS, variables: { userId } }],
        awaitRefetchQueries: true
    });

    const [updateBookingMutation, { loading: updateLoading }] = useMutation(UPDATE_BOOKING, {
        refetchQueries: [{ query: GET_USER_BOOKINGS, variables: { userId } }],
        awaitRefetchQueries: true
    });

    const [cancelBookingMutation, { loading: cancelLoading }] = useMutation(CANCEL_BOOKING, {
        refetchQueries: [{ query: GET_USER_BOOKINGS, variables: { userId } }],
        awaitRefetchQueries: true
    });

    const createBooking = async (bookingData) => {
        try {
            const { data } = await createBookingMutation({
                variables: { input: bookingData }
            });
            return { success: true, booking: data.createBooking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateBooking = async (bookingId, bookingData) => {
        try {
            const { data } = await updateBookingMutation({
                variables: { id: bookingId, input: bookingData }
            });
            return { success: true, booking: data.updateBooking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const cancelBooking = async (bookingId) => {
        try {
            const { data } = await cancelBookingMutation({
                variables: { id: bookingId }
            });
            return { success: true, booking: data.cancelBooking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        bookings: bookingsData?.userBookings || [],
        loading: bookingsLoading,
        error: bookingsError,
        createLoading,
        updateLoading,
        cancelLoading,
        createBooking,
        updateBooking,
        cancelBooking,
        refetchBookings
    };
};

export const useBooking = (bookingId) => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_BOOKING, {
        variables: { id: bookingId },
        skip: !bookingId,
        fetchPolicy: 'cache-and-network'
    });

    return {
        booking: data?.booking,
        loading,
        error,
        refetch
    };
};

export const useAvailability = () => {
    const [checkAvailabilityMutation, { loading: checkingAvailability }] = useMutation(CHECK_AVAILABILITY);

    const checkAvailability = async (date, duration) => {
        try {
            const { data } = await checkAvailabilityMutation({
                variables: { date, duration }
            });
            return { success: true, availability: data.checkAvailability };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        checkAvailability,
        checkingAvailability
    };
};

export const useAvailableSlots = (startDate, endDate) => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_AVAILABLE_SLOTS, {
        variables: { startDate, endDate },
        skip: !startDate || !endDate,
        fetchPolicy: 'cache-and-network'
    });

    return {
        availableSlots: data?.getAvailableSlots || [],
        loading,
        error,
        refetch
    };
}; 
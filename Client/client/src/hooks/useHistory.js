import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_BOOKINGS } from '../graphql/queries/bookings';
import { GET_USER_ORDERS } from '../graphql/queries/orders';
import { mergeHistory, filterHistory, getHistoryStats } from '../utils/historyMapper';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing history data and operations
 */
export const useHistory = (initialFilters = {}) => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        status: 'all',
        dateRange: 'all',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        hasReceipts: false,
        needsReview: false,
        sortBy: 'newest',
        ...initialFilters
    });

    const [historyItems, setHistoryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [stats, setStats] = useState(null);

    // Fetch bookings
    const {
        data: bookingsData,
        loading: bookingsLoading,
        error: bookingsError,
        refetch: refetchBookings
    } = useQuery(GET_USER_BOOKINGS, {
        variables: { userId: user?._id },
        skip: !user?._id,
        errorPolicy: 'all'
    });

    // Fetch orders
    const {
        data: ordersData,
        loading: ordersLoading,
        error: ordersError,
        refetch: refetchOrders
    } = useQuery(GET_USER_ORDERS, {
        variables: { userId: user?._id },
        skip: !user?._id,
        errorPolicy: 'all'
    });

    const loading = bookingsLoading || ordersLoading;
    const error = bookingsError || ordersError;

    // Merge and process history data
    useEffect(() => {
        if (bookingsData?.userBookings || ordersData?.userOrders) {
            const bookings = bookingsData?.userBookings || [];
            const orders = ordersData?.userOrders || [];

            const merged = mergeHistory(bookings, orders);
            setHistoryItems(merged);
            setStats(getHistoryStats(merged));
        }
    }, [bookingsData, ordersData]);

    // Apply filters
    useEffect(() => {
        let filtered = filterHistory(historyItems, filters);

        // Apply sorting
        if (filters.sortBy) {
            filtered = [...filtered].sort((a, b) => {
                switch (filters.sortBy) {
                    case 'oldest':
                        return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
                    case 'amount_high':
                        return (b.total || 0) - (a.total || 0);
                    case 'amount_low':
                        return (a.total || 0) - (b.total || 0);
                    case 'newest':
                    default:
                        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
                }
            });
        }

        setFilteredItems(filtered);
    }, [historyItems, filters]);

    // Filter handlers
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            type: 'all',
            status: 'all',
            dateRange: 'all',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            hasReceipts: false,
            needsReview: false,
            sortBy: 'newest'
        });
    }, []);

    // Action handlers
    const handleDownloadReceipt = useCallback(async (historyItem) => {
        try {
            // This would integrate with your receipt generation API
            console.log('Downloading receipt for:', historyItem.ref);

            // For now, just simulate the download
            if (historyItem.receipt?.url) {
                window.open(historyItem.receipt.url, '_blank');
            } else {
                // Generate receipt API call would go here
                throw new Error('Receipt generation not implemented yet');
            }
        } catch (error) {
            console.error('Receipt download failed:', error);
            throw error;
        }
    }, []);

    const handleRebook = useCallback(async (historyItem) => {
        try {
            console.log('Rebooking:', historyItem.ref);

            // This would integrate with your booking system
            // For now, just navigate to the appropriate page
            const { type, originalData } = historyItem;

            if (type === 'rental') {
                const productId = originalData?.product?._id || originalData?.items?.[0]?.product?._id;
                window.location.href = productId ? `/equipment?rebook=${productId}` : '/equipment';
            } else if (type === 'photoshoot') {
                const serviceId = originalData?.product?._id;
                window.location.href = serviceId ? `/photoshoot?rebook=${serviceId}` : '/photoshoot';
            } else if (type === 'makeover') {
                const serviceId = originalData?.product?._id;
                window.location.href = serviceId ? `/makeover?rebook=${serviceId}` : '/makeover';
            }
        } catch (error) {
            console.error('Rebook failed:', error);
            throw error;
        }
    }, []);

    const handleReorder = useCallback(async (historyItem) => {
        try {
            console.log('Reordering:', historyItem.ref);

            // This would integrate with your cart system
            // For now, just navigate to mini-mart with items
            const itemIds = historyItem.items
                .map(item => historyItem.originalData?.items?.find(oi => oi.productInfo?.name === item.name)?.product)
                .filter(Boolean);

            if (itemIds.length > 0) {
                window.location.href = `/mini-mart?reorder=${itemIds.join(',')}`;
            } else {
                window.location.href = '/mini-mart';
            }
        } catch (error) {
            console.error('Reorder failed:', error);
            throw error;
        }
    }, []);



    const handleLeaveReview = useCallback(async (historyItem) => {
        try {
            console.log('Leaving review for:', historyItem.ref);

            // This would integrate with your review system
            // For now, just simulate
            alert(`Review form for ${historyItem.title} would open here`);
        } catch (error) {
            console.error('Review submission failed:', error);
            throw error;
        }
    }, []);

    const refreshHistory = useCallback(async () => {
        try {
            await Promise.all([
                refetchBookings(),
                refetchOrders()
            ]);
        } catch (error) {
            console.error('Refresh failed:', error);
            throw error;
        }
    }, [refetchBookings, refetchOrders]);

    // Filter by type helpers
    const getTypeItems = useCallback((type) => {
        return historyItems.filter(item => item.type === type);
    }, [historyItems]);

    const getUpcomingItems = useCallback(() => {
        return historyItems.filter(item =>
            ['confirmed', 'pending', 'processing', 'ready_for_pickup', 'in_progress'].includes(item.status)
        );
    }, [historyItems]);

    const getCompletedItems = useCallback(() => {
        return historyItems.filter(item =>
            ['completed', 'delivered', 'returned'].includes(item.status)
        );
    }, [historyItems]);

    return {
        // Data
        historyItems: filteredItems,
        allHistoryItems: historyItems,
        stats,
        loading,
        error,

        // Filters
        filters,
        updateFilters,
        clearFilters,

        // Actions
        handleDownloadReceipt,
        handleRebook,
        handleReorder,
        handleLeaveReview,
        refreshHistory,

        // Helpers
        getTypeItems,
        getUpcomingItems,
        getCompletedItems
    };
};

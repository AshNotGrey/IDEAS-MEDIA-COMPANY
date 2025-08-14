// Date formatting is handled in the format utility

/**
 * Maps booking data to unified history item format
 * @param {Object} booking - Booking object from GraphQL
 * @returns {Object} UnifiedHistoryItem
 */
export const mapBookingToHistoryItem = (booking) => {
    const serviceType = booking.product?.type || 'service';
    let type = 'photoshoot'; // default

    // Map service types to history types
    if (serviceType.includes('makeover')) {
        type = 'makeover';
    } else if (serviceType.includes('equipment') || serviceType.includes('rental')) {
        type = 'rental';
    } else if (serviceType.includes('photoshoot') || serviceType.includes('photography')) {
        type = 'photoshoot';
    }

    return {
        id: booking._id,
        type,
        ref: `BK-${booking._id.slice(-8).toUpperCase()}`,
        title: booking.product?.name || 'Service Booking',
        date: booking.date,
        time: booking.time,
        status: booking.status,
        total: booking.totalAmount,
        currency: 'NGN',
        location: booking.location?.address,
        items: [{
            name: booking.product?.name || 'Service',
            quantity: 1,
            thumb: booking.product?.images?.thumbnail,
            duration: booking.duration
        }],
        originalData: booking,
        // Additional booking-specific data
        duration: booking.duration,
        specialRequests: booking.specialRequests,
        notes: booking.notes,
        contactInfo: booking.contactInfo,
        paid: booking.paid,
        paymentMethod: booking.paymentMethod,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    };
};

/**
 * Maps order data to unified history item format
 * @param {Object} order - Order object from GraphQL
 * @returns {Object} UnifiedHistoryItem
 */
export const mapOrderToHistoryItem = (order) => {
    let type = 'shop'; // default for regular shop orders

    // Determine type based on order type and items
    if (order.orderType === 'rental') {
        type = 'rental';
    } else if (order.orderType === 'booking') {
        // Check first item to determine service type
        const firstItem = order.items?.[0];
        if (firstItem?.productInfo?.type?.includes('makeover')) {
            type = 'makeover';
        } else if (firstItem?.productInfo?.type?.includes('photoshoot')) {
            type = 'photoshoot';
        }
    } else if (order.orderType === 'mixed') {
        // For mixed orders, default to shop but this could be enhanced
        type = 'shop';
    }

    // Generate readable reference
    const ref = order.orderNumber || `ORD-${order._id.slice(-8).toUpperCase()}`;

    // Create title based on order type and items
    let title = 'Order';
    if (order.items?.length === 1) {
        title = order.items[0].productInfo?.name || 'Order';
    } else if (order.items?.length > 1) {
        title = `${order.items.length} items`;
    }

    // Get primary date (service date, rental start, or order date)
    let primaryDate = order.createdAt;
    let primaryTime = null;
    let location = null;

    const firstItem = order.items?.[0];
    if (firstItem?.serviceDetails?.date) {
        primaryDate = firstItem.serviceDetails.date;
        primaryTime = firstItem.serviceDetails.time;
        location = firstItem.serviceDetails.location?.address;
    } else if (firstItem?.rentalPeriod?.startDate) {
        primaryDate = firstItem.rentalPeriod.startDate;
        primaryTime = firstItem.rentalPeriod.pickupTime;
    }

    return {
        id: order._id,
        type,
        ref,
        title,
        date: primaryDate,
        time: primaryTime,
        status: order.status,
        total: order.pricing?.total || 0,
        currency: order.pricing?.currency || 'NGN',
        location,
        items: order.items?.map(item => ({
            name: item.productInfo?.name || 'Item',
            quantity: item.quantity,
            thumb: item.productInfo?.images?.thumbnail,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            // Add type-specific data
            ...(item.rentalPeriod && {
                rentalPeriod: {
                    startDate: item.rentalPeriod.startDate,
                    endDate: item.rentalPeriod.endDate,
                    duration: item.rentalPeriod.duration
                }
            }),
            ...(item.serviceDetails && {
                serviceDetails: {
                    date: item.serviceDetails.date,
                    time: item.serviceDetails.time,
                    duration: item.serviceDetails.duration,
                    specialRequests: item.serviceDetails.specialRequests
                }
            })
        })) || [],
        originalData: order,
        // Additional order-specific data
        orderType: order.orderType,
        pricing: order.pricing,
        payment: order.payment,
        workflow: order.workflow,
        receipt: order.receipt,
        fulfillment: order.fulfillment,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
};

/**
 * Merges and sorts bookings and orders into unified history items
 * @param {Array} bookings - Array of booking objects
 * @param {Array} orders - Array of order objects
 * @returns {Array} Sorted array of UnifiedHistoryItem objects
 */
export const mergeHistory = (bookings = [], orders = []) => {
    const historyItems = [
        ...bookings.map(mapBookingToHistoryItem),
        ...orders.map(mapOrderToHistoryItem)
    ];

    // Sort by primary date (service/rental date) or creation date, newest first
    return historyItems.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
    });
};

/**
 * Filters history items based on provided filters
 * @param {Array} historyItems - Array of UnifiedHistoryItem objects
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered array of history items
 */
export const filterHistory = (historyItems, filters = {}) => {
    let filtered = [...historyItems];

    // Filter by type
    if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(item => item.type === filters.type);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(item => {
            // Map status categories to actual statuses
            switch (filters.status) {
                case 'completed':
                    return ['completed', 'delivered', 'returned'].includes(item.status);
                case 'upcoming':
                    return ['confirmed', 'pending', 'processing', 'ready_for_pickup', 'in_progress'].includes(item.status);
                case 'cancelled':
                    return ['cancelled'].includes(item.status);
                case 'refunded':
                    return ['refunded'].includes(item.status);
                default:
                    return item.status === filters.status;
            }
        });
    }

    // Filter by search term
    if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.ref.toLowerCase().includes(searchTerm) ||
            item.items.some(subItem =>
                subItem.name.toLowerCase().includes(searchTerm)
            )
        );
    }

    // Filter by date range
    if (filters.dateRange) {
        const now = new Date();
        let startDate, endDate;

        switch (filters.dateRange) {
            case 'last30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = now;
                break;
            case 'custom':
                if (filters.startDate) startDate = new Date(filters.startDate);
                if (filters.endDate) endDate = new Date(filters.endDate);
                break;
        }

        if (startDate || endDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date || item.createdAt);
                return (!startDate || itemDate >= startDate) &&
                    (!endDate || itemDate <= endDate);
            });
        }
    }

    // Filter by amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        filtered = filtered.filter(item => {
            const amount = item.total || 0;
            return (filters.minAmount === undefined || amount >= filters.minAmount) &&
                (filters.maxAmount === undefined || amount <= filters.maxAmount);
        });
    }

    // Filter by specific flags
    if (filters.hasReceipts) {
        filtered = filtered.filter(item =>
            item.receipt?.generated ||
            (item.originalData?.receipt?.generated)
        );
    }

    if (filters.needsReview) {
        // This would need to be implemented based on review system
        // For now, filter completed items that might need review
        filtered = filtered.filter(item =>
            ['completed', 'delivered'].includes(item.status)
        );
    }

    return filtered;
};

/**
 * Groups history items by time period
 * @param {Array} historyItems - Array of UnifiedHistoryItem objects
 * @param {string} groupBy - 'month' | 'week' | 'day'
 * @returns {Object} Grouped history items
 */
export const groupHistoryByDate = (historyItems, groupBy = 'month') => {
    const grouped = {};

    historyItems.forEach(item => {
        const itemDate = new Date(item.date || item.createdAt);
        let groupKey;

        switch (groupBy) {
            case 'day':
                groupKey = itemDate.toISOString().split('T')[0]; // yyyy-MM-dd
                break;
            case 'week': {
                const startOfWeek = new Date(itemDate);
                startOfWeek.setDate(itemDate.getDate() - itemDate.getDay());
                groupKey = startOfWeek.toISOString().split('T')[0]; // yyyy-MM-dd
                break;
            }
            case 'month':
            default:
                groupKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`; // yyyy-MM
                break;
        }

        if (!grouped[groupKey]) {
            grouped[groupKey] = [];
        }
        grouped[groupKey].push(item);
    });

    return grouped;
};

/**
 * Gets history statistics
 * @param {Array} historyItems - Array of UnifiedHistoryItem objects
 * @returns {Object} Statistics object
 */
export const getHistoryStats = (historyItems) => {
    const stats = {
        total: historyItems.length,
        byType: {
            rental: 0,
            photoshoot: 0,
            makeover: 0,
            shop: 0
        },
        byStatus: {
            completed: 0,
            upcoming: 0,
            cancelled: 0,
            refunded: 0
        },
        totalSpent: 0,
        avgOrderValue: 0
    };

    historyItems.forEach(item => {
        // Count by type
        if (stats.byType[item.type] !== undefined) {
            stats.byType[item.type]++;
        }

        // Count by status category
        if (['completed', 'delivered', 'returned'].includes(item.status)) {
            stats.byStatus.completed++;
        } else if (['confirmed', 'pending', 'processing', 'ready_for_pickup', 'in_progress'].includes(item.status)) {
            stats.byStatus.upcoming++;
        } else if (item.status === 'cancelled') {
            stats.byStatus.cancelled++;
        } else if (item.status === 'refunded') {
            stats.byStatus.refunded++;
        }

        // Calculate totals
        if (item.total && ['completed', 'delivered', 'in_progress'].includes(item.status)) {
            stats.totalSpent += item.total;
        }
    });

    // Calculate average
    const completedOrders = stats.byStatus.completed + stats.byStatus.upcoming;
    stats.avgOrderValue = completedOrders > 0 ? stats.totalSpent / completedOrders : 0;

    return stats;
};

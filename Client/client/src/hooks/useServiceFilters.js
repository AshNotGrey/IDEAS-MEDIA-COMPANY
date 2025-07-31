import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling service filtering, sorting, and search
 * 
 * @param {Array} services - Array of services to filter/sort
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Filtered and sorted services with filter state and handlers
 */
export const useServiceFilters = (services = [], itemsPerPage = 12) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('latest');
    const [sortOrder, setSortOrder] = useState('desc');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);

    // Get unique categories from services
    const availableCategories = useMemo(() => {
        const categories = [...new Set(services.map(service => service.category).filter(Boolean))];
        return categories.sort();
    }, [services]);

    // Filter and sort services
    const filteredAndSortedServices = useMemo(() => {
        let filtered = [...services];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(service =>
                service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(service => service.category === filters.category);
        }

        // Apply price range filter
        if (filters.minPrice) {
            filtered = filtered.filter(service => service.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(service => service.price <= filters.maxPrice);
        }

        // Apply duration filter
        if (filters.duration) {
            filtered = filtered.filter(service => {
                const serviceDuration = service.duration || 'medium';
                return serviceDuration === filters.duration;
            });
        }

        // Apply date range filter (if service has availability dates)
        if (dateRange.start || dateRange.end) {
            filtered = filtered.filter(service => {
                // This would need to be implemented based on actual service availability data
                // For now, we'll just return true
                return true;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'latest':
                    comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    break;
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'name':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'duration':
                    comparison = (a.duration || 0) - (b.duration || 0);
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [services, searchTerm, filters, sortBy, sortOrder, dateRange]);

    // Handlers
    const handleSearchChange = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleSortChange = useCallback((field, order) => {
        setSortBy(field);
        setSortOrder(order);
    }, []);

    const handleDateRangeChange = useCallback((range) => {
        setDateRange(range);
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchTerm('');
        setFilters({});
        setDateRange({ start: '', end: '' });
    }, []);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedServices = filteredAndSortedServices.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, sortBy, sortOrder, dateRange]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Stats
    const stats = useMemo(() => ({
        total: services.length,
        filtered: filteredAndSortedServices.length,
        hasActiveFilters: searchTerm || Object.keys(filters).length > 0 ||
            dateRange.start || dateRange.end
    }), [services.length, filteredAndSortedServices.length, searchTerm, filters, dateRange]);

    return {
        // Data
        services: paginatedServices,
        allServices: filteredAndSortedServices,
        availableCategories,

        // State
        searchTerm,
        filters,
        sortBy,
        sortOrder,
        dateRange,
        currentPage,
        totalPages,

        // Handlers
        handleSearchChange,
        handleFilterChange,
        handleSortChange,
        handleDateRangeChange,
        handlePageChange,
        clearAllFilters,

        // Stats
        stats
    };
}; 
import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling product filtering, sorting, and search
 * 
 * @param {Array} products - Array of products to filter/sort
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Filtered and sorted products with filter state and handlers
 */
export const useProductFilters = (products = [], itemsPerPage = 12) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('latest');
    const [sortOrder, setSortOrder] = useState('desc');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [currentPage, setCurrentPage] = useState(1);

    // Get unique categories and tags from products
    const availableCategories = useMemo(() => {
        const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
        return categories.sort();
    }, [products]);

    const availableTags = useMemo(() => {
        const allTags = products.flatMap(product => product.tags || []);
        const uniqueTags = [...new Set(allTags)];
        return uniqueTags.sort();
    }, [products]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        // Apply tag filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(product => {
                const productTags = product.tags || [];
                return filters.tags.some(tag => productTags.includes(tag));
            });
        }

        // Apply price range filter
        filtered = filtered.filter(product =>
            product.price >= priceRange.min && product.price <= priceRange.max
        );

        // Apply availability filter
        if (filters.availability === 'in-stock') {
            filtered = filtered.filter(product => product.stock > 0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'latest':
                    comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    break;
                case 'rating':
                    comparison = (b.rating || 0) - (a.rating || 0);
                    break;
                case 'name':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'reviews':
                    comparison = (b.reviewCount || 0) - (a.reviewCount || 0);
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [products, searchTerm, filters, sortBy, sortOrder, priceRange]);

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

    const handlePriceRangeChange = useCallback((range) => {
        setPriceRange(range);
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchTerm('');
        setFilters({});
        setPriceRange({ min: 0, max: 10000 });
    }, []);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, sortBy, sortOrder, priceRange]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Stats
    const stats = useMemo(() => ({
        total: products.length,
        filtered: filteredAndSortedProducts.length,
        hasActiveFilters: searchTerm || Object.keys(filters).length > 0 ||
            priceRange.min > 0 || priceRange.max < 10000
    }), [products.length, filteredAndSortedProducts.length, searchTerm, filters, priceRange]);

    return {
        // Data
        products: paginatedProducts,
        allProducts: filteredAndSortedProducts,
        availableCategories,
        availableTags,

        // State
        searchTerm,
        filters,
        sortBy,
        sortOrder,
        priceRange,
        currentPage,
        totalPages,

        // Handlers
        handleSearchChange,
        handleFilterChange,
        handleSortChange,
        handlePriceRangeChange,
        handlePageChange,
        clearAllFilters,

        // Stats
        stats
    };
}; 
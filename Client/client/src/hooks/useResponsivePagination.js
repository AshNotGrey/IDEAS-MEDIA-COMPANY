import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive pagination
 * Returns items per page based on screen size
 * 
 * @returns {number} Items per page (10 on mobile, 6 on md and lg)
 */
export const useResponsivePagination = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default to mobile

    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
            // md breakpoint is 768px in Tailwind
            if (width >= 768) {
                setItemsPerPage(6); // md and lg screens
            } else {
                setItemsPerPage(10); // mobile screens
            }
        };

        // Set initial value
        updateItemsPerPage();

        // Add event listener
        window.addEventListener('resize', updateItemsPerPage);

        // Cleanup
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    return itemsPerPage;
};
import { useMemo } from "react";
import { useCart } from "../utils/useCart";

/**
 * Custom hook for calculating cart totals and statistics
 * 
 * Provides computed values for cart items, totals, and useful statistics
 * that can be used across different components.
 *
 * @returns {Object} Cart totals and statistics
 *   @property {number} itemCount - Total number of items in cart
 *   @property {number} uniqueItemCount - Number of unique items in cart
 *   @property {number} subtotal - Total price before discounts/shipping
 *   @property {number} total - Final total after discounts/shipping
 *   @property {boolean} isEmpty - Whether cart is empty
 *   @property {boolean} hasItems - Whether cart has items
 *   @property {Array} itemTypes - Array of unique item types/categories
 *   @property {Object} categoryBreakdown - Breakdown of items by category
 */
export default function useCartTotals() {
    const { items, subtotal, discount, shipping, total } = useCart();

    const cartStats = useMemo(() => {
        // Calculate total item count (including quantities)
        const itemCount = items.reduce((total, item) => total + item.quantity, 0);

        // Calculate unique item count
        const uniqueItemCount = items.length;

        // Check if cart is empty
        const isEmpty = items.length === 0;
        const hasItems = !isEmpty;

        // Get unique item types/categories
        const itemTypes = [...new Set(items.map(item => item.category || 'uncategorized'))];

        // Create category breakdown
        const categoryBreakdown = items.reduce((acc, item) => {
            const category = item.category || 'uncategorized';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    items: [],
                    subtotal: 0
                };
            }
            acc[category].count += item.quantity;
            acc[category].items.push(item);
            acc[category].subtotal += item.price * item.quantity;
            return acc;
        }, {});

        return {
            itemCount,
            uniqueItemCount,
            subtotal,
            total,
            discount,
            shipping,
            isEmpty,
            hasItems,
            itemTypes,
            categoryBreakdown
        };
    }, [items, subtotal, discount, shipping, total]);

    return cartStats;
} 
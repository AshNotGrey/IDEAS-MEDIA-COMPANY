import React from "react";
/**
 * MakeoverCard component displays a makeover card with title, description, and price.
 * It allows users to select a makeover by clicking on it.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - The makeover item containing id, title, description, and price.
 * @param {string} props.selectedId - The id of the currently selected makeover.
 * @param {Function} props.onSelect - Function to handle makeover selection.
 * @param {boolean} props.loading - Whether the makeover is currently loading.
 * @returns {JSX.Element} The rendered makeover card.
 */
export default function MakeoverCard({ item, selectedId, onSelect, loading }) {
    if (loading) {
        return (
            <div className='card skeleton h-[120px]' />
        );
    }

    const isActive = selectedId === item.id;

    return (
        <div
            onClick={() => onSelect(item)}
            className={`card cursor-pointer card-hover transition border-2 ${isActive ? 'border-ideas-accent' : 'border-transparent'
                }`}
        >
            <h3 className='font-heading text-lg mb-1'>{item.title}</h3>
            <p className='text-subtle mb-2'>{item.description}</p>
            <p className='text-ideas-accent font-semibold'>₦{item.price.toLocaleString()}</p>
        </div>
    );
}

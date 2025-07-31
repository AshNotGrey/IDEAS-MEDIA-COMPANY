import { useContext } from 'react';
import { WishlistContext } from './wishlistContext';

// Custom hook to use wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}; 
// Initial wishlist state
export const initialWishlistState = {
    items: [],
    totalItems: 0
};

// Wishlist reducer for state management
export const wishlistReducer = (state, action) => {
    switch (action.type) {
        case "SET_ITEMS": {
            return {
                ...state,
                items: action.payload,
                totalItems: action.payload.length
            };
        }

        case "ADD_ITEM": {
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                // Item already exists in wishlist
                return state;
            }

            const newItems = [...state.items, action.payload];
            return {
                ...state,
                items: newItems,
                totalItems: newItems.length
            };
        }

        case "REMOVE_ITEM": {
            const filteredItems = state.items.filter(item => item.id !== action.payload);
            return {
                ...state,
                items: filteredItems,
                totalItems: filteredItems.length
            };
        }

        case "CLEAR_WISHLIST": {
            return {
                ...initialWishlistState
            };
        }

        case "MOVE_TO_CART": {
            // Remove from wishlist and return the item for cart addition
            const itemToMove = state.items.find(item => item.id === action.payload);
            if (!itemToMove) return state;

            const filteredItems = state.items.filter(item => item.id !== action.payload);
            return {
                ...state,
                items: filteredItems,
                totalItems: filteredItems.length,
                itemToMove // This will be used by the component to add to cart
            };
        }

        default:
            return state;
    }
}; 
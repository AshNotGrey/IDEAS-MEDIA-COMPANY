// Initial cart state
export const initialState = {
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0.0, // Set to 0 since items are picked up at HQ
    total: 0,
    email: "",
    customerInfo: {
        name: "",
        phone: "",
        address: "",
        city: "",
        country: "",
    },
};

// Cart reducer for state management
export const cartReducer = (state, action) => {
    switch (action.type) {
        case "SET_ITEMS": {
            const newSubtotal = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const newTotal = newSubtotal - state.discount + state.shipping;
            return {
                ...state,
                items: action.payload,
                subtotal: newSubtotal,
                total: newTotal,
            };
        }

        case "ADD_ITEM": {
            const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id);
            let newItems;

            if (existingItemIndex >= 0) {
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                newItems = [...state.items, action.payload];
            }

            const addSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const addTotal = addSubtotal - state.discount + state.shipping;

            return {
                ...state,
                items: newItems,
                subtotal: addSubtotal,
                total: addTotal,
            };
        }

        case "UPDATE_QUANTITY": {
            const updatedItems = state.items.map((item) =>
                item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
            );

            const updateSubtotal = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const updateTotal = updateSubtotal - state.discount + state.shipping;

            return {
                ...state,
                items: updatedItems,
                subtotal: updateSubtotal,
                total: updateTotal,
            };
        }

        case "REMOVE_ITEM": {
            const filteredItems = state.items.filter((item) => item.id !== action.payload);
            const removeSubtotal = filteredItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const removeTotal = removeSubtotal - state.discount + state.shipping;

            return {
                ...state,
                items: filteredItems,
                subtotal: removeSubtotal,
                total: removeTotal,
            };
        }

        case "SET_DISCOUNT": {
            const discountTotal = state.subtotal - action.payload + state.shipping;
            return {
                ...state,
                discount: action.payload,
                total: discountTotal,
            };
        }

        case "SET_SHIPPING": {
            const shippingTotal = state.subtotal - state.discount + action.payload;
            return {
                ...state,
                shipping: action.payload,
                total: shippingTotal,
            };
        }

        case "SET_EMAIL":
            return {
                ...state,
                email: action.payload,
            };

        case "SET_CUSTOMER_INFO":
            return {
                ...state,
                customerInfo: { ...state.customerInfo, ...action.payload },
            };

        case "CLEAR_CART":
            return {
                ...initialState,
                shipping: state.shipping,
                email: state.email,
                customerInfo: state.customerInfo,
            };

        default:
            return state;
    }
}; 
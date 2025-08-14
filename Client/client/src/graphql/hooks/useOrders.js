import { useMutation, useQuery } from '@apollo/client';
import {
    ADD_TO_CART,
    GET_MY_CART,
    UPDATE_CART_ITEM,
    REMOVE_FROM_CART,
    CLEAR_CART,
    PROCEED_TO_CHECKOUT,
    INITIATE_PAYMENT
} from '../queries/orders.js';

export const useCart = () => {
    // Queries
    const {
        data: cartData,
        loading: cartLoading,
        error: cartError,
        refetch: refetchCart
    } = useQuery(GET_MY_CART, {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
    });

    // Mutations
    const [addToCartMutation, { loading: addLoading }] = useMutation(ADD_TO_CART, {
        refetchQueries: [{ query: GET_MY_CART }],
        awaitRefetchQueries: true
    });

    const [updateCartItemMutation, { loading: updateLoading }] = useMutation(UPDATE_CART_ITEM, {
        refetchQueries: [{ query: GET_MY_CART }],
        awaitRefetchQueries: true
    });

    const [removeFromCartMutation, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART, {
        refetchQueries: [{ query: GET_MY_CART }],
        awaitRefetchQueries: true
    });

    const [clearCartMutation, { loading: clearLoading }] = useMutation(CLEAR_CART, {
        refetchQueries: [{ query: GET_MY_CART }],
        awaitRefetchQueries: true
    });

    const [proceedToCheckoutMutation, { loading: checkoutLoading }] = useMutation(PROCEED_TO_CHECKOUT);

    const [initiatePaymentMutation, { loading: paymentLoading }] = useMutation(INITIATE_PAYMENT);

    // Helper functions
    const addToCart = async (item) => {
        try {
            // Validate item parameter
            if (!item) {
                throw new Error('Item is required');
            }

            // Transform frontend cart item to GraphQL input format
            const input = {
                productId: item.productId || item.id,
                quantity: item.quantity || 1
            };

            // Add service details if it's a service
            if (item.type === "service" && item.serviceDetails) {
                input.serviceDetails = {
                    date: item.serviceDetails.date,
                    time: item.serviceDetails.time,
                    duration: item.serviceDetails.duration,
                    location: {
                        type: item.serviceDetails.location.type,
                        address: item.serviceDetails.location.address || ""
                    },
                    specialRequests: item.serviceDetails.specialRequests || []
                };
            }

            const { data } = await addToCartMutation({
                variables: { input }
            });

            return { success: true, order: data.addToCart.order };
        } catch (error) {
            console.error('Add to cart error:', error);
            return { success: false, error: error.message };
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const { data } = await updateCartItemMutation({
                variables: {
                    input: { productId, quantity }
                }
            });
            return { success: true, order: data.updateCartItem.order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const { data } = await removeFromCartMutation({
                variables: { productId }
            });
            return { success: true, order: data.removeFromCart.order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const clearCart = async () => {
        try {
            const { data } = await clearCartMutation();
            return { success: true, order: data.clearCart.order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const proceedToCheckout = async (checkoutData) => {
        try {
            const { data } = await proceedToCheckoutMutation({
                variables: { input: checkoutData }
            });
            return { success: true, order: data.proceedToCheckout };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const initiatePayment = async (orderId, paymentData) => {
        try {
            const { data } = await initiatePaymentMutation({
                variables: { orderId, input: paymentData }
            });
            return { success: true, ...data.initiatePayment };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        // Data
        cart: cartData?.myCart,
        loading: cartLoading,
        error: cartError,

        // Loading states
        addLoading,
        updateLoading,
        removeLoading,
        clearLoading,
        checkoutLoading,
        paymentLoading,

        // Actions
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        proceedToCheckout,
        initiatePayment,
        refetchCart
    };
};

export default useCart;
import React, { useReducer, useEffect } from "react";
import { cartReducer, initialState } from "./cartReducer";
import { CartContext } from "./cartContext";

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("ideal-photography-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: "SET_ITEMS", payload: parsedCart.items || [] });
        if (parsedCart.email) {
          dispatch({ type: "SET_EMAIL", payload: parsedCart.email });
        }
        if (parsedCart.customerInfo) {
          dispatch({ type: "SET_CUSTOMER_INFO", payload: parsedCart.customerInfo });
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartData = {
      items: state.items,
      email: state.email,
      customerInfo: state.customerInfo,
    };
    localStorage.setItem("ideal-photography-cart", JSON.stringify(cartData));
  }, [state.items, state.email, state.customerInfo]);

  // Cart actions
  const addItem = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const removeItem = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const setDiscount = (discount) => {
    dispatch({ type: "SET_DISCOUNT", payload: discount });
  };

  const setShipping = (shipping) => {
    dispatch({ type: "SET_SHIPPING", payload: shipping });
  };

  const setEmail = (email) => {
    dispatch({ type: "SET_EMAIL", payload: email });
  };

  const setCustomerInfo = (info) => {
    dispatch({ type: "SET_CUSTOMER_INFO", payload: info });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const value = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    setDiscount,
    setShipping,
    setEmail,
    setCustomerInfo,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

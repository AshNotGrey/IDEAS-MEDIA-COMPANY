import React, { useReducer, useEffect } from "react";
import { wishlistReducer, initialWishlistState } from "./wishlistReducer";
import { WishlistContext } from "./wishlistContext";

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialWishlistState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("ideal-photography-wishlist");
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: "SET_ITEMS", payload: parsedWishlist.items || [] });
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const wishlistData = {
      items: state.items,
    };
    localStorage.setItem("ideal-photography-wishlist", JSON.stringify(wishlistData));
  }, [state.items]);

  // Wishlist actions
  const addToWishlist = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeFromWishlist = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const moveToCart = (id) => {
    dispatch({ type: "MOVE_TO_CART", payload: id });
  };

  const isInWishlist = (id) => {
    return state.items.some((item) => item.id === id);
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

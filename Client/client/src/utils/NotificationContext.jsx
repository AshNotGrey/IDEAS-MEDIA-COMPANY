import React, { useReducer, useEffect } from "react";
import { notificationReducer, initialNotificationState } from "./notificationReducer";
import { NotificationContext } from "./notificationContext";

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);

  // Load notification settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("ideal-photography-notification-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: "UPDATE_SETTINGS", payload: parsedSettings });
      } catch (error) {
        console.error("Error loading notification settings from localStorage:", error);
      }
    }
  }, []);

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ideal-photography-notification-settings", JSON.stringify(state.settings));
  }, [state.settings]);

  // Notification actions
  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setNotifications = (notifications) => {
    dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
  };

  const addNotification = (notification) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification });
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: "MARK_AS_READ", payload: { notificationId } });
  };

  const markAllAsRead = () => {
    dispatch({ type: "MARK_ALL_AS_READ" });
  };

  const removeNotification = (id) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: { id } });
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  const updateSettings = (settings) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  };

  const setLastFetched = (timestamp) => {
    dispatch({ type: "SET_LAST_FETCHED", payload: timestamp });
  };

  // Fetch notifications from API (placeholder for now)
  const fetchNotifications = async (limit = 20, unreadOnly = false) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/notifications?limit=${limit}&unreadOnly=${unreadOnly}`);
      // const data = await response.json();

      // For now, use mock data
      const mockNotifications = [
        {
          id: "1",
          title: "Welcome to Ideal Photography",
          message: "Thank you for joining our platform!",
          type: "system",
          category: "info",
          read: false,
          createdAt: new Date().toISOString(),
          priority: "normal",
        },
        {
          id: "2",
          title: "Booking Confirmed",
          message: "Your photography session has been confirmed for next week.",
          type: "booking",
          category: "success",
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          priority: "high",
        },
      ];

      // Filter based on unreadOnly parameter and limit
      let filteredNotifications = mockNotifications;
      if (unreadOnly) {
        filteredNotifications = mockNotifications.filter((n) => !n.read);
      }
      filteredNotifications = filteredNotifications.slice(0, limit);

      setNotifications(filteredNotifications);
      setLastFetched(new Date().toISOString());
    } catch (error) {
      setError(error.message);
    }
  };

  const value = {
    ...state,
    setLoading,
    setError,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    updateSettings,
    setLastFetched,
    fetchNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

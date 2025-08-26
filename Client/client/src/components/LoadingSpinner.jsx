import React from "react";
import PropTypes from "prop-types";

/**
 * LoadingSpinner component for showing loading states
 * Used primarily for lazy loading routes and async operations
 */
const LoadingSpinner = ({ 
  size = "md", 
  color = "primary", 
  centered = true, 
  fullScreen = false,
  message = "Loading...",
  showMessage = true,
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4"
  };

  const colorClasses = {
    primary: "border-ideas-accent border-t-transparent",
    secondary: "border-gray-400 border-t-transparent dark:border-gray-600",
    white: "border-white border-t-transparent",
    success: "border-green-500 border-t-transparent",
    danger: "border-red-500 border-t-transparent"
  };

  const spinnerClass = [
    "rounded-full animate-spin",
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(" ");

  const containerClass = [
    centered && "flex items-center justify-center",
    fullScreen && "fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50",
    !fullScreen && centered && "min-h-[200px]"
  ].filter(Boolean).join(" ");

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className={spinnerClass} />
      {showMessage && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );

  if (containerClass) {
    return (
      <div className={containerClass}>
        {content}
      </div>
    );
  }

  return content;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf(["primary", "secondary", "white", "success", "danger"]),
  centered: PropTypes.bool,
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  showMessage: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;

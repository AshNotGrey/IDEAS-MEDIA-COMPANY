import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Universal Button component supporting multiple variants
 *
 * Refactored to match Ideal Photography's core theme:
 *  - Primary: Gradient-filled with continuous shimmer
 *  - Secondary: Transparent borders with rotating border colors
 *  - WhatsApp: Green action
 *
 * Animation support is optional and will be appended without breaking props.
 */
const Button = ({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  animated = false,
  type = "button",
  href,
  as,
  className = "",
  onClick,
  leftIcon,
  rightIcon,
  color,
  icon,
  ...rest
}) => {
  // Determine if this is an internal link (starts with /) or external link
  const isInternalLink = href && href.startsWith("/") && !href.startsWith("//");
  const Tag = as || (href ? (isInternalLink ? Link : "a") : "button");

  const base = [
    "relative overflow-hidden inline-flex items-center justify-center font-medium",
    "transition-all duration-200 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ];

  const variants = {
    primary: [
      "bg-gradient-to-r from-ideas-accent to-ideas-accentLight text-white border border-transparent",
      "hover:from-ideas-accentHover hover:to-ideas-accentLight hover:text-white transition-all duration-300",
      "focus:ring-ideas-accentHover focus:text-white",
      "dark:text-white dark:hover:text-white",
      "shadow-md hover:shadow-xl",
    ],
    secondary: [
      "bg-transparent border-2 border-ideas-accent text-ideas-accent dark:text-white",
      "hover:border-ideas-accentHover",
      "focus:ring-ideas-accent",
      "dark:border-ideas-accent",
    ],
    text: [
      "bg-transparent border border-transparent",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      "focus:ring-gray-400",
    ],
    whatsapp: [
      "bg-green-500 text-white border border-green-600",
      "hover:bg-green-600",
      "focus:ring-green-400",
    ],
  };

  const colorClasses = {
    red: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const animatedVariants = {
    primary: "before:animate-shimmer hover:shadow-lg",
    secondary: "hover:before:animate-border-slide focus:before:animate-border-slide",
    text: "",
    whatsapp:
      "transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 active:scale-95",
  };

  const finalClass = [
    ...base,
    ...variants[variant],
    color && colorClasses[color],
    sizes[size],
    fullWidth && "w-full",
    loading && "relative text-transparent",
    animated && animatedVariants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const commonProps = {
    className: finalClass,
    onClick: handleClick,
    "aria-disabled": disabled || loading,
    tabIndex: disabled || loading ? -1 : undefined,
    ...rest,
  };

  const elementProps =
    Tag === "button"
      ? { type, disabled: disabled || loading }
      : isInternalLink
        ? { to: disabled || loading ? undefined : href }
        : { href: disabled || loading ? undefined : href };

  return (
    <Tag {...commonProps} {...elementProps}>
      {animated && variant === "primary" && (
        <span className='absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:-translate-x-full before:skew-x-12 before:opacity-90 before:animate-shimmer' />
      )}

      {animated && variant === "secondary" && (
        <span className='absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-ideas-accent before:via-white before:to-ideas-accent dark:before:via-black before:rounded-md before:opacity-20 before:-translate-x-full before:transition-transform before:duration-500 before:ease-out' />
      )}

      {loading && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
        </div>
      )}

      {leftIcon && !loading && (
        <span className='mr-2 flex-shrink-0 drop-shadow-sm'>{leftIcon}</span>
      )}

      {icon && !loading && <span className='mr-2 flex-shrink-0 drop-shadow-sm'>{icon}</span>}

      <span className='flex items-center z-10 drop-shadow-sm'>{children}</span>

      {rightIcon && !loading && (
        <span className='ml-2 flex-shrink-0 drop-shadow-sm'>{rightIcon}</span>
      )}
    </Tag>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "text", "whatsapp"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  animated: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  href: PropTypes.string,
  as: PropTypes.oneOf(["a", "button"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  color: PropTypes.oneOf(["red"]),
  icon: PropTypes.node,
};

export default Button;

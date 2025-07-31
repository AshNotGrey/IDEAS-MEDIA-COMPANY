import React from "react";
import PropTypes from "prop-types";
import useTheme from "../../hooks/useTheme.js";

/**
 * AuthLayout component
 *
 * Provides a consistent layout for authentication pages with
 * theme support and responsive design.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render
 * @param {string} [props.title] - Page title
 * @param {string} [props.subtitle] - Page subtitle
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```jsx
 * <AuthLayout title="Sign In" subtitle="Welcome back">
 *   <SignInForm />
 * </AuthLayout>
 * ```
 */
const AuthLayout = ({ children, title, subtitle, className = "" }) => {
  // Use theme hook to ensure proper theme state initialization
  useTheme();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-ideas-lightInput via-ideas-white to-ideas-lightInput dark:from-ideas-darkInput dark:via-ideas-black dark:to-ideas-darkInput flex items-center justify-center px-6 py-12 ${className}`}>
      <div className='w-full max-w-md'>
        {/* Header */}
        {(title || subtitle) && (
          <div className='text-center mb-8'>
            {title && (
              <h1 className='text-3xl font-heading font-bold text-ideas-black dark:text-ideas-white mb-2'>
                {title}
              </h1>
            )}
            {subtitle && <p className='text-gray-600 dark:text-gray-400'>{subtitle}</p>}
          </div>
        )}

        {/* Content */}
        <div className='card bg-ideas-white dark:bg-ideas-black shadow-card dark:shadow-cardDark border border-gray-200/50 dark:border-gray-700/50 p-8'>
          {children}
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

export default AuthLayout;

import React from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/**
 * Higher-order component for easier route protection
 * 
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component, options = {}) => {
    const ProtectedComponent = (props) => {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };

    ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    return ProtectedComponent;
};

export default withAuth;

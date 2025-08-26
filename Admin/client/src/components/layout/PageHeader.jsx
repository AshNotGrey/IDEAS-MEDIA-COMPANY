import React from 'react';
import Breadcrumb from './Breadcrumb.jsx';

const PageHeader = ({ 
  title, 
  subtitle, 
  children, // Action buttons or other content
  className = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Page title and actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold text-black dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-subtle mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Action buttons */}
          {children && (
            <div className="flex items-center space-x-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

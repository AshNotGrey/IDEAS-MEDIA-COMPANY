import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        size={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48} 
        className="animate-spin text-ideas-accent mb-2" 
      />
      {text && (
        <p className="text-sm text-subtle text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

import React from "react";

const AuthPageLayout = ({ children, title, subtitle, className = "" }) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-ideas-lightInput via-ideas-white to-ideas-lightInput dark:from-ideas-darkInput dark:via-ideas-black dark:to-ideas-darkInput flex items-center justify-center px-6 py-12 ${className}`}>
      <div className='w-full max-w-md'>
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

        <div className='card bg-ideas-white dark:bg-ideas-black shadow-card dark:shadow-cardDark border border-gray-200/50 dark:border-gray-700/50 p-8'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;

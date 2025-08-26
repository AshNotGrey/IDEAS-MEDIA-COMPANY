import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Always add home
    breadcrumbs.push({
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={16} />
    });
    
    // Add path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip dashboard since we already added it
      if (segment === 'dashboard') return;
      
      // Format segment name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name,
        href: currentPath,
        current: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb on dashboard
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-subtle mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.href}>
          {index > 0 && (
            <ChevronRight size={16} className="text-gray-400" />
          )}
          
          {breadcrumb.current ? (
            <span className="text-black dark:text-white font-medium">
              {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.href}
              className="hover:text-ideas-accent transition-colors duration-200 flex items-center"
            >
              {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
              {breadcrumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

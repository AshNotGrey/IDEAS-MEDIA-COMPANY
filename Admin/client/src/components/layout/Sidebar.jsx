import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Cog,
  Image,
  MessageSquare,
  BarChart3,
  HardDrive,
  Mail,
  Settings,
  Shield,
  UserPlus,
  UserCheck,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  AlertTriangle,
  FileText,
  Brain,
  Zap,
  Target,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <Shield size={20} />,
      current: location.pathname.startsWith("/sessions"),
    },
    {
      name: "Admin Management",
      href: "#",
      icon: <Users size={20} />,
      current: location.pathname.startsWith("/admin-"),
      children: [
        {
          name: "Invites",
          href: "/admin-invites",
          icon: <UserPlus size={16} />,
          current: location.pathname === "/admin-invites",
        },
        {
          name: "Verification",
          href: "/admin-verification",
          icon: <UserCheck size={16} />,
          current: location.pathname === "/admin-verification",
        },
      ],
    },
    {
      name: "Security",
      href: "/security",
      icon: <AlertTriangle size={20} />,
      current:
        location.pathname.startsWith("/security") ||
        location.pathname.startsWith("/audit-logs") ||
        location.pathname.startsWith("/threat-intelligence") ||
        location.pathname.startsWith("/automated-response") ||
        location.pathname.startsWith("/admin-hierarchy") ||
        location.pathname.startsWith("/compliance-reporting"),
      children: [
        {
          name: "Dashboard",
          href: "/security",
          icon: <BarChart3 size={16} />,
          current: location.pathname === "/security",
        },
        {
          name: "Settings",
          href: "/security-settings",
          icon: <Settings size={16} />,
          current: location.pathname === "/security-settings",
        },
        {
          name: "Audit Logs",
          href: "/audit-logs",
          icon: <FileText size={16} />,
          current: location.pathname === "/audit-logs",
        },
        {
          name: "Threat Intelligence",
          href: "/threat-intelligence",
          icon: <Brain size={16} />,
          current: location.pathname === "/threat-intelligence",
        },
        {
          name: "Automated Response",
          href: "/automated-response",
          icon: <Zap size={16} />,
          current: location.pathname === "/automated-response",
        },
        {
          name: "Admin Hierarchy",
          href: "/admin-hierarchy",
          icon: <Users size={16} />,
          current: location.pathname === "/admin-hierarchy",
        },
        {
          name: "Compliance",
          href: "/compliance-reporting",
          icon: <Target size={16} />,
          current: location.pathname === "/compliance-reporting",
        },
      ],
    },
    {
      name: "Users",
      href: "/users",
      icon: <Users size={20} />,
      current: location.pathname.startsWith("/users"),
    },
    {
      name: "Bookings",
      href: "/bookings",
      icon: <Calendar size={20} />,
      current: location.pathname.startsWith("/bookings"),
    },
    {
      name: "Services",
      href: "/services",
      icon: <Cog size={20} />,
      current: location.pathname.startsWith("/services"),
    },
    {
      name: "Galleries",
      href: "/galleries",
      icon: <Image size={20} />,
      current: location.pathname.startsWith("/galleries"),
    },
    {
      name: "Reviews",
      href: "/reviews",
      icon: <MessageSquare size={20} />,
      current: location.pathname.startsWith("/reviews"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <BarChart3 size={20} />,
      current: location.pathname.startsWith("/analytics"),
    },
    {
      name: "Media Library",
      href: "/media",
      icon: <HardDrive size={20} />,
      current: location.pathname.startsWith("/media"),
    },
    {
      name: "Email Templates",
      href: "/email-templates",
      icon: <Mail size={20} />,
      current: location.pathname.startsWith("/email-templates"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
      current: location.pathname.startsWith("/settings"),
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleExpanded = (itemName) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const renderNavItem = (item, isMobile = false) => {
    if (item.children) {
      const isExpanded = expandedItems.has(item.name);
      const hasActiveChild = item.children.some((child) => child.current);

      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`
              group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${
                item.current || hasActiveChild
                  ? "bg-ideas-accent text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }
            `}>
            <div className='flex items-center'>
              <span className='mr-3'>{item.icon}</span>
              {item.name}
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isExpanded && (
            <div className='ml-4 mt-1 space-y-1'>
              {item.children.map((child) => (
                <NavLink
                  key={child.name}
                  to={child.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${
                      child.current
                        ? "bg-ideas-accent/20 text-ideas-accent dark:bg-ideas-accent/20 dark:text-ideas-accent"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                  onClick={isMobile ? onClose : undefined}>
                  <span className='mr-3'>{child.icon}</span>
                  {child.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
          ${
            item.current
              ? "bg-ideas-accent text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          }
        `}
        onClick={isMobile ? onClose : undefined}>
        <span className='mr-3'>{item.icon}</span>
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-ideas-darkInput border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-ideas-accent rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>I</span>
            </div>
            <span className='text-lg font-bold text-black dark:text-white'>IDEAS Admin</span>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto py-4'>
          <nav className='space-y-1 px-3'>
            {navigation.map((item) => renderNavItem(item, true))}
          </nav>
        </div>

        {/* User section */}
        <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
          <div className='flex items-center space-x-3 mb-3'>
            <div className='w-8 h-8 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
              <User size={16} className='text-ideas-accent' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-black dark:text-white truncate'>
                {admin?.username || "Admin"}
              </p>
              <p className='text-xs text-subtle capitalize'>{admin?.role || "Administrator"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className='w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200'>
            <LogOut size={16} className='mr-2' />
            Sign Out
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className='lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:dark:bg-ideas-darkInput lg:border-r lg:border-gray-200 lg:dark:border-gray-700'>
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='w-8 h-8 bg-ideas-accent rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>I</span>
            </div>
            <span className='ml-3 text-lg font-bold text-black dark:text-white'>IDEAS Admin</span>
          </div>

          {/* Navigation */}
          <div className='flex-1 overflow-y-auto py-4'>
            <nav className='space-y-1 px-3'>{navigation.map((item) => renderNavItem(item))}</nav>
          </div>

          {/* User section */}
          <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
            <div className='flex items-center space-x-3 mb-3'>
              <div className='w-8 h-8 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
                <User size={16} className='text-ideas-accent' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-black dark:text-white truncate'>
                  {admin?.username || "Admin"}
                </p>
                <p className='text-xs text-subtle capitalize'>{admin?.role || "Administrator"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className='w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200'>
              <LogOut size={16} className='mr-2' />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

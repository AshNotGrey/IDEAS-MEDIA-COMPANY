import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import authService from "../../services/authService.js";
import GlobalSearch from "../common/GlobalSearch.jsx";
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  Activity,
  ChevronDown,
  Clock,
  Smartphone,
  Monitor,
} from "lucide-react";

const Header = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState("");

  // Generate current device ID (same as login)
  useEffect(() => {
    const generateDeviceId = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
      return btoa(canvas.toDataURL()).slice(0, 32);
    };
    setCurrentDeviceId(generateDeviceId());
  }, []);

  // Fetch session count from REST API
  const [sessionCount, setSessionCount] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch sessions when component mounts or when admin changes
  useEffect(() => {
    if (admin?.token) {
      fetchSessions();
    }
  }, [admin]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await authService.getSessions(admin.token);
      setSessionCount(response.sessions?.length || 0);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessionCount(0);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getDeviceIcon = (platform) => {
    if (!platform) return <Monitor className='w-4 h-4' />;

    switch (platform.toLowerCase()) {
      case "windows":
      case "macos":
      case "linux":
        return <Monitor className='w-4 h-4' />;
      case "android":
        return <Smartphone className='w-4 h-4' />;
      case "ios":
        return <Smartphone className='w-4 h-4' />;
      default:
        return <Monitor className='w-4 h-4' />;
    }
  };

  const getPlatform = () => {
    const platform = navigator.platform || "unknown";
    if (platform.includes("Win")) return "Windows";
    if (platform.includes("Mac")) return "macOS";
    if (platform.includes("Linux")) return "Linux";
    if (platform.includes("Android")) return "Android";
    if (platform.includes("iOS")) return "iOS";
    return platform;
  };

  return (
    <header className='bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left side - Mobile menu button and search */}
          <div className='flex items-center space-x-4'>
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
              <Menu size={20} />
            </button>

            {/* Global Search */}
            <div className='hidden sm:block flex-1 max-w-lg'>
              <GlobalSearch className='w-full max-w-md' />
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className='flex items-center space-x-4'>
            {/* Session Count Badge */}
            <div className='hidden md:flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <Shield className='w-4 h-4 text-blue-600' />
              <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                {loadingSessions ? "..." : `${sessionCount} sessions`}
              </span>
            </div>

            {/* Notifications */}
            <button className='p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative'>
              <Bell size={20} />
              {/* Notification badge */}
              <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
            </button>

            {/* User menu */}
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center space-x-3 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                <div className='w-8 h-8 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
                  <User size={16} className='text-ideas-accent' />
                </div>
                <div className='hidden sm:block text-left'>
                  <p className='text-sm font-medium text-black dark:text-white'>
                    {admin?.username || "Admin"}
                  </p>
                  <div className='flex items-center space-x-2'>
                    <span className='text-xs text-subtle capitalize'>
                      {admin?.role || "Administrator"}
                    </span>
                    <span className='text-xs text-blue-600 dark:text-blue-400'>
                      • {loadingSessions ? "..." : `${sessionCount} active`}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className='text-gray-400' />
              </button>

              {/* Enhanced User dropdown menu */}
              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-64 bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50'>
                  {/* User Info Section */}
                  <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
                        <User size={20} className='text-ideas-accent' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-black dark:text-white truncate'>
                          {admin?.username || "Admin"}
                        </p>
                        <p className='text-xs text-subtle capitalize'>
                          {admin?.role || "Administrator"}
                        </p>
                      </div>
                    </div>

                    {/* Current Device Info */}
                    <div className='mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md'>
                      <div className='flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400'>
                        {getDeviceIcon(getPlatform())}
                        <span className='font-medium'>Current Device:</span>
                        <span>{getPlatform()}</span>
                      </div>
                      <div className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                        Device ID: {currentDeviceId.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className='py-1'>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2'>
                      <User size={16} />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2'>
                      <Shield size={16} />
                      <span>Active Sessions</span>
                      <span className='ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                        {loadingSessions ? "..." : sessionCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2'>
                      <Settings size={16} />
                      <span>Security Settings</span>
                    </button>

                    <div className='border-t border-gray-200 dark:border-gray-700 my-1'></div>

                    {/* Session Management Quick Actions */}
                    <div className='px-4 py-2'>
                      <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-2'>
                        Session Management
                      </p>
                      <div className='space-y-1'>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className='w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center space-x-2'>
                          <Activity size={14} />
                          <span>View All Sessions</span>
                        </button>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className='w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center space-x-2'>
                          <Clock size={14} />
                          <span>Session History</span>
                        </button>
                      </div>
                    </div>

                    <div className='border-t border-gray-200 dark:border-gray-700 my-1'></div>

                    <button
                      onClick={handleLogout}
                      className='w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2'>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className='sm:hidden px-4 pb-4'>
        <GlobalSearch className='w-full' />
      </div>
    </header>
  );
};

export default Header;

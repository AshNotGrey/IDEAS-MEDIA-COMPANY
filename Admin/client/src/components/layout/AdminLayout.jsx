import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page content */}
        <main className='min-h-screen'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

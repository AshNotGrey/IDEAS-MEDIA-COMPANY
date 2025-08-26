import React, { useState, useMemo } from "react";
import { useUsers, useUserStats, useUserMutations } from "../graphql/hooks/useUsers.js";
import UserList from "../components/users/UserList.jsx";
import UserFilters from "../components/users/UserFilters.jsx";
import UserActions from "../components/users/UserActions.jsx";
import UserForm from "../components/users/UserForm.jsx";
import UserDetails from "../components/users/UserDetails.jsx";
import VerificationPanel from "../components/users/VerificationPanel.jsx";
import { Loader2, Users as UsersIcon, Plus, Download, Upload } from "lucide-react";

const Users = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentView, setCurrentView] = useState("list"); // 'list', 'form', 'details', 'verification'
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    isEmailVerified: "",
    verificationStatus: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Data hooks
  const {
    users,
    pagination: userPagination,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers({
    filter: filters,
    ...pagination,
  });

  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useUserStats();

  const {
    loading: mutationLoading,
    bulkUpdateUsers,
    bulkDeleteUsers,
    refetchQueries,
  } = useUserMutations();

  // Computed values
  const loading = usersLoading || statsLoading || mutationLoading;
  const error = usersError || statsError;

  const filteredUserCount = useMemo(() => {
    return userPagination?.total || 0;
  }, [userPagination]);

  // Event handlers
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handlePaginationChange = (newPagination) => {
    setPagination({ ...pagination, ...newPagination });
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (selectAll) => {
    setSelectedUsers(selectAll ? users.map((user) => user._id) : []);
  };

  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    switch (action) {
      case "view":
        setCurrentView("details");
        break;
      case "edit":
        setCurrentView("form");
        break;
      case "verification":
        setCurrentView("verification");
        break;
      default:
        break;
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case "activate":
          await bulkUpdateUsers(selectedUsers, { isActive: true });
          break;
        case "deactivate":
          await bulkUpdateUsers(selectedUsers, { isActive: false });
          break;
        case "delete":
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            await bulkDeleteUsers(selectedUsers);
          }
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      refetchQueries();
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedUser(null);
    refetchUsers();
    refetchStats();
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={48} className='animate-spin text-ideas-accent mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-black dark:text-white'>Loading Users...</h2>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && users.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <UsersIcon size={32} className='text-red-600 dark:text-red-400' />
          </div>
          <h2 className='text-xl font-semibold text-black dark:text-white mb-2'>
            Error Loading Users
          </h2>
          <p className='text-subtle mb-4'>
            Unable to load user data. Please try refreshing the page.
          </p>
          <button onClick={() => window.location.reload()} className='btn-primary'>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Render different views
  const renderCurrentView = () => {
    switch (currentView) {
      case "form":
        return (
          <UserForm user={selectedUser} onSave={handleBackToList} onCancel={handleBackToList} />
        );
      case "details":
        return (
          <UserDetails
            user={selectedUser}
            onBack={handleBackToList}
            onEdit={() => setCurrentView("form")}
          />
        );
      case "verification":
        return <VerificationPanel user={selectedUser} onBack={handleBackToList} />;
      default:
        return (
          <div className='space-y-6'>
            {/* Header */}
            <div className='bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700'>
              <div className='px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h1 className='text-2xl font-heading font-bold text-black dark:text-white flex items-center gap-3'>
                      <UsersIcon size={28} />
                      User Management
                    </h1>
                    <p className='text-subtle mt-1'>
                      Manage users, verify accounts, and monitor user activity.
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={handleCreateUser}
                      className='btn-primary flex items-center gap-2'>
                      <Plus size={16} />
                      Create Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className='px-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='card'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-subtle'>Total Users</p>
                        <p className='text-2xl font-bold text-black dark:text-white'>
                          {stats.totalUsers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
                        <UsersIcon size={24} className='text-blue-600 dark:text-blue-400' />
                      </div>
                    </div>
                  </div>
                  <div className='card'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-subtle'>Active Users</p>
                        <p className='text-2xl font-bold text-black dark:text-white'>
                          {stats.activeUsers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center'>
                        <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      </div>
                    </div>
                  </div>
                  <div className='card'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-subtle'>Verified Users</p>
                        <p className='text-2xl font-bold text-black dark:text-white'>
                          {stats.verifiedUsers?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center'>
                        <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                      </div>
                    </div>
                  </div>
                  <div className='card'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-subtle'>New This Month</p>
                        <p className='text-2xl font-bold text-black dark:text-white'>
                          {stats.newUsersThisMonth?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center'>
                        <Plus size={24} className='text-orange-600 dark:text-orange-400' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Actions */}
            <div className='px-6'>
              <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
                <UserFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  resultCount={filteredUserCount}
                />
                <UserActions
                  selectedUsers={selectedUsers}
                  onBulkAction={handleBulkAction}
                  disabled={loading}
                />
              </div>
            </div>

            {/* User List */}
            <div className='px-6'>
              <UserList
                users={users}
                selectedUsers={selectedUsers}
                pagination={userPagination}
                loading={loading}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onUserAction={handleUserAction}
                onPaginationChange={handlePaginationChange}
                sortBy={pagination.sortBy}
                sortOrder={pagination.sortOrder}
                onSortChange={(sortBy, sortOrder) =>
                  setPagination({ ...pagination, sortBy, sortOrder, page: 1 })
                }
              />
            </div>
          </div>
        );
    }
  };

  return <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>{renderCurrentView()}</div>;
};

export default Users;

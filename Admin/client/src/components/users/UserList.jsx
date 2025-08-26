import React from 'react';
import { 
  Eye, 
  Edit, 
  ShieldCheck, 
  ShieldX, 
  Unlock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';

const UserList = ({
  users = [],
  selectedUsers = [],
  pagination = {},
  loading = false,
  onUserSelect,
  onSelectAll,
  onUserAction,
  onPaginationChange,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
}) => {
  const { page = 1, limit = 20, total = 0, totalPages = 0 } = pagination;

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Inactive</span>;
    }
    if (user.isLocked) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Locked</span>;
    }
    if (!user.isEmailVerified) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Unverified</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</span>;
  };

  const getVerificationBadge = (user) => {
    switch (user.verificationStatus) {
      case 'verified':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Not Submitted</span>;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full capitalize ${colors[role] || colors.client}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Users ({total.toLocaleString()})
          </h3>
          <div className="text-sm text-subtle">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  Email
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-1">
                  Role
                  {getSortIcon('role')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Verification
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('lastLogin')}
              >
                <div className="flex items-center gap-1">
                  Last Login
                  {getSortIcon('lastLogin')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Created
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-ideas-darkInput divide-y divide-gray-200 dark:divide-gray-700">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ideas-accent"></div>
                    <span className="ml-3 text-subtle">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="text-subtle">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => onUserSelect(user._id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-ideas-accent/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-ideas-accent">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-subtle">
                          ID: {user.uuid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-black dark:text-white">{user.email}</div>
                    <div className="text-sm text-subtle">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4">
                    {getVerificationBadge(user)}
                  </td>
                  <td className="px-6 py-4 text-sm text-subtle">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 text-sm text-subtle">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUserAction('view', user)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onUserAction('edit', user)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      {(user.verificationStatus === 'pending') && (
                        <button
                          onClick={() => onUserAction('verification', user)}
                          className="p-1 text-yellow-400 hover:text-yellow-600"
                          title="Review Verification"
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}
                      {user.isLocked && (
                        <button
                          onClick={() => onUserAction('unlock', user)}
                          className="p-1 text-orange-400 hover:text-orange-600"
                          title="Unlock Account"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-subtle">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPaginationChange({ page: page - 1 })}
              disabled={page <= 1}
              className="btn-secondary-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPaginationChange({ page: pageNum })}
                    className={`px-3 py-1 text-sm rounded ${
                      pageNum === page
                        ? 'bg-ideas-accent text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPaginationChange({ page: page + 1 })}
              disabled={page >= totalPages}
              className="btn-secondary-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

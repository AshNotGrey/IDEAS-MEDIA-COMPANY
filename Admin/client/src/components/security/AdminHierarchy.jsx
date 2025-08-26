import React, { useState } from "react";
import { 
  Users, 
  Shield, 
  Lock, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserPlus,
  UserMinus,
  Key,
  Crown,
  UserCheck,
  UserX,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react";
import { 
  useAdminHierarchy, 
  useAdminRoles, 
  useAdminPermissions, 
  useAdminActivity,
  useCreateAdmin,
  useUpdateAdminRole,
  useToggleAdminStatus
} from '../../graphql/hooks/useAdminHierarchy.js';

const AdminHierarchy = () => {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  
  // GraphQL hooks
  const { adminHierarchy, loading: hierarchyLoading, error: hierarchyError, refetch: refetchHierarchy } = useAdminHierarchy();
  const { roles, loading: rolesLoading, error: rolesError } = useAdminRoles();
  const { permissions, loading: permissionsLoading, error: permissionsError } = useAdminPermissions();
  const { activity, loading: activityLoading, error: activityError, refetch: refetchActivity } = useAdminActivity();
  
  // Mutations
  const { createAdmin, loading: createLoading, error: createError } = useCreateAdmin();
  const { updateAdminRole, loading: updateLoading, error: updateError } = useUpdateAdminRole();
  const { toggleAdminStatus, loading: toggleLoading, error: toggleError } = useToggleAdminStatus();
  
  const loading = hierarchyLoading || rolesLoading || permissionsLoading || activityLoading;

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([
      refetchHierarchy(),
      refetchActivity()
    ]);
  };

  // Handle admin status toggle
  const handleToggleAdminStatus = async (adminId) => {
    try {
      await toggleAdminStatus(adminId);
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  };

  // Mock data removed - now using GraphQL data from hooks

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'manager':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'security_admin':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'admin':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPermissionRiskColor = (risk) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSubordinateCount = (adminId) => {
    return adminHierarchy.filter(admin => admin.createdBy === adminId).length;
  };

  const getSuperiorName = (createdBy) => {
    if (!createdBy) return 'System';
    const superior = adminHierarchy.find(admin => admin.id === createdBy);
    return superior ? superior.username : 'Unknown';
  };

  const tabs = [
    { id: 'hierarchy', name: 'Admin Hierarchy', icon: <Users className="w-4 h-4" /> },
    { id: 'roles', name: 'Role Management', icon: <Shield className="w-4 h-4" /> },
    { id: 'permissions', name: 'Permissions', icon: <Key className="w-4 h-4" /> },
    { id: 'activity', name: 'Admin Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'analytics', name: 'Access Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const renderHierarchyTab = () => (
    <div className="space-y-6">
      {/* Hierarchy Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Hierarchy Overview</h3>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{adminHierarchy.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Admins</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {adminHierarchy.filter(a => a.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Admins</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {adminHierarchy.filter(a => a.role === 'super_admin').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Super Admins</div>
          </div>
        </div>

        {/* Hierarchy Tree */}
        <div className="space-y-4">
          {adminHierarchy.filter(admin => !admin.createdBy).map(superAdmin => (
            <div key={superAdmin.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{superAdmin.username}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(superAdmin.role)}`}>
                        {superAdmin.role.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(superAdmin.status)}`}>
                        {superAdmin.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                  <p>Subordinates: {getSubordinateCount(superAdmin.id)}</p>
                  <p>Active Sessions: {superAdmin.sessions}</p>
                </div>
              </div>
              
              {/* Subordinates */}
              {adminHierarchy.filter(admin => admin.createdBy === superAdmin.id).map(subordinate => (
                <div key={subordinate.id} className="ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{subordinate.username}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(subordinate.role)}`}>
                            {subordinate.role.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subordinate.status)}`}>
                            {subordinate.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                      <p>Subordinates: {getSubordinateCount(subordinate.id)}</p>
                      <p>Active Sessions: {subordinate.sessions}</p>
                    </div>
                  </div>
                  
                  {/* Sub-subordinates */}
                  {adminHierarchy.filter(admin => admin.createdBy === subordinate.id).map(subSubordinate => (
                    <div key={subSubordinate.id} className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <UserCheck className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 dark:text-white">{subSubordinate.username}</h6>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(subSubordinate.role)}`}>
                                {subSubordinate.role.replace(/_/g, ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subSubordinate.status)}`}>
                                {subSubordinate.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                          <p>Active Sessions: {subSubordinate.sessions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      {/* Role Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Role Management</h3>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{role.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role.id)}`}>
                  {role.id.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Subordinates:</span>
                  <span className="font-medium">{role.maxSubordinates}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Can Create Roles:</span>
                  <span className="font-medium">{role.canCreateRoles ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Can Delete Admins:</span>
                  <span className="font-medium">{role.canDeleteAdmins ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-xs py-2">
                    Edit
                  </button>
                  <button className="flex-1 btn-secondary text-xs py-2">
                    Permissions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      {/* Permissions Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Permissions</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {permissions.map((permission) => (
            <div key={permission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{permission.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPermissionRiskColor(permission.risk)}`}>
                  {permission.risk}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Category:</span> {permission.category}</p>
                <p><span className="font-medium">Risk Level:</span> {permission.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Admin Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Activity Log</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {adminActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{activity.action}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.success 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {activity.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Admin:</span> {activity.username}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Target:</span> {activity.target}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">IP:</span> {activity.ip}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Time:</span> {formatTimeAgo(activity.timestamp)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Details:</span> {activity.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Access Analytics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Access Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {adminHierarchy.filter(a => a.role === 'super_admin').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Super Admins</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {adminHierarchy.filter(a => a.role === 'manager').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Managers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {adminHierarchy.filter(a => a.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Standard Admins</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Role Distribution</h4>
            <div className="space-y-2">
              {roles.map((role) => {
                const count = adminHierarchy.filter(a => a.role === role.id).length;
                const percentage = ((count / adminHierarchy.length) * 100).toFixed(1);
                return (
                  <div key={role.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{role.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status Overview</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                <span className="text-sm font-medium">
                  {adminHierarchy.filter(a => a.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                <span className="text-sm font-medium">
                  {adminHierarchy.filter(a => a.status === 'inactive').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hierarchy':
        return renderHierarchyTab();
      case 'roles':
        return renderRolesTab();
      case 'permissions':
        return renderPermissionsTab();
      case 'activity':
        return renderActivityTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderHierarchyTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Hierarchy Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage role-based access control, permissions, and admin hierarchy
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-ideas-accent text-ideas-accent'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminHierarchy;

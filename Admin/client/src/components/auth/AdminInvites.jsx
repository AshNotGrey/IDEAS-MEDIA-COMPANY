import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import authService from "../../services/authService.js";
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Shield,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Validation schema for create invite form
const createInviteSchema = yup
  .object({
    role: yup
      .string()
      .required("Role is required")
      .oneOf(["admin", "manager", "super_admin"], "Invalid role selected"),
    permissions: yup
      .array()
      .of(yup.string().oneOf(["read", "write", "admin", "billing", "analytics"]))
      .min(1, "At least one permission is required"),
    ttlMinutes: yup
      .number()
      .required("TTL is required")
      .min(5, "Minimum TTL is 5 minutes")
      .max(10080, "Maximum TTL is 1 week (10080 minutes)"),
    maxUses: yup
      .number()
      .required("Maximum uses is required")
      .min(1, "Minimum uses is 1")
      .max(100, "Maximum uses is 100"),
  })
  .required();

const AdminInvites = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [creating, setCreating] = useState(false);

  const { token } = useAdminAuth();

  // React Hook Form setup for create invite
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(createInviteSchema),
    mode: "onChange",
    defaultValues: {
      role: "admin",
      permissions: ["read"],
      ttlMinutes: 60,
      maxUses: 1,
    },
  });

  // Mock data for now - will be replaced with REST API calls
  const [invites, setInvites] = useState([
    {
      _id: "1",
      code: "INVITE123456789",
      role: "admin",
      permissions: ["read", "write"],
      createdBy: "admin1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiresAt: new Date(Date.now() + 58 * 60 * 1000), // 58 minutes from now
      maxUses: 1,
      usedCount: 0,
      used: false,
      usedBy: null,
      usedAt: null,
      status: "active",
    },
    {
      _id: "2",
      code: "INVITE987654321",
      role: "manager",
      permissions: ["read", "write", "admin"],
      createdBy: "admin1",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      maxUses: 3,
      usedCount: 1,
      used: false,
      usedBy: null,
      usedAt: null,
      status: "expired",
    },
    {
      _id: "3",
      code: "INVITE456789123",
      role: "admin",
      permissions: ["read"],
      createdBy: "admin1",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      expiresAt: new Date(Date.now() + 57 * 60 * 1000), // 57 minutes from now
      maxUses: 1,
      usedCount: 1,
      used: true,
      usedBy: "newadmin1",
      usedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: "used",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "admin", label: "Admin", description: "Standard administrative access" },
    {
      value: "manager",
      label: "Manager",
      description: "Enhanced permissions with user management",
    },
    { value: "super_admin", label: "Super Admin", description: "Full system access and control" },
  ];

  const permissionOptions = [
    { value: "read", label: "Read Access", description: "View data and reports" },
    { value: "write", label: "Write Access", description: "Create and edit content" },
    { value: "admin", label: "Admin Access", description: "Manage users and settings" },
    { value: "billing", label: "Billing Access", description: "Manage payments and invoices" },
    { value: "analytics", label: "Analytics Access", description: "View detailed analytics" },
  ];

  const getInviteStatus = (invite) => {
    if (invite.used) {
      return {
        text: "Used",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <CheckCircle className='w-4 h-4' />,
      };
    }

    if (invite.expiresAt < new Date()) {
      return {
        text: "Expired",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <XCircle className='w-4 h-4' />,
      };
    }

    if (invite.usedCount >= invite.maxUses) {
      return {
        text: "Max Uses Reached",
        color: "text-orange-600",
        bg: "bg-orange-50",
        icon: <AlertTriangle className='w-4 h-4' />,
      };
    }

    return {
      text: "Active",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <Clock className='w-4 h-4' />,
    };
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatTimeRemaining = (date) => {
    const now = new Date();
    const diff = date - now;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 0) return "Expired";
    if (minutes < 60) return `${minutes}m remaining`;
    if (hours < 24) return `${hours}h remaining`;
    return `${Math.floor(hours / 24)}d remaining`;
  };

  const handleCreateInvite = async (data) => {
    setCreating(true);
    try {
      // TODO: Implement REST API call
      // const response = await authService.createInvite(data, token);

      // Mock creation for now
      const newInvite = {
        _id: Date.now().toString(),
        code: "INVITE" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        role: data.role,
        permissions: data.permissions,
        createdBy: "currentAdmin",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + data.ttlMinutes * 60 * 1000),
        maxUses: data.maxUses,
        usedCount: 0,
        used: false,
        usedBy: null,
        usedAt: null,
        status: "active",
      };

      setInvites((prev) => [newInvite, ...prev]);
      setShowCreateModal(false);
      reset(); // Reset form to default values

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to create invite:", error);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
  };

  const deleteInvite = async (inviteId) => {
    if (
      !window.confirm("Are you sure you want to delete this invite? This action cannot be undone.")
    ) {
      return;
    }

    try {
      // TODO: Implement GraphQL mutation
      // await deleteInvite({ variables: { inviteId } });

      // Remove from local state for now
      setInvites((prev) => prev.filter((invite) => invite._id !== inviteId));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to delete invite:", error);
    }
  };

  const refreshInvites = async () => {
    setLoading(true);
    // TODO: Implement GraphQL query refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  // Handle permission changes
  const handlePermissionChange = (permission, checked) => {
    const currentPermissions = watch("permissions") || [];
    if (checked) {
      setValue("permissions", [...currentPermissions, permission]);
    } else {
      setValue(
        "permissions",
        currentPermissions.filter((p) => p !== permission)
      );
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Admin Invitations</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Create and manage invitation codes for new administrators
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={refreshInvites}
            className='btn-secondary flex items-center space-x-2'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary flex items-center space-x-2'>
            <Plus className='w-4 h-4' />
            <span>Create Invite</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <UserPlus className='w-6 h-6 text-blue-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Invites</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{invites.length}</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Active</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {invites.filter((invite) => getInviteStatus(invite).text === "Active").length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg'>
              <Clock className='w-6 h-6 text-yellow-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Expired</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {invites.filter((invite) => getInviteStatus(invite).text === "Expired").length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
              <Users className='w-6 h-6 text-purple-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Used</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {invites.filter((invite) => invite.used).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invites List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Invitation Codes</h3>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {invites.map((invite) => {
            const status = getInviteStatus(invite);

            return (
              <div
                key={invite._id}
                className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className='flex items-center space-x-2'>
                        <Shield className='w-5 h-5 text-gray-400' />
                        <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                          {invite.code}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                        {status.icon}
                        <span className='ml-1'>{status.text}</span>
                      </span>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200'>
                        {invite.role}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                      <div>
                        <span className='font-medium'>Permissions:</span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {invite.permissions.map((permission) => (
                            <span
                              key={permission}
                              className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs'>
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className='font-medium'>Usage:</span>
                        <p className='mt-1'>
                          {invite.usedCount}/{invite.maxUses}
                        </p>
                      </div>
                      <div>
                        <span className='font-medium'>Expires:</span>
                        <p className='mt-1'>{formatTimeRemaining(invite.expiresAt)}</p>
                      </div>
                    </div>

                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Created {formatTimeAgo(invite.createdAt)} • Expires{" "}
                      {formatDate(invite.expiresAt)}
                      {invite.used && (
                        <span>
                          {" "}
                          • Used by {invite.usedBy} {formatTimeAgo(invite.usedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center space-x-2 ml-4'>
                    <button
                      onClick={() => copyToClipboard(invite.code)}
                      className='btn-secondary text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300'
                      title='Copy invite code'>
                      <Copy className='w-4 h-4' />
                    </button>

                    <button
                      onClick={() => setSelectedInvite(invite)}
                      className='btn-secondary'
                      title='View details'>
                      <Eye className='w-4 h-4' />
                    </button>

                    {!invite.used && (
                      <button
                        onClick={() => deleteInvite(invite._id)}
                        className='btn-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
                        title='Delete invite'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {invites.length === 0 && (
        <div className='text-center py-12'>
          <UserPlus className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No Invitations Created
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            Create your first invitation code to invite new administrators to your system.
          </p>
          <button onClick={() => setShowCreateModal(true)} className='btn-primary'>
            Create First Invite
          </button>
        </div>
      )}

      {/* Create Invite Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Create Admin Invitation
            </h3>

            <form onSubmit={handleSubmit(handleCreateInvite)} className='space-y-4'>
              {/* Role Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Admin Role
                </label>
                <select
                  {...register("role")}
                  className={`input w-full ${errors.role ? "input-error" : ""}`}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Permissions */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Permissions
                </label>
                <div className='space-y-2'>
                  {permissionOptions.map((permission) => (
                    <label key={permission.value} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={watch("permissions")?.includes(permission.value) || false}
                        onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                        className='checkbox'
                      />
                      <span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
                        {permission.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.permissions && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.permissions.message}
                  </p>
                )}
              </div>

              {/* TTL */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Expires In (minutes)
                </label>
                <input
                  {...register("ttlMinutes", { valueAsNumber: true })}
                  type='number'
                  min='5'
                  max='10080' // 1 week
                  className={`input w-full ${errors.ttlMinutes ? "input-error" : ""}`}
                />
                {errors.ttlMinutes && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.ttlMinutes.message}
                  </p>
                )}
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Minimum 5 minutes, maximum 1 week (10080 minutes)
                </p>
              </div>

              {/* Max Uses */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Maximum Uses
                </label>
                <input
                  {...register("maxUses", { valueAsNumber: true })}
                  type='number'
                  min='1'
                  max='100'
                  className={`input w-full ${errors.maxUses ? "input-error" : ""}`}
                />
                {errors.maxUses && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.maxUses.message}
                  </p>
                )}
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                  }}
                  className='btn-secondary'
                  disabled={creating}>
                  Cancel
                </button>
                <button type='submit' className='btn-primary' disabled={creating || !isValid}>
                  {creating ? (
                    <>
                      <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                      Creating...
                    </>
                  ) : (
                    "Create Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Details Modal */}
      {selectedInvite && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Invitation Details
              </h3>
              <button
                onClick={() => setSelectedInvite(null)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                <XCircle className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <span className='font-medium text-gray-700 dark:text-gray-300'>Code:</span>
                <div className='flex items-center space-x-2 mt-1'>
                  <code className='bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono text-sm'>
                    {selectedInvite.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedInvite.code)}
                    className='btn-secondary text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300'>
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Role:</span>
                  <p className='mt-1'>{selectedInvite.role}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Status:</span>
                  <p className='mt-1'>{getInviteStatus(selectedInvite).text}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Created:</span>
                  <p className='mt-1'>{formatDate(selectedInvite.createdAt)}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Expires:</span>
                  <p className='mt-1'>{formatDate(selectedInvite.expiresAt)}</p>
                </div>
              </div>

              <div>
                <span className='font-medium text-gray-700 dark:text-gray-300'>Permissions:</span>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {selectedInvite.permissions.map((permission) => (
                    <span
                      key={permission}
                      className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm'>
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              {selectedInvite.used && (
                <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-md'>
                  <p className='text-sm text-green-800 dark:text-green-200'>
                    <span className='font-medium'>Used by:</span> {selectedInvite.usedBy}
                  </p>
                  <p className='text-xs text-green-600 dark:text-green-300 mt-1'>
                    Used {formatTimeAgo(selectedInvite.usedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvites;

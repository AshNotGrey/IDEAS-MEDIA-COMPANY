import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import authService from "../../services/authService.js";
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  RefreshCw,
  Users,
  Shield,
  Calendar,
  UserPlus,
  UserX,
} from "lucide-react";

const AdminVerification = () => {
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const { token } = useAdminAuth();

  // Mock data for now - will be replaced with REST API calls
  const [pendingAdmins, setPendingAdmins] = useState([
    {
      _id: "1",
      username: "newadmin1",
      email: "newadmin1@example.com",
      role: "admin",
      permissions: ["read", "write"],
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      verifierUsername: "admin1",
      status: "pending",
      profile: {
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
      },
    },
    {
      _id: "2",
      username: "newadmin2",
      email: "newadmin2@example.com",
      role: "manager",
      permissions: ["read", "write", "admin"],
      requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      verifierUsername: "admin1",
      status: "pending",
      profile: {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+0987654321",
      },
    },
    {
      _id: "3",
      username: "newadmin3",
      email: "newadmin3@example.com",
      role: "admin",
      permissions: ["read"],
      requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      verifierUsername: "admin2",
      status: "pending",
      profile: {
        firstName: "Mike",
        lastName: "Johnson",
        phone: "+1122334455",
      },
    },
  ]);

  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className='w-4 h-4' />;
      case "approved":
        return <CheckCircle className='w-4 h-4' />;
      case "rejected":
        return <XCircle className='w-4 h-4' />;
      default:
        return <AlertTriangle className='w-4 h-4' />;
    }
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

  const handleVerifyAdmin = async (adminId) => {
    if (
      !window.confirm(
        "Are you sure you want to verify this admin? They will be able to sign in immediately."
      )
    ) {
      return;
    }

    setVerifying(adminId);
    try {
      const admin = pendingAdmins.find((a) => a._id === adminId);
      if (!admin) return;

      // TODO: Implement REST API call
      // await authService.verifyAdmin(admin.username, token);

      // Update local state for now
      setPendingAdmins((prev) =>
        prev.map((admin) => (admin._id === adminId ? { ...admin, status: "approved" } : admin))
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to verify admin:", error);
    } finally {
      setVerifying(null);
    }
  };

  const handleRejectAdmin = async (adminId) => {
    if (
      !window.confirm("Are you sure you want to reject this admin? This action cannot be undone.")
    ) {
      return;
    }

    setRejecting(adminId);
    try {
      // TODO: Implement GraphQL mutation
      // await rejectAdmin({ variables: { username: admin.username } });

      // Update local state for now
      setPendingAdmins((prev) =>
        prev.map((admin) => (admin._id === adminId ? { ...admin, status: "rejected" } : admin))
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to reject admin:", error);
    } finally {
      setRejecting(null);
    }
  };

  const refreshPendingAdmins = async () => {
    setLoading(true);
    // TODO: Implement GraphQL query refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const pendingCount = pendingAdmins.filter((admin) => admin.status === "pending").length;
  const approvedCount = pendingAdmins.filter((admin) => admin.status === "approved").length;
  const rejectedCount = pendingAdmins.filter((admin) => admin.status === "rejected").length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Admin Verification</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Review and verify pending administrator accounts
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={refreshPendingAdmins}
            className='btn-secondary flex items-center space-x-2'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Requests</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {pendingAdmins.length}
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
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Pending</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Approved</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 dark:bg-red-900/20 rounded-lg'>
              <UserX className='w-6 h-6 text-red-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Rejected</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Admins List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Verification Requests
          </h3>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {pendingAdmins.map((admin) => (
            <div
              key={admin._id}
              className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <div className='flex items-center space-x-2'>
                      <UserPlus className='w-5 h-5 text-gray-400' />
                      <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                        {admin.username}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(admin.status)}`}>
                      {getStatusIcon(admin.status)}
                      <span className='ml-1 capitalize'>{admin.status}</span>
                    </span>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200'>
                      {admin.role}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                    <div>
                      <span className='font-medium'>Contact:</span>
                      <p className='mt-1'>
                        {admin.profile?.firstName} {admin.profile?.lastName}
                        {admin.email && <span className='block text-xs'>{admin.email}</span>}
                        {admin.profile?.phone && (
                          <span className='block text-xs'>{admin.profile.phone}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Permissions:</span>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {admin.permissions.map((permission) => (
                          <span
                            key={permission}
                            className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs'>
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className='font-medium'>Requested:</span>
                      <p className='mt-1'>{formatTimeAgo(admin.requestedAt)}</p>
                      <p className='text-xs text-gray-500'>{formatDate(admin.requestedAt)}</p>
                    </div>
                  </div>

                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    Requested verification from: {admin.verifierUsername}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowDetailsModal(true);
                    }}
                    className='btn-secondary'
                    title='View details'>
                    <Eye className='w-4 h-4' />
                  </button>

                  {admin.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleVerifyAdmin(admin._id)}
                        disabled={verifying === admin._id}
                        className='btn-secondary text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                        title='Verify admin'>
                        {verifying === admin._id ? (
                          <>
                            <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Verify
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRejectAdmin(admin._id)}
                        disabled={rejecting === admin._id}
                        className='btn-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
                        title='Reject admin'>
                        {rejecting === admin._id ? (
                          <>
                            <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className='w-4 h-4 mr-2' />
                            Reject
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {pendingAdmins.length === 0 && (
        <div className='text-center py-12'>
          <UserCheck className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No Verification Requests
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            There are no pending admin verification requests at the moment.
          </p>
        </div>
      )}

      {/* Admin Details Modal */}
      {showDetailsModal && selectedAdmin && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Admin Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAdmin(null);
                }}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                <XCircle className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Username:</span>
                  <p className='mt-1'>{selectedAdmin.username}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Role:</span>
                  <p className='mt-1 capitalize'>{selectedAdmin.role}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Status:</span>
                  <p className='mt-1 capitalize'>{selectedAdmin.status}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Requested:</span>
                  <p className='mt-1'>{formatDate(selectedAdmin.requestedAt)}</p>
                </div>
              </div>

              <div>
                <span className='font-medium text-gray-700 dark:text-gray-300'>Full Name:</span>
                <p className='mt-1'>
                  {selectedAdmin.profile?.firstName} {selectedAdmin.profile?.lastName}
                </p>
              </div>

              {selectedAdmin.email && (
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Email:</span>
                  <p className='mt-1'>{selectedAdmin.email}</p>
                </div>
              )}

              {selectedAdmin.profile?.phone && (
                <div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>Phone:</span>
                  <p className='mt-1'>{selectedAdmin.profile.phone}</p>
                </div>
              )}

              <div>
                <span className='font-medium text-gray-700 dark:text-gray-300'>Permissions:</span>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {selectedAdmin.permissions.map((permission) => (
                    <span
                      key={permission}
                      className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm'>
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className='font-medium text-gray-700 dark:text-gray-300'>Verifier:</span>
                <p className='mt-1'>{selectedAdmin.verifierUsername}</p>
              </div>

              {selectedAdmin.status === "pending" && (
                <div className='bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                    This admin account is pending verification. You can approve or reject their
                    request.
                  </p>
                </div>
              )}

              {selectedAdmin.status === "approved" && (
                <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-md'>
                  <p className='text-sm text-green-800 dark:text-green-200'>
                    This admin account has been verified and approved.
                  </p>
                </div>
              )}

              {selectedAdmin.status === "rejected" && (
                <div className='bg-red-50 dark:bg-red-900/20 p-3 rounded-md'>
                  <p className='text-sm text-red-800 dark:text-red-200'>
                    This admin account request has been rejected.
                  </p>
                </div>
              )}
            </div>

            {selectedAdmin.status === "pending" && (
              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={() => handleRejectAdmin(selectedAdmin._id)}
                  disabled={rejecting === selectedAdmin._id}
                  className='btn-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'>
                  {rejecting === selectedAdmin._id ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => handleVerifyAdmin(selectedAdmin._id)}
                  disabled={verifying === selectedAdmin._id}
                  className='btn-primary'>
                  {verifying === selectedAdmin._id ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;

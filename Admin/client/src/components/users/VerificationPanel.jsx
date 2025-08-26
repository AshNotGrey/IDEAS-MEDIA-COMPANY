import React, { useState } from 'react';
import { useUserMutations, useVerificationQueue } from '../../graphql/hooks/useUsers.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  User,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

const VerificationPanel = ({ user, onBack }) => {
  const { 
    approveVerification, 
    rejectVerification, 
    loading 
  } = useUserMutations();
  
  const { queue, refetch: refetchQueue } = useVerificationQueue();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(user);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionType, setRejectionType] = useState('');

  const handleApprove = async (userId, type) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await approveVerification(userId, type);
      setMessage({ 
        type: 'success', 
        text: `${type === 'nin' ? 'NIN' : 'Driver\'s License'} verification approved successfully` 
      });
      refetchQueue();
      
      // Update selected user if it's the same user
      if (selectedUser?._id === userId) {
        const updatedQueue = queue.map(u => u._id === userId ? {
          ...u,
          verification: {
            ...u.verification,
            [type]: {
              ...u.verification[type],
              status: 'verified',
              verifiedAt: new Date().toISOString()
            }
          }
        } : u);
        const updatedUser = updatedQueue.find(u => u._id === userId);
        if (updatedUser) setSelectedUser(updatedUser);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a rejection reason' });
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await rejectVerification(selectedUser._id, rejectionType, rejectionReason);
      setMessage({ 
        type: 'success', 
        text: `${rejectionType === 'nin' ? 'NIN' : 'Driver\'s License'} verification rejected` 
      });
      refetchQueue();
      
      // Update selected user
      const updatedQueue = queue.map(u => u._id === selectedUser._id ? {
        ...u,
        verification: {
          ...u.verification,
          [rejectionType]: {
            ...u.verification[rejectionType],
            status: 'rejected',
            rejectionReason: rejectionReason
          }
        }
      } : u);
      const updatedUser = updatedQueue.find(u => u._id === selectedUser._id);
      if (updatedUser) setSelectedUser(updatedUser);
      
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionType('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (type) => {
    setRejectionType(type);
    setShowRejectModal(true);
    setRejectionReason('');
    setMessage({ type: '', text: '' });
  };

  const getVerificationStatus = (verification) => {
    switch (verification.status) {
      case 'verified':
        return { 
          badge: <span className="status-badge status-success">Verified</span>,
          color: 'text-green-600 dark:text-green-400'
        };
      case 'pending':
        return { 
          badge: <span className="status-badge status-warning">Pending Review</span>,
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'rejected':
        return { 
          badge: <span className="status-badge status-error">Rejected</span>,
          color: 'text-red-600 dark:text-red-400'
        };
      default:
        return { 
          badge: <span className="status-badge status-secondary">Not Submitted</span>,
          color: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingUsers = queue.filter(u => 
    u.verification.nin.status === 'pending' || 
    u.verification.driversLicense.status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-heading font-bold text-black dark:text-white">
                  ID Verification Panel
                </h1>
                <p className="text-subtle">
                  Review and approve or reject user ID verification submissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-subtle">
                {pendingUsers.length} pending reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className="px-6 pt-6">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            ) : (
              <XCircle size={20} className="text-red-600 dark:text-red-400" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Verification Queue ({pendingUsers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-subtle">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No pending verifications</p>
                  </div>
                ) : (
                  pendingUsers.map((queueUser) => (
                    <button
                      key={queueUser._id}
                      onClick={() => setSelectedUser(queueUser)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedUser?._id === queueUser._id
                          ? 'border-ideas-accent bg-ideas-accent/10'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ideas-accent/20 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-ideas-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-black dark:text-white truncate">
                            {queueUser.name}
                          </p>
                          <p className="text-sm text-subtle truncate">
                            {queueUser.email}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {queueUser.verification.nin.status === 'pending' && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-1 rounded">
                                NIN
                              </span>
                            )}
                            {queueUser.verification.driversLicense.status === 'pending' && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-1 rounded">
                                License
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="card">
                  <div className="flex items-center gap-4 mb-6">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-ideas-accent/20 flex items-center justify-center">
                        <User size={24} className="text-ideas-accent" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-black dark:text-white">
                        {selectedUser.name}
                      </h2>
                      <p className="text-subtle">{selectedUser.email}</p>
                      <p className="text-sm text-subtle">{selectedUser.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400">Member Since</label>
                      <p className="text-black dark:text-white">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400">Last Login</label>
                      <p className="text-black dark:text-white">{formatDate(selectedUser.lastLogin)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400">Account Status</label>
                      <span className={`${selectedUser.isActive ? 'status-badge status-success' : 'status-badge status-error'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NIN Verification */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                      <FileText size={20} />
                      NIN Verification
                    </h3>
                    {getVerificationStatus(selectedUser.verification.nin).badge}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            NIN Number
                          </label>
                          <p className="text-black dark:text-white">
                            {selectedUser.verification.nin.number || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Submitted At
                          </label>
                          <p className="text-black dark:text-white">
                            {formatDate(selectedUser.verification.nin.submittedAt)}
                          </p>
                        </div>
                        {selectedUser.verification.nin.verifiedAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                              Verified At
                            </label>
                            <p className="text-black dark:text-white">
                              {formatDate(selectedUser.verification.nin.verifiedAt)}
                            </p>
                          </div>
                        )}
                        {selectedUser.verification.nin.rejectionReason && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                              Rejection Reason
                            </label>
                            <p className="text-red-600 dark:text-red-400">
                              {selectedUser.verification.nin.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {selectedUser.verification.nin.document && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Supporting Document
                          </label>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <FileText size={24} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-black dark:text-white">NIN Document</p>
                                <div className="flex gap-2 mt-2">
                                  <button className="btn-secondary-sm flex items-center gap-1">
                                    <Eye size={14} />
                                    View
                                  </button>
                                  <button className="btn-secondary-sm flex items-center gap-1">
                                    <Download size={14} />
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.verification.nin.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(selectedUser._id, 'nin')}
                            disabled={actionLoading || loading}
                            className="btn-success flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Approve NIN
                          </button>
                          <button
                            onClick={() => openRejectModal('nin')}
                            disabled={actionLoading || loading}
                            className="btn-danger flex items-center gap-2 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject NIN
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver's License Verification */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                      <FileText size={20} />
                      Driver's License Verification
                    </h3>
                    {getVerificationStatus(selectedUser.verification.driversLicense).badge}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            License Number
                          </label>
                          <p className="text-black dark:text-white">
                            {selectedUser.verification.driversLicense.number || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Submitted At
                          </label>
                          <p className="text-black dark:text-white">
                            {formatDate(selectedUser.verification.driversLicense.submittedAt)}
                          </p>
                        </div>
                        {selectedUser.verification.driversLicense.expiryDate && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                              Expiry Date
                            </label>
                            <p className="text-black dark:text-white">
                              {formatDate(selectedUser.verification.driversLicense.expiryDate)}
                            </p>
                          </div>
                        )}
                        {selectedUser.verification.driversLicense.verifiedAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                              Verified At
                            </label>
                            <p className="text-black dark:text-white">
                              {formatDate(selectedUser.verification.driversLicense.verifiedAt)}
                            </p>
                          </div>
                        )}
                        {selectedUser.verification.driversLicense.rejectionReason && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                              Rejection Reason
                            </label>
                            <p className="text-red-600 dark:text-red-400">
                              {selectedUser.verification.driversLicense.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {selectedUser.verification.driversLicense.document && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Supporting Document
                          </label>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <FileText size={24} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-black dark:text-white">Driver's License</p>
                                <div className="flex gap-2 mt-2">
                                  <button className="btn-secondary-sm flex items-center gap-1">
                                    <Eye size={14} />
                                    View
                                  </button>
                                  <button className="btn-secondary-sm flex items-center gap-1">
                                    <Download size={14} />
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.verification.driversLicense.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(selectedUser._id, 'driversLicense')}
                            disabled={actionLoading || loading}
                            className="btn-success flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Approve License
                          </button>
                          <button
                            onClick={() => openRejectModal('driversLicense')}
                            disabled={actionLoading || loading}
                            className="btn-danger flex items-center gap-2 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject License
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  Select a User to Review
                </h3>
                <p className="text-subtle">
                  Choose a user from the verification queue to review their ID verification submissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-ideas-darkInput rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Reject {rejectionType === 'nin' ? 'NIN' : 'Driver\'s License'} Verification
            </h3>
            <p className="text-subtle mb-4">
              Please provide a reason for rejecting this verification. This will be shown to the user.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="input w-full h-24 mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRejectionType('');
                }}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="btn-danger disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPanel;

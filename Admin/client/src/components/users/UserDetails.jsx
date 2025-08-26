import React, { useState } from 'react';
import { useUserMutations } from '../../graphql/hooks/useUsers.js';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Unlock,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Settings,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const UserDetails = ({ user, onBack, onEdit }) => {
  const { 
    activateUser, 
    deactivateUser, 
    unlockAccount, 
    approveVerification, 
    rejectVerification, 
    loading 
  } = useUserMutations();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUserAction = async (action, params = {}) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let result;
      switch (action) {
        case 'activate':
          result = await activateUser(user._id);
          setMessage({ type: 'success', text: 'User activated successfully' });
          break;
        case 'deactivate':
          result = await deactivateUser(user._id);
          setMessage({ type: 'success', text: 'User deactivated successfully' });
          break;
        case 'unlock':
          result = await unlockAccount(user._id);
          setMessage({ type: 'success', text: 'Account unlocked successfully' });
          break;
        case 'approve_verification':
          result = await approveVerification(user._id, params.type);
          setMessage({ type: 'success', text: `${params.type} verification approved` });
          break;
        case 'reject_verification':
          const reason = prompt('Enter rejection reason:');
          if (reason) {
            result = await rejectVerification(user._id, params.type, reason);
            setMessage({ type: 'success', text: `${params.type} verification rejected` });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!user.isActive) {
      return <span className="status-badge status-inactive">Inactive</span>;
    }
    if (user.isLocked) {
      return <span className="status-badge status-warning">Locked</span>;
    }
    if (!user.isEmailVerified) {
      return <span className="status-badge status-warning">Unverified Email</span>;
    }
    return <span className="status-badge status-active">Active</span>;
  };

  const getVerificationStatus = (verification) => {
    switch (verification.status) {
      case 'verified':
        return <span className="status-badge status-success">Verified</span>;
      case 'pending':
        return <span className="status-badge status-warning">Pending</span>;
      case 'rejected':
        return <span className="status-badge status-error">Rejected</span>;
      default:
        return <span className="status-badge status-secondary">Not Submitted</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-subtle">User not found</p>
        <button onClick={onBack} className="btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-ideas-accent/20 flex items-center justify-center">
                    <User size={24} className="text-ideas-accent" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-heading font-bold text-black dark:text-white">
                    {user.name}
                  </h1>
                  <p className="text-subtle">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge()}
                    <span className="status-badge status-primary capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit size={16} />
                Edit User
              </button>
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

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {!user.isActive && (
              <button
                onClick={() => handleUserAction('activate')}
                disabled={actionLoading || loading}
                className="btn-success flex items-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                Activate User
              </button>
            )}
            {user.isActive && (
              <button
                onClick={() => handleUserAction('deactivate')}
                disabled={actionLoading || loading}
                className="btn-warning flex items-center gap-2 disabled:opacity-50"
              >
                <ShieldX size={16} />
                Deactivate User
              </button>
            )}
            {user.isLocked && (
              <button
                onClick={() => handleUserAction('unlock')}
                disabled={actionLoading || loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Unlock size={16} />
                Unlock Account
              </button>
            )}
            <button className="btn-secondary flex items-center gap-2">
              <Mail size={16} />
              Send Email
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Phone size={20} />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-black dark:text-white">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.isEmailVerified ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <AlertCircle size={14} />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-black dark:text-white">{user.phone}</p>
                    {user.alternatePhone && (
                      <p className="text-sm text-subtle">Alt: {user.alternatePhone}</p>
                    )}
                  </div>
                </div>
                
                {user.address && (Object.values(user.address).some(v => v)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <MapPin size={14} />
                      Address
                    </label>
                    <div className="text-black dark:text-white">
                      {user.address.street && <p>{user.address.street}</p>}
                      <p>
                        {[user.address.city, user.address.state, user.address.country]
                          .filter(Boolean).join(', ')}
                        {user.address.postalCode && ` ${user.address.postalCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Account Activity
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-black dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                    <p className="text-black dark:text-white">{formatDate(user.lastLogin)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-black dark:text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="card">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Bio</h3>
                <p className="text-black dark:text-white whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {/* Social Media */}
            {user.socialMedia && Object.values(user.socialMedia).some(v => v) && (
              <div className="card">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={20} />
                  Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(user.socialMedia).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {platform}
                        </label>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-ideas-accent hover:underline"
                        >
                          {url}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role & Permissions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Role & Permissions
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                  <span className="status-badge status-primary capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                {user.permissions && user.permissions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Permissions ({user.permissions.length})
                    </label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {user.permissions.map((permission) => (
                        <span 
                          key={permission} 
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded mr-2 mb-1"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ID Verification */}
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">ID Verification</h3>
              <div className="space-y-4">
                {/* NIN Verification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      NIN
                    </label>
                    {getVerificationStatus(user.verification.nin)}
                  </div>
                  {user.verification.nin.number && (
                    <p className="text-sm text-black dark:text-white mb-2">
                      Number: {user.verification.nin.number}
                    </p>
                  )}
                  {user.verification.nin.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUserAction('approve_verification', { type: 'nin' })}
                        disabled={actionLoading || loading}
                        className="btn-success-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserAction('reject_verification', { type: 'nin' })}
                        disabled={actionLoading || loading}
                        className="btn-danger-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {user.verification.nin.rejectionReason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Rejection reason: {user.verification.nin.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Driver's License Verification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Driver's License
                    </label>
                    {getVerificationStatus(user.verification.driversLicense)}
                  </div>
                  {user.verification.driversLicense.number && (
                    <p className="text-sm text-black dark:text-white mb-2">
                      Number: {user.verification.driversLicense.number}
                    </p>
                  )}
                  {user.verification.driversLicense.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUserAction('approve_verification', { type: 'driversLicense' })}
                        disabled={actionLoading || loading}
                        className="btn-success-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserAction('reject_verification', { type: 'driversLicense' })}
                        disabled={actionLoading || loading}
                        className="btn-danger-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {user.verification.driversLicense.rejectionReason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Rejection reason: {user.verification.driversLicense.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="card">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <span className="text-sm text-black dark:text-white capitalize">
                    {user.preferences?.theme || 'light'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email Notifications</span>
                  <span className={`text-sm ${user.preferences?.notifications?.email ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">SMS Notifications</span>
                  <span className={`text-sm ${user.preferences?.notifications?.sms ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Push Notifications</span>
                  <span className={`text-sm ${user.preferences?.notifications?.push ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Newsletter</span>
                  <span className={`text-sm ${user.preferences?.newsletter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user.preferences?.newsletter ? 'Subscribed' : 'Unsubscribed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

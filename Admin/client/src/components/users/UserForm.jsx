import React, { useState, useEffect } from 'react';
import { useUserMutations } from '../../graphql/hooks/useUsers.js';
import { ArrowLeft, Save, X, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const UserForm = ({ user = null, onSave, onCancel }) => {
  const { createAdmin, updateUser, loading } = useUserMutations();
  const isEditing = Boolean(user);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    permissions: [],
    phone: '',
    alternatePhone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
    },
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      newsletter: false,
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Available permissions
  const availablePermissions = [
    { id: 'users.view', label: 'View Users', category: 'User Management' },
    { id: 'users.edit', label: 'Edit Users', category: 'User Management' },
    { id: 'users.delete', label: 'Delete Users', category: 'User Management' },
    { id: 'users.verify', label: 'Verify Users', category: 'User Management' },
    { id: 'products.view', label: 'View Products', category: 'Product Management' },
    { id: 'products.edit', label: 'Edit Products', category: 'Product Management' },
    { id: 'products.delete', label: 'Delete Products', category: 'Product Management' },
    { id: 'bookings.view', label: 'View Bookings', category: 'Booking Management' },
    { id: 'bookings.edit', label: 'Edit Bookings', category: 'Booking Management' },
    { id: 'bookings.delete', label: 'Delete Bookings', category: 'Booking Management' },
    { id: 'galleries.view', label: 'View Galleries', category: 'Gallery Management' },
    { id: 'galleries.edit', label: 'Edit Galleries', category: 'Gallery Management' },
    { id: 'galleries.delete', label: 'Delete Galleries', category: 'Gallery Management' },
    { id: 'campaigns.view', label: 'View Campaigns', category: 'Campaign Management' },
    { id: 'campaigns.edit', label: 'Edit Campaigns', category: 'Campaign Management' },
    { id: 'campaigns.delete', label: 'Delete Campaigns', category: 'Campaign Management' },
    { id: 'notifications.send', label: 'Send Notifications', category: 'Communication' },
    { id: 'emails.send', label: 'Send Emails', category: 'Communication' },
    { id: 'settings.edit', label: 'Edit Settings', category: 'System' },
    { id: 'logs.view', label: 'View Logs', category: 'System' },
    { id: 'admins.manage', label: 'Manage Admins', category: 'System' },
  ];

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Default permissions by role
  const defaultPermissions = {
    client: [],
    admin: [
      'users.view', 'users.edit', 'users.verify',
      'products.view', 'products.edit',
      'bookings.view', 'bookings.edit',
      'galleries.view', 'galleries.edit',
      'campaigns.view', 'campaigns.edit',
      'notifications.send', 'emails.send'
    ],
    manager: [
      'users.view', 'users.edit', 'users.delete', 'users.verify',
      'products.view', 'products.edit', 'products.delete',
      'bookings.view', 'bookings.edit', 'bookings.delete',
      'galleries.view', 'galleries.edit', 'galleries.delete',
      'campaigns.view', 'campaigns.edit', 'campaigns.delete',
      'notifications.send', 'emails.send',
      'settings.edit', 'logs.view'
    ],
    super_admin: availablePermissions.map(p => p.id),
  };

  // Initialize form data from user prop
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'client',
        permissions: user.permissions || [],
        phone: user.phone || '',
        alternatePhone: user.alternatePhone || '',
        bio: user.bio || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || 'Nigeria',
          postalCode: user.address?.postalCode || '',
        },
        preferences: {
          theme: user.preferences?.theme || 'light',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            push: user.preferences?.notifications?.push ?? true,
          },
          newsletter: user.preferences?.newsletter ?? false,
        },
        socialMedia: {
          instagram: user.socialMedia?.instagram || '',
          facebook: user.socialMedia?.facebook || '',
          twitter: user.socialMedia?.twitter || '',
          linkedin: user.socialMedia?.linkedin || '',
        },
      });
    }
  }, [user]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (path.includes('.')) {
        const keys = path.split('.');
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        newData[path] = value;
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: null }));
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: defaultPermissions[newRole] || [],
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = { ...formData };
      
      // Remove password fields if editing and no new password
      if (isEditing && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      } else {
        delete submitData.confirmPassword;
      }

      let result;
      if (isEditing) {
        result = await updateUser(user._id, submitData);
      } else {
        result = await createAdmin(submitData);
      }

      setSuccess(isEditing ? 'User updated successfully!' : 'Admin created successfully!');
      setTimeout(() => {
        onSave(result);
      }, 1500);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-ideas-darkInput border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-heading font-bold text-black dark:text-white">
                  {isEditing ? 'Edit User' : 'Create Admin'}
                </h1>
                <p className="text-subtle mt-1">
                  {isEditing 
                    ? 'Update user information and permissions'
                    : 'Create a new admin user with appropriate permissions'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-300">{success}</span>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-300">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`input w-full ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  className="input w-full"
                  placeholder="Enter alternate phone (optional)"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="input w-full"
                placeholder="Enter bio or description (optional)"
              />
            </div>
          </div>

          {/* Password */}
          <div className="card">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              {isEditing ? 'Change Password' : 'Password'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input w-full ${errors.password ? 'border-red-500' : ''}`}
                  placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password'}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`input w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Role & Permissions</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {['client', 'admin', 'manager', 'super_admin'].map((role) => (
                  <label key={role} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium capitalize text-black dark:text-white">
                      {role.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permissions */}
            {formData.role !== 'client' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-black dark:text-white mb-3">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.map((permission) => (
                          <label key={permission.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mr-2"
                            />
                            <span className="text-sm text-black dark:text-white">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Update User' : 'Create Admin'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

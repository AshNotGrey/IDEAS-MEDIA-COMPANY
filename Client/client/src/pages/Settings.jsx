import React, { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/auth/FormInput";
import Button from "../components/Button";
import usePushNotifications from "../hooks/usePushNotifications";

const Settings = () => {
  const { user, updateProfile, changePassword, sendEmailVerification } = useAuth();
  const { supported, permission, subscribed, loading, requestPermission } = usePushNotifications();

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading_states, setLoadingStates] = useState({
    personalInfo: false,
    password: false,
    emailVerification: false,
    deleteAccount: false,
  });

  const [messages, setMessages] = useState({
    personalInfo: null,
    password: null,
    emailVerification: null,
  });

  const handlePersonalInfoUpdate = async (e) => {
    e.preventDefault();
    setLoadingStates((prev) => ({ ...prev, personalInfo: true }));

    try {
      const result = await updateProfile(personalInfo);
      if (result.success) {
        setMessages((prev) => ({
          ...prev,
          personalInfo: { type: "success", text: "Profile updated successfully!" },
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          personalInfo: { type: "error", text: result.error || "Failed to update profile" },
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        personalInfo: { type: "error", text: "An error occurred while updating profile" },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, personalInfo: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessages((prev) => ({
        ...prev,
        password: { type: "error", text: "New passwords do not match" },
      }));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessages((prev) => ({
        ...prev,
        password: { type: "error", text: "Password must be at least 8 characters long" },
      }));
      return;
    }

    setLoadingStates((prev) => ({ ...prev, password: true }));

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setMessages((prev) => ({
          ...prev,
          password: { type: "success", text: "Password changed successfully!" },
        }));
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessages((prev) => ({
          ...prev,
          password: { type: "error", text: result.error || "Failed to change password" },
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        password: { type: "error", text: "An error occurred while changing password" },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, password: false }));
    }
  };

  const handleSendEmailVerification = async () => {
    setLoadingStates((prev) => ({ ...prev, emailVerification: true }));

    try {
      const result = await sendEmailVerification();
      if (result.success) {
        setMessages((prev) => ({
          ...prev,
          emailVerification: {
            type: "success",
            text: "Verification email sent! Check your inbox.",
          },
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          emailVerification: {
            type: "error",
            text: result.error || "Failed to send verification email",
          },
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        emailVerification: {
          type: "error",
          text: "An error occurred while sending verification email",
        },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, emailVerification: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, bookings, and orders."
      )
    ) {
      return;
    }

    const secondConfirm = window.prompt('Type "DELETE" to confirm account deletion:');

    if (secondConfirm !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, deleteAccount: true }));

    // This would be implemented when the backend endpoint is ready
    alert("Account deletion feature will be implemented soon. Please contact support for now.");
    setLoadingStates((prev) => ({ ...prev, deleteAccount: false }));
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-section'>
      <h1 className='section-title mb-8'>Settings</h1>

      {/* Push Notifications */}
      <div className='card space-y-4 mb-6'>
        <h2 className='text-xl font-semibold'>Push Notifications</h2>
        {!supported && <p className='text-subtle'>Push not supported on this device/browser.</p>}
        {supported && (
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-subtle'>
                Permission: <span className='font-medium'>{permission}</span>
              </p>
              <p className='text-subtle'>
                Subscribed: <span className='font-medium'>{subscribed ? "Yes" : "No"}</span>
              </p>
            </div>
            <button
              onClick={requestPermission}
              disabled={loading || permission === "granted"}
              className='btn-primary'>
              {permission === "granted" ? "Enabled" : loading ? "Enabling…" : "Enable"}
            </button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className='card space-y-4 mb-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <User className='w-5 h-5 text-ideas-accent' />
          </div>
          <h2 className='text-xl font-semibold'>Personal Information</h2>
        </div>

        {messages.personalInfo && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              messages.personalInfo.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}>
            {messages.personalInfo.type === "success" ? (
              <CheckCircle className='w-4 h-4' />
            ) : (
              <AlertCircle className='w-4 h-4' />
            )}
            <span className='text-sm'>{messages.personalInfo.text}</span>
          </div>
        )}

        <form onSubmit={handlePersonalInfoUpdate} className='space-y-4'>
          <FormInput
            label='Full Name'
            type='text'
            name='name'
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, name: e.target.value }))}
            placeholder='Enter your full name'
            required
          />

          <FormInput
            label='Phone Number'
            type='tel'
            name='phone'
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder='Enter your phone number'
          />

          <FormInput
            label='Email Address'
            type='email'
            name='email'
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
            placeholder='Enter your email address'
            disabled
          />
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            Email cannot be changed. Contact support if you need to update it.
          </p>

          <Button
            type='submit'
            variant='primary'
            size='md'
            leftIcon={<Save className='w-4 h-4' />}
            loading={loading_states.personalInfo}
            disabled={loading_states.personalInfo}>
            {loading_states.personalInfo ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Security */}
      <div className='card space-y-4 mb-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Shield className='w-5 h-5 text-ideas-accent' />
          </div>
          <h2 className='text-xl font-semibold'>Security</h2>
        </div>

        {/* Email Verification Status */}
        <div className='p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Mail className='w-5 h-5 text-gray-600 dark:text-gray-400' />
              <div>
                <h4 className='font-medium'>Email Verification</h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Status:{" "}
                  {user?.emailVerified ? (
                    <span className='text-green-600 dark:text-green-400 font-medium'>
                      Verified ✓
                    </span>
                  ) : (
                    <span className='text-yellow-600 dark:text-yellow-400 font-medium'>
                      Unverified
                    </span>
                  )}
                </p>
              </div>
            </div>
            {!user?.emailVerified && (
              <Button
                variant='secondary'
                size='sm'
                onClick={handleSendEmailVerification}
                loading={loading_states.emailVerification}
                disabled={loading_states.emailVerification}>
                {loading_states.emailVerification ? "Sending..." : "Send Verification"}
              </Button>
            )}
          </div>

          {messages.emailVerification && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                messages.emailVerification.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
              {messages.emailVerification.type === "success" ? (
                <CheckCircle className='w-4 h-4' />
              ) : (
                <AlertCircle className='w-4 h-4' />
              )}
              <span className='text-sm'>{messages.emailVerification.text}</span>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className='p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <h4 className='font-medium mb-4'>Change Password</h4>

          {messages.password && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                messages.password.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
              {messages.password.type === "success" ? (
                <CheckCircle className='w-4 h-4' />
              ) : (
                <AlertCircle className='w-4 h-4' />
              )}
              <span className='text-sm'>{messages.password.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className='space-y-4'>
            <div className='relative'>
              <FormInput
                label='Current Password'
                type={showPasswords.current ? "text" : "password"}
                name='currentPassword'
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder='Enter current password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                {showPasswords.current ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>

            <div className='relative'>
              <FormInput
                label='New Password'
                type={showPasswords.new ? "text" : "password"}
                name='newPassword'
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder='Enter new password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                {showPasswords.new ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>

            <div className='relative'>
              <FormInput
                label='Confirm New Password'
                type={showPasswords.confirm ? "text" : "password"}
                name='confirmPassword'
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder='Confirm new password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                {showPasswords.confirm ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>

            <Button
              type='submit'
              variant='primary'
              size='md'
              leftIcon={<Shield className='w-4 h-4' />}
              loading={loading_states.password}
              disabled={loading_states.password}>
              {loading_states.password ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='card space-y-4 border-red-200 dark:border-red-800'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-red-50 dark:bg-red-900/20 rounded-lg'>
            <Trash2 className='w-5 h-5 text-red-600 dark:text-red-400' />
          </div>
          <h2 className='text-xl font-semibold text-red-600 dark:text-red-400'>Danger Zone</h2>
        </div>

        <div className='p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'>
          <h4 className='font-medium text-red-900 dark:text-red-100 mb-2'>Delete Account</h4>
          <p className='text-sm text-red-700 dark:text-red-300 mb-4'>
            Permanently delete your account and all associated data. This action cannot be undone.
            All your bookings, orders, and personal information will be lost.
          </p>

          <Button
            variant='danger'
            size='md'
            leftIcon={<Trash2 className='w-4 h-4' />}
            onClick={handleDeleteAccount}
            loading={loading_states.deleteAccount}
            disabled={loading_states.deleteAccount}>
            {loading_states.deleteAccount ? "Deleting Account..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

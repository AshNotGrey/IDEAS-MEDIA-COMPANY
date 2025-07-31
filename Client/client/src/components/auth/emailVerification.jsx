import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Button from "../Button";
import { Camera, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";

/**
 * Email Verification Page Component
 *
 * Email verification page for when users need to verify their email
 * after signing up. Handles verification token and resend functionality.
 */
const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error, expired
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Use theme hook to ensure proper theme state initialization
  useTheme();

  // Logo component
  const Logo = () => (
    <div className='flex items-center justify-center space-x-2'>
      <Camera size={32} className='text-ideas-accent' />
      <span className='text-2xl font-heading font-bold text-ideas-black dark:text-ideas-white'>
        Ideal Photography
      </span>
    </div>
  );

  // Handle countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Verify email on component mount if token is present
  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  // Verify email with token
  const verifyEmail = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement actual email verification logic
      console.log("Verifying email with token:", token);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success (in real app, this would be based on API response)
      setVerificationStatus("success");
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    setIsLoading(true);

    try {
      // TODO: Implement actual resend logic
      console.log("Resending verification email to:", email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResendCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (verificationStatus === "success") {
    return (
      <AuthLayout title='Email Verified!' subtitle='Your email has been successfully verified'>
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <CheckCircle size={32} className='text-green-600 dark:text-green-400' />
          </div>

          {/* Success Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Verification complete!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Your email address has been successfully verified. You can now access all features of
              your account.
            </p>
          </div>

          {/* Action Button */}
          <Link
            to='/signin'
            className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium bg-ideas-accent text-white hover:bg-ideas-accentHover transition-colors rounded-lg'>
            Continue to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    return (
      <AuthLayout title='Verification Failed' subtitle='Unable to verify your email address'>
        <div className='text-center space-y-6'>
          {/* Error Icon */}
          <div className='mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center'>
            <AlertCircle size={32} className='text-red-600 dark:text-red-400' />
          </div>

          {/* Error Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Verification failed
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              We couldn't verify your email address. The verification link may be invalid or
              expired.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              onClick={handleResendEmail}
              variant='secondary'
              size='lg'
              fullWidth
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw size={16} className='mr-2 animate-spin' />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>

            <Link
              to='/signin'
              className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-ideas-black dark:hover:text-ideas-white transition-colors'>
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Expired state
  if (verificationStatus === "expired") {
    return (
      <AuthLayout title='Link Expired' subtitle='Your verification link has expired'>
        <div className='text-center space-y-6'>
          {/* Expired Icon */}
          <div className='mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center'>
            <AlertCircle size={32} className='text-yellow-600 dark:text-yellow-400' />
          </div>

          {/* Expired Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Link expired
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Your verification link has expired. Please request a new one to verify your email
              address.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              onClick={handleResendEmail}
              variant='secondary'
              size='lg'
              fullWidth
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw size={16} className='mr-2 animate-spin' />
                  Sending...
                </>
              ) : (
                "Request new verification email"
              )}
            </Button>

            <Link
              to='/signin'
              className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-ideas-black dark:hover:text-ideas-white transition-colors'>
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Default pending state
  return (
    <AuthLayout title='Verify Your Email' subtitle='Check your email for a verification link'>
      <div className='text-center space-y-6'>
        {/* Email Icon */}
        <div className='mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center'>
          <Mail size={32} className='text-blue-600 dark:text-blue-400' />
        </div>

        {/* Pending Message */}
        <div className='space-y-4'>
          <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
            Check your email
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            We've sent a verification link to{" "}
            <span className='font-medium text-ideas-black dark:text-ideas-white'>
              {email || "your email address"}
            </span>
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Click the link in the email to verify your account. The link will expire in 24 hours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='space-y-3'>
          <Button
            onClick={handleResendEmail}
            variant='secondary'
            size='lg'
            fullWidth
            disabled={isLoading || resendCountdown > 0}>
            {isLoading ? (
              <>
                <RefreshCw size={16} className='mr-2 animate-spin' />
                Sending...
              </>
            ) : resendCountdown > 0 ? (
              `Resend in ${resendCountdown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>

          <Link
            to='/signin'
            className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-ideas-black dark:hover:text-ideas-white transition-colors'>
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;

import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Lock, Mail, ArrowLeft } from "lucide-react";
import Button from "../components/Button";

/**
 * Account Deactivated Page
 */
export const AccountDeactivated = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-ideas-white dark:bg-ideas-black px-4'>
      <div className='max-w-md w-full bg-white dark:bg-ideas-gray-800 rounded-lg shadow-lg p-8 text-center'>
        <div className='flex justify-center mb-6'>
          <div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center'>
            <AlertTriangle className='w-8 h-8 text-red-600 dark:text-red-400' />
          </div>
        </div>

        <h1 className='text-2xl font-bold text-ideas-gray-900 dark:text-white mb-4'>
          Account Deactivated
        </h1>

        <p className='text-ideas-gray-600 dark:text-ideas-gray-400 mb-6'>
          Your account has been deactivated. Please contact our support team to reactivate your
          account.
        </p>

        <div className='space-y-4'>
          <Button href='/contact' className='w-full'>
            Contact Support
          </Button>

          <Link
            to='/'
            className='inline-flex items-center text-ideas-blue hover:text-ideas-blue-dark transition-colors'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Account Locked Page
 */
export const AccountLocked = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-ideas-white dark:bg-ideas-black px-4'>
      <div className='max-w-md w-full bg-white dark:bg-ideas-gray-800 rounded-lg shadow-lg p-8 text-center'>
        <div className='flex justify-center mb-6'>
          <div className='w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center'>
            <Lock className='w-8 h-8 text-amber-600 dark:text-amber-400' />
          </div>
        </div>

        <h1 className='text-2xl font-bold text-ideas-gray-900 dark:text-white mb-4'>
          Account Temporarily Locked
        </h1>

        <p className='text-ideas-gray-600 dark:text-ideas-gray-400 mb-6'>
          Your account has been temporarily locked due to multiple failed login attempts. Please try
          again later or reset your password.
        </p>

        <div className='space-y-4'>
          <Button href='/forgot-password' className='w-full'>
            Reset Password
          </Button>

          <Link
            to='/'
            className='inline-flex items-center text-ideas-blue hover:text-ideas-blue-dark transition-colors'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Email Verification Required Page
 */
export const EmailVerificationRequired = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-ideas-white dark:bg-ideas-black px-4'>
      <div className='max-w-md w-full bg-white dark:bg-ideas-gray-800 rounded-lg shadow-lg p-8 text-center'>
        <div className='flex justify-center mb-6'>
          <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
            <Mail className='w-8 h-8 text-blue-600 dark:text-blue-400' />
          </div>
        </div>

        <h1 className='text-2xl font-bold text-ideas-gray-900 dark:text-white mb-4'>
          Email Verification Required
        </h1>

        <p className='text-ideas-gray-600 dark:text-ideas-gray-400 mb-6'>
          Please verify your email address to access this feature. Check your inbox for a
          verification link.
        </p>

        <div className='space-y-4'>
          <Button href='/email-verification' className='w-full'>
            Verify Email
          </Button>

          <Link
            to='/dashboard'
            className='inline-flex items-center text-ideas-blue hover:text-ideas-blue-dark transition-colors'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../utils/validationSchemas";
import AuthLayout from "./AuthLayout";
import FormInput from "./FormInput";
import Button from "../Button";
import { Camera, Lock, CheckCircle } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";

/**
 * Reset Password Page Component
 *
 * Password reset page with react-hook-form, zod validation,
 * and token handling from URL.
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use theme hook to ensure proper theme state initialization
  useTheme();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Logo component
  const Logo = () => (
    <div className='flex items-center justify-center space-x-2'>
      <Camera size={32} className='text-ideas-accent' />
      <span className='text-2xl font-heading font-bold text-ideas-black dark:text-ideas-white'>
        Ideal Photography
      </span>
    </div>
  );

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // TODO: Implement actual password reset logic
      console.log("Resetting password with token:", token);
      console.log("New password:", data.password);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      // Error will be handled by form validation or can be set as general error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invalid token
  if (!token) {
    return (
      <AuthLayout
        title='Invalid Reset Link'
        subtitle='This password reset link is invalid or has expired'>
        <div className='text-center space-y-6'>
          <div className='mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center'>
            <Lock size={32} className='text-red-600 dark:text-red-400' />
          </div>

          <div className='space-y-4'>
            <p className='text-gray-600 dark:text-gray-400'>
              The password reset link you used is invalid or has expired. Please request a new one.
            </p>
          </div>

          <div className='space-y-3'>
            <Link
              to='/forgot-password'
              className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-ideas-accent hover:text-ideas-accentHover transition-colors'>
              Request new reset link
            </Link>

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

  // Handle success state
  if (isSuccess) {
    return (
      <AuthLayout
        title='Password Reset Success'
        subtitle='Your password has been successfully reset'>
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <CheckCircle size={32} className='text-green-600 dark:text-green-400' />
          </div>

          {/* Success Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Password updated!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          {/* Action Button */}
          <Link
            to='/signin'
            className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium bg-ideas-accent text-white hover:bg-ideas-accentHover transition-colors rounded-lg'>
            Sign in with new password
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title='Reset Password' subtitle='Enter your new password'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Password Input */}
        <FormInput
          label='New Password'
          type='password'
          name='password'
          placeholder='Enter your new password'
          error={errors.password?.message}
          {...register("password")}
          required
        />

        {/* Confirm Password Input */}
        <FormInput
          label='Confirm New Password'
          type='password'
          name='confirmPassword'
          placeholder='Confirm your new password'
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          required
        />

        {/* Submit Button */}
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          loading={isLoading}
          disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>

        {/* Back to Sign In */}
        <div className='text-center'>
          <Link
            to='/signin'
            className='inline-flex items-center text-sm text-ideas-accent hover:text-ideas-accentHover transition-colors'>
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

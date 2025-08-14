import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../../utils/validationSchemas";
import AuthLayout from "./AuthLayout";
import FormInput from "./FormInput";
import Button from "../Button";
import { Camera, Mail, ArrowLeft } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Forgot Password Page Component
 *
 * Password reset request page with react-hook-form, zod validation,
 * and theme support.
 */
const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { forgotPassword } = useAuth();

  // Use theme hook to ensure proper theme state initialization
  useTheme();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
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
      const res = await forgotPassword(data.email);
      if (res.success) {
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      // Error will be handled by the form validation
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title='Check Your Email' subtitle="We've sent you a password reset link">
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <Mail size={32} className='text-green-600 dark:text-green-400' />
          </div>

          {/* Success Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Reset link sent!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              We've sent a password reset link to{" "}
              <span className='font-medium text-ideas-black dark:text-ideas-white'>
                {submittedEmail}
              </span>
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button onClick={() => setIsSubmitted(false)} variant='secondary' size='lg' fullWidth>
              Send another email
            </Button>

            <Link
              to='/signin'
              className='inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-ideas-accent hover:text-ideas-accentHover transition-colors'>
              <ArrowLeft size={16} className='mr-2' />
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title='Forgot Password' subtitle='Enter your email to reset your password'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Email Input */}
        <FormInput
          label='Email Address'
          type='email'
          name='email'
          placeholder='Enter your email address'
          error={errors.email?.message}
          {...register("email")}
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
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>

        {/* Back to Sign In */}
        <div className='text-center'>
          <Link
            to='/signin'
            className='inline-flex items-center text-sm text-ideas-accent hover:text-ideas-accentHover transition-colors'>
            <ArrowLeft size={16} className='mr-2' />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;

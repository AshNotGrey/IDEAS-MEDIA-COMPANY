import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "../../utils/validationSchemas";
import AuthLayout from "./AuthLayout";
import { FormInput, Checkbox } from "./FormInput";
import Button from "../Button";
import { useAuth } from "../../graphql/hooks/useAuth";
import useTheme from "../../hooks/useTheme.js";

/**
 * Sign In Page Component
 *
 * Complete sign in page with react-hook-form, zod validation,
 * theme support, and responsive design.
 */
const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Use theme hook to ensure proper theme state initialization
  useTheme();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError("");

    try {
      const result = await signIn(data.email, data.password, data.rememberMe);

      if (result.success) {
        // Navigate to dashboard or home
        console.log("Sign in successful!", result.user);
        navigate("/dashboard");
      } else {
        setGeneralError(result.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setGeneralError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Navigate to forgot password page
    navigate("/forgot-password");
  };

  return (
    <AuthLayout title='Welcome Back' subtitle='Sign in to your account'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* General Error */}
        {generalError && (
          <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
            <p className='text-sm text-red-600 dark:text-red-400'>{generalError}</p>
          </div>
        )}

        {/* Email Input */}
        <FormInput
          label='Email Address'
          type='email'
          name='email'
          placeholder='Enter your email'
          error={errors.email?.message}
          {...register("email")}
          required
        />

        {/* Password Input */}
        <FormInput
          label='Password'
          type='password'
          name='password'
          placeholder='Enter your password'
          error={errors.password?.message}
          {...register("password")}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className='flex items-center justify-between'>
          <Checkbox name='rememberMe' label='Remember me' {...register("rememberMe")} />

          <Button
            type='button'
            variant='text'
            size='sm'
            onClick={handleForgotPassword}
            className='text-ideas-accent hover:text-ideas-accentHover transition-colors'>
            Forgot password?
          </Button>
        </div>

        {/* Sign In Button */}
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          animated
          loading={isLoading}
          disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Sign Up Link */}
        <div className='text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Don't have an account?{" "}
            <Button
              onClick={() => navigate("/signup")}
              variant='text'
              size='sm'
              className='text-ideas-accent hover:text-ideas-accentHover transition-colors font-medium'>
              Sign up
            </Button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignIn;

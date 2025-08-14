import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../../utils/validationSchemas";
import AuthLayout from "./AuthLayout";
import { FormInput, Checkbox } from "./FormInput";
import Button from "../Button";
import useTheme from "../../hooks/useTheme.js";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Sign Up Page Component
 *
 * Complete sign up page with react-hook-form, zod validation,
 * theme support, and responsive design.
 */
const SignUp = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
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
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nin: "",
      driversLicense: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError("");

    try {
      // Format data for GraphQL mutation
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nin: data.nin,
        driversLicense: data.driversLicense,
        password: data.password,
      };

      const result = await registerUser(userData);

      if (result.success) {
        // TODO: Navigate to email verification
        console.log("Sign up successful!", result.user);
        navigate("/email-verification");
      } else {
        setGeneralError(result.error || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setGeneralError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title='Create Account' subtitle='Join Ideas Media Company today'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* General Error */}
        {generalError && (
          <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
            <p className='text-sm text-red-600 dark:text-red-400'>{generalError}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className='grid grid-cols-2 gap-4'>
          <FormInput
            label='First Name'
            type='text'
            name='firstName'
            placeholder='John'
            error={errors.firstName?.message}
            {...register("firstName")}
            required
          />

          <FormInput
            label='Last Name'
            type='text'
            name='lastName'
            placeholder='Doe'
            error={errors.lastName?.message}
            {...register("lastName")}
            required
          />
        </div>

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

        {/* Phone Input */}
        <FormInput
          label='Phone Number'
          type='tel'
          name='phone'
          placeholder='+2348012345678'
          error={errors.phone?.message}
          {...register("phone")}
          required
        />

        {/* NIN Input */}
        <FormInput
          label='NIN (National Identification Number)'
          type='text'
          name='nin'
          placeholder="12345678901 (Optional if Driver's License provided)"
          error={errors.nin?.message}
          {...register("nin")}
        />

        {/* Driver's License Input */}
        <FormInput
          label="Driver's License Number"
          type='text'
          name='driversLicense'
          placeholder='ABC123456XY12 (Optional if NIN provided)'
          error={errors.driversLicense?.message}
          {...register("driversLicense")}
        />

        {/* Verification Requirement Note */}
        <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <p className='text-sm text-blue-600 dark:text-blue-400'>
            <strong>Note:</strong> You must provide either your NIN or Driver's License Number for
            verification. Both are accepted if you have them.
          </p>
        </div>

        {/* Password Input */}
        <FormInput
          label='Password'
          type='password'
          name='password'
          placeholder='Create a password'
          error={errors.password?.message}
          {...register("password")}
          required
        />

        {/* Confirm Password Input */}
        <FormInput
          label='Confirm Password'
          type='password'
          name='confirmPassword'
          placeholder='Confirm your password'
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          required
        />

        {/* Terms and Conditions */}
        <Checkbox
          name='acceptTerms'
          label={
            <>
              I agree to the{" "}
              <Link
                to='/terms'
                className='text-ideas-accent hover:text-ideas-accentHover transition-colors font-medium'>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to='/privacy'
                className='text-ideas-accent hover:text-ideas-accentHover transition-colors font-medium'>
                Privacy Policy
              </Link>
            </>
          }
          error={errors.acceptTerms?.message}
          {...register("acceptTerms")}
          required
        />

        {/* Sign Up Button */}
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          loading={isLoading}
          disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Sign In Link */}
        <div className='text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Already have an account?{" "}
            <Link
              to='/signin'
              className='text-ideas-accent hover:text-ideas-accentHover transition-colors font-medium'>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "../../services/authService.js";
import {
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowRight,
  Copy,
} from "lucide-react";
import Button from "../common/Button.jsx";
import AuthPageLayout from "./AuthPageLayout.jsx";

// Validation schema
const registrationSchema = yup
  .object({
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .matches(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, hyphens, and underscores"
      ),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords do not match"),
    code: yup.string().when("registrationType", {
      is: "invite",
      then: (schema) => schema.required("Invite code is required"),
      otherwise: (schema) => schema.optional(),
    }),
    verifierUsername: yup.string().when("registrationType", {
      is: "verification",
      then: (schema) => schema.required("Verifier username is required"),
      otherwise: (schema) => schema.optional(),
    }),
  })
  .required();

const AdminRegistration = () => {
  const [registrationType, setRegistrationType] = useState("invite"); // 'invite' or 'verification'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      code: "",
      verifierUsername: "",
    },
  });

  // Watch registration type to trigger validation
  const watchedRegistrationType = watch("registrationType");

  // Update schema when registration type changes
  React.useEffect(() => {
    if (watchedRegistrationType) {
      trigger();
    }
  }, [watchedRegistrationType, trigger]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare registration data based on type
      const registrationData = {
        username: data.username,
        password: data.password,
      };

      if (registrationType === "invite") {
        registrationData.code = data.code;
      } else if (registrationType === "verification") {
        registrationData.verifierUsername = data.verifierUsername;
      }

      const response = await authService.register(registrationData);

      const result = {
        success: true,
        admin: {
          username: data.username,
          role: registrationType === "invite" ? "admin" : "pending",
          isVerified: registrationType === "invite",
          requiresVerification: registrationType === "verification",
        },
        message:
          registrationType === "invite"
            ? "Registration successful! You can now sign in."
            : "Verification request submitted. An administrator will review your request.",
      };

      setRegistrationData(result);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle specific server errors
      if (error.message.includes("Username already taken")) {
        setError("username", { message: "Username already taken" });
      } else if (error.message.includes("Invalid invite code")) {
        setError("code", { message: "Invalid or expired invite code" });
      } else if (error.message.includes("Verifier not found")) {
        setError("verifierUsername", { message: "Verifier not found or not eligible" });
      } else {
        setError("general", { message: error.message || "Registration failed" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = () => {
    const inviteCode = watch("code");
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      // TODO: Show toast notification
    }
  };

  if (registrationSuccess) {
    return (
      <AuthPageLayout
        title='Registration Successful!'
        subtitle={registrationData?.message || "Your account has been created successfully."}>
        <div className='text-center'>
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Account Details
            </h3>
            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Username:
                </span>
                <span className='text-sm text-gray-900 dark:text-white'>
                  {registrationData?.admin?.username}
                </span>
              </div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>Role:</span>
                <span className='text-sm text-gray-900 dark:text-white capitalize'>
                  {registrationData?.admin?.role}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Status:
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    registrationData?.admin?.isVerified
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                  }`}>
                  {registrationData?.admin?.isVerified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>

          {registrationData?.admin?.isVerified ? (
            <div className='space-y-3'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Your account is ready to use. You can now sign in with your credentials.
              </p>
              <Button
                onClick={() => (window.location.href = "/login")}
                variant='primary'
                size='lg'
                fullWidth
                animated>
                Sign In Now
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center space-x-2 text-yellow-600 dark:text-yellow-400'>
                <Clock className='w-4 h-4' />
                <span className='text-sm font-medium'>Verification Required</span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                An administrator will review your request and verify your account. You'll receive a
                notification once verified.
              </p>
              <Button
                onClick={() => (window.location.href = "/login")}
                variant='secondary'
                fullWidth>
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-ideas-accent/10 to-ideas-accentLight/20 p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-heading font-bold text-black dark:text-white mb-2'>
            Admin Registration
          </h1>
          <p className='text-subtle'>Create your administrative account</p>
        </div>

        {/* Registration Form */}
        <div className='card card-hover'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Registration Type Toggle */}
            <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
              <button
                type='button'
                onClick={() => {
                  setRegistrationType("invite");
                  setValue("registrationType", "invite");
                  trigger();
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  registrationType === "invite"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}>
                <Shield className='w-4 h-4 inline mr-2' />
                Invite Code
              </button>
              <button
                type='button'
                onClick={() => {
                  setRegistrationType("verification");
                  setValue("registrationType", "verification");
                  trigger();
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  registrationType === "verification"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}>
                <UserPlus className='w-4 h-4 inline mr-2' />
                Request Verification
              </button>
            </div>

            {/* Hidden field for registration type */}
            <input type='hidden' {...register("registrationType")} value={registrationType} />

            {/* Username Field */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-black dark:text-white mb-2'>
                Username
              </label>
              <input
                {...register("username")}
                type='text'
                id='username'
                className={`input w-full ${errors.username ? "input-error" : ""}`}
                placeholder='Choose a username'
                disabled={isSubmitting}
                autoComplete='username'
              />
              {errors.username && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-black dark:text-white mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id='password'
                    className={`input w-full pr-12 ${errors.password ? "input-error" : ""}`}
                    placeholder='Create a strong password'
                    disabled={isSubmitting}
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    disabled={isSubmitting}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-black dark:text-white mb-2'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    id='confirmPassword'
                    className={`input w-full pr-12 ${errors.confirmPassword ? "input-error" : ""}`}
                    placeholder='Confirm your password'
                    disabled={isSubmitting}
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    disabled={isSubmitting}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Invite Code or Verifier Username */}
            {registrationType === "invite" ? (
              <div>
                <label
                  htmlFor='code'
                  className='block text-sm font-medium text-black dark:text-white mb-2'>
                  Invite Code
                </label>
                <div className='relative'>
                  <input
                    {...register("code")}
                    type='text'
                    id='code'
                    className={`input w-full pr-12 ${errors.code ? "input-error" : ""}`}
                    placeholder='Enter your invite code'
                    disabled={isSubmitting}
                    autoComplete='off'
                  />
                  <button
                    type='button'
                    onClick={copyInviteCode}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    disabled={isSubmitting || !watch("code")}
                    title='Copy invite code'>
                    <Copy size={20} />
                  </button>
                </div>
                {errors.code && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.code.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Enter the invitation code provided by an administrator
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor='verifierUsername'
                  className='block text-sm font-medium text-black dark:text-white mb-2'>
                  Verifier Username
                </label>
                <input
                  {...register("verifierUsername")}
                  type='text'
                  id='verifierUsername'
                  className={`input w-full ${errors.verifierUsername ? "input-error" : ""}`}
                  placeholder="Enter an existing admin's username"
                  disabled={isSubmitting}
                  autoComplete='off'
                />
                {errors.verifierUsername && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.verifierUsername.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Enter the username of an existing administrator who can verify your account
                </p>
              </div>
            )}

            {/* General Error Display */}
            {errors.general && (
              <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md'>
                <p className='text-sm text-red-800 dark:text-red-200'>{errors.general.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type='submit'
              variant='primary'
              size='lg'
              fullWidth
              animated
              loading={isSubmitting}
              disabled={isSubmitting || !isValid}>
              {isSubmitting ? (
                "Creating Account..."
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className='w-5 h-5 ml-2' />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className='text-center text-sm text-white/70'>
            <p>
              Already have an account?{" "}
              <button
                onClick={() => (window.location.href = "/login")}
                className='text-ideas-accent hover:text-ideas-accentLight font-medium'>
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Information Box */}
        <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <div className='flex items-start space-x-3'>
            <AlertTriangle className='w-5 h-5 text-blue-600 mt-0.5' />
            <div className='text-sm text-blue-800 dark:text-blue-200'>
              <p className='font-medium mb-1'>Registration Information</p>
              <p>
                {registrationType === "invite"
                  ? "Using an invite code will create a verified account immediately. Requesting verification requires admin approval before access is granted."
                  : "Requesting verification will create a pending account that requires approval from an existing administrator before you can sign in."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;

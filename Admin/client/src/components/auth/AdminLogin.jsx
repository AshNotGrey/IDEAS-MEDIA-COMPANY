import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAdminAuth } from "../../hooks/useAdminAuth.js";
import { Shield, AlertTriangle, Lock, UserX } from "lucide-react";
import AuthPageLayout from "./AuthPageLayout.jsx";
import Button from "../common/Button.jsx";
import { FormInput, Checkbox } from "./FormInput.jsx";

// Validation schema
const loginSchema = yup
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
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be less than 128 characters"),
  })
  .required();

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Device fingerprinting
  useEffect(() => {
    const generateDeviceId = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
      return btoa(canvas.toDataURL()).slice(0, 32);
    };

    const getPlatform = () => {
      const platform = navigator.platform || "unknown";
      if (platform.includes("Win")) return "Windows";
      if (platform.includes("Mac")) return "macOS";
      if (platform.includes("Linux")) return "Linux";
      if (platform.includes("Android")) return "Android";
      if (platform.includes("iOS")) return "iOS";
      return platform;
    };

    const getBrowser = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Chrome")) return "Chrome";
      if (userAgent.includes("Firefox")) return "Firefox";
      if (userAgent.includes("Safari")) return "Safari";
      if (userAgent.includes("Edge")) return "Edge";
      return "Unknown";
    };

    setDeviceInfo({
      deviceId: generateDeviceId(),
      deviceName: navigator.platform || "Unknown",
      platform: getPlatform(),
      browser: getBrowser(),
      userAgent: navigator.userAgent,
    });
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearErrors("general");

    try {
      // Include device info in login request
      const loginData = {
        ...data,
        deviceInfo,
        rememberMe,
      };

      const result = await login(loginData);

      if (result.success) {
        navigate("/dashboard");
      } else {
        handleLoginError(result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("general", {
        type: "manual",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginError = (error) => {
    let errorMessage = "Login failed. Please try again.";
    let errorType = "general";

    if (typeof error === "string") {
      // Map server error messages to user-friendly messages
      if (error.includes("Invalid credentials")) {
        errorMessage = "Invalid username or password. Please try again.";
        errorType = "credentials";
      } else if (error.includes("Account deactivated")) {
        errorMessage = "Account deactivated. Contact administrator for assistance.";
        errorType = "deactivated";
      } else if (error.includes("Account locked")) {
        errorMessage =
          "Account locked due to too many failed attempts. Contact administrator for assistance.";
        errorType = "locked";
      } else if (error.includes("Admin not verified")) {
        errorMessage = "Account pending verification. Contact administrator for assistance.";
        errorType = "unverified";
      } else if (error.includes("Admin access required")) {
        errorMessage = "Access denied. Admin privileges required.";
        errorType = "access";
      } else if (error.includes("Too Many Requests")) {
        errorMessage = "Too many login attempts. Please wait before retrying.";
        errorType = "rateLimit";
      } else {
        errorMessage = error;
      }
    }

    setError(errorType, {
      type: "manual",
      message: errorMessage,
    });
  };

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case "locked":
        return <Lock className='w-5 h-5 text-red-500' />;
      case "deactivated":
        return <UserX className='w-5 h-5 text-red-500' />;
      case "unverified":
        return <AlertTriangle className='w-5 h-5 text-yellow-500' />;
      case "rateLimit":
        return <Shield className='w-5 h-5 text-orange-500' />;
      case "access":
        return <Shield className='w-5 h-5 text-red-500' />;
      case "credentials":
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
      default:
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
    }
  };

  const getErrorStyle = (errorType) => {
    switch (errorType) {
      case "locked":
      case "deactivated":
      case "access":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "unverified":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "rateLimit":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "credentials":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    }
  };

  // Check for special error types
  const hasSpecialError =
    errors.locked ||
    errors.deactivated ||
    errors.unverified ||
    errors.rateLimit ||
    errors.access ||
    errors.credentials;
  const specialErrorType = Object.keys(errors).find((key) =>
    ["locked", "deactivated", "unverified", "rateLimit", "access", "credentials"].includes(key)
  );

  return (
    <AuthPageLayout title='Welcome Back' subtitle='Sign in to your account'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Enhanced Error Display */}
        {(errors.general || hasSpecialError) && (
          <div
            className={`p-4 border rounded-md flex items-start space-x-3 ${
              specialErrorType
                ? getErrorStyle(specialErrorType)
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
            {specialErrorType ? (
              getErrorIcon(specialErrorType)
            ) : (
              <AlertTriangle className='w-5 h-5 text-red-500' />
            )}
            <div className='flex-1'>
              <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                {errors.general?.message || errors[specialErrorType]?.message}
              </p>
              {(errors.locked || errors.deactivated || errors.unverified || errors.access) && (
                <p className='text-xs text-red-600 dark:text-red-300 mt-1'>
                  Please contact your system administrator for assistance.
                </p>
              )}
              {errors.rateLimit && (
                <p className='text-xs text-red-600 dark:text-red-300 mt-1'>
                  Please wait a moment before trying again.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Username Field */}
        <FormInput
          label='Username'
          type='text'
          name='username'
          placeholder='Enter your username'
          error={errors.username?.message}
          {...register("username")}
          required
          disabled={isSubmitting}
        />

        {/* Password Field */}
        <FormInput
          label='Password'
          type='password'
          name='password'
          placeholder='Enter your password'
          error={errors.password?.message}
          {...register("password")}
          required
          disabled={isSubmitting}
        />

        {/* Remember Me & Device Info */}
        <div className='space-y-3'>
          <Checkbox
            name='rememberMe'
            label='Remember this device for 30 days'
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
          />

          {/* Device Info Display */}
          <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md'>
            <div className='flex flex-row justify-between'>
              <p>{deviceInfo.platform}</p>
              <p>|</p>
              <p>{deviceInfo.browser}</p>
              <p>|</p>
              <p className='text-xs opacity-75'>Device ID: {deviceInfo.deviceId?.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          animated
          loading={isSubmitting}
          disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className='text-center text-sm text-white/70 mt-4 flex flex-row justify-center'>
        <p>Don&apos;t have an admin account?</p>
        <div className='flex justify-center ml-2'>
          <Link
            to='/register'
            className='text-ideas-accent hover:text-ideas-accentLight font-medium text-sm'>
            Register Admin
          </Link>
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default AdminLogin;

import { z } from "zod";

/**
 * Validation Schemas using Zod
 *
 * Centralized validation schemas for all authentication forms
 * to ensure consistency and reusability across the application.
 */

// Common field validations
const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number");

const nameSchema = z
    .string()
    .min(1, "This field is required")
    .min(2, "Must be at least 2 characters")
    .max(50, "Must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens, and apostrophes are allowed");

const phoneSchema = z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number");

// NIN validation (11 digits for Nigerian NIN) - Optional but must be valid if provided
const ninSchema = z
    .string()
    .optional()
    .refine((val) => !val || /^\d{11}$/.test(val), {
        message: "NIN must be exactly 11 digits"
    });

// Driver's License validation (Nigerian format) - Optional but must be valid if provided
const driversLicenseSchema = z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Z]{3}\d{6}[A-Z]{2}\d{2}$/.test(val), {
        message: "Please enter a valid Driver's License Number (e.g., ABC123456XY12)"
    });

// Sign In Schema
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

// Sign Up Schema
export const signUpSchema = z
    .object({
        firstName: nameSchema,
        lastName: nameSchema,
        email: emailSchema,
        phone: phoneSchema,
        nin: ninSchema,
        driversLicense: driversLicenseSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.nin || data.driversLicense, {
        message: "Either NIN or Driver's License is required",
        path: ["nin"],
    })
    .refine((data) => data.nin || data.driversLicense, {
        message: "Either NIN or Driver's License is required",
        path: ["driversLicense"],
    });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Email Verification Resend Schema
export const emailVerificationSchema = z.object({
    email: emailSchema,
});

// Contact Form Schema (for future use)
export const contactSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    subject: z.string().min(1, "Subject is required").max(100, "Subject must be less than 100 characters"),
    message: z
        .string()
        .min(1, "Message is required")
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must be less than 1000 characters"),
});

// Profile Update Schema (for future use)
export const profileUpdateSchema = z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema.optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// Change Password Schema (for future use)
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmNewPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

// Booking Form Schema (for future use)
export const bookingSchema = z.object({
    serviceType: z.string().min(1, "Please select a service type"),
    preferredDate: z.string().min(1, "Please select a preferred date"),
    preferredTime: z.string().min(1, "Please select a preferred time"),
    location: z.string().min(1, "Location is required"),
    duration: z.string().min(1, "Please select session duration"),
    specialRequests: z.string().max(500, "Special requests must be less than 500 characters").optional(),
    contactMethod: z.enum(["email", "phone", "whatsapp"], {
        required_error: "Please select a preferred contact method",
    }),
});

// Newsletter Subscription Schema (for future use)
export const newsletterSchema = z.object({
    email: emailSchema,
    preferences: z.object({
        photography_tips: z.boolean().optional(),
        promotions: z.boolean().optional(),
        portfolio_updates: z.boolean().optional(),
    }).optional(),
});

export default {
    signInSchema,
    signUpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    emailVerificationSchema,
    contactSchema,
    profileUpdateSchema,
    changePasswordSchema,
    bookingSchema,
    newsletterSchema,
}; 
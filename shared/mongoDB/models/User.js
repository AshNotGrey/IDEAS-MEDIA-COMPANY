import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },

    // Role & Permissions
    role: {
        type: String,
        enum: ['client', 'admin', 'manager', 'super_admin'],
        default: 'client'
    },
    permissions: [{
        type: String,
        enum: [
            'users.view', 'users.edit', 'users.delete', 'users.verify',
            'products.view', 'products.edit', 'products.delete',
            'bookings.view', 'bookings.edit', 'bookings.delete',
            'galleries.view', 'galleries.edit', 'galleries.delete',
            'campaigns.view', 'campaigns.edit', 'campaigns.delete',
            'notifications.send', 'emails.send', 'settings.edit',
            'logs.view', 'admins.manage'
        ]
    }],

    // Contact Information
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    alternatePhone: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: { type: String, default: 'Nigeria' },
        postalCode: String
    },

    // Account Status
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // ID Verification for bookings/rentals
    verification: {
        nin: {
            number: String,
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            document: String, // file path/URL
            submittedAt: Date,
            verifiedAt: Date,
            rejectionReason: String
        },
        driversLicense: {
            number: String,
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            document: String, // file path/URL
            submittedAt: Date,
            verifiedAt: Date,
            rejectionReason: String,
            expiryDate: Date
        }
    },

    // Referrer Information (required for checkout)
    referrerInfo: {
        name: String,
        phone: String,
        email: String,
        relationship: String // friend, family, colleague, etc.
    },

    // Preferences
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        },
        newsletter: { type: Boolean, default: false }
    },

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Account Activity
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // UUID for references (32-bit)
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    },

    // Avatar/Profile Image
    avatar: String,

    // Biography for admin users
    bio: String,

    // Social Media Links
    socialMedia: {
        instagram: String,
        facebook: String,
        twitter: String,
        linkedin: String
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full verification status
userSchema.virtual('isFullyVerified').get(function () {
    const hasNin = this.verification.nin.number && this.verification.nin.status === 'verified';
    const hasDriversLicense = this.verification.driversLicense.number && this.verification.driversLicense.status === 'verified';

    // User is fully verified if they have at least one verified document
    return hasNin || hasDriversLicense;
});

// Virtual for verification status
userSchema.virtual('verificationStatus').get(function () {
    const ninStatus = this.verification.nin.status;
    const driversLicenseStatus = this.verification.driversLicense.status;

    if (ninStatus === 'verified' || driversLicenseStatus === 'verified') {
        return 'verified';
    } else if (ninStatus === 'pending' || driversLicenseStatus === 'pending') {
        return 'pending';
    } else if (ninStatus === 'rejected' || driversLicenseStatus === 'rejected') {
        return 'rejected';
    } else {
        return 'not_submitted';
    }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ uuid: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'verification.nin.status': 1 });
userSchema.index({ 'verification.driversLicense.status': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

export default mongoose.model('User', userSchema); 
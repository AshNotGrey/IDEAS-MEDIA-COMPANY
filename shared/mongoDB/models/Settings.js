import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const settingsSchema = new mongoose.Schema({
    // Settings Identification
    key: {
        type: String,
        required: [true, 'Settings key is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Settings name is required'],
        trim: true
    },
    description: String,
    category: {
        type: String,
        enum: [
            'general', 'branding', 'integrations', 'notifications', 'security',
            'payments', 'email', 'sms', 'whatsapp', 'theme', 'analytics',
            'business', 'inventory', 'booking', 'maintenance'
        ],
        required: [true, 'Settings category is required']
    },

    // Value & Type
    value: mongoose.Schema.Types.Mixed, // Can store any type of value
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'object', 'array', 'json', 'password', 'url', 'email'],
        required: [true, 'Value type is required']
    },
    defaultValue: mongoose.Schema.Types.Mixed,

    // Validation & Constraints
    validation: {
        required: { type: Boolean, default: false },
        min: Number, // For numbers
        max: Number, // For numbers
        minLength: Number, // For strings
        maxLength: Number, // For strings
        pattern: String, // Regex pattern
        enum: [String], // Allowed values
        customValidator: String // Function name for custom validation
    },

    // UI Configuration
    ui: {
        inputType: {
            type: String,
            enum: ['text', 'password', 'email', 'url', 'number', 'boolean', 'select', 'textarea', 'json', 'file'],
            default: 'text'
        },
        placeholder: String,
        helpText: String,
        options: [{ // For select inputs
            value: String,
            label: String
        }],
        group: String, // UI grouping
        order: { type: Number, default: 0 },
        hidden: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false }
    },

    // Security & Access
    isSecret: { type: Boolean, default: false }, // For API keys, passwords, etc.
    accessLevel: {
        type: String,
        enum: ['public', 'admin', 'super_admin', 'system'],
        default: 'admin'
    },
    encrypted: { type: Boolean, default: false },

    // Status & Control
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false }, // System settings that shouldn't be deleted
    requiresRestart: { type: Boolean, default: false }, // If changing this requires app restart

    // Environment Specific
    environment: {
        type: String,
        enum: ['all', 'development', 'staging', 'production'],
        default: 'all'
    },

    // Change Tracking
    history: [{
        previousValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: { type: Date, default: Date.now },
        reason: String,
        ipAddress: String
    }],

    // Metadata
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    notes: String,

    // UUID for references
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    }

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            // Hide secret values in JSON output
            if (doc.isSecret && ret.value) {
                ret.value = '***HIDDEN***';
            }
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Virtuals
settingsSchema.virtual('isModified').get(function () {
    return this.value !== this.defaultValue;
});

settingsSchema.virtual('hasHistory').get(function () {
    return this.history && this.history.length > 0;
});

// Indexes
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });
settingsSchema.index({ accessLevel: 1 });
settingsSchema.index({ environment: 1 });
settingsSchema.index({ isActive: 1 });
settingsSchema.index({ uuid: 1 });

// Pre-save middleware
settingsSchema.pre('save', function (next) {
    // Track changes in history
    if (this.isModified('value') && !this.isNew) {
        const historyEntry = {
            previousValue: this._original ? this._original.value : this.defaultValue,
            newValue: this.value,
            changedAt: new Date()
        };

        // Add to history (keep only last 10 changes)
        this.history.unshift(historyEntry);
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
    }

    // Store original value for comparison
    if (!this._original) {
        this._original = this.toObject();
    }

    next();
});

// Methods
settingsSchema.methods.updateValue = function (newValue, changedBy, reason = '', ipAddress = '') {
    // Add to history
    this.history.unshift({
        previousValue: this.value,
        newValue: newValue,
        changedBy: changedBy,
        changedAt: new Date(),
        reason: reason,
        ipAddress: ipAddress
    });

    // Keep only last 10 changes
    if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
    }

    this.value = newValue;
    this.lastModifiedBy = changedBy;

    return this.save();
};

settingsSchema.methods.resetToDefault = function (changedBy, reason = 'Reset to default') {
    return this.updateValue(this.defaultValue, changedBy, reason);
};

settingsSchema.methods.validate = function (value) {
    const validation = this.validation;

    if (validation.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: 'Value is required' };
    }

    if (this.type === 'number') {
        if (validation.min !== undefined && value < validation.min) {
            return { valid: false, error: `Value must be at least ${validation.min}` };
        }
        if (validation.max !== undefined && value > validation.max) {
            return { valid: false, error: `Value must be at most ${validation.max}` };
        }
    }

    if (this.type === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
            return { valid: false, error: `Value must be at least ${validation.minLength} characters` };
        }
        if (validation.maxLength && value.length > validation.maxLength) {
            return { valid: false, error: `Value must be at most ${validation.maxLength} characters` };
        }
        if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
                return { valid: false, error: 'Value does not match required pattern' };
            }
        }
    }

    if (validation.enum && validation.enum.length > 0) {
        if (!validation.enum.includes(value)) {
            return { valid: false, error: `Value must be one of: ${validation.enum.join(', ')}` };
        }
    }

    return { valid: true };
};

// Static methods
settingsSchema.statics.get = function (key, defaultValue = null) {
    return this.findOne({ key, isActive: true }).then(setting => {
        if (!setting) return defaultValue;
        return setting.value !== undefined ? setting.value : setting.defaultValue;
    });
};

settingsSchema.statics.set = function (key, value, changedBy, reason = '') {
    return this.findOne({ key }).then(setting => {
        if (!setting) {
            throw new Error(`Setting with key '${key}' not found`);
        }
        return setting.updateValue(value, changedBy, reason);
    });
};

settingsSchema.statics.getByCategory = function (category, accessLevel = 'admin') {
    const query = {
        category,
        isActive: true,
        accessLevel: { $in: ['public', accessLevel] }
    };

    if (accessLevel !== 'super_admin') {
        query.accessLevel = { $ne: 'super_admin' };
    }

    return this.find(query).sort({ 'ui.order': 1, name: 1 });
};

settingsSchema.statics.createDefaults = function () {
    const defaultSettings = [
        // General Settings
        {
            key: 'site.name',
            name: 'Site Name',
            description: 'The name of your photography business',
            category: 'general',
            value: 'Ideal Photography',
            type: 'string',
            defaultValue: 'Ideal Photography',
            ui: { inputType: 'text', group: 'Basic Info', order: 1 }
        },
        {
            key: 'site.tagline',
            name: 'Site Tagline',
            description: 'A short description of your business',
            category: 'general',
            value: 'Capture Your Perfect Moments',
            type: 'string',
            defaultValue: 'Capture Your Perfect Moments',
            ui: { inputType: 'text', group: 'Basic Info', order: 2 }
        },
        {
            key: 'site.email',
            name: 'Business Email',
            description: 'Primary contact email for your business',
            category: 'general',
            value: 'PLACEHOLDER_BUSINESS_EMAIL',
            type: 'email',
            defaultValue: 'info@idealphotography.com',
            ui: { inputType: 'email', group: 'Contact Info', order: 3 }
        },
        {
            key: 'site.phone',
            name: 'Business Phone',
            description: 'Primary contact phone number',
            category: 'general',
            value: 'PLACEHOLDER_BUSINESS_PHONE',
            type: 'string',
            defaultValue: '+234-XXX-XXX-XXXX',
            ui: { inputType: 'text', group: 'Contact Info', order: 4 }
        },

        // WhatsApp Settings
        {
            key: 'whatsapp.number',
            name: 'WhatsApp Number',
            description: 'WhatsApp number for customer support',
            category: 'whatsapp',
            value: 'PLACEHOLDER_WHATSAPP_NUMBER',
            type: 'string',
            defaultValue: '+1234567890',
            ui: { inputType: 'text', group: 'WhatsApp', order: 1 }
        },
        {
            key: 'whatsapp.enabled',
            name: 'Enable WhatsApp',
            description: 'Show WhatsApp contact button',
            category: 'whatsapp',
            value: true,
            type: 'boolean',
            defaultValue: true,
            ui: { inputType: 'boolean', group: 'WhatsApp', order: 2 }
        },
        {
            key: 'whatsapp.message',
            name: 'Default WhatsApp Message',
            description: 'Default message when users click WhatsApp button',
            category: 'whatsapp',
            value: "Hi! I'm interested in your photography services.",
            type: 'string',
            defaultValue: "Hi! I'm interested in your photography services.",
            ui: { inputType: 'textarea', group: 'WhatsApp', order: 3 }
        },

        // Payment Settings (Paystack)
        {
            key: 'paystack.public_key',
            name: 'Paystack Public Key',
            description: 'Paystack public key for payment processing',
            category: 'payments',
            value: 'PLACEHOLDER_PAYSTACK_PUBLIC_KEY',
            type: 'string',
            defaultValue: 'pk_test_xxxxx',
            ui: { inputType: 'text', group: 'Paystack', order: 1 },
            isSecret: false
        },
        {
            key: 'paystack.secret_key',
            name: 'Paystack Secret Key',
            description: 'Paystack secret key for payment processing',
            category: 'payments',
            value: 'PLACEHOLDER_PAYSTACK_SECRET_KEY',
            type: 'password',
            defaultValue: 'sk_test_xxxxx',
            ui: { inputType: 'password', group: 'Paystack', order: 2 },
            isSecret: true,
            accessLevel: 'super_admin'
        },

        // Email Settings (EmailJS)
        {
            key: 'emailjs.service_id',
            name: 'EmailJS Service ID',
            description: 'EmailJS service ID for contact forms',
            category: 'email',
            value: 'PLACEHOLDER_EMAILJS_SERVICE_ID',
            type: 'string',
            defaultValue: 'service_xxxxx',
            ui: { inputType: 'text', group: 'EmailJS', order: 1 }
        },
        {
            key: 'emailjs.template_id',
            name: 'EmailJS Template ID',
            description: 'EmailJS template ID for contact forms',
            category: 'email',
            value: 'PLACEHOLDER_EMAILJS_TEMPLATE_ID',
            type: 'string',
            defaultValue: 'template_xxxxx',
            ui: { inputType: 'text', group: 'EmailJS', order: 2 }
        },
        {
            key: 'emailjs.public_key',
            name: 'EmailJS Public Key',
            description: 'EmailJS public key for client-side email sending',
            category: 'email',
            value: 'PLACEHOLDER_EMAILJS_PUBLIC_KEY',
            type: 'string',
            defaultValue: 'user_xxxxx',
            ui: { inputType: 'text', group: 'EmailJS', order: 3 }
        },

        // Cloudinary Settings
        {
            key: 'cloudinary.cloud_name',
            name: 'Cloudinary Cloud Name',
            description: 'Cloudinary cloud name for image storage',
            category: 'integrations',
            value: 'PLACEHOLDER_CLOUDINARY_CLOUD_NAME',
            type: 'string',
            defaultValue: 'your-cloud-name',
            ui: { inputType: 'text', group: 'Cloudinary', order: 1 }
        },
        {
            key: 'cloudinary.api_key',
            name: 'Cloudinary API Key',
            description: 'Cloudinary API key',
            category: 'integrations',
            value: 'PLACEHOLDER_CLOUDINARY_API_KEY',
            type: 'string',
            defaultValue: 'xxxxx',
            ui: { inputType: 'text', group: 'Cloudinary', order: 2 }
        },
        {
            key: 'cloudinary.api_secret',
            name: 'Cloudinary API Secret',
            description: 'Cloudinary API secret',
            category: 'integrations',
            value: 'PLACEHOLDER_CLOUDINARY_API_SECRET',
            type: 'password',
            defaultValue: 'xxxxx',
            ui: { inputType: 'password', group: 'Cloudinary', order: 3 },
            isSecret: true,
            accessLevel: 'super_admin'
        },

        // Business Settings
        {
            key: 'business.address',
            name: 'Business Address',
            description: 'Physical address of your business',
            category: 'business',
            value: 'PLACEHOLDER_BUSINESS_ADDRESS',
            type: 'string',
            defaultValue: '123 Photography Street, Lagos, Nigeria',
            ui: { inputType: 'textarea', group: 'Location', order: 1 }
        },
        {
            key: 'business.hours',
            name: 'Business Hours',
            description: 'Operating hours',
            category: 'business',
            value: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
            type: 'string',
            defaultValue: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
            ui: { inputType: 'text', group: 'Location', order: 2 }
        },

        // Theme Settings
        {
            key: 'theme.primary_color',
            name: 'Primary Color',
            description: 'Primary brand color',
            category: 'theme',
            value: '#FACC15',
            type: 'string',
            defaultValue: '#FACC15',
            ui: { inputType: 'text', group: 'Colors', order: 1 }
        },
        {
            key: 'theme.logo_url',
            name: 'Logo URL',
            description: 'URL to your business logo',
            category: 'theme',
            value: '/images/idealphotography-logo.svg',
            type: 'url',
            defaultValue: '/images/idealphotography-logo.svg',
            ui: { inputType: 'url', group: 'Branding', order: 1 }
        }
    ];

    return this.insertMany(defaultSettings, { ordered: false });
};

export default mongoose.model('Settings', settingsSchema); 
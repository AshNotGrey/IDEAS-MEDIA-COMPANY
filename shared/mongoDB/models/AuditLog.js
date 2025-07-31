import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const auditLogSchema = new mongoose.Schema({
    // Action Information
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: [
            // User management
            'user.create', 'user.update', 'user.delete', 'user.verify', 'user.block', 'user.unblock',
            'user.login', 'user.logout', 'user.password_reset', 'user.email_verify',
            // Admin management
            'admin.create', 'admin.update', 'admin.delete', 'admin.permission_change',
            // Product management
            'product.create', 'product.update', 'product.delete', 'product.activate', 'product.deactivate',
            'inventory.adjust', 'inventory.reserve', 'inventory.release',
            // Order management
            'order.create', 'order.update', 'order.cancel', 'order.refund', 'order.fulfill',
            // Booking management
            'booking.create', 'booking.update', 'booking.cancel', 'booking.confirm', 'booking.complete',
            // Gallery management
            'gallery.create', 'gallery.update', 'gallery.delete', 'gallery.publish', 'gallery.unpublish',
            // Campaign management
            'campaign.create', 'campaign.update', 'campaign.delete', 'campaign.activate', 'campaign.deactivate',
            // Notification management
            'notification.send', 'notification.create', 'notification.delete',
            // Verification actions
            'verification.nin.approve', 'verification.nin.reject', 'verification.dl.approve', 'verification.dl.reject',
            // System actions
            'system.backup', 'system.restore', 'system.maintenance', 'system.config_change',
            // Security actions
            'security.login_attempt', 'security.account_lock', 'security.suspicious_activity',
            // Email actions
            'email.send', 'email.template_update', 'email.config_change',
            // Settings changes
            'settings.update', 'settings.theme_change', 'settings.integration_update'
        ]
    },

    // Actor Information
    actor: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userInfo: {
            name: String,
            email: String,
            role: String
        },
        type: {
            type: String,
            enum: ['user', 'system', 'admin', 'api'],
            default: 'user'
        },
        sessionId: String,
        ipAddress: String,
        userAgent: String
    },

    // Target Information
    target: {
        resourceType: {
            type: String,
            required: [true, 'Resource type is required'],
            enum: [
                'user', 'admin', 'product', 'order', 'booking', 'gallery',
                'service', 'review', 'campaign', 'notification', 'settings',
                'system', 'email', 'payment', 'verification'
            ]
        },
        resourceId: String, // ID of the resource being acted upon
        resourceName: String, // Name/title of the resource
        previousValues: mongoose.Schema.Types.Mixed, // Previous state before action
        newValues: mongoose.Schema.Types.Mixed // New state after action
    },

    // Result Information
    result: {
        status: {
            type: String,
            enum: ['success', 'failure', 'partial', 'pending'],
            required: [true, 'Result status is required']
        },
        message: String,
        errorCode: String,
        errorDetails: mongoose.Schema.Types.Mixed
    },

    // Context & Details
    details: {
        // Request information
        request: {
            method: String, // HTTP method or operation type
            url: String,
            endpoint: String,
            query: mongoose.Schema.Types.Mixed,
            body: mongoose.Schema.Types.Mixed
        },
        // Response information
        response: {
            statusCode: Number,
            data: mongoose.Schema.Types.Mixed
        },
        // Additional metadata
        metadata: {
            duration: Number, // Operation duration in ms
            fileSize: Number, // For file operations
            affectedRecords: Number, // For bulk operations
            customData: mongoose.Schema.Types.Mixed
        },
        // Business context
        reason: String, // Reason for the action
        description: String, // Detailed description
        category: {
            type: String,
            enum: ['authentication', 'authorization', 'business', 'technical', 'security', 'compliance'],
            default: 'technical'
        }
    },

    // Severity & Risk
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    riskLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none'
    },

    // Compliance & Security
    compliance: {
        gdprRelevant: { type: Boolean, default: false },
        piiInvolved: { type: Boolean, default: false },
        financialData: { type: Boolean, default: false },
        securityRelevant: { type: Boolean, default: false }
    },

    // Organization & Search
    tags: [String], // For categorization and search
    correlationId: String, // For grouping related actions
    parentLogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuditLog'
    },

    // UUID for references
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    },

    // Automatic expiry (30 days as mentioned in instructions)
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        index: { expireAfterSeconds: 0 }
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient queries
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ 'actor.user': 1, createdAt: -1 });
auditLogSchema.index({ 'target.resourceType': 1, 'target.resourceId': 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ 'result.status': 1 });
auditLogSchema.index({ correlationId: 1 });
auditLogSchema.index({ tags: 1 });
auditLogSchema.index({ uuid: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ expiresAt: 1 });

// Text search index
auditLogSchema.index({
    action: 'text',
    'details.reason': 'text',
    'details.description': 'text',
    'target.resourceName': 'text',
    tags: 'text'
});

// Virtuals
auditLogSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

auditLogSchema.virtual('timeUntilExpiry').get(function () {
    const now = new Date();
    const diffMs = this.expiresAt - now;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24))); // days
});

auditLogSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const diffMs = now - this.createdAt;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
auditLogSchema.pre('save', function (next) {
    // Auto-generate correlation ID if not provided
    if (!this.correlationId) {
        this.correlationId = this.uuid || uuidv4().replace(/-/g, '').substring(0, 16);
    }

    // Set security relevance based on action
    if (this.action.includes('security.') || this.action.includes('login') ||
        this.action.includes('password') || this.action.includes('permission')) {
        this.compliance.securityRelevant = true;
        this.riskLevel = this.riskLevel === 'none' ? 'medium' : this.riskLevel;
    }

    // Set GDPR relevance for user-related actions
    if (this.action.includes('user.') || this.action.includes('verification.')) {
        this.compliance.gdprRelevant = true;
        this.compliance.piiInvolved = true;
    }

    // Set financial data flag for payment/order actions
    if (this.action.includes('order.') || this.action.includes('payment.')) {
        this.compliance.financialData = true;
    }

    next();
});

// Methods
auditLogSchema.methods.extend = function (additionalDetails) {
    this.details = { ...this.details, ...additionalDetails };
    return this.save();
};

auditLogSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
        return this.save();
    }
    return Promise.resolve(this);
};

export default mongoose.model('AuditLog', auditLogSchema); 
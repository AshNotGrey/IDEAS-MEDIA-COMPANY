import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const notificationSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [100, 'Title must be less than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Message must be less than 500 characters']
    },
    summary: {
        type: String,
        maxlength: [200, 'Summary must be less than 200 characters']
    },

    // Notification Type & Category
    type: {
        type: String,
        enum: ['system', 'booking', 'payment', 'reminder', 'promotion', 'announcement', 'verification', 'security'],
        required: [true, 'Notification type is required']
    },
    category: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'urgent'],
        default: 'info'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Delivery Channels
    channels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    },

    // Recipients
    recipients: {
        // Specific users
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        // Role-based targeting
        roles: [{
            type: String,
            enum: ['client', 'admin', 'manager', 'super_admin']
        }],
        // Broadcast to all users
        broadcast: { type: Boolean, default: false },
        // Custom filters
        filters: {
            verifiedOnly: { type: Boolean, default: false },
            activeOnly: { type: Boolean, default: true },
            newUsers: { type: Boolean, default: false },
            hasBookings: { type: Boolean, default: false }
        }
    },

    // Content & Media
    content: {
        // Rich content for in-app notifications
        html: String,
        // Email specific content
        emailSubject: String,
        emailTemplate: String,
        // Action buttons
        actionButtons: [{
            text: String,
            action: String, // URL or action type
            style: {
                type: String,
                enum: ['primary', 'secondary', 'danger'],
                default: 'primary'
            }
        }],
        // Media attachments
        attachments: [{
            type: String,
            url: String,
            name: String
        }],
        // Icons and images
        icon: String, // Lucide icon name or URL
        image: String,
        avatar: String
    },

    // Scheduling & Delivery
    scheduling: {
        sendAt: {
            type: Date,
            default: Date.now
        },
        timezone: {
            type: String,
            default: 'Africa/Lagos'
        },
        // For recurring notifications
        isRecurring: { type: Boolean, default: false },
        recurrence: {
            type: String,
            enum: ['daily', 'weekly', 'monthly']
        },
        recurrenceEnd: Date,
        nextSendDate: Date
    },

    // Status & Delivery Tracking
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
        default: 'draft'
    },
    deliveryStatus: {
        inApp: {
            status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
            deliveredAt: Date,
            error: String
        },
        email: {
            status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
            deliveredAt: Date,
            error: String,
            opened: { type: Boolean, default: false },
            openedAt: Date
        },
        sms: {
            status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
            deliveredAt: Date,
            error: String
        },
        push: {
            status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
            deliveredAt: Date,
            error: String,
            clicked: { type: Boolean, default: false },
            clickedAt: Date
        }
    },

    // Analytics & Engagement
    analytics: {
        totalRecipients: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        // Engagement rates
        deliveryRate: { type: Number, default: 0 },
        openRate: { type: Number, default: 0 },
        clickRate: { type: Number, default: 0 }
    },

    // Behavior & Settings
    settings: {
        // Auto-dismiss settings
        autoDismiss: { type: Boolean, default: false },
        dismissAfter: { type: Number, default: 5000 }, // milliseconds
        // Persistence
        persistent: { type: Boolean, default: false },
        // Sound for push notifications
        sound: { type: String, default: 'default' },
        // Badge count
        badge: Number,
        // Grouping
        group: String,
        tag: String
    },

    // Related entities
    relatedEntity: {
        type: String,
        enum: ['booking', 'order', 'user', 'product', 'campaign'],
        ref: String // Could be ObjectId or UUID
    },

    // Admin fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,

    // UUID for references
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    },

    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    tags: [String]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
notificationSchema.virtual('isScheduled').get(function () {
    return this.scheduling.sendAt > new Date();
});

notificationSchema.virtual('isOverdue').get(function () {
    return this.scheduling.sendAt < new Date() && this.status === 'scheduled';
});

notificationSchema.virtual('recipientCount').get(function () {
    return this.recipients.users.length || this.analytics.totalRecipients;
});

// Indexes
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ 'recipients.users': 1 });
notificationSchema.index({ 'recipients.roles': 1 });
notificationSchema.index({ 'scheduling.sendAt': 1 });
notificationSchema.index({ createdBy: 1 });
notificationSchema.index({ uuid: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'analytics.delivered': -1 });

// Pre-save middleware
notificationSchema.pre('save', function (next) {
    // Calculate analytics rates
    if (this.analytics.totalRecipients > 0) {
        this.analytics.deliveryRate = (this.analytics.delivered / this.analytics.totalRecipients * 100);
    }

    if (this.analytics.delivered > 0) {
        this.analytics.openRate = (this.analytics.opened / this.analytics.delivered * 100);
        this.analytics.clickRate = (this.analytics.clicked / this.analytics.delivered * 100);
    }

    // Set next send date for recurring notifications
    if (this.scheduling.isRecurring && this.scheduling.recurrence) {
        const nextDate = new Date(this.scheduling.sendAt);

        switch (this.scheduling.recurrence) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }

        this.scheduling.nextSendDate = nextDate;
    }

    next();
});

// Methods
notificationSchema.methods.markAsDelivered = function (channel) {
    if (this.deliveryStatus[channel]) {
        this.deliveryStatus[channel].status = 'delivered';
        this.deliveryStatus[channel].deliveredAt = new Date();
        this.analytics.delivered += 1;
    }
    return this.save();
};

notificationSchema.methods.markAsFailed = function (channel, error) {
    if (this.deliveryStatus[channel]) {
        this.deliveryStatus[channel].status = 'failed';
        this.deliveryStatus[channel].error = error;
        this.analytics.failed += 1;
    }
    return this.save();
};

notificationSchema.methods.recordOpen = function (channel = 'email') {
    if (this.deliveryStatus[channel]) {
        this.deliveryStatus[channel].opened = true;
        this.deliveryStatus[channel].openedAt = new Date();
        this.analytics.opened += 1;
    }
    return this.save();
};

notificationSchema.methods.recordClick = function (channel = 'push') {
    if (this.deliveryStatus[channel]) {
        this.deliveryStatus[channel].clicked = true;
        this.deliveryStatus[channel].clickedAt = new Date();
        this.analytics.clicked += 1;
    }
    return this.save();
};

notificationSchema.methods.cancel = function () {
    this.status = 'cancelled';
    return this.save();
};

// Static methods
notificationSchema.statics.getPendingNotifications = function () {
    return this.find({
        status: 'scheduled',
        'scheduling.sendAt': { $lte: new Date() }
    }).populate('recipients.users', 'name email phone preferences');
};

notificationSchema.statics.getUserNotifications = function (userId, limit = 20) {
    return this.find({
        $or: [
            { 'recipients.users': userId },
            { 'recipients.broadcast': true }
        ],
        'channels.inApp': true,
        status: 'sent'
    })
        .sort({ createdAt: -1 })
        .limit(limit);
};

export default mongoose.model('Notification', notificationSchema); 
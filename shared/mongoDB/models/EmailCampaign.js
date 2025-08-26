import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema({
    // Campaign Identification
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Campaign Content
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate',
        required: [true, 'Email template is required']
    },
    customContent: {
        subject: String,
        htmlContent: String,
        textContent: String
    },

    // Campaign Configuration
    type: {
        type: String,
        enum: ['blast', 'drip', 'triggered', 'test'],
        default: 'blast'
    },
    category: {
        type: String,
        enum: ['marketing', 'announcement', 'newsletter', 'promotion', 'update', 'other'],
        default: 'marketing'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Recipient Configuration
    recipients: {
        // Static recipient lists
        emails: [String],

        // Dynamic recipient filters
        filters: {
            userType: {
                type: String,
                enum: ['all', 'clients', 'verified', 'unverified', 'active', 'inactive', 'custom']
            },
            registrationDate: {
                from: Date,
                to: Date
            },
            lastBookingDate: {
                from: Date,
                to: Date
            },
            totalBookings: {
                min: Number,
                max: Number
            },
            totalSpent: {
                min: Number,
                max: Number
            },
            location: [String],
            tags: [String],
            customQuery: String // MongoDB query string
        },

        // Exclusion filters
        exclude: {
            emails: [String],
            unsubscribed: {
                type: Boolean,
                default: true
            },
            bounced: {
                type: Boolean,
                default: true
            },
            inactive: {
                type: Boolean,
                default: false
            }
        }
    },

    // Scheduling
    scheduling: {
        type: {
            type: String,
            enum: ['immediate', 'scheduled', 'recurring'],
            default: 'immediate'
        },
        scheduledAt: Date,
        timezone: {
            type: String,
            default: 'UTC'
        },
        recurring: {
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
            },
            interval: {
                type: Number,
                default: 1
            },
            daysOfWeek: [Number], // 0-6 (Sunday to Saturday)
            dayOfMonth: Number,   // 1-31
            endDate: Date,
            maxOccurrences: Number
        }
    },

    // Campaign Status
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'],
        default: 'draft'
    },

    // Send Configuration
    sendOptions: {
        batchSize: {
            type: Number,
            default: 100
        },
        delayBetweenBatches: {
            type: Number,
            default: 60 // seconds
        },
        maxRetries: {
            type: Number,
            default: 3
        },
        personalization: {
            type: Boolean,
            default: true
        }
    },

    // A/B Testing
    abTest: {
        enabled: {
            type: Boolean,
            default: false
        },
        variants: [{
            name: String,
            percentage: Number, // 0-100
            subject: String,
            htmlContent: String,
            textContent: String
        }],
        testDuration: Number, // hours
        winnerMetric: {
            type: String,
            enum: ['open_rate', 'click_rate', 'conversion_rate'],
            default: 'open_rate'
        }
    },

    // Analytics and Tracking
    stats: {
        // Recipients
        totalRecipients: {
            type: Number,
            default: 0
        },
        sentCount: {
            type: Number,
            default: 0
        },
        deliveredCount: {
            type: Number,
            default: 0
        },
        bouncedCount: {
            type: Number,
            default: 0
        },
        failedCount: {
            type: Number,
            default: 0
        },

        // Engagement
        openedCount: {
            type: Number,
            default: 0
        },
        clickedCount: {
            type: Number,
            default: 0
        },
        unsubscribedCount: {
            type: Number,
            default: 0
        },

        // Revenue (if applicable)
        revenue: {
            type: Number,
            default: 0
        },
        conversions: {
            type: Number,
            default: 0
        },

        // Timing
        startedAt: Date,
        completedAt: Date,
        lastSentAt: Date
    },

    // Delivery Tracking
    deliveryLog: [{
        email: String,
        status: {
            type: String,
            enum: ['queued', 'sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked', 'unsubscribed']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageId: String,
        errorMessage: String,
        variant: String // For A/B testing
    }],

    // Campaign Management
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,

    // Approval workflow
    requiresApproval: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    rejectionReason: String,

    // Tags and organization
    tags: [String],
    notes: String

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
emailCampaignSchema.index({ status: 1, scheduledAt: 1 });
emailCampaignSchema.index({ createdBy: 1 });
emailCampaignSchema.index({ type: 1, category: 1 });
emailCampaignSchema.index({ 'scheduling.scheduledAt': 1 });
emailCampaignSchema.index({ tags: 1 });

// Virtuals
emailCampaignSchema.virtual('openRate').get(function () {
    if (this.stats.deliveredCount === 0) return 0;
    return ((this.stats.openedCount / this.stats.deliveredCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('clickRate').get(function () {
    if (this.stats.openedCount === 0) return 0;
    return ((this.stats.clickedCount / this.stats.openedCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('deliveryRate').get(function () {
    if (this.stats.sentCount === 0) return 0;
    return ((this.stats.deliveredCount / this.stats.sentCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('bounceRate').get(function () {
    if (this.stats.sentCount === 0) return 0;
    return ((this.stats.bouncedCount / this.stats.sentCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('unsubscribeRate').get(function () {
    if (this.stats.deliveredCount === 0) return 0;
    return ((this.stats.unsubscribedCount / this.stats.deliveredCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('conversionRate').get(function () {
    if (this.stats.clickedCount === 0) return 0;
    return ((this.stats.conversions / this.stats.clickedCount) * 100).toFixed(2);
});

emailCampaignSchema.virtual('duration').get(function () {
    if (!this.stats.startedAt || !this.stats.completedAt) return null;
    return this.stats.completedAt - this.stats.startedAt;
});

// Pre-save middleware
emailCampaignSchema.pre('save', function (next) {
    // Auto-approve campaigns that don't require approval
    if (this.isNew && !this.requiresApproval) {
        this.approvalStatus = 'approved';
        this.approvedAt = new Date();
        this.approvedBy = this.createdBy;
    }

    next();
});

// Methods
emailCampaignSchema.methods.buildRecipientList = async function () {
    // This would build the actual recipient list based on filters
    // Implementation would depend on your User model structure
    const recipients = [];

    // Add static emails
    if (this.recipients.emails && this.recipients.emails.length > 0) {
        recipients.push(...this.recipients.emails);
    }

    // Apply dynamic filters (this is a simplified version)
    if (this.recipients.filters.userType !== 'custom') {
        // Build MongoDB query based on filters
        const query = {};

        if (this.recipients.filters.userType === 'verified') {
            query.isVerified = true;
        } else if (this.recipients.filters.userType === 'active') {
            query.isActive = true;
        }

        // Add date filters, spending filters, etc.
        // const users = await User.find(query);
        // recipients.push(...users.map(u => u.email));
    }

    // Remove excluded emails
    const excluded = new Set(this.recipients.exclude.emails || []);

    return recipients.filter(email => !excluded.has(email));
};

emailCampaignSchema.methods.start = async function () {
    if (this.status !== 'scheduled' && this.status !== 'draft') {
        throw new Error('Campaign cannot be started in current status');
    }

    this.status = 'sending';
    this.stats.startedAt = new Date();

    return this.save();
};

emailCampaignSchema.methods.pause = async function () {
    if (this.status !== 'sending') {
        throw new Error('Only sending campaigns can be paused');
    }

    this.status = 'paused';
    return this.save();
};

emailCampaignSchema.methods.resume = async function () {
    if (this.status !== 'paused') {
        throw new Error('Only paused campaigns can be resumed');
    }

    this.status = 'sending';
    return this.save();
};

emailCampaignSchema.methods.complete = async function () {
    this.status = 'sent';
    this.stats.completedAt = new Date();

    return this.save();
};

emailCampaignSchema.methods.cancel = async function () {
    if (this.status === 'sent' || this.status === 'completed') {
        throw new Error('Cannot cancel completed campaign');
    }

    this.status = 'cancelled';
    return this.save();
};

emailCampaignSchema.methods.recordDelivery = function (email, status, messageId, errorMessage, variant) {
    // Add to delivery log
    this.deliveryLog.push({
        email,
        status,
        messageId,
        errorMessage,
        variant,
        timestamp: new Date()
    });

    // Update stats
    switch (status) {
        case 'sent':
            this.stats.sentCount += 1;
            break;
        case 'delivered':
            this.stats.deliveredCount += 1;
            break;
        case 'bounced':
            this.stats.bouncedCount += 1;
            break;
        case 'failed':
            this.stats.failedCount += 1;
            break;
        case 'opened':
            this.stats.openedCount += 1;
            break;
        case 'clicked':
            this.stats.clickedCount += 1;
            break;
        case 'unsubscribed':
            this.stats.unsubscribedCount += 1;
            break;
    }

    this.stats.lastSentAt = new Date();

    return this.save();
};

emailCampaignSchema.methods.approve = function (approvedBy, notes) {
    this.approvalStatus = 'approved';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    if (notes) this.notes = notes;

    return this.save();
};

emailCampaignSchema.methods.reject = function (rejectedBy, reason) {
    this.approvalStatus = 'rejected';
    this.rejectionReason = reason;
    this.status = 'cancelled';

    return this.save();
};

// Static methods
emailCampaignSchema.statics.findScheduled = function () {
    return this.find({
        status: 'scheduled',
        'scheduling.scheduledAt': { $lte: new Date() },
        approvalStatus: 'approved'
    });
};

emailCampaignSchema.statics.findActive = function () {
    return this.find({
        status: { $in: ['sending', 'scheduled'] }
    });
};

emailCampaignSchema.statics.getStats = function (dateRange = {}) {
    const matchQuery = {};

    if (dateRange.from || dateRange.to) {
        matchQuery.createdAt = {};
        if (dateRange.from) matchQuery.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) matchQuery.createdAt.$lte = new Date(dateRange.to);
    }

    return this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalCampaigns: { $sum: 1 },
                totalSent: { $sum: '$stats.sentCount' },
                totalDelivered: { $sum: '$stats.deliveredCount' },
                totalOpened: { $sum: '$stats.openedCount' },
                totalClicked: { $sum: '$stats.clickedCount' },
                totalRevenue: { $sum: '$stats.revenue' },
                avgOpenRate: { $avg: { $divide: ['$stats.openedCount', '$stats.deliveredCount'] } },
                avgClickRate: { $avg: { $divide: ['$stats.clickedCount', '$stats.openedCount'] } }
            }
        }
    ]);
};

export default mongoose.model('EmailCampaign', emailCampaignSchema);

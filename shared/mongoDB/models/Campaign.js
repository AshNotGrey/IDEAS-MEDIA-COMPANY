import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const campaignSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Campaign title is required'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    description: String,

    // Campaign Type
    type: {
        type: String,
        enum: ['hero_carousel', 'banner', 'popup', 'notification', 'theme_override'],
        required: [true, 'Campaign type is required']
    },

    // Placement & Display
    placement: {
        type: String,
        enum: ['home_hero', 'top_banner', 'sidebar', 'footer', 'popup_modal', 'notification_bar'],
        default: 'home_hero'
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Content & Media
    content: {
        // Hero carousel specific
        images: {
            desktop: String,
            mobile: String,
            tablet: String,
            thumbnail: String
        },
        // Text content
        headline: String,
        subheadline: String,
        bodyText: String,
        // Visual settings
        textColor: { type: String, default: '#FFFFFF' },
        backgroundColor: String,
        overlayOpacity: { type: Number, default: 0.3, min: 0, max: 1 },
        blur: { type: Number, default: 0.1, min: 0, max: 1 },
        // Custom CSS
        customStyles: String
    },

    // Call-to-Actions
    ctas: [{
        label: {
            type: String,
            required: [true, 'CTA label is required']
        },
        href: {
            type: String,
            required: [true, 'CTA link is required']
        },
        variant: {
            type: String,
            enum: ['primary', 'secondary', 'outline', 'ghost', 'whatsapp'],
            default: 'primary'
        },
        target: {
            type: String,
            enum: ['_self', '_blank'],
            default: '_self'
        },
        icon: String, // Lucide icon name
        position: {
            type: String,
            enum: ['left', 'center', 'right'],
            default: 'left'
        }
    }],

    // Scheduling
    schedule: {
        startDate: {
            type: Date,
            required: [true, 'Campaign start date is required']
        },
        endDate: Date,
        timezone: {
            type: String,
            default: 'Africa/Lagos'
        },
        // For recurring campaigns
        isRecurring: { type: Boolean, default: false },
        recurrence: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        recurrenceEnd: Date
    },

    // Status & Control
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
        default: 'draft'
    },
    isActive: { type: Boolean, default: false },
    autoActivate: { type: Boolean, default: true },
    autoDeactivate: { type: Boolean, default: true },

    // Targeting & Audience
    targeting: {
        userRoles: [{
            type: String,
            enum: ['client', 'admin', 'manager', 'super_admin']
        }],
        newUsers: { type: Boolean, default: false },
        returningUsers: { type: Boolean, default: false },
        verifiedUsers: { type: Boolean, default: false },
        // Geographic targeting (future feature)
        countries: [String],
        cities: [String]
    },

    // Theme Override (special campaign type)
    themeOverride: {
        enabled: { type: Boolean, default: false },
        colorScheme: {
            primary: String,
            secondary: String,
            accent: String,
            background: String,
            text: String
        },
        logo: String,
        favicon: String
    },

    // Analytics & Performance
    analytics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 }, // Click-through rate
        conversionRate: { type: Number, default: 0 },
        // CTA specific analytics
        ctaClicks: [{
            label: String,
            clicks: { type: Number, default: 0 }
        }]
    },

    // Settings & Configuration
    settings: {
        showOnMobile: { type: Boolean, default: true },
        showOnTablet: { type: Boolean, default: true },
        showOnDesktop: { type: Boolean, default: true },
        // Carousel specific
        autoPlay: { type: Boolean, default: true },
        interval: { type: Number, default: 5000 }, // milliseconds
        showDots: { type: Boolean, default: true },
        showArrows: { type: Boolean, default: true },
        // Banner specific
        dismissible: { type: Boolean, default: true },
        sticky: { type: Boolean, default: false },
        // Animation
        animation: {
            type: String,
            enum: ['fade', 'slide', 'zoom', 'none'],
            default: 'fade'
        },
        animationDuration: { type: Number, default: 500 }
    },

    // Admin fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    tags: [String],
    notes: String,
    version: { type: Number, default: 1 }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
campaignSchema.virtual('isScheduled').get(function () {
    const now = new Date();
    return this.schedule.startDate > now;
});

campaignSchema.virtual('isExpired').get(function () {
    if (!this.schedule.endDate) return false;
    return this.schedule.endDate < new Date();
});

campaignSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    const started = this.schedule.startDate <= now;
    const notExpired = !this.schedule.endDate || this.schedule.endDate > now;
    return this.isActive && started && notExpired;
});

campaignSchema.virtual('daysRemaining').get(function () {
    if (!this.schedule.endDate) return null;
    const now = new Date();
    const diffTime = this.schedule.endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

campaignSchema.virtual('ctr').get(function () {
    if (this.analytics.impressions === 0) return 0;
    return (this.analytics.clicks / this.analytics.impressions * 100).toFixed(2);
});

// Indexes
campaignSchema.index({ type: 1, placement: 1 });
campaignSchema.index({ status: 1, isActive: 1 });
campaignSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
campaignSchema.index({ priority: -1 });
campaignSchema.index({ uuid: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ createdAt: -1 });

// Pre-save middleware
campaignSchema.pre('save', function (next) {
    // Auto-set status based on dates and active flag
    const now = new Date();

    if (this.isActive) {
        if (this.schedule.startDate > now) {
            this.status = 'scheduled';
        } else if (!this.schedule.endDate || this.schedule.endDate > now) {
            this.status = 'active';
        } else {
            this.status = 'completed';
            this.isActive = false;
        }
    }

    // Calculate CTR
    if (this.analytics.impressions > 0) {
        this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions * 100);
    }

    // Calculate conversion rate
    if (this.analytics.clicks > 0) {
        this.analytics.conversionRate = (this.analytics.conversions / this.analytics.clicks * 100);
    }

    next();
});

// Methods
campaignSchema.methods.activate = function () {
    this.isActive = true;
    this.status = 'active';
    return this.save();
};

campaignSchema.methods.deactivate = function () {
    this.isActive = false;
    this.status = 'paused';
    return this.save();
};

campaignSchema.methods.recordImpression = function () {
    this.analytics.impressions += 1;
    return this.save();
};

campaignSchema.methods.recordClick = function (ctaLabel = null) {
    this.analytics.clicks += 1;

    // Record CTA-specific click
    if (ctaLabel) {
        const ctaAnalytics = this.analytics.ctaClicks.find(cta => cta.label === ctaLabel);
        if (ctaAnalytics) {
            ctaAnalytics.clicks += 1;
        } else {
            this.analytics.ctaClicks.push({ label: ctaLabel, clicks: 1 });
        }
    }

    return this.save();
};

campaignSchema.methods.recordConversion = function () {
    this.analytics.conversions += 1;
    return this.save();
};

// Static methods
campaignSchema.statics.getActiveCampaigns = function (type = null, placement = null) {
    const query = {
        isActive: true,
        'schedule.startDate': { $lte: new Date() },
        $or: [
            { 'schedule.endDate': { $exists: false } },
            { 'schedule.endDate': { $gt: new Date() } }
        ]
    };

    if (type) query.type = type;
    if (placement) query.placement = placement;

    return this.find(query).sort({ priority: -1, createdAt: -1 });
};

export default mongoose.model('Campaign', campaignSchema); 
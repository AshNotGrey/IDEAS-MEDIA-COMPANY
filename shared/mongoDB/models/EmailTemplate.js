import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
    // Template Identification
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Template slug is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Template Content
    subject: {
        type: String,
        required: [true, 'Email subject is required'],
        trim: true
    },
    htmlContent: {
        type: String,
        required: [true, 'HTML content is required']
    },
    textContent: {
        type: String,
        trim: true
    },

    // Template Configuration
    category: {
        type: String,
        enum: [
            'welcome', 'verification', 'booking', 'payment', 'reminder',
            'notification', 'marketing', 'announcement', 'system', 'custom'
        ],
        required: [true, 'Template category is required']
    },
    type: {
        type: String,
        enum: ['transactional', 'promotional', 'system'],
        default: 'transactional'
    },

    // Template Variables
    variables: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            enum: ['string', 'number', 'boolean', 'date', 'url', 'email'],
            default: 'string'
        },
        required: {
            type: Boolean,
            default: false
        },
        defaultValue: String
    }],

    // Template Settings
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },

    // Design Settings
    design: {
        theme: {
            type: String,
            enum: ['default', 'minimal', 'modern', 'corporate', 'creative'],
            default: 'default'
        },
        primaryColor: {
            type: String,
            default: '#A24CF3'
        },
        backgroundColor: {
            type: String,
            default: '#ffffff'
        },
        fontFamily: {
            type: String,
            default: 'Arial, sans-serif'
        },
        layout: {
            type: String,
            enum: ['single-column', 'two-column', 'sidebar'],
            default: 'single-column'
        }
    },

    // Automation Settings
    triggers: [{
        event: {
            type: String,
            enum: [
                'user_registered', 'user_verified', 'booking_created', 'booking_confirmed',
                'payment_received', 'payment_failed', 'reminder_due', 'verification_approved',
                'verification_rejected', 'account_locked', 'password_reset'
            ]
        },
        conditions: [{
            field: String,
            operator: {
                type: String,
                enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']
            },
            value: String
        }],
        delay: {
            value: Number,
            unit: {
                type: String,
                enum: ['minutes', 'hours', 'days'],
                default: 'minutes'
            }
        }
    }],

    // Delivery Settings
    delivery: {
        fromName: {
            type: String,
            default: 'Ideas Media Company'
        },
        fromEmail: {
            type: String,
            default: 'noreply@ideasphotography.com'
        },
        replyTo: String,
        bcc: [String],
        attachments: [{
            name: String,
            url: String,
            type: String
        }]
    },

    // Analytics
    stats: {
        sent: {
            type: Number,
            default: 0
        },
        delivered: {
            type: Number,
            default: 0
        },
        opened: {
            type: Number,
            default: 0
        },
        clicked: {
            type: Number,
            default: 0
        },
        bounced: {
            type: Number,
            default: 0
        },
        unsubscribed: {
            type: Number,
            default: 0
        },
        lastSent: Date
    },

    // Version Control
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        version: Number,
        content: {
            subject: String,
            htmlContent: String,
            textContent: String
        },
        modifiedAt: Date,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        changelog: String
    }],

    // Template Management
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    tags: [String],

    // Testing
    testRecipients: [String],
    lastTested: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
emailTemplateSchema.index({ slug: 1 });
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ type: 1 });
emailTemplateSchema.index({ createdBy: 1 });
emailTemplateSchema.index({ 'triggers.event': 1 });

// Virtuals
emailTemplateSchema.virtual('deliveryRate').get(function () {
    if (this.stats.sent === 0) return 0;
    return ((this.stats.delivered / this.stats.sent) * 100).toFixed(2);
});

emailTemplateSchema.virtual('openRate').get(function () {
    if (this.stats.delivered === 0) return 0;
    return ((this.stats.opened / this.stats.delivered) * 100).toFixed(2);
});

emailTemplateSchema.virtual('clickRate').get(function () {
    if (this.stats.opened === 0) return 0;
    return ((this.stats.clicked / this.stats.opened) * 100).toFixed(2);
});

emailTemplateSchema.virtual('bounceRate').get(function () {
    if (this.stats.sent === 0) return 0;
    return ((this.stats.bounced / this.stats.sent) * 100).toFixed(2);
});

// Pre-save middleware
emailTemplateSchema.pre('save', function (next) {
    // Generate slug from name if not provided
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Extract variables from content
    if (this.isModified('htmlContent') || this.isModified('subject')) {
        const variableRegex = /\{\{(\w+)\}\}/g;
        const foundVariables = new Set();

        // Find variables in subject
        let match;
        while ((match = variableRegex.exec(this.subject)) !== null) {
            foundVariables.add(match[1]);
        }

        // Find variables in HTML content
        variableRegex.lastIndex = 0;
        while ((match = variableRegex.exec(this.htmlContent)) !== null) {
            foundVariables.add(match[1]);
        }

        // Update variables array with found variables
        foundVariables.forEach(varName => {
            if (!this.variables.find(v => v.name === varName)) {
                this.variables.push({
                    name: varName,
                    type: 'string',
                    required: false
                });
            }
        });
    }

    next();
});

// Methods
emailTemplateSchema.methods.compile = function (variables = {}) {
    let compiledSubject = this.subject;
    let compiledHtmlContent = this.htmlContent;
    let compiledTextContent = this.textContent || '';

    // Replace variables in subject and content
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const value = variables[key] || '';

        compiledSubject = compiledSubject.replace(regex, value);
        compiledHtmlContent = compiledHtmlContent.replace(regex, value);
        compiledTextContent = compiledTextContent.replace(regex, value);
    });

    return {
        subject: compiledSubject,
        htmlContent: compiledHtmlContent,
        textContent: compiledTextContent,
        from: `${this.delivery.fromName} <${this.delivery.fromEmail}>`,
        replyTo: this.delivery.replyTo,
        bcc: this.delivery.bcc,
        attachments: this.delivery.attachments
    };
};

emailTemplateSchema.methods.createVersion = function (changelog = '') {
    // Save current version to history
    this.previousVersions.push({
        version: this.version,
        content: {
            subject: this.subject,
            htmlContent: this.htmlContent,
            textContent: this.textContent
        },
        modifiedAt: new Date(),
        modifiedBy: this.lastModifiedBy,
        changelog
    });

    // Increment version
    this.version += 1;

    // Keep only last 10 versions
    if (this.previousVersions.length > 10) {
        this.previousVersions = this.previousVersions.slice(-10);
    }

    return this.save();
};

emailTemplateSchema.methods.revertToVersion = function (versionNumber) {
    const version = this.previousVersions.find(v => v.version === versionNumber);
    if (!version) {
        throw new Error(`Version ${versionNumber} not found`);
    }

    this.subject = version.content.subject;
    this.htmlContent = version.content.htmlContent;
    this.textContent = version.content.textContent;

    return this.save();
};

emailTemplateSchema.methods.recordSent = function (count = 1) {
    this.stats.sent += count;
    this.stats.lastSent = new Date();
    return this.save();
};

emailTemplateSchema.methods.recordDelivered = function (count = 1) {
    this.stats.delivered += count;
    return this.save();
};

emailTemplateSchema.methods.recordOpened = function (count = 1) {
    this.stats.opened += count;
    return this.save();
};

emailTemplateSchema.methods.recordClicked = function (count = 1) {
    this.stats.clicked += count;
    return this.save();
};

emailTemplateSchema.methods.recordBounced = function (count = 1) {
    this.stats.bounced += count;
    return this.save();
};

// Static methods
emailTemplateSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug, isActive: true });
};

emailTemplateSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true }).sort({ priority: -1, name: 1 });
};

emailTemplateSchema.statics.findByTrigger = function (event) {
    return this.find({
        'triggers.event': event,
        isActive: true
    }).sort({ priority: -1 });
};

emailTemplateSchema.statics.getDefaultTemplate = function (category) {
    return this.findOne({
        category,
        isDefault: true,
        isActive: true
    });
};

emailTemplateSchema.statics.createDefault = function (templateData) {
    const defaultTemplates = [
        {
            name: 'Welcome Email',
            slug: 'welcome-email',
            description: 'Welcome new users to the platform',
            subject: 'Welcome to Ideas Media Company, {{name}}!',
            htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #A24CF3;">Welcome to Ideas Media Company!</h1>
          <p>Hi {{name}},</p>
          <p>Thank you for joining Ideas Media Company! We're excited to have you as part of our community.</p>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Browse our photography services</li>
            <li>Book equipment rentals</li>
            <li>Access your personal gallery</li>
            <li>Manage your bookings</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Ideas Media Company Team</p>
        </div>
      `,
            textContent: `Welcome to Ideas Media Company!

Hi {{name}},

Thank you for joining Ideas Media Company! We're excited to have you as part of our community.

Your account has been successfully created. You can now:
- Browse our photography services
- Book equipment rentals
- Access your personal gallery
- Manage your bookings

If you have any questions, feel free to contact our support team.

Best regards,
The Ideas Media Company Team`,
            category: 'welcome',
            isDefault: true,
            variables: [
                { name: 'name', description: 'User\'s name', type: 'string', required: true },
                { name: 'email', description: 'User\'s email', type: 'email', required: true }
            ]
        },
        {
            name: 'Booking Confirmation',
            slug: 'booking-confirmation',
            description: 'Confirm booking details to users',
            subject: 'Booking Confirmation - {{bookingId}}',
            htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #A24CF3;">Booking Confirmed!</h1>
          <p>Hi {{customerName}},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> {{bookingId}}</p>
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Date:</strong> {{bookingDate}}</p>
            <p><strong>Time:</strong> {{bookingTime}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Total Amount:</strong> ₦{{totalAmount}}</p>
          </div>
          <p>We'll send you a reminder closer to your booking date.</p>
          <p>Best regards,<br>The Ideas Media Company Team</p>
        </div>
      `,
            category: 'booking',
            isDefault: true,
            variables: [
                { name: 'customerName', description: 'Customer name', type: 'string', required: true },
                { name: 'bookingId', description: 'Booking ID', type: 'string', required: true },
                { name: 'serviceName', description: 'Service name', type: 'string', required: true },
                { name: 'bookingDate', description: 'Booking date', type: 'date', required: true },
                { name: 'bookingTime', description: 'Booking time', type: 'string', required: true },
                { name: 'duration', description: 'Service duration', type: 'string', required: true },
                { name: 'totalAmount', description: 'Total amount', type: 'number', required: true }
            ]
        },
        {
            name: 'ID Verification Status',
            slug: 'id-verification-status',
            description: 'Notify users about ID verification status',
            subject: 'ID Verification {{status}} - Ideas Media Company',
            htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #A24CF3;">ID Verification {{status}}</h1>
          <p>Hi {{name}},</p>
          {{#if approved}}
          <p style="color: #28a745;">Great news! Your ID verification has been approved.</p>
          <p>You now have full access to all our services and can make bookings without restrictions.</p>
          {{else}}
          <p style="color: #dc3545;">Unfortunately, your ID verification was not approved.</p>
          <p><strong>Reason:</strong> {{reason}}</p>
          <p>Please upload a new ID document following our guidelines and try again.</p>
          {{/if}}
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Ideas Media Company Team</p>
        </div>
      `,
            category: 'verification',
            isDefault: true,
            variables: [
                { name: 'name', description: 'User name', type: 'string', required: true },
                { name: 'status', description: 'Verification status', type: 'string', required: true },
                { name: 'approved', description: 'Whether approved', type: 'boolean', required: true },
                { name: 'reason', description: 'Rejection reason', type: 'string', required: false }
            ]
        }
    ];

    return this.insertMany(defaultTemplates, { ordered: false });
};

export default mongoose.model('EmailTemplate', emailTemplateSchema);

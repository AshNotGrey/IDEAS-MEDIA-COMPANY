import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    // File Information
    filename: {
        type: String,
        required: [true, 'Filename is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: [true, 'Original filename is required'],
        trim: true
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required']
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required']
    },

    // Cloudinary Information
    cloudinaryId: {
        type: String,
        required: [true, 'Cloudinary public ID is required'],
        unique: true
    },
    url: {
        type: String,
        required: [true, 'File URL is required']
    },
    secureUrl: {
        type: String,
        required: [true, 'Secure URL is required']
    },

    // File Type and Category
    type: {
        type: String,
        enum: ['image', 'video', 'document', 'audio', 'other'],
        required: [true, 'File type is required']
    },
    category: {
        type: String,
        enum: [
            'gallery', 'service_image', 'profile_image', 'thumbnail',
            'document', 'logo', 'banner', 'portfolio', 'equipment',
            'verification', 'email_template', 'other'
        ],
        default: 'other'
    },

    // Image-specific metadata (if applicable)
    dimensions: {
        width: Number,
        height: Number
    },
    format: String,

    // Organization
    folder: {
        type: String,
        default: 'uploads'
    },
    tags: [String],
    alt: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Access Control
    isPublic: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Usage Tracking
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: Date,
    usedBy: [{
        model: {
            type: String,
            enum: ['Gallery', 'Service', 'User', 'Admin', 'Settings', 'EmailTemplate']
        },
        modelId: mongoose.Schema.Types.ObjectId,
        field: String, // Which field uses this media
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Upload Information
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'uploaderModel',
        required: [true, 'Uploader is required']
    },
    uploaderModel: {
        type: String,
        enum: ['User', 'Admin'],
        required: [true, 'Uploader model is required']
    },

    // Transformations (for images)
    transformations: {
        thumbnail: String,
        medium: String,
        large: String,
        optimized: String
    },

    // SEO and Metadata
    seo: {
        title: String,
        keywords: [String],
        caption: String
    },

    // Version Control
    version: {
        type: Number,
        default: 1
    },
    originalMedia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    },

    // Status
    status: {
        type: String,
        enum: ['uploading', 'processing', 'ready', 'failed', 'archived'],
        default: 'ready'
    },

    // Expiry (for temporary files)
    expiresAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
mediaSchema.index({ cloudinaryId: 1 });
mediaSchema.index({ type: 1, category: 1 });
mediaSchema.index({ uploadedBy: 1, uploaderModel: 1 });
mediaSchema.index({ isActive: 1, isPublic: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ status: 1 });
mediaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtuals
mediaSchema.virtual('fileExtension').get(function () {
    return this.originalName ? this.originalName.split('.').pop().toLowerCase() : '';
});

mediaSchema.virtual('isImage').get(function () {
    return this.type === 'image';
});

mediaSchema.virtual('isVideo').get(function () {
    return this.type === 'video';
});

mediaSchema.virtual('isDocument').get(function () {
    return this.type === 'document';
});

mediaSchema.virtual('formattedSize').get(function () {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Static methods
mediaSchema.statics.findByCategory = function (category, options = {}) {
    const query = { category, isActive: true };
    if (options.isPublic !== undefined) {
        query.isPublic = options.isPublic;
    }

    return this.find(query)
        .populate('uploadedBy', 'name username email')
        .sort(options.sort || '-createdAt')
        .limit(options.limit || 50);
};

mediaSchema.statics.findByUploader = function (uploaderId, uploaderModel = 'User') {
    return this.find({
        uploadedBy: uploaderId,
        uploaderModel,
        isActive: true
    }).sort('-createdAt');
};

mediaSchema.statics.getUsageStats = function () {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                avgSize: { $avg: '$fileSize' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Instance methods
mediaSchema.methods.recordUsage = function (modelName, modelId, field) {
    this.usageCount += 1;
    this.lastUsed = new Date();

    const usage = {
        model: modelName,
        modelId: modelId,
        field: field,
        usedAt: new Date()
    };

    // Add to usedBy array (keep only last 10 usage records)
    this.usedBy.unshift(usage);
    if (this.usedBy.length > 10) {
        this.usedBy = this.usedBy.slice(0, 10);
    }

    return this.save();
};

mediaSchema.methods.generateTransformations = function () {
    if (!this.isImage) return null;

    const baseUrl = this.url.replace('/upload/', '/upload/');

    return {
        thumbnail: baseUrl.replace('/upload/', '/upload/c_thumb,w_150,h_150/'),
        medium: baseUrl.replace('/upload/', '/upload/c_scale,w_500/'),
        large: baseUrl.replace('/upload/', '/upload/c_scale,w_1200/'),
        optimized: baseUrl.replace('/upload/', '/upload/f_auto,q_auto/')
    };
};

mediaSchema.methods.updateTags = function (newTags) {
    this.tags = [...new Set([...this.tags, ...newTags])]; // Merge and deduplicate
    return this.save();
};

// Pre-save middleware
mediaSchema.pre('save', function (next) {
    // Auto-generate transformations for images
    if (this.isImage && this.isModified('url')) {
        this.transformations = this.generateTransformations();
    }

    // Determine file type from mime type if not set
    if (!this.type && this.mimeType) {
        if (this.mimeType.startsWith('image/')) {
            this.type = 'image';
        } else if (this.mimeType.startsWith('video/')) {
            this.type = 'video';
        } else if (this.mimeType.startsWith('audio/')) {
            this.type = 'audio';
        } else if (this.mimeType.includes('pdf') || this.mimeType.includes('document')) {
            this.type = 'document';
        } else {
            this.type = 'other';
        }
    }

    next();
});

// Post-remove middleware to clean up Cloudinary
mediaSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.cloudinaryId) {
        try {
            // Import cloudinary dynamically to avoid circular dependencies
            const { v2: cloudinary } = await import('cloudinary');
            await cloudinary.uploader.destroy(doc.cloudinaryId);
        } catch (error) {
            console.error('Failed to delete file from Cloudinary:', error);
        }
    }
});

export default mongoose.model('Media', mediaSchema);

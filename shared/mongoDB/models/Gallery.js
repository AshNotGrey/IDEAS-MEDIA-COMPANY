import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Gallery title is required'] },
    description: String,
    category: {
        type: String,
        enum: ['portrait', 'wedding', 'event', 'commercial', 'fashion', 'landscape', 'product'],
        required: [true, 'Category is required']
    },
    images: [{
        url: { type: String, required: true },
        caption: String,
        alt: String,
        order: { type: Number, default: 0 }
    }],
    coverImage: String,
    isPublished: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    tags: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Add indexes
gallerySchema.index({ category: 1, isPublished: 1 });
gallerySchema.index({ featured: 1 });
gallerySchema.index({ createdAt: -1 });

export default mongoose.model('Gallery', gallerySchema); 
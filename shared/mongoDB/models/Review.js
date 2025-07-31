import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    title: String,
    comment: { type: String, required: [true, 'Review comment is required'] },
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    images: [String], // review images
    response: {
        text: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    }
}, { timestamps: true });

// Indexes
reviewSchema.index({ product: 1, isPublished: 1 });
reviewSchema.index({ service: 1, isPublished: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema); 
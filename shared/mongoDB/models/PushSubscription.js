import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    },
    subscription: { type: Object, required: true },
    userAgent: { type: String },
    isActive: { type: Boolean, default: true },
    lastSentAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

pushSubscriptionSchema.index({ user: 1, isActive: 1 });

pushSubscriptionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('PushSubscription', pushSubscriptionSchema);



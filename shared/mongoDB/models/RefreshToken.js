import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    // Either admin or user must be present (backward compatible: previously admin was required)
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    token: { type: String, required: true, index: true },
    revoked: { type: Boolean, default: false },
    replacedByToken: { type: String },
    expiresAt: { type: Date, required: true },
    ip: { type: String },
    userAgent: { type: String },
    // Device metadata (Phase 3)
    deviceId: { type: String },
    deviceName: { type: String },
    platform: { type: String },
    browser: { type: String },
    lastUsedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure either admin or user is set
refreshTokenSchema.pre('validate', function (next) {
    if (!this.admin && !this.user) {
        this.invalidate('user', 'Either admin or user must be set');
    }
    next();
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);



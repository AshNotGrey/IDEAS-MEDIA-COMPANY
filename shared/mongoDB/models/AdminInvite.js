import mongoose from 'mongoose';

const adminInviteSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    role: { type: String, enum: ['admin', 'manager'], default: 'admin' },
    permissions: [{ type: String }],
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    usedAt: { type: Date }
}, { timestamps: true });

adminInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AdminInvite', adminInviteSchema);



import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    type: { type: String, enum: ['booking', 'order', 'other'], default: 'other' },
    provider: { type: String, enum: ['paystack'], default: 'paystack' },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NGN' },

    status: { type: String, enum: ['initialized', 'success', 'failed', 'pending', 'abandoned'], default: 'initialized' },
    gatewayResponse: { type: String },

    paidAt: { type: Date },
    metadata: { type: Object, default: {} },
}, { timestamps: true });

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ booking: 1 });
transactionSchema.index({ order: 1 });

export default mongoose.model('Transaction', transactionSchema);



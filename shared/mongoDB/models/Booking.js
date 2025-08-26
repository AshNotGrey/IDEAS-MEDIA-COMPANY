import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    date: { type: Date, required: [true, 'Booking date is required'] },
    time: { type: String, required: [true, 'Booking time is required'] },
    duration: { type: Number, required: [true, 'Duration is required'] }, // in hours
    location: {
        type: { type: String, enum: ['studio', 'outdoor', 'client_location'], default: 'studio' },
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: { type: Number, required: [true, 'Total amount is required'], min: 0 },
    paid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'online'] },
    notes: String,
    specialRequests: [String],
    contactInfo: {
        phone: String,
        email: String,
        alternateContact: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    }
}, { timestamps: true });

// Add indexes for efficient queries
bookingSchema.index({ client: 1, date: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ product: 1 });

export default mongoose.model('Booking', bookingSchema); 
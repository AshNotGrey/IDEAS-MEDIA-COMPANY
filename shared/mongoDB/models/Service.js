import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Service name is required'] },
    description: { type: String, required: [true, 'Description is required'] },
    category: {
        type: String,
        enum: ['portrait', 'wedding', 'event', 'commercial', 'fashion', 'landscape', 'product'],
        required: [true, 'Category is required']
    },
    basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
    priceStructure: {
        type: { type: String, enum: ['fixed', 'hourly', 'per_photo', 'package'], default: 'fixed' },
        additionalHourRate: Number,
        packageDetails: String
    },
    duration: {
        min: { type: Number, default: 1 }, // minimum hours
        max: { type: Number, default: 8 }  // maximum hours
    },
    includes: [String], // what's included in the service
    addOns: [{
        name: String,
        description: String,
        price: Number
    }],
    equipment: [String], // equipment used/provided
    deliverables: {
        photos: {
            digital: { type: Number, default: 0 }, // number of digital photos
            prints: { type: Number, default: 0 }   // number of prints
        },
        editedPhotos: { type: Number, default: 0 },
        deliveryTime: { type: String, default: '7-14 days' },
        format: [{ type: String, enum: ['jpeg', 'raw', 'png'], default: 'jpeg' }]
    },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    images: [String], // portfolio images for this service
    tags: [String]
}, { timestamps: true });

// Add text index for search
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Service', serviceSchema); 
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const productSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description must be less than 200 characters']
    },

    // Product Type & Category
    type: {
        type: String,
        enum: ['equipment_rental', 'mini_mart_sale', 'service_package'],
        required: [true, 'Product type is required']
    },
    category: {
        type: String,
        enum: [
            // Equipment categories
            'cameras', 'lenses', 'tripods', 'lighting', 'audio', 'accessories',
            'stabilizers', 'filters', 'memory_cards', 'batteries', 'bags',
            // Mini-mart categories  
            'prints', 'frames', 'albums', 'props', 'backdrops', 'merchandise',
            'gift_items', 'stationery', 'art_supplies',
            // Service packages
            'photography_package', 'videography_package', 'editing_package'
        ],
        required: [true, 'Category is required']
    },
    subcategory: String,

    // Pricing
    pricing: {
        // For equipment rentals
        rentalPrice: {
            hourly: Number,
            daily: { type: Number, min: 0 },
            weekly: Number,
            monthly: Number
        },
        // For sales
        salePrice: { type: Number, min: 0 },
        compareAtPrice: Number, // original price for discounts
        costPrice: Number, // for admin use
        currency: { type: String, default: 'NGN' }
    },

    // Inventory Management
    inventory: {
        // For equipment rentals
        totalUnits: { type: Number, default: 1 },
        availableUnits: { type: Number, default: 1 },
        reservedUnits: { type: Number, default: 0 },
        // For sales
        stockQuantity: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        trackInventory: { type: Boolean, default: true },
        allowBackorder: { type: Boolean, default: false },
        // Asset tracking for equipment
        serialNumbers: [String],
        condition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'needs_repair'],
            default: 'excellent'
        }
    },

    // Technical Specifications (mainly for equipment)
    specifications: {
        brand: String,
        model: String,
        year: Number,
        weight: String,
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: { type: String, default: 'cm' }
        },
        // Camera specific
        megapixels: Number,
        sensor: String,
        mount: String,
        // Lens specific
        focalLength: String,
        aperture: String,
        // General specs
        customSpecs: [{
            name: String,
            value: String
        }]
    },

    // Media
    images: {
        thumbnail: String,
        gallery: [String],
        videos: [String]
    },

    // Content & Features
    features: [String],
    whatsIncluded: [String],
    requirements: [String],
    usageInstructions: String,

    // SEO & Organization
    tags: [String],
    sku: {
        type: String,
        unique: true,
        default: () => 'PROD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    },
    barcode: String,

    // Availability & Rules
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isDigital: { type: Boolean, default: false },

    // Rental specific rules
    rentalRules: {
        minRentalPeriod: { type: Number, default: 1 }, // hours
        maxRentalPeriod: { type: Number, default: 720 }, // 30 days in hours
        securityDeposit: Number,
        advanceBookingDays: { type: Number, default: 30 },
        cancellationPolicy: String,
        lateReturnFee: Number,
        damagePolicy: String
    },

    // Shipping & Pickup (for sales)
    shipping: {
        isShippable: { type: Boolean, default: false }, // HQ pickup only initially
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        handlingTime: { type: Number, default: 1 } // days
    },

    // Analytics & Performance
    analytics: {
        viewCount: { type: Number, default: 0 },
        rentalCount: { type: Number, default: 0 },
        purchaseCount: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    },

    // Relationships
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    bundleProducts: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: { type: Number, default: 1 },
        discount: Number
    }],

    // Admin fields
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // UUID for references
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    },

    // Discounts & Promotions
    discount: {
        type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        value: { type: Number, default: 0 },
        startDate: Date,
        endDate: Date,
        isActive: { type: Boolean, default: false }
    },

    // Quality & Maintenance (for equipment)
    maintenance: {
        lastServiced: Date,
        nextServiceDue: Date,
        serviceHistory: [{
            date: Date,
            description: String,
            cost: Number,
            technician: String
        }],
        warrantyExpiry: Date
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
productSchema.virtual('finalPrice').get(function () {
    if (this.type === 'equipment_rental') {
        return this.pricing.rentalPrice?.daily || 0;
    }

    if (this.discount.isActive && this.discount.endDate > new Date()) {
        const price = this.pricing.salePrice || 0;
        if (this.discount.type === 'percentage') {
            return price * (1 - this.discount.value / 100);
        } else {
            return Math.max(0, price - this.discount.value);
        }
    }

    return this.pricing.salePrice || 0;
});

productSchema.virtual('isInStock').get(function () {
    if (this.type === 'equipment_rental') {
        return this.inventory.availableUnits > 0;
    }
    return this.inventory.stockQuantity > 0 || !this.inventory.trackInventory;
});

productSchema.virtual('isLowStock').get(function () {
    return this.inventory.stockQuantity <= this.inventory.lowStockThreshold;
});

productSchema.virtual('totalRentalValue').get(function () {
    return this.analytics.rentalCount * (this.pricing.rentalPrice?.daily || 0);
});

// Indexes for efficient queries
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ type: 1, category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'pricing.salePrice': 1 });
productSchema.index({ 'pricing.rentalPrice.daily': 1 });
productSchema.index({ sku: 1 });
productSchema.index({ uuid: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'analytics.averageRating': -1 });
productSchema.index({ 'analytics.rentalCount': -1 });
productSchema.index({ 'analytics.purchaseCount': -1 });

// Pre-save middleware
productSchema.pre('save', function (next) {
    // Ensure available units don't exceed total units for equipment
    if (this.type === 'equipment_rental') {
        if (this.inventory.availableUnits > this.inventory.totalUnits) {
            this.inventory.availableUnits = this.inventory.totalUnits;
        }
        // Calculate reserved units
        this.inventory.reservedUnits = this.inventory.totalUnits - this.inventory.availableUnits;
    }

    // Auto-generate SKU if not provided
    if (!this.sku) {
        this.sku = 'PROD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    next();
});

// Methods
productSchema.methods.adjustInventory = function (quantity, operation = 'subtract') {
    if (this.type === 'mini_mart_sale' && this.inventory.trackInventory) {
        if (operation === 'add') {
            this.inventory.stockQuantity += quantity;
        } else {
            this.inventory.stockQuantity = Math.max(0, this.inventory.stockQuantity - quantity);
        }
    }
    return this.save();
};

productSchema.methods.reserveEquipment = function (quantity = 1) {
    if (this.type === 'equipment_rental' && this.inventory.availableUnits >= quantity) {
        this.inventory.availableUnits -= quantity;
        this.inventory.reservedUnits += quantity;
        return this.save();
    }
    throw new Error('Not enough units available for reservation');
};

productSchema.methods.releaseEquipment = function (quantity = 1) {
    if (this.type === 'equipment_rental') {
        this.inventory.availableUnits += quantity;
        this.inventory.reservedUnits = Math.max(0, this.inventory.reservedUnits - quantity);
        return this.save();
    }
};

productSchema.methods.incrementView = function () {
    this.analytics.viewCount += 1;
    return this.save();
};

export default mongoose.model('Product', productSchema); 
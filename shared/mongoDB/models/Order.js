import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderSchema = new mongoose.Schema({
    // Order Identification
    orderNumber: {
        type: String,
        unique: true,
        default: () => 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    },
    uuid: {
        type: String,
        default: () => uuidv4().replace(/-/g, '').substring(0, 32),
        unique: true
    },

    // Customer Information
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },
    customerInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        // Verification status at time of order
        verificationStatus: {
            nin: { type: String, enum: ['verified', 'pending', 'not_submitted'], default: 'not_submitted' },
            driversLicense: { type: String, enum: ['verified', 'pending', 'not_submitted'], default: 'not_submitted' }
        }
    },

    // Referrer Information (required for checkout)
    referrerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
        relationship: { type: String, required: true }
    },

    // Order Type & Items
    orderType: {
        type: String,
        enum: ['rental', 'purchase', 'booking', 'mixed'],
        required: [true, 'Order type is required']
    },

    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        // Product snapshot at time of order
        productInfo: {
            name: String,
            sku: String,
            type: String, // equipment_rental, mini_mart_sale, service_package
            category: String,
            images: {
                thumbnail: String
            }
        },

        // Quantity & Pricing
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        discount: {
            type: { type: String, enum: ['percentage', 'fixed'] },
            value: { type: Number, default: 0 },
            reason: String
        },
        subtotal: { type: Number, required: true, min: 0 },

        // Rental specific fields
        rentalPeriod: {
            startDate: Date,
            endDate: Date,
            duration: Number, // hours
            pickupTime: String,
            returnTime: String
        },

        // Service booking specific
        serviceDetails: {
            date: Date,
            time: String,
            duration: Number,
            location: {
                type: { type: String, enum: ['studio', 'outdoor', 'client_location'] },
                address: String,
                coordinates: {
                    lat: Number,
                    lng: Number
                }
            },
            specialRequests: [String]
        },

        // Item status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'returned', 'cancelled'],
            default: 'pending'
        }
    }],

    // Pricing Breakdown
    pricing: {
        subtotal: { type: Number, required: true, min: 0 },
        discountTotal: { type: Number, default: 0, min: 0 },
        taxTotal: { type: Number, default: 0, min: 0 }, // For future use
        shippingTotal: { type: Number, default: 0, min: 0 }, // Currently 0 (HQ pickup only)
        securityDeposit: { type: Number, default: 0, min: 0 }, // For equipment rentals
        total: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'NGN' }
    },

    // Order Status & Workflow
    status: {
        type: String,
        enum: [
            'cart', 'checkout', 'payment_pending', 'payment_failed', 'payment_confirmed',
            'processing', 'ready_for_pickup', 'in_progress', 'completed', 'cancelled', 'refunded'
        ],
        default: 'cart'
    },
    workflow: {
        placedAt: Date,
        confirmedAt: Date,
        preparedAt: Date,
        deliveredAt: Date,
        completedAt: Date,
        cancelledAt: Date
    },

    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ['paystack', 'bank_transfer', 'cash', 'partial'],
            required: function () { return this.status !== 'cart'; }
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending'
        },
        // Paystack integration
        paystack: {
            reference: String,
            accessCode: String,
            authorizationUrl: String,
            transactionId: String,
            paidAt: Date
        },
        // Payment breakdown
        amounts: {
            paid: { type: Number, default: 0 },
            refunded: { type: Number, default: 0 },
            pending: { type: Number, default: 0 }
        },
        transactionHistory: [{
            type: { type: String, enum: ['payment', 'refund', 'chargeback'] },
            amount: Number,
            reference: String,
            date: { type: Date, default: Date.now },
            notes: String
        }]
    },

    // Fulfillment & Logistics
    fulfillment: {
        method: {
            type: String,
            enum: ['pickup', 'delivery'], // Currently only pickup
            default: 'pickup'
        },
        location: {
            type: String,
            default: 'HQ' // Headquarters pickup only initially
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: { type: String, default: 'Nigeria' },
            postalCode: String
        },
        // Pickup/delivery scheduling
        scheduledDate: Date,
        scheduledTime: String,
        actualDate: Date,
        actualTime: String,
        // Instructions
        instructions: String,
        notes: String
    },

    // Communication & Notifications
    communications: [{
        type: { type: String, enum: ['email', 'sms', 'call', 'whatsapp'] },
        content: String,
        sentAt: { type: Date, default: Date.now },
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Analytics & Tracking
    analytics: {
        source: String, // where the order came from
        campaign: String,
        device: String,
        browser: String,
        // Time tracking
        timeToCheckout: Number, // minutes in cart before checkout
        timeToPayment: Number, // minutes from checkout to payment
        timeToFulfillment: Number // hours from payment to fulfillment
    },

    // Admin & Management
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff member handling the order
    },
    tags: [String],
    internalNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: { type: Date, default: Date.now }
    }],

    // Receipt & Documentation
    receipt: {
        generated: { type: Boolean, default: false },
        generatedAt: Date,
        url: String, // PDF URL
        emailSent: { type: Boolean, default: false },
        emailSentAt: Date
    },

    // Cancellation & Returns
    cancellation: {
        reason: String,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancelledAt: Date,
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'failed']
        }
    },

    // Equipment Return Tracking (for rentals)
    returns: {
        expectedReturnDate: Date,
        actualReturnDate: Date,
        condition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'damaged']
        },
        damageNotes: String,
        extraCharges: [{
            reason: String,
            amount: Number
        }],
        depositReturned: { type: Boolean, default: false },
        depositReturnedAt: Date
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('isOverdue').get(function () {
    if (this.orderType !== 'rental') return false;
    const now = new Date();
    return this.items.some(item =>
        item.rentalPeriod && item.rentalPeriod.endDate < now && !this.returns.actualReturnDate
    );
});

orderSchema.virtual('canBeCancelled').get(function () {
    return ['cart', 'checkout', 'payment_pending', 'payment_confirmed', 'processing'].includes(this.status);
});

orderSchema.virtual('needsVerification').get(function () {
    return this.orderType === 'rental' &&
        (this.customerInfo.verificationStatus.nin !== 'verified' &&
            this.customerInfo.verificationStatus.driversLicense !== 'verified');
});

// Indexes
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ uuid: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'fulfillment.scheduledDate': 1 });
orderSchema.index({ assignedTo: 1 });

// Pre-save middleware
orderSchema.pre('save', function (next) {
    // Calculate totals
    this.pricing.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
    this.pricing.discountTotal = this.items.reduce((total, item) => {
        if (item.discount && item.discount.value) {
            if (item.discount.type === 'percentage') {
                return total + (item.unitPrice * item.quantity * item.discount.value / 100);
            } else {
                return total + item.discount.value;
            }
        }
        return total;
    }, 0);

    // Calculate final total
    this.pricing.total = this.pricing.subtotal - this.pricing.discountTotal +
        this.pricing.taxTotal + this.pricing.shippingTotal +
        this.pricing.securityDeposit;

    // Set workflow timestamps
    if (this.isModified('status')) {
        const now = new Date();
        switch (this.status) {
            case 'checkout':
                if (!this.workflow.placedAt) this.workflow.placedAt = now;
                break;
            case 'payment_confirmed':
                if (!this.workflow.confirmedAt) this.workflow.confirmedAt = now;
                break;
            case 'ready_for_pickup':
                if (!this.workflow.preparedAt) this.workflow.preparedAt = now;
                break;
            case 'in_progress':
                if (!this.workflow.deliveredAt) this.workflow.deliveredAt = now;
                break;
            case 'completed':
                if (!this.workflow.completedAt) this.workflow.completedAt = now;
                break;
            case 'cancelled':
                if (!this.workflow.cancelledAt) this.workflow.cancelledAt = now;
                break;
        }
    }

    next();
});

// Methods
orderSchema.methods.addItem = function (productId, quantity, unitPrice, options = {}) {
    const existingItem = this.items.find(item =>
        item.product.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
        this.items.push({
            product: productId,
            quantity,
            unitPrice,
            subtotal: quantity * unitPrice,
            ...options
        });
    }

    return this.save();
};

orderSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(item =>
        item.product.toString() !== productId.toString()
    );
    return this.save();
};

orderSchema.methods.updateItemQuantity = function (productId, quantity) {
    const item = this.items.find(item =>
        item.product.toString() === productId.toString()
    );

    if (item) {
        item.quantity = quantity;
        item.subtotal = item.quantity * item.unitPrice;
    }

    return this.save();
};

orderSchema.methods.proceedToCheckout = function () {
    this.status = 'checkout';
    return this.save();
};

orderSchema.methods.confirmPayment = function (paymentDetails) {
    this.status = 'payment_confirmed';
    this.payment.status = 'completed';
    if (paymentDetails.paystack) {
        this.payment.paystack = { ...this.payment.paystack, ...paymentDetails.paystack };
    }
    return this.save();
};

orderSchema.methods.cancel = function (reason, cancelledBy) {
    this.status = 'cancelled';
    this.cancellation = {
        reason,
        cancelledBy,
        cancelledAt: new Date()
    };
    return this.save();
};

// Static methods
orderSchema.statics.getActiveCart = function (customerId) {
    return this.findOne({ customer: customerId, status: 'cart' });
};

orderSchema.statics.getOverdueRentals = function () {
    const now = new Date();
    return this.find({
        orderType: { $in: ['rental', 'mixed'] },
        status: 'in_progress',
        'items.rentalPeriod.endDate': { $lt: now },
        'returns.actualReturnDate': { $exists: false }
    });
};

export default mongoose.model('Order', orderSchema); 
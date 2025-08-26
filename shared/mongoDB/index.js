import mongoose from 'mongoose';

// Import all models
import User from './models/User.js';
import Admin from './models/Admin.js';
import AdminInvite from './models/AdminInvite.js';
import RefreshToken from './models/RefreshToken.js';
import Product from './models/Product.js';
import Booking from './models/Booking.js';
import Service from './models/Service.js';
import Gallery from './models/Gallery.js';
import Review from './models/Review.js';
import Campaign from './models/Campaign.js';
import Notification from './models/Notification.js';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import AuditLog from './models/AuditLog.js';
import Settings from './models/Settings.js';
import PushSubscription from './models/PushSubscription.js';
import Media from './models/Media.js';
import EmailTemplate from './models/EmailTemplate.js';
import EmailCampaign from './models/EmailCampaign.js';

// Database connection helper
const connectDB = async (uri, options = {}) => {
    try {
        const defaultOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(uri, { ...defaultOptions, ...options });
        console.log('✅ MongoDB connected successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

// Database initialization helper
const initializeDB = async () => {
    try {
        // Create default settings if they don't exist
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await Settings.createDefaults();
            console.log('✅ Default settings created');
        }

        // TODO: Temporarily disable index creation to avoid conflicts
        // Create indexes for all models
        // await Promise.all([
        //     User.createIndexes(),
        //     Product.createIndexes(),
        //     Booking.createIndexes(),
        //     Service.createIndexes(),
        //     Gallery.createIndexes(),
        //     Review.createIndexes(),
        //     Campaign.createIndexes(),
        //     Notification.createIndexes(),
        //     Order.createIndexes(),
        //     AuditLog.createIndexes(),
        //     Settings.createIndexes()
        // ]);

        // Seed first super admin if configured and none exists
        const hasAnyAdmin = await Admin.countDocuments();
        const defaultUser = process.env.DEFAULT_ADMIN_USER;
        const defaultPass = process.env.DEFAULT_ADMIN_PASS;
        if (!hasAnyAdmin && defaultUser && defaultPass) {
            const admin = await Admin.create({
                username: String(defaultUser).trim(),
                password: String(defaultPass),
                role: 'super_admin',
                permissions: ['admins.manage'],
                isVerified: true,
                isActive: true
            });
            console.log(`✅ Seeded default super admin '${admin.username}'`);
        }

        console.log('✅ Database initialized (indexes skipped for development)');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};

export {
    mongoose,
    connectDB,
    initializeDB
};

export const models = {
    User,
    Admin,
    AdminInvite,
    RefreshToken,
    Product,
    Booking,
    Service,
    Gallery,
    Review,
    Campaign,
    Notification,
    Order,
    Transaction,
    AuditLog,
    Settings,
    PushSubscription,
    Media,
    EmailTemplate,
    EmailCampaign,
};

// Convenience exports for common operations
export const utils = {
    // Create audit log entry
    createAuditLog: (action, actor, target, result, details = {}) => {
        return AuditLog.create({
            action,
            actor,
            target,
            result,
            details,
            category: details.category || 'technical'
        });
    },

    // Get setting value
    getSetting: (key, defaultValue = null) => {
        return Settings.get(key, defaultValue);
    },

    // Set setting value
    setSetting: (key, value, changedBy, reason = '') => {
        return Settings.set(key, value, changedBy, reason);
    },

    // Send notification
    sendNotification: async (notificationData) => {
        const notification = await Notification.create(notificationData);
        // TODO: Integrate with actual notification delivery system
        return notification;
    }
}; 
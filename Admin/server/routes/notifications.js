import express from 'express';
import webpush from 'web-push';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '../config/env.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY || '' });
});

router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }
        const payload = {
            user: req.user?._id || null,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            subscription,
            userAgent: req.headers['user-agent'] || ''
        };
        // Fallback if shared model not linked at runtime in this context
        const mongoose = models.mongoose || (await import('@ideal-photography/shared/mongoDB/index.js')).mongoose;
        const PushModel = mongoose.models.PushSubscription || mongoose.model('PushSubscription', new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
            endpoint: { type: String, required: true, unique: true },
            keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } },
            subscription: { type: Object, required: true },
            userAgent: String,
            isActive: { type: Boolean, default: true },
            lastSentAt: Date
        }, { timestamps: true }));
        const existing = await PushModel.findOne({ endpoint: subscription.endpoint });
        const saved = existing
            ? await PushModel.findOneAndUpdate({ endpoint: subscription.endpoint }, payload, { new: true })
            : await PushModel.create(payload);
        return res.json({ ok: true, id: saved._id });
    } catch (err) {
        console.error('Admin subscribe error', err);
        return res.status(500).json({ error: 'Failed to save subscription' });
    }
});

export default router;



import express from 'express';
import webpush from 'web-push';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { requireAuth } from '../middleware/auth.js';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '../config/env.js';

const router = express.Router();

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY || '' });
});

// Save or update a push subscription
router.post('/subscribe', requireAuth, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }

        // Get PushSubscription model from shared if available, else define locally as fallback
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
        const payload = {
            user: req.user?._id || null,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            subscription,
            userAgent: req.headers['user-agent'] || ''
        };

        const saved = existing
            ? await PushModel.findOneAndUpdate({ endpoint: subscription.endpoint }, payload, { new: true })
            : await PushModel.create(payload);

        return res.json({ ok: true, id: saved._id });
    } catch (err) {
        console.error('Subscribe error', err);
        return res.status(500).json({ error: 'Failed to save subscription' });
    }
});

// Unsubscribe
router.post('/unsubscribe', requireAuth, async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
        const mongoose = models.mongoose || (await import('@ideal-photography/shared/mongoDB/index.js')).mongoose;
        const PushModel = mongoose.models.PushSubscription || mongoose.model('PushSubscription');
        await PushModel.updateOne({ endpoint }, { $set: { isActive: false } });
        return res.json({ ok: true });
    } catch (err) {
        console.error('Unsubscribe error', err);
        return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Test send (auth required)
router.post('/send', requireAuth, async (req, res) => {
    try {
        const { title = 'Test', body = 'Hello from IDEAS', url = '/' } = req.body || {};
        const mongoose = models.mongoose || (await import('@ideal-photography/shared/mongoDB/index.js')).mongoose;
        const PushModel = mongoose.models.PushSubscription || mongoose.model('PushSubscription');
        const subs = await PushModel.find({ user: req.user._id, isActive: true });
        const payload = JSON.stringify({ title, body, url });
        const results = [];
        for (const sub of subs) {
            try {
                const r = await webpush.sendNotification(sub.subscription, payload);
                results.push({ endpoint: sub.endpoint, status: r.statusCode });
            } catch (e) {
                results.push({ endpoint: sub.endpoint, error: e.message });
            }
        }
        return res.json({ ok: true, results });
    } catch (err) {
        console.error('Send error', err);
        return res.status(500).json({ error: 'Failed to send notifications' });
    }
});

export default router;



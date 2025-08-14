import express from 'express';
import crypto from 'crypto';
import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { PAYSTACK_SECRET_KEY } from '../config/env.js';

const router = express.Router();

// Health/status
router.get('/status', (req, res) => {
    res.json({
        message: 'Webhook service is available'
    });
});

// Paystack webhook (raw body recommended; ensure upstream middleware does not alter body)
// Use raw body to compute signature; must be mounted before global json middleware
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.get('x-paystack-signature');
        if (!signature) return res.sendStatus(400);
        const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
        const computed = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY || '')
            .update(rawBody, 'utf8')
            .digest('hex');

        if (computed !== signature) {
            return res.sendStatus(401);
        }
        const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const event = parsed?.event;
        if (event === 'charge.success') {
            const data = parsed?.data || {};
            const reference = data.reference;
            const amountKobo = data.amount;
            const currency = data.currency || 'NGN';
            const status = data.status || 'success';
            const paidAt = data.paid_at || data.paidAt || new Date().toISOString();
            const metadata = data.metadata || {};

            const normalized = {
                reference,
                status,
                amount: amountKobo / 100,
                currency,
                paidAt,
                metadata
            };

            // Upsert Transaction by reference
            if (models.Order) {
                // If there is a Transaction model in shared, use it; otherwise attach to Order/Booking as needed
            }

            // If booking info available, mark as paid/confirmed
            const propId = metadata.propId;
            if (propId && models.Booking) {
                await models.Booking.updateOne(
                    { _id: propId },
                    { $set: { paymentStatus: 'paid', bookingStatus: 'confirmed' } }
                );
            }
        }

        return res.sendStatus(200);
    } catch (err) {
        // Always 200 to avoid retries on our own internal failures, but log the error
        console.error('Paystack webhook error:', err);
        return res.sendStatus(200);
    }
});

export default router; 
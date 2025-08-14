import { models } from '@ideal-photography/shared/mongoDB/index.js';
import { toKobo, genReference, verifyTransaction } from '../utils/payments/paystack.js';

/**
 * Initialize a Paystack payment for a booking
 * Input: { propId }
 */
export async function initPayment(req, res) {
    try {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });
        const { propId, orderId } = req.body || {};
        if (!propId && !orderId) return res.status(400).json({ error: 'propId or orderId is required' });

        let amountNaira = 0;
        let currency = 'NGN';
        let reference;
        let txPayload = {
            user: req.user._id,
            provider: 'paystack',
            status: 'initialized',
            metadata: { userId: req.user._id }
        };

        if (propId) {
            const booking = await models.Booking.findById(propId);
            if (!booking) return res.status(404).json({ error: 'Booking not found' });
            if (booking.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Unauthorized booking access' });
            }
            amountNaira = booking.totalAmount;
            currency = 'NGN';
            reference = genReference({ propId, userId: req.user._id });
            txPayload = { ...txPayload, booking: booking._id, type: 'booking', amount: amountNaira, currency, metadata: { ...txPayload.metadata, propId } };
        }

        if (orderId) {
            const order = await models.Order.findById(orderId);
            if (!order) return res.status(404).json({ error: 'Order not found' });
            if (order.customer.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Unauthorized order access' });
            }
            amountNaira = order.pricing?.total ?? 0;
            currency = order.pricing?.currency || 'NGN';
            reference = genReference({ propId: orderId, userId: req.user._id });
            txPayload = { ...txPayload, order: order._id, type: 'order', amount: amountNaira, currency, metadata: { ...txPayload.metadata, orderId } };
        }

        await models.Transaction.findOneAndUpdate(
            { reference },
            { reference, ...txPayload },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.json({
            publicKey: process.env.PAYSTACK_PUBLIC_KEY,
            email: req.user.email,
            amountKobo: toKobo(amountNaira),
            currency,
            reference,
            meta: txPayload.metadata
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to init payment', message: err.message });
    }
}

/**
 * Verify a Paystack transaction by reference
 * Input: { reference }
 */
export async function verifyPayment(req, res) {
    try {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });
        const { reference } = req.body || {};
        if (!reference) return res.status(400).json({ error: 'reference is required' });

        const normalized = await verifyTransaction(reference);

        // Authorization check: ensure transaction belongs to requester
        const existing = await models.Transaction.findOne({ reference });
        if (existing && existing.user && existing.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Idempotent upsert by reference
        const tx = await models.Transaction.findOneAndUpdate(
            { reference },
            {
                status: normalized.status === 'success' ? 'success' : normalized.status,
                amount: normalized.amount,
                currency: normalized.currency,
                paidAt: normalized.paidAt || new Date(),
                gatewayResponse: normalized.gatewayResponse,
                metadata: normalized.metadata
            },
            { new: true }
        );

        // If booking exists and payment success, mark confirmed/paid
        if (tx && tx.booking && normalized.status === 'success') {
            await models.Booking.updateOne(
                { _id: tx.booking },
                { $set: { paid: true, status: 'confirmed' } }
            );
        }

        // If order exists and payment success, mark order paid/confirmed
        if (tx && tx.order && normalized.status === 'success') {
            const paystackUpdate = {
                status: 'payment_confirmed',
                'payment.status': 'completed',
                'payment.paystack.reference': tx.reference,
                'payment.paystack.paidAt': normalized.paidAt ? new Date(normalized.paidAt) : new Date(),
                'payment.amounts.paid': normalized.amount,
            };
            await models.Order.updateOne({ _id: tx.order }, { $set: paystackUpdate, $push: { 'payment.transactionHistory': { type: 'payment', amount: normalized.amount, reference: tx.reference, date: new Date() } } });
        }

        return res.json({ status: normalized.status, transaction: tx });
    } catch (err) {
        return res.status(500).json({ error: 'Verification failed', message: err.message });
    }
}



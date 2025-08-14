import { PAYSTACK_SECRET_KEY } from '../../config/env.js';

export const toKobo = (naira) => Math.round(Number(naira || 0) * 100);
export const fromKobo = (kobo) => Number(kobo || 0) / 100;

export const genReference = ({ propId, userId }) => `EVT_${propId}_${userId}_${Date.now()}`;

export async function verifyTransaction(reference) {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const json = await res.json();
    const data = json?.data || {};
    return {
        status: data.status || json.status ? 'success' : 'failed',
        amount: fromKobo(data.amount),
        currency: data.currency || 'NGN',
        paidAt: data.paid_at || data.paidAt,
        metadata: data.metadata,
        gatewayResponse: data.gateway_response || json.message,
        raw: json
    };
}



import express from 'express';
import { initPayment, verifyPayment } from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/init', requireAuth, initPayment);
router.post('/verify', requireAuth, verifyPayment);

export default router;



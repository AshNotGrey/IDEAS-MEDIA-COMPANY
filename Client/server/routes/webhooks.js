import express from 'express';

const router = express.Router();

// Placeholder webhook routes
router.get('/status', (req, res) => {
    res.json({
        message: 'Webhook service is available'
    });
});

export default router; 
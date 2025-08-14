import express from 'express';
import { CLOUDINARY_CLOUD_NAME } from '../config/env.js';

const router = express.Router();

// Placeholder upload routes
router.get('/status', (req, res) => {
    res.json({
        message: 'Upload service is available',
        cloudinary: CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured'
    });
});

export default router; 
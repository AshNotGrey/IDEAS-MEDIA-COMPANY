import express from 'express';

const router = express.Router();

// Placeholder upload routes
router.get('/status', (req, res) => {
    res.json({
        message: 'Upload service is available',
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured'
    });
});

export default router; 
import express from 'express';

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({ message: 'Admin webhook service is available' });
});

export default router;



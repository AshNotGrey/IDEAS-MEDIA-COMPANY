import express from 'express';

const router = express.Router();

// Placeholder auth routes
// These will be fully implemented when integrating with GraphQL resolvers

router.get('/status', (req, res) => {
    res.json({
        message: 'Auth service is available',
        authenticated: !!req.user,
        user: req.user ? {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        } : null
    });
});

export default router; 
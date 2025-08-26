import express from 'express';
import {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    deactivateCampaign,
    approveCampaign,
    duplicateCampaign,
    scheduleCampaign,
    unscheduleCampaign,
    getActiveCampaigns,
    getScheduledCampaigns,
    getCampaignsByPlacement,
    getCampaignsByType,
    recordImpression,
    recordClick,
    recordConversion,
    getCampaignAnalytics,
    bulkUpdateCampaigns,
    bulkDeleteCampaigns,
    getTargetedCampaigns,
    uploadCampaignImages
} from '../controllers/campaign.controller.js';

const router = express.Router();

// Apply rate limiting to campaign creation and updates
import { RateLimiterMemory } from 'rate-limiter-flexible';
const campaignLimiter = new RateLimiterMemory({
    keyPrefix: 'campaign_ops',
    points: 20,
    duration: 60
});

const campaignRateLimit = async (req, res, next) => {
    try {
        await campaignLimiter.consume(req.ip);
        return next();
    } catch (rej) {
        return res.status(429).json({
            error: 'Too Many Campaign Operations',
            retryAfter: Math.round(rej.msBeforeNext / 1000)
        });
    }
};

// ============================================================================
// CAMPAIGN CRUD OPERATIONS
// ============================================================================

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns with filtering and pagination
 * @access  Public (for viewing campaigns)
 */
router.get('/', getCampaigns);

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Public (for viewing campaigns)
 */
router.get('/:id', getCampaignById);

/**
 * @route   POST /api/campaigns
 * @desc    Create new campaign
 * @access  Private (authenticated users)
 */
router.post('/', campaignRateLimit, createCampaign);

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update campaign
 * @access  Private (campaign creator or admin)
 */
router.put('/:id', campaignRateLimit, updateCampaign);

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete campaign
 * @access  Private (campaign creator or admin)
 */
router.delete('/:id', deleteCampaign);

// ============================================================================
// CAMPAIGN STATUS MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/campaigns/:id/activate
 * @desc    Activate campaign
 * @access  Private (campaign creator or admin)
 */
router.post('/:id/activate', activateCampaign);

/**
 * @route   POST /api/campaigns/:id/deactivate
 * @desc    Deactivate campaign
 * @access  Private (campaign creator or admin)
 */
router.post('/:id/deactivate', deactivateCampaign);

/**
 * @route   POST /api/campaigns/:id/approve
 * @desc    Approve campaign (admin only)
 * @access  Private (admin, manager, super_admin)
 */
router.post('/:id/approve', approveCampaign);

// ============================================================================
// CAMPAIGN SCHEDULING
// ============================================================================

/**
 * @route   POST /api/campaigns/:id/schedule
 * @desc    Schedule campaign
 * @access  Private (campaign creator or admin)
 */
router.post('/:id/schedule', scheduleCampaign);

/**
 * @route   POST /api/campaigns/:id/unschedule
 * @desc    Unschedule campaign
 * @access  Private (campaign creator or admin)
 */
router.post('/:id/unschedule', unscheduleCampaign);

// ============================================================================
// CAMPAIGN DUPLICATION
// ============================================================================

/**
 * @route   POST /api/campaigns/:id/duplicate
 * @desc    Duplicate campaign
 * @access  Private (authenticated users)
 */
router.post('/:id/duplicate', duplicateCampaign);

// ============================================================================
// CAMPAIGN QUERIES BY STATUS/TYPE
// ============================================================================

/**
 * @route   GET /api/campaigns/active
 * @desc    Get active campaigns
 * @access  Public
 */
router.get('/active', getActiveCampaigns);

/**
 * @route   GET /api/campaigns/scheduled
 * @desc    Get scheduled campaigns
 * @access  Public
 */
router.get('/scheduled', getScheduledCampaigns);

/**
 * @route   GET /api/campaigns/placement/:placement
 * @desc    Get campaigns by placement
 * @access  Public
 */
router.get('/placement/:placement', getCampaignsByPlacement);

/**
 * @route   GET /api/campaigns/type/:type
 * @desc    Get campaigns by type
 * @access  Public
 */
router.get('/type/:type', getCampaignsByType);

// ============================================================================
// CAMPAIGN ANALYTICS & TRACKING
// ============================================================================

/**
 * @route   POST /api/campaigns/:id/impression
 * @desc    Record campaign impression
 * @access  Public
 */
router.post('/:id/impression', recordImpression);

/**
 * @route   POST /api/campaigns/:id/click
 * @desc    Record campaign click
 * @access  Public
 */
router.post('/:id/click', recordClick);

/**
 * @route   POST /api/campaigns/:id/conversion
 * @desc    Record campaign conversion
 * @access  Public
 */
router.post('/:id/conversion', recordConversion);

/**
 * @route   GET /api/campaigns/:id/analytics
 * @desc    Get campaign analytics
 * @access  Public
 */
router.get('/:id/analytics', getCampaignAnalytics);

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @route   PUT /api/campaigns/bulk-update
 * @desc    Bulk update campaigns
 * @access  Private (authenticated users)
 */
router.put('/bulk-update', bulkUpdateCampaigns);

/**
 * @route   DELETE /api/campaigns/bulk-delete
 * @desc    Bulk delete campaigns
 * @access  Private (authenticated users)
 */
router.delete('/bulk-delete', bulkDeleteCampaigns);

// ============================================================================
// USER-SPECIFIC CAMPAIGNS
// ============================================================================

/**
 * @route   GET /api/campaigns/targeted
 * @desc    Get targeted campaigns for authenticated user
 * @access  Private (authenticated users)
 */
router.get('/targeted', getTargetedCampaigns);

// ============================================================================
// MEDIA MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/campaigns/:id/upload-images
 * @desc    Upload campaign images
 * @access  Private (campaign creator or admin)
 */
router.post('/:id/upload-images', uploadCampaignImages);

// ============================================================================
// ROUTE PARAMETER VALIDATION MIDDLEWARE
// ============================================================================

// Validate campaign ID parameter
router.param('id', (req, res, next, id) => {
    // Check if ID is a valid MongoDB ObjectId
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid campaign ID',
            message: 'Campaign ID must be a valid MongoDB ObjectId'
        });
    }
    next();
});

// Validate placement parameter
router.param('placement', (req, res, next, placement) => {
    const validPlacements = [
        'hero', 'top-banner', 'sidebar', 'footer', 'popup',
        'notification', 'modal', 'overlay', 'inline'
    ];

    if (!validPlacements.includes(placement)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid placement',
            message: `Placement must be one of: ${validPlacements.join(', ')}`
        });
    }
    next();
});

// Validate type parameter
router.param('type', (req, res, next, type) => {
    const validTypes = [
        'hero-carousel', 'banner', 'popup', 'notification',
        'theme-override', 'promotional', 'announcement'
    ];

    if (!validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid campaign type',
            message: `Type must be one of: ${validTypes.join(', ')}`
        });
    }
    next();
});

export default router;

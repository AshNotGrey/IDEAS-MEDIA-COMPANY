import { models } from '@ideal-photography/shared/mongoDB/index.js';
import campaignService from '@ideal-photography/shared/services/campaign.service.js';

/**
 * Campaign Controller
 * Handles all REST API endpoints for campaign management
 */

/**
 * Get all campaigns with filtering and pagination
 * GET /api/campaigns
 */
export async function getCampaigns(req, res) {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 20,
            type,
            placement,
            status,
            isActive,
            isScheduled,
            isExpired,
            createdBy,
            tags,
            sort = 'priority',
            order = 'desc'
        } = req.query;

        // Build filters
        const filters = {};
        if (type) filters.type = type;
        if (placement) filters.placement = placement;
        if (status) filters.status = status;
        if (isActive !== undefined) filters.isActive = isActive === 'true';
        if (isScheduled !== undefined) filters.isScheduled = isScheduled === 'true';
        if (isExpired !== undefined) filters.isExpired = isExpired === 'true';
        if (createdBy) filters.createdBy = createdBy;
        if (tags) filters.tags = tags.split(',');

        // Build sort options
        const sortOptions = {};
        if (sort === 'priority') {
            sortOptions.priority = order === 'desc' ? -1 : 1;
        } else if (sort === 'createdAt') {
            sortOptions.createdAt = order === 'desc' ? -1 : 1;
        } else if (sort === 'startDate') {
            sortOptions['schedule.startDate'] = order === 'desc' ? -1 : 1;
        } else if (sort === 'name') {
            sortOptions.name = order === 'desc' ? -1 : 1;
        }

        // Get campaigns using service
        const result = await campaignService.getCampaigns(filters, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
            populate: true
        });

        res.json({
            success: true,
            data: result.campaigns,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campaigns',
            message: error.message
        });
    }
}

/**
 * Get campaign by ID
 * GET /api/campaigns/:id
 */
export async function getCampaignById(req, res) {
    try {
        const { id } = req.params;

        const campaign = await campaignService.getCampaignById(id);

        res.json({
            success: true,
            data: campaign
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch campaign',
                message: error.message
            });
        }
    }
}

/**
 * Create new campaign
 * POST /api/campaigns
 */
export async function createCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const campaignData = req.body;

        // Create campaign using service
        const campaign = await campaignService.createCampaign(campaignData, req.user._id);

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to create campaign',
                message: error.message
            });
        }
    }
}

/**
 * Update campaign
 * PUT /api/campaigns/:id
 */
export async function updateCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;
        const updateData = req.body;

        // Check if user can edit this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to edit this campaign'
            });
        }

        // Update campaign using service
        const updatedCampaign = await campaignService.updateCampaign(id, updateData, req.user._id);

        res.json({
            success: true,
            message: 'Campaign updated successfully',
            data: updatedCampaign
        });
    } catch (error) {
        console.error('Error updating campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else if (error.message.includes('required') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to update campaign',
                message: error.message
            });
        }
    }
}

/**
 * Delete campaign
 * DELETE /api/campaigns/:id
 */
export async function deleteCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;

        // Check if user can delete this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to delete this campaign'
            });
        }

        // Delete campaign using service
        const deletedCampaign = await campaignService.deleteCampaign(id, req.user._id);

        res.json({
            success: true,
            message: 'Campaign deleted successfully',
            data: deletedCampaign
        });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else if (error.message.includes('active campaign')) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete active campaign',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete campaign',
                message: error.message
            });
        }
    }
}

/**
 * Activate campaign
 * POST /api/campaigns/:id/activate
 */
export async function activateCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;

        // Check if user can activate this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to activate this campaign'
            });
        }

        // Activate campaign using service
        const activatedCampaign = await campaignService.activateCampaign(id, req.user._id);

        res.json({
            success: true,
            message: 'Campaign activated successfully',
            data: activatedCampaign
        });
    } catch (error) {
        console.error('Error activating campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else if (error.message.includes('approved') || error.message.includes('start date')) {
            res.status(400).json({
                success: false,
                error: 'Cannot activate campaign',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to activate campaign',
                message: error.message
            });
        }
    }
}

/**
 * Deactivate campaign
 * POST /api/campaigns/:id/deactivate
 */
export async function deactivateCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;

        // Check if user can deactivate this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to deactivate this campaign'
            });
        }

        // Deactivate campaign using service
        const deactivatedCampaign = await campaignService.deactivateCampaign(id, req.user._id);

        res.json({
            success: true,
            message: 'Campaign deactivated successfully',
            data: deactivatedCampaign
        });
    } catch (error) {
        console.error('Error deactivating campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to deactivate campaign',
                message: error.message
            });
        }
    }
}

/**
 * Approve campaign
 * POST /api/campaigns/:id/approve
 */
export async function approveCampaign(req, res) {
    try {
        // Require authentication and admin role
        req.requireAuth();
        req.requireRole(['admin', 'manager', 'super_admin']);

        const { id } = req.params;

        // Approve campaign using service
        const approvedCampaign = await campaignService.approveCampaign(id, req.user._id);

        res.json({
            success: true,
            message: 'Campaign approved successfully',
            data: approvedCampaign
        });
    } catch (error) {
        console.error('Error approving campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to approve campaign',
                message: error.message
            });
        }
    }
}

/**
 * Duplicate campaign
 * POST /api/campaigns/:id/duplicate
 */
export async function duplicateCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;

        // Duplicate campaign using service
        const duplicatedCampaign = await campaignService.duplicateCampaign(id, req.user._id);

        res.status(201).json({
            success: true,
            message: 'Campaign duplicated successfully',
            data: duplicatedCampaign
        });
    } catch (error) {
        console.error('Error duplicating campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to duplicate campaign',
                message: error.message
            });
        }
    }
}

/**
 * Schedule campaign
 * POST /api/campaigns/:id/schedule
 */
export async function scheduleCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;
        const scheduleData = req.body;

        // Check if user can schedule this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to schedule this campaign'
            });
        }

        // Schedule campaign using service
        const scheduledCampaign = await campaignService.scheduleCampaign(id, scheduleData, req.user._id);

        res.json({
            success: true,
            message: 'Campaign scheduled successfully',
            data: scheduledCampaign
        });
    } catch (error) {
        console.error('Error scheduling campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else if (error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: 'Invalid schedule data',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to schedule campaign',
                message: error.message
            });
        }
    }
}

/**
 * Unschedule campaign
 * POST /api/campaigns/:id/unschedule
 */
export async function unscheduleCampaign(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;

        // Check if user can unschedule this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to unschedule this campaign'
            });
        }

        // Unschedule campaign using service
        const unscheduledCampaign = await campaignService.unscheduleCampaign(id, req.user._id);

        res.json({
            success: true,
            message: 'Campaign unscheduled successfully',
            data: unscheduledCampaign
        });
    } catch (error) {
        console.error('Error unscheduling campaign:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to unschedule campaign',
                message: error.message
            });
        }
    }
}

/**
 * Get active campaigns
 * GET /api/campaigns/active
 */
export async function getActiveCampaigns(req, res) {
    try {
        const { limit = 50 } = req.query;

        const campaigns = await campaignService.getActiveCampaigns({
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Error fetching active campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active campaigns',
            message: error.message
        });
    }
}

/**
 * Get scheduled campaigns
 * GET /api/campaigns/scheduled
 */
export async function getScheduledCampaigns(req, res) {
    try {
        const { limit = 50 } = req.query;

        const campaigns = await campaignService.getScheduledCampaigns({
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Error fetching scheduled campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scheduled campaigns',
            message: error.message
        });
    }
}

/**
 * Get campaigns by placement
 * GET /api/campaigns/placement/:placement
 */
export async function getCampaignsByPlacement(req, res) {
    try {
        const { placement } = req.params;
        const { limit = 20 } = req.query;

        const campaigns = await campaignService.getCampaignsByPlacement(placement, {
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Error fetching campaigns by placement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campaigns by placement',
            message: error.message
        });
    }
}

/**
 * Get campaigns by type
 * GET /api/campaigns/type/:type
 */
export async function getCampaignsByType(req, res) {
    try {
        const { type } = req.params;
        const { limit = 20 } = req.query;

        const campaigns = await campaignService.getCampaignsByType(type, {
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Error fetching campaigns by type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campaigns by type',
            message: error.message
        });
    }
}

/**
 * Record campaign impression
 * POST /api/campaigns/:id/impression
 */
export async function recordImpression(req, res) {
    try {
        const { id } = req.params;

        const campaign = await campaignService.recordImpression(id);

        res.json({
            success: true,
            message: 'Impression recorded successfully',
            data: { impressions: campaign.analytics.impressions }
        });
    } catch (error) {
        console.error('Error recording impression:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to record impression',
                message: error.message
            });
        }
    }
}

/**
 * Record campaign click
 * POST /api/campaigns/:id/click
 */
export async function recordClick(req, res) {
    try {
        const { id } = req.params;
        const { ctaLabel } = req.body;

        const campaign = await campaignService.recordClick(id, ctaLabel);

        res.json({
            success: true,
            message: 'Click recorded successfully',
            data: {
                clicks: campaign.analytics.clicks,
                ctr: campaign.analytics.ctr
            }
        });
    } catch (error) {
        console.error('Error recording click:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to record click',
                message: error.message
            });
        }
    }
}

/**
 * Record campaign conversion
 * POST /api/campaigns/:id/conversion
 */
export async function recordConversion(req, res) {
    try {
        const { id } = req.params;

        const campaign = await campaignService.recordConversion(id);

        res.json({
            success: true,
            message: 'Conversion recorded successfully',
            data: {
                conversions: campaign.analytics.conversions,
                conversionRate: campaign.analytics.conversionRate
            }
        });
    } catch (error) {
        console.error('Error recording conversion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to record conversion',
                message: error.message
            });
        }
    }
}

/**
 * Get campaign analytics
 * GET /api/campaigns/:id/analytics
 */
export async function getCampaignAnalytics(req, res) {
    try {
        const { id } = req.params;

        const analytics = await campaignService.getCampaignAnalytics(id);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching campaign analytics:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch campaign analytics',
                message: error.message
            });
        }
    }
}

/**
 * Bulk update campaigns
 * PUT /api/campaigns/bulk-update
 */
export async function bulkUpdateCampaigns(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { campaignIds, updateData } = req.body;

        if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'campaignIds array is required'
            });
        }

        if (!updateData || typeof updateData !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'updateData object is required'
            });
        }

        // Bulk update campaigns using service
        const result = await campaignService.bulkUpdateCampaigns(campaignIds, updateData, req.user._id);

        res.json({
            success: true,
            message: 'Campaigns updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error bulk updating campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bulk update campaigns',
            message: error.message
        });
    }
}

/**
 * Bulk delete campaigns
 * DELETE /api/campaigns/bulk-delete
 */
export async function bulkDeleteCampaigns(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { campaignIds } = req.body;

        if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'campaignIds array is required'
            });
        }

        // Bulk delete campaigns using service
        const result = await campaignService.bulkDeleteCampaigns(campaignIds);

        res.json({
            success: true,
            message: 'Campaigns deleted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error bulk deleting campaigns:', error);
        if (error.message.includes('active campaigns')) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete active campaigns',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to bulk delete campaigns',
                message: error.message
            });
        }
    }
}

/**
 * Get targeted campaigns for user
 * GET /api/campaigns/targeted
 */
export async function getTargetedCampaigns(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { limit = 10 } = req.query;

        const campaigns = await campaignService.getTargetedCampaignsForUser(req.user, {
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Error fetching targeted campaigns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch targeted campaigns',
            message: error.message
        });
    }
}

/**
 * Upload campaign images
 * POST /api/campaigns/:id/upload-images
 */
export async function uploadCampaignImages(req, res) {
    try {
        // Require authentication
        req.requireAuth();

        const { id } = req.params;
        const { images } = req.body;

        // Check if user can edit this campaign
        const campaign = await campaignService.getCampaignById(id, { populate: false });
        if (campaign.createdBy.toString() !== req.user._id.toString() &&
            !['admin', 'manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Insufficient permissions to edit this campaign'
            });
        }

        // TODO: Implement image upload to Cloudinary
        // For now, just update the campaign with image URLs
        if (images && typeof images === 'object') {
            const updatedCampaign = await campaignService.updateCampaign(id, {
                content: {
                    ...campaign.content,
                    images: {
                        ...campaign.content.images,
                        ...images
                    }
                }
            }, req.user._id);

            res.json({
                success: true,
                message: 'Campaign images updated successfully',
                data: updatedCampaign
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'images object is required'
            });
        }
    } catch (error) {
        console.error('Error uploading campaign images:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: 'Campaign not found',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to upload campaign images',
                message: error.message
            });
        }
    }
}

import Campaign from '../mongoDB/models/Campaign.js';
import User from '../mongoDB/models/User.js';
import { v4 as uuidv4 } from 'uuid';
import campaignSchedulingService from './campaignScheduling.service.js';
import campaignTargetingService from './campaignTargeting.service.js';

class CampaignService {
    /**
     * Create a new campaign
     * @param {Object} campaignData - Campaign data
     * @param {string} userId - User ID creating the campaign
     * @returns {Promise<Object>} Created campaign
     */
    async createCampaign(campaignData, userId) {
        try {
            // Validate required fields
            this.validateCampaignData(campaignData);

            // Create campaign with default values
            const campaign = new Campaign({
                ...campaignData,
                createdBy: userId,
                lastEditedBy: userId,
                status: 'draft',
                isActive: false,
                uuid: uuidv4().replace(/-/g, '').substring(0, 32),
                analytics: {
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    ctr: 0,
                    conversionRate: 0,
                    ctaClicks: []
                }
            });

            await campaign.save();
            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to create campaign: ${error.message}`);
        }
    }

    /**
     * Get campaign by ID
     * @param {string} campaignId - Campaign ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Campaign object
     */
    async getCampaignById(campaignId, options = {}) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            if (options.populate !== false) {
                return await this.populateCampaign(campaign);
            }
            return campaign;
        } catch (error) {
            throw new Error(`Failed to get campaign: ${error.message}`);
        }
    }

    /**
     * Get campaigns with filtering and pagination
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options (pagination, sorting, etc.)
     * @returns {Promise<Object>} Campaigns and metadata
     */
    async getCampaigns(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sort = { priority: -1, createdAt: -1 },
                populate = true
            } = options;

            // Build query based on filters
            const query = this.buildCampaignQuery(filters);

            // Execute query with pagination
            const skip = (page - 1) * limit;
            const campaigns = await Campaign.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for pagination
            const total = await Campaign.countDocuments(query);

            // Populate user references if requested
            let populatedCampaigns = campaigns;
            if (populate) {
                populatedCampaigns = await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }

            return {
                campaigns: populatedCampaigns,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Failed to get campaigns: ${error.message}`);
        }
    }

    /**
     * Get active campaigns
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Active campaigns
     */
    async getActiveCampaigns(options = {}) {
        try {
            const now = new Date();
            const query = {
                isActive: true,
                'schedule.startDate': { $lte: now },
                $or: [
                    { 'schedule.endDate': { $exists: false } },
                    { 'schedule.endDate': { $gt: now } }
                ]
            };

            const campaigns = await Campaign.find(query)
                .sort({ priority: -1, createdAt: -1 })
                .limit(options.limit || 50);

            if (options.populate !== false) {
                return await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }
            return campaigns;
        } catch (error) {
            throw new Error(`Failed to get active campaigns: ${error.message}`);
        }
    }

    /**
     * Get scheduled campaigns
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Scheduled campaigns
     */
    async getScheduledCampaigns(options = {}) {
        try {
            const now = new Date();
            const query = {
                'schedule.startDate': { $gt: now },
                status: { $in: ['scheduled', 'draft'] }
            };

            const campaigns = await Campaign.find(query)
                .sort({ 'schedule.startDate': 1 })
                .limit(options.limit || 50);

            if (options.populate !== false) {
                return await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }
            return campaigns;
        } catch (error) {
            throw new Error(`Failed to get scheduled campaigns: ${error.message}`);
        }
    }

    /**
     * Get campaigns by placement
     * @param {string} placement - Campaign placement
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Campaigns for the placement
     */
    async getCampaignsByPlacement(placement, options = {}) {
        try {
            const campaigns = await Campaign.find({ placement })
                .sort({ priority: -1, createdAt: -1 })
                .limit(options.limit || 20);

            if (options.populate !== false) {
                return await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }
            return campaigns;
        } catch (error) {
            throw new Error(`Failed to get campaigns by placement: ${error.message}`);
        }
    }

    /**
     * Get campaigns by type
     * @param {string} type - Campaign type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Campaigns of the specified type
     */
    async getCampaignsByType(type, options = {}) {
        try {
            const campaigns = await Campaign.find({ type })
                .sort({ priority: -1, createdAt: -1 })
                .limit(options.limit || 20);

            if (options.populate !== false) {
                return await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }
            return campaigns;
        } catch (error) {
            throw new Error(`Failed to get campaigns by type: ${error.message}`);
        }
    }

    /**
     * Update campaign
     * @param {string} campaignId - Campaign ID
     * @param {Object} updateData - Data to update
     * @param {string} userId - User ID making the update
     * @returns {Promise<Object>} Updated campaign
     */
    async updateCampaign(campaignId, updateData, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            // Validate update data
            this.validateCampaignData(updateData, true);

            // Update campaign
            Object.assign(campaign, updateData, {
                lastEditedBy: userId,
                version: campaign.version + 1
            });

            await campaign.save();
            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to update campaign: ${error.message}`);
        }
    }

    /**
     * Delete campaign
     * @param {string} campaignId - Campaign ID
     * @param {string} userId - User ID deleting the campaign
     * @returns {Promise<Object>} Deleted campaign
     */
    async deleteCampaign(campaignId, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            // Check if campaign is currently active
            if (campaign.isCurrentlyActive) {
                throw new Error('Cannot delete active campaign. Deactivate first.');
            }

            await Campaign.findByIdAndDelete(campaignId);
            return campaign;
        } catch (error) {
            throw new Error(`Failed to delete campaign: ${error.message}`);
        }
    }

    /**
     * Activate campaign
     * @param {string} campaignId - Campaign ID
     * @param {string} userId - User ID activating the campaign
     * @returns {Promise<Object>} Activated campaign
     */
    async activateCampaign(campaignId, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            // Check if campaign is approved (if approval is required)
            if (campaign.status === 'draft' && !campaign.approvedBy) {
                throw new Error('Campaign must be approved before activation');
            }

            // Check if campaign start date has been reached
            const now = new Date();
            if (campaign.schedule.startDate > now) {
                throw new Error('Campaign start date has not been reached');
            }

            campaign.isActive = true;
            campaign.status = 'active';
            campaign.lastEditedBy = userId;
            await campaign.save();

            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to activate campaign: ${error.message}`);
        }
    }

    /**
     * Deactivate campaign
     * @param {string} campaignId - Campaign ID
     * @param {string} userId - User ID deactivating the campaign
     * @returns {Promise<Object>} Deactivated campaign
     */
    async deactivateCampaign(campaignId, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            campaign.isActive = false;
            campaign.status = 'paused';
            campaign.lastEditedBy = userId;
            await campaign.save();

            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to deactivate campaign: ${error.message}`);
        }
    }

    /**
     * Approve campaign
     * @param {string} campaignId - Campaign ID
     * @param {string} userId - User ID approving the campaign
     * @returns {Promise<Object>} Approved campaign
     */
    async approveCampaign(campaignId, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            campaign.status = 'scheduled';
            campaign.approvedBy = userId;
            campaign.approvedAt = new Date();
            campaign.lastEditedBy = userId;
            await campaign.save();

            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to approve campaign: ${error.message}`);
        }
    }

    /**
     * Duplicate campaign
     * @param {string} campaignId - Campaign ID to duplicate
     * @param {string} userId - User ID creating the duplicate
     * @returns {Promise<Object>} Duplicated campaign
     */
    async duplicateCampaign(campaignId, userId) {
        try {
            const originalCampaign = await Campaign.findById(campaignId);
            if (!originalCampaign) {
                throw new Error('Campaign not found');
            }

            // Create duplicate with modified data
            const campaignData = {
                ...originalCampaign.toObject(),
                _id: undefined,
                uuid: undefined,
                name: `${originalCampaign.name} (Copy)`,
                status: 'draft',
                isActive: false,
                createdBy: userId,
                lastEditedBy: userId,
                approvedBy: undefined,
                approvedAt: undefined,
                analytics: {
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    ctr: 0,
                    conversionRate: 0,
                    ctaClicks: []
                },
                createdAt: undefined,
                updatedAt: undefined
            };

            const duplicatedCampaign = new Campaign(campaignData);
            await duplicatedCampaign.save();

            return await this.populateCampaign(duplicatedCampaign);
        } catch (error) {
            throw new Error(`Failed to duplicate campaign: ${error.message}`);
        }
    }

    /**
     * Record campaign impression
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Updated campaign
     */
    async recordImpression(campaignId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            return await campaign.recordImpression();
        } catch (error) {
            throw new Error(`Failed to record impression: ${error.message}`);
        }
    }

    /**
     * Record campaign click
     * @param {string} campaignId - Campaign ID
     * @param {string} ctaLabel - CTA label (optional)
     * @returns {Promise<Object>} Updated campaign
     */
    async recordClick(campaignId, ctaLabel = null) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            return await campaign.recordClick(ctaLabel);
        } catch (error) {
            throw new Error(`Failed to record click: ${error.message}`);
        }
    }

    /**
     * Record campaign conversion
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Updated campaign
     */
    async recordConversion(campaignId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            return await campaign.recordConversion();
        } catch (error) {
            throw new Error(`Failed to record conversion: ${error.message}`);
        }
    }

    /**
     * Validate user targeting for a campaign
     * @param {Object} campaign - Campaign object
     * @param {Object} user - User object
     * @returns {boolean} Whether user matches targeting criteria
     */
    validateUserTargeting(campaign, user) {
        const { targeting } = campaign;
        if (!targeting) return true;

        // Check user role targeting
        if (targeting.userRoles && targeting.userRoles.length > 0) {
            if (!targeting.userRoles.includes(user.role)) {
                return false;
            }
        }

        // Check new vs returning user targeting
        if (targeting.newUsers && !targeting.returningUsers) {
            // Only new users
            const userAge = Date.now() - new Date(user.createdAt).getTime();
            const daysOld = userAge / (1000 * 60 * 60 * 24);
            if (daysOld > 30) return false;
        } else if (targeting.returningUsers && !targeting.newUsers) {
            // Only returning users
            const userAge = Date.now() - new Date(user.createdAt).getTime();
            const daysOld = userAge / (1000 * 60 * 60 * 24);
            if (daysOld <= 30) return false;
        }

        // Check verified user targeting
        if (targeting.verifiedUsers && !user.isVerified) {
            return false;
        }

        // Check geographic targeting (future feature)
        if (targeting.countries && targeting.countries.length > 0) {
            // TODO: Implement country detection
        }

        if (targeting.cities && targeting.cities.length > 0) {
            // TODO: Implement city detection
        }

        return true;
    }

    /**
     * Get campaigns for a specific user based on targeting
     * @param {Object} user - User object
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Targeted campaigns for the user
     */
    async getTargetedCampaignsForUser(user, options = {}) {
        try {
            // Get active campaigns
            const activeCampaigns = await this.getActiveCampaigns({ populate: false });

            // Filter campaigns based on user targeting
            const targetedCampaigns = activeCampaigns.filter(campaign =>
                this.validateUserTargeting(campaign, user)
            );

            // Sort by priority and return
            const sortedCampaigns = targetedCampaigns.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            // Apply limit if specified
            if (options.limit) {
                sortedCampaigns.splice(options.limit);
            }

            // Populate user references if requested
            if (options.populate !== false) {
                return await Promise.all(
                    sortedCampaigns.map(campaign => this.populateCampaign(campaign))
                );
            }

            return sortedCampaigns;
        } catch (error) {
            throw new Error(`Failed to get targeted campaigns: ${error.message}`);
        }
    }

    /**
     * Get campaign analytics summary
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Analytics summary
     */
    async getCampaignAnalytics(campaignId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const { analytics } = campaign;
            const now = new Date();
            const startDate = campaign.schedule.startDate;
            const endDate = campaign.schedule.endDate;

            // Calculate campaign duration
            const duration = endDate ?
                Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) :
                Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));

            // Calculate daily averages
            const dailyImpressions = duration > 0 ? analytics.impressions / duration : 0;
            const dailyClicks = duration > 0 ? analytics.clicks / duration : 0;
            const dailyConversions = duration > 0 ? analytics.conversions / duration : 0;

            return {
                campaignId,
                name: campaign.name,
                type: campaign.type,
                placement: campaign.placement,
                status: campaign.status,
                startDate,
                endDate,
                duration,
                analytics: {
                    ...analytics,
                    dailyImpressions: Math.round(dailyImpressions * 100) / 100,
                    dailyClicks: Math.round(dailyClicks * 100) / 100,
                    dailyConversions: Math.round(dailyConversions * 100) / 100
                },
                performance: {
                    isPerforming: analytics.ctr > 1.0, // Above 1% CTR
                    needsOptimization: analytics.ctr < 0.5, // Below 0.5% CTR
                    conversionEfficiency: analytics.conversionRate
                }
            };
        } catch (error) {
            throw new Error(`Failed to get campaign analytics: ${error.message}`);
        }
    }

    /**
     * Bulk update campaigns
     * @param {Array<string>} campaignIds - Array of campaign IDs
     * @param {Object} updateData - Data to update
     * @param {string} userId - User ID making the update
     * @returns {Promise<Object>} Update result
     */
    async bulkUpdateCampaigns(campaignIds, updateData, userId) {
        try {
            const result = await Campaign.updateMany(
                { _id: { $in: campaignIds } },
                {
                    ...updateData,
                    lastEditedBy: userId,
                    $inc: { version: 1 }
                }
            );

            return {
                success: true,
                modifiedCount: result.modifiedCount,
                totalCount: campaignIds.length
            };
        } catch (error) {
            throw new Error(`Failed to bulk update campaigns: ${error.message}`);
        }
    }

    /**
     * Bulk delete campaigns
     * @param {Array<string>} campaignIds - Array of campaign IDs
     * @returns {Promise<Object>} Delete result
     */
    async bulkDeleteCampaigns(campaignIds) {
        try {
            // Check if any campaigns are currently active
            const activeCampaigns = await Campaign.find({
                _id: { $in: campaignIds },
                isCurrentlyActive: true
            });

            if (activeCampaigns.length > 0) {
                throw new Error(`Cannot delete ${activeCampaigns.length} active campaigns. Deactivate first.`);
            }

            const result = await Campaign.deleteMany({ _id: { $in: campaignIds } });

            return {
                success: true,
                deletedCount: result.deletedCount,
                totalCount: campaignIds.length
            };
        } catch (error) {
            throw new Error(`Failed to bulk delete campaigns: ${error.message}`);
        }
    }

    // Private helper methods

    /**
     * Build MongoDB query from filters
     * @param {Object} filters - Filter criteria
     * @returns {Object} MongoDB query object
     */
    buildCampaignQuery(filters) {
        const query = {};

        if (filters.type) query.type = filters.type;
        if (filters.placement) query.placement = filters.placement;
        if (filters.status) query.status = filters.status;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;
        if (filters.isScheduled !== undefined) {
            if (filters.isScheduled) {
                query['schedule.startDate'] = { $gt: new Date() };
            } else {
                query['schedule.startDate'] = { $lte: new Date() };
            }
        }
        if (filters.isExpired !== undefined) {
            if (filters.isExpired) {
                query['schedule.endDate'] = { $lt: new Date() };
            } else {
                query['schedule.endDate'] = { $gt: new Date() };
            }
        }
        if (filters.createdBy) query.createdBy = filters.createdBy;
        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }

        return query;
    }

    /**
     * Populate campaign with user references
     * @param {Object} campaign - Campaign object
     * @returns {Promise<Object>} Populated campaign
     */
    async populateCampaign(campaign) {
        return await campaign.populate([
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'lastEditedBy', select: 'firstName lastName email' },
            { path: 'approvedBy', select: 'firstName lastName email' }
        ]);
    }

    /**
     * Validate campaign data
     * @param {Object} data - Campaign data
     * @param {boolean} isUpdate - Whether this is an update operation
     */
    validateCampaignData(data, isUpdate = false) {
        if (!isUpdate) {
            if (!data.name) throw new Error('Campaign name is required');
            if (!data.title) throw new Error('Campaign title is required');
            if (!data.type) throw new Error('Campaign type is required');
            if (!data.placement) throw new Error('Campaign placement is required');
        }

        // Validate campaign type
        const validTypes = ['hero_carousel', 'banner', 'popup', 'notification', 'theme_override'];
        if (data.type && !validTypes.includes(data.type)) {
            throw new Error('Invalid campaign type');
        }

        // Validate placement
        const validPlacements = ['home_hero', 'top_banner', 'sidebar', 'footer', 'popup_modal', 'notification_bar'];
        if (data.placement && !validPlacements.includes(data.placement)) {
            throw new Error('Invalid campaign placement');
        }

        // Validate priority
        if (data.priority !== undefined && (data.priority < 0 || data.priority > 100)) {
            throw new Error('Priority must be between 0 and 100');
        }

        // Validate schedule
        if (data.schedule) {
            this.validateScheduleData(data.schedule);
        }
    }

    /**
     * Validate schedule data
     * @param {Object} schedule - Schedule data
     */
    validateScheduleData(schedule) {
        if (schedule.startDate) {
            const startDate = new Date(schedule.startDate);
            if (isNaN(startDate.getTime())) {
                throw new Error('Invalid start date');
            }
        }

        if (schedule.endDate) {
            const endDate = new Date(schedule.endDate);
            if (isNaN(endDate.getTime())) {
                throw new Error('Invalid end date');
            }

            if (schedule.startDate && new Date(schedule.startDate) >= endDate) {
                throw new Error('End date must be after start date');
            }
        }

        if (schedule.isRecurring && schedule.recurrence) {
            const validRecurrences = ['daily', 'weekly', 'monthly', 'yearly'];
            if (!validRecurrences.includes(schedule.recurrence)) {
                throw new Error('Invalid recurrence type');
            }
        }
    }

    // ===== ADVANCED SCHEDULING METHODS =====

    /**
     * Schedule a campaign with advanced options
     */
    async scheduleCampaign(campaignId, scheduleData) {
        try {
            return await campaignSchedulingService.scheduleCampaign(campaignId, scheduleData);
        } catch (error) {
            throw new Error(`Failed to schedule campaign: ${error.message}`);
        }
    }

    /**
     * Unschedule a campaign
     */
    async unscheduleCampaign(campaignId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            campaign.schedule.isScheduled = false;
            campaign.schedule.isQueued = false;
            campaign.schedule.queuePosition = null;

            await campaign.save();
            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to unschedule campaign: ${error.message}`);
        }
    }

    /**
     * Add campaign to queue
     */
    async addToQueue(campaignId, priority = 'normal') {
        try {
            return await campaignSchedulingService.addToQueue(campaignId, priority);
        } catch (error) {
            throw new Error(`Failed to add campaign to queue: ${error.message}`);
        }
    }

    /**
     * Remove campaign from queue
     */
    async removeFromQueue(campaignId) {
        try {
            return await campaignSchedulingService.removeFromQueue(campaignId);
        } catch (error) {
            throw new Error(`Failed to remove campaign from queue: ${error.message}`);
        }
    }

    /**
     * Move campaign in queue
     */
    async moveInQueue(campaignId, newPosition) {
        try {
            return await campaignSchedulingService.moveInQueue(campaignId, newPosition);
        } catch (error) {
            throw new Error(`Failed to move campaign in queue: ${error.message}`);
        }
    }

    /**
     * Get queued campaigns
     */
    async getQueuedCampaigns() {
        try {
            const campaigns = await campaignSchedulingService.getQueuedCampaigns();
            return await Promise.all(
                campaigns.map(campaign => this.populateCampaign(campaign))
            );
        } catch (error) {
            throw new Error(`Failed to get queued campaigns: ${error.message}`);
        }
    }

    /**
     * Get scheduled campaigns by date range
     */
    async getScheduledCampaignsByDate(startDate, endDate) {
        try {
            const campaigns = await campaignSchedulingService.getScheduledCampaignsByDate(startDate, endDate);
            return await Promise.all(
                campaigns.map(campaign => this.populateCampaign(campaign))
            );
        } catch (error) {
            throw new Error(`Failed to get scheduled campaigns by date: ${error.message}`);
        }
    }

    /**
     * Get campaigns with conflicts
     */
    async getCampaignsWithConflicts() {
        try {
            return await campaignSchedulingService.getCampaignsWithConflicts();
        } catch (error) {
            throw new Error(`Failed to get campaigns with conflicts: ${error.message}`);
        }
    }

    /**
     * Process campaign queue
     */
    async processQueue() {
        try {
            return await campaignSchedulingService.processQueue();
        } catch (error) {
            throw new Error(`Failed to process queue: ${error.message}`);
        }
    }

    /**
     * Auto-activate campaign
     */
    async autoActivateCampaign(campaignId) {
        try {
            return await campaignSchedulingService.autoActivateCampaign(campaignId);
        } catch (error) {
            throw new Error(`Failed to auto-activate campaign: ${error.message}`);
        }
    }

    /**
     * Auto-deactivate campaign
     */
    async autoDeactivateCampaign(campaignId) {
        try {
            return await campaignSchedulingService.autoDeactivateCampaign(campaignId);
        } catch (error) {
            throw new Error(`Failed to auto-deactivate campaign: ${error.message}`);
        }
    }

    /**
     * Update recurrence details
     */
    async updateRecurrence(campaignId, recurrenceDetails) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            campaign.schedule.recurrenceDetails = {
                ...campaign.schedule.recurrenceDetails,
                ...recurrenceDetails
            };

            // Recalculate next occurrence
            if (campaign.schedule.isRecurring) {
                campaign.schedule.nextOccurrence = campaignSchedulingService.calculateNextOccurrence(
                    campaign.schedule.startDate,
                    campaign.schedule.recurrenceDetails
                );
            }

            await campaign.save();
            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to update recurrence: ${error.message}`);
        }
    }

    /**
     * Resolve schedule conflict
     */
    async resolveScheduleConflict(campaignId, resolution) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            campaign.schedule.conflictResolution = resolution;
            await campaign.save();

            // Process the resolution
            if (resolution === 'queue') {
                await this.addToQueue(campaignId, campaign.schedule.priority);
            }

            return await this.populateCampaign(campaign);
        } catch (error) {
            throw new Error(`Failed to resolve schedule conflict: ${error.message}`);
        }
    }

    // ===== ADVANCED TARGETING METHODS =====

    /**
     * Check if a user matches campaign targeting criteria
     */
    async checkUserTargeting(campaignId, userId) {
        try {
            return await campaignTargetingService.checkUserTargeting(campaignId, userId);
        } catch (error) {
            throw new Error(`Failed to check user targeting: ${error.message}`);
        }
    }

    /**
     * Get targeted campaigns for a specific user
     */
    async getTargetedCampaignsForUser(userId, placement = null, type = null) {
        try {
            return await campaignTargetingService.getTargetedCampaignsForUser(userId, placement, type);
        } catch (error) {
            throw new Error(`Failed to get targeted campaigns: ${error.message}`);
        }
    }

    /**
     * Get campaigns by targeting criteria
     */
    async getCampaignsByTargeting(targetingCriteria, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sort = { priority: -1, createdAt: -1 },
                populate = true
            } = options;

            // Build targeting query
            const query = this.buildTargetingQuery(targetingCriteria);

            // Execute query with pagination
            const skip = (page - 1) * limit;
            const campaigns = await Campaign.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for pagination
            const total = await Campaign.countDocuments(query);

            // Populate user references if requested
            let populatedCampaigns = campaigns;
            if (populate) {
                populatedCampaigns = await Promise.all(
                    campaigns.map(campaign => this.populateCampaign(campaign))
                );
            }

            return {
                campaigns: populatedCampaigns,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Failed to get campaigns by targeting: ${error.message}`);
        }
    }

    /**
     * Get user targeting insights for a campaign
     */
    async getCampaignTargetingInsights(campaignId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const targeting = campaign.targeting;
            if (!targeting) {
                return { message: 'No targeting criteria set for this campaign' };
            }

            // Get user counts for different targeting criteria
            const insights = {
                totalUsers: await User.countDocuments(),
                targetedUsers: 0,
                targetingBreakdown: {}
            };

            // Calculate targeting breakdown
            if (targeting.userRoles && targeting.userRoles.length > 0) {
                insights.targetingBreakdown.userRoles = {};
                for (const role of targeting.userRoles) {
                    const count = await User.countDocuments({ role });
                    insights.targetingBreakdown.userRoles[role] = count;
                }
            }

            if (targeting.newUsers !== undefined || targeting.returningUsers !== undefined) {
                const newUserCount = await User.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });
                const returningUserCount = insights.totalUsers - newUserCount;
                
                insights.targetingBreakdown.userBehavior = {
                    newUsers: newUserCount,
                    returningUsers: returningUserCount
                };
            }

            if (targeting.countries && targeting.countries.length > 0) {
                insights.targetingBreakdown.geographic = {};
                for (const country of targeting.countries) {
                    const count = await User.countDocuments({ 'location.country': country });
                    insights.targetingBreakdown.geographic[country] = count;
                }
            }

            // Calculate total targeted users (simplified calculation)
            insights.targetedUsers = Math.min(
                ...Object.values(insights.targetingBreakdown).flatMap(obj => 
                    typeof obj === 'object' ? Object.values(obj) : [obj]
                ).filter(val => typeof val === 'number')
            );

            return insights;
        } catch (error) {
            throw new Error(`Failed to get targeting insights: ${error.message}`);
        }
    }

    /**
     * Validate targeting criteria
     */
    validateTargetingCriteria(targeting) {
        if (!targeting) return true;

        // Validate user roles
        if (targeting.userRoles) {
            const validRoles = ['guest', 'user', 'premium_user', 'admin', 'moderator', 'content_creator', 'business_owner', 'enterprise_user'];
            for (const role of targeting.userRoles) {
                if (!validRoles.includes(role)) {
                    throw new Error(`Invalid user role: ${role}`);
                }
            }
        }

        // Validate user behavior targeting
        if (targeting.newUsers !== undefined && targeting.returningUsers !== undefined) {
            if (targeting.newUsers === false && targeting.returningUsers === false) {
                throw new Error('Cannot exclude both new and returning users');
            }
        }

        // Validate geographic targeting
        if (targeting.radius && targeting.radius < 0) {
            throw new Error('Radius must be a positive number');
        }

        // Validate frequency targeting
        if (targeting.maxFrequency && targeting.maxFrequency < 1) {
            throw new Error('Max frequency must be at least 1');
        }

        if (targeting.minTimeBetweenViews && targeting.minTimeBetweenViews < 0) {
            throw new Error('Minimum time between views must be non-negative');
        }

        // Validate timing targeting
        if (targeting.timeOfDay) {
            const validTimes = ['morning', 'afternoon', 'evening', 'night'];
            for (const time of targeting.timeOfDay) {
                if (!validTimes.includes(time)) {
                    throw new Error(`Invalid time of day: ${time}`);
                }
            }
        }

        if (targeting.dayOfWeek) {
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            for (const day of targeting.dayOfWeek) {
                if (!validDays.includes(day)) {
                    throw new Error(`Invalid day of week: ${day}`);
                }
            }
        }

        return true;
    }

    /**
     * Build MongoDB query for targeting criteria
     */
    buildTargetingQuery(targetingCriteria) {
        const query = {};

        if (targetingCriteria.userRoles && targetingCriteria.userRoles.length > 0) {
            query.role = { $in: targetingCriteria.userRoles };
        }

        if (targetingCriteria.excludeUserRoles && targetingCriteria.excludeUserRoles.length > 0) {
            query.role = { $nin: targetingCriteria.excludeUserRoles };
        }

        if (targetingCriteria.newUsers !== undefined) {
            if (targetingCriteria.newUsers) {
                query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
            } else {
                query.createdAt = { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
            }
        }

        if (targetingCriteria.verifiedUsers !== undefined) {
            query.isVerified = targetingCriteria.verifiedUsers;
        }

        if (targetingCriteria.countries && targetingCriteria.countries.length > 0) {
            query['location.country'] = { $in: targetingCriteria.countries };
        }

        if (targetingCriteria.cities && targetingCriteria.cities.length > 0) {
            query['location.city'] = { $in: targetingCriteria.cities };
        }

        if (targetingCriteria.deviceType && targetingCriteria.deviceType.length > 0) {
            query['deviceInfo.type'] = { $in: targetingCriteria.deviceType };
        }

        if (targetingCriteria.subscriptionStatus && targetingCriteria.subscriptionStatus.length > 0) {
            query.subscriptionStatus = { $in: targetingCriteria.subscriptionStatus };
        }

        return query;
    }
}

export default new CampaignService();

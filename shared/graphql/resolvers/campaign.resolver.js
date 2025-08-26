import campaignService from '../../services/campaign.service.js';
import { AuthenticationError, UserInputError, ForbiddenError } from '../errors.js';

const campaignResolvers = {
    Query: {
        // Get all campaigns with optional filtering
        campaigns: async (_, { filter = {} }, { user }) => {
            try {
                const result = await campaignService.getCampaigns(filter, {
                    populate: true,
                    page: 1,
                    limit: 1000 // Large limit for GraphQL queries
                });
                return result.campaigns;
            } catch (error) {
                console.error('Error fetching campaigns:', error);
                throw new Error('Failed to fetch campaigns');
            }
        },

        // Get campaign by ID
        campaign: async (_, { id }, { user }) => {
            try {
                return await campaignService.getCampaignById(id);
            } catch (error) {
                console.error('Error fetching campaign:', error);
                throw new Error('Failed to fetch campaign');
            }
        },

        // Get currently active campaigns
        activeCampaigns: async (_, __, { user }) => {
            try {
                return await campaignService.getActiveCampaigns();
            } catch (error) {
                console.error('Error fetching active campaigns:', error);
                throw new Error('Failed to fetch active campaigns');
            }
        },

        // Get scheduled campaigns (future campaigns)
        scheduledCampaigns: async (_, __, { user }) => {
            try {
                return await campaignService.getScheduledCampaigns();
            } catch (error) {
                console.error('Error fetching scheduled campaigns:', error);
                throw new Error('Failed to fetch scheduled campaigns');
            }
        },

        // Get campaigns by placement
        campaignsByPlacement: async (_, { placement }, { user }) => {
            try {
                return await campaignService.getCampaignsByPlacement(placement);
            } catch (error) {
                console.error('Error fetching campaigns by placement:', error);
                throw new Error('Failed to fetch campaigns by placement');
            }
        },

        // Get campaigns by type
        campaignsByType: async (_, { type }, { user }) => {
            try {
                return await campaignService.getCampaignsByType(type);
            } catch (error) {
                console.error('Error fetching campaigns by type:', error);
                throw new Error('Failed to fetch campaigns by type');
            }
        }
    },

    Mutation: {
        // Create new campaign
        createCampaign: async (_, { input }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                return await campaignService.createCampaign(input, user._id);
            } catch (error) {
                console.error('Error creating campaign:', error);
                if (error.message.includes('required') || error.message.includes('Invalid')) {
                    throw new UserInputError(error.message);
                }
                throw new Error('Failed to create campaign');
            }
        },

        // Update existing campaign
        updateCampaign: async (_, { id, input }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can edit this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to edit this campaign');
                }

                return await campaignService.updateCampaign(id, input, user._id);
            } catch (error) {
                console.error('Error updating campaign:', error);
                if (error.message.includes('required') || error.message.includes('Invalid')) {
                    throw new UserInputError(error.message);
                }
                throw new Error('Failed to update campaign');
            }
        },

        // Delete campaign
        deleteCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can delete this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to delete this campaign');
                }

                return await campaignService.deleteCampaign(id, user._id);
            } catch (error) {
                console.error('Error deleting campaign:', error);
                if (error.message.includes('active campaign')) {
                    throw new UserInputError(error.message);
                }
                throw new Error('Failed to delete campaign');
            }
        },

        // Activate campaign
        activateCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can activate this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to activate this campaign');
                }

                return await campaignService.activateCampaign(id, user._id);
            } catch (error) {
                console.error('Error activating campaign:', error);
                if (error.message.includes('approved') || error.message.includes('start date')) {
                    throw new UserInputError(error.message);
                }
                throw new Error('Failed to activate campaign');
            }
        },

        // Deactivate campaign
        deactivateCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can deactivate this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to deactivate this campaign');
                }

                return await campaignService.deactivateCampaign(id, user._id);
            } catch (error) {
                console.error('Error deactivating campaign:', error);
                throw new Error('Failed to deactivate campaign');
            }
        },

        // Approve campaign
        approveCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user has approval permissions
                if (!['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to approve campaigns');
                }

                return await campaignService.approveCampaign(id, user._id);
            } catch (error) {
                console.error('Error approving campaign:', error);
                throw new Error('Failed to approve campaign');
            }
        },

        // Duplicate campaign
        duplicateCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                return await campaignService.duplicateCampaign(id, user._id);
            } catch (error) {
                console.error('Error duplicating campaign:', error);
                throw new Error('Failed to duplicate campaign');
            }
        },

        // Schedule campaign
        scheduleCampaign: async (_, { id, schedule }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can schedule this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to schedule this campaign');
                }

                return await campaignService.scheduleCampaign(id, schedule, user._id);
            } catch (error) {
                console.error('Error scheduling campaign:', error);
                if (error.message.includes('Invalid')) {
                    throw new UserInputError(error.message);
                }
                throw new Error('Failed to schedule campaign');
            }
        },

        // Unschedule campaign
        unscheduleCampaign: async (_, { id }, { user }) => {
            try {
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }

                // Check if user can unschedule this campaign
                const campaign = await campaignService.getCampaignById(id, { populate: false });
                if (campaign.createdBy.toString() !== user._id.toString() &&
                    !['admin', 'manager', 'super_admin'].includes(user.role)) {
                    throw new ForbiddenError('Insufficient permissions to unschedule this campaign');
                }

                return await campaignService.unscheduleCampaign(id, user._id);
            } catch (error) {
                console.error('Error unscheduling campaign:', error);
                throw new Error('Failed to unschedule campaign');
            }
        }
    },

    // Field resolvers for computed fields
    Campaign: {
        // Resolve computed fields that might not be in the database
        isScheduled: (campaign) => {
            const now = new Date();
            return campaign.schedule.startDate > now;
        },

        isExpired: (campaign) => {
            if (!campaign.schedule.endDate) return false;
            return campaign.schedule.endDate < new Date();
        },

        isCurrentlyActive: (campaign) => {
            const now = new Date();
            const started = campaign.schedule.startDate <= now;
            const notExpired = !campaign.schedule.endDate || campaign.schedule.endDate > now;
            return campaign.isActive && started && notExpired;
        },

        daysRemaining: (campaign) => {
            if (!campaign.schedule.endDate) return null;
            const now = new Date();
            const diffTime = campaign.schedule.endDate - now;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },

        ctr: (campaign) => {
            if (campaign.analytics.impressions === 0) return 0;
            return parseFloat((campaign.analytics.clicks / campaign.analytics.impressions * 100).toFixed(2));
        }
    }
};

export default campaignResolvers; 
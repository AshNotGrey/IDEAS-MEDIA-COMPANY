import EmailTemplate from '../../mongoDB/models/EmailTemplate.js';
import EmailCampaign from '../../mongoDB/models/EmailCampaign.js';
import User from '../../mongoDB/models/User.js';
import { sendMail } from '../../utils/email.js';
import { AuthenticationError, ForbiddenError, UserInputError } from '../errors.js';

const emailTemplateResolvers = {
    Query: {
        // Get email templates with filtering and pagination
        getEmailTemplates: async (parent, { filter = {}, sort = { field: 'createdAt', direction: 'DESC' }, page = 1, limit = 20 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const query = {};

                // Apply filters
                if (filter.category) query.category = filter.category;
                if (filter.type) query.type = filter.type;
                if (filter.isActive !== undefined) query.isActive = filter.isActive;
                if (filter.isDefault !== undefined) query.isDefault = filter.isDefault;

                if (filter.tags && filter.tags.length > 0) {
                    query.tags = { $in: filter.tags };
                }

                if (filter.search) {
                    query.$or = [
                        { name: { $regex: filter.search, $options: 'i' } },
                        { description: { $regex: filter.search, $options: 'i' } },
                        { subject: { $regex: filter.search, $options: 'i' } }
                    ];
                }

                // Apply sorting
                const sortOptions = {};
                sortOptions[sort.field] = sort.direction === 'DESC' ? -1 : 1;

                const skip = (page - 1) * limit;

                const [templates, total] = await Promise.all([
                    EmailTemplate.find(query)
                        .populate('createdBy', 'name username email')
                        .populate('lastModifiedBy', 'name username email')
                        .sort(sortOptions)
                        .skip(skip)
                        .limit(limit),
                    EmailTemplate.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    templates,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                };
            } catch (error) {
                throw new Error(`Failed to fetch email templates: ${error.message}`);
            }
        },

        // Get single email template by ID
        getEmailTemplate: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id)
                    .populate('createdBy', 'name username email')
                    .populate('lastModifiedBy', 'name username email')
                    .populate('previousVersions.modifiedBy', 'name username email');

                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                return template;
            } catch (error) {
                throw new Error(`Failed to fetch email template: ${error.message}`);
            }
        },

        // Get email template by slug
        getEmailTemplateBySlug: async (parent, { slug }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailTemplate.findBySlug(slug);
            } catch (error) {
                throw new Error(`Failed to fetch email template: ${error.message}`);
            }
        },

        // Get email campaigns with filtering and pagination
        getEmailCampaigns: async (parent, { filter = {}, sort = { field: 'createdAt', direction: 'DESC' }, page = 1, limit = 20 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const query = {};

                // Apply filters
                if (filter.status) query.status = filter.status;
                if (filter.template) query.template = filter.template;
                if (filter.createdBy) query.createdBy = filter.createdBy;
                if (filter.isActive !== undefined) query.isActive = filter.isActive;

                if (filter.search) {
                    query.$or = [
                        { name: { $regex: filter.search, $options: 'i' } },
                        { subject: { $regex: filter.search, $options: 'i' } }
                    ];
                }

                // Apply sorting
                const sortOptions = {};
                sortOptions[sort.field] = sort.direction === 'DESC' ? -1 : 1;

                const skip = (page - 1) * limit;

                const [campaigns, total] = await Promise.all([
                    EmailCampaign.find(query)
                        .populate('template')
                        .populate('createdBy', 'name username email')
                        .sort(sortOptions)
                        .skip(skip)
                        .limit(limit),
                    EmailCampaign.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    campaigns,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                };
            } catch (error) {
                throw new Error(`Failed to fetch email campaigns: ${error.message}`);
            }
        },

        // Get single email campaign by ID
        getEmailCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email')
                    .populate('approvedBy', 'name username email')
                    .populate('rejectedBy', 'name username email');

                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                return campaign;
            } catch (error) {
                throw new Error(`Failed to fetch email campaign: ${error.message}`);
            }
        },

        // Get active email campaigns
        getActiveCampaigns: async (parent, args, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailCampaign.find({ status: 'active', isActive: true })
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to fetch active campaigns: ${error.message}`);
            }
        },

        // Get scheduled email campaigns
        getScheduledCampaigns: async (parent, args, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailCampaign.find({ status: 'scheduled', isActive: true })
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to fetch scheduled campaigns: ${error.message}`);
            }
        },

        // Get campaign analytics
        getCampaignAnalytics: async (parent, { dateFrom, dateTo }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const query = {};
                if (dateFrom || dateTo) {
                    query.createdAt = {};
                    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                    if (dateTo) query.createdAt.$lte = new Date(dateTo);
                }

                const campaigns = await EmailCampaign.find(query);

                const analytics = {
                    totalCampaigns: campaigns.length,
                    totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
                    totalDelivered: campaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0),
                    totalOpened: campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0),
                    totalClicked: campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0),
                    totalUnsubscribed: campaigns.reduce((sum, c) => sum + (c.stats?.unsubscribed || 0), 0),
                    averageOpenRate: 0,
                    averageClickRate: 0
                };

                if (analytics.totalDelivered > 0) {
                    analytics.averageOpenRate = (analytics.totalOpened / analytics.totalDelivered * 100).toFixed(2);
                }
                if (analytics.totalDelivered > 0) {
                    analytics.averageClickRate = (analytics.totalClicked / analytics.totalDelivered * 100).toFixed(2);
                }

                return analytics;
            } catch (error) {
                throw new Error(`Failed to fetch campaign analytics: ${error.message}`);
            }
        },

        // Preview campaign recipients
        previewCampaignRecipients: async (parent, { recipients }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                // This would typically validate and format recipient lists
                // For now, just return the recipients as-is
                return recipients.emails || [];
            } catch (error) {
                throw new Error(`Failed to preview recipients: ${error.message}`);
            }
        },

        // Get templates by category
        getEmailTemplatesByCategory: async (parent, { category }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailTemplate.findByCategory(category);
            } catch (error) {
                throw new Error(`Failed to fetch email templates: ${error.message}`);
            }
        },

        // Compile template with variables
        compileEmailTemplate: async (parent, { id, variables }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                return template.compile(variables);
            } catch (error) {
                throw new Error(`Failed to compile template: ${error.message}`);
            }
        },

        // Preview template
        previewEmailTemplate: async (parent, { id, variables }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                return template.compile(variables);
            } catch (error) {
                throw new Error(`Failed to preview template: ${error.message}`);
            }
        },

        // Get email campaigns
        getEmailCampaigns: async (parent, { filter = {}, sort = { field: 'createdAt', direction: 'DESC' }, page = 1, limit = 20 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const query = {};

                // Apply filters
                if (filter.type) query.type = filter.type;
                if (filter.category) query.category = filter.category;
                if (filter.status) query.status = filter.status;
                if (filter.approvalStatus) query.approvalStatus = filter.approvalStatus;

                if (filter.tags && filter.tags.length > 0) {
                    query.tags = { $in: filter.tags };
                }

                if (filter.search) {
                    query.$or = [
                        { name: { $regex: filter.search, $options: 'i' } },
                        { description: { $regex: filter.search, $options: 'i' } }
                    ];
                }

                if (filter.dateFrom || filter.dateTo) {
                    query.createdAt = {};
                    if (filter.dateFrom) query.createdAt.$gte = new Date(filter.dateFrom);
                    if (filter.dateTo) query.createdAt.$lte = new Date(filter.dateTo);
                }

                // Apply sorting
                const sortOptions = {};
                sortOptions[sort.field] = sort.direction === 'DESC' ? -1 : 1;

                const skip = (page - 1) * limit;

                const [campaigns, total] = await Promise.all([
                    EmailCampaign.find(query)
                        .populate('template', 'name subject category')
                        .populate('createdBy', 'name username email')
                        .populate('approvedBy', 'name username email')
                        .sort(sortOptions)
                        .skip(skip)
                        .limit(limit),
                    EmailCampaign.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    campaigns,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                };
            } catch (error) {
                throw new Error(`Failed to fetch email campaigns: ${error.message}`);
            }
        },

        // Get single email campaign
        getEmailCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email')
                    .populate('approvedBy', 'name username email');

                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                return campaign;
            } catch (error) {
                throw new Error(`Failed to fetch email campaign: ${error.message}`);
            }
        },

        // Get active campaigns
        getActiveCampaigns: async (parent, args, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailCampaign.findActive()
                    .populate('template', 'name subject')
                    .populate('createdBy', 'name username');
            } catch (error) {
                throw new Error(`Failed to fetch active campaigns: ${error.message}`);
            }
        },

        // Get scheduled campaigns
        getScheduledCampaigns: async (parent, args, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await EmailCampaign.findScheduled()
                    .populate('template', 'name subject')
                    .populate('createdBy', 'name username');
            } catch (error) {
                throw new Error(`Failed to fetch scheduled campaigns: ${error.message}`);
            }
        },

        // Get campaign analytics
        getCampaignAnalytics: async (parent, { dateFrom, dateTo }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const dateRange = {};
                if (dateFrom) dateRange.from = dateFrom;
                if (dateTo) dateRange.to = dateTo;

                const [analytics] = await EmailCampaign.getStats(dateRange);

                return analytics || {
                    totalCampaigns: 0,
                    totalSent: 0,
                    totalDelivered: 0,
                    totalOpened: 0,
                    totalClicked: 0,
                    totalRevenue: 0,
                    avgOpenRate: 0,
                    avgClickRate: 0
                };
            } catch (error) {
                throw new Error(`Failed to fetch campaign analytics: ${error.message}`);
            }
        },

        // Preview campaign recipients
        previewCampaignRecipients: async (parent, { recipients }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                // Create a temporary campaign to build recipient list
                const tempCampaign = new EmailCampaign({ recipients });
                const recipientList = await tempCampaign.buildRecipientList();

                return recipientList.slice(0, 100); // Limit preview to 100 recipients
            } catch (error) {
                throw new Error(`Failed to preview recipients: ${error.message}`);
            }
        }
    },

    Mutation: {
        // Create email template
        createEmailTemplate: async (parent, { input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = new EmailTemplate({
                    ...input,
                    createdBy: user.id,
                    lastModifiedBy: user.id
                });

                await template.save();
                return await EmailTemplate.findById(template._id)
                    .populate('createdBy', 'name username email')
                    .populate('lastModifiedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to create email template: ${error.message}`);
            }
        },

        // Update email template
        updateEmailTemplate: async (parent, { id, input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                // Create version before updating
                await template.createVersion('Updated via API');

                // Update template
                Object.keys(input).forEach(key => {
                    if (input[key] !== undefined) {
                        template[key] = input[key];
                    }
                });

                template.lastModifiedBy = user.id;
                await template.save();

                return await EmailTemplate.findById(id)
                    .populate('createdBy', 'name username email')
                    .populate('lastModifiedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to update email template: ${error.message}`);
            }
        },

        // Delete email template
        deleteEmailTemplate: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                await EmailTemplate.findByIdAndDelete(id);
                return true;
            } catch (error) {
                throw new Error(`Failed to delete email template: ${error.message}`);
            }
        },

        // Duplicate email template
        duplicateEmailTemplate: async (parent, { id, name }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const original = await EmailTemplate.findById(id);
                if (!original) {
                    throw new UserInputError('Email template not found');
                }

                const duplicate = new EmailTemplate({
                    ...original.toObject(),
                    _id: undefined,
                    name,
                    slug: undefined, // Will be auto-generated
                    isDefault: false,
                    createdBy: user.id,
                    lastModifiedBy: user.id,
                    stats: {
                        sent: 0,
                        delivered: 0,
                        opened: 0,
                        clicked: 0,
                        bounced: 0,
                        unsubscribed: 0
                    },
                    previousVersions: []
                });

                await duplicate.save();
                return await EmailTemplate.findById(duplicate._id)
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to duplicate email template: ${error.message}`);
            }
        },

        // Set default template
        setDefaultTemplate: async (parent, { id, category }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                // Remove default flag from all templates in category
                await EmailTemplate.updateMany(
                    { category },
                    { isDefault: false }
                );

                // Set new default
                const template = await EmailTemplate.findByIdAndUpdate(
                    id,
                    { isDefault: true },
                    { new: true }
                ).populate('createdBy', 'name username email');

                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                return template;
            } catch (error) {
                throw new Error(`Failed to set default template: ${error.message}`);
            }
        },

        // Test email template
        testEmailTemplate: async (parent, { id, recipients, variables }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                const compiled = template.compile(variables);

                // Send test emails
                for (const email of recipients) {
                    await sendMail({
                        to: email,
                        subject: `[TEST] ${compiled.subject}`,
                        html: compiled.htmlContent,
                        text: compiled.textContent,
                        from: compiled.from
                    });
                }

                // Update last tested
                template.lastTested = new Date();
                await template.save();

                return true;
            } catch (error) {
                throw new Error(`Failed to send test email: ${error.message}`);
            }
        },

        // Revert template version
        revertTemplateVersion: async (parent, { id, version }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(id);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                await template.revertToVersion(version);
                template.lastModifiedBy = user.id;
                await template.save();

                return await EmailTemplate.findById(id)
                    .populate('createdBy', 'name username email')
                    .populate('lastModifiedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to revert template version: ${error.message}`);
            }
        },

        // Create email campaign
        createEmailCampaign: async (parent, { input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = new EmailCampaign({
                    ...input,
                    createdBy: user.id
                });

                await campaign.save();
                return await EmailCampaign.findById(campaign._id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to create email campaign: ${error.message}`);
            }
        },

        // Update email campaign
        updateEmailCampaign: async (parent, { id, input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                Object.keys(input).forEach(key => {
                    if (input[key] !== undefined) {
                        campaign[key] = input[key];
                    }
                });

                campaign.lastModifiedBy = user.id;
                await campaign.save();

                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email')
                    .populate('lastModifiedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to update email campaign: ${error.message}`);
            }
        },

        // Delete email campaign
        deleteEmailCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                await EmailCampaign.findByIdAndDelete(id);
                return true;
            } catch (error) {
                throw new Error(`Failed to delete email campaign: ${error.message}`);
            }
        },

        // Duplicate email campaign
        duplicateEmailCampaign: async (parent, { id, name }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const original = await EmailCampaign.findById(id);
                if (!original) {
                    throw new UserInputError('Email campaign not found');
                }

                const duplicate = new EmailCampaign({
                    ...original.toObject(),
                    _id: undefined,
                    name,
                    status: 'draft',
                    createdBy: user.id,
                    lastModifiedBy: user.id,
                    stats: {
                        sent: 0,
                        delivered: 0,
                        opened: 0,
                        clicked: 0,
                        unsubscribed: 0
                    }
                });

                await duplicate.save();
                return await EmailCampaign.findById(duplicate._id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to duplicate email campaign: ${error.message}`);
            }
        },

        // Start campaign
        startCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                await campaign.start();
                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to start campaign: ${error.message}`);
            }
        },

        // Pause campaign
        pauseCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                await campaign.pause();
                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to pause campaign: ${error.message}`);
            }
        },

        // Resume campaign
        resumeCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                await campaign.resume();
                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to resume campaign: ${error.message}`);
            }
        },

        // Cancel campaign
        cancelCampaign: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                await campaign.cancel();
                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to cancel campaign: ${error.message}`);
            }
        },

        // Approve email campaign
        approveEmailCampaign: async (parent, { id, notes }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                campaign.status = 'approved';
                if (notes) {
                    campaign.approvalNotes = notes;
                }
                campaign.approvedBy = user.id;
                campaign.approvedAt = new Date();
                await campaign.save();

                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email')
                    .populate('approvedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to approve email campaign: ${error.message}`);
            }
        },

        // Reject email campaign
        rejectEmailCampaign: async (parent, { id, reason }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                campaign.status = 'rejected';
                campaign.rejectionReason = reason;
                campaign.rejectedBy = user.id;
                campaign.rejectedAt = new Date();
                await campaign.save();

                return await EmailCampaign.findById(id)
                    .populate('template')
                    .populate('createdBy', 'name username email')
                    .populate('rejectedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to reject email campaign: ${error.message}`);
            }
        },

        // Test campaign
        testCampaign: async (parent, { id, recipients }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const campaign = await EmailCampaign.findById(id);
                if (!campaign) {
                    throw new UserInputError('Email campaign not found');
                }

                // Send test emails
                for (const email of recipients) {
                    await sendMail({
                        to: email,
                        subject: `[TEST] ${campaign.subject}`,
                        html: campaign.content,
                        from: campaign.from || process.env.DEFAULT_FROM_EMAIL
                    });
                }

                return true;
            } catch (error) {
                throw new Error(`Failed to test campaign: ${error.message}`);
            }
        },

        // Send quick email
        sendQuickEmail: async (parent, { template: templateId, recipients, variables, customSubject }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const template = await EmailTemplate.findById(templateId);
                if (!template) {
                    throw new UserInputError('Email template not found');
                }

                const compiled = template.compile(variables);

                // Send emails
                for (const email of recipients) {
                    await sendMail({
                        to: email,
                        subject: customSubject || compiled.subject,
                        html: compiled.htmlContent,
                        text: compiled.textContent,
                        from: compiled.from
                    });
                }

                // Record stats
                await template.recordSent(recipients.length);

                return true;
            } catch (error) {
                throw new Error(`Failed to send quick email: ${error.message}`);
            }
        }
    }
};

export default emailTemplateResolvers;
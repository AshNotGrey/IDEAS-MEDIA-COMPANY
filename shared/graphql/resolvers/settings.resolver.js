import { models } from '../../mongoDB/index.js';

const settingsResolvers = {
    Query: {
        // Get paginated settings with filtering
        settings: async (_, { filter = {}, page = 1, limit = 50 }, { user }) => {
            // Check admin access
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const query = { isActive: true };

            // Apply filters
            if (filter.category) query.category = filter.category;
            if (filter.accessLevel) {
                if (user.role === 'super_admin' || filter.accessLevel !== 'super_admin') {
                    query.accessLevel = filter.accessLevel;
                }
            } else {
                // Default access level filtering
                if (user.role !== 'super_admin') {
                    query.accessLevel = { $ne: 'super_admin' };
                }
            }
            if (filter.environment) query.environment = { $in: ['all', filter.environment] };
            if (filter.isSecret !== undefined) query.isSecret = filter.isSecret;
            if (filter.search) {
                query.$or = [
                    { name: { $regex: filter.search, $options: 'i' } },
                    { key: { $regex: filter.search, $options: 'i' } },
                    { description: { $regex: filter.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const total = await models.Settings.countDocuments(query);
            const settings = await models.Settings.find(query)
                .populate('lastModifiedBy', 'username email')
                .populate('history.changedBy', 'username email')
                .sort({ category: 1, 'ui.order': 1, name: 1 })
                .skip(skip)
                .limit(limit);

            return {
                settings,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        },

        // Get single setting by key
        setting: async (_, { key }, { user }) => {
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const query = { key, isActive: true };

            const setting = await models.Settings.findOne(query)
                .populate('lastModifiedBy', 'username email')
                .populate('history.changedBy', 'username email');

            if (!setting) {
                throw new Error(`Setting with key '${key}' not found`);
            }

            // Check access level
            if (setting.accessLevel === 'super_admin' && user.role !== 'super_admin') {
                throw new Error('Access denied. Super admin privileges required.');
            }

            return setting;
        },

        // Get settings by category
        settingsByCategory: async (_, { category }, { user }) => {
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const accessLevel = user.role === 'super_admin' ? 'super_admin' : 'admin';
            return await models.Settings.getByCategory(category, accessLevel);
        },

        // Get public settings (for client apps)
        publicSettings: async () => {
            return await models.Settings.find({
                accessLevel: 'public',
                isActive: true
            }).select('key name value type defaultValue category');
        }
    },

    Mutation: {
        // Update single setting
        updateSetting: async (_, { input }, { user, req }) => {
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const setting = await models.Settings.findOne({ key: input.key, isActive: true });

            if (!setting) {
                throw new Error(`Setting with key '${input.key}' not found`);
            }

            // Check access level
            if (setting.accessLevel === 'super_admin' && user.role !== 'super_admin') {
                throw new Error('Access denied. Super admin privileges required.');
            }

            // Validate the new value
            const validation = setting.validate(input.value);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.error}`);
            }

            // Update using the model method to maintain history
            await setting.updateValue(
                input.value,
                user._id,
                input.reason || 'Updated via admin panel',
                req.ip || req.connection.remoteAddress
            );

            return await models.Settings.findById(setting._id)
                .populate('lastModifiedBy', 'username email')
                .populate('history.changedBy', 'username email');
        },

        // Reset setting to default
        resetSetting: async (_, { key, reason = 'Reset to default' }, { user, req }) => {
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const setting = await models.Settings.findOne({ key, isActive: true });

            if (!setting) {
                throw new Error(`Setting with key '${key}' not found`);
            }

            // Check access level
            if (setting.accessLevel === 'super_admin' && user.role !== 'super_admin') {
                throw new Error('Access denied. Super admin privileges required.');
            }

            await setting.resetToDefault(user._id, reason);

            return await models.Settings.findById(setting._id)
                .populate('lastModifiedBy', 'username email')
                .populate('history.changedBy', 'username email');
        },

        // Bulk update settings
        bulkUpdateSettings: async (_, { inputs }, { user, req }) => {
            if (user.constructor.modelName !== 'Admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            const results = [];
            const errors = [];

            for (const input of inputs) {
                try {
                    const setting = await models.Settings.findOne({ key: input.key, isActive: true });

                    if (!setting) {
                        errors.push(`Setting with key '${input.key}' not found`);
                        continue;
                    }

                    // Check access level
                    if (setting.accessLevel === 'super_admin' && user.role !== 'super_admin') {
                        errors.push(`Access denied for setting '${input.key}'. Super admin privileges required.`);
                        continue;
                    }

                    // Validate the new value
                    const validation = setting.validate(input.value);
                    if (!validation.valid) {
                        errors.push(`Validation failed for '${input.key}': ${validation.error}`);
                        continue;
                    }

                    await setting.updateValue(
                        input.value,
                        user._id,
                        input.reason || 'Bulk update via admin panel',
                        req.ip || req.connection.remoteAddress
                    );

                    const updatedSetting = await models.Settings.findById(setting._id)
                        .populate('lastModifiedBy', 'username email')
                        .populate('history.changedBy', 'username email');

                    results.push(updatedSetting);
                } catch (error) {
                    errors.push(`Error updating '${input.key}': ${error.message}`);
                }
            }

            if (errors.length > 0) {
                throw new Error(`Bulk update completed with errors: ${errors.join(', ')}`);
            }

            return results;
        }
    }
};

export default settingsResolvers; 
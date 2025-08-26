import { models } from '../../mongoDB/index.js';

const serviceResolvers = {
    Query: {
        services: async (_, { filter = {} }) => {
            try {
                const query = {};

                // Apply filters
                if (filter.category) query.category = filter.category;
                if (filter.isActive !== undefined) query.isActive = filter.isActive;
                if (filter.featured !== undefined) query.featured = filter.featured;
                if (filter.minPrice || filter.maxPrice) {
                    query.basePrice = {};
                    if (filter.minPrice) query.basePrice.$gte = filter.minPrice;
                    if (filter.maxPrice) query.basePrice.$lte = filter.maxPrice;
                }

                return await models.Service.find(query)
                    .sort({ featured: -1, createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch services');
            }
        },

        service: async (_, { id }) => {
            try {
                const service = await models.Service.findById(id);
                if (!service) {
                    throw new Error('Service not found');
                }
                return service;
            } catch (error) {
                throw new Error('Failed to fetch service');
            }
        },

        featuredServices: async () => {
            try {
                return await models.Service.find({
                    featured: true,
                    isActive: true
                }).sort({ createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch featured services');
            }
        },

        servicesByCategory: async (_, { category }) => {
            try {
                return await models.Service.find({
                    category,
                    isActive: true
                }).sort({ featured: -1, createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch services by category');
            }
        },

        // Admin-only queries
        serviceStats: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const totalServices = await models.Service.countDocuments();
                const activeServices = await models.Service.countDocuments({ isActive: true });
                const featuredServices = await models.Service.countDocuments({ featured: true });
                const inactiveServices = totalServices - activeServices;

                // Category breakdown
                const categoryStats = await models.Service.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]);

                // Average pricing by category
                const avgPricing = await models.Service.aggregate([
                    {
                        $group: {
                            _id: '$category',
                            avgPrice: { $avg: '$basePrice' },
                            minPrice: { $min: '$basePrice' },
                            maxPrice: { $max: '$basePrice' }
                        }
                    },
                    { $sort: { avgPrice: -1 } }
                ]);

                return {
                    totalServices,
                    activeServices,
                    inactiveServices,
                    featuredServices,
                    categoryStats,
                    avgPricing
                };
            } catch (error) {
                throw new Error('Failed to fetch service statistics');
            }
        },

        allServices: async (_, { page = 1, limit = 20, search, category, sortBy = "createdAt", sortOrder = "desc" }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const skip = (page - 1) * limit;
                const query = {};

                // Search functionality
                if (search) {
                    query.$text = { $search: search };
                }

                // Category filter
                if (category) {
                    query.category = category;
                }

                // Sort configuration
                const sortConfig = {};
                sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

                const services = await models.Service.find(query)
                    .sort(sortConfig)
                    .skip(skip)
                    .limit(limit);

                const total = await models.Service.countDocuments(query);

                return {
                    services,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                };
            } catch (error) {
                throw new Error('Failed to fetch all services');
            }
        }
    },

    Mutation: {
        createService: async (_, { input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const service = await models.Service.create(input);

                try { await context?.audit?.('Mutation.createService', { serviceId: service._id }, { status: 'success' }); } catch (_) { }
                return service;
            } catch (error) {
                try { await context?.audit?.('Mutation.createService', input, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updateService: async (_, { id, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const service = await models.Service.findByIdAndUpdate(
                    id,
                    input,
                    { new: true, runValidators: true }
                );

                if (!service) {
                    throw new Error('Service not found');
                }

                try { await context?.audit?.('Mutation.updateService', { serviceId: id }, { status: 'success' }); } catch (_) { }
                return service;
            } catch (error) {
                try { await context?.audit?.('Mutation.updateService', { serviceId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        deleteService: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const service = await models.Service.findByIdAndDelete(id);

                if (!service) {
                    throw new Error('Service not found');
                }

                try { await context?.audit?.('Mutation.deleteService', { serviceId: id }, { status: 'success' }); } catch (_) { }
                return service;
            } catch (error) {
                try { await context?.audit?.('Mutation.deleteService', { serviceId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        toggleServiceStatus: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const service = await models.Service.findById(id);
                if (!service) {
                    throw new Error('Service not found');
                }

                service.isActive = !service.isActive;
                await service.save();

                try { await context?.audit?.('Mutation.toggleServiceStatus', { serviceId: id, newStatus: service.isActive }, { status: 'success' }); } catch (_) { }
                return service;
            } catch (error) {
                try { await context?.audit?.('Mutation.toggleServiceStatus', { serviceId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        toggleServiceFeatured: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const service = await models.Service.findById(id);
                if (!service) {
                    throw new Error('Service not found');
                }

                service.featured = !service.featured;
                await service.save();

                try { await context?.audit?.('Mutation.toggleServiceFeatured', { serviceId: id, newFeatured: service.featured }, { status: 'success' }); } catch (_) { }
                return service;
            } catch (error) {
                try { await context?.audit?.('Mutation.toggleServiceFeatured', { serviceId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkUpdateServices: async (_, { ids, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const services = await models.Service.find({ _id: { $in: ids } });

                if (services.length === 0) {
                    throw new Error('No services found with provided IDs');
                }

                // Update services
                await models.Service.updateMany(
                    { _id: { $in: ids } },
                    input
                );

                // Return updated services
                const updatedServices = await models.Service.find({ _id: { $in: ids } });

                try { await context?.audit?.('Mutation.bulkUpdateServices', { serviceIds: ids, updateCount: updatedServices.length }, { status: 'success' }); } catch (_) { }
                return updatedServices;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkUpdateServices', { serviceIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkDeleteServices: async (_, { ids }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const result = await models.Service.deleteMany({ _id: { $in: ids } });

                if (result.deletedCount === 0) {
                    throw new Error('No services found with provided IDs');
                }

                try { await context?.audit?.('Mutation.bulkDeleteServices', { serviceIds: ids, deletedCount: result.deletedCount }, { status: 'success' }); } catch (_) { }
                return result.deletedCount > 0;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkDeleteServices', { serviceIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        }
    }
};

export default serviceResolvers; 
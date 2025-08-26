import { models } from '../../mongoDB/index.js';

const galleryResolvers = {
    Query: {
        galleries: async (_, { filter = {} }) => {
            try {
                const query = {};

                // Apply filters
                if (filter.category) query.category = filter.category;
                if (filter.isPublished !== undefined) query.isPublished = filter.isPublished;
                if (filter.featured !== undefined) query.featured = filter.featured;

                return await models.Gallery.find(query)
                    .populate('createdBy', 'name email')
                    .sort({ featured: -1, createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch galleries');
            }
        },

        gallery: async (_, { id }) => {
            try {
                const gallery = await models.Gallery.findById(id)
                    .populate('createdBy', 'name email');
                if (!gallery) {
                    throw new Error('Gallery not found');
                }
                return gallery;
            } catch (error) {
                throw new Error('Failed to fetch gallery');
            }
        },

        publicGalleries: async () => {
            try {
                return await models.Gallery.find({
                    isPublished: true
                })
                    .populate('createdBy', 'name email')
                    .sort({ featured: -1, createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch public galleries');
            }
        },

        featuredGalleries: async () => {
            try {
                return await models.Gallery.find({
                    featured: true,
                    isPublished: true
                })
                    .populate('createdBy', 'name email')
                    .sort({ createdAt: -1 });
            } catch (error) {
                throw new Error('Failed to fetch featured galleries');
            }
        },

        // Admin-only queries
        galleryStats: async (_, __, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const totalGalleries = await models.Gallery.countDocuments();
                const publishedGalleries = await models.Gallery.countDocuments({ isPublished: true });
                const featuredGalleries = await models.Gallery.countDocuments({ featured: true });
                const unpublishedGalleries = totalGalleries - publishedGalleries;

                // Category breakdown
                const categoryStats = await models.Gallery.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]);

                // Monthly gallery creation
                const monthlyStats = await models.Gallery.aggregate([
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': -1, '_id.month': -1 } },
                    { $limit: 6 }
                ]);

                return {
                    totalGalleries,
                    publishedGalleries,
                    unpublishedGalleries,
                    featuredGalleries,
                    categoryStats,
                    monthlyStats
                };
            } catch (error) {
                throw new Error('Failed to fetch gallery statistics');
            }
        },

        allGalleries: async (_, { page = 1, limit = 20, search, category, published, sortBy = "createdAt", sortOrder = "desc" }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const skip = (page - 1) * limit;
                const query = {};

                // Search functionality
                if (search) {
                    query.$or = [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { tags: { $in: [new RegExp(search, 'i')] } }
                    ];
                }

                // Category filter
                if (category) {
                    query.category = category;
                }

                // Published filter
                if (published !== undefined) {
                    query.isPublished = published;
                }

                // Sort configuration
                const sortConfig = {};
                sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

                const galleries = await models.Gallery.find(query)
                    .populate('createdBy', 'name email')
                    .sort(sortConfig)
                    .skip(skip)
                    .limit(limit);

                const total = await models.Gallery.countDocuments(query);

                return {
                    galleries,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                };
            } catch (error) {
                throw new Error('Failed to fetch all galleries');
            }
        }
    },

    Mutation: {
        createGallery: async (_, { input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const galleryData = {
                    ...input,
                    createdBy: user._id
                };

                const gallery = await models.Gallery.create(galleryData);
                const populatedGallery = await models.Gallery.findById(gallery._id)
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.createGallery', { galleryId: gallery._id }, { status: 'success' }); } catch (_) { }
                return populatedGallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.createGallery', input, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        updateGallery: async (_, { id, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findByIdAndUpdate(
                    id,
                    input,
                    { new: true, runValidators: true }
                ).populate('createdBy', 'name email');

                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                try { await context?.audit?.('Mutation.updateGallery', { galleryId: id }, { status: 'success' }); } catch (_) { }
                return gallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.updateGallery', { galleryId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        deleteGallery: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findByIdAndDelete(id)
                    .populate('createdBy', 'name email');

                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                try { await context?.audit?.('Mutation.deleteGallery', { galleryId: id }, { status: 'success' }); } catch (_) { }
                return gallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.deleteGallery', { galleryId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        toggleGalleryPublished: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findById(id);
                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                gallery.isPublished = !gallery.isPublished;
                await gallery.save();

                const populatedGallery = await models.Gallery.findById(id)
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.toggleGalleryPublished', { galleryId: id, newStatus: gallery.isPublished }, { status: 'success' }); } catch (_) { }
                return populatedGallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.toggleGalleryPublished', { galleryId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        toggleGalleryFeatured: async (_, { id }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findById(id);
                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                gallery.featured = !gallery.featured;
                await gallery.save();

                const populatedGallery = await models.Gallery.findById(id)
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.toggleGalleryFeatured', { galleryId: id, newFeatured: gallery.featured }, { status: 'success' }); } catch (_) { }
                return populatedGallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.toggleGalleryFeatured', { galleryId: id }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        addImageToGallery: async (_, { galleryId, image }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findById(galleryId);
                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                // Add image with proper order
                const newImage = {
                    ...image,
                    order: image.order || gallery.images.length
                };

                gallery.images.push(newImage);
                await gallery.save();

                const populatedGallery = await models.Gallery.findById(galleryId)
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.addImageToGallery', { galleryId, imageUrl: image.url }, { status: 'success' }); } catch (_) { }
                return populatedGallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.addImageToGallery', { galleryId }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        removeImageFromGallery: async (_, { galleryId, imageUrl }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const gallery = await models.Gallery.findById(galleryId);
                if (!gallery) {
                    throw new Error('Gallery not found');
                }

                // Remove image
                gallery.images = gallery.images.filter(img => img.url !== imageUrl);
                await gallery.save();

                const populatedGallery = await models.Gallery.findById(galleryId)
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.removeImageFromGallery', { galleryId, imageUrl }, { status: 'success' }); } catch (_) { }
                return populatedGallery;
            } catch (error) {
                try { await context?.audit?.('Mutation.removeImageFromGallery', { galleryId }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkUpdateGalleries: async (_, { ids, input }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const galleries = await models.Gallery.find({ _id: { $in: ids } });

                if (galleries.length === 0) {
                    throw new Error('No galleries found with provided IDs');
                }

                // Update galleries
                await models.Gallery.updateMany(
                    { _id: { $in: ids } },
                    input
                );

                // Return updated galleries
                const updatedGalleries = await models.Gallery.find({ _id: { $in: ids } })
                    .populate('createdBy', 'name email');

                try { await context?.audit?.('Mutation.bulkUpdateGalleries', { galleryIds: ids, updateCount: updatedGalleries.length }, { status: 'success' }); } catch (_) { }
                return updatedGalleries;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkUpdateGalleries', { galleryIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        },

        bulkDeleteGalleries: async (_, { ids }, { user, ...context }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new Error('Admin access required');
            }
            try {
                const result = await models.Gallery.deleteMany({ _id: { $in: ids } });

                if (result.deletedCount === 0) {
                    throw new Error('No galleries found with provided IDs');
                }

                try { await context?.audit?.('Mutation.bulkDeleteGalleries', { galleryIds: ids, deletedCount: result.deletedCount }, { status: 'success' }); } catch (_) { }
                return result.deletedCount > 0;
            } catch (error) {
                try { await context?.audit?.('Mutation.bulkDeleteGalleries', { galleryIds: ids }, { status: 'failure', message: error.message }); } catch (_) { }
                throw new Error(error.message);
            }
        }
    }
};

export default galleryResolvers; 
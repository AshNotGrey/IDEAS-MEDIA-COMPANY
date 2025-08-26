import Media from '../../mongoDB/models/Media.js';
import {
    deleteFromCloudinary,
    createFolder,
    getFolderContents
} from '../../utils/cloudinary.js';
import { AuthenticationError, ForbiddenError, UserInputError } from '../errors.js';

const mediaResolvers = {
    Query: {
        // Get media files with filtering and pagination
        getMedia: async (parent, { filter = {}, sort = { field: 'createdAt', direction: 'DESC' }, page = 1, limit = 20 }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const query = { isActive: true };

                // Apply filters
                if (filter.category) query.category = filter.category;
                if (filter.type) query.type = filter.type;
                if (filter.status) query.status = filter.status;
                if (filter.isPublic !== undefined) query.isPublic = filter.isPublic;
                if (filter.uploadedBy) query.uploadedBy = filter.uploadedBy;

                if (filter.tags && filter.tags.length > 0) {
                    query.tags = { $in: filter.tags };
                }

                if (filter.search) {
                    query.$or = [
                        { originalName: { $regex: filter.search, $options: 'i' } },
                        { description: { $regex: filter.search, $options: 'i' } },
                        { tags: { $in: [new RegExp(filter.search, 'i')] } },
                        { alt: { $regex: filter.search, $options: 'i' } }
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

                const [media, total] = await Promise.all([
                    Media.find(query)
                        .populate('uploadedBy', 'name username email')
                        .sort(sortOptions)
                        .skip(skip)
                        .limit(limit),
                    Media.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    media,
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
                throw new Error(`Failed to fetch media: ${error.message}`);
            }
        },

        // Get single media file by ID
        getMediaById: async (parent, { id }, { user }) => {
            if (!user) {
                throw new AuthenticationError('Authentication required');
            }

            try {
                const media = await Media.findById(id)
                    .populate('uploadedBy', 'name username email')
                    .populate('originalMedia');

                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                // Check access permissions
                if (!media.isPublic && user.constructor.modelName !== 'Admin' && media.uploadedBy._id.toString() !== user.id) {
                    throw new ForbiddenError('Access denied to this media file');
                }

                return media;
            } catch (error) {
                throw new Error(`Failed to fetch media: ${error.message}`);
            }
        },

        // Get media by category
        getMediaByCategory: async (parent, { category, limit = 50 }, { user }) => {
            if (!user) {
                throw new AuthenticationError('Authentication required');
            }

            try {
                const query = { category, isActive: true };

                // Non-admin users can only see public media
                if (user.constructor.modelName !== 'Admin') {
                    query.isPublic = true;
                }

                return await Media.findByCategory(category, { limit });
            } catch (error) {
                throw new Error(`Failed to fetch media by category: ${error.message}`);
            }
        },

        // Get media uploaded by user
        getMediaByUploader: async (parent, { uploaderId, uploaderModel = 'User' }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                return await Media.findByUploader(uploaderId, uploaderModel);
            } catch (error) {
                throw new Error(`Failed to fetch media by uploader: ${error.message}`);
            }
        },

        // Get media usage statistics
        getMediaStats: async (parent, args, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const stats = await Media.getUsageStats();
                const totalFiles = await Media.countDocuments({ isActive: true });
                const totalSizeResult = await Media.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
                ]);

                return {
                    totalFiles,
                    totalSize: totalSizeResult[0]?.totalSize || 0,
                    byType: stats
                };
            } catch (error) {
                throw new Error(`Failed to fetch media stats: ${error.message}`);
            }
        },

        // Get folder contents from Cloudinary
        getFolderContents: async (parent, { folderPath, maxResults = 50, nextCursor }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const contents = await getFolderContents(folderPath, {
                    max_results: maxResults,
                    next_cursor: nextCursor
                });

                return {
                    resources: contents.resources || [],
                    next_cursor: contents.next_cursor,
                    total_count: contents.total_count || 0
                };
            } catch (error) {
                throw new Error(`Failed to fetch folder contents: ${error.message}`);
            }
        },

        // Search media files
        searchMedia: async (parent, { query, filters = {}, limit = 20 }, { user }) => {
            if (!user) {
                throw new AuthenticationError('Authentication required');
            }

            try {
                const searchQuery = {
                    isActive: true,
                    $or: [
                        { originalName: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { tags: { $in: [new RegExp(query, 'i')] } },
                        { alt: { $regex: query, $options: 'i' } }
                    ]
                };

                // Apply additional filters
                if (filters.category) searchQuery.category = filters.category;
                if (filters.type) searchQuery.type = filters.type;
                if (user.constructor.modelName !== 'Admin') {
                    searchQuery.isPublic = true;
                }

                return await Media.find(searchQuery)
                    .populate('uploadedBy', 'name username email')
                    .limit(limit)
                    .sort('-createdAt');
            } catch (error) {
                throw new Error(`Failed to search media: ${error.message}`);
            }
        }
    },

    Mutation: {
        // Update media metadata
        updateMedia: async (parent, { id, input }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const media = await Media.findById(id);
                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                // Update fields
                Object.keys(input).forEach(key => {
                    if (input[key] !== undefined) {
                        media[key] = input[key];
                    }
                });

                await media.save();
                return await Media.findById(id).populate('uploadedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to update media: ${error.message}`);
            }
        },

        // Delete media file
        deleteMedia: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const media = await Media.findById(id);
                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                // Delete from Cloudinary
                await deleteFromCloudinary(media.cloudinaryId, media.type === 'video' ? 'video' : 'image');

                // Delete from database
                await Media.findByIdAndDelete(id);

                return true;
            } catch (error) {
                throw new Error(`Failed to delete media: ${error.message}`);
            }
        },

        // Delete multiple media files
        deleteMultipleMedia: async (parent, { ids }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const mediaFiles = await Media.find({ _id: { $in: ids } });

                // Delete from Cloudinary
                for (const media of mediaFiles) {
                    try {
                        await deleteFromCloudinary(media.cloudinaryId, media.type === 'video' ? 'video' : 'image');
                    } catch (error) {
                        console.error(`Failed to delete ${media.cloudinaryId} from Cloudinary:`, error);
                    }
                }

                // Delete from database
                await Media.deleteMany({ _id: { $in: ids } });

                return true;
            } catch (error) {
                throw new Error(`Failed to delete multiple media files: ${error.message}`);
            }
        },

        // Create folder in Cloudinary
        createMediaFolder: async (parent, { folderPath }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                await createFolder(folderPath);
                return true;
            } catch (error) {
                throw new Error(`Failed to create folder: ${error.message}`);
            }
        },

        // Record media usage
        recordMediaUsage: async (parent, { mediaId, modelName, modelId, field }, { user }) => {
            if (!user) {
                throw new AuthenticationError('Authentication required');
            }

            try {
                const media = await Media.findById(mediaId);
                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                await media.recordUsage(modelName, modelId, field);
                return await Media.findById(mediaId).populate('uploadedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to record media usage: ${error.message}`);
            }
        },

        // Update media tags
        updateMediaTags: async (parent, { id, tags, action = 'REPLACE' }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const media = await Media.findById(id);
                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                switch (action) {
                    case 'REPLACE':
                        media.tags = tags;
                        break;
                    case 'ADD':
                        media.tags = [...new Set([...media.tags, ...tags])];
                        break;
                    case 'REMOVE':
                        media.tags = media.tags.filter(tag => !tags.includes(tag));
                        break;
                }

                await media.save();
                return await Media.findById(id).populate('uploadedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to update media tags: ${error.message}`);
            }
        },

        // Archive/Unarchive media
        toggleMediaArchive: async (parent, { id }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const media = await Media.findById(id);
                if (!media) {
                    throw new UserInputError('Media file not found');
                }

                media.status = media.status === 'archived' ? 'ready' : 'archived';
                await media.save();

                return await Media.findById(id).populate('uploadedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to toggle media archive status: ${error.message}`);
            }
        },

        // Bulk update media
        bulkUpdateMedia: async (parent, { ids, updates }, { user }) => {
            if (!user || user.constructor.modelName !== 'Admin') {
                throw new ForbiddenError('Admin access required');
            }

            try {
                const updateFields = {};
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== undefined) {
                        updateFields[key] = updates[key];
                    }
                });

                await Media.updateMany(
                    { _id: { $in: ids } },
                    { $set: updateFields }
                );

                return await Media.find({ _id: { $in: ids } })
                    .populate('uploadedBy', 'name username email');
            } catch (error) {
                throw new Error(`Failed to bulk update media: ${error.message}`);
            }
        }
    }
};

export default mediaResolvers;

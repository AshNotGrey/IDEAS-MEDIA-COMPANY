import express from 'express';
import { CLOUDINARY_CLOUD_NAME } from '../config/env.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';
import {
    uploadToCloudinary,
    deleteFromCloudinary,
    generateImageVariants,
    getFolderContents,
    createFolder
} from '@ideal-photography/shared/utils/cloudinary.js';
import Media from '@ideal-photography/shared/mongoDB/models/Media.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload status check
router.get('/status', (req, res) => {
    res.json({
        message: 'Upload service is available',
        cloudinary: CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured',
        maxFileSize: '10MB',
        supportedTypes: ['image', 'document', 'video']
    });
});

// Single file upload
router.post('/single', requireAuth, uploadSingle('file'), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided'
            });
        }

        const { category = 'other', folder = 'uploads', tags = [], alt, description } = req.body;

        // Prepare upload options
        const uploadOptions = {
            folder: `${folder}/${category}`,
            tags: [category, ...tags.split(',').map(t => t.trim()).filter(Boolean)],
            resource_type: 'auto'
        };

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, uploadOptions);

        // Create Media record in database
        const mediaData = {
            filename: cloudinaryResult.public_id.split('/').pop(),
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            cloudinaryId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            secureUrl: cloudinaryResult.secure_url,
            category,
            folder: uploadOptions.folder,
            tags: uploadOptions.tags,
            alt: alt || '',
            description: description || '',
            uploadedBy: req.user.id,
            uploaderModel: req.user.constructor.modelName || 'Admin',
            format: cloudinaryResult.format,
            dimensions: {
                width: cloudinaryResult.width,
                height: cloudinaryResult.height
            }
        };

        // Generate transformations for images
        if (cloudinaryResult.resource_type === 'image') {
            mediaData.transformations = generateImageVariants(cloudinaryResult.public_id);
        }

        const media = new Media(mediaData);
        await media.save();

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                media,
                cloudinary: cloudinaryResult
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: 'UPLOAD_FAILED'
        });
    }
});

// Multiple files upload
router.post('/multiple', requireAuth, uploadMultiple('files', 10), handleUploadError, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files provided'
            });
        }

        const { category = 'other', folder = 'uploads', tags = [] } = req.body;
        const uploadResults = [];
        const errors = [];

        for (const file of req.files) {
            try {
                // Prepare upload options
                const uploadOptions = {
                    folder: `${folder}/${category}`,
                    tags: [category, ...tags.split(',').map(t => t.trim()).filter(Boolean)],
                    resource_type: 'auto'
                };

                // Upload to Cloudinary
                const cloudinaryResult = await uploadToCloudinary(file.buffer, uploadOptions);

                // Create Media record
                const mediaData = {
                    filename: cloudinaryResult.public_id.split('/').pop(),
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: file.size,
                    cloudinaryId: cloudinaryResult.public_id,
                    url: cloudinaryResult.secure_url,
                    secureUrl: cloudinaryResult.secure_url,
                    category,
                    folder: uploadOptions.folder,
                    tags: uploadOptions.tags,
                    uploadedBy: req.user.id,
                    uploaderModel: req.user.constructor.modelName || 'Admin',
                    format: cloudinaryResult.format,
                    dimensions: {
                        width: cloudinaryResult.width,
                        height: cloudinaryResult.height
                    }
                };

                if (cloudinaryResult.resource_type === 'image') {
                    mediaData.transformations = generateImageVariants(cloudinaryResult.public_id);
                }

                const media = new Media(mediaData);
                await media.save();

                uploadResults.push({
                    success: true,
                    filename: file.originalname,
                    media,
                    cloudinary: cloudinaryResult
                });

            } catch (error) {
                errors.push({
                    success: false,
                    filename: file.originalname,
                    error: error.message
                });
            }
        }

        res.json({
            success: uploadResults.length > 0,
            message: `${uploadResults.length} files uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
            data: {
                successful: uploadResults,
                failed: errors,
                summary: {
                    total: req.files.length,
                    successful: uploadResults.length,
                    failed: errors.length
                }
            }
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: 'MULTIPLE_UPLOAD_FAILED'
        });
    }
});

// Get media files
router.get('/media', requireAuth, async (req, res) => {
    try {
        const {
            category,
            type,
            page = 1,
            limit = 20,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { isActive: true };

        if (category) query.category = category;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { originalName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const [media, total] = await Promise.all([
            Media.find(query)
                .populate('uploadedBy', 'name username email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            Media.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                media,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single media file
router.get('/media/:id', requireAuth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('uploadedBy', 'name username email')
            .populate('usedBy.modelId');

        if (!media) {
            return res.status(404).json({
                success: false,
                error: 'Media file not found'
            });
        }

        res.json({
            success: true,
            data: media
        });

    } catch (error) {
        console.error('Get media by ID error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update media metadata
router.put('/media/:id', requireAuth, async (req, res) => {
    try {
        const { alt, description, tags, category } = req.body;

        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({
                success: false,
                error: 'Media file not found'
            });
        }

        // Update fields
        if (alt !== undefined) media.alt = alt;
        if (description !== undefined) media.description = description;
        if (tags !== undefined) media.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        if (category !== undefined) media.category = category;

        await media.save();

        res.json({
            success: true,
            message: 'Media metadata updated successfully',
            data: media
        });

    } catch (error) {
        console.error('Update media error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete media file
router.delete('/media/:id', requireAuth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({
                success: false,
                error: 'Media file not found'
            });
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(media.cloudinaryId, media.type === 'video' ? 'video' : 'image');

        // Delete from database
        await Media.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Media file deleted successfully'
        });

    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get folder contents from Cloudinary
router.get('/folders/:folderPath', requireAuth, async (req, res) => {
    try {
        const { folderPath } = req.params;
        const { max_results = 50, next_cursor } = req.query;

        const contents = await getFolderContents(folderPath, {
            max_results: parseInt(max_results),
            next_cursor
        });

        res.json({
            success: true,
            data: contents
        });

    } catch (error) {
        console.error('Get folder contents error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create folder in Cloudinary
router.post('/folders', requireAuth, async (req, res) => {
    try {
        const { folderPath } = req.body;

        if (!folderPath) {
            return res.status(400).json({
                success: false,
                error: 'Folder path is required'
            });
        }

        const result = await createFolder(folderPath);

        res.json({
            success: true,
            message: 'Folder created successfully',
            data: result
        });

    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get media usage statistics
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const stats = await Media.getUsageStats();

        const totalFiles = await Media.countDocuments({ isActive: true });
        const totalSize = await Media.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalFiles,
                totalSize: totalSize[0]?.totalSize || 0,
                byType: stats
            }
        });

    } catch (error) {
        console.error('Get media stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;

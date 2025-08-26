import { v2 as cloudinary } from 'cloudinary';
// Use environment variables directly since config is in different servers
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload file to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
    const {
        folder = 'uploads',
        public_id,
        resource_type = 'auto',
        transformation,
        tags = [],
        overwrite = false,
        unique_filename = true,
        use_filename = false
    } = options;

    try {
        const uploadOptions = {
            folder,
            resource_type,
            overwrite,
            unique_filename,
            use_filename,
            tags: Array.isArray(tags) ? tags : [tags].filter(Boolean)
        };

        if (public_id) {
            uploadOptions.public_id = public_id;
        }

        if (transformation) {
            uploadOptions.transformation = transformation;
        }

        let uploadResult;

        if (Buffer.isBuffer(file)) {
            // Upload from buffer
            uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(file);
            });
        } else {
            // Upload from file path or URL
            uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
        }

        return uploadResult;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
};

/**
 * Generate transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformation - Transformation options
 * @returns {string} Transformed URL
 */
export const generateTransformationUrl = (publicId, transformation = {}) => {
    try {
        return cloudinary.url(publicId, {
            ...transformation,
            secure: true
        });
    } catch (error) {
        console.error('Cloudinary URL generation error:', error);
        return null;
    }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
    const {
        width = 'auto',
        height = 'auto',
        crop = 'scale',
        quality = 'auto',
        format = 'auto'
    } = options;

    return generateTransformationUrl(publicId, {
        width,
        height,
        crop,
        quality,
        fetch_format: format
    });
};

/**
 * Generate image variants for different use cases
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Object with different image variants
 */
export const generateImageVariants = (publicId) => {
    return {
        thumbnail: generateTransformationUrl(publicId, {
            width: 150,
            height: 150,
            crop: 'thumb',
            gravity: 'face'
        }),
        small: generateTransformationUrl(publicId, {
            width: 300,
            crop: 'scale',
            quality: 'auto',
            fetch_format: 'auto'
        }),
        medium: generateTransformationUrl(publicId, {
            width: 600,
            crop: 'scale',
            quality: 'auto',
            fetch_format: 'auto'
        }),
        large: generateTransformationUrl(publicId, {
            width: 1200,
            crop: 'scale',
            quality: 'auto',
            fetch_format: 'auto'
        }),
        optimized: generateTransformationUrl(publicId, {
            quality: 'auto',
            fetch_format: 'auto'
        })
    };
};

/**
 * Upload multiple files
 * @param {Array} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleFiles = async (files, options = {}) => {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));

    try {
        const results = await Promise.allSettled(uploadPromises);

        return results.map((result, index) => ({
            index,
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null
        }));
    } catch (error) {
        throw new Error(`Failed to upload multiple files: ${error.message}`);
    }
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} File information
 */
export const getFileInfo = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary get file info error:', error);
        throw new Error(`Failed to get file info: ${error.message}`);
    }
};

/**
 * Search files in Cloudinary
 * @param {Object} searchOptions - Search parameters
 * @returns {Promise<Object>} Search results
 */
export const searchFiles = async (searchOptions = {}) => {
    const {
        expression = '',
        sort_by = [['created_at', 'desc']],
        max_results = 50,
        next_cursor
    } = searchOptions;

    try {
        const searchParams = {
            expression,
            sort_by,
            max_results
        };

        if (next_cursor) {
            searchParams.next_cursor = next_cursor;
        }

        const result = await cloudinary.search.expression(expression)
            .sort_by(...sort_by)
            .max_results(max_results)
            .execute();

        return result;
    } catch (error) {
        console.error('Cloudinary search error:', error);
        throw new Error(`Failed to search files: ${error.message}`);
    }
};

/**
 * Get folder contents
 * @param {string} folderPath - Folder path
 * @param {Object} options - Options
 * @returns {Promise<Object>} Folder contents
 */
export const getFolderContents = async (folderPath, options = {}) => {
    const {
        resource_type = 'image',
        type = 'upload',
        max_results = 50,
        next_cursor
    } = options;

    try {
        const searchParams = {
            resource_type,
            type,
            prefix: folderPath,
            max_results
        };

        if (next_cursor) {
            searchParams.next_cursor = next_cursor;
        }

        const result = await cloudinary.api.resources(searchParams);
        return result;
    } catch (error) {
        console.error('Cloudinary folder contents error:', error);
        throw new Error(`Failed to get folder contents: ${error.message}`);
    }
};

/**
 * Create folder
 * @param {string} folderPath - Folder path to create
 * @returns {Promise<Object>} Creation result
 */
export const createFolder = async (folderPath) => {
    try {
        const result = await cloudinary.api.create_folder(folderPath);
        return result;
    } catch (error) {
        console.error('Cloudinary create folder error:', error);
        throw new Error(`Failed to create folder: ${error.message}`);
    }
};

/**
 * Validate file before upload
 * @param {Object} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
        errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`);
    }

    // Check MIME type
    if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
        errors.push(`File type '${file.mimetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    if (file.originalname) {
        const extension = file.originalname.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            errors.push(`File extension '.${extension}' is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export default cloudinary;

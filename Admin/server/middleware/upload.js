import multer from 'multer';
import { validateFile } from '@ideal-photography/shared/utils/cloudinary.js';

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Define allowed file types based on upload type
    const uploadType = req.body.uploadType || 'image';

    let allowedTypes = [];
    let allowedExtensions = [];

    switch (uploadType) {
        case 'image':
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            break;
        case 'document':
            allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            allowedExtensions = ['pdf', 'doc', 'docx'];
            break;
        case 'video':
            allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            allowedExtensions = ['mp4', 'webm', 'ogg'];
            break;
        default:
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }

    const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes,
        allowedExtensions
    });

    if (validation.isValid) {
        cb(null, true);
    } else {
        cb(new Error(validation.errors.join('; ')), false);
    }
};

// Create multer upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Maximum 10 files at once
    }
});

// Single file upload middleware
export const uploadSingle = (fieldName = 'file') => {
    return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
    return upload.array(fieldName, maxCount);
};

// Fields upload middleware (for different file types)
export const uploadFields = (fields) => {
    return upload.fields(fields);
};

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'File size too large. Maximum allowed size is 10MB.',
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Maximum allowed is 10 files.',
                    code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'Unexpected file field.',
                    code: 'UNEXPECTED_FILE'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: `Upload error: ${err.message}`,
                    code: 'UPLOAD_ERROR'
                });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message,
            code: 'VALIDATION_ERROR'
        });
    }

    next();
};

// Default export for backward compatibility
export default uploadSingle;

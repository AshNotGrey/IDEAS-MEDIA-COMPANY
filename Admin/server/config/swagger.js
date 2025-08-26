import swaggerJSDoc from 'swagger-jsdoc';
import { ADMIN_SERVER_URL, PACKAGE_VERSION } from './env.js';

const serverUrl = ADMIN_SERVER_URL;

const definition = {
    openapi: '3.0.3',
    info: {
        title: 'Ideal Photography Admin API',
        version: PACKAGE_VERSION,
        description: 'OpenAPI documentation for the Admin server REST endpoints.',
    },
    servers: [
        { url: serverUrl, description: 'Current server' },
    ],
    tags: [
        { name: 'Health', description: 'Health endpoints' },
        { name: 'Auth', description: 'Authentication endpoints (Admin REST)' },
        { name: 'Notifications', description: 'Push notification endpoints' },
        { name: 'Webhooks', description: 'Webhook service endpoints' },
        { name: 'Upload', description: 'File upload and media management endpoints' },
    ],
};

const paths = {
    '/health': {
        get: {
            tags: ['Health'],
            summary: 'Health check',
            description: 'Basic service health check.',
            responses: {
                200: {
                    description: 'Service is healthy',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/HealthResponse' },
                        },
                    },
                },
            },
        },
    },
    '/health/detailed': {
        get: {
            tags: ['Health'],
            summary: 'Detailed health check',
            description: 'Detailed health with database status.',
            responses: {
                200: {
                    description: 'Detailed health status',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/HealthDetailedResponse' },
                        },
                    },
                },
                503: {
                    description: 'Service unhealthy',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/HealthDetailedResponse' },
                        },
                    },
                }
            },
        },
    },
    '/api/auth/status': {
        get: { tags: ['Auth'], summary: 'Auth status', responses: { 200: { description: 'OK' } } }
    },
    '/api/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Admin login',
            description: 'Authenticate with username and password to obtain access and refresh tokens.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' }
                    }
                }
            },
            responses: {
                200: { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                401: { description: 'Invalid credentials' }
            }
        }
    },
    '/api/auth/refresh': {
        post: {
            tags: ['Auth'],
            summary: 'Refresh access token (rotation)',
            description: 'Provide a valid refresh token to obtain a new access token and a rotated refresh token. Old refresh token is revoked.',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } }
            },
            responses: {
                200: { description: 'New tokens issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                401: { description: 'Invalid refresh token' }
            }
        }
    },
    '/api/auth/logout': {
        post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'OK' } } }
    },
    '/api/auth/me': {
        get: { tags: ['Auth'], summary: 'Current admin', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } }
    },
    '/api/auth/sessions': {
        get: { tags: ['Auth'], summary: 'List active sessions', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } }
    },
    '/api/auth/sessions/revoke': {
        post: {
            tags: ['Auth'],
            summary: 'Revoke a specific session',
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'] } } } },
            responses: { 200: { description: 'Revoked' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } }
        }
    },
    '/api/auth/sessions/revoke-all': {
        post: { tags: ['Auth'], summary: 'Revoke all sessions (except current device if provided)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Revoked' }, 401: { description: 'Unauthorized' } } }
    },
    '/api/auth/invites': {
        post: {
            tags: ['Auth'],
            summary: 'Create admin invite code',
            description: 'Requires manager or super_admin role. Creates a one-time invite code for admin registration.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: false,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInviteRequest' } } }
            },
            responses: {
                201: { description: 'Invite created', content: { 'application/json': { schema: { $ref: '#/components/schemas/InviteResponse' } } } },
                403: { description: 'Insufficient permissions' }
            }
        }
    },
    '/api/auth/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register new admin',
            description: 'Register with username and password using either an invite code (auto-verified) or a verifierUsername (pending verification).',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterAdminRequest' } } }
            },
            responses: {
                201: { description: 'Admin registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterAdminResponse' } } } },
                400: { description: 'Invalid request' },
                409: { description: 'Username already taken' }
            }
        }
    },
    '/api/auth/verify': {
        post: {
            tags: ['Auth'],
            summary: 'Verify pending admin',
            description: 'Requires manager or super_admin. Verifies an admin registered via verifier flow.',
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyAdminRequest' } } } },
            responses: {
                200: { description: 'Admin verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminResponse' } } } },
                403: { description: 'Insufficient permissions' },
                404: { description: 'Admin not found' }
            }
        }
    },
    '/api/notifications/vapid-public-key': {
        get: {
            tags: ['Notifications'],
            summary: 'Get VAPID public key',
            description: 'Retrieve the VAPID public key for push notification subscriptions.',
            responses: {
                200: {
                    description: 'VAPID public key',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/VapidKeyResponse' }
                        }
                    }
                }
            }
        }
    },
    '/api/notifications/subscribe': {
        post: {
            tags: ['Notifications'],
            summary: 'Subscribe to push notifications',
            description: 'Subscribe to push notifications with device subscription details.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/PushSubscriptionRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Subscription successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SubscriptionResponse' }
                        }
                    }
                },
                400: { description: 'Invalid subscription data' },
                401: { description: 'Unauthorized' },
                500: { description: 'Subscription failed' }
            }
        }
    },
    '/api/webhooks/status': {
        get: {
            tags: ['Webhooks'],
            summary: 'Webhook service status',
            description: 'Check if the webhook service is available.',
            responses: {
                200: {
                    description: 'Webhook service status',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/WebhookStatusResponse' }
                        }
                    }
                }
            }
        }
    },
    '/api/upload/status': {
        get: {
            tags: ['Upload'],
            summary: 'Upload service status',
            description: 'Check upload service status and configuration.',
            responses: {
                200: {
                    description: 'Upload service status',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UploadStatusResponse' }
                        }
                    }
                }
            }
        }
    },
    '/api/upload/single': {
        post: {
            tags: ['Upload'],
            summary: 'Upload single file',
            description: 'Upload a single file to Cloudinary with metadata.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: { $ref: '#/components/schemas/SingleUploadRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'File uploaded successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UploadResponse' }
                        }
                    }
                },
                400: { description: 'No file provided' },
                401: { description: 'Unauthorized' },
                500: { description: 'Upload failed' }
            }
        }
    },
    '/api/upload/multiple': {
        post: {
            tags: ['Upload'],
            summary: 'Upload multiple files',
            description: 'Upload multiple files to Cloudinary with metadata.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: { $ref: '#/components/schemas/MultipleUploadRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Files uploaded successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MultipleUploadResponse' }
                        }
                    }
                },
                400: { description: 'No files provided' },
                401: { description: 'Unauthorized' },
                500: { description: 'Upload failed' }
            }
        }
    },
    '/api/upload/media': {
        get: {
            tags: ['Upload'],
            summary: 'Get media files',
            description: 'Retrieve media files with pagination, filtering, and sorting.',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
                { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by file type' },
                { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
                { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term' },
                { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' }, description: 'Sort field' },
                { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort order' }
            ],
            responses: {
                200: {
                    description: 'Media files retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MediaListResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                500: { description: 'Failed to retrieve media' }
            }
        }
    },
    '/api/upload/media/{id}': {
        get: {
            tags: ['Upload'],
            summary: 'Get media file by ID',
            description: 'Retrieve a specific media file by its ID.',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Media file ID' }
            ],
            responses: {
                200: {
                    description: 'Media file retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MediaResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Media file not found' },
                500: { description: 'Failed to retrieve media' }
            }
        },
        put: {
            tags: ['Upload'],
            summary: 'Update media metadata',
            description: 'Update metadata for a specific media file.',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Media file ID' }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/MediaUpdateRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Media metadata updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MediaResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Media file not found' },
                500: { description: 'Failed to update media' }
            }
        },
        delete: {
            tags: ['Upload'],
            summary: 'Delete media file',
            description: 'Delete a media file from both Cloudinary and the database.',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Media file ID' }
            ],
            responses: {
                200: {
                    description: 'Media file deleted successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DeleteResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Media file not found' },
                500: { description: 'Failed to delete media' }
            }
        }
    },
    '/api/upload/folders/{folderPath}': {
        get: {
            tags: ['Upload'],
            summary: 'Get folder contents',
            description: 'Retrieve contents of a Cloudinary folder.',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'folderPath', in: 'path', required: true, schema: { type: 'string' }, description: 'Folder path' },
                { name: 'max_results', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Maximum results to return' },
                { name: 'next_cursor', in: 'query', schema: { type: 'string' }, description: 'Pagination cursor' }
            ],
            responses: {
                200: {
                    description: 'Folder contents retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/FolderContentsResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                500: { description: 'Failed to retrieve folder contents' }
            }
        }
    },
    '/api/upload/folders': {
        post: {
            tags: ['Upload'],
            summary: 'Create folder',
            description: 'Create a new folder in Cloudinary.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateFolderRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Folder created successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/FolderResponse' }
                        }
                    }
                },
                400: { description: 'Folder path is required' },
                401: { description: 'Unauthorized' },
                500: { description: 'Failed to create folder' }
            }
        }
    },
    '/api/upload/stats': {
        get: {
            tags: ['Upload'],
            summary: 'Get media statistics',
            description: 'Retrieve media usage statistics and file counts.',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Media statistics retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MediaStatsResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                500: { description: 'Failed to retrieve statistics' }
            }
        }
    }
};

const components = {
    securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
        Admin: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                username: { type: 'string' },
                role: { type: 'string', enum: ['admin', 'manager', 'super_admin'] },
                permissions: { type: 'array', items: { type: 'string' } },
                isActive: { type: 'boolean' },
                isVerified: { type: 'boolean' },
                isLocked: { type: 'boolean', nullable: true },
                lastLogin: { type: 'string', format: 'date-time', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            }
        },
        AdminResponse: {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/Admin' } }
        },
        LoginRequest: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string', example: 'adminuser' },
                password: { type: 'string', example: 'StrongPassw0rd!' }
            }
        },
        RefreshRequest: {
            type: 'object',
            required: ['refreshToken'],
            properties: { refreshToken: { type: 'string' } }
        },
        AuthResponse: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                refreshToken: { type: 'string' },
                user: { $ref: '#/components/schemas/Admin' },
                expiresIn: { type: 'string', example: '30m' }
            }
        },
        CreateInviteRequest: {
            type: 'object',
            properties: {
                role: { type: 'string', enum: ['admin', 'manager'], default: 'admin' },
                permissions: { type: 'array', items: { type: 'string' } },
                ttlMinutes: { type: 'integer', minimum: 5, default: 60 }
            }
        },
        InviteResponse: {
            type: 'object',
            properties: {
                code: { type: 'string' },
                role: { type: 'string', enum: ['admin', 'manager'] },
                expiresAt: { type: 'string', format: 'date-time' }
            }
        },
        RegisterAdminRequest: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string' },
                password: { type: 'string' },
                code: { type: 'string', nullable: true },
                verifierUsername: { type: 'string', nullable: true }
            }
        },
        RegisterAdminResponse: {
            type: 'object',
            properties: {
                user: { $ref: '#/components/schemas/Admin' },
                requiresVerification: { type: 'boolean' }
            }
        },
        VerifyAdminRequest: {
            type: 'object',
            required: ['username'],
            properties: { username: { type: 'string' } }
        },
        HealthResponse: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', format: 'date-time' },
                service: { type: 'string' },
                uptime: { type: 'number', example: 123.45 },
                environment: { type: 'string', example: 'development' },
                version: { type: 'string', example: '1.0.0' },
            },
            required: ['status', 'timestamp'],
        },
        HealthDetailedResponse: {
            allOf: [
                { $ref: '#/components/schemas/HealthResponse' },
                {
                    type: 'object',
                    properties: {
                        dependencies: {
                            type: 'object',
                            properties: {
                                database: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'healthy' },
                                        readyState: { type: 'number', example: 1 },
                                        error: { type: 'string', nullable: true },
                                    },
                                },
                            },
                        },
                    },
                },
            ],
        },
        VapidKeyResponse: {
            type: 'object',
            properties: {
                publicKey: { type: 'string', description: 'VAPID public key for push notifications' }
            }
        },
        PushSubscriptionRequest: {
            type: 'object',
            required: ['subscription'],
            properties: {
                subscription: {
                    type: 'object',
                    required: ['endpoint', 'keys'],
                    properties: {
                        endpoint: { type: 'string', description: 'Push subscription endpoint' },
                        keys: {
                            type: 'object',
                            required: ['p256dh', 'auth'],
                            properties: {
                                p256dh: { type: 'string', description: 'P-256 DH key' },
                                auth: { type: 'string', description: 'Authentication secret' }
                            }
                        }
                    }
                }
            }
        },
        SubscriptionResponse: {
            type: 'object',
            properties: {
                ok: { type: 'boolean' },
                id: { type: 'string', description: 'Subscription ID' }
            }
        },
        WebhookStatusResponse: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Admin webhook service is available' }
            }
        },
        UploadStatusResponse: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Upload service is available' },
                cloudinary: { type: 'string', enum: ['configured', 'not_configured'] },
                maxFileSize: { type: 'string', example: '10MB' },
                supportedTypes: { type: 'array', items: { type: 'string' }, example: ['image', 'document', 'video'] }
            }
        },
        SingleUploadRequest: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary', description: 'File to upload' },
                category: { type: 'string', default: 'other', description: 'File category' },
                folder: { type: 'string', default: 'uploads', description: 'Cloudinary folder' },
                tags: { type: 'string', description: 'Comma-separated tags' },
                alt: { type: 'string', description: 'Alt text for images' },
                description: { type: 'string', description: 'File description' }
            }
        },
        MultipleUploadRequest: {
            type: 'object',
            required: ['files'],
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Files to upload' },
                category: { type: 'string', default: 'other', description: 'File category' },
                folder: { type: 'string', default: 'uploads', description: 'Cloudinary folder' },
                tags: { type: 'string', description: 'Comma-separated tags' }
            }
        },
        UploadResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        media: { $ref: '#/components/schemas/Media' },
                        cloudinary: { type: 'object', description: 'Cloudinary upload result' }
                    }
                }
            }
        },
        MultipleUploadResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        successful: { type: 'array', items: { $ref: '#/components/schemas/UploadResult' } },
                        failed: { type: 'array', items: { $ref: '#/components/schemas/UploadError' } },
                        summary: { $ref: '#/components/schemas/UploadSummary' }
                    }
                }
            }
        },
        UploadResult: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                filename: { type: 'string' },
                media: { $ref: '#/components/schemas/Media' },
                cloudinary: { type: 'object' }
            }
        },
        UploadError: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                filename: { type: 'string' },
                error: { type: 'string' }
            }
        },
        UploadSummary: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                successful: { type: 'integer' },
                failed: { type: 'integer' }
            }
        },
        Media: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                filename: { type: 'string' },
                originalName: { type: 'string' },
                mimeType: { type: 'string' },
                fileSize: { type: 'number' },
                cloudinaryId: { type: 'string' },
                url: { type: 'string' },
                secureUrl: { type: 'string' },
                category: { type: 'string' },
                folder: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                alt: { type: 'string' },
                description: { type: 'string' },
                uploadedBy: { type: 'string' },
                format: { type: 'string' },
                dimensions: {
                    type: 'object',
                    properties: {
                        width: { type: 'number' },
                        height: { type: 'number' }
                    }
                },
                transformations: { type: 'object' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        },
        MediaListResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        media: { type: 'array', items: { $ref: '#/components/schemas/Media' } },
                        pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                }
            }
        },
        MediaResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { $ref: '#/components/schemas/Media' }
            }
        },
        MediaUpdateRequest: {
            type: 'object',
            properties: {
                alt: { type: 'string', description: 'Alt text for images' },
                description: { type: 'string', description: 'File description' },
                tags: { type: 'array', items: { type: 'string' }, description: 'File tags' },
                category: { type: 'string', description: 'File category' }
            }
        },
        DeleteResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        FolderContentsResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object', description: 'Cloudinary folder contents' }
            }
        },
        CreateFolderRequest: {
            type: 'object',
            required: ['folderPath'],
            properties: {
                folderPath: { type: 'string', description: 'Path for the new folder' }
            }
        },
        FolderResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', description: 'Folder creation result' }
            }
        },
        MediaStatsResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalFiles: { type: 'number' },
                        totalSize: { type: 'number' },
                        byType: { type: 'object' }
                    }
                }
            }
        },
        Pagination: {
            type: 'object',
            properties: {
                currentPage: { type: 'integer' },
                totalPages: { type: 'integer' },
                totalItems: { type: 'integer' },
                itemsPerPage: { type: 'integer' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' }
            }
        }
    },
};

const swaggerSpec = swaggerJSDoc({
    definition: { ...definition, paths, components, security: [{ bearerAuth: [] }] },
    apis: [],
});

export default swaggerSpec;



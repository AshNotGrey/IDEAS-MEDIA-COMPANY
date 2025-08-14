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
    },
};

const swaggerSpec = swaggerJSDoc({
    definition: { ...definition, paths, components, security: [{ bearerAuth: [] }] },
    apis: [],
});

export default swaggerSpec;



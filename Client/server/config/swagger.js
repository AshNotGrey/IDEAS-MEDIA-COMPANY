import swaggerJSDoc from 'swagger-jsdoc';
import { CLIENT_SERVER_URL, PACKAGE_VERSION } from './env.js';

const serverUrl = CLIENT_SERVER_URL;

const definition = {
    openapi: '3.0.3',
    info: {
        title: 'Ideal Photography Client API',
        version: PACKAGE_VERSION,
        description: 'OpenAPI documentation for the Client server REST endpoints.',
    },
    servers: [
        { url: serverUrl, description: 'Current server' },
    ],
    tags: [
        { name: 'Health', description: 'Health and status endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Payments', description: 'Payment and webhook endpoints (Paystack)' },
    ],
};

// Inline paths and schemas for now; can be extended via JSDoc in route files later
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
    '/status': {
        get: {
            tags: ['Health'],
            summary: 'Alias health/status check',
            description: 'Alias for health status.',
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
    '/api/auth/status': {
        get: {
            tags: ['Auth'],
            summary: 'Auth service status',
            responses: { 200: { description: 'Status' } }
        }
    },
    '/api/auth/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register new user',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                email: { type: 'string' },
                                password: { type: 'string' },
                                phone: { type: 'string' },
                                nin: { type: 'string' },
                                driversLicense: { type: 'string' },
                                referrerInfo: { type: 'object' },
                            },
                            required: ['name', 'email', 'password', 'phone']
                        }
                    }
                }
            },
            responses: { 201: { description: 'Registered' }, 400: { description: 'Bad request' } }
        }
    },
    '/api/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Login',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } }
            },
            responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
        }
    },
    '/api/auth/refresh': {
        post: {
            tags: ['Auth'],
            summary: 'Refresh access token',
            requestBody: {
                required: false,
                content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } }
            },
            responses: { 200: { description: 'OK' }, 401: { description: 'Invalid token' } }
        }
    },
    '/api/auth/logout': {
        post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'OK' } } }
    },
    '/api/auth/me': {
        get: {
            tags: ['Auth'],
            summary: 'Current user',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
        }
    },
    '/api/auth/sessions': {
        get: {
            tags: ['Auth'],
            summary: 'List active sessions',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
        }
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
        post: {
            tags: ['Auth'],
            summary: 'Revoke all sessions (except current device if provided)',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Revoked' }, 401: { description: 'Unauthorized' } }
        }
    },
    '/api/webhooks/status': {
        get: {
            tags: ['Payments'],
            summary: 'Webhook service status',
            responses: { 200: { description: 'OK' } }
        }
    },
    '/api/webhooks/paystack': {
        post: {
            tags: ['Payments'],
            summary: 'Paystack webhook listener',
            description: 'Validates Paystack signature and reconciles transactions/bookings. Always returns 200 on valid signature.',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', example: { event: 'charge.success', data: { reference: 'EVT_...', amount: 100000, currency: 'NGN' } } } } }
            },
            responses: { 200: { description: 'Processed' }, 401: { description: 'Invalid signature' } }
        }
    },
    '/api/payments/init': {
        post: {
            tags: ['Payments'],
            summary: 'Initialize payment for a booking or order',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { propId: { type: 'string', nullable: true }, orderId: { type: 'string', nullable: true } }, anyOf: [{ required: ['propId'] }, { required: ['orderId'] }] } } }
            },
            responses: { 200: { description: 'Initialized' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } }
        }
    },
    '/api/payments/verify': {
        post: {
            tags: ['Payments'],
            summary: 'Verify Paystack transaction by reference',
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { reference: { type: 'string' } }, required: ['reference'] } } } },
            responses: { 200: { description: 'Verification result' }, 401: { description: 'Unauthorized' } }
        }
    }
};

const components = {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    },
    schemas: {
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
    },
};

const swaggerSpec = swaggerJSDoc({
    definition: { ...definition, paths, components, security: [{ bearerAuth: [] }] },
    apis: [],
});

export default swaggerSpec;



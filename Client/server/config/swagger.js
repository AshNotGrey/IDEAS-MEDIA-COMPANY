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
        { name: 'Campaigns', description: 'Campaign management endpoints' },
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
    },
    // ============================================================================
    // CAMPAIGN API ENDPOINTS
    // ============================================================================
    '/api/campaigns': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get all campaigns',
            description: 'Retrieve campaigns with filtering, pagination, and sorting options',
            parameters: [
                { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
                { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Campaign type filter' },
                { name: 'placement', in: 'query', schema: { type: 'string' }, description: 'Placement filter' },
                { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Status filter' },
                { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Active status filter' },
                { name: 'sort', in: 'query', schema: { type: 'string', default: 'priority' }, description: 'Sort field' },
                { name: 'order', in: 'query', schema: { type: 'string', default: 'desc' }, description: 'Sort order' }
            ],
            responses: {
                200: {
                    description: 'Campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                500: { description: 'Internal server error' }
            }
        },
        post: {
            tags: ['Campaigns'],
            summary: 'Create new campaign',
            description: 'Create a new campaign with the provided data',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CampaignInput' }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Campaign created successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Validation error' },
                401: { description: 'Unauthorized' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get campaign by ID',
            description: 'Retrieve a specific campaign by its ID',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Invalid campaign ID' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        },
        put: {
            tags: ['Campaigns'],
            summary: 'Update campaign',
            description: 'Update an existing campaign',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CampaignUpdateInput' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Campaign updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Validation error' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        },
        delete: {
            tags: ['Campaigns'],
            summary: 'Delete campaign',
            description: 'Delete a campaign (soft delete)',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign deleted successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Cannot delete active campaign' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/activate': {
        post: {
            tags: ['Campaigns'],
            summary: 'Activate campaign',
            description: 'Activate a campaign to make it live',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign activated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Cannot activate campaign' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/deactivate': {
        post: {
            tags: ['Campaigns'],
            summary: 'Deactivate campaign',
            description: 'Deactivate a campaign to make it inactive',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign deactivated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/approve': {
        post: {
            tags: ['Campaigns'],
            summary: 'Approve campaign',
            description: 'Approve a campaign (admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign approved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/duplicate': {
        post: {
            tags: ['Campaigns'],
            summary: 'Duplicate campaign',
            description: 'Create a copy of an existing campaign',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                201: {
                    description: 'Campaign duplicated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/schedule': {
        post: {
            tags: ['Campaigns'],
            summary: 'Schedule campaign',
            description: 'Schedule a campaign for future activation',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ScheduleInput' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Campaign scheduled successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Invalid schedule data' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/unschedule': {
        post: {
            tags: ['Campaigns'],
            summary: 'Unschedule campaign',
            description: 'Remove scheduling from a campaign',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Campaign unscheduled successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/active': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get active campaigns',
            description: 'Retrieve all currently active campaigns',
            parameters: [
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Maximum number of campaigns to return' }
            ],
            responses: {
                200: {
                    description: 'Active campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/scheduled': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get scheduled campaigns',
            description: 'Retrieve all scheduled campaigns',
            parameters: [
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Maximum number of campaigns to return' }
            ],
            responses: {
                200: {
                    description: 'Scheduled campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/placement/{placement}': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get campaigns by placement',
            description: 'Retrieve campaigns for a specific placement',
            parameters: [
                { name: 'placement', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign placement' },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Maximum number of campaigns to return' }
            ],
            responses: {
                200: {
                    description: 'Campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                400: { description: 'Invalid placement' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/type/{type}': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get campaigns by type',
            description: 'Retrieve campaigns of a specific type',
            parameters: [
                { name: 'type', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign type' },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Maximum number of campaigns to return' }
            ],
            responses: {
                200: {
                    description: 'Campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                400: { description: 'Invalid type' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/impression': {
        post: {
            tags: ['Campaigns'],
            summary: 'Record campaign impression',
            description: 'Record a view/impression of a campaign',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Impression recorded successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ImpressionResponse' }
                        }
                    }
                },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/click': {
        post: {
            tags: ['Campaigns'],
            summary: 'Record campaign click',
            description: 'Record a click on a campaign CTA',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                ctaLabel: { type: 'string', description: 'Label of the clicked CTA' }
                            },
                            required: ['ctaLabel']
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Click recorded successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ClickResponse' }
                        }
                    }
                },
                400: { description: 'Missing CTA label' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/conversion': {
        post: {
            tags: ['Campaigns'],
            summary: 'Record campaign conversion',
            description: 'Record a conversion from a campaign',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Conversion recorded successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ConversionResponse' }
                        }
                    }
                },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/analytics': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get campaign analytics',
            description: 'Retrieve analytics data for a campaign',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            responses: {
                200: {
                    description: 'Analytics retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AnalyticsResponse' }
                        }
                    }
                },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/bulk-update': {
        put: {
            tags: ['Campaigns'],
            summary: 'Bulk update campaigns',
            description: 'Update multiple campaigns at once',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                campaignIds: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Array of campaign IDs to update'
                                },
                                updateData: {
                                    type: 'object',
                                    description: 'Data to update for all campaigns'
                                }
                            },
                            required: ['campaignIds', 'updateData']
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Campaigns updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BulkUpdateResponse' }
                        }
                    }
                },
                400: { description: 'Invalid request data' },
                401: { description: 'Unauthorized' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/bulk-delete': {
        delete: {
            tags: ['Campaigns'],
            summary: 'Bulk delete campaigns',
            description: 'Delete multiple campaigns at once',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                campaignIds: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Array of campaign IDs to delete'
                                }
                            },
                            required: ['campaignIds']
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Campaigns deleted successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BulkDeleteResponse' }
                        }
                    }
                },
                400: { description: 'Cannot delete active campaigns' },
                401: { description: 'Unauthorized' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/targeted': {
        get: {
            tags: ['Campaigns'],
            summary: 'Get targeted campaigns for user',
            description: 'Retrieve campaigns targeted to the authenticated user',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Maximum number of campaigns to return' }
            ],
            responses: {
                200: {
                    description: 'Targeted campaigns retrieved successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignsResponse' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                500: { description: 'Internal server error' }
            }
        }
    },
    '/api/campaigns/{id}/upload-images': {
        post: {
            tags: ['Campaigns'],
            summary: 'Upload campaign images',
            description: 'Upload and update images for a campaign',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Campaign ID' }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                images: {
                                    type: 'object',
                                    description: 'Object containing image URLs for different sizes'
                                }
                            },
                            required: ['images']
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Images updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CampaignResponse' }
                        }
                    }
                },
                400: { description: 'Invalid images data' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Campaign not found' },
                500: { description: 'Internal server error' }
            }
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
        // Campaign Schemas
        CampaignInput: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Campaign name' },
                type: { type: 'string', enum: ['hero-carousel', 'banner', 'popup', 'notification', 'theme-override', 'promotional', 'announcement'] },
                placement: { type: 'string', enum: ['hero', 'top-banner', 'sidebar', 'footer', 'popup', 'notification', 'modal', 'overlay', 'inline'] },
                priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
                status: { type: 'string', enum: ['draft', 'pending', 'approved', 'active', 'paused', 'completed', 'cancelled'], default: 'draft' },
                content: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        subtitle: { type: 'string' },
                        description: { type: 'string' },
                        ctaText: { type: 'string' },
                        ctaUrl: { type: 'string' },
                        images: {
                            type: 'object',
                            properties: {
                                desktop: { type: 'string' },
                                mobile: { type: 'string' },
                                tablet: { type: 'string' }
                            }
                        }
                    }
                },
                schedule: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        isRecurring: { type: 'boolean', default: false },
                        recurrence: {
                            type: 'object',
                            properties: {
                                frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
                                interval: { type: 'integer', minimum: 1 },
                                daysOfWeek: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 } },
                                dayOfMonth: { type: 'integer', minimum: 1, maximum: 31 }
                            }
                        }
                    }
                },
                targeting: {
                    type: 'object',
                    properties: {
                        userRoles: { type: 'array', items: { type: 'string' } },
                        userTypes: { type: 'array', items: { type: 'string', enum: ['new', 'returning', 'vip'] } },
                        countries: { type: 'array', items: { type: 'string' } },
                        cities: { type: 'array', items: { type: 'string' } },
                        devices: { type: 'array', items: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] } },
                        browsers: { type: 'array', items: { type: 'string' } }
                    }
                },
                settings: {
                    type: 'object',
                    properties: {
                        isActive: { type: 'boolean', default: false },
                        isScheduled: { type: 'boolean', default: false },
                        isExpired: { type: 'boolean', default: false },
                        maxImpressions: { type: 'integer' },
                        maxClicks: { type: 'integer' },
                        displayFrequency: { type: 'string', enum: ['always', 'once', 'daily', 'weekly'] },
                        displayDelay: { type: 'integer', description: 'Delay in seconds before showing campaign' }
                    }
                },
                tags: { type: 'array', items: { type: 'string' } }
            },
            required: ['name', 'type', 'placement']
        },
        CampaignUpdateInput: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: ['hero-carousel', 'banner', 'popup', 'notification', 'theme-override', 'promotional', 'announcement'] },
                placement: { type: 'string', enum: ['hero', 'top-banner', 'sidebar', 'footer', 'popup', 'notification', 'modal', 'overlay', 'inline'] },
                priority: { type: 'integer', minimum: 1, maximum: 10 },
                status: { type: 'string', enum: ['draft', 'pending', 'approved', 'active', 'paused', 'completed', 'cancelled'] },
                content: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        subtitle: { type: 'string' },
                        description: { type: 'string' },
                        ctaText: { type: 'string' },
                        ctaUrl: { type: 'string' },
                        images: {
                            type: 'object',
                            properties: {
                                desktop: { type: 'string' },
                                mobile: { type: 'string' },
                                tablet: { type: 'string' }
                            }
                        }
                    }
                },
                schedule: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        isRecurring: { type: 'boolean' },
                        recurrence: {
                            type: 'object',
                            properties: {
                                frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
                                interval: { type: 'integer', minimum: 1 },
                                daysOfWeek: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 } },
                                dayOfMonth: { type: 'integer', minimum: 1, maximum: 31 }
                            }
                        }
                    }
                },
                targeting: {
                    type: 'object',
                    properties: {
                        userRoles: { type: 'array', items: { type: 'string' } },
                        userTypes: { type: 'array', items: { type: 'string', enum: ['new', 'returning', 'vip'] } },
                        countries: { type: 'array', items: { type: 'string' } },
                        cities: { type: 'array', items: { type: 'string' } },
                        devices: { type: 'array', items: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] } },
                        browsers: { type: 'array', items: { type: 'string' } }
                    }
                },
                settings: {
                    type: 'object',
                    properties: {
                        isActive: { type: 'boolean' },
                        isScheduled: { type: 'boolean' },
                        isExpired: { type: 'boolean' },
                        maxImpressions: { type: 'integer' },
                        maxClicks: { type: 'integer' },
                        displayFrequency: { type: 'string', enum: ['always', 'once', 'daily', 'weekly'] },
                        displayDelay: { type: 'integer' }
                    }
                },
                tags: { type: 'array', items: { type: 'string' } }
            }
        },
        CampaignResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { $ref: '#/components/schemas/Campaign' }
            }
        },
        CampaignsResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Campaign' }
                },
                pagination: { $ref: '#/components/schemas/Pagination' }
            }
        },
        Campaign: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                placement: { type: 'string' },
                priority: { type: 'integer' },
                status: { type: 'string' },
                content: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        subtitle: { type: 'string' },
                        description: { type: 'string' },
                        ctaText: { type: 'string' },
                        ctaUrl: { type: 'string' },
                        images: {
                            type: 'object',
                            properties: {
                                desktop: { type: 'string' },
                                mobile: { type: 'string' },
                                tablet: { type: 'string' }
                            }
                        }
                    }
                },
                schedule: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        isRecurring: { type: 'boolean' },
                        recurrence: { type: 'object' }
                    }
                },
                targeting: {
                    type: 'object',
                    properties: {
                        userRoles: { type: 'array', items: { type: 'string' } },
                        userTypes: { type: 'array', items: { type: 'string' } },
                        countries: { type: 'array', items: { type: 'string' } },
                        cities: { type: 'array', items: { type: 'string' } },
                        devices: { type: 'array', items: { type: 'string' } },
                        browsers: { type: 'array', items: { type: 'string' } }
                    }
                },
                settings: {
                    type: 'object',
                    properties: {
                        isActive: { type: 'boolean' },
                        isScheduled: { type: 'boolean' },
                        isExpired: { type: 'boolean' },
                        maxImpressions: { type: 'integer' },
                        maxClicks: { type: 'integer' },
                        displayFrequency: { type: 'string' },
                        displayDelay: { type: 'integer' }
                    }
                },
                analytics: {
                    type: 'object',
                    properties: {
                        impressions: { type: 'integer', default: 0 },
                        clicks: { type: 'integer', default: 0 },
                        conversions: { type: 'integer', default: 0 },
                        ctr: { type: 'number', default: 0 },
                        conversionRate: { type: 'number', default: 0 }
                    }
                },
                tags: { type: 'array', items: { type: 'string' } },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        },
        ScheduleInput: {
            type: 'object',
            properties: {
                startDate: { type: 'string', format: 'date-time', description: 'Campaign start date and time' },
                endDate: { type: 'string', format: 'date-time', description: 'Campaign end date and time' },
                isRecurring: { type: 'boolean', default: false, description: 'Whether the campaign should recur' },
                recurrence: {
                    type: 'object',
                    properties: {
                        frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
                        interval: { type: 'integer', minimum: 1, description: 'Interval between recurrences' },
                        daysOfWeek: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 }, description: 'Days of week for weekly recurrence (0=Sunday, 6=Saturday)' },
                        dayOfMonth: { type: 'integer', minimum: 1, maximum: 31, description: 'Day of month for monthly recurrence' }
                    }
                }
            },
            required: ['startDate', 'endDate']
        },
        Pagination: {
            type: 'object',
            properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' }
            }
        },
        ImpressionResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        impressions: { type: 'integer' }
                    }
                }
            }
        },
        ClickResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        clicks: { type: 'integer' },
                        ctr: { type: 'number' }
                    }
                }
            }
        },
        ConversionResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        conversions: { type: 'integer' },
                        conversionRate: { type: 'number' }
                    }
                }
            }
        },
        AnalyticsResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        impressions: { type: 'integer' },
                        clicks: { type: 'integer' },
                        conversions: { type: 'integer' },
                        ctr: { type: 'number' },
                        conversionRate: { type: 'number' },
                        performance: {
                            type: 'object',
                            properties: {
                                daily: { type: 'array', items: { type: 'object' } },
                                weekly: { type: 'array', items: { type: 'object' } },
                                monthly: { type: 'array', items: { type: 'object' } }
                            }
                        }
                    }
                }
            }
        },
        BulkUpdateResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        updated: { type: 'integer' },
                        failed: { type: 'integer' },
                        errors: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
        },
        BulkDeleteResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        deleted: { type: 'integer' },
                        failed: { type: 'integer' },
                        errors: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
        }
    },
};

const swaggerSpec = swaggerJSDoc({
    definition: { ...definition, paths, components, security: [{ bearerAuth: [] }] },
    apis: [],
});

export default swaggerSpec;



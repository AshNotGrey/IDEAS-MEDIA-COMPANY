/**
 * Database query optimization utilities
 * Provides performance enhancements for MongoDB queries
 */

/**
 * Create optimized aggregation pipelines with proper indexing hints
 */
export const createOptimizedPipeline = (baseQuery = {}) => {
    return {
        // Add index hints for better performance
        addIndexHint: (indexName) => ({
            $addFields: { __indexHint: indexName }
        }),

        // Optimize text search queries
        addTextSearch: (searchTerm, fields = []) => {
            if (!searchTerm) return null;

            return {
                $match: {
                    $or: [
                        // Text index search (if available)
                        { $text: { $search: searchTerm } },
                        // Fallback to regex search on specific fields
                        ...fields.map(field => ({
                            [field]: { $regex: searchTerm, $options: 'i' }
                        }))
                    ]
                }
            };
        },

        // Add efficient pagination
        addPagination: (page = 1, limit = 20) => [
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ],

        // Add sorting with index optimization
        addSort: (sortField, sortOrder = 1) => ({
            $sort: { [sortField]: sortOrder, _id: 1 } // Always include _id for consistent pagination
        }),

        // Project only needed fields to reduce network overhead
        addProjection: (fields) => ({
            $project: fields.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
            }, {})
        }),

        // Add lookup with proper pipeline optimization
        addLookup: (from, localField, foreignField, as, pipeline = []) => ({
            $lookup: {
                from,
                localField,
                foreignField,
                as,
                pipeline: [
                    // Only project necessary fields in lookups
                    { $project: { _id: 1, name: 1, email: 1, status: 1 } },
                    ...pipeline
                ]
            }
        }),

        // Count total documents efficiently
        addCountFacet: () => ({
            $facet: {
                data: [{ $match: {} }],
                count: [{ $count: 'total' }]
            }
        })
    };
};

/**
 * Query performance monitoring
 */
export class QueryPerformanceMonitor {
    constructor() {
        this.queries = new Map();
        this.slowQueryThreshold = 1000; // 1 second
    }

    startQuery(queryId, operation, collection) {
        this.queries.set(queryId, {
            operation,
            collection,
            startTime: Date.now(),
            endTime: null,
            duration: null
        });
    }

    endQuery(queryId) {
        const query = this.queries.get(queryId);
        if (query) {
            query.endTime = Date.now();
            query.duration = query.endTime - query.startTime;

            if (query.duration > this.slowQueryThreshold) {
                console.warn(`Slow query detected:`, {
                    operation: query.operation,
                    collection: query.collection,
                    duration: `${query.duration}ms`
                });
            }
        }
    }

    getStats() {
        const queries = Array.from(this.queries.values()).filter(q => q.duration !== null);
        const totalQueries = queries.length;
        const slowQueries = queries.filter(q => q.duration > this.slowQueryThreshold);
        const avgDuration = totalQueries > 0
            ? queries.reduce((sum, q) => sum + q.duration, 0) / totalQueries
            : 0;

        return {
            totalQueries,
            slowQueries: slowQueries.length,
            averageDuration: Math.round(avgDuration),
            slowQueryPercentage: totalQueries > 0 ? (slowQueries.length / totalQueries * 100).toFixed(1) : 0
        };
    }

    clear() {
        this.queries.clear();
    }
}

// Global performance monitor instance
export const queryMonitor = new QueryPerformanceMonitor();

/**
 * Optimized query builder for common operations
 */
export const QueryBuilder = {
    // Build user queries with proper indexing
    users: {
        list: (filters = {}, pagination = {}) => {
            const pipeline = [];
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = pagination;
            const { search, status, role, verified } = filters;

            // Add search filter
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { firstName: { $regex: search, $options: 'i' } },
                            { lastName: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }
                });
            }

            // Add status filters
            const matchConditions = {};
            if (status) matchConditions.accountStatus = status;
            if (role) matchConditions.role = role;
            if (verified !== undefined) matchConditions.isVerified = verified;

            if (Object.keys(matchConditions).length > 0) {
                pipeline.push({ $match: matchConditions });
            }

            // Add sorting
            pipeline.push({ $sort: { [sortBy]: sortOrder, _id: 1 } });

            // Add pagination
            pipeline.push({ $skip: (page - 1) * limit });
            pipeline.push({ $limit: limit });

            // Project only necessary fields
            pipeline.push({
                $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phone: 1,
                    accountStatus: 1,
                    role: 1,
                    isVerified: 1,
                    createdAt: 1,
                    lastLogin: 1,
                    avatar: 1
                }
            });

            return pipeline;
        },

        count: (filters = {}) => {
            const pipeline = [];
            const { search, status, role, verified } = filters;

            // Add search filter
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { firstName: { $regex: search, $options: 'i' } },
                            { lastName: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }
                });
            }

            // Add status filters
            const matchConditions = {};
            if (status) matchConditions.accountStatus = status;
            if (role) matchConditions.role = role;
            if (verified !== undefined) matchConditions.isVerified = verified;

            if (Object.keys(matchConditions).length > 0) {
                pipeline.push({ $match: matchConditions });
            }

            pipeline.push({ $count: 'total' });
            return pipeline;
        }
    },

    // Build booking queries with user population
    bookings: {
        list: (filters = {}, pagination = {}) => {
            const pipeline = [];
            const { page = 1, limit = 20, sortBy = 'scheduledDate', sortOrder = -1 } = pagination;
            const { search, status, serviceType, dateFrom, dateTo } = filters;

            // Add date range filter
            if (dateFrom || dateTo) {
                const dateFilter = {};
                if (dateFrom) dateFilter.$gte = new Date(dateFrom);
                if (dateTo) dateFilter.$lte = new Date(dateTo);
                pipeline.push({ $match: { scheduledDate: dateFilter } });
            }

            // Add status and service type filters
            const matchConditions = {};
            if (status) matchConditions.status = status;
            if (serviceType) matchConditions.serviceType = serviceType;

            if (Object.keys(matchConditions).length > 0) {
                pipeline.push({ $match: matchConditions });
            }

            // Add user lookup for search
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { firstName: 1, lastName: 1, email: 1, phone: 1 } }
                    ]
                }
            });

            // Unwind user array
            pipeline.push({ $unwind: '$user' });

            // Add search filter (after user lookup)
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'user.firstName': { $regex: search, $options: 'i' } },
                            { 'user.lastName': { $regex: search, $options: 'i' } },
                            { 'user.email': { $regex: search, $options: 'i' } },
                            { serviceType: { $regex: search, $options: 'i' } }
                        ]
                    }
                });
            }

            // Add sorting
            pipeline.push({ $sort: { [sortBy]: sortOrder, _id: 1 } });

            // Add pagination
            pipeline.push({ $skip: (page - 1) * limit });
            pipeline.push({ $limit: limit });

            return pipeline;
        }
    },

    // Build service queries
    services: {
        list: (filters = {}, pagination = {}) => {
            const pipeline = [];
            const { page = 1, limit = 20, sortBy = 'name', sortOrder = 1 } = pagination;
            const { search, category, active, featured } = filters;

            // Add search filter
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { description: { $regex: search, $options: 'i' } },
                            { category: { $regex: search, $options: 'i' } }
                        ]
                    }
                });
            }

            // Add filters
            const matchConditions = {};
            if (category) matchConditions.category = category;
            if (active !== undefined) matchConditions.isActive = active;
            if (featured !== undefined) matchConditions.isFeatured = featured;

            if (Object.keys(matchConditions).length > 0) {
                pipeline.push({ $match: matchConditions });
            }

            // Add sorting
            pipeline.push({ $sort: { [sortBy]: sortOrder, _id: 1 } });

            // Add pagination
            pipeline.push({ $skip: (page - 1) * limit });
            pipeline.push({ $limit: limit });

            return pipeline;
        }
    }
};

/**
 * Database index recommendations
 */
export const IndexRecommendations = {
    users: [
        // Single field indexes
        { email: 1 },
        { accountStatus: 1 },
        { role: 1 },
        { createdAt: -1 },
        { lastLogin: -1 },

        // Compound indexes for common query patterns
        { accountStatus: 1, role: 1 },
        { accountStatus: 1, createdAt: -1 },
        { role: 1, createdAt: -1 },

        // Text search index
        {
            firstName: 'text',
            lastName: 'text',
            email: 'text'
        }
    ],

    bookings: [
        // Single field indexes
        { userId: 1 },
        { status: 1 },
        { serviceType: 1 },
        { scheduledDate: -1 },
        { createdAt: -1 },
        { paymentStatus: 1 },

        // Compound indexes
        { status: 1, scheduledDate: -1 },
        { userId: 1, status: 1 },
        { serviceType: 1, scheduledDate: -1 },
        { status: 1, createdAt: -1 }
    ],

    services: [
        // Single field indexes
        { category: 1 },
        { isActive: 1 },
        { isFeatured: 1 },
        { price: 1 },
        { createdAt: -1 },

        // Compound indexes
        { isActive: 1, category: 1 },
        { isActive: 1, isFeatured: 1 },
        { category: 1, price: 1 },

        // Text search index
        {
            name: 'text',
            description: 'text',
            category: 'text'
        }
    ],

    orders: [
        // Single field indexes
        { userId: 1 },
        { status: 1 },
        { paymentStatus: 1 },
        { createdAt: -1 },
        { totalAmount: 1 },

        // Compound indexes
        { userId: 1, status: 1 },
        { status: 1, createdAt: -1 },
        { paymentStatus: 1, createdAt: -1 }
    ]
};

/**
 * Create database indexes automatically
 */
export const createOptimizedIndexes = async (db) => {
    try {
        console.log('Creating optimized database indexes...');

        for (const [collection, indexes] of Object.entries(IndexRecommendations)) {
            const coll = db.collection(collection);

            for (const index of indexes) {
                try {
                    await coll.createIndex(index);
                    console.log(`✓ Created index on ${collection}:`, index);
                } catch (error) {
                    // Index might already exist, skip
                    if (!error.message.includes('already exists')) {
                        console.warn(`⚠ Failed to create index on ${collection}:`, error.message);
                    }
                }
            }
        }

        console.log('✅ Database indexes optimization completed');
    } catch (error) {
        console.error('❌ Failed to create database indexes:', error);
    }
};

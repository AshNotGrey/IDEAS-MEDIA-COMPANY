/**
 * API Response optimization utilities
 * Provides compression, pagination, and response formatting optimizations
 */

/**
 * Response compression and optimization
 */
export const ResponseOptimizer = {
  /**
   * Optimize GraphQL response by removing null/undefined fields
   */
  cleanResponse: (data) => {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => ResponseOptimizer.cleanResponse(item));
    }

    if (typeof data === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          cleaned[key] = ResponseOptimizer.cleanResponse(value);
        }
      }
      return cleaned;
    }

    return data;
  },

  /**
   * Compress large arrays by limiting nested object fields
   */
  compressArray: (array, maxFields = 10) => {
    if (!Array.isArray(array) || array.length === 0) {
      return array;
    }

    return array.map(item => {
      if (typeof item === 'object' && item !== null) {
        const keys = Object.keys(item);
        if (keys.length > maxFields) {
          // Keep most important fields
          const importantFields = ['id', '_id', 'name', 'title', 'email', 'status', 'createdAt'];
          const compressed = {};
          
          // Add important fields first
          importantFields.forEach(field => {
            if (item[field] !== undefined) {
              compressed[field] = item[field];
            }
          });
          
          // Add remaining fields up to limit
          let count = Object.keys(compressed).length;
          for (const key of keys) {
            if (count >= maxFields) break;
            if (!compressed.hasOwnProperty(key)) {
              compressed[key] = item[key];
              count++;
            }
          }
          
          return compressed;
        }
      }
      return item;
    });
  },

  /**
   * Create paginated response with metadata
   */
  paginate: (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null
      }
    };
  },

  /**
   * Optimize nested lookups by batching
   */
  batchNestedData: async (items, lookupField, lookupFunction, batchSize = 50) => {
    if (!items || items.length === 0) {
      return items;
    }

    // Extract unique IDs for lookup
    const ids = [...new Set(items.map(item => item[lookupField]).filter(Boolean))];
    
    // Batch lookup in chunks
    const lookupResults = new Map();
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const results = await lookupFunction(batch);
      
      results.forEach(result => {
        lookupResults.set(result._id.toString(), result);
      });
    }

    // Attach lookup results to items
    return items.map(item => ({
      ...item,
      [lookupField.replace('Id', '')]: lookupResults.get(item[lookupField]?.toString())
    }));
  }
};

/**
 * Field selection optimization for GraphQL
 */
export const FieldSelector = {
  /**
   * Parse GraphQL field selection info
   */
  parseSelections: (info) => {
    const selections = info.fieldNodes[0].selectionSet?.selections || [];
    const fields = {};

    selections.forEach(selection => {
      if (selection.kind === 'Field') {
        fields[selection.name.value] = selection.selectionSet 
          ? FieldSelector.parseNestedSelections(selection.selectionSet)
          : true;
      }
    });

    return fields;
  },

  /**
   * Parse nested field selections
   */
  parseNestedSelections: (selectionSet) => {
    const fields = {};
    
    selectionSet.selections.forEach(selection => {
      if (selection.kind === 'Field') {
        fields[selection.name.value] = selection.selectionSet
          ? FieldSelector.parseNestedSelections(selection.selectionSet)
          : true;
      }
    });

    return fields;
  },

  /**
   * Create MongoDB projection from GraphQL selections
   */
  createProjection: (selections, excludeFields = []) => {
    const projection = {};
    
    Object.keys(selections).forEach(field => {
      if (!excludeFields.includes(field)) {
        projection[field] = 1;
      }
    });

    // Always include _id unless explicitly excluded
    if (!excludeFields.includes('_id') && !excludeFields.includes('id')) {
      projection._id = 1;
    }

    return projection;
  },

  /**
   * Optimize lookup projections based on selected fields
   */
  optimizeLookups: (selections) => {
    const lookups = {};
    
    Object.entries(selections).forEach(([field, subFields]) => {
      if (typeof subFields === 'object' && subFields !== null) {
        // This is a nested field (likely a lookup)
        lookups[field] = Object.keys(subFields);
      }
    });

    return lookups;
  }
};

/**
 * Response caching with ETags and conditional requests
 */
export const ResponseCaching = {
  /**
   * Generate ETag for response data
   */
  generateETag: (data) => {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  },

  /**
   * Check if response has been modified
   */
  isModified: (req, etag, lastModified) => {
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];

    // Check ETag
    if (ifNoneMatch && ifNoneMatch === etag) {
      return false;
    }

    // Check last modified date
    if (ifModifiedSince && lastModified) {
      const clientDate = new Date(ifModifiedSince);
      const serverDate = new Date(lastModified);
      return serverDate > clientDate;
    }

    return true;
  },

  /**
   * Set cache headers
   */
  setCacheHeaders: (res, etag, lastModified, maxAge = 300) => {
    if (etag) {
      res.set('ETag', etag);
    }
    
    if (lastModified) {
      res.set('Last-Modified', new Date(lastModified).toUTCString());
    }
    
    res.set('Cache-Control', `public, max-age=${maxAge}`);
  }
};

/**
 * Data transformation utilities
 */
export const DataTransformer = {
  /**
   * Transform MongoDB documents for API response
   */
  transformDocument: (doc, transformations = {}) => {
    if (!doc) return doc;

    const transformed = { ...doc };

    // Convert _id to id
    if (transformed._id) {
      transformed.id = transformed._id.toString();
      delete transformed._id;
    }

    // Apply custom transformations
    Object.entries(transformations).forEach(([field, transformer]) => {
      if (transformed[field] !== undefined) {
        transformed[field] = transformer(transformed[field]);
      }
    });

    // Format dates
    ['createdAt', 'updatedAt', 'lastLogin', 'scheduledDate'].forEach(field => {
      if (transformed[field] instanceof Date) {
        transformed[field] = transformed[field].toISOString();
      }
    });

    return transformed;
  },

  /**
   * Transform array of documents
   */
  transformArray: (docs, transformations = {}) => {
    if (!Array.isArray(docs)) return docs;
    return docs.map(doc => DataTransformer.transformDocument(doc, transformations));
  },

  /**
   * Sanitize sensitive data
   */
  sanitize: (data, sensitiveFields = ['password', 'token', 'secret']) => {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }
};

/**
 * Error response optimization
 */
export const ErrorOptimizer = {
  /**
   * Format GraphQL errors for production
   */
  formatError: (error, isDevelopment = false) => {
    const formatted = {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };

    if (isDevelopment) {
      formatted.stack = error.stack;
      formatted.path = error.path;
      formatted.locations = error.locations;
    }

    // Add specific error details based on type
    if (error.extensions?.code === 'VALIDATION_ERROR') {
      formatted.details = error.extensions.details;
    }

    return formatted;
  },

  /**
   * Create standardized API error response
   */
  createErrorResponse: (message, code = 'INTERNAL_ERROR', status = 500, details = null) => {
    return {
      error: {
        message,
        code,
        status,
        timestamp: new Date().toISOString(),
        ...(details && { details })
      }
    };
  }
};

/**
 * Performance monitoring for responses
 */
export const ResponseMonitor = {
  /**
   * Track response times and sizes
   */
  trackResponse: (operationName, responseTime, responseSize) => {
    // In a real implementation, this would send to monitoring service
    console.log(`GraphQL Operation: ${operationName}`, {
      responseTime: `${responseTime}ms`,
      responseSize: `${(responseSize / 1024).toFixed(2)}KB`,
      timestamp: new Date().toISOString()
    });

    // Alert on slow responses
    if (responseTime > 1000) {
      console.warn(`Slow GraphQL operation detected: ${operationName} took ${responseTime}ms`);
    }

    // Alert on large responses
    if (responseSize > 1024 * 1024) { // 1MB
      console.warn(`Large GraphQL response detected: ${operationName} returned ${(responseSize / 1024 / 1024).toFixed(2)}MB`);
    }
  },

  /**
   * Middleware to track all GraphQL operations
   */
  createTrackingMiddleware: () => {
    return (req, res, next) => {
      const startTime = Date.now();
      const originalSend = res.send;

      res.send = function(data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const responseSize = Buffer.byteLength(data);
        const operationName = req.body?.operationName || 'Unknown';

        ResponseMonitor.trackResponse(operationName, responseTime, responseSize);
        
        return originalSend.call(this, data);
      };

      next();
    };
  }
};

/**
 * Batch processing utilities
 */
export const BatchProcessor = {
  /**
   * Process items in batches to avoid memory issues
   */
  processBatches: async (items, batchSize, processor) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  },

  /**
   * Create batched resolver
   */
  createBatchedResolver: (resolver, batchSize = 100) => {
    return async (parent, args, context, info) => {
      if (args.ids && args.ids.length > batchSize) {
        return BatchProcessor.processBatches(
          args.ids,
          batchSize,
          (batch) => resolver(parent, { ...args, ids: batch }, context, info)
        );
      }
      
      return resolver(parent, args, context, info);
    };
  }
};

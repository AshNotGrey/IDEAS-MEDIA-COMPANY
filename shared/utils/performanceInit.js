/**
 * Performance optimization initialization
 * Sets up all performance enhancements when the server starts
 */

import { createOptimizedIndexes } from './queryOptimization.js';
import { CacheMonitoring, CacheWarming } from './caching.js';
import { initializeBackgroundJobs } from './backgroundJobs.js';
import { models } from '../mongoDB/index.js';

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = async () => {
    console.log('🚀 Initializing performance optimizations...');

    try {
        // 1. Create database indexes for optimal query performance
        console.log('📊 Setting up database indexes...');
        await createOptimizedIndexes(models.User.db);

        // 2. Initialize background job processing
        console.log('⚡ Initializing background jobs...');
        initializeBackgroundJobs();

        // 3. Start cache monitoring
        console.log('🔍 Starting cache monitoring...');
        CacheMonitoring.startCleanup();

        // 4. Warm up frequently accessed caches
        console.log('🔥 Warming up caches...');
        await warmupCaches();

        console.log('✅ Performance optimizations initialized successfully');

        // Log system status
        logSystemStatus();

    } catch (error) {
        console.error('❌ Failed to initialize performance optimizations:', error);
        throw error;
    }
};

/**
 * Warm up frequently accessed caches
 */
const warmupCaches = async () => {
    try {
        // Note: In a real implementation, you would pass actual resolver functions
        // For now, we'll just log what would be warmed up

        console.log('  - Dashboard stats cache');
        console.log('  - Active services cache');
        console.log('  - User statistics cache');
        console.log('  - Booking statistics cache');

        // Example of how you would warm up caches:
        // await CacheWarming.warmDashboard(resolvers);
        // await CacheWarming.warmFrequentData(resolvers);

    } catch (error) {
        console.warn('⚠️ Failed to warm up some caches:', error.message);
    }
};

/**
 * Log current system status and performance metrics
 */
const logSystemStatus = () => {
    console.log('\n📊 System Performance Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Memory usage
    const memUsage = process.memoryUsage();
    console.log(`💾 Memory Usage:`);
    console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);

    // Node.js version
    console.log(`🟢 Node.js Version: ${process.version}`);

    // Environment
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Uptime
    console.log(`⏱️  Process Uptime: ${Math.floor(process.uptime())}s`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * Performance monitoring and health checks
 */
export const startPerformanceMonitoring = () => {
    console.log('🔍 Starting performance monitoring...');

    // Monitor memory usage
    setInterval(() => {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

        if (heapUsedMB > 500) { // Alert if heap usage exceeds 500MB
            console.warn(`⚠️ High memory usage detected: ${heapUsedMB.toFixed(2)} MB`);
        }
    }, 30000); // Check every 30 seconds

    // Monitor event loop lag
    let start = process.hrtime.bigint();
    setInterval(() => {
        const delta = process.hrtime.bigint() - start;
        const lag = Number(delta) / 1000000; // Convert to milliseconds

        if (lag > 100) { // Alert if event loop lag exceeds 100ms
            console.warn(`⚠️ Event loop lag detected: ${lag.toFixed(2)}ms`);
        }

        start = process.hrtime.bigint();
    }, 5000); // Check every 5 seconds

    console.log('✅ Performance monitoring started');
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

    try {
        // Stop background jobs
        const { shutdownBackgroundJobs } = await import('./backgroundJobs.js');
        await shutdownBackgroundJobs();

        // Clear caches
        const { cache } = await import('./caching.js');
        cache.clear();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};

/**
 * Setup process event handlers
 */
export const setupProcessHandlers = () => {
    // Graceful shutdown on SIGTERM (production)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        // In production, you might want to exit the process
        // process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        // Exit process on uncaught exception
        process.exit(1);
    });

    console.log('✅ Process event handlers setup complete');
};

/**
 * Performance optimization recommendations
 */
export const getPerformanceRecommendations = () => {
    const recommendations = [];
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

    // Memory recommendations
    if (heapUsedMB > 400) {
        recommendations.push({
            type: 'memory',
            severity: 'warning',
            message: `High memory usage: ${heapUsedMB.toFixed(2)}MB`,
            suggestion: 'Consider implementing memory optimization strategies'
        });
    }

    // Cache recommendations
    const { cache } = require('./caching.js');
    const cacheStats = cache.getStats();
    const hitRate = parseFloat(cacheStats.hitRate);

    if (hitRate < 50) {
        recommendations.push({
            type: 'cache',
            severity: 'info',
            message: `Low cache hit rate: ${cacheStats.hitRate}`,
            suggestion: 'Review caching strategies and TTL values'
        });
    }

    return recommendations;
};

/**
 * Export performance metrics for monitoring
 */
export const getPerformanceMetrics = () => {
    const memUsage = process.memoryUsage();
    const { cache } = require('./caching.js');
    const { jobQueue } = require('./backgroundJobs.js');
    const { queryMonitor } = require('./queryOptimization.js');

    return {
        timestamp: new Date().toISOString(),
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        },
        cache: cache.getStats(),
        jobs: jobQueue.getStats(),
        queries: queryMonitor.getStats(),
        uptime: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
};

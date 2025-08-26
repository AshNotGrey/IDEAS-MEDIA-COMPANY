#!/usr/bin/env node

/**
 * Performance test runner script
 * Run comprehensive performance tests from command line
 */

import PerformanceTestRunner, { validatePerformance } from '../utils/performanceTesting.js';
import { getPerformanceMetrics } from '../utils/performanceInit.js';

const args = process.argv.slice(2);
const command = args[0] || 'full';

async function main() {
    console.log('🚀 IDEAS MEDIA COMPANY - Performance Testing Suite\n');

    try {
        switch (command) {
            case 'full':
                await runFullTests();
                break;
            case 'quick':
                await runQuickTests();
                break;
            case 'metrics':
                await showMetrics();
                break;
            case 'validate':
                await runValidation();
                break;
            default:
                showUsage();
                break;
        }
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        process.exit(1);
    }
}

/**
 * Run full performance test suite
 */
async function runFullTests() {
    console.log('Running comprehensive performance tests...\n');

    const runner = new PerformanceTestRunner({
        baseUrl: process.env.CLIENT_URL || 'http://localhost:5173',
        adminUrl: process.env.ADMIN_URL || 'http://localhost:5176',
        apiUrl: process.env.API_URL || 'http://localhost:4000'
    });

    const report = await runner.runAllTests();

    // Save report to file
    const fs = await import('fs');
    const reportPath = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Full report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (report.overallStatus === 'failed') {
        process.exit(1);
    } else if (report.overallStatus === 'warning') {
        process.exit(2);
    }
}

/**
 * Run quick validation tests
 */
async function runQuickTests() {
    console.log('Running quick performance validation...\n');

    const results = await validatePerformance();

    const failed = results.filter(r => r.status === 'failed').length;
    if (failed > 0) {
        console.log(`❌ ${failed} tests failed`);
        process.exit(1);
    } else {
        console.log('✅ All quick tests passed');
    }
}

/**
 * Show current performance metrics
 */
async function showMetrics() {
    console.log('📊 Current Performance Metrics:\n');

    try {
        const metrics = getPerformanceMetrics();

        console.log('Memory Usage:');
        console.log(`  RSS: ${metrics.memory.rss} MB`);
        console.log(`  Heap Used: ${metrics.memory.heapUsed} MB`);
        console.log(`  Heap Total: ${metrics.memory.heapTotal} MB`);
        console.log(`  External: ${metrics.memory.external} MB\n`);

        console.log('Cache Performance:');
        console.log(`  Hit Rate: ${metrics.cache.hitRate}`);
        console.log(`  Total Operations: ${metrics.cache.hits + metrics.cache.misses}`);
        console.log(`  Cache Size: ${metrics.cache.size} entries\n`);

        console.log('Background Jobs:');
        console.log(`  Pending: ${metrics.jobs.pending}`);
        console.log(`  Processing: ${metrics.jobs.processing}`);
        console.log(`  Completed: ${metrics.jobs.completed}`);
        console.log(`  Failed: ${metrics.jobs.failed}\n`);

        console.log('Database Queries:');
        console.log(`  Total Queries: ${metrics.queries.totalQueries}`);
        console.log(`  Slow Queries: ${metrics.queries.slowQueries}`);
        console.log(`  Average Duration: ${metrics.queries.averageDuration}ms`);
        console.log(`  Slow Query Rate: ${metrics.queries.slowQueryPercentage}%\n`);

        console.log('System Info:');
        console.log(`  Uptime: ${Math.floor(metrics.uptime / 60)}m ${metrics.uptime % 60}s`);
        console.log(`  Node Version: ${metrics.nodeVersion}`);
        console.log(`  Environment: ${metrics.environment}`);

    } catch (error) {
        console.error('❌ Failed to get performance metrics:', error.message);
        console.log('\n💡 Make sure the server is running and performance monitoring is initialized.');
    }
}

/**
 * Run validation only
 */
async function runValidation() {
    console.log('🔍 Running performance validation...\n');

    // Validate system requirements
    console.log('Checking system requirements:');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    console.log(`✓ Node.js version: ${nodeVersion} ${majorVersion >= 18 ? '(Good)' : '(Upgrade recommended)'}`);

    // Check available memory
    const os = await import('os');
    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    console.log(`✓ System memory: ${totalMem.toFixed(1)}GB ${totalMem >= 4 ? '(Good)' : '(More recommended)'}`);

    // Check CPU cores
    const cpuCores = os.cpus().length;
    console.log(`✓ CPU cores: ${cpuCores} ${cpuCores >= 2 ? '(Good)' : '(More recommended)'}`);

    console.log('\nPerformance validation completed ✅');
}

/**
 * Show usage information
 */
function showUsage() {
    console.log('Usage: node performance-test.js [command]\n');
    console.log('Commands:');
    console.log('  full      Run comprehensive performance tests (default)');
    console.log('  quick     Run quick validation tests');
    console.log('  metrics   Show current performance metrics');
    console.log('  validate  Validate system requirements');
    console.log('\nExamples:');
    console.log('  node performance-test.js full');
    console.log('  node performance-test.js quick');
    console.log('  npm run test:performance');
}

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});

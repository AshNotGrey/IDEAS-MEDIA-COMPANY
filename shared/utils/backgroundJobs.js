/**
 * Background job processing system
 * Provides queue management and job processing for async operations
 */

/**
 * Simple in-memory job queue
 */
class JobQueue {
  constructor(options = {}) {
    this.jobs = new Map();
    this.processing = new Set();
    this.completed = new Map();
    this.failed = new Map();
    this.workers = [];
    this.maxWorkers = options.maxWorkers || 3;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 5000; // 5 seconds
    this.isRunning = false;
    this.jobIdCounter = 0;
  }

  /**
   * Add a job to the queue
   */
  add(type, data, options = {}) {
    const jobId = `${type}_${++this.jobIdCounter}_${Date.now()}`;
    const job = {
      id: jobId,
      type,
      data,
      priority: options.priority || 0,
      delay: options.delay || 0,
      maxRetries: options.maxRetries || this.maxRetries,
      attempts: 0,
      createdAt: new Date(),
      scheduledAt: new Date(Date.now() + (options.delay || 0)),
      status: 'pending'
    };

    this.jobs.set(jobId, job);
    console.log(`✓ Job added to queue: ${jobId} (${type})`);

    // Start processing if not already running
    if (!this.isRunning) {
      this.start();
    }

    return jobId;
  }

  /**
   * Start job processing
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(`🚀 Job queue started with ${this.maxWorkers} workers`);

    // Start worker processes
    for (let i = 0; i < this.maxWorkers; i++) {
      this.startWorker(`worker-${i + 1}`);
    }
  }

  /**
   * Stop job processing
   */
  async stop() {
    this.isRunning = false;
    console.log('🛑 Stopping job queue...');

    // Wait for current jobs to complete
    while (this.processing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✓ Job queue stopped');
  }

  /**
   * Start a worker process
   */
  async startWorker(workerId) {
    console.log(`👷 Worker ${workerId} started`);

    while (this.isRunning) {
      try {
        const job = this.getNextJob();

        if (job) {
          await this.processJob(job, workerId);
        } else {
          // No jobs available, wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Worker ${workerId} error:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log(`👷 Worker ${workerId} stopped`);
  }

  /**
   * Get next job from queue
   */
  getNextJob() {
    const now = new Date();
    let nextJob = null;
    let highestPriority = -Infinity;

    for (const job of this.jobs.values()) {
      if (job.status === 'pending' &&
        job.scheduledAt <= now &&
        !this.processing.has(job.id) &&
        job.priority > highestPriority) {
        nextJob = job;
        highestPriority = job.priority;
      }
    }

    return nextJob;
  }

  /**
   * Process a job
   */
  async processJob(job, workerId) {
    this.processing.add(job.id);
    job.status = 'processing';
    job.attempts++;
    job.startedAt = new Date();
    job.workerId = workerId;

    console.log(`⚡ Processing job ${job.id} (${job.type}) with worker ${workerId}`);

    try {
      const processor = JobProcessors[job.type];
      if (!processor) {
        throw new Error(`No processor found for job type: ${job.type}`);
      }

      const result = await processor(job.data);

      // Job completed successfully
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;

      this.completed.set(job.id, job);
      this.jobs.delete(job.id);
      this.processing.delete(job.id);

      console.log(`✅ Job completed: ${job.id}`);

    } catch (error) {
      console.error(`❌ Job failed: ${job.id}`, error);

      job.status = 'failed';
      job.error = error.message;
      job.failedAt = new Date();

      // Retry if attempts remaining
      if (job.attempts < job.maxRetries) {
        job.status = 'pending';
        job.scheduledAt = new Date(Date.now() + this.retryDelay);
        console.log(`🔄 Retrying job ${job.id} in ${this.retryDelay}ms (attempt ${job.attempts + 1}/${job.maxRetries})`);
      } else {
        // Max retries reached
        this.failed.set(job.id, job);
        this.jobs.delete(job.id);
        console.log(`💀 Job permanently failed: ${job.id}`);
      }

      this.processing.delete(job.id);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    const job = this.jobs.get(jobId) ||
      this.completed.get(jobId) ||
      this.failed.get(jobId);

    if (!job) return null;

    return {
      id: job.id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxRetries: job.maxRetries,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      failedAt: job.failedAt,
      error: job.error,
      result: job.result
    };
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      pending: Array.from(this.jobs.values()).filter(j => j.status === 'pending').length,
      processing: this.processing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      total: this.jobs.size + this.completed.size + this.failed.size,
      workers: this.maxWorkers,
      isRunning: this.isRunning
    };
  }

  /**
   * Clear completed and failed jobs
   */
  cleanup(olderThanHours = 24) {
    const cutoff = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    let cleaned = 0;

    // Clean completed jobs
    for (const [jobId, job] of this.completed.entries()) {
      if (job.completedAt < cutoff) {
        this.completed.delete(jobId);
        cleaned++;
      }
    }

    // Clean failed jobs
    for (const [jobId, job] of this.failed.entries()) {
      if (job.failedAt < cutoff) {
        this.failed.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old jobs`);
    }

    return cleaned;
  }
}

/**
 * Job processors for different job types
 */
export const JobProcessors = {
  /**
   * Send welcome email
   */
  'send-welcome-email': async (data) => {
    const { userId, email, firstName } = data;
    console.log(`📧 Sending welcome email to ${email} (${firstName})`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Here you would integrate with your email service
    // await emailService.sendWelcomeEmail({ email, firstName });

    return { sent: true, email, timestamp: new Date() };
  },

  /**
   * Send email verification
   */
  'send-email-verification': async (data) => {
    const { to, subject, html, text } = data;
    console.log(`📧 Sending email verification to ${to}`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here you would integrate with your email service
    // const { sendMail } = await import('../utils/email.js');
    // await sendMail({ to, subject, html, text });

    return { sent: true, email: to, subject, timestamp: new Date() };
  },

  /**
   * Send ID verification status email
   */
  'send-id-verification-status': async (data) => {
    const { userId, email, name, type, status, reason } = data;
    console.log(`📧 Sending ID verification ${status} email to ${email} (${type})`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Here you would integrate with your email service
    // const { sendMail, buildIDVerificationStatusEmail } = await import('../utils/email.js');
    // const { html, text } = buildIDVerificationStatusEmail({ name, type, status, reason });
    // const subject = status === 'verified' 
    //   ? `🎉 ${type === 'nin' ? 'NIN' : 'Driver\'s License'} Verification Approved!`
    //   : `${type === 'nin' ? 'NIN' : 'Driver\'s License'} Verification Update`;
    // await sendMail({ to: email, subject, html, text });

    return {
      sent: true,
      email,
      type,
      status,
      reason: reason || null,
      timestamp: new Date()
    };
  },

  /**
   * Send booking confirmation email
   */
  'send-booking-confirmation': async (data) => {
    const { bookingId, userEmail, bookingDetails } = data;
    console.log(`📧 Sending booking confirmation to ${userEmail} for booking ${bookingId}`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    return { sent: true, bookingId, email: userEmail, timestamp: new Date() };
  },

  /**
   * Process image optimization
   */
  'optimize-image': async (data) => {
    const { imageUrl, optimizations } = data;
    console.log(`🖼️ Optimizing image: ${imageUrl}`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Here you would integrate with image optimization service
    return {
      originalUrl: imageUrl,
      optimizedUrl: `${imageUrl}?optimized=true`,
      savings: '45%',
      timestamp: new Date()
    };
  },

  /**
   * Generate analytics report
   */
  'generate-analytics-report': async (data) => {
    const { reportType, dateRange, userId } = data;
    console.log(`📊 Generating ${reportType} report for ${dateRange.start} to ${dateRange.end}`);

    await new Promise(resolve => setTimeout(resolve, 10000));

    return {
      reportType,
      dateRange,
      generatedAt: new Date(),
      reportUrl: `/reports/${reportType}_${Date.now()}.pdf`,
      recordCount: Math.floor(Math.random() * 1000)
    };
  },

  /**
   * Cleanup old files
   */
  'cleanup-old-files': async (data) => {
    const { directory, olderThanDays } = data;
    console.log(`🧹 Cleaning up files in ${directory} older than ${olderThanDays} days`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      directory,
      filesDeleted: Math.floor(Math.random() * 50),
      spaceSaved: `${Math.floor(Math.random() * 500)}MB`,
      timestamp: new Date()
    };
  },

  /**
   * Send push notifications
   */
  'send-push-notification': async (data) => {
    const { userIds, title, body, data: notificationData } = data;
    console.log(`📱 Sending push notification to ${userIds.length} users: ${title}`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      title,
      sentTo: userIds.length,
      successCount: userIds.length - Math.floor(Math.random() * 3),
      timestamp: new Date()
    };
  },

  /**
   * Deliver notification to users
   */
  'deliver-notification': async (data) => {
    const { notificationId } = data;
    console.log(`📢 Delivering notification ${notificationId}`);

    // Simulate notification delivery processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Here you would:
    // 1. Load the notification from DB
    // 2. Resolve recipients based on roles/filters
    // 3. Send via enabled channels (email, push, SMS)
    // 4. Update delivery status

    return {
      notificationId,
      delivered: true,
      channels: ['inApp', 'push'],
      recipientCount: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date()
    };
  },

  /**
   * Backup database
   */
  'backup-database': async (data) => {
    const { collections, destination } = data;
    console.log(`💾 Backing up ${collections.length} collections to ${destination}`);

    await new Promise(resolve => setTimeout(resolve, 15000));

    return {
      collections,
      destination,
      backupSize: `${Math.floor(Math.random() * 1000)}MB`,
      timestamp: new Date()
    };
  }
};

/**
 * Global job queue instance
 */
export const jobQueue = new JobQueue({
  maxWorkers: 3,
  maxRetries: 3,
  retryDelay: 5000
});

/**
 * Job scheduling utilities
 */
export const JobScheduler = {
  /**
   * Schedule recurring jobs
   */
  scheduleRecurring: (jobType, data, intervalMs) => {
    const schedule = () => {
      jobQueue.add(jobType, data);
      setTimeout(schedule, intervalMs);
    };

    // Start first execution after a short delay
    setTimeout(schedule, 1000);
    console.log(`⏰ Scheduled recurring job: ${jobType} every ${intervalMs}ms`);
  },

  /**
   * Schedule daily cleanup
   */
  scheduleDailyCleanup: () => {
    const scheduleNext = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // 2 AM

      const delay = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
        jobQueue.add('cleanup-old-files', {
          directory: '/tmp',
          olderThanDays: 7
        });

        // Clean up job queue itself
        jobQueue.cleanup(24);

        // Schedule next cleanup
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    console.log('⏰ Scheduled daily cleanup at 2 AM');
  },

  /**
   * Schedule weekly reports
   */
  scheduleWeeklyReports: () => {
    const scheduleNext = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
      nextMonday.setHours(9, 0, 0, 0); // 9 AM Monday

      const delay = nextMonday.getTime() - now.getTime();

      setTimeout(() => {
        jobQueue.add('generate-analytics-report', {
          reportType: 'weekly-summary',
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        });

        // Schedule next report
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    console.log('⏰ Scheduled weekly reports for Monday 9 AM');
  }
};

/**
 * Job queue monitoring
 */
export const JobMonitoring = {
  /**
   * Start monitoring job queue health
   */
  startMonitoring: (intervalMs = 60000) => {
    setInterval(() => {
      const stats = jobQueue.getStats();
      console.log('📊 Job Queue Stats:', stats);

      // Alert on high failure rate
      if (stats.failed > stats.completed * 0.1 && stats.total > 10) {
        console.warn('⚠️ High job failure rate detected');
      }

      // Alert on queue backup
      if (stats.pending > 100) {
        console.warn('⚠️ Job queue backup detected - consider scaling workers');
      }
    }, intervalMs);
  },

  /**
   * Get detailed job information
   */
  getJobDetails: () => {
    const stats = jobQueue.getStats();
    const recentFailed = Array.from(jobQueue.failed.values())
      .slice(-10)
      .map(job => ({
        id: job.id,
        type: job.type,
        error: job.error,
        failedAt: job.failedAt
      }));

    return {
      ...stats,
      recentFailed
    };
  }
};

/**
 * Initialize background job system
 */
export const initializeBackgroundJobs = () => {
  console.log('🚀 Initializing background job system...');

  // Start the job queue
  jobQueue.start();

  // Schedule recurring jobs
  JobScheduler.scheduleDailyCleanup();
  JobScheduler.scheduleWeeklyReports();

  // Start monitoring
  JobMonitoring.startMonitoring();

  console.log('✅ Background job system initialized');
};

/**
 * Graceful shutdown
 */
export const shutdownBackgroundJobs = async () => {
  console.log('🛑 Shutting down background job system...');
  await jobQueue.stop();
  console.log('✅ Background job system shutdown complete');
};

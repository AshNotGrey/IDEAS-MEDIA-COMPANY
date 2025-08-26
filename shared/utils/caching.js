/**
 * Caching utilities for improved performance
 * Provides in-memory caching and Redis-compatible interface
 */

/**
 * In-memory cache implementation
 */
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.maxSize = options.maxSize || 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Set a value in cache with optional TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // Clear existing timer for this key
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl
    });

    // Set expiration timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    this.stats.sets++;
    return true;
  }

  /**
   * Get a value from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (entry.ttl > 0 && Date.now() - entry.createdAt > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Delete a value from cache
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    if (deleted) {
      this.stats.deletes++;
    }

    return deleted;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    
    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get approximate memory usage
   */
  getMemoryUsage() {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Approximate string size
      size += JSON.stringify(entry.value).length * 2;
    }
    return `${(size / 1024).toFixed(2)} KB`;
  }

  /**
   * Get or set pattern - useful for resolver caching
   */
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error);
      throw error;
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // User-related keys
  user: (id) => `user:${id}`,
  userByEmail: (email) => `user:email:${email}`,
  userList: (filters) => `users:list:${JSON.stringify(filters)}`,
  userStats: () => 'users:stats',

  // Booking-related keys
  booking: (id) => `booking:${id}`,
  bookingList: (filters) => `bookings:list:${JSON.stringify(filters)}`,
  bookingStats: () => 'bookings:stats',
  userBookings: (userId) => `user:${userId}:bookings`,

  // Service-related keys
  service: (id) => `service:${id}`,
  serviceList: (filters) => `services:list:${JSON.stringify(filters)}`,
  serviceStats: () => 'services:stats',
  activeServices: () => 'services:active',

  // Order-related keys
  order: (id) => `order:${id}`,
  orderList: (filters) => `orders:list:${JSON.stringify(filters)}`,
  userOrders: (userId) => `user:${userId}:orders`,

  // Analytics keys
  dashboardStats: () => 'analytics:dashboard',
  revenueAnalytics: (period) => `analytics:revenue:${period}`,
  userAnalytics: (period) => `analytics:users:${period}`,
  bookingAnalytics: (period) => `analytics:bookings:${period}`,

  // Settings keys
  settings: () => 'settings:all',
  settingsByCategory: (category) => `settings:category:${category}`,

  // Media keys
  mediaList: (filters) => `media:list:${JSON.stringify(filters)}`,
  mediaStats: () => 'media:stats'
};

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 300 * 1000,      // 5 minutes
  LONG: 900 * 1000,        // 15 minutes
  HOUR: 3600 * 1000,       // 1 hour
  DAY: 86400 * 1000,       // 24 hours
  WEEK: 604800 * 1000      // 7 days
};

/**
 * Global cache instance
 */
export const cache = new MemoryCache({
  defaultTTL: CacheTTL.MEDIUM,
  maxSize: 1000
});

/**
 * Cache invalidation utilities
 */
export const CacheInvalidation = {
  /**
   * Invalidate user-related caches
   */
  user: (userId) => {
    const patterns = [
      CacheKeys.user(userId),
      CacheKeys.userBookings(userId),
      CacheKeys.userOrders(userId),
      CacheKeys.userStats(),
      'users:list:' // Partial match for user lists
    ];

    patterns.forEach(pattern => {
      if (pattern.includes('users:list:')) {
        // Clear all user list caches
        for (const key of cache.cache.keys()) {
          if (key.startsWith(pattern)) {
            cache.delete(key);
          }
        }
      } else {
        cache.delete(pattern);
      }
    });
  },

  /**
   * Invalidate booking-related caches
   */
  booking: (bookingId, userId) => {
    const patterns = [
      CacheKeys.booking(bookingId),
      CacheKeys.bookingStats(),
      CacheKeys.dashboardStats(),
      'bookings:list:' // Partial match
    ];

    if (userId) {
      patterns.push(CacheKeys.userBookings(userId));
    }

    patterns.forEach(pattern => {
      if (pattern.includes('bookings:list:')) {
        for (const key of cache.cache.keys()) {
          if (key.startsWith(pattern)) {
            cache.delete(key);
          }
        }
      } else {
        cache.delete(pattern);
      }
    });
  },

  /**
   * Invalidate service-related caches
   */
  service: (serviceId) => {
    const patterns = [
      CacheKeys.service(serviceId),
      CacheKeys.serviceStats(),
      CacheKeys.activeServices(),
      'services:list:' // Partial match
    ];

    patterns.forEach(pattern => {
      if (pattern.includes('services:list:')) {
        for (const key of cache.cache.keys()) {
          if (key.startsWith(pattern)) {
            cache.delete(key);
          }
        }
      } else {
        cache.delete(pattern);
      }
    });
  },

  /**
   * Invalidate analytics caches
   */
  analytics: () => {
    const patterns = [
      'analytics:'
    ];

    patterns.forEach(pattern => {
      for (const key of cache.cache.keys()) {
        if (key.startsWith(pattern)) {
          cache.delete(key);
        }
      }
    });
  },

  /**
   * Clear all caches
   */
  all: () => {
    cache.clear();
  }
};

/**
 * Cache middleware for GraphQL resolvers
 */
export const withCache = (keyGenerator, ttl = CacheTTL.MEDIUM) => {
  return (resolver) => {
    return async (parent, args, context, info) => {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(args, context) 
        : keyGenerator;

      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute resolver and cache result
      try {
        const result = await resolver(parent, args, context, info);
        cache.set(cacheKey, result, ttl);
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };
  };
};

/**
 * Batch cache operations
 */
export const BatchCache = {
  /**
   * Get multiple keys at once
   */
  mget: (keys) => {
    return keys.map(key => ({
      key,
      value: cache.get(key)
    }));
  },

  /**
   * Set multiple keys at once
   */
  mset: (entries, ttl) => {
    entries.forEach(({ key, value }) => {
      cache.set(key, value, ttl);
    });
  },

  /**
   * Delete multiple keys at once
   */
  mdel: (keys) => {
    return keys.map(key => cache.delete(key));
  }
};

/**
 * Cache warming utilities
 */
export const CacheWarming = {
  /**
   * Warm up dashboard stats
   */
  warmDashboard: async (resolvers) => {
    try {
      console.log('Warming dashboard cache...');
      
      const stats = await resolvers.dashboardStats();
      cache.set(CacheKeys.dashboardStats(), stats, CacheTTL.MEDIUM);
      
      console.log('✓ Dashboard cache warmed');
    } catch (error) {
      console.error('Failed to warm dashboard cache:', error);
    }
  },

  /**
   * Warm up frequently accessed data
   */
  warmFrequentData: async (resolvers) => {
    try {
      console.log('Warming frequently accessed cache...');
      
      // Active services
      const services = await resolvers.services({ isActive: true });
      cache.set(CacheKeys.activeServices(), services, CacheTTL.LONG);
      
      // User stats
      const userStats = await resolvers.userStats();
      cache.set(CacheKeys.userStats(), userStats, CacheTTL.MEDIUM);
      
      // Booking stats
      const bookingStats = await resolvers.bookingStats();
      cache.set(CacheKeys.bookingStats(), bookingStats, CacheTTL.MEDIUM);
      
      console.log('✓ Frequent data cache warmed');
    } catch (error) {
      console.error('Failed to warm frequent data cache:', error);
    }
  }
};

/**
 * Cache monitoring and cleanup
 */
export const CacheMonitoring = {
  /**
   * Start periodic cache cleanup
   */
  startCleanup: (interval = 300000) => { // 5 minutes
    setInterval(() => {
      const stats = cache.getStats();
      console.log('Cache stats:', stats);
      
      // Clear cache if hit rate is too low
      if (parseFloat(stats.hitRate) < 20 && stats.size > 100) {
        console.log('Low cache hit rate detected, clearing cache');
        cache.clear();
      }
    }, interval);
  },

  /**
   * Get detailed cache information
   */
  getInfo: () => {
    const stats = cache.getStats();
    const keys = Array.from(cache.cache.keys());
    const keysByPattern = {};
    
    keys.forEach(key => {
      const pattern = key.split(':')[0];
      keysByPattern[pattern] = (keysByPattern[pattern] || 0) + 1;
    });
    
    return {
      ...stats,
      keysByPattern,
      totalKeys: keys.length
    };
  }
};

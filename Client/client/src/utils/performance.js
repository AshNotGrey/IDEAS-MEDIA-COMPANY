/**
 * Performance monitoring utilities for the Client PWA
 * Tracks key performance metrics and provides optimization insights
 */

// Web Vitals tracking
export const trackWebVitals = () => {
  // Track Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
        reportMetric('LCP', entry.startTime);
      }
    }
  });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
      reportMetric('FID', entry.processingStart - entry.startTime);
    }
  });
  fidObserver.observe({ type: 'first-input', buffered: true });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    console.log('CLS:', clsValue);
    reportMetric('CLS', clsValue);
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
};

// Report metrics to service worker for logging
const reportMetric = (name, value) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PERFORMANCE_LOG',
      metrics: { [name]: value, timestamp: Date.now() }
    });
  }
};

// Resource loading performance
export const trackResourceLoading = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.initiatorType === 'img') {
        console.log(`Image loaded: ${entry.name} - ${entry.duration}ms`);
      } else if (entry.initiatorType === 'script') {
        console.log(`Script loaded: ${entry.name} - ${entry.duration}ms`);
      }
    }
  });
  observer.observe({ type: 'resource', buffered: true });
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = performance.memory;
    console.log('Memory usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Bundle size analysis
export const analyzeBundleSize = async () => {
  if ('getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const cssResources = resources.filter(r => r.name.endsWith('.css'));
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);
    
    console.log('Bundle Analysis:', {
      totalJS: Math.round(totalJSSize / 1024) + ' KB',
      totalCSS: Math.round(totalCSSSize / 1024) + ' KB',
      jsFiles: jsResources.length,
      cssFiles: cssResources.length
    });
  }
};

// Network performance
export const trackNetworkPerformance = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    console.log('Network Info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink + ' Mbps',
      rtt: connection.rtt + ' ms',
      saveData: connection.saveData
    });
    
    // Adjust loading strategies based on connection
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      document.documentElement.classList.add('slow-connection');
    }
  }
};

// Image loading optimization
export const optimizeImageLoading = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
};

// Route change performance tracking
export const trackRouteChange = (routeName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Route change to ${routeName}: ${duration.toFixed(2)}ms`);
  reportMetric('RouteChange', duration);
};

// Initialize all performance tracking
export const initializePerformanceTracking = () => {
  if (process.env.NODE_ENV === 'production') {
    trackWebVitals();
    trackResourceLoading();
    trackNetworkPerformance();
    
    // Periodic memory monitoring
    setInterval(trackMemoryUsage, 30000); // Every 30 seconds
    
    // Bundle analysis after page load
    window.addEventListener('load', () => {
      setTimeout(analyzeBundleSize, 2000);
    });
  }
};

// Performance budget alerts
export const checkPerformanceBudget = () => {
  const budgets = {
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    bundleSize: 500 // 500KB
  };
  
  // Check if metrics exceed budget and warn
  // Implementation would depend on your monitoring setup
  console.log('Performance budgets:', budgets);
};

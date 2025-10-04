// ⚡ Performance Monitoring for The Freedom Compass

// 📊 Performance metrics tracking
export const trackPerformance = (metricName, startTime, additionalData = {}) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  const performanceData = {
    metric: metricName,
    duration: Math.round(duration),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...additionalData
  };
  
  // Log slow operations in development
  if (process.env.NODE_ENV === 'development' && duration > 100) {
    console.warn(`⚡ Slow Operation: ${metricName} took ${duration.toFixed(2)}ms`, performanceData);
  }
  
  // Track in production analytics
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    // analytics.track('performance_metric', performanceData);
  }
  
  return performanceData;
};

// 🎯 Performance wrapper for expensive operations
export const withPerformanceTracking = (fn, metricName, context = {}) => {
  return async (...args) => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      trackPerformance(metricName, startTime, { ...context, success: true });
      return result;
    } catch (error) {
      trackPerformance(metricName, startTime, { ...context, success: false, error: error.message });
      throw error;
    }
  };
};

// 🔄 Debounce utility for user inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 📱 Device performance detection
export const getDevicePerformance = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
  
  return {
    connectionType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    memory: memory,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    isLowEnd: memory <= 2 || (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType))
  };
};

// 🎨 Conditional rendering based on device performance
export const shouldRenderExpensiveComponent = (componentName) => {
  const device = getDevicePerformance();
  
  // Skip expensive animations/charts on low-end devices
  if (device.isLowEnd) {
    console.log(`⚡ Skipping expensive component: ${componentName} (low-end device)`);
    return false;
  }
  
  return true;
};

// 📊 Bundle size tracking
export const trackBundleLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      trackPerformance('app_load', navigation.fetchStart, {
        loadTime: Math.round(loadTime),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        firstPaint: Math.round(navigation.loadEventStart - navigation.fetchStart)
      });
    }
  }
};

export default {
  trackPerformance,
  withPerformanceTracking,
  debounce,
  getDevicePerformance,
  shouldRenderExpensiveComponent,
  trackBundleLoad
};
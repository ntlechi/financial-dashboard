// ⚡ PERFORMANCE OPTIMIZATION UTILITIES
// Tools to optimize the massive App.js and improve overall performance

import { trackPerformance, debounce, getDevicePerformance } from './performance';

// ============================================================================
// 🔄 MEMOIZATION UTILITIES
// ============================================================================

/**
 * Memoization cache for expensive calculations
 */
const calculationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Memoized calculation with automatic cache expiration
 * @param {string} key - Unique cache key
 * @param {Function} calculationFn - Function to memoize
 * @param {...any} args - Arguments for the calculation function
 * @returns {any} - Cached or calculated result
 */
export function memoizedCalculation(key, calculationFn, ...args) {
  const cacheKey = `${key}_${JSON.stringify(args)}`;
  const now = Date.now();
  
  // Check if we have a valid cached result
  if (calculationCache.has(cacheKey)) {
    const cached = calculationCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    } else {
      // Remove expired cache entry
      calculationCache.delete(cacheKey);
    }
  }
  
  // Calculate new result
  const startTime = performance.now();
  const result = calculationFn(...args);
  const endTime = performance.now();
  
  // Cache the result
  calculationCache.set(cacheKey, {
    result,
    timestamp: now,
    calculationTime: endTime - startTime
  });
  
  // Track performance
  trackPerformance(`memoized_${key}`, startTime, {
    cacheHit: false,
    calculationTime: endTime - startTime
  });
  
  // Clean up old cache entries periodically
  if (calculationCache.size > 100) {
    cleanupExpiredCache();
  }
  
  return result;
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, value] of calculationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      calculationCache.delete(key);
    }
  }
}

// ============================================================================
// 🎯 COMPONENT LAZY LOADING
// ============================================================================

/**
 * Lazy load components to reduce initial bundle size
 * @param {Function} importFn - Dynamic import function
 * @param {string} componentName - Name of the component for debugging
 * @returns {React.Component} - Lazy loaded component
 */
export function createLazyComponent(importFn, componentName) {
  return React.lazy(() => {
    const startTime = performance.now();
    
    return importFn().then(module => {
      const endTime = performance.now();
      trackPerformance(`lazy_load_${componentName}`, startTime, {
        componentName,
        loadTime: endTime - startTime
      });
      
      return module;
    }).catch(error => {
      trackPerformance(`lazy_load_error_${componentName}`, startTime, {
        componentName,
        error: error.message,
        success: false
      });
      
      // Return a fallback component
      return {
        default: () => React.createElement('div', {
          className: 'text-center p-4 text-gray-500'
        }, `Failed to load ${componentName}`)
      };
    });
  });
}

// ============================================================================
// 📊 DATA OPTIMIZATION
// ============================================================================

/**
 * Optimize large datasets for better performance
 * @param {Array} data - Array of data to optimize
 * @param {number} maxItems - Maximum number of items to keep
 * @param {string} sortBy - Property to sort by
 * @returns {Array} - Optimized dataset
 */
export function optimizeDataset(data, maxItems = 100, sortBy = 'date') {
  if (!Array.isArray(data) || data.length <= maxItems) {
    return data;
  }
  
  const startTime = performance.now();
  
  // Sort and take the most recent items
  const optimized = [...data]
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b[sortBy]) - new Date(a[sortBy]);
      }
      return b[sortBy] - a[sortBy];
    })
    .slice(0, maxItems);
  
  const endTime = performance.now();
  trackPerformance('dataset_optimization', startTime, {
    originalSize: data.length,
    optimizedSize: optimized.length,
    reduction: data.length - optimized.length
  });
  
  return optimized;
}

/**
 * Debounced data processing for user inputs
 * @param {Function} processFn - Function to process data
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function createDebouncedProcessor(processFn, delay = 300) {
  return debounce((data) => {
    const startTime = performance.now();
    const result = processFn(data);
    const endTime = performance.now();
    
    trackPerformance('debounced_processing', startTime, {
      dataSize: Array.isArray(data) ? data.length : 1,
      processingTime: endTime - startTime
    });
    
    return result;
  }, delay);
}

// ============================================================================
// 🎨 RENDER OPTIMIZATION
// ============================================================================

/**
 * Conditional rendering based on device performance
 * @param {string} componentName - Name of the component
 * @param {React.Component} expensiveComponent - Component to conditionally render
 * @param {React.Component} fallbackComponent - Fallback component for low-end devices
 * @returns {React.Component} - Appropriate component based on device performance
 */
export function createPerformanceAwareComponent(componentName, expensiveComponent, fallbackComponent) {
  return function PerformanceAwareComponent(props) {
    const [shouldRenderExpensive, setShouldRenderExpensive] = React.useState(false);
    
    React.useEffect(() => {
      const device = getDevicePerformance();
      const shouldRender = !device.isLowEnd;
      setShouldRenderExpensive(shouldRender);
      
      if (!shouldRender) {
        trackPerformance('component_skipped', 0, {
          componentName,
          reason: 'low_end_device',
          deviceInfo: device
        });
      }
    }, []);
    
    if (shouldRenderExpensive) {
      return React.createElement(expensiveComponent, props);
    } else {
      return React.createElement(fallbackComponent, props);
    }
  };
}

/**
 * Virtual scrolling for large lists
 * @param {Array} items - Array of items to render
 * @param {number} itemHeight - Height of each item in pixels
 * @param {number} containerHeight - Height of the container
 * @param {Function} renderItem - Function to render each item
 * @returns {Object} - Virtual scrolling configuration
 */
export function createVirtualScrolling(items, itemHeight, containerHeight, renderItem) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
}

// ============================================================================
// 🧠 MEMORY MANAGEMENT
// ============================================================================

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
    };
  }
  return null;
}

/**
 * Clean up resources to prevent memory leaks
 */
export function cleanupResources() {
  // Clear calculation cache
  calculationCache.clear();
  
  // Clear any other caches
  if (typeof window !== 'undefined' && window.gc) {
    window.gc(); // Force garbage collection if available
  }
  
  trackPerformance('memory_cleanup', 0, {
    cacheSize: calculationCache.size,
    memoryUsage: monitorMemoryUsage()
  });
}

// ============================================================================
// 📱 MOBILE OPTIMIZATION
// ============================================================================

/**
 * Mobile-specific optimizations
 */
export function getMobileOptimizations() {
  const device = getDevicePerformance();
  
  return {
    // Reduce animation complexity on mobile
    shouldUseAnimations: !device.isLowEnd,
    
    // Limit concurrent operations
    maxConcurrentOperations: device.isLowEnd ? 2 : 5,
    
    // Reduce data processing frequency
    dataProcessingInterval: device.isLowEnd ? 1000 : 500,
    
    // Limit cache size on mobile
    maxCacheSize: device.isLowEnd ? 50 : 100,
    
    // Use simpler charts on mobile
    useSimpleCharts: device.isLowEnd || device.connectionType === 'slow-2g'
  };
}

// ============================================================================
// 🚀 BUNDLE OPTIMIZATION
// ============================================================================

/**
 * Code splitting utilities
 */
export const codeSplitting = {
  // Split large components
  splitComponent: (importFn, componentName) => {
    return createLazyComponent(importFn, componentName);
  },
  
  // Split utility functions
  splitUtils: (importFn, utilsName) => {
    return importFn().catch(error => {
      console.warn(`Failed to load ${utilsName}:`, error);
      return {};
    });
  },
  
  // Split data processing
  splitDataProcessing: (importFn, processorName) => {
    return importFn().catch(error => {
      console.warn(`Failed to load ${processorName}:`, error);
      return { process: (data) => data }; // Fallback to no-op
    });
  }
};

// ============================================================================
// 🎯 EXPORT ALL OPTIMIZATIONS
// ============================================================================

export default {
  // Memoization
  memoizedCalculation,
  
  // Component optimization
  createLazyComponent,
  createPerformanceAwareComponent,
  createVirtualScrolling,
  
  // Data optimization
  optimizeDataset,
  createDebouncedProcessor,
  
  // Memory management
  monitorMemoryUsage,
  cleanupResources,
  
  // Mobile optimization
  getMobileOptimizations,
  
  // Code splitting
  codeSplitting
};

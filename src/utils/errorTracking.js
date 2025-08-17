// 🚨 Error Tracking & Monitoring System
// Proactively identify and report issues before users complain

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors
    this.reportingEndpoint = '/api/error-report'; // Your N8N webhook
    this.userId = null;
    this.sessionId = this.generateSessionId();
    
    // Set up global error handlers
    this.setupGlobalHandlers();
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setupGlobalHandlers() {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        severity: 'high'
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'medium'
      });
    });

    // Catch network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Log failed HTTP requests
        if (!response.ok) {
          this.logError({
            type: 'network_error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            severity: response.status >= 500 ? 'high' : 'medium'
          });
        }
        
        return response;
      } catch (error) {
        this.logError({
          type: 'network_failure',
          message: error.message,
          url: args[0],
          severity: 'high'
        });
        throw error;
      }
    };
  }

  logError(errorInfo) {
    const error = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      online: navigator.onLine,
      ...errorInfo
    };

    // Add to local error log
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console for development
    console.error('🚨 Error tracked:', error);

    // Report critical errors immediately
    if (error.severity === 'high') {
      this.reportError(error);
    }

    // Store errors locally for offline reporting
    this.saveErrorsLocally();
  }

  // Log user actions for context
  logUserAction(action, details = {}) {
    const actionLog = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      action,
      details,
      url: window.location.href
    };

    // Store recent actions for error context
    if (!this.userActions) {
      this.userActions = [];
    }
    
    this.userActions.unshift(actionLog);
    if (this.userActions.length > 20) {
      this.userActions = this.userActions.slice(0, 20);
    }

    console.log('👤 User action:', action, details);
  }

  // Report error to monitoring system
  async reportError(error) {
    try {
      // Add recent user actions for context
      const errorReport = {
        ...error,
        recentActions: this.userActions?.slice(0, 5) || [],
        errorCount: this.errors.length,
        appVersion: process.env.REACT_APP_VERSION || '1.0.0'
      };

      // Send to N8N webhook or monitoring service
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });

      console.log('📡 Error reported to monitoring system');
    } catch (reportingError) {
      console.error('❌ Failed to report error:', reportingError);
      // Store for later reporting when online
      this.storeFailedReport(error);
    }
  }

  // Save errors locally for offline reporting
  saveErrorsLocally() {
    try {
      localStorage.setItem('survive-backpacking-errors', JSON.stringify({
        errors: this.errors,
        userActions: this.userActions || []
      }));
    } catch (error) {
      console.error('❌ Failed to save errors locally:', error);
    }
  }

  // Load errors from local storage
  loadErrorsLocally() {
    try {
      const stored = localStorage.getItem('survive-backpacking-errors');
      if (stored) {
        const data = JSON.parse(stored);
        this.errors = data.errors || [];
        this.userActions = data.userActions || [];
      }
    } catch (error) {
      console.error('❌ Failed to load errors locally:', error);
    }
  }

  // Get error summary for support
  getErrorSummary() {
    const last24Hours = this.errors.filter(error => {
      const errorTime = new Date(error.timestamp);
      const now = new Date();
      return (now - errorTime) < 24 * 60 * 60 * 1000;
    });

    const errorTypes = {};
    last24Hours.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      last24Hours: last24Hours.length,
      errorTypes,
      criticalErrors: this.errors.filter(e => e.severity === 'high').length,
      sessionId: this.sessionId,
      userId: this.userId
    };
  }

  // Export errors for support ticket
  exportErrorsForSupport() {
    return {
      summary: this.getErrorSummary(),
      recentErrors: this.errors.slice(0, 10),
      recentActions: this.userActions?.slice(0, 10) || [],
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        online: navigator.onLine,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Clear errors (for privacy)
  clearErrors() {
    this.errors = [];
    this.userActions = [];
    localStorage.removeItem('survive-backpacking-errors');
    console.log('🗑️ Cleared all error logs');
  }

  // Monitor app performance
  monitorPerformance() {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      if (loadTime > 5000) { // Slow load (>5 seconds)
        this.logError({
          type: 'performance_issue',
          message: `Slow page load: ${Math.round(loadTime)}ms`,
          loadTime,
          severity: 'medium'
        });
      }
    });

    // Memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // >100MB
          this.logError({
            type: 'memory_warning',
            message: `High memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
            memoryUsage: memory,
            severity: 'low'
          });
        }
      }, 60000); // Check every minute
    }
  }

  // Store failed error reports for retry
  storeFailedReport(error) {
    const failedReports = JSON.parse(localStorage.getItem('failed-error-reports') || '[]');
    failedReports.push(error);
    localStorage.setItem('failed-error-reports', JSON.stringify(failedReports));
  }

  // Retry failed error reports when online
  async retryFailedReports() {
    try {
      const failedReports = JSON.parse(localStorage.getItem('failed-error-reports') || '[]');
      
      for (const error of failedReports) {
        await this.reportError(error);
      }
      
      // Clear failed reports after successful retry
      localStorage.removeItem('failed-error-reports');
      console.log(`📡 Retried ${failedReports.length} failed error reports`);
    } catch (error) {
      console.error('❌ Failed to retry error reports:', error);
    }
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Load any stored errors
errorTracker.loadErrorsLocally();

// Start performance monitoring
errorTracker.monitorPerformance();

// Retry failed reports when online
window.addEventListener('online', () => {
  errorTracker.retryFailedReports();
});

// Helper functions for easy use throughout the app
export const logError = (error) => errorTracker.logError(error);
export const logUserAction = (action, details) => errorTracker.logUserAction(action, details);
export const setUserId = (userId) => errorTracker.setUserId(userId);
export const getErrorSummary = () => errorTracker.getErrorSummary();
export const exportErrorsForSupport = () => errorTracker.exportErrorsForSupport();

export default errorTracker;
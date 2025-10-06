// 🛡️ Error Handling Utilities for The Freedom Compass

// Error types for better categorization
export const ERROR_TYPES = {
  FIREBASE_CONNECTION: 'firebase_connection',
  DATA_VALIDATION: 'data_validation', 
  CALCULATION_ERROR: 'calculation_error',
  COMPONENT_RENDER: 'component_render',
  USER_INPUT: 'user_input',
  NETWORK_ERROR: 'network_error'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',       // Non-critical, app continues normally
  MEDIUM: 'medium', // Feature degraded but app functional
  HIGH: 'high',     // Major feature broken
  CRITICAL: 'critical' // App-breaking error
};

// 📊 Error tracking for production insights
export const trackError = (error, context = {}) => {
  const errorData = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: context.userId || 'anonymous',
    component: context.component || 'unknown',
    type: context.type || ERROR_TYPES.COMPONENT_RENDER,
    severity: context.severity || ERROR_SEVERITY.MEDIUM,
    additionalData: context.additionalData || {}
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Tracked:', errorData);
  }

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example integrations:
    // Sentry.captureException(error, { extra: errorData });
    // LogRocket.captureException(error);
    // Custom analytics service
    console.error('Production Error:', errorData);
  }

  return errorData;
};

// 🔄 Safe function wrapper that catches errors
export const safeExecute = async (fn, fallback = null, context = {}) => {
  try {
    return await fn();
  } catch (error) {
    trackError(error, {
      ...context,
      type: ERROR_TYPES.CALCULATION_ERROR
    });
    
    return fallback;
  }
};

// 💾 Safe Firebase operation wrapper
export const safeFirebaseOperation = async (operation, fallbackData = null, context = {}) => {
  try {
    return await operation();
  } catch (error) {
    trackError(error, {
      ...context,
      type: ERROR_TYPES.FIREBASE_CONNECTION,
      severity: ERROR_SEVERITY.HIGH
    });
    
    // Return fallback data to keep app functional
    return fallbackData;
  }
};

// 🧮 Safe calculation wrapper for financial operations
export const safeCalculation = (calculation, fallback = 0, context = {}) => {
  try {
    const result = calculation();
    
    // Validate result is a number
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Invalid calculation result: ${result}`);
    }
    
    return result;
  } catch (error) {
    trackError(error, {
      ...context,
      type: ERROR_TYPES.CALCULATION_ERROR,
      severity: ERROR_SEVERITY.MEDIUM
    });
    
    return fallback;
  }
};

// 📝 Safe data parsing for user inputs
export const safeParseNumber = (value, fallback = 0, context = {}) => {
  try {
    if (value === '' || value === null || value === undefined) {
      return fallback;
    }
    
    const parsed = parseFloat(value);
    
    if (!isFinite(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }
    
    return parsed;
  } catch (error) {
    trackError(error, {
      ...context,
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      additionalData: { inputValue: value }
    });
    
    return fallback;
  }
};

// 🎯 User-friendly error messages
export const getErrorMessage = (error, context = {}) => {
  const errorType = context.type || ERROR_TYPES.COMPONENT_RENDER;
  
  const messages = {
    [ERROR_TYPES.FIREBASE_CONNECTION]: 'Connection issue. Your data is safe, please try again.',
    [ERROR_TYPES.DATA_VALIDATION]: 'Invalid input detected. Please check your entries.',
    [ERROR_TYPES.CALCULATION_ERROR]: 'Calculation error. Using safe fallback values.',
    [ERROR_TYPES.COMPONENT_RENDER]: 'Display error. The component will recover automatically.',
    [ERROR_TYPES.USER_INPUT]: 'Input error. Please check your entries and try again.',
    [ERROR_TYPES.NETWORK_ERROR]: 'Network issue. Please check your connection.'
  };
  
  return messages[errorType] || 'An unexpected error occurred. Your data is safe.';
};

// 🚨 Critical error handler for app-breaking issues
export const handleCriticalError = (error, context = {}) => {
  trackError(error, {
    ...context,
    severity: ERROR_SEVERITY.CRITICAL
  });
  
  // In production, might want to redirect to error page or show global error modal
  console.error('CRITICAL ERROR - App may be unstable:', error);
};

export default {
  trackError,
  safeExecute,
  safeFirebaseOperation,
  safeCalculation,
  safeParseNumber,
  getErrorMessage,
  handleCriticalError,
  ERROR_TYPES,
  ERROR_SEVERITY
};
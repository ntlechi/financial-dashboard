/**
 * 🔧 PRODUCTION-SAFE LOGGING UTILITY
 * 
 * Wraps console methods to only log in development.
 * In production, these are no-ops for better performance and security.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors (even in production for debugging)
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// For backward compatibility with existing code
export const devLog = logger.log;
export const devWarn = logger.warn;
export const devError = logger.error;

export default logger;

// 🔐 Security Configuration and Utilities
// This file contains security-related configurations and helper functions

// Security Headers for Production
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com https://api.stripe.com;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate Limiting Configuration
export const rateLimits = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // limit each IP to 100 requests per windowMs
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes  
    maxRequests: 5 // limit each IP to 5 auth requests per windowMs
  }
};

// Input Sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate numeric input
export const isValidNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Security Monitoring
export const logSecurityEvent = (event, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.warn('🔐 Security Event:', logEntry);
    // TODO: Send to monitoring service
  } else {
    console.log('🔐 Security Event (Dev):', logEntry);
  }
};

// Check if environment is secure
export const isSecureEnvironment = () => {
  return (
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

// API Key Masking for Logs
export const maskApiKey = (key) => {
  if (!key || key.length < 8) return '***';
  return key.substring(0, 4) + '***' + key.substring(key.length - 4);
};

// Security Configuration
export const securityConfig = {
  // Maximum file upload size (in bytes)
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  // Allowed file types
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv'],
  
  // Session timeout (in milliseconds)
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // API timeout settings
  apiTimeout: 10000, // 10 seconds
  
  // Rate limiting
  rateLimits
};

export default securityConfig;
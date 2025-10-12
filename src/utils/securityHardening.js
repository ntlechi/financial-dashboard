// 🛡️ SECURITY HARDENING UTILITIES
// Comprehensive security measures for the financial app

import { trackError, ERROR_TYPES, ERROR_SEVERITY } from './errorHandling';

// ============================================================================
// 🔒 INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize financial data input
 * @param {any} value - Financial value to sanitize
 * @returns {number} - Sanitized number
 */
export function sanitizeFinancialInput(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // Convert to string first to handle various input types
  const stringValue = String(value);
  
  // Remove any non-numeric characters except decimal point and minus sign
  const cleaned = stringValue.replace(/[^0-9.-]/g, '');
  
  // Parse the cleaned value
  const parsed = parseFloat(cleaned);
  
  // Validate the result
  if (isNaN(parsed) || !isFinite(parsed)) {
    trackError(new Error(`Invalid financial input: ${value}`), {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      component: 'securityHardening',
      additionalData: { originalValue: value, cleanedValue: cleaned }
    });
    return 0;
  }
  
  // Limit to reasonable financial values (max $1 billion)
  return Math.max(-1000000000, Math.min(1000000000, parsed));
}

/**
 * Validate and sanitize email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} - Validated email or null
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    trackError(new Error(`Invalid email format: ${email}`), {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      component: 'securityHardening',
      additionalData: { email }
    });
    return null;
  }
  
  return sanitized;
}

// ============================================================================
// 🔐 DATA ENCRYPTION & PROTECTION
// ============================================================================

/**
 * Simple obfuscation for sensitive data (not for production encryption)
 * @param {string} data - Data to obfuscate
 * @returns {string} - Obfuscated data
 */
export function obfuscateSensitiveData(data) {
  if (typeof data !== 'string') {
    return '';
  }
  
  // Simple base64 encoding (not secure, just for basic obfuscation)
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    trackError(error, {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      component: 'securityHardening'
    });
    return '';
  }
}

/**
 * Deobfuscate sensitive data
 * @param {string} obfuscatedData - Obfuscated data
 * @returns {string} - Original data
 */
export function deobfuscateSensitiveData(obfuscatedData) {
  if (typeof obfuscatedData !== 'string') {
    return '';
  }
  
  try {
    return decodeURIComponent(atob(obfuscatedData));
  } catch (error) {
    trackError(error, {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      component: 'securityHardening'
    });
    return '';
  }
}

// ============================================================================
// 🚨 SECURITY VALIDATION
// ============================================================================

/**
 * Validate user permissions for sensitive operations
 * @param {string} userId - User ID
 * @param {string} operation - Operation being performed
 * @param {Object} userData - User data object
 * @returns {boolean} - Whether user is authorized
 */
export function validateUserPermissions(userId, operation, userData) {
  // Basic validation
  if (!userId || typeof userId !== 'string') {
    trackError(new Error('Invalid user ID for permission validation'), {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.HIGH,
      component: 'securityHardening',
      additionalData: { userId, operation }
    });
    return false;
  }
  
  // Check if user data exists
  if (!userData || typeof userData !== 'object') {
    trackError(new Error('Missing user data for permission validation'), {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.HIGH,
      component: 'securityHardening',
      additionalData: { userId, operation }
    });
    return false;
  }
  
  // Define sensitive operations
  const sensitiveOperations = [
    'delete_account',
    'reset_data',
    'export_data',
    'change_subscription',
    'modify_payment_method'
  ];
  
  if (sensitiveOperations.includes(operation)) {
    // For sensitive operations, require additional validation
    // In a real app, this would check against a secure backend
    return userData.isAuthenticated === true;
  }
  
  return true;
}

/**
 * Rate limiting for API calls
 */
const rateLimitMap = new Map();

/**
 * Check if user has exceeded rate limits
 * @param {string} userId - User ID
 * @param {string} operation - Operation type
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
export function checkRateLimit(userId, operation, maxRequests = 10, timeWindow = 60000) {
  const key = `${userId}_${operation}`;
  const now = Date.now();
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const requests = rateLimitMap.get(key);
  
  // Remove old requests outside the time window
  const validRequests = requests.filter(timestamp => now - timestamp < timeWindow);
  
  if (validRequests.length >= maxRequests) {
    trackError(new Error(`Rate limit exceeded for user ${userId}`), {
      type: ERROR_TYPES.DATA_VALIDATION,
      severity: ERROR_SEVERITY.MEDIUM,
      component: 'securityHardening',
      additionalData: { userId, operation, requestCount: validRequests.length }
    });
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  
  return true;
}

// ============================================================================
// 🔍 DATA VALIDATION
// ============================================================================

/**
 * Validate financial transaction data
 * @param {Object} transaction - Transaction data
 * @returns {Object} - Validation result
 */
export function validateTransaction(transaction) {
  const errors = [];
  
  if (!transaction || typeof transaction !== 'object') {
    errors.push('Transaction data is required');
    return { isValid: false, errors };
  }
  
  // Validate amount
  const amount = sanitizeFinancialInput(transaction.amount);
  if (amount === 0 && transaction.amount !== 0) {
    errors.push('Invalid transaction amount');
  }
  
  // Validate description
  if (!transaction.description || typeof transaction.description !== 'string') {
    errors.push('Transaction description is required');
  } else if (transaction.description.length > 200) {
    errors.push('Transaction description is too long');
  }
  
  // Validate date
  if (!transaction.date) {
    errors.push('Transaction date is required');
  } else {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid transaction date');
    }
  }
  
  // Validate category
  const validCategories = [
    'income', 'expense', 'transfer', 'investment', 'savings'
  ];
  if (!transaction.category || !validCategories.includes(transaction.category)) {
    errors.push('Invalid transaction category');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      ...transaction,
      amount,
      description: sanitizeInput(transaction.description || ''),
      category: transaction.category
    }
  };
}

/**
 * Validate user profile data
 * @param {Object} profile - User profile data
 * @returns {Object} - Validation result
 */
export function validateUserProfile(profile) {
  const errors = [];
  
  if (!profile || typeof profile !== 'object') {
    errors.push('Profile data is required');
    return { isValid: false, errors };
  }
  
  // Validate email
  if (profile.email) {
    const validatedEmail = validateEmail(profile.email);
    if (!validatedEmail) {
      errors.push('Invalid email address');
    }
  }
  
  // Validate name
  if (profile.name) {
    const sanitizedName = sanitizeInput(profile.name);
    if (sanitizedName.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (sanitizedName.length > 50) {
      errors.push('Name is too long');
    }
  }
  
  // Validate age
  if (profile.age !== undefined) {
    const age = parseInt(profile.age);
    if (isNaN(age) || age < 13 || age > 120) {
      errors.push('Invalid age');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      ...profile,
      email: profile.email ? validateEmail(profile.email) : null,
      name: profile.name ? sanitizeInput(profile.name) : null,
      age: profile.age ? parseInt(profile.age) : null
    }
  };
}

// ============================================================================
// 🛡️ SECURITY HEADERS & CSP
// ============================================================================

/**
 * Generate Content Security Policy headers
 * @returns {string} - CSP header value
 */
export function generateCSPHeader() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.firebaseio.com https://*.googleapis.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return csp.join('; ');
}

/**
 * Security headers for API responses
 * @returns {Object} - Security headers
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': generateCSPHeader()
  };
}

// ============================================================================
// 🔐 SESSION SECURITY
// ============================================================================

/**
 * Generate secure session token
 * @returns {string} - Session token
 */
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate session token
 * @param {string} token - Session token to validate
 * @returns {boolean} - Whether token is valid
 */
export function validateSessionToken(token) {
  if (typeof token !== 'string') {
    return false;
  }
  
  // Basic format validation (64 hex characters)
  const tokenRegex = /^[a-f0-9]{64}$/;
  return tokenRegex.test(token);
}

// ============================================================================
// 🚨 SECURITY MONITORING
// ============================================================================

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} details - Event details
 */
export function logSecurityEvent(event, details = {}) {
  const securityEvent = {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    details
  };
  
  // In production, this would be sent to a security monitoring service
  console.warn('Security Event:', securityEvent);
  
  trackError(new Error(`Security Event: ${event}`), {
    type: ERROR_TYPES.DATA_VALIDATION,
    severity: ERROR_SEVERITY.MEDIUM,
    component: 'securityHardening',
    additionalData: securityEvent
  });
}

// ============================================================================
// 🎯 EXPORT ALL SECURITY UTILITIES
// ============================================================================

export default {
  // Input sanitization
  sanitizeInput,
  sanitizeFinancialInput,
  validateEmail,
  
  // Data protection
  obfuscateSensitiveData,
  deobfuscateSensitiveData,
  
  // Security validation
  validateUserPermissions,
  checkRateLimit,
  
  // Data validation
  validateTransaction,
  validateUserProfile,
  
  // Security headers
  generateCSPHeader,
  getSecurityHeaders,
  
  // Session security
  generateSessionToken,
  validateSessionToken,
  
  // Security monitoring
  logSecurityEvent
};

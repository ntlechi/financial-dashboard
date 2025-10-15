/**
 * Firebase Cloud Functions - Main Index
 * The Freedom Compass
 */

const { exportUserData } = require('./exportUserData');

// Export all functions
exports.exportUserData = exportUserData;

// 🔐 Environment Variable Validation
// This file ensures all required environment variables are present

const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN', 
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const optionalEnvVars = [
  'REACT_APP_STRIPE_PUBLISHABLE_KEY',
  'REACT_APP_VERSION',
  'REACT_APP_ENVIRONMENT'
];

// Validate required environment variables
const validateEnvironment = () => {
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName] === 'your_firebase_api_key_here') {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('🔐 SECURITY ERROR: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   ❌ ${varName}`);
    });
    console.error('\n📝 Please check your .env file and add the missing variables.');
    console.error('🔥 Your app may not work correctly without these values!\n');
    
    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Running in development mode with missing environment variables');
    }
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  return missingVars.length === 0;
};

// Export environment configuration
export const env = {
  // Firebase
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  },
  
  // Stripe
  stripe: {
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  },
  
  // App Config
  app: {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
  },
  
  // Validation
  isValid: validateEnvironment()
};

// Auto-validate on import
validateEnvironment();

export default env;
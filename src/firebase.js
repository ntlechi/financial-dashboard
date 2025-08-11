import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Add this line to debug:
console.log("Firebase API Key from env:", process.env.REACT_APP_FIREBASE_API_KEY);

// Option 1: Environment-based config (preferred for production)
const firebaseConfigFromEnv = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Option 2: Hardcoded config for testing (replace with your actual Firebase config)
const firebaseConfigHardcoded = {
  apiKey: "AIzaSyDummy-Key-Replace-With-Your-Real-Key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Validate environment config
const isValidConfig = (config) => {
  return config.apiKey && 
         config.authDomain && 
         config.projectId && 
         config.storageBucket && 
         config.messagingSenderId && 
         config.appId &&
         !config.apiKey.includes('your_') && // Check for placeholder values
         !config.authDomain.includes('your_project_id');
};

// Use environment config if valid, otherwise fall back to hardcoded
let firebaseConfig;
if (isValidConfig(firebaseConfigFromEnv)) {
  firebaseConfig = firebaseConfigFromEnv;
  console.log("✅ Using environment Firebase config");
} else {
  firebaseConfig = firebaseConfigHardcoded;
  console.log("⚠️ Using hardcoded Firebase config - update your environment variables!");
}

// Add these lines to debug each variable:
console.log("Final Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'MISSING'
});

// Initialize Firebase with error handling
let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  // Create dummy objects to prevent app crashes
  db = null;
  auth = null;
}

// Export Firebase services
export { db, auth };
export default app;
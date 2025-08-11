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
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Use environment config if available, otherwise fall back to hardcoded
const firebaseConfig = process.env.REACT_APP_FIREBASE_API_KEY ? firebaseConfigFromEnv : firebaseConfigHardcoded;

// Add these lines to debug each variable:
console.log("apiKey:", firebaseConfig.apiKey);
console.log("authDomain:", firebaseConfig.authDomain);
console.log("projectId:", firebaseConfig.projectId);
console.log("storageBucket:", firebaseConfig.storageBucket);
console.log("messagingSenderId:", firebaseConfig.messagingSenderId);
console.log("appId:", firebaseConfig.appId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
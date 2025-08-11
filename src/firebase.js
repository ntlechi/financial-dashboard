import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Add this line to debug:
console.log("Firebase API Key from env:", process.env.REACT_APP_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Add these lines to debug each variable:
console.log("apiKey:", process.env.REACT_APP_FIREBASE_API_KEY);
console.log("authDomain:", process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log("projectId:", process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log("storageBucket:", process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log("messagingSenderId:", process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
console.log("appId:", process.env.REACT_APP_FIREBASE_APP_ID);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
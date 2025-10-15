import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { env } from './config/environment';

// 🔐 Secure Firebase config from validated environment variables
const firebaseConfig = env.firebase;

// Initialize Firebase
let app, db, auth, storage, functions;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  db = null;
  auth = null;
  storage = null;
  functions = null;
}

export { db, auth, storage, functions };
export default app;
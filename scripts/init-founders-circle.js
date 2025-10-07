// One-time script to initialize Founder's Circle counter in Firebase
// Run this once: node scripts/init-founders-circle.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFoundersCircle() {
  try {
    console.log('🚀 Initializing Founder\'s Circle counter...');
    
    const countRef = db.collection('app-config').doc('founders-circle');
    
    await countRef.set({
      subscriberCount: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ SUCCESS! Founder\'s Circle counter initialized!');
    console.log('   Collection: app-config');
    console.log('   Document: founders-circle');
    console.log('   subscriberCount: 0');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeFoundersCircle();

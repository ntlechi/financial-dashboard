// 🔥 Firebase Setup Script for Subscriber Tracking
// Run this script once to set up your Firestore database

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Replace with your service account key file path
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your project ID
  projectId: 'your-project-id'
});

const db = admin.firestore();

async function setupFirebaseCollections() {
  try {
    console.log('🚀 Setting up Firebase collections...');

    // Create Founder's Circle document
    await db.collection('app-config').doc('founders-circle').set({
      subscriberCount: 0,
      lastUpdated: new Date().toISOString(),
      maxSpots: 100,
      phase: 'founders',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Created founders-circle document');

    // Create Early Adopter document
    await db.collection('app-config').doc('early-adopter').set({
      subscriberCount: 0,
      lastUpdated: new Date().toISOString(),
      maxSpots: 500,
      phase: 'early-adopter',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Created early-adopter document');

    // Create a test document to verify setup
    await db.collection('app-config').doc('test').set({
      message: 'Firebase setup complete!',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Created test document');

    console.log('🎉 Firebase setup complete!');
    console.log('📊 You can now update subscriber counts in the Firebase Console');
    console.log('🔗 Go to: https://console.firebase.google.com/');

  } catch (error) {
    console.error('❌ Error setting up Firebase:', error);
  }
}

// Run the setup
setupFirebaseCollections();



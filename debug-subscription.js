// Quick script to debug subscription status
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function checkSubscription() {
  try {
    console.log('🔍 Checking subscription status...');
    
    // Get all users (you'll need to replace with your actual user ID)
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`Found ${usersSnapshot.size} users in database`);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`\n👤 User ID: ${doc.id}`);
      console.log(`📧 Email: ${userData.email || 'No email'}`);
      console.log(`💳 Subscription:`, userData.subscription || 'No subscription data');
      
      if (userData.subscription) {
        console.log(`   - Tier: ${userData.subscription.tier}`);
        console.log(`   - Status: ${userData.subscription.status}`);
        console.log(`   - Stripe Customer ID: ${userData.subscription.stripeCustomerId}`);
        console.log(`   - Stripe Subscription ID: ${userData.subscription.stripeSubscriptionId}`);
        console.log(`   - Last Updated: ${userData.subscription.lastUpdated}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking subscription:', error);
  }
}

checkSubscription();

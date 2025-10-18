// Manual subscription fix script
// Run this if webhook succeeded but subscription wasn't updated

const admin = require('firebase-admin');

// You'll need to set your Firebase project ID
const projectId = 'freedom-compass-prod';

// Initialize Firebase Admin with project ID
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
    // You'll need to add your service account key here
    // credential: admin.credential.cert(require('./path/to/serviceAccountKey.json')),
  });
}

const db = admin.firestore();

async function fixSubscription(userId, subscriptionData) {
  try {
    console.log(`🔧 Fixing subscription for user: ${userId}`);
    
    const userRef = db.collection('users').doc(userId);
    
    // Update the user's subscription
    await userRef.update({
      subscription: subscriptionData
    });
    
    console.log('✅ Subscription updated successfully!');
    console.log('Updated data:', subscriptionData);
    
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
  }
}

// Example usage - replace with your actual user ID and subscription data
const userId = 'YOUR_USER_ID_HERE'; // Replace with your actual Firebase user ID
const subscriptionData = {
  tier: 'founders-circle',
  status: 'active',
  planName: 'Founder\'s Circle',
  billingCycle: 'monthly',
  startDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  stripeCustomerId: 'YOUR_STRIPE_CUSTOMER_ID', // Get from Stripe dashboard
  stripeSubscriptionId: 'YOUR_STRIPE_SUBSCRIPTION_ID' // Get from Stripe dashboard
};

// Uncomment the line below to run the fix
// fixSubscription(userId, subscriptionData);

console.log('📋 To use this script:');
console.log('1. Get your Firebase User ID from the app');
console.log('2. Get your Stripe Customer ID and Subscription ID from Stripe dashboard');
console.log('3. Update the variables above');
console.log('4. Uncomment the fixSubscription call');
console.log('5. Run: node fix-subscription.js');

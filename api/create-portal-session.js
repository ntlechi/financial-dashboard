// Vercel Serverless Function: Create Stripe Customer Portal Session
// API Route: /api/create-portal-session
// Allows customers to manage their subscriptions, payment methods, and invoices

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get user's Stripe customer ID from Firebase
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const stripeCustomerId = userData?.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(404).json({ 
        error: 'No active subscription found' 
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.survivebackpacking.com'}`,
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Portal session error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create portal session',
    });
  }
};

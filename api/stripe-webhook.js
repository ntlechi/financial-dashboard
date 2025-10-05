// Vercel Serverless Function: Stripe Webhook Handler
// API Route: /api/stripe-webhook
// This handles all Stripe events (payment success, subscription changes, etc.)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Disable automatic body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

// Map Stripe Price IDs to plan tiers
const PRICE_TO_PLAN_MAP = {
  [process.env.STRIPE_CLIMBER_MONTHLY]: 'climber',
  [process.env.STRIPE_CLIMBER_ANNUAL]: 'climber',
  [process.env.STRIPE_OPERATOR_MONTHLY]: 'operator',
  [process.env.STRIPE_OPERATOR_ANNUAL]: 'operator',
  [process.env.STRIPE_FOUNDERS_CIRCLE_MONTHLY]: 'founders-circle',
};

// Helper to get raw body as buffer
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Get raw body for signature verification
    const rawBody = await buffer(req);
    
    // Verify webhook signature with raw body
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handling error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// EVENT HANDLERS
// ============================================

async function handleCheckoutComplete(session) {
  console.log('🎉 Checkout completed:', session.id);

  const userId = session.metadata?.userId || session.client_reference_id;
  const planName = session.metadata?.planName;
  const billingCycle = session.metadata?.billingCycle;

  if (!userId) {
    console.error('❌ No userId found in session metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const priceId = subscription.items.data[0].price.id;
  const planTier = PRICE_TO_PLAN_MAP[priceId] || 'recon';

  // Update user subscription in Firebase
  await updateUserSubscription(userId, {
    plan: planTier,
    planName: planName,
    billingCycle: billingCycle,
    status: 'active',
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    stripePriceId: priceId,
    currentPeriodStartSeconds: subscription.current_period_start,
    currentPeriodEndSeconds: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ User ${userId} upgraded to ${planTier}`);
}

async function handleSubscriptionCreated(subscription) {
  console.log('📝 Subscription created:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0].price.id;
  const planTier = PRICE_TO_PLAN_MAP[priceId] || 'recon';

  await updateUserSubscription(userId, {
    plan: planTier,
    status: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStartSeconds: subscription.current_period_start,
    currentPeriodEndSeconds: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0].price.id;
  const planTier = PRICE_TO_PLAN_MAP[priceId] || 'recon';

  await updateUserSubscription(userId, {
    plan: planTier,
    status: subscription.status,
    stripePriceId: priceId,
    currentPeriodStartSeconds: subscription.current_period_start,
    currentPeriodEndSeconds: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await updateUserSubscription(userId, {
    plan: 'recon', // Downgrade to free tier
    status: 'canceled',
    canceledAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  
  if (!userId) return;

  // Update payment history
  await db.collection('users').doc(userId).collection('payments').add({
    invoiceId: invoice.id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency,
    status: 'succeeded',
    paidAtSeconds: invoice.status_transitions.paid_at,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentFailed(invoice) {
  console.log('⚠️  Payment failed:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  
  if (!userId) return;

  // Update payment history with failure
  await db.collection('users').doc(userId).collection('payments').add({
    invoiceId: invoice.id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    failureReason: invoice.last_payment_error?.message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Optionally notify user of payment failure
  console.log(`⚠️  Payment failed for user ${userId}`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateUserSubscription(userId, data) {
  try {
    await db.collection('users').doc(userId).set(
      { subscription: data },
      { merge: true }
    );
    console.log(`✅ Updated subscription for user ${userId}:`, data);
  } catch (error) {
    console.error(`❌ Failed to update subscription for user ${userId}:`, error);
    throw error;
  }
}
// Webhook updated at Sun Oct  5 08:03:25 PM UTC 2025

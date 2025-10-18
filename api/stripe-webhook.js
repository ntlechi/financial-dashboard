// Vercel API Route for Stripe Webhooks
// This file handles all Stripe events and updates Firebase automatically

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Or use service account key
    // credential: admin.credential.cert(require('./path/to/serviceAccountKey.json')),
  });
}

const db = admin.firestore();

// Helper function to send emails
async function sendEmail(userId, trigger, additionalData = {}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.survivebackpacking.com'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        trigger,
        additionalData
      })
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - email failures shouldn't break the webhook
  }
}

// Subscription tier mapping
const SUBSCRIPTION_TIERS = {
  FREE: 'recon',
  CLIMBER: 'climber', 
  OPERATOR: 'operator',
  FOUNDERS_CIRCLE: 'founders-circle'
};

// Helper function to get product name from tier
function getProductNameFromTier(tier) {
  switch (tier) {
    case SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE:
      return 'Founder\'s Circle - The Founder';
    case SUBSCRIPTION_TIERS.CLIMBER:
      return 'Climber Plan - The Climber';
    case SUBSCRIPTION_TIERS.OPERATOR:
      return 'Operator Plan - The Operator';
    default:
      return 'Free Plan - Recon Kit';
  }
}

// Plan ID to tier mapping - Updated with correct live price IDs
const PLAN_MAPPING = {
  // Founder's Circle
  'price_1SEtrg82nQ0x7qb2NBJr0IVU': SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE,
  
  // Early Adopter
  'price_1SH2rg82nQ0x7qb2wte7rkSV': SUBSCRIPTION_TIERS.CLIMBER, // Using Climber tier for Early Adopter
  
  // Climber Plan
  'price_1SEtk682nQ0x7qb2d80smPaj': SUBSCRIPTION_TIERS.CLIMBER, // Monthly
  'price_1SEtk682nQ0x7qb2C1q8yAni': SUBSCRIPTION_TIERS.CLIMBER, // Yearly
  
  // Operator Plan
  'price_1SEtq282nQ0x7qb2iDCgzcpj': SUBSCRIPTION_TIERS.OPERATOR, // Monthly
  'price_1SEtq282nQ0x7qb2IEqw3DZ4': SUBSCRIPTION_TIERS.OPERATOR, // Yearly
};

// Helper function to add FREE users to ConvertKit
async function addFreeUserToConvertKit(userId, userEmail, userName) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.survivebackpacking.com'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        trigger: 'free_user_signup',
        additionalData: {
          subscriptionTier: 'recon'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding free user to ConvertKit:', error);
  }
}

// Import the raw body parser for Vercel
const { buffer } = require('micro');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Get the raw body buffer
    const rawBody = await buffer(req);
    
    console.log('Webhook received:', {
      bodyLength: rawBody.length,
      hasSignature: !!sig,
      hasSecret: !!endpointSecret
    });
    
    // Verify webhook signature with raw body
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('Error details:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle successful payment intent (for Payment Links)
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('💳 Payment Intent succeeded:', paymentIntent.id);
  
  // Get the subscription from the payment intent
  const subscriptionId = paymentIntent.metadata?.subscription_id;
  
  if (!subscriptionId) {
    console.error('No subscription ID found in payment intent metadata');
    return;
  }
  
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }
  
  // Map Stripe price ID to subscription tier
  const priceId = subscription.items.data[0]?.price.id;
  const subscriptionTier = PLAN_MAPPING[priceId];
  
  if (!subscriptionTier) {
    console.error('Unknown price ID:', priceId);
    return;
  }
  
  // Update user's subscription in Firebase
  await updateUserSubscription(userId, {
    tier: subscriptionTier,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    status: 'active',
    planName: subscription.metadata?.planName || 'Founder\'s Circle',
    billingCycle: subscription.metadata?.billingCycle || 'monthly',
    startDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ User ${userId} upgraded to ${subscriptionTier} via Payment Intent`);
  
  // Get the product name for ConvertKit
  const productName = getProductNameFromTier(subscriptionTier);
  
  // Send welcome email with proper product information
  await sendEmail(userId, 'subscription_created', {
    subscriptionTier,
    planName: subscription.metadata?.planName || productName,
    productName: productName,
    priceId: priceId
  });
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const planName = session.metadata?.planName;
  const billingCycle = session.metadata?.billingCycle;
  
  if (!userId) {
    console.error('Missing userId in checkout session');
    return;
  }

  // Get subscription details to determine tier
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const priceId = subscription.items.data[0]?.price.id;
  const subscriptionTier = PLAN_MAPPING[priceId];
  
  if (!subscriptionTier) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Update user's subscription in Firebase
  await updateUserSubscription(userId, {
    tier: subscriptionTier,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    status: 'active',
    planName: planName,
    billingCycle: billingCycle,
    startDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ User ${userId} upgraded to ${subscriptionTier}`);
  
  // Get the product name for ConvertKit
  const productName = getProductNameFromTier(subscriptionTier);
  
  // Send welcome email with proper product information
  await sendEmail(userId, 'subscription_created', {
    subscriptionTier,
    planName: planName || productName,
    productName: productName,
    priceId: priceId
  });
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Update subscription details
  await updateUserSubscription(userId, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ Subscription created for user ${userId}`);
}

// Handle subscription updates (plan changes, etc.)
async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Map Stripe price ID to subscription tier
  const priceId = subscription.items.data[0]?.price.id;
  const subscriptionTier = PLAN_MAPPING[priceId];

  await updateUserSubscription(userId, {
    tier: subscriptionTier,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ Subscription updated for user ${userId} to ${subscriptionTier}`);
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Downgrade user to FREE tier
  await updateUserSubscription(userId, {
    tier: SUBSCRIPTION_TIERS.FREE,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ User ${userId} subscription cancelled, downgraded to FREE`);
  
  // Send cancellation email
  await sendEmail(userId, 'subscription_cancelled');
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  // Get subscription details from Stripe to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Update last payment date
  await updateUserSubscription(userId, {
    lastPaymentDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ Payment succeeded for user ${userId}`);
  
  // Send payment success email
  await sendEmail(userId, 'payment_succeeded');
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  // Get subscription details from Stripe to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Update payment failure status
  await updateUserSubscription(userId, {
    paymentFailed: true,
    lastPaymentFailure: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`❌ Payment failed for user ${userId}`);
  
  // Send payment failure email
  await sendEmail(userId, 'payment_failed');
}

// Helper function to update user subscription in Firebase
async function updateUserSubscription(userId, subscriptionData) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        subscription: subscriptionData
      });
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        subscription: subscriptionData,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}
// Stripe Webhook Handler for Automated Subscription Management
// This file handles all Stripe events and updates Firebase automatically

import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SUBSCRIPTION_TIERS } from '../utils/subscriptionUtils';
import { sendEmail, EMAIL_TRIGGERS } from '../utils/emailAutomation';

// Stripe webhook endpoint handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
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

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  
  if (!userId || !planId) {
    console.error('Missing userId or planId in checkout session');
    return;
  }

  // 🔧 REAL STRIPE PRICE IDS - Updated with actual production IDs!
  const planMapping = {
    // Founder's Circle (Phase 1: Oct 19-26, 2025)
    'price_1SEtrg82nQ0x7qb2NBJr0IVU': SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, // $7.49/month ✅
    
    // Early Adopter (Phase 2: Oct 27 - Jan 1, 2026)
    'price_1SH2rg82nQ0x7qb2wte7rkSV': SUBSCRIPTION_TIERS.EARLY_ADOPTER, // $8.49/month ✅
    
    // Regular Pricing (Phase 3: Jan 2, 2026+)
    'price_1fZu9ANe1ge3F07Q6aX7bW05': SUBSCRIPTION_TIERS.CLIMBER, // Climber Monthly
    'price_19B628l8GWaRtbQyard7bW06': SUBSCRIPTION_TIERS.CLIMBER, // Climber Yearly
    'price_1aFa6oB1eu6Bd2fY6aX7bW03': SUBSCRIPTION_TIERS.OPERATOR, // Operator Monthly
    'price_14gM8wJ6yOcZBcUC0QD7bW04': SUBSCRIPTION_TIERS.OPERATOR, // Operator Yearly
  };

  const subscriptionTier = planMapping[planId];
  
  if (!subscriptionTier) {
    console.error('Unknown plan ID:', planId);
    return;
  }

  // Update user's subscription in Firebase
  await updateUserSubscription(userId, {
    tier: subscriptionTier,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    status: 'active',
    planId: planId,
    billingCycle: planId.includes('annual') ? 'annual' : 'monthly',
    startDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  console.log(`✅ User ${userId} upgraded to ${subscriptionTier}`);
  
  // Send welcome email
  await sendEmail(userId, EMAIL_TRIGGERS.SUBSCRIPTION_CREATED, {
    subscriptionTier,
    planId
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

  // 🔧 REAL STRIPE PRICE IDS - Updated with actual production IDs!
  const planMapping = {
    // Founder's Circle (Phase 1: Oct 19-26, 2025)
    'price_1SEtrg82nQ0x7qb2NBJr0IVU': SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, // $7.49/month ✅
    
    // Early Adopter (Phase 2: Oct 27 - Jan 1, 2026)
    'price_1SH2rg82nQ0x7qb2wte7rkSV': SUBSCRIPTION_TIERS.EARLY_ADOPTER, // $8.49/month ✅
    
    // Regular Pricing (Phase 3: Jan 2, 2026+)
    'price_1fZu9ANe1ge3F07Q6aX7bW05': SUBSCRIPTION_TIERS.CLIMBER, // Climber Monthly
    'price_19B628l8GWaRtbQyard7bW06': SUBSCRIPTION_TIERS.CLIMBER, // Climber Yearly
    'price_1aFa6oB1eu6Bd2fY6aX7bW03': SUBSCRIPTION_TIERS.OPERATOR, // Operator Monthly
    'price_14gM8wJ6yOcZBcUC0QD7bW04': SUBSCRIPTION_TIERS.OPERATOR, // Operator Yearly
  };

  const priceId = subscription.items.data[0]?.price.id;
  const subscriptionTier = planMapping[priceId];

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
  await sendEmail(userId, EMAIL_TRIGGERS.SUBSCRIPTION_CANCELLED);
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
  await sendEmail(userId, EMAIL_TRIGGERS.PAYMENT_SUCCEEDED);
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
  await sendEmail(userId, EMAIL_TRIGGERS.PAYMENT_FAILED);
}

// Helper function to update user subscription in Firebase
async function updateUserSubscription(userId, subscriptionData) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        subscription: subscriptionData
      });
    } else {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        subscription: subscriptionData,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export default handleStripeWebhook;

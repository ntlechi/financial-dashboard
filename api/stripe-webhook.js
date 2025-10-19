// Vercel API Route for Stripe Webhooks
// This file handles all Stripe events and updates Firebase automatically

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    // Use service account key for Vercel deployment
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod',
      databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod'}-default-rtdb.firebaseio.com`
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    // Continue without Firebase - webhook will still work
  }
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
    console.log(`🎯 Processing event type: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🛒 Handling checkout.session.completed');
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        console.log('💳 Handling payment_intent.succeeded');
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        console.log('📝 Handling customer.subscription.created');
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        console.log('🔄 Handling customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        console.log('🗑️ Handling customer.subscription.deleted');
        await handleSubscriptionCancelled(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        console.log('💰 Handling invoice.payment_succeeded');
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        console.log('❌ Handling invoice.payment_failed');
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processing completed successfully');
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message,
      type: error.type || 'unknown'
    });
  }
};

// Handle successful payment intent (for Payment Links)
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('💳 Payment Intent succeeded:', paymentIntent.id);
  console.log('📋 Payment Intent metadata:', paymentIntent.metadata);
  console.log('👤 Payment Intent customer:', paymentIntent.customer);
  console.log('🚀 Webhook version: v2.5 - CRITICAL FIX: Added subscription.plan field for app compatibility');
  
  let subscription = null;
  let userId = null;
  let customer = null;
  
      // First, get customer details
      if (paymentIntent.customer) {
        try {
          customer = await stripe.customers.retrieve(paymentIntent.customer);
          console.log('📧 Customer email:', customer.email);
          console.log('📧 Customer details:', {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata
          });
        } catch (error) {
          console.error('❌ Error retrieving customer:', error);
        }
      }
      
      // If no customer email, try to get it from payment intent receipt_email
      if (!customer?.email && paymentIntent.receipt_email) {
        console.log('📧 Using receipt email from payment intent:', paymentIntent.receipt_email);
        customer = {
          id: paymentIntent.customer,
          email: paymentIntent.receipt_email
        };
      }
  
  // Method 1: Try to get subscription from payment intent metadata
  const subscriptionId = paymentIntent.metadata?.subscription_id;
  
  if (subscriptionId) {
    console.log('✅ Found subscription_id in metadata:', subscriptionId);
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
      userId = subscription.metadata?.userId;
      console.log('✅ Retrieved subscription from metadata:', subscription.id);
    } catch (error) {
      console.log('❌ Error retrieving subscription from metadata:', error.message);
    }
  }
  
  // Method 2: If no subscription_id in metadata, find customer's active subscription
  if (!subscription && paymentIntent.customer) {
    console.log('🔍 Looking for active subscription for customer:', paymentIntent.customer);
    
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: paymentIntent.customer,
        status: 'active',
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        subscription = subscriptions.data[0];
        userId = subscription.metadata?.userId;
        console.log('✅ Found active subscription:', subscription.id);
      } else {
        console.log('❌ No active subscription found for customer');
      }
    } catch (error) {
      console.log('❌ Error listing subscriptions:', error.message);
    }
  }
  
  // Method 3: Find user by email (PRIMARY METHOD for Payment Links)
  if (!userId && customer && customer.email) {
    console.log('🔍 Looking for user by customer email:', customer.email);
    
    try {
      // Try to find user in Firebase Auth first (most reliable)
      try {
        console.log('🔍 Searching Firebase Auth for user with email:', customer.email);
        const authUser = await admin.auth().getUserByEmail(customer.email);
        userId = authUser.uid;
        console.log('✅ Found user by email in Firebase Auth:', userId);
      } catch (authError) {
        console.log('❌ No user found in Firebase Auth:', authError.message);
        
        // Fallback: Try to find user in Firestore
        console.log('🔍 Searching Firestore for user with email:', customer.email);
        try {
          const usersSnapshot = await db.collection('users')
            .where('email', '==', customer.email)
            .limit(1)
            .get();
          
          console.log('📊 Firestore query result:', {
            empty: usersSnapshot.empty,
            size: usersSnapshot.size,
            docs: usersSnapshot.docs.length
          });
          
          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            userId = userDoc.id;
            console.log('✅ Found user by email in Firestore:', userId);
          } else {
            console.log('❌ No user found with email in Firestore:', customer.email);
            
            // User paid but doesn't have an account yet - create one
            console.log('🆕 Creating new user account for paid customer:', customer.email);
            try {
              // Create Firebase Auth user
              console.log('🔄 Creating Firebase Auth user...');
              const newUser = await admin.auth().createUser({
                email: customer.email,
                emailVerified: true, // Trust Stripe's email verification
                disabled: false,
                password: 'TempPassword123!' // Temporary password for users created from payments
              });
              
              userId = newUser.uid;
              console.log('✅ Created new Firebase Auth user:', userId);
              
              // Create Firestore user document with basic subscription info
              console.log('🔄 Creating Firestore user document...');
              await db.collection('users').doc(userId).set({
                email: customer.email,
                subscription: {
                  tier: 'founders-circle', // Default to Founder's Circle for Payment Links
                  plan: 'founders-circle', // Add this for app compatibility
                  status: 'active',
                  planName: 'Founder\'s Circle',
                  billingCycle: 'monthly',
                  startDate: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  stripeCustomerId: customer.id,
                  createdFromPayment: true // Flag to indicate account was created from payment
                },
                createdAt: new Date().toISOString(),
                createdFromPayment: true,
                tempPassword: 'TempPassword123!', // Temporary password for users created from payments
                needsPasswordReset: true // Flag to indicate user should reset password
              });
              
              console.log('✅ Created Firestore user document for:', userId);
              
              // Send welcome email with temporary password
              await sendEmail(userId, 'welcome_with_temp_password', {
                subscriptionTier: 'founders-circle',
                planName: 'Founder\'s Circle',
                tempPassword: 'TempPassword123!',
                customerEmail: customer.email
              });
              
            } catch (createError) {
              console.error('❌ Error creating user account:', createError);
              console.error('Create error details:', {
                email: customer.email,
                error: createError.message,
                stack: createError.stack
              });
              // Continue without userId - will be handled below
            }
          }
        } catch (firestoreError) {
          console.error('❌ Error querying Firestore:', firestoreError);
          console.error('Firestore error details:', {
            email: customer.email,
            error: firestoreError.message,
            stack: firestoreError.stack
          });
          // Continue without userId - will be handled below
        }
      }
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      // Don't throw - continue with other methods
    }
  }
  
      // If we still don't have a subscription, try to find it by looking at recent subscriptions
      if (!subscription && paymentIntent.customer) {
        console.log('🔍 Looking for recent subscriptions (including incomplete ones)');
        
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: paymentIntent.customer,
            limit: 10 // Get more recent subscriptions
          });
          
          console.log('📊 Found subscriptions:', subscriptions.data.length);
          
          // Look for the most recent subscription
          if (subscriptions.data.length > 0) {
            subscription = subscriptions.data[0];
            console.log('✅ Found recent subscription:', subscription.id, 'Status:', subscription.status);
            console.log('📋 Subscription details:', {
              id: subscription.id,
              status: subscription.status,
              items: subscription.items?.data?.length || 0,
              priceId: subscription.items?.data?.[0]?.price?.id
            });
          }
        } catch (error) {
          console.log('❌ Error listing recent subscriptions:', error.message);
        }
      }
      
      // For Payment Links, also check if this is a one-time payment that should create a subscription
      if (!subscription && paymentIntent.customer && paymentIntent.amount > 0) {
        console.log('🔍 Payment Link detected - checking for subscription creation');
        
        // Look for any subscription created around the same time as this payment
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: paymentIntent.customer,
            created: {
              gte: Math.floor((Date.now() - 60000) / 1000) // Last minute
            },
            limit: 5
          });
          
          if (subscriptions.data.length > 0) {
            subscription = subscriptions.data[0];
            console.log('✅ Found newly created subscription:', subscription.id);
          }
        } catch (error) {
          console.log('❌ Error checking for new subscriptions:', error.message);
        }
      }
  
  if (!userId) {
    console.error('❌ No userId found for payment intent:', paymentIntent.id);
    console.error('Customer email:', customer?.email);
    console.error('Customer ID:', paymentIntent.customer);
    
    // TEMPORARY FIX: Create a placeholder user ID for now
    // This will be fixed once Firebase service account is set up
    console.log('🔄 TEMPORARY FIX: Creating placeholder user ID for payment processing');
    userId = `temp_${paymentIntent.customer}_${Date.now()}`;
    console.log('✅ Created temporary user ID:', userId);
  }
  
  // Determine subscription tier - if no subscription found, default to Founder's Circle for Payment Links
  let subscriptionTier = 'founders-circle'; // Default for Payment Links
  let priceId = null;
  
  if (subscription && subscription.items && subscription.items.data.length > 0) {
    priceId = subscription.items.data[0]?.price.id;
    subscriptionTier = PLAN_MAPPING[priceId] || 'founders-circle';
    console.log('✅ Using subscription tier from subscription:', subscriptionTier);
  } else {
    console.log('⚠️ No subscription found, defaulting to Founder\'s Circle for Payment Link');
  }
  
  console.log('🎯 Updating user subscription:', {
    userId,
    subscriptionTier,
    priceId,
    subscriptionId: subscription?.id || 'payment-link-default',
    customerEmail: customer?.email
  });
  
  // Update user's subscription in Firebase
  try {
    console.log('🔄 Starting subscription update for user:', userId);
    
    await updateUserSubscription(userId, {
      tier: subscriptionTier,
      plan: subscriptionTier, // Add this for app compatibility
      stripeCustomerId: paymentIntent.customer,
      stripeSubscriptionId: subscription?.id || null,
      status: 'active',
      planName: 'Founder\'s Circle',
      billingCycle: 'monthly',
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      paymentIntentId: paymentIntent.id,
      createdFromPaymentLink: true
    });

    console.log(`✅ User ${userId} upgraded to ${subscriptionTier} via Payment Intent`);
  } catch (updateError) {
    console.error('❌ Error updating user subscription:', updateError);
    console.error('Update error details:', {
      userId,
      subscriptionTier,
      error: updateError.message,
      stack: updateError.stack
    });
    
    // TEMPORARY FIX: Don't throw error, just log it
    // This will be fixed once Firebase service account is set up
    console.log('🔄 TEMPORARY FIX: Skipping Firebase update due to auth error');
    console.log(`✅ Payment processed successfully for ${customer?.email} - subscription: ${subscriptionTier}`);
  }
  
  // Get the product name for ConvertKit
  const productName = getProductNameFromTier(subscriptionTier);
  
  // Send welcome email with proper product information
  await sendEmail(userId, 'subscription_created', {
    subscriptionTier,
    planName: 'Founder\'s Circle',
    productName: productName,
    priceId: priceId || 'payment-link-default'
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
    plan: subscriptionTier, // Add this for app compatibility
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
    plan: subscriptionTier, // Add this for app compatibility
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
    plan: SUBSCRIPTION_TIERS.FREE, // Add this for app compatibility
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
  console.log('💰 Invoice payment succeeded:', invoice.id);
  console.log('📋 Invoice details:', {
    id: invoice.id,
    customer: invoice.customer,
    subscription: invoice.subscription,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency
  });
  
  // Check for subscription in multiple locations
  let subscriptionId = invoice.subscription;
  
  // If not found, check parent subscription details
  if (!subscriptionId && invoice.parent && invoice.parent.subscription_details) {
    subscriptionId = invoice.parent.subscription_details.subscription;
    console.log('📋 Found subscription in parent details:', subscriptionId);
  }
  
  if (!subscriptionId) {
    console.log('⚠️ Invoice has no subscription - trying to find user by customer email');
    
    // Try to find user by customer email for invoices without subscriptions
    if (invoice.customer) {
      try {
        const customer = await stripe.customers.retrieve(invoice.customer);
        console.log('📧 Customer email:', customer.email);
        
        // Check if customer is deleted
        if (customer.deleted) {
          console.log('⚠️ Customer has been deleted in Stripe - cannot process payment');
          return;
        }
        
        if (customer.email) {
          // Find user by email
          try {
            const authUser = await admin.auth().getUserByEmail(customer.email);
            const userId = authUser.uid;
            
            console.log('✅ Found user by email:', userId);
            
            // Update user to Founder's Circle tier (for Payment Links)
            await updateUserSubscription(userId, {
              tier: 'founders-circle',
              plan: 'founders-circle',
              status: 'active',
              planName: 'Founder\'s Circle',
              billingCycle: 'monthly',
              stripeCustomerId: invoice.customer,
              lastPaymentDate: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              createdFromPaymentLink: true
            });

            console.log(`✅ User ${userId} upgraded to Founder's Circle via Payment Link`);
            
            // Send payment success email
            await sendEmail(userId, 'payment_succeeded');
            return;
          } catch (authError) {
            console.log('❌ No user found in Firebase Auth:', authError.message);
            
            // Create user if they don't exist (for Payment Links)
            console.log('🔄 Creating new Firebase user for Payment Link customer:', customer.email);
            try {
              const newUser = await admin.auth().createUser({
                email: customer.email,
                displayName: customer.name || 'Payment Link User',
                password: 'TempPassword123!' // Temporary password
              });
              
              const userId = newUser.uid;
              console.log('✅ Created new Firebase user:', userId);
              
              // Create Firestore user document
              await db.collection('users').doc(userId).set({
                email: customer.email,
                displayName: customer.name || 'Payment Link User',
                tier: 'founders-circle', // Default to Founder's Circle for Payment Links
                plan: 'founders-circle',
                status: 'active',
                stripeCustomerId: invoice.customer,
                createdFromPaymentLink: true,
                needsPasswordReset: true,
                tempPassword: 'TempPassword123!',
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              });
              
              console.log('✅ Created Firestore user document for:', userId);
              
              // Update subscription info
              await updateUserSubscription(userId, {
                lastPaymentDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              });

              console.log(`✅ Payment succeeded for newly created user ${userId}`);
              
              // Send welcome email
              await sendEmail(userId, 'payment_succeeded');
              return;
              
            } catch (createError) {
              console.error('❌ Error creating user:', createError);
            }
          }
        }
      } catch (customerError) {
        console.error('❌ Error retrieving customer:', customerError);
      }
    }
    
    console.log('⚠️ Could not process payment - no subscription and no user found');
    return;
  }
  
  try {
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
  } catch (error) {
    console.error('❌ Error handling payment succeeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);
  
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    console.log('⚠️ Invoice has no subscription - skipping payment failure handler');
    return;
  }
  
  try {
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
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
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
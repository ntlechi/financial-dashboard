// Stripe Utility Functions
// Frontend integration for Stripe checkout

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Map plan IDs to Stripe Price IDs
export const STRIPE_PRICE_IDS = {
  'climber-monthly': process.env.REACT_APP_STRIPE_CLIMBER_MONTHLY,
  'climber-annual': process.env.REACT_APP_STRIPE_CLIMBER_ANNUAL,
  'operator-monthly': process.env.REACT_APP_STRIPE_OPERATOR_MONTHLY,
  'operator-annual': process.env.REACT_APP_STRIPE_OPERATOR_ANNUAL,
  'founders-circle-monthly': process.env.REACT_APP_STRIPE_FOUNDERS_CIRCLE_MONTHLY,
};

/**
 * Create Stripe checkout session and redirect to Stripe
 * @param {string} planId - Plan identifier (e.g., 'climber', 'operator', 'founders-circle')
 * @param {string} billingCycle - 'monthly' or 'annual'
 * @param {object} user - Firebase user object
 * @returns {Promise<void>}
 */
export async function createCheckoutSession(planId, billingCycle, user) {
  try {
    console.log('🛒 Creating checkout session:', { planId, billingCycle });

    // Validate inputs
    if (!user?.uid || !user?.email) {
      throw new Error('User must be authenticated');
    }

    // Get the correct price ID
    const priceKey = `${planId}-${billingCycle}`;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    if (!priceId) {
      throw new Error(`No price ID found for ${priceKey}`);
    }

    console.log('📝 Using price ID:', priceId);

    // Call our backend API to create the checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        userId: user.uid,
        userEmail: user.email || user.isAnonymous ? 'anonymous@user.com' : user.email,
        planName: planId,
        billingCycle: billingCycle,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    console.log('✅ Checkout session created:', data.sessionId);

    // Get Stripe instance
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // Redirect to Stripe Checkout
    console.log('🔄 Redirecting to Stripe Checkout...');
    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }

  } catch (error) {
    console.error('❌ Checkout error:', error);
    throw error;
  }
}

/**
 * Create Stripe Customer Portal session
 * Used for managing subscriptions, payment methods, invoices
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - Portal URL
 */
export async function createPortalSession(userId) {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session');
    }

    return data.url;
  } catch (error) {
    console.error('❌ Portal session error:', error);
    throw error;
  }
}

/**
 * Format price for display
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price
 */
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
}

/**
 * Get plan display name
 * @param {string} planId - Plan identifier
 * @returns {string} - Display name
 */
export function getPlanDisplayName(planId) {
  const names = {
    'recon': 'Recon Kit',
    'climber': 'Climber Plan',
    'operator': 'Operator Plan',
    'founders-circle': "Founder's Circle",
  };
  return names[planId] || planId;
}

/**
 * Check if Stripe is properly configured
 * @returns {boolean}
 */
export function isStripeConfigured() {
  const hasPublishableKey = !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  const hasPriceIds = Object.values(STRIPE_PRICE_IDS).some(id => id);
  
  if (!hasPublishableKey) {
    console.warn('⚠️  Stripe publishable key not configured');
  }
  
  if (!hasPriceIds) {
    console.warn('⚠️  Stripe price IDs not configured');
  }
  
  return hasPublishableKey && hasPriceIds;
}

export default {
  createCheckoutSession,
  createPortalSession,
  formatPrice,
  getPlanDisplayName,
  isStripeConfigured,
  STRIPE_PRICE_IDS,
};

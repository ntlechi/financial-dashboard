import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (you'll need to add your publishable key to .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (priceData, trackingInfo = {}) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...priceData,
        metadata: {
          utm_source: trackingInfo.utm_source || '',
          utm_medium: trackingInfo.utm_medium || '',
          utm_campaign: trackingInfo.utm_campaign || '',
          ref: trackingInfo.ref || '',
          promo_code: trackingInfo.promo_code || ''
        }
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const handleSuccessfulPayment = async (sessionId) => {
  try {
    const response = await fetch(`/api/checkout-session/${sessionId}`);
    const session = await response.json();
    
    // Track the successful conversion
    const { trackConversion } = await import('./tracking');
    await trackConversion({
      amount: session.amount_total / 100, // Convert from cents
      product: 'Financial Dashboard Lifetime',
      stripe_session_id: sessionId,
      customer_email: session.customer_details.email,
      payment_method: 'stripe'
    });

    return session;
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
};

// Price configurations for different tiers
export const PRICE_CONFIG = {
  lifetime_launch: {
    price: 14700, // $147 in cents
    currency: 'usd',
    product_name: 'Financial Dashboard - Lifetime Access',
    description: 'Complete financial tracking for digital nomads - Birthday Launch Special'
  },
  lifetime_regular: {
    price: 39700, // $397 in cents
    currency: 'usd',
    product_name: 'Financial Dashboard - Lifetime Access',
    description: 'Complete financial tracking for digital nomads'
  },
  monthly_nomad: {
    price: 1200, // $12 in cents
    currency: 'usd',
    product_name: 'Digital Nomad Plan',
    description: 'Monthly subscription with full features',
    recurring: {
      interval: 'month',
      interval_count: 1
    }
  },
  yearly_nomad: {
    price: 9900, // $99 in cents
    currency: 'usd',
    product_name: 'Digital Nomad Plan - Annual',
    description: 'Annual subscription with full features (save 17%)',
    recurring: {
      interval: 'year',
      interval_count: 1
    }
  }
};
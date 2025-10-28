// Vercel Serverless Function: Create Stripe Checkout Session
// API Route: /api/create-checkout-session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// CORS headers for frontend requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ...corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail, planName, billingCycle } = req.body;

    // Validate required fields
    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: priceId, userId, userEmail' 
      });
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      return res.status(400).json({ 
        error: 'Invalid price ID format' 
      });
    }

    console.log('📝 Creating checkout session:', {
      priceId,
      userId,
      userEmail,
      planName,
      billingCycle
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      
      // Customer information
      customer_email: userEmail,
      client_reference_id: userId, // Important: link payment to user
      
      // Metadata for webhook processing
      metadata: {
        userId: userId,
        planName: planName,
        billingCycle: billingCycle,
      },
      
      // Subscription metadata
      subscription_data: {
        metadata: {
          userId: userId,
          planName: planName,
          billingCycle: billingCycle,
        },
      },
      
      // Success and cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.survivebackpacking.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.survivebackpacking.com'}/?canceled=true`,
      
      // Enable customer portal for subscription management
      allow_promotion_codes: true,
    });

    console.log('✅ Checkout session created:', session.id);

    // Return session info to frontend
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Checkout session error:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

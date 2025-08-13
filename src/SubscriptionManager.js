import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { pricingPlans, stripeConfig, planLimits } from './pricing';
import { Check, Crown, Zap, ArrowRight, X } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(stripeConfig.publishableKey);

const SubscriptionManager = ({ user, currentPlan = 'free', onClose }) => {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState('monthly');

  const handleSubscribe = async (priceId) => {
    if (priceId === 'free') {
      // Handle free plan
      onClose();
      return;
    }

    try {
      setLoading(true);
      const stripe = await stripePromise;

      // In a real app, you'd call your backend to create a checkout session
      // For now, we'll simulate the Stripe checkout flow
      
      // This is where you'd make an API call to your backend:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     priceId: billingInterval === 'yearly' ? priceId.replace('monthly', 'yearly') : priceId,
      //     userId: user.uid,
      //     userEmail: user.email
      //   })
      // });
      // const session = await response.json();
      // const result = await stripe.redirectToCheckout({ sessionId: session.id });

      // For demo purposes, show success message
      alert(`🎉 Subscription to ${priceId} initiated! 
      
In production, this would:
1. Create Stripe checkout session
2. Redirect to Stripe payment page  
3. Handle successful payment webhook
4. Update user subscription in Firebase
5. Enable premium features

Add your Stripe secret key to complete integration.`);
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PricingCard = ({ plan, planKey }) => {
    const isCurrentPlan = currentPlan === planKey;
    const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.price;
    const yearlyDiscount = plan.yearlyPrice ? Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100) : 0;

    return (
      <div className={`relative bg-gray-800 rounded-xl p-6 border-2 transition-all duration-200 ${
        plan.popular 
          ? 'border-blue-500 ring-2 ring-blue-500/20' 
          : isCurrentPlan 
            ? 'border-green-500 ring-2 ring-green-500/20' 
            : 'border-gray-600 hover:border-gray-500'
      }`}>
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {plan.badge}
            </span>
          </div>
        )}
        
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              Current Plan
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            {planKey === 'free' && <Zap className="w-5 h-5 text-yellow-400" />}
            {planKey === 'backpacker' && <Crown className="w-5 h-5 text-blue-400" />}
            {planKey === 'entrepreneur' && <Crown className="w-5 h-5 text-purple-400" />}
            {plan.name}
          </h3>
          <p className="text-gray-400 text-sm">{plan.description}</p>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">${price}</span>
            <span className="text-gray-400">/{billingInterval === 'yearly' ? 'year' : 'month'}</span>
          </div>
          {billingInterval === 'yearly' && plan.yearlyPrice && (
            <p className="text-green-400 text-sm mt-1">
              Save {yearlyDiscount}% with annual billing
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {plan.limitations && (
          <ul className="space-y-2 mb-6 pb-4 border-b border-gray-700">
            {plan.limitations.map((limitation, index) => (
              <li key={index} className="flex items-center gap-3 text-sm">
                <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-gray-500">{limitation}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => handleSubscribe(plan.id)}
          disabled={loading || isCurrentPlan}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            isCurrentPlan
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : plan.popular
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {loading ? (
            'Processing...'
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            <>
              {plan.cta}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
              <p className="text-gray-400 mt-1">Upgrade your financial journey with Survive Financial</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(pricingPlans).map(([key, plan]) => (
              <PricingCard key={key} plan={plan} planKey={key} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              🔒 Secure payments powered by Stripe • Cancel anytime • 30-day money-back guarantee
            </p>
            <p className="text-gray-500 text-xs mt-2">
              By subscribing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
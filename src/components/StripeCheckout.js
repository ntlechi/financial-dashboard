import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Gift, Users, Clock } from 'lucide-react';
import { createCheckoutSession, PRICE_CONFIG } from '../utils/stripe';
import { validatePromoCode, getTrackingData } from '../utils/tracking';

const StripeCheckout = ({ selectedPlan = 'lifetime_launch' }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

  const priceConfig = PRICE_CONFIG[selectedPlan];
  const basePrice = priceConfig.price / 100; // Convert from cents
  const discountAmount = promoApplied ? promoApplied.discount : 0;
  const finalPrice = basePrice - discountAmount;

  useEffect(() => {
    // Get tracking info
    const tracking = getTrackingData();
    setTrackingInfo(tracking);

    // Auto-apply promo codes based on source
    if (tracking.utm_source === 'influencerA') {
      handlePromoCode('NOMAD1');
    } else if (tracking.utm_source === 'influencerB') {
      handlePromoCode('NOMAD2');
    }

    // Set up countdown timer for launch
    const launchEnd = new Date('2024-10-26T23:59:59');
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchEnd - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePromoCode = (code = promoCode) => {
    const result = validatePromoCode(code);
    
    if (result.valid) {
      setPromoApplied(result);
      setPromoCode(code.toUpperCase());
    } else {
      alert('Invalid promo code');
      setPromoApplied(null);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const checkoutData = {
        ...priceConfig,
        price: Math.round(finalPrice * 100), // Convert back to cents
        promo_code: promoApplied ? promoCode : null,
        discount_amount: discountAmount
      };

      await createCheckoutSession(checkoutData, {
        ...trackingInfo,
        promo_code: promoCode
      });

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Launch Timer */}
      <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 mr-2" />
          <span className="font-semibold">Birthday Launch Special Ends In:</span>
        </div>
        <div className="text-2xl font-bold">{timeLeft}</div>
      </div>

      {/* Product Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">🎂 Birthday Special</h2>
          <p className="text-blue-100">Lifetime Access - Never Pay Again!</p>
        </div>

        {/* Tracking Info */}
        {trackingInfo.utm_source && (
          <div className="px-6 py-3 bg-blue-50 border-b">
            <div className="flex items-center text-sm text-blue-700">
              <Users className="w-4 h-4 mr-2" />
              Referred by: <span className="font-semibold ml-1">{trackingInfo.utm_source}</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-gray-500 text-lg line-through mb-1">
              Regular: $397
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${finalPrice}
              {promoApplied && (
                <span className="text-lg text-green-600 ml-2">
                  (${discountAmount} off!)
                </span>
              )}
            </div>
            <div className="text-gray-600">One-time payment • Lifetime access</div>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Complete financial dashboard
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Multi-currency support for travelers
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Investment & business tracking
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Lifetime updates & support
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              30-day money-back guarantee
            </div>
          </div>

          {/* Promo Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gift className="inline w-4 h-4 mr-1" />
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handlePromoCode()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Apply
              </button>
            </div>
            
            {promoApplied && (
              <div className="mt-2 flex items-center text-green-600 text-sm">
                <Gift className="w-4 h-4 mr-1" />
                {promoApplied.influencer} discount applied!
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Lock className="w-5 h-5" />
            {isLoading ? 'Processing...' : `Get Lifetime Access - $${finalPrice}`}
          </button>

          {/* Trust Signals */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
              <Lock className="w-4 h-4 mr-1" />
              Secured by Stripe • SSL Encrypted
            </div>
            <div className="text-xs text-gray-400">
              🎯 Limited to first 1,000 customers • 🔒 30-day guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 mb-2">
          Join 500+ nomads already tracking their finances
        </div>
        <div className="flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-300 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
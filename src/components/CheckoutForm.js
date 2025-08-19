import React, { useState, useEffect } from 'react';
import { CreditCard, Tag, Gift } from 'lucide-react';
import { validatePromoCode, trackConversion, getTrackingData } from '../utils/tracking';

const CheckoutForm = ({ onPurchaseComplete }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const basePrice = 197; // Birthday launch price
  const discountAmount = promoApplied ? promoApplied.discount : 0;
  const finalPrice = basePrice - discountAmount;

  useEffect(() => {
    // Get tracking info on component mount
    const tracking = getTrackingData();
    setTrackingInfo(tracking);

    // Auto-apply promo if coming from specific source
    if (tracking.utm_source === 'influencerA') {
      handlePromoCode('NOMAD1');
    } else if (tracking.utm_source === 'influencerB') {
      handlePromoCode('NOMAD2');
    }
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

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Track the conversion
      await trackConversion({
        amount: finalPrice,
        product: 'Financial Dashboard Lifetime',
        promo_code: promoApplied?.influencer || null,
        customer_email: 'user@example.com', // Get from form
        payment_method: 'stripe'
      });

      // Call parent success handler
      onPurchaseComplete({
        amount: finalPrice,
        influencer: promoApplied?.influencer,
        tracking: trackingInfo
      });

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Purchase
        </h3>
        <p className="text-gray-600">
          Financial Dashboard - Lifetime Access
        </p>
      </div>

      {/* Tracking Info Display (for debugging) */}
      {trackingInfo?.utm_source && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🎯 Referred by: {trackingInfo.utm_source}
          </p>
        </div>
      )}

      {/* Pricing */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Lifetime Access</span>
          <span className="text-gray-900">${basePrice}</span>
        </div>
        
        {promoApplied && (
          <div className="flex justify-between items-center mb-2 text-green-600">
            <span>Discount ({promoApplied.influencer})</span>
            <span>-${discountAmount}</span>
          </div>
        )}
        
        <hr className="my-2" />
        
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total</span>
          <span>${finalPrice}</span>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="inline w-4 h-4 mr-1" />
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
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
            Promo code applied! Referred by {promoApplied.influencer}
          </div>
        )}
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <CreditCard className="w-5 h-5" />
        {isProcessing ? 'Processing...' : `Purchase for $${finalPrice}`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment processing. 30-day money-back guarantee.
      </p>
    </div>
  );
};

export default CheckoutForm;
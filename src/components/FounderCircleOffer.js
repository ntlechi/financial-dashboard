import React, { useState, useEffect } from 'react';
import { Crown, Clock, Users, X, ArrowRight, Zap, Check } from 'lucide-react';
import { pricingPlans } from '../pricing';
import { isFounderCircleAvailable, getFounderCircleSpots } from '../utils/featureAccess';

const FounderCircleOffer = ({ onClose, onSubscribe }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [spotsLeft, setSpotsLeft] = useState({ remaining: 77, total: 100 }); // Mock data
  const [isVisible, setIsVisible] = useState(true);

  const founderPlan = pricingPlans.founder;

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date(founderPlan.launchDate);
      const endDate = new Date(launchDate.getTime() + (founderPlan.daysLimit * 24 * 60 * 60 * 1000));
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Auto-close if time expired
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [founderPlan.launchDate, founderPlan.daysLimit]);

  // Load spots data
  useEffect(() => {
    getFounderCircleSpots().then(setSpotsLeft);
  }, []);

  if (!isVisible || !isFounderCircleAvailable()) {
    return null;
  }

  const handleSubscribe = () => {
    onSubscribe('founder');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-2xl w-full p-8 border-2 border-yellow-500/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              The Founder's Circle
            </h2>
          </div>
          <p className="text-gray-300 text-lg">
            Exclusive founding member access - Limited time only
          </p>
        </div>

        {/* Offer Details */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 mb-6 border border-yellow-500/30">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="text-4xl font-bold text-white">
                ${founderPlan.price}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <div className="text-right">
                <div className="text-lg text-gray-400 line-through">
                  ${founderPlan.originalPrice}/month
                </div>
                <div className="text-green-400 font-semibold">
                  Save ${(founderPlan.originalPrice - founderPlan.price).toFixed(2)}/month
                </div>
              </div>
            </div>
            <p className="text-yellow-300 font-semibold">
              🔒 Price locked for LIFE as long as you stay subscribed
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {founderPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scarcity Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Countdown */}
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold text-sm">TIME LEFT</span>
            </div>
            <div className="text-white font-mono text-lg">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </div>
          </div>

          {/* Spots Left */}
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold text-sm">SPOTS LEFT</span>
            </div>
            <div className="text-white font-mono text-lg">
              {spotsLeft.remaining} of {spotsLeft.total}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Spots claimed</span>
            <span>{spotsLeft.total - spotsLeft.remaining}/{spotsLeft.total}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((spotsLeft.total - spotsLeft.remaining) / spotsLeft.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSubscribe}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 mb-4"
        >
          <Crown className="w-5 h-5" />
          Claim My Founder's Circle Spot
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Trust Signals */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            🔒 30-day money-back guarantee • Cancel anytime • Secure payment
          </p>
          <p className="text-yellow-300 text-xs">
            ⚡ This offer expires when timer hits zero OR all 100 spots are claimed
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>{spotsLeft.total - spotsLeft.remaining} financial freedom seekers have already joined</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderCircleOffer;
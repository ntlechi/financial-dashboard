import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Target, Rocket, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentPricingPlans, getPricingPhaseInfo, getStripePriceId } from '../pricing';
import { isFoundersCircleAvailable, isEarlyAdopterAvailable } from '../utils/subscriptionUtils';

const PricingModal = ({ onClose, currentPlan = 'free', onUpgrade, highlightPlan = null }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [foundersCircleCount, setFoundersCircleCount] = useState(0);
  const [earlyAdopterCount, setEarlyAdopterCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showFoundersFeatures, setShowFoundersFeatures] = useState(false);

  // Get current pricing phase and plans
  const pricingPhaseInfo = getPricingPhaseInfo(foundersCircleCount, earlyAdopterCount);
  const currentPlans = getCurrentPricingPlans(foundersCircleCount, earlyAdopterCount);

  // Load subscriber counts from Firebase
  useEffect(() => {
    const loadSubscriberCounts = async () => {
      try {
        // Load Founder's Circle count
        const foundersDocRef = doc(db, 'app-config', 'founders-circle');
        const foundersDoc = await getDoc(foundersDocRef);
        
        if (foundersDoc.exists()) {
          const count = foundersDoc.data().subscriberCount || 0;
          setFoundersCircleCount(count);
          console.log(`📊 Founder's Circle: ${count}/100 spots taken`);
        } else {
          setFoundersCircleCount(0);
        }

        // Load Early Adopter count
        const earlyAdopterDocRef = doc(db, 'app-config', 'early-adopter');
        const earlyAdopterDoc = await getDoc(earlyAdopterDocRef);
        
        if (earlyAdopterDoc.exists()) {
          const count = earlyAdopterDoc.data().subscriberCount || 0;
          setEarlyAdopterCount(count);
          console.log(`📊 Early Adopter: ${count}/500 spots taken`);
        } else {
          setEarlyAdopterCount(0);
        }
      } catch (error) {
        console.error('Error loading subscriber counts:', error);
        setFoundersCircleCount(0);
        setEarlyAdopterCount(0);
      }
    };

    loadSubscriberCounts();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      let timeLeft = 0;
      
      // Set timer based on current phase
      if (pricingPhaseInfo.isFoundersPhase) {
        const launchEndDate = new Date('2025-10-26T23:59:59.999Z');
        timeLeft = launchEndDate - now;
      } else if (pricingPhaseInfo.isEarlyAdopterPhase) {
        const earlyAdopterEndDate = new Date('2026-01-01T23:59:59.999Z');
        timeLeft = earlyAdopterEndDate - now;
      }
      
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [pricingPhaseInfo]);

  const handleUpgrade = (planId) => {
    if (onUpgrade) {
      const priceId = getStripePriceId(planId, billingCycle, foundersCircleCount, earlyAdopterCount);
      onUpgrade(planId, billingCycle, priceId);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'recon': return Target;
      case 'climber': return Zap;
      case 'founders-circle': return Crown;
      case 'early-adopter': return Rocket;
      case 'operator': return Rocket;
      default: return Target;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'recon': return 'from-gray-600 to-gray-700';
      case 'climber': return 'from-blue-600 to-blue-700';
      case 'founders-circle': return 'from-amber-600 to-orange-600';
      case 'early-adopter': return 'from-purple-600 to-indigo-600';
      case 'operator': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const renderPlanCard = (plan) => {
    const Icon = getPlanIcon(plan.id);
    const colorClass = getPlanColor(plan.id);
    const isHighlighted = highlightPlan === plan.id;
    const isPopular = plan.popular;
    const isCurrentPlan = currentPlan === plan.id;

    return (
      <div
        key={plan.id}
        className={`relative bg-gradient-to-br ${colorClass} rounded-2xl p-8 border-2 transition-all duration-300 ${
          isHighlighted || isPopular 
            ? 'border-white shadow-2xl scale-105' 
            : 'border-gray-600 hover:border-gray-400'
        } ${isCurrentPlan ? 'ring-2 ring-white ring-opacity-50' : ''}`}
      >
        {/* Badge */}
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              {plan.badge}
            </span>
          </div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              Current Plan
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-white/80 text-sm">{plan.description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          {plan.price === 0 ? (
            <div className="text-4xl font-bold text-white">FREE</div>
          ) : (
            <div>
              <div className="text-4xl font-bold text-white">
                ${plan.monthlyOnly ? plan.price : (billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price)}
                <span className="text-lg text-white/80">/{plan.monthlyOnly ? 'month' : (billingCycle === 'yearly' ? 'year' : 'month')}</span>
              </div>
              {!plan.monthlyOnly && billingCycle === 'yearly' && plan.yearlyPrice && (
                <div className="text-sm text-white/60 mt-1">
                  ${plan.price}/month billed annually
                </div>
              )}
              {/* Strike-through regular price for Founder's Circle */}
              {plan.id === 'founders-circle' && (
                <div className="text-lg text-white/60 mt-1 line-through">
                  ${billingCycle === 'yearly' ? '179.88' : '14.99'}/month
                </div>
              )}
              {plan.savings && (
                <div className="text-sm text-green-300 font-semibold mt-1">
                  {plan.savings}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {plan.id === 'founders-circle' ? (
            <div>
              {/* Show first 4 features */}
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{feature}</span>
                </div>
              ))}
              
              {/* Dropdown for remaining features */}
              {plan.features.length > 4 && (
                <div>
                  <button
                    onClick={() => setShowFoundersFeatures(!showFoundersFeatures)}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mt-2"
                  >
                    {showFoundersFeatures ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span>+ {plan.features.length - 4} more features</span>
                  </button>
                  
                  {showFoundersFeatures && (
                    <div className="mt-3 space-y-2 pl-7">
                      {plan.features.slice(4).map((feature, index) => (
                        <div key={index + 4} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                          <span className="text-white/90 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">{feature}</span>
              </div>
            ))
          )}
        </div>

        {/* Spots Left with Progress Bar */}
        {plan.limited && plan.spotsLeft !== undefined && (
          <div className="mb-6 p-3 bg-white/10 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{plan.id === 'founders-circle' ? foundersCircleCount : earlyAdopterCount} of {plan.spotsLeft} spots taken</span>
                </div>
                <span className="text-white/60 text-xs">
                  {plan.spotsLeft - (plan.id === 'founders-circle' ? foundersCircleCount : earlyAdopterCount)} left
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((plan.id === 'founders-circle' ? foundersCircleCount : earlyAdopterCount) / plan.spotsLeft) * 100)}%` 
                  }}
                ></div>
              </div>
              
              {/* Urgency Message */}
              {(plan.id === 'founders-circle' ? foundersCircleCount : earlyAdopterCount) > plan.spotsLeft * 0.8 && (
                <div className="text-amber-300 text-xs text-center font-medium">
                  🔥 Almost full! Don't miss out!
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => handleUpgrade(plan.id)}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-white/20 text-white/60 cursor-not-allowed'
              : 'bg-white text-gray-900 hover:bg-white/90 transform hover:scale-105 shadow-lg'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : plan.cta}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-teal-900/90 to-gray-800 rounded-2xl border border-teal-500/30 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-900/90 to-gray-800 border-b border-teal-500/30 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
          <div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
              <p className="text-gray-300">{pricingPhaseInfo.message}</p>
          </div>
          <button
            onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
          >
              <X className="w-6 h-6" />
          </button>
        </div>

          {/* Phase Info */}
          <div className="mt-4 flex items-center gap-4">
            {pricingPhaseInfo.isFoundersPhase && (
              <div className="flex items-center gap-2 text-amber-400">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Founder's Circle Phase</span>
              </div>
            )}
            {pricingPhaseInfo.isEarlyAdopterPhase && (
              <div className="flex items-center gap-2 text-purple-400">
                <Rocket className="w-5 h-5" />
                <span className="font-semibold">Early Adopter Phase</span>
              </div>
            )}
            {pricingPhaseInfo.isRegularPhase && (
              <div className="flex items-center gap-2 text-green-400">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Regular Pricing</span>
              </div>
            )}
          </div>

          {/* Timer */}
          {timeRemaining && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/30">
              <div className="flex items-center justify-center gap-2 text-amber-300 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {pricingPhaseInfo.isFoundersPhase ? 'Founder\'s Circle' : 'Early Adopter'} Offer Ends In:
                </span>
              </div>
              <div className="flex justify-center gap-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-300">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-300">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                  <div className="text-xs text-gray-300">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                  <div className="text-xs text-gray-300">Seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Toggle - Always show for better UX */}
          <div className="mt-4 flex justify-center">
            <div className="bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(currentPlans).map(renderPlanCard)}
        </div>

        {/* Guarantee */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-2">Mission Success Guarantee</h3>
              <p className="text-green-200">
                Try it for 30 days. If it doesn't give you more clarity and control than any finance app you've used before, 
                you get your money back. No hassle. No questions.
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
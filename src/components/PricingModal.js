import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Target, Rocket } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PricingModal = ({ onClose, currentPlan = 'free', onUpgrade, highlightPlan = null }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [foundersCircleCount, setFoundersCircleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Launch date: October 19, 2025, 9:00 AM EDT
  const launchDate = new Date('2025-10-19T13:00:00.000Z'); // 9 AM EDT = 1 PM UTC
  const launchEndDate = new Date(launchDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later (Oct 26, 2025)

  // Load Founder's Circle subscriber count from Firebase
  useEffect(() => {
    const loadFoundersCount = async () => {
      try {
        const countDocRef = doc(db, 'app-config', 'founders-circle');
        const countDoc = await getDoc(countDocRef);
        
        if (countDoc.exists()) {
          const count = countDoc.data().subscriberCount || 0;
          setFoundersCircleCount(count);
          console.log(`📊 Founder's Circle: ${count}/100 spots taken`);
        } else {
          setFoundersCircleCount(0);
        }
      } catch (error) {
        console.error('Error loading Founder\'s Circle count:', error);
        setFoundersCircleCount(0);
      }
    };

    loadFoundersCount();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const timeLeft = launchEndDate - now;
      
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
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [launchEndDate]);

  // Check if Founder's Circle is available
  const isFoundersCircleAvailable = () => {
    const now = new Date();
    return now >= launchDate && now <= launchEndDate && foundersCircleCount < 100;
  };

  const pricingTiers = {
    'recon': {
      name: 'Recon Kit',
      identity: 'The Recruit',
      monthlyPrice: 0,
      annualPrice: 0,
      savings: 0,
      description: 'Perfect for getting started with financial tracking',
      icon: Target,
      color: 'from-gray-600 to-gray-700',
      features: [
        'Basic Dashboard (Net Worth, Cash Flow, Savings Rate)',
        'Full Budget Calculator',
        'Complete Transaction Management',
        'Mobile Responsive Design',
        'Data Export (CSV)',
        'Community Support'
      ],
      limitations: [
        'Advanced Dashboard Cards',
        'Investment Portfolio Tracking',
        'Side Hustle Management',
        'Travel Mode',
        'Advanced Analytics'
      ]
    },
    'climber': {
      name: 'Climber Plan',
      identity: 'The Climber',
      monthlyPrice: 7.99,
      annualPrice: 79.00,
      savings: 17,
      description: 'Advanced analytics and full dashboard access',
      icon: Zap,
      color: 'from-blue-600 to-blue-700',
      features: [
        'Everything in Recon Kit',
        'Full Advanced Dashboard & Analytics',
        'All Financial Calculators',
        'Debt Payoff Calculator',
        'Emergency Fund Tracking',
        'Retirement Planning Tools',
        'Goal Tracking & Projections',
        'Priority Email Support',
        '30-Day Money-Back Guarantee'
      ],
      limitations: [
        'Side Hustle Management (Operator only)',
        'Investment Portfolio (Operator only)',
        'Travel Mode (Operator only)'
      ]
    },
    'operator': {
      name: 'Operator Plan',
      identity: 'The Operator',
      monthlyPrice: 14.99,
      annualPrice: 149.00,
      savings: 17,
      description: 'Complete financial freedom toolkit',
      icon: Rocket,
      color: 'from-purple-600 to-purple-700',
      features: [
        'Everything in Climber Plan',
        'Side Hustle Management',
        'Investment Portfolio Tracking',
        'Travel Mode & Multi-Currency',
        'Advanced Business Analytics',
        'Tax Optimization Tools',
        'Priority Support (24hr response)',
        '30-Day Money-Back Guarantee'
      ],
      limitations: []
    }
  };

  // Founder's Circle special offer
  const foundersCircle = {
    name: "Founder's Circle",
    identity: 'The Founder',
    monthlyPrice: 7.49,
    annualPrice: null, // No annual option
    savings: 0,
    description: 'Limited-time exclusive offer for first 100 members',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    features: [
      'Full Operator Plan Access ($14.99 USD value)',
      'Lifetime Price Lock ($7.49 USD/mo forever)',
      'Exclusive Founder Badge',
      'Early Access to New Features',
      'Priority Support (12hr response)',
      'Founder-Only Discord Channel',
      'Direct Access to Development Team',
      '30-Day Money-Back Guarantee'
    ],
    limitations: [],
    isLimited: true,
    spotsRemaining: 100 - foundersCircleCount
  };

  const handleUpgrade = (planId) => {
    if (onUpgrade) {
      onUpgrade(planId, billingCycle);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)} USD`;
  };

  const getButtonText = (planId) => {
    if (currentPlan === planId) return 'Current Plan';
    if (planId === 'recon') return 'Get Started Free';
    return 'Upgrade Now';
  };

  const getButtonStyle = (planId) => {
    if (currentPlan === planId) {
      return 'bg-gray-600 text-gray-300 cursor-not-allowed';
    }
    if (planId === 'founders-circle') {
      return 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold';
    }
    if (planId === 'recon') {
      return 'bg-gray-700 hover:bg-gray-600 text-white';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-7xl w-full my-4 sm:my-8 max-h-[96vh] sm:max-h-[90vh] flex flex-col">
        {/* Header - Sticky with close button always visible */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 sm:p-6 flex justify-between items-center flex-shrink-0 z-10">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">Unlock your path to financial freedom</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
        
        {/* Billing Toggle */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex justify-center">
            <div className="bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Founder's Circle Banner (if available) */}
        {isFoundersCircleAvailable() && (
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 m-6 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="w-8 h-8 text-amber-400 mr-3" />
                <div>
                  <h3 className="text-xl font-bold text-amber-400">🔥 Limited Launch Offer</h3>
                  <p className="text-amber-200">Full Operator features for $7.49/mo - Only {foundersCircle.spotsRemaining} spots left!</p>
                </div>
              </div>
              {timeRemaining && (
                <div className="text-right">
                  <div className="text-amber-400 font-bold">
                    {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                  </div>
                  <div className="text-amber-200 text-sm">Remaining</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Founder's Circle (if available) - DARK TEXT for readability */}
            {isFoundersCircleAvailable() && (
              <div className={`relative bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg p-6 border-2 border-amber-500 transform scale-105 shadow-xl`}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    LIMITED TIME
                  </span>
                </div>
                
                <div className="text-center mb-4">
                  <Crown className="w-12 h-12 text-gray-900 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">{foundersCircle.name}</h3>
                  <p className="text-gray-800 text-sm font-semibold">{foundersCircle.identity}</p>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(foundersCircle.monthlyPrice)}
                    <span className="text-lg text-gray-800"> /month</span>
                  </div>
                  <div className="text-gray-800 text-sm font-semibold">Locked in for life</div>
                  <div className="text-red-700 text-xs mt-1 font-bold">
                    🔥 Only {foundersCircle.spotsRemaining} spots left!
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {foundersCircle.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-900">
                      <Check className="w-4 h-4 text-green-700 mr-2 flex-shrink-0 font-bold" />
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                  <div className="text-gray-800 text-xs font-semibold">+ {foundersCircle.features.length - 4} more features</div>
                </div>

                <button
                  onClick={() => handleUpgrade('founders-circle')}
                  className="w-full py-3 px-4 rounded-lg font-bold transition-colors bg-gray-900 hover:bg-gray-800 text-amber-400 shadow-lg"
                  disabled={currentPlan === 'founders-circle'}
                >
                  {currentPlan === 'founders-circle' ? 'Current Plan' : '👑 Claim Your Spot'}
                </button>
              </div>
            )}

            {/* Regular Plans - Ordered for Launch Funnel */}
            {/* Order: Recon (Free) | Climber | Operator - creates contrast after Founder's Circle */}
            {['recon', 'climber', 'operator'].map((planId) => {
              const plan = pricingTiers[planId];
              if (!plan) return null;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              // LAUNCH MODE: Disable "Most Popular" tag during Founder's Circle launch (Oct 5-12)
              const isHighlighted = false; // Was: highlightPlan === planId || (planId === 'climber' && !highlightPlan);
              
              return (
                <div
                  key={planId}
                  className={`relative bg-gray-700 rounded-lg p-6 ${
                    isHighlighted ? 'border-2 border-blue-500 transform scale-105' : 'border border-gray-600'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <plan.icon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.identity}</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white">
                      {formatPrice(price)}
                      {price > 0 && <span className="text-lg text-gray-400"> /{billingCycle === 'annual' ? 'year' : 'month'}</span>}
                    </div>
                    {billingCycle === 'annual' && plan.savings > 0 && (
                      <div className="text-green-400 text-sm">Save {plan.savings}% annually</div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <div className="text-gray-400 text-xs">+ {plan.features.length - 4} more features</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(planId)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${getButtonStyle(planId)}`}
                    disabled={currentPlan === planId}
                  >
                    {getButtonText(planId)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guarantee */}
        <div className="border-t border-gray-700 p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2" />
            <span className="text-white font-semibold text-sm sm:text-base">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            Try any paid plan risk-free. If you're not completely satisfied, get a full refund within 30 days.
          </p>
        </div>
        
        </div>
        {/* End Scrollable Content */}
      </div>
    </div>
  );
};

export default PricingModal;
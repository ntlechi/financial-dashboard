import React from 'react';
import { X, Lock, Crown, Zap, Rocket, ArrowRight } from 'lucide-react';

const UpgradePrompt = ({ 
  onClose, 
  featureName, 
  requiredPlan, 
  onUpgrade, 
  currentPlan = 'free',
  isFoundersCircleAvailable = false 
}) => {
  const planDetails = {
    'climber': {
      name: 'Climber Plan',
      price: '$7.99 USD /month',
      icon: Zap,
      color: 'from-blue-600 to-blue-700',
      features: [
        'Full Advanced Dashboard',
        'All Financial Calculators',
        'Advanced Analytics & Reports',
        'Goal Tracking & Projections'
      ]
    },
    'operator': {
      name: 'Operator Plan',
      price: '$14.99 USD /month',
      icon: Rocket,
      color: 'from-purple-600 to-purple-700',
      features: [
        'Side Hustle Management',
        'Investment Portfolio Tracking',
        'Travel Mode & Multi-Currency',
        'Advanced Business Analytics'
      ]
    }
  };

  const foundersCircle = {
    name: "Founder's Circle",
    price: '$7.49 USD /month',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    features: [
      'Full Operator Plan Access',
      'Lifetime Price Lock',
      'Exclusive Founder Badge',
      'Early Access to New Features'
    ]
  };

  const getFeatureDescription = (feature) => {
    const descriptions = {
      'Side Hustle Management': 'Track your business income, expenses, and profit margins. Calculate quarterly taxes and see how your side hustle accelerates your path to financial freedom.',
      'Investment Portfolio': 'Monitor your investments, track dividends, analyze performance, and project your portfolio growth with advanced analytics.',
      'Travel Mode': 'Multi-currency support and location-based financial tracking for digital nomads and frequent travelers.',
      'Advanced Dashboard': 'Unlock all dashboard cards including detailed analytics, projections, and comprehensive financial insights.',
      'Advanced Analytics': 'Deep dive into your financial patterns with detailed reports, trends analysis, and predictive modeling.'
    };
    return descriptions[feature] || `Unlock ${feature} to take your financial management to the next level.`;
  };

  const plan = planDetails[requiredPlan];
  const PlanIcon = plan?.icon || Lock;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="bg-gray-700 p-3 rounded-lg mr-4">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Unlock {featureName}</h2>
              <p className="text-gray-400">Upgrade to access this powerful feature</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Feature Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Why You'll Love {featureName}</h3>
            <p className="text-gray-300 leading-relaxed">
              {getFeatureDescription(featureName)}
            </p>
          </div>

          {/* Founder's Circle Offer (if available) */}
          {isFoundersCircleAvailable && (
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Crown className="w-6 h-6 text-amber-400 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-amber-400">🔥 Limited Launch Offer</h4>
                  <p className="text-amber-200 text-sm">Get full Operator access for just $7.49 USD /month</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {foundersCircle.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-amber-100">
                    <ArrowRight className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onUpgrade('founders-circle')}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Claim Founder's Spot - {foundersCircle.price}
              </button>
            </div>
          )}

          {/* Required Plan */}
          {plan && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <PlanIcon className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-gray-400 text-sm">Required for {featureName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <ArrowRight className="w-3 h-3 text-blue-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onUpgrade(requiredPlan)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Upgrade to {plan.name} - {plan.price}
              </button>
            </div>
          )}

          {/* Alternative: View All Plans */}
          <div className="text-center">
            <button
              onClick={() => onUpgrade('view-all')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All Plans & Pricing →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 text-center">
          <p className="text-gray-400 text-sm">
            ✅ 30-Day Money-Back Guarantee • Cancel Anytime • Instant Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
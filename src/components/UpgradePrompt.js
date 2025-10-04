import React from 'react';
import { Crown, ArrowRight, X, Check, Zap } from 'lucide-react';
import { pricingPlans } from '../pricing';
import { getUpgradePrompt, getPlanDisplayInfo } from '../utils/featureAccess';

const UpgradePrompt = ({ feature, currentPlan, onClose, onUpgrade }) => {
  const promptInfo = getUpgradePrompt(feature, currentPlan);
  const requiredPlan = pricingPlans[promptInfo.requiredPlan];
  const planInfo = getPlanDisplayInfo(promptInfo.requiredPlan);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Upgrade Required</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Info */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-white mb-2">
            {promptInfo.title}
          </h4>
          <p className="text-gray-400 mb-4">
            {promptInfo.message}
          </p>

          {/* Benefits */}
          <div className="space-y-2">
            {promptInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Plan */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="font-semibold text-white">{requiredPlan.name}</h5>
              <p className="text-sm text-gray-400">{planInfo.identity}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${requiredPlan.price}
              </div>
              <div className="text-sm text-gray-400">/month</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">{requiredPlan.description}</p>
        </div>

        {/* Founder's Circle CTA (if available) */}
        {pricingPlans.founder && (
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm">LIMITED TIME OFFER</span>
            </div>
            <p className="text-white text-sm mb-2">
              Get <strong>full Operator access</strong> for just <strong>${pricingPlans.founder.price}/month</strong>
            </p>
            <p className="text-yellow-300 text-xs">
              🔥 Only available to first 100 members • Price locked for life
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => onUpgrade('founder')}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Crown className="w-4 h-4" />
            Claim Founder's Circle
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onUpgrade(promptInfo.requiredPlan)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            Upgrade to {requiredPlan.name}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-white py-2 text-sm"
          >
            Maybe later
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-center text-xs text-gray-500">
            🔒 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
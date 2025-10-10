import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { hasFeatureAccess } from '../utils/featureUnlocks';

export default function FeatureGate({ 
  feature, 
  currentRank, 
  children, 
  onUpgrade,
  upgradeMessage = "Upgrade to unlock this feature"
}) {
  const hasAccess = hasFeatureAccess(currentRank, feature);

  if (hasAccess) {
    return children;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Overlay with upgrade prompt */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Feature Locked</h3>
          <p className="text-gray-300 text-sm mb-4">
            {upgradeMessage}
          </p>
          
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Crown className="w-4 h-4" />
              <span>Available at higher rank</span>
            </div>
          </div>
          
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            View Requirements
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

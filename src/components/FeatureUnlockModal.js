import React, { useEffect, useState } from 'react';
import { X, Lock, Unlock, Star, Crown, Zap } from 'lucide-react';
import { RANK_FEATURE_UNLOCKS, getNextRankPreview } from '../utils/featureUnlocks';

const FEATURE_ICONS = {
  'basic_budget_tracking': '📊',
  'advanced_budget_categories': '📈',
  'custom_goal_templates': '🎯',
  'debt_payoff_strategies': '💳',
  'investment_portfolio': '📈',
  'advanced_analytics': '📊',
  'freedom_journal': '📓',
  'side_hustle_tracking': '💼',
  'export_reports': '📄',
  'tax_optimization': '🧾',
  'retirement_calculator': '🏖️',
  'ai_financial_insights': '🤖',
  'personal_advisor_chat': '💬',
  'lifetime_premium': '👑'
};

export default function FeatureUnlockModal({ 
  isOpen, 
  onClose, 
  currentRank, 
  unlockedFeatures = [],
  unlockType = 'rank' // 'rank' or 'milestone'
}) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false);
      setShowContent(false);
      
      setTimeout(() => setShowAnimation(true), 100);
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRankData = RANK_FEATURE_UNLOCKS[currentRank];
  const nextRankPreview = getNextRankPreview(currentRank);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="flex items-center justify-center mb-4">
              {unlockType === 'rank' ? (
                <Crown className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <Star className="w-12 h-12 text-white animate-pulse" />
              )}
              <Zap className="w-8 h-8 text-yellow-300 ml-2 animate-bounce" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {unlockType === 'rank' ? 'RANK UNLOCKED!' : 'MILESTONE ACHIEVED!'}
            </h1>
            <p className="text-purple-100 text-lg">
              {unlockType === 'rank' ? 'New Features Available' : 'Special Rewards Unlocked'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`transition-all duration-1000 delay-200 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Current Rank Features */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-400" />
                Your {currentRank} Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRankData?.features.map((feature, index) => (
                  <div key={feature} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{FEATURE_ICONS[feature] || '✨'}</span>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-green-400 text-xs">Unlocked</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Rank Preview */}
            {nextRankPreview && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Next Rank: {nextRankPreview.rank}
                </h2>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <p className="text-amber-200 text-sm mb-3">{nextRankPreview.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {nextRankPreview.features.slice(0, 4).map((feature, index) => (
                      <div key={feature} className="bg-gray-800/50 border border-gray-600 rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{FEATURE_ICONS[feature] || '🔒'}</span>
                          <span className="text-gray-300 text-xs">
                            {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {nextRankPreview.features.length > 4 && (
                    <div className="text-amber-400 text-xs mt-2">
                      +{nextRankPreview.features.length - 4} more features
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Continue Your Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



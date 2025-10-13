import React, { useEffect, useState } from 'react';
import { X, Trophy, Star, Target, TrendingUp } from 'lucide-react';

const ACHIEVEMENT_ICONS = {
  'debt_paid': <TrendingDown className="w-6 h-6" />,
  'goal_milestone': <Target className="w-6 h-6" />,
  'savings_milestone': <TrendingUp className="w-6 h-6" />,
  'xp_milestone': <Star className="w-6 h-6" />,
  'default': <Trophy className="w-6 h-6" />
};

export default function AchievementNotification({ 
  isOpen, 
  onClose, 
  achievement 
}) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false);
      setShowContent(false);
      
      // Staggered animation
      setTimeout(() => setShowAnimation(true), 100);
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen]);

  if (!isOpen || !achievement) return null;

  const icon = ACHIEVEMENT_ICONS[achievement.type] || ACHIEVEMENT_ICONS.default;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`transform transition-all duration-500 ${
        showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-xl border border-green-500/50 overflow-hidden">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-white animate-pulse">
                  {icon}
                </div>
                <span className="text-white font-bold text-sm">ACHIEVEMENT UNLOCKED!</span>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className={`transition-all duration-500 delay-200 ${
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}>
              <h3 className="text-white font-semibold text-lg mb-1">
                {achievement.title}
              </h3>
              <p className="text-green-100 text-sm mb-3">
                {achievement.description}
              </p>
              
              {achievement.xpReward && (
                <div className="bg-green-700/50 rounded-lg p-2 mb-3">
                  <div className="flex items-center gap-2 text-green-200">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-semibold">+{achievement.xpReward} XP</span>
                  </div>
                </div>
              )}
              
              <div className="text-green-200 text-xs">
                {achievement.timestamp && new Date(achievement.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



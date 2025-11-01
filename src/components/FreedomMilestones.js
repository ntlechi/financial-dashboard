import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FreedomMilestones({ freedomRatio, unlockedMilestones = [], onMilestoneUnlock }) {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState(null);

  // Milestone definitions
  const milestones = [
    { id: 'MILESTONE_10', threshold: 10, titleKey: 'freedomMilestones.basecampSecured', icon: '🏕️', descriptionKey: 'freedomMilestones.reach10' },
    { id: 'MILESTONE_25', threshold: 25, titleKey: 'freedomMilestones.firstTrailOpened', icon: '🗺️', descriptionKey: 'freedomMilestones.reach25' },
    { id: 'MILESTONE_50', threshold: 50, titleKey: 'freedomMilestones.halfwayToSummit', icon: '🏔️', descriptionKey: 'freedomMilestones.reach50' },
    { id: 'MILESTONE_75', threshold: 75, titleKey: 'freedomMilestones.summitInSight', icon: '🔭', descriptionKey: 'freedomMilestones.reach75' },
    { id: 'MILESTONE_100', threshold: 100, titleKey: 'freedomMilestones.operatorElite', icon: '👑', descriptionKey: 'freedomMilestones.reach100' }
  ];

  // Check for new milestone unlocks
  useEffect(() => {
    if (freedomRatio >= 0) {
      const newMilestones = milestones.filter(milestone => 
        freedomRatio >= milestone.threshold && 
        !unlockedMilestones.includes(milestone.id)
      );

      if (newMilestones.length > 0) {
        // Trigger celebration for the highest unlocked milestone
        const latestMilestone = newMilestones[newMilestones.length - 1];
        setCelebratingMilestone(latestMilestone);
        setShowCelebration(true);
        
        // Notify parent component
        if (onMilestoneUnlock) {
          onMilestoneUnlock(newMilestones);
        }

        // Hide celebration after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
          setCelebratingMilestone(null);
        }, 3000);
      }
    }
  }, [freedomRatio, unlockedMilestones]);

  return (
    <div className="relative">
      {/* Celebration Animation */}
      {showCelebration && celebratingMilestone && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 shadow-2xl">
                <div className="text-4xl">{celebratingMilestone.icon}</div>
              </div>
            </div>
          </div>
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('freedomMilestones.title')}</h3>
            <p className="text-gray-400 text-sm">{t('freedomMilestones.subtitle')}</p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{t('freedomMilestones.freedomProgress')}</span>
            <span>{Math.round(freedomRatio)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(freedomRatio, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{t('freedomMilestones.basecamp')}</span>
            <span>{t('freedomMilestones.summit')}</span>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="grid grid-cols-5 gap-3">
          {milestones.map((milestone, index) => {
            const isUnlocked = unlockedMilestones.includes(milestone.id);
            const isAchieved = freedomRatio >= milestone.threshold;
            const isCurrent = freedomRatio >= milestone.threshold && !unlockedMilestones.includes(milestone.id);
            
            return (
              <div
                key={milestone.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isUnlocked 
                    ? 'transform hover:scale-110' 
                    : isAchieved 
                      ? 'animate-pulse' 
                      : 'opacity-50'
                }`}
                title={`${t(milestone.titleKey)} - ${t(milestone.descriptionKey)}`}
              >
                {/* Badge Container */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30' 
                    : isAchieved 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' 
                      : 'bg-gray-700 border-2 border-gray-600'
                  }
                `}>
                  {isUnlocked ? (
                    <div className="text-white drop-shadow-lg">{milestone.icon}</div>
                  ) : isAchieved ? (
                    <div className="text-white drop-shadow-lg">{milestone.icon}</div>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Progress Indicator */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap className="w-2 h-2 text-yellow-900" />
                  </div>
                )}

                {/* Badge Title */}
                <div className="text-center mt-2">
                  <div className={`text-xs font-semibold ${
                    isUnlocked ? 'text-amber-400' : isAchieved ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {t(milestone.titleKey)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {milestone.threshold}%
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-amber-500/50 whitespace-nowrap">
                    <div className="font-semibold text-amber-300">{t(milestone.titleKey)}</div>
                    <div className="text-gray-400">{t(milestone.descriptionKey)}</div>
                    {isUnlocked && (
                      <div className="text-green-400 text-xs mt-1">✓ {t('freedomMilestones.unlocked')}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement Summary */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-300">{t('freedomMilestones.milestonesUnlocked')}</div>
              <div className="text-lg font-bold text-amber-400">
                {unlockedMilestones.length} / {milestones.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">{t('freedomMilestones.nextMilestone')}</div>
              <div className="text-sm font-semibold text-white">
                {t(milestones.find(m => !unlockedMilestones.includes(m.id))?.titleKey || 'freedomMilestones.allComplete')}
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Toast */}
        {showCelebration && celebratingMilestone && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{t('freedomMilestones.milestoneUnlockedToast')}</span>
            </div>
            <div className="text-sm opacity-90">
              {t(celebratingMilestone.titleKey)} {celebratingMilestone.icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




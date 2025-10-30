import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getRankFromXp, RANKS } from '../utils/xp';
import { SUBSCRIPTION_TIERS } from '../utils/subscriptionUtils';
import { Crown, Lock, Star, Target, Shield, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RANK_INSIGNIA = {
  'Recruit': {
    icon: '^',
    material: 'bronze',
    color: '#CD7F32',
    description: 'The first stripe. A symbol of starting the climb.',
    requirements: 'Start your financial journey'
  },
  'Climber': {
    icon: '⛏️',
    material: 'bronze', 
    color: '#CD7F32',
    description: 'Signifies the user now has the tools to make a serious ascent.',
    requirements: '1,000 XP • Log transactions, create budgets'
  },
  'Operator': {
    icon: '🧭',
    material: 'silver',
    color: '#C0C0C0', 
    description: 'The user is now a navigator, an operator in control of their own mission.',
    requirements: '5,000 XP • Manage side hustles, track investments'
  },
  'Pathfinder': {
    icon: '🗺️',
    material: 'silver',
    color: '#C0C0C0',
    description: 'The user is not just navigating; they are charting new territory.',
    requirements: '15,000 XP • Advanced financial operations'
  },
  'Vanguard': {
    icon: '🦅',
    material: 'gold',
    color: '#FFD700',
    description: 'Represents leadership and being at the forefront of the movement.',
    requirements: '30,000 XP • Master-level financial control'
  },
  'Free Agent': {
    icon: '🕊️',
    material: 'gold',
    color: '#FFD700',
    description: 'The ultimate symbol of freedom and having earned one\'s time back.',
    requirements: '60,000 XP • Financial independence achieved'
  }
};

export default function RankMedalsPage({ userId, userPlan, onUpgrade }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      try {
        // FIX: Use userProfiles collection with userId as document ID (2 segments)
        const snap = await getDoc(doc(db, 'userProfiles', userId));
        setProfile(snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      } catch (e) {
        setProfile({ xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  const { current, next, progress } = getRankFromXp(profile.xpPoints || 0);
  const canViewFullLadder = userPlan === SUBSCRIPTION_TIERS.OPERATOR || userPlan === SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE;
  const visibleRanks = canViewFullLadder ? RANKS : RANKS.slice(0, 3); // Show only first 3 for free users

  return (
    <div className="space-y-8">
      {/* Current Status Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-amber-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('ranks.title')}</h1>
            <p className="text-gray-400">{t('ranks.subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{current.name}</div>
            <div className="text-sm text-gray-400">{t('ranks.level')} {current.level}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{t('ranks.progressTo')} {next?.name || t('ranks.maxRank')}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{profile.xpPoints || 0} XP</div>
            <div className="text-xs text-gray-400">{t('ranks.totalEarned')}</div>
          </div>
        </div>
      </div>

      {/* Rank Ladder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRanks.map((rank, index) => {
          const insignia = RANK_INSIGNIA[rank.name];
          const isCurrentRank = rank.name === current.name;
          const isUnlocked = rank.xpRequired <= (profile.xpPoints || 0);
          const isLocked = !isUnlocked && !canViewFullLadder && index >= 2;

          return (
            <div 
              key={rank.name}
              className={`relative rounded-xl p-6 border-2 transition-all ${
                isCurrentRank 
                  ? 'bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500 shadow-lg shadow-amber-500/20' 
                  : isUnlocked
                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600 hover:border-gray-500'
                    : 'bg-gradient-to-br from-gray-900/30 to-gray-800/30 border-gray-700'
              }`}
            >
              {/* Lock Overlay for Premium Ranks */}
              {isLocked && (
                <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <div className="text-gray-400 font-semibold mb-2">Operator+ Required</div>
                    <button
                      onClick={onUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                      Upgrade to View
                    </button>
                  </div>
                </div>
              )}

              {/* Rank Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold ${
                      isCurrentRank ? 'border-amber-500' : isUnlocked ? 'border-gray-500' : 'border-gray-600'
                    }`}
                    style={{ 
                      backgroundColor: isUnlocked ? `${insignia.color}20` : '#1f2937',
                      borderColor: isUnlocked ? insignia.color : '#4b5563'
                    }}
                  >
                    {isUnlocked ? insignia.icon : '🔒'}
                  </div>
                  <div>
                    <div className={`font-bold ${isCurrentRank ? 'text-amber-400' : isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {rank.name}
                    </div>
                    <div className="text-xs text-gray-400">Level {rank.level}</div>
                  </div>
                </div>
                
                {isCurrentRank && (
                  <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    CURRENT
                  </div>
                )}
              </div>

              {/* Rank Details */}
              <div className="space-y-3">
                <div className="text-sm text-gray-300">
                  {insignia.requirements}
                </div>
                
                <div className="text-xs text-gray-400 italic">
                  "{insignia.description}"
                </div>

                {/* XP Requirement */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">XP Required:</span>
                  <span className={`text-sm font-semibold ${isUnlocked ? 'text-green-400' : 'text-gray-500'}`}>
                    {rank.xpRequired.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Badges Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Achievement Badges
        </h2>
        <p className="text-gray-400 mb-6">Earn special badges for major financial milestones</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Sample Badges - These would be dynamic based on user achievements */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-center border border-gray-600">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">First Goal</div>
            <div className="text-xs text-gray-400">Create your first financial goal</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center border border-gray-600">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Emergency Fund</div>
            <div className="text-xs text-gray-400">Build 3-month emergency fund</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center border border-gray-600">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Investment Starter</div>
            <div className="text-xs text-gray-400">Make your first investment</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center border border-gray-600">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Debt Free</div>
            <div className="text-xs text-gray-400">Eliminate all debt</div>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!canViewFullLadder && (
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-6 border border-purple-500/30">
          <div className="text-center">
            <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Unlock the Full Progression Ladder</h3>
            <p className="text-gray-300 mb-6">
              Upgrade to Operator or Founder's Circle to see all ranks, track achievements, and access advanced gamification features.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


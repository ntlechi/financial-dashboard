// 🎯 FIRST CLIMB PROTOCOL - Week 1 Guided Missions
// This component guides new users through their first week with 4 structured missions
// Each mission teaches a core financial habit and awards XP

import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Target, TrendingUp, BookOpen, Award, X, ArrowRight, Zap } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function FirstClimbProtocol({ userId, data, onComplete, onClose, awardXp }) {
  const [missions, setMissions] = useState({
    mission1: { completed: false, progress: 0, target: 10 },
    mission2: { completed: false, progress: 0, target: 3 },
    mission3: { completed: false, progress: 0, target: 1 },
    mission4: { completed: false, progress: 0, target: 1 }
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedMission, setExpandedMission] = useState('mission1');

  // Load mission progress from Firebase
  useEffect(() => {
    loadMissionProgress();
  }, [userId]);

  // Update progress based on user data
  useEffect(() => {
    if (data) {
      updateMissionProgress();
    }
  }, [data]);

  const loadMissionProgress = async () => {
    if (!userId) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profile = profileSnap.data();
        if (profile.missions?.firstClimb) {
          setMissions(profile.missions.firstClimb);
        }
      }
    } catch (error) {
      console.error('Error loading mission progress:', error);
    }
  };

  const updateMissionProgress = () => {
    const transactionCount = (data.transactions || []).length;
    const budgetCategories = Object.keys(data.budgetSettings?.categories || {}).length;
    const hasReviewed = data.firstWeekReview || false;
    const hasFutureLetter = data.futureSelfLetter || false;

    setMissions(prev => ({
      mission1: {
        ...prev.mission1,
        progress: Math.min(transactionCount, 10),
        completed: transactionCount >= 10
      },
      mission2: {
        ...prev.mission2,
        progress: Math.min(budgetCategories, 3),
        completed: budgetCategories >= 3
      },
      mission3: {
        ...prev.mission3,
        progress: hasReviewed ? 1 : 0,
        completed: hasReviewed
      },
      mission4: {
        ...prev.mission4,
        progress: hasFutureLetter ? 1 : 0,
        completed: hasFutureLetter
      }
    }));

    // Check if all missions complete
    if (transactionCount >= 10 && budgetCategories >= 3 && hasReviewed && hasFutureLetter) {
      if (!showCelebration) {
        handleProtocolComplete();
      }
    }
  };

  const saveMissionProgress = async (updatedMissions) => {
    if (!userId) return;
    
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      await setDoc(profileRef, {
        missions: {
          firstClimb: updatedMissions
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error saving mission progress:', error);
    }
  };

  const handleProtocolComplete = async () => {
    setShowCelebration(true);
    
    // Award 100 XP for completing the protocol
    if (awardXp) {
      try {
        await awardXp(db, userId, 100);
      } catch (error) {
        console.error('Error awarding XP:', error);
      }
    }

    // Mark protocol as completed
    const completedMissions = {
      mission1: { ...missions.mission1, completed: true },
      mission2: { ...missions.mission2, completed: true },
      mission3: { ...missions.mission3, completed: true },
      mission4: { ...missions.mission4, completed: true }
    };
    
    await saveMissionProgress(completedMissions);
    
    if (onComplete) {
      onComplete();
    }
  };

  const missionData = [
    {
      id: 'mission1',
      number: 1,
      title: 'Log Your First 10 Transactions',
      icon: <TrendingUp className="w-6 h-6" />,
      xp: 25,
      description: 'The foundation of financial awareness is knowing where your money goes.',
      education: [
        '📊 **Why Track?** You can\'t improve what you don\'t measure. Studies show that people who track their spending save 15-20% more.',
        '🎯 **The Goal:** Log at least 10 real transactions from the past 3 days. Include that coffee, lunch, gas - everything!',
        '💡 **Pro Tip:** Use the Quick Expense button for speed, or add detailed transactions in the Transaction tab.'
      ],
      howTo: [
        '1. Click the Transaction tab',
        '2. Click "Add Transaction"',
        '3. Enter description, amount, and date',
        '4. Repeat 10 times with real expenses'
      ],
      stats: missions.mission1
    },
    {
      id: 'mission2',
      number: 2,
      title: 'Set Up Your Top 3 Budget Categories',
      icon: <Target className="w-6 h-6" />,
      xp: 25,
      description: 'Focus is power. Start with just 3 categories where you spend the most.',
      education: [
        '🎯 **Why Only 3?** Overwhelm kills progress. Start simple, expand later.',
        '📋 **Common Top 3:** Most people choose: Housing, Food, Transportation. What are yours?',
        '💰 **The 50/30/20 Rule:** Needs (50%), Wants (30%), Savings (20%). Start there, adjust as you learn.'
      ],
      howTo: [
        '1. Go to Budget tab',
        '2. Click "Add Category"',
        '3. Choose your biggest expense area',
        '4. Set a realistic monthly limit',
        '5. Repeat for 2 more categories'
      ],
      stats: missions.mission2
    },
    {
      id: 'mission3',
      number: 3,
      title: 'Review Your First Weekly Summary',
      icon: <BookOpen className="w-6 h-6" />,
      xp: 25,
      description: 'Reflection is where learning happens. Take 5 minutes to review your week.',
      education: [
        '🔍 **What To Look For:**',
        '   • Where did most of your money go?',
        '   • Any surprises or "hidden" expenses?',
        '   • What can you optimize next week?',
        '📝 **Weekly Reviews:** Top performers review weekly. It takes 5 minutes and saves hundreds.',
        '🎯 **Action Step:** After reviewing, write one insight in Field Notes about what you learned.'
      ],
      howTo: [
        '1. Go to Dashboard',
        '2. Look at Cash Flow card',
        '3. Check Monthly Expenses breakdown',
        '4. Go to Field Notes tab',
        '5. Write one insight about your spending'
      ],
      stats: missions.mission3
    },
    {
      id: 'mission4',
      number: 4,
      title: 'Write Your "Future Self" Letter',
      icon: <Award className="w-6 h-6" />,
      xp: 25,
      description: 'Connect today\'s actions to tomorrow\'s dreams. Why are you doing this?',
      education: [
        '💭 **The Power of Why:** When you know WHY you want financial freedom, the HOW becomes easier.',
        '📜 **Your Letter:** Write to yourself 1 year from now. What do you want to achieve? How will you feel?',
        '🎯 **Example Prompts:**',
        '   • "In one year, I want to have..."',
        '   • "Financial freedom means..."',
        '   • "The biggest change I want to make is..."',
        '💎 **Keep It Real:** No judgment. This is YOUR journey. Dream big, start small.'
      ],
      howTo: [
        '1. Go to Field Notes tab',
        '2. Click "Add Note"',
        '3. Start with: "Dear Future Me,"',
        '4. Write 3-5 sentences about your goals',
        '5. Save it - you\'ll revisit this!'
      ],
      stats: missions.mission4
    }
  ];

  const completedCount = Object.values(missions).filter(m => m.completed).length;
  const totalXP = completedCount * 25;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl w-full max-w-4xl border border-amber-500/30 shadow-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-amber-500/30">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-amber-400" />
              🎯 The First Climb Protocol
            </h2>
            <p className="text-gray-300 mt-2">
              Your guided journey to financial awareness - Week 1 of 52
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Overview */}
        <div className="p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-b border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Protocol Progress</div>
              <div className="text-2xl font-bold text-white">{completedCount}/4 Missions Complete</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">XP Earned</div>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                {totalXP}/100 XP
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Missions */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {missionData.map((mission) => (
            <div
              key={mission.id}
              className={`rounded-lg border ${
                mission.stats.completed
                  ? 'bg-green-900/20 border-green-600/40'
                  : 'bg-gray-800/50 border-gray-600/40'
              } transition-all`}
            >
              {/* Mission Header */}
              <div
                onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    mission.stats.completed
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-amber-600/20 text-amber-400'
                  }`}>
                    {mission.stats.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      mission.icon
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Mission {mission.number}</div>
                        <h3 className="text-lg font-bold text-white">{mission.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{mission.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-400">+{mission.xp} XP</div>
                        {mission.stats.completed && (
                          <div className="text-xs text-green-400 mt-1">✓ Complete</div>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    {!mission.stats.completed && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{mission.stats.progress}/{mission.stats.target}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                            style={{ width: `${(mission.stats.progress / mission.stats.target) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMission === mission.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-700/50 pt-4">
                  {/* Education */}
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Why This Matters
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      {mission.education.map((edu, idx) => (
                        <p key={idx} className="leading-relaxed">{edu}</p>
                      ))}
                    </div>
                  </div>

                  {/* How To */}
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      How To Complete
                    </h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      {mission.howTo.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!mission.stats.completed && (
                    <div className="pt-2">
                      <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-600/30">
                        <p className="text-xs text-amber-300 mb-2">
                          💡 <strong>Next Step:</strong> {mission.howTo[0]}
                        </p>
                        <button
                          onClick={onClose}
                          className="text-xs text-white hover:text-amber-300 transition-colors flex items-center gap-1"
                        >
                          Take me there <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              💡 <strong>Pro Tip:</strong> Complete one mission per day. By the end of the week, you'll have built 4 powerful financial habits!
            </p>
            <p className="text-xs text-gray-500">
              The First Climb Protocol is designed to take you from financially confused to financially aware in just 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 rounded-xl max-w-lg border-4 border-amber-500 shadow-2xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Congratulations!
            </h2>
            <p className="text-xl text-amber-200 mb-6">
              You've completed The First Climb Protocol!
            </p>
            
            <div className="bg-black/30 rounded-lg p-6 mb-6">
              <div className="text-sm text-amber-300 mb-4">You've earned:</div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  100 XP
                </div>
                <div className="flex items-center justify-center gap-3 text-lg text-amber-300">
                  <Award className="w-6 h-6" />
                  "First Climber" Badge
                </div>
                <div className="text-sm text-gray-300 mt-4">
                  🎯 You've built 4 foundational financial habits<br/>
                  📈 You're now tracking your money like a pro<br/>
                  💪 You're ready for the next ascent!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCelebration(false);
                if (onClose) onClose();
              }}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg text-lg"
            >
              Continue Your Journey! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

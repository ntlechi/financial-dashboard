import React, { useState, useEffect } from 'react';
import { Target, Clock, Star, CheckCircle, Calendar } from 'lucide-react';
import { getAvailableChallenges, awardChallengeXp } from '../utils/challenges';
import { awardXp } from '../utils/xp';
import { db } from '../firebase';

export default function ChallengesPanel({ userId, onXpAwarded }) {
  const [challenges, setChallenges] = useState({ daily: [], weekly: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const availableChallenges = getAvailableChallenges(userId);
      setChallenges(availableChallenges);
    }
  }, [userId]);

  const handleChallengeComplete = async (challenge) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await awardChallengeXp(db, userId, challenge);
      if (result.success) {
        // Award XP through the main system
        const xpResult = await awardXp(db, userId, result.xpReward);
        if (onXpAwarded) {
          onXpAwarded(xpResult);
        }
        
        // Refresh challenges
        const updatedChallenges = getAvailableChallenges(userId);
        setChallenges(updatedChallenges);
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAvailableChallenges = challenges.daily.length + challenges.weekly.length;

  if (totalAvailableChallenges === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">All Challenges Complete!</h3>
          <p className="text-gray-400 text-sm">
            Great work! Check back tomorrow for new challenges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Daily & Weekly Challenges</h3>
          <p className="text-gray-400 text-sm">Complete challenges to earn bonus XP</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Daily Challenges */}
        {challenges.daily.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Daily Challenges</h4>
            </div>
            <div className="space-y-3">
              {challenges.daily.map((challenge) => (
                <div key={challenge.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="text-white font-semibold mb-1">{challenge.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-semibold">+{challenge.xpReward} XP</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChallengeComplete(challenge)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Challenges */}
        {challenges.weekly.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-purple-400" />
              <h4 className="text-lg font-semibold text-white">Weekly Challenges</h4>
            </div>
            <div className="space-y-3">
              {challenges.weekly.map((challenge) => (
                <div key={challenge.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="text-white font-semibold mb-1">{challenge.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-semibold">+{challenge.xpReward} XP</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChallengeComplete(challenge)}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



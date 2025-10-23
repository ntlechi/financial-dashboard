import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, CheckCircle, Circle, Award, ArrowRight, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TheTrail({ userId, awardXp, setXpRefreshTrigger }) {
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState(new Set());
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrill, setShowDrill] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch missions from Firestore
  useEffect(() => {
    fetchMissions();
    fetchUserProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchMissions = async () => {
    try {
      const missionsRef = collection(db, 'missions');
      const snapshot = await getDocs(missionsRef);
      const missionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by order field
      missionsData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setMissions(missionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const userProgressRef = doc(db, 'userProfiles', userId);
      const userDoc = await getDoc(userProgressRef);
      
      if (userDoc.exists()) {
        const completedIds = userDoc.data().completedMissions || [];
        setCompletedMissions(new Set(completedIds));
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const markMissionComplete = async (missionId) => {
    try {
      const userProgressRef = doc(db, 'userProfiles', userId);
      const userDoc = await getDoc(userProgressRef);
      
      const currentCompleted = userDoc.exists() 
        ? (userDoc.data().completedMissions || [])
        : [];
      
      if (!currentCompleted.includes(missionId)) {
        const updated = [...currentCompleted, missionId];
        
        await updateDoc(userProgressRef, {
          completedMissions: updated
        });
        
        setCompletedMissions(new Set(updated));
        
        // 🎮 Award +25 XP for completing mission
        if (awardXp && setXpRefreshTrigger) {
          await awardXp(db, userId, 25);
          setXpRefreshTrigger(prev => prev + 1);
        }
        
        showNotification('🎯 Mission Complete! +25 XP', 'success');
        checkForBadges(updated.length);
      }
    } catch (error) {
      console.error('Error marking mission complete:', error);
      showNotification('Error saving progress', 'error');
    }
  };

  const checkForBadges = async (completedCount) => {
    const badges = {
      5: { name: 'Scout Badge', xp: 50 },
      15: { name: 'Pathfinder Badge', xp: 100 },
      30: { name: 'Guide Badge', xp: 150 }
    };

    if (badges[completedCount]) {
      const badge = badges[completedCount];
      
      // Award bonus XP for badge
      if (awardXp && setXpRefreshTrigger) {
        await awardXp(db, userId, badge.xp);
        setXpRefreshTrigger(prev => prev + 1);
      }
      
      showNotification(`🏆 ${badge.name} Unlocked! +${badge.xp} XP`, 'success');
    }
  };

  const handleDrillAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === selectedMission.correctAnswerIndex;
    setDrillCompleted(true);
    
    if (isCorrect) {
      // 🎮 Award +50 XP for correct drill answer
      if (awardXp && setXpRefreshTrigger) {
        await awardXp(db, userId, 50);
        setXpRefreshTrigger(prev => prev + 1);
      }
      showNotification('✅ Correct! +50 XP', 'success');
    } else {
      showNotification('📚 Keep learning!', 'info');
    }
  };

  const handleNavigateToCTA = () => {
    // Close mission view
    setSelectedMission(null);
    setShowDrill(false);
    setDrillCompleted(false);
    setSelectedAnswer(null);
    
    // Navigate to CTA link (This will be handled by parent App.js)
    if (selectedMission.ctaLink && window.handleInternalNavigation) {
      window.handleInternalNavigation(selectedMission.ctaLink);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Financial Freedom': 'text-green-400 bg-green-900/20 border-green-600/30',
      'Becoming Great': 'text-purple-400 bg-purple-900/20 border-purple-600/30',
      'Entrepreneurship': 'text-amber-400 bg-amber-900/20 border-amber-600/30',
      'Essential Survival': 'text-red-400 bg-red-900/20 border-red-600/30',
      'Traveler\'s Wisdom': 'text-blue-400 bg-blue-900/20 border-blue-600/30'
    };
    return colors[category] || 'text-gray-400 bg-gray-900/20 border-gray-600/30';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading The Trail...</p>
      </div>
    );
  }

  if (selectedMission) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {notification.message}
          </div>
        )}

        {/* Mission Content */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${getCategoryColor(selectedMission.category)}`}>
                {selectedMission.category}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMission.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedMission.readTime}
                </span>
                {completedMissions.has(selectedMission.id) && (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMission(null);
                setShowDrill(false);
                setDrillCompleted(false);
                setSelectedAnswer(null);
              }}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
            >
              <ArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
          </div>

          {/* Mission Description */}
          <p className="text-gray-300 mb-6 text-lg">{selectedMission.description}</p>

          {/* Mission Content (Markdown) */}
          <div className="prose prose-invert max-w-none mb-8">
            <ReactMarkdown className="text-gray-200 leading-relaxed">
              {selectedMission.content}
            </ReactMarkdown>
          </div>

          {/* Mark Complete Button */}
          {!completedMissions.has(selectedMission.id) && !showDrill && (
            <button
              onClick={() => setShowDrill(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mb-6"
            >
              Continue to Drill →
            </button>
          )}

          {/* Drill Section */}
          {showDrill && (
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-600/30 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Knowledge Check
              </h3>
              <p className="text-gray-200 mb-4 font-semibold">{selectedMission.drillQuestion}</p>
              
              <div className="space-y-3 mb-4">
                {selectedMission.drillOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !drillCompleted && handleDrillAnswer(index)}
                    disabled={drillCompleted}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      drillCompleted
                        ? index === selectedMission.correctAnswerIndex
                          ? 'bg-green-600/20 border-green-600 text-green-200'
                          : index === selectedAnswer
                          ? 'bg-red-600/20 border-red-600 text-red-200'
                          : 'bg-gray-700/30 border-gray-600 text-gray-400'
                        : 'bg-gray-700/30 border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {drillCompleted && (
                <div>
                  <button
                    onClick={() => markMissionComplete(selectedMission.id)}
                    disabled={completedMissions.has(selectedMission.id)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
                  >
                    {completedMissions.has(selectedMission.id) ? '✓ Mission Complete' : 'Mark as Complete (+25 XP)'}
                  </button>

                  {/* CTA Button */}
                  {selectedMission.ctaText && selectedMission.ctaLink && (
                    <button
                      onClick={handleNavigateToCTA}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {selectedMission.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mission Library View
  return (
    <div>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          The Trail
        </h2>
        <p className="text-gray-300 text-lg">
          Core missions spanning Financial Freedom, Becoming Great, Entrepreneurship, Essential Survival, and Traveler's Wisdom.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            Progress: <span className="text-blue-400 font-bold">{completedMissions.size}</span> / {missions.length} missions
          </span>
          {completedMissions.size >= 5 && (
            <span className="px-3 py-1 bg-green-900/30 border border-green-600/30 text-green-400 rounded-full text-xs font-semibold">
              🏆 Scout Badge
            </span>
          )}
          {completedMissions.size >= 15 && (
            <span className="px-3 py-1 bg-purple-900/30 border border-purple-600/30 text-purple-400 rounded-full text-xs font-semibold">
              🏆 Pathfinder Badge
            </span>
          )}
          {completedMissions.size >= 30 && (
            <span className="px-3 py-1 bg-amber-900/30 border border-amber-600/30 text-amber-400 rounded-full text-xs font-semibold">
              🏆 Guide Badge
            </span>
          )}
        </div>
      </div>

      {/* Missions Grid */}
      {missions.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No missions available yet.</p>
          <p className="text-sm text-gray-500">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map((mission) => {
            const isCompleted = completedMissions.has(mission.id);
            
            return (
              <div
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className={`bg-gray-800/50 rounded-xl p-5 border cursor-pointer transition-all hover:border-blue-500/50 hover:bg-gray-800/70 ${
                  isCompleted 
                    ? 'border-green-600/30 opacity-75' 
                    : 'border-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(mission.category)}`}>
                    {mission.category}
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{mission.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{mission.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mission.readTime}
                  </span>
                  {isCompleted && <span className="text-green-400 font-semibold">Completed</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

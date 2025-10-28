// 📣 MILESTONE REVIEW CARD - "Inspire the Tribe" Mission System
// Emotionally intelligent review prompts at peak achievement moments
// Gamified with +150 XP and "The Storyteller" badge!

import React, { useState } from 'react';
import { Radio, Star, Send, X, Video, Award, Zap } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function MilestoneReviewCard({ 
  milestone,
  achievementName,
  userId,
  onSubmit,
  onDismiss,
  awardXp,
  setXpRefreshTrigger
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [story, setStory] = useState('');
  const [permission, setPermission] = useState(false);
  const [username, setUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !story.trim()) {
      alert('Please provide a rating and your story!');
      return;
    }

    setUploading(true);

    try {
      // Save review to Firestore
      const reviewData = {
        userId,
        rating,
        story: story.trim(),
        milestone,
        achievementName,
        timestamp: new Date().toISOString(),
        permissionToFeature: permission,
        username: username.trim() || 'Anonymous',
        youtubeUrl: '', // For future: users can add YouTube link on website
        featured: false,
        helpful: 0
      };

      await setDoc(doc(db, 'reviews', `${userId}_${milestone}_${Date.now()}`), reviewData);

      // Update user profile - mark milestone as completed
      await setDoc(doc(db, 'userProfiles', userId), {
        reviewMilestones: {
          [milestone]: {
            triggered: true,
            completed: true,
            timestamp: new Date().toISOString()
          }
        },
        reviewsSubmitted: 1, // Increment in real implementation
        lastReviewDate: new Date().toISOString()
      }, { merge: true });

      // 🎮 GAMIFICATION: Award +150 XP and "The Storyteller" badge!
      if (awardXp && setXpRefreshTrigger) {
        try {
          await awardXp(db, userId, 150);
          setXpRefreshTrigger(prev => prev + 1);
          
          // Award "The Storyteller" badge (first review only)
          await setDoc(doc(db, 'userProfiles', userId), {
            badges: {
              storyteller: {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                name: 'The Storyteller',
                description: 'Shared your journey to inspire others'
              }
            }
          }, { merge: true });
        } catch (error) {
          console.warn('XP/Badge award failed', error);
        }
      }

      // Show success screen!
      setShowSuccess(true);

      // If 4-5 stars, can optionally deeplink to app store (for future)
      if (rating >= 4) {
        // Store that this user left a positive review
        // Can prompt for App Store review later
      }

      // Notify parent
      if (onSubmit) {
        onSubmit(reviewData);
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit dispatch. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDismiss = () => {
    // Mark as dismissed (still can trigger again later if wanted)
    if (onDismiss) {
      onDismiss(milestone);
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl max-w-2xl w-full p-12 text-center border-4 border-amber-500 shadow-2xl">
          <div className="text-8xl mb-6">📡</div>
          <h2 className="text-5xl font-bold text-white mb-6">
            DISPATCH SENT
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Your story is now in the queue to light the path for another Operator just starting their climb.
          </p>
          <div className="bg-black/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-4 text-2xl text-amber-300 mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="font-bold">+150 XP Earned</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-lg text-amber-200">
              <Award className="w-6 h-6" />
              <span>Badge Unlocked: "The Storyteller"</span>
            </div>
          </div>
          <p className="text-lg text-amber-200 mb-8">
            Thank you for leading the way.
          </p>
          <button
            onClick={() => {
              setShowSuccess(false);
              handleDismiss();
            }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Review Form Modal
  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl w-full max-w-2xl border border-amber-500/40 shadow-2xl my-8">
          <div className="flex justify-between items-center p-6 border-b border-amber-500/30">
            <h3 className="text-2xl font-bold text-white">📡 Share Your Dispatch</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Achievement Banner */}
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-600/40">
              <div className="text-sm text-amber-300 mb-1">Milestone Achieved:</div>
              <div className="text-xl font-bold text-white">{achievementName}</div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                How would you rate Kampoul?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= rating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Story Prompt */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📖 What was the biggest obstacle you overcame to reach this milestone?
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Your story will inspire someone just starting their journey..."
                className="w-full h-40 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {story.length}/500 characters
              </div>
            </div>

            {/* Permission & Username */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permission}
                  onChange={(e) => setPermission(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-600 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-300">
                  I give permission for Survive Backpacking to feature my dispatch on the Wall of Wins (website)
                </span>
              </label>

              {permission && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Name/Username for credit (optional):
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., Sarah M., @traveler_sarah"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                    maxLength={50}
                  />
                </div>
              )}
            </div>

            {/* Reward Preview */}
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
              <div className="text-sm text-green-300 mb-2 font-semibold">
                🎁 Mission Rewards:
              </div>
              <div className="space-y-1 text-sm text-green-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>+150 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>"The Storyteller" Badge (first review only!)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!rating || !story.trim() || uploading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg inline-flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Dispatch 📡
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mission Briefing Card (Compact Dashboard Card)
  return (
    <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-6 border-2 border-amber-500/60 shadow-lg animate-fadeIn mb-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">📡</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-amber-300 mb-2">
            MISSION BRIEFING: INSPIRE THE TRIBE
          </h3>
          <p className="text-gray-200 mb-4 leading-relaxed">
            Operator, you've just hit a major milestone: <strong className="text-amber-300">{achievementName}</strong>! 🎯
          </p>
          <p className="text-gray-300 mb-6 text-sm">
            Your story of this climb is a powerful tool. By sharing it, you can light the path for someone just starting their journey.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Radio className="w-5 h-5" />
              Share My Dispatch
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm"
            >
              Mission Accepted. I'll do it later.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { X, Compass, BookOpen, Sparkles } from 'lucide-react';

export default function MissionCompleteModal({ trip, onClose, onOpenJournal }) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setShowAnimation(true);
  }, []);

  const handleOpenJournal = () => {
    onOpenJournal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 rounded-2xl p-8 max-w-md w-full border border-amber-500/30 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-amber-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Compass Animation */}
        <div className="flex justify-center mb-6">
          <div className={`relative transition-all duration-1000 ${showAnimation ? 'scale-100 rotate-360' : 'scale-0'}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Compass className="w-10 h-10 text-white" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-amber-300/30 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Celebration Content */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <h2 className="text-2xl font-bold text-white">Mission Complete!</h2>
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          
          <p className="text-amber-200 mb-6">
            <strong>{trip.name}</strong> has reached its end date. Time to debrief your experience and add your final thoughts to your Freedom Journal.
          </p>

          <div className="bg-amber-800/20 rounded-lg p-4 mb-6 border border-amber-600/30">
            <p className="text-amber-100 text-sm">
              "Every expedition teaches us something new about ourselves and the world. 
              Document these lessons - they become the foundation of your next adventure."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleOpenJournal}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Add Final Thoughts
            </button>
          </div>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-300/60 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}



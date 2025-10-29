import React, { useEffect, useState } from 'react';
import { X, Award, Star, Zap } from 'lucide-react';

const RANK_INSIGNIA = {
  'Recruit': {
    icon: '^',
    material: 'bronze',
    color: '#CD7F32',
    description: 'The first stripe. A symbol of starting the climb.'
  },
  'Climber': {
    icon: '⛏️',
    material: 'bronze', 
    color: '#CD7F32',
    description: 'Signifies the user now has the tools to make a serious ascent.'
  },
  'Operator': {
    icon: '🧭',
    material: 'silver',
    color: '#C0C0C0', 
    description: 'The user is now a navigator, an operator in control of their own mission.'
  },
  'Pathfinder': {
    icon: '🗺️',
    material: 'silver',
    color: '#C0C0C0',
    description: 'The user is not just navigating; they are charting new territory.'
  },
  'Vanguard': {
    icon: '🦅',
    material: 'gold',
    color: '#FFD700',
    description: 'Represents leadership and being at the forefront of the movement.'
  },
  'Free Agent': {
    icon: '🕊️',
    material: 'gold',
    color: '#FFD700',
    description: 'The ultimate symbol of freedom and having earned one\'s time back.'
  }
};

export default function RankUpModal({ isOpen, onClose, newRank, oldRank, xpGained }) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showInsignia, setShowInsignia] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false);
      setShowInsignia(false);
      setShowText(false);
      
      // Staggered animation sequence
      setTimeout(() => setShowAnimation(true), 100);
      setTimeout(() => setShowInsignia(true), 600);
      setTimeout(() => setShowText(true), 1200);
    }
  }, [isOpen]);

  if (!isOpen || !newRank) return null;

  const insignia = RANK_INSIGNIA[newRank.name] || RANK_INSIGNIA['Recruit'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-amber-500/50 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="flex items-center justify-center mb-4">
              <Award className="w-12 h-12 text-white animate-pulse" />
              <Zap className="w-8 h-8 text-yellow-300 ml-2 animate-bounce" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">PROMOTION!</h1>
            <p className="text-amber-100 text-lg">Rank Advancement Achieved</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Insignia Display */}
          <div className={`mb-6 transition-all duration-1000 delay-500 ${showInsignia ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <div 
              className="w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center text-4xl font-bold mb-4 shadow-lg"
              style={{ 
                borderColor: insignia.color,
                backgroundColor: `${insignia.color}20`,
                boxShadow: `0 0 20px ${insignia.color}40`
              }}
            >
              {insignia.icon}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              {insignia.material} • {newRank.name}
            </div>
          </div>

          {/* Rank Details */}
          <div className={`transition-all duration-1000 delay-1000 ${showText ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-2xl font-bold text-white mb-2">
              {oldRank?.name} → {newRank.name}
            </h2>
            <p className="text-gray-300 mb-4">
              Level {oldRank?.level || 1} → Level {newRank.level}
            </p>
            
            {xpGained && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">+{xpGained} XP Earned</span>
                </div>
              </div>
            )}

            <p className="text-gray-400 text-sm italic mb-6">
              "{insignia.description}"
            </p>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Mission Status</h3>
              <p className="text-gray-300 text-sm">
                You are now a <span className="font-bold text-amber-400">{newRank.name}</span> in Kompul.
                Continue your financial operations to reach the next rank.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Continue Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




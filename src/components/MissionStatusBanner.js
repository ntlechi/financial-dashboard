import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getRankFromXp } from '../utils/xp';

const RANK_INSIGNIA = {
  'Recruit': { icon: '^', material: 'bronze', color: '#CD7F32' },
  'Climber': { icon: '⛏️', material: 'bronze', color: '#CD7F32' },
  'Operator': { icon: '🧭', material: 'silver', color: '#C0C0C0' },
  'Pathfinder': { icon: '🗺️', material: 'silver', color: '#C0C0C0' },
  'Vanguard': { icon: '🦅', material: 'gold', color: '#FFD700' },
  'Free Agent': { icon: '🕊️', material: 'gold', color: '#FFD700' }
};

export default function MissionStatusBanner({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!userId) return;
      try {
        const snap = await getDoc(doc(db, `users/${userId}/profile`));
        if (isMounted) setProfile(snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      } catch (e) {
        if (isMounted) setProfile({ xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      }
    }
    load();
    return () => { isMounted = false; };
  }, [userId]);

  if (!profile) return null;
  const { current, next, progress } = getRankFromXp(profile.xpPoints || 0);
  const currentInsignia = RANK_INSIGNIA[current.name] || RANK_INSIGNIA['Recruit'];
  const nextInsignia = next ? RANK_INSIGNIA[next.name] : null;

  return (
    <div className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-gray-800/70 to-gray-900/70 text-amber-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Current Rank with Insignia */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold shadow-lg"
            style={{ 
              borderColor: currentInsignia.color,
              backgroundColor: `${currentInsignia.color}20`,
              boxShadow: `0 0 10px ${currentInsignia.color}40`
            }}
          >
            {currentInsignia.icon}
          </div>
          <div>
            <div className="text-sm sm:text-base">
              <span className="font-semibold">Status:</span> {current.name} <span className="opacity-80">(Lvl {current.level})</span>
            </div>
            {next && (
              <div className="text-xs opacity-90">
                {progress}% to {next.name}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar with Next Rank Preview */}
        <div className="w-full sm:w-80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progress to Next Rank</span>
            {next && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Next:</span>
                <div 
                  className="w-4 h-4 rounded-full border flex items-center justify-center text-xs"
                  style={{ 
                    borderColor: nextInsignia.color,
                    backgroundColor: `${nextInsignia.color}20`
                  }}
                >
                  {nextInsignia.icon}
                </div>
              </div>
            )}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {next && (
            <div className="text-xs text-gray-400 mt-1">
              {next.xpRequired - (profile.xpPoints || 0)} XP to {next.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




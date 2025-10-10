import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getRankFromXp } from '../utils/xp';

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

  return (
    <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-gray-800/70 to-gray-900/70 text-amber-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm sm:text-base">
          <span className="font-semibold">Status:</span> {current.name} <span className="opacity-80">(Lvl {current.level})</span>
          {next && (
            <span className="ml-2 opacity-90">| {progress}% to {next.name}</span>
          )}
        </div>
        <div className="w-full sm:w-80">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-2 bg-amber-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}




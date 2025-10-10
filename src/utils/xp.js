import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Rank thresholds in cumulative XP
export const RANKS = [
  { name: 'Recruit', level: 1, xpRequired: 0 },
  { name: 'Climber', level: 2, xpRequired: 1000 },
  { name: 'Operator', level: 3, xpRequired: 5000 },
  { name: 'Pathfinder', level: 4, xpRequired: 15000 },
  { name: 'Vanguard', level: 5, xpRequired: 30000 },
  { name: 'Free Agent', level: 6, xpRequired: 60000 }
];

export function getRankFromXp(totalXp) {
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i += 1) {
    if (totalXp >= RANKS[i].xpRequired) current = RANKS[i];
    else break;
  }
  const next = RANKS.find(r => r.xpRequired > current.xpRequired) || null;
  const progress = next
    ? Math.min(100, Math.round(((totalXp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100))
    : 100;
  return { current, next, progress };
}

export async function ensureUserProfileInitialized(db, userId) {
  const profileRef = doc(db, `users/${userId}/profile`);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    const initial = { xpPoints: 0, rank: 'Recruit', rankLevel: 1, createdAt: new Date().toISOString() };
    await setDoc(profileRef, initial);
    return initial;
  }
  const data = snap.data();
  const patched = { ...data };
  let changed = false;
  if (typeof patched.xpPoints !== 'number') { patched.xpPoints = 0; changed = true; }
  if (!patched.rank) { patched.rank = 'Recruit'; changed = true; }
  if (typeof patched.rankLevel !== 'number') { patched.rankLevel = 1; changed = true; }
  if (!patched.createdAt) { patched.createdAt = new Date().toISOString(); changed = true; }
  if (changed) await updateDoc(profileRef, patched);
  return patched;
}

// Awards XP and updates rank if threshold crossed. Returns { totalXp, rankUp, newRank }
export async function awardXp(db, userId, amount) {
  if (!db || !userId || !amount) return { totalXp: 0, rankUp: false, newRank: null };
  const profileRef = doc(db, `users/${userId}/profile`);
  const snap = await getDoc(profileRef);
  const current = snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 };
  const totalXp = Math.max(0, (current.xpPoints || 0) + amount);
  const { current: currRank } = getRankFromXp(current.xpPoints || 0);
  const { current: newRank } = getRankFromXp(totalXp);
  const rankUp = newRank.level > currRank.level;
  await setDoc(profileRef, { xpPoints: totalXp, rank: newRank.name, rankLevel: newRank.level }, { merge: true });
  return { totalXp, rankUp, newRank };
}



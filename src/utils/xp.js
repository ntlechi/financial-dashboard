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
    const initial = { xpPoints: 0, rank: 'Recruit', rankLevel: 1, unlockedMilestones: [], createdAt: new Date().toISOString() };
    await setDoc(profileRef, initial);
    return initial;
  }
  const data = snap.data();
  const patched = { ...data };
  let changed = false;
  if (typeof patched.xpPoints !== 'number') { patched.xpPoints = 0; changed = true; }
  if (!patched.rank) { patched.rank = 'Recruit'; changed = true; }
  if (typeof patched.rankLevel !== 'number') { patched.rankLevel = 1; changed = true; }
  if (!Array.isArray(patched.unlockedMilestones)) { patched.unlockedMilestones = []; changed = true; }
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

// Freedom Milestones System
export const FREEDOM_MILESTONES = [
  { id: 'MILESTONE_10', threshold: 10, title: 'Basecamp Secured', icon: '🏕️', description: 'Reach a 10% Freedom Ratio' },
  { id: 'MILESTONE_25', threshold: 25, title: 'First Trail Opened', icon: '🗺️', description: 'Reach a 25% Freedom Ratio' },
  { id: 'MILESTONE_50', threshold: 50, title: 'Halfway to Summit', icon: '🏔️', description: 'Reach a 50% Freedom Ratio' },
  { id: 'MILESTONE_75', threshold: 75, title: 'Summit in Sight', icon: '🔭', description: 'Reach a 75% Freedom Ratio' },
  { id: 'MILESTONE_100', threshold: 100, title: 'Operator Elite', icon: '👑', description: 'Reach a 100%+ Freedom Ratio' }
];

// Check for new milestone unlocks based on Freedom Ratio
export async function checkMilestoneUnlocks(db, userId, freedomRatio, currentUnlockedMilestones = []) {
  if (!db || !userId || freedomRatio < 0) return { newMilestones: [], updatedMilestones: currentUnlockedMilestones };

  const newMilestones = [];
  const updatedMilestones = [...currentUnlockedMilestones];

  // Check each milestone threshold
  for (const milestone of FREEDOM_MILESTONES) {
    // Check if user has reached this threshold and hasn't unlocked it yet
    if (freedomRatio >= milestone.threshold && !updatedMilestones.includes(milestone.id)) {
      newMilestones.push(milestone);
      updatedMilestones.push(milestone.id);
    }
  }

  // Update user profile with new milestones if any were unlocked
  if (newMilestones.length > 0) {
    const profileRef = doc(db, `users/${userId}/profile`);
    await setDoc(profileRef, { unlockedMilestones: updatedMilestones }, { merge: true });
  }

  return { newMilestones, updatedMilestones };
}



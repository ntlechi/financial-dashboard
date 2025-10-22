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
  // FIX: Use userProfiles collection with userId as document ID (2 segments)
  const profileRef = doc(db, 'userProfiles', userId);
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
  // FIX: Use userProfiles collection with userId as document ID (2 segments)
  const profileRef = doc(db, 'userProfiles', userId);
  const snap = await getDoc(profileRef);
  const current = snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 };
  const totalXp = Math.max(0, (current.xpPoints || 0) + amount);
  const { current: currRank } = getRankFromXp(current.xpPoints || 0);
  const { current: newRank } = getRankFromXp(totalXp);
  const rankUp = newRank.level > currRank.level;
  await setDoc(profileRef, { xpPoints: totalXp, rank: newRank.name, rankLevel: newRank.level }, { merge: true });
  return { totalXp, rankUp, newRank };
}

// 🛡️ Deducts XP for deleting items (anti-exploit protection!)
// Prevents infinite XP from create/delete loops
export async function deductXp(db, userId, amount) {
  if (!db || !userId || !amount) return { totalXp: 0, rankDown: false, newRank: null };
  
  const profileRef = doc(db, 'userProfiles', userId);
  const snap = await getDoc(profileRef);
  const current = snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 };
  
  // 🛡️ PROTECTION: Can't go below 0 XP
  const totalXp = Math.max(0, (current.xpPoints || 0) - amount);
  
  // Check if rank decreased
  const { current: oldRank } = getRankFromXp(current.xpPoints || 0);
  const { current: newRank } = getRankFromXp(totalXp);
  const rankDown = newRank.level < oldRank.level;
  
  // Update profile
  await setDoc(profileRef, { 
    xpPoints: totalXp, 
    rank: newRank.name, 
    rankLevel: newRank.level 
  }, { merge: true });
  
  return { totalXp, rankDown, newRank, oldRank };
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
// ✨ NOW SUPPORTS DYNAMIC RECALCULATION - milestones adjust up AND down!
export async function checkMilestoneUnlocks(db, userId, freedomRatio, currentUnlockedMilestones = []) {
  if (!db || !userId || freedomRatio < 0) return { newMilestones: [], updatedMilestones: currentUnlockedMilestones };

  const newMilestones = [];
  const correctMilestones = []; // Milestones that SHOULD be unlocked based on current ratio
  const removedMilestones = []; // Milestones that should be removed

  // Calculate which milestones SHOULD be unlocked based on CURRENT ratio
  for (const milestone of FREEDOM_MILESTONES) {
    if (freedomRatio >= milestone.threshold) {
      correctMilestones.push(milestone.id);
      // Check if this is a NEW unlock (wasn't unlocked before)
      if (!currentUnlockedMilestones.includes(milestone.id)) {
        newMilestones.push(milestone);
      }
    }
  }

  // Find milestones that were unlocked but are no longer valid (ratio dropped)
  for (const unlockedId of currentUnlockedMilestones) {
    if (!correctMilestones.includes(unlockedId)) {
      removedMilestones.push(unlockedId);
    }
  }

  // Only update profile if milestones changed (either added or removed)
  if (newMilestones.length > 0 || removedMilestones.length > 0) {
    const profileRef = doc(db, 'userProfiles', userId);
    await setDoc(profileRef, { unlockedMilestones: correctMilestones }, { merge: true });
    
    // Log milestone changes for debugging
    if (removedMilestones.length > 0) {
      console.log(`🔄 Milestones adjusted: Removed ${removedMilestones.length}, ratio dropped below threshold`);
    }
  }

  return { newMilestones, updatedMilestones: correctMilestones };
}



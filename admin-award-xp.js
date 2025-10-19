// 🏆 COMMUNITY CHALLENGE XP AWARD SYSTEM
// Admin script to award XP to challenge winners

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod'
  });
}

const db = admin.firestore();

// 🏆 Award XP to a single user
async function awardChallengeXP(userId, xpAmount, challengeName) {
  try {
    console.log(`🏆 Awarding ${xpAmount} XP to user ${userId} for challenge: ${challengeName}`);
    
    const profileRef = db.collection('userProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      console.log('❌ User profile not found');
      return false;
    }
    
    const currentData = profileDoc.data();
    const currentXP = currentData.xpPoints || 0;
    const newXP = currentXP + xpAmount;
    
    // Calculate new rank
    const newRank = calculateRank(newXP);
    
    // Update profile
    await profileRef.update({
      xpPoints: newXP,
      rank: newRank.name,
      rankLevel: newRank.level,
      lastChallengeWin: {
        challengeName,
        xpAwarded: xpAmount,
        date: new Date().toISOString()
      }
    });
    
    console.log(`✅ Successfully awarded ${xpAmount} XP to ${userId}`);
    console.log(`📊 New total: ${newXP} XP (${newRank.name})`);
    
    return true;
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    return false;
  }
}

// 🏆 Award XP to multiple users (challenge winners)
async function awardChallengeWinners(winners) {
  console.log(`🏆 Awarding XP to ${winners.length} challenge winners`);
  
  const results = [];
  
  for (const winner of winners) {
    const result = await awardChallengeXP(
      winner.userId, 
      winner.xpAmount, 
      winner.challengeName
    );
    results.push({ userId: winner.userId, success: result });
  }
  
  console.log('🏆 Challenge XP awards completed:', results);
  return results;
}

// 🏆 Award XP by email (easier for community management)
async function awardXPByEmail(email, xpAmount, challengeName) {
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;
    
    return await awardChallengeXP(userId, xpAmount, challengeName);
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    return false;
  }
}

// 🏆 Calculate rank from XP
function calculateRank(totalXP) {
  const RANKS = [
    { name: 'Recruit', level: 1, xpRequired: 0 },
    { name: 'Climber', level: 2, xpRequired: 1000 },
    { name: 'Operator', level: 3, xpRequired: 5000 },
    { name: 'Pathfinder', level: 4, xpRequired: 15000 },
    { name: 'Vanguard', level: 5, xpRequired: 30000 },
    { name: 'Free Agent', level: 6, xpRequired: 60000 }
  ];
  
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXP >= RANKS[i].xpRequired) {
      current = RANKS[i];
    } else {
      break;
    }
  }
  
  return current;
}

// 🏆 Get user's current XP and rank
async function getUserStats(userId) {
  try {
    const profileRef = db.collection('userProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      return null;
    }
    
    const data = profileDoc.data();
    return {
      xpPoints: data.xpPoints || 0,
      rank: data.rank || 'Recruit',
      rankLevel: data.rankLevel || 1,
      lastChallengeWin: data.lastChallengeWin || null
    };
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    return null;
  }
}

// 🏆 Community Challenge Examples
async function runCommunityChallenges() {
  console.log('🏆 Running Community Challenges...');
  
  // Example 1: Monthly Savings Challenge
  const savingsChallengeWinners = [
    { userId: 'user1', xpAmount: 500, challengeName: 'Monthly Savings Champion' },
    { userId: 'user2', xpAmount: 300, challengeName: 'Monthly Savings Champion' },
    { userId: 'user3', xpAmount: 200, challengeName: 'Monthly Savings Champion' }
  ];
  
  await awardChallengeWinners(savingsChallengeWinners);
  
  // Example 2: Investment Learning Challenge
  const investmentChallengeWinners = [
    { userId: 'user4', xpAmount: 750, challengeName: 'Investment Knowledge Master' },
    { userId: 'user5', xpAmount: 500, challengeName: 'Investment Knowledge Master' }
  ];
  
  await awardChallengeWinners(investmentChallengeWinners);
  
  console.log('🏆 All community challenges completed!');
}

// Export functions for use
module.exports = {
  awardChallengeXP,
  awardChallengeWinners,
  awardXPByEmail,
  getUserStats,
  runCommunityChallenges
};

// 🏆 USAGE EXAMPLES:

// Single user XP award:
// awardChallengeXP('userId123', 500, 'Monthly Savings Champion');

// Multiple winners:
// awardChallengeWinners([
//   { userId: 'user1', xpAmount: 500, challengeName: 'Challenge Name' },
//   { userId: 'user2', xpAmount: 300, challengeName: 'Challenge Name' }
// ]);

// Award by email:
// awardXPByEmail('user@example.com', 500, 'Challenge Name');

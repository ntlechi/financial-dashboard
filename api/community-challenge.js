// 🏆 COMMUNITY CHALLENGE API
// Secure endpoint for awarding XP to challenge winners

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'freedom-compass-prod'
  });
}

const db = admin.firestore();

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

// 🏆 Award XP to challenge winner
async function awardChallengeXP(userId, xpAmount, challengeName, challengeId) {
  try {
    console.log(`🏆 Awarding ${xpAmount} XP to user ${userId} for challenge: ${challengeName}`);
    
    const profileRef = db.collection('userProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      console.log('❌ User profile not found');
      return { success: false, error: 'User profile not found' };
    }
    
    const currentData = profileDoc.data();
    const currentXP = currentData.xpPoints || 0;
    const newXP = currentXP + xpAmount;
    
    // Calculate new rank
    const newRank = calculateRank(newXP);
    const rankUp = newRank.level > (currentData.rankLevel || 1);
    
    // Update profile
    await profileRef.update({
      xpPoints: newXP,
      rank: newRank.name,
      rankLevel: newRank.level,
      lastChallengeWin: {
        challengeName,
        challengeId,
        xpAwarded: xpAmount,
        date: new Date().toISOString()
      }
    });
    
    console.log(`✅ Successfully awarded ${xpAmount} XP to ${userId}`);
    console.log(`📊 New total: ${newXP} XP (${newRank.name})`);
    
    return { 
      success: true, 
      newXP, 
      newRank: newRank.name, 
      rankUp,
      xpAwarded: xpAmount 
    };
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    return { success: false, error: error.message };
  }
}

// 🏆 Main API handler
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      xpAmount, 
      challengeName, 
      challengeId,
      adminKey 
    } = req.body;

    // 🛡️ Security: Verify admin key
    if (adminKey !== process.env.COMMUNITY_CHALLENGE_ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!userId || !xpAmount || !challengeName) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, xpAmount, challengeName' 
      });
    }

    // Validate XP amount (prevent abuse)
    if (xpAmount < 1 || xpAmount > 10000) {
      return res.status(400).json({ 
        error: 'XP amount must be between 1 and 10,000' 
      });
    }

    // Award XP
    const result = await awardChallengeXP(userId, xpAmount, challengeName, challengeId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'XP awarded successfully',
        data: result
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Community challenge API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

// 🏆 USAGE EXAMPLE:
// POST /api/community-challenge
// {
//   "userId": "user123",
//   "xpAmount": 500,
//   "challengeName": "Monthly Savings Champion",
//   "challengeId": "challenge_2025_01",
//   "adminKey": "your-secret-admin-key"
// }

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
    }),
    databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, newPassword, displayName } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    console.log('🔐 Updating password for user:', email);

    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Found user:', userRecord.uid);

    // Update the user's password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
      displayName: displayName || userRecord.displayName
    });

    console.log('✅ Password updated successfully for user:', email);

    // Update Firestore user document
    try {
      await db.collection('users').doc(userRecord.uid).update({
        needsPasswordReset: false,
        tempPassword: null,
        displayName: displayName || userRecord.displayName,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Firestore user document updated');
    } catch (firestoreError) {
      console.log('⚠️ Firestore update failed, but password was updated:', firestoreError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully',
      userId: userRecord.uid
    });

  } catch (error) {
    console.error('❌ Error updating password:', error);
    res.status(500).json({ 
      error: 'Failed to update password',
      details: error.message 
    });
  }
}

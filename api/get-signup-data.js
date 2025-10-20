// API endpoint to retrieve temporarily stored signup data
// Used for webhook-based email pre-filling from Stripe Payment Links

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
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
    
    console.log('✅ Firebase Admin initialized successfully in get-signup-data');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed in get-signup-data:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = admin.firestore();
    
    // Get the most recent signup data (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const signupDataQuery = await db
      .collection('temp_signup_data')
      .where('createdAt', '>=', fiveMinutesAgo)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (signupDataQuery.empty) {
      return res.status(404).json({ error: 'No recent signup data found' });
    }

    const signupData = signupDataQuery.docs[0].data();
    
    return res.status(200).json({
      email: signupData.email,
      name: signupData.name,
      createdAt: signupData.createdAt
    });

  } catch (error) {
    console.error('❌ Error retrieving signup data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
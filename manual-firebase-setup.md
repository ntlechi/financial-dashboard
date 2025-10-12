# 🛠️ Manual Firebase Setup Guide

## 📋 QUICK SETUP (5 minutes)

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project (or create one if needed)

### Step 2: Create Firestore Database
1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select a location (choose closest to your users)

### Step 3: Create the Collections
1. Click **"Start collection"**
2. Collection ID: `app-config`
3. Click **"Next"**

### Step 4: Create Founder's Circle Document
1. Document ID: `founders-circle`
2. Add these fields:
   - `subscriberCount` (Number): `0`
   - `maxSpots` (Number): `100`
   - `phase` (String): `founders`
   - `lastUpdated` (String): `2024-10-11T00:00:00Z`
3. Click **"Save"**

### Step 5: Create Early Adopter Document
1. Click **"Add document"** in the same collection
2. Document ID: `early-adopter`
3. Add these fields:
   - `subscriberCount` (Number): `0`
   - `maxSpots` (Number): `500`
   - `phase` (String): `early-adopter`
   - `lastUpdated` (String): `2024-10-11T00:00:00Z`
4. Click **"Save"**

### Step 6: Update Security Rules
1. Go to **"Rules"** tab in Firestore
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to app-config for pricing page
    match /app-config/{document} {
      allow read: if true;
      allow write: if false; // Only server-side updates
    }
  }
}
```
3. Click **"Publish"**

### Step 7: Get Your Firebase Config
1. Go to **"Project Settings"** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Config"** under your web app
4. Copy the `firebaseConfig` object

### Step 8: Update Your HTML File
1. Open `enhanced-landing-pricing.html`
2. Replace the placeholder config with your real config
3. Uncomment the Firebase initialization lines

## 🧪 Testing Your Setup

### Test 1: Manual Count Update
1. Go to Firestore Database
2. Click on `app-config` → `founders-circle`
3. Change `subscriberCount` from `0` to `5`
4. Save the document
5. Refresh your landing page
6. You should see the progress bar update!

### Test 2: Real-time Updates
1. Open your landing page in one browser tab
2. Open Firebase Console in another tab
3. Update the `subscriberCount` in Firebase
4. Watch the progress bar update instantly!

## 🔄 Updating Subscriber Counts

### Method 1: Manual Updates (for testing)
1. Go to Firebase Console → Firestore Database
2. Navigate to `app-config` → `founders-circle` or `early-adopter`
3. Edit the `subscriberCount` field
4. Save changes

### Method 2: Stripe Webhook (for production)
When someone subscribes via Stripe, your webhook should update the counts:

```javascript
// In your Stripe webhook handler
const { doc, updateDoc, increment } = require('firebase-admin/firestore');

async function updateSubscriberCount(planId) {
  if (planId === 'founders-circle') {
    await db.collection('app-config').doc('founders-circle').update({
      subscriberCount: increment(1),
      lastUpdated: new Date().toISOString()
    });
  } else if (planId === 'early-adopter') {
    await db.collection('app-config').doc('early-adopter').update({
      subscriberCount: increment(1),
      lastUpdated: new Date().toISOString()
    });
  }
}
```

## 🎯 Expected Results

Once set up, you'll see:
- ✅ Real-time progress bars updating as people subscribe
- ✅ Live countdown timers showing time remaining
- ✅ Automatic phase switching based on dates
- ✅ Scarcity psychology driving conversions

## 🆘 Need Help?

If you run into issues:
1. Check the browser console for error messages
2. Verify your Firebase config is correct
3. Make sure Firestore rules allow read access
4. Test with manual count updates first

---

**🎉 That's it! Your landing page will now have real-time subscriber tracking!**


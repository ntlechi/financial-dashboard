# 🔥 Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "financial-dashboard")
4. Disable Google Analytics (not needed for this project)
5. Click "Create project"

## Step 2: Set up Authentication

1. In your Firebase project, go to "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Anonymous" authentication
4. Click "Save"

## Step 3: Set up Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Start in **test mode** (we'll secure it later)
3. Choose a location close to your users
4. Click "Done"

## Step 4: Get Your Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (`</>`)
4. Register app name: "financial-dashboard"
5. Copy the `firebaseConfig` object

## Step 5: Create .env File

Create a `.env` file in your project root with your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Step 6: Test Locally

```bash
npm start
```

Your dashboard should now load with Firebase authentication!

## Security Rules (Optional)

Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
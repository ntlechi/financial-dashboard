# 🚀 Vercel Deployment Guide

## Prerequisites

✅ Firebase project set up (see FIREBASE_SETUP.md)
✅ Local app working with your Firebase credentials

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Deploy from Project Root

```bash
cd /workspace
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name: **financial-dashboard** (or your preferred name)
- Directory: **.** (current directory)
- Build command: **npm run build**
- Output directory: **build**

## Step 4: Set Environment Variables

After deployment, add your Firebase environment variables:

### Option 1: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → Settings → Environment Variables
3. Add each variable:

```
REACT_APP_FIREBASE_API_KEY = your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
REACT_APP_FIREBASE_APP_ID = your_app_id
```

### Option 2: Via CLI
```bash
vercel env add REACT_APP_FIREBASE_API_KEY
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN
vercel env add REACT_APP_FIREBASE_PROJECT_ID
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID
vercel env add REACT_APP_FIREBASE_APP_ID
```

## Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## Step 6: Test Your Live App

Your dashboard will be available at: `https://your-project-name.vercel.app`

## Key Features Deployed

✅ **Dashboard Overview** - Net Worth, Income, Expenses, Cash Flow cards
✅ **Budget Calculator** - 50/30/20 rule and 6 Jars system (with critical layout fix)
✅ **Side Hustle Tracking** - Ready for full implementation
✅ **Investment Portfolio** - Ready for full implementation  
✅ **Responsive Design** - Mobile and desktop optimized
✅ **Firebase Integration** - Real-time data sync
✅ **Anonymous Authentication** - No signup required

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Ensure Firebase environment variables are set
- Check build logs in Vercel dashboard

### App Loads but Firebase Errors
- Verify all 6 environment variables are set correctly
- Check Firebase project settings
- Ensure Anonymous auth is enabled in Firebase

### Styling Issues
- Tailwind CSS should work out of the box
- Check if all imports are correct

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

Your financial dashboard is now live! 🎉
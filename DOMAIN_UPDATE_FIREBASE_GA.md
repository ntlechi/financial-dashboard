# 🔄 Firebase & Google Analytics Domain Update Checklist

## 🎯 **CRITICAL: After Domain Migration**

Since you migrated from `app.survivebackpacking.com` → `app.kompul.com`, you need to update Firebase and Google Analytics configurations.

---

## ✅ **1. FIREBASE AUTHORIZED DOMAINS**

### **Why This Matters:**
Firebase Authentication won't work on your new domain unless it's authorized. Users won't be able to sign in!

### **Steps to Update:**

1. **Go to Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Authentication Settings:**
   - Click **"Authentication"** in left sidebar
   - Click **"Settings"** tab
   - Scroll to **"Authorized domains"** section

3. **Add Your New Domain:**
   - Click **"Add domain"**
   - Enter: `app.kompul.com`
   - Click **"Add"**

4. **Keep or Remove Old Domain:**
   - ✅ **KEEP** `app.survivebackpacking.com` if you want to maintain backward compatibility (for testing or gradual migration)
   - ❌ **REMOVE** it if you've fully migrated and don't need it anymore

5. **Also Add (if using):**
   - `dev.kompul.com` (your staging/develop environment)
   - `localhost` (for local development - should already be there)

### **What Should Be Listed:**
After updating, your authorized domains should include:
- ✅ `app.kompul.com` (NEW - production)
- ✅ `dev.kompul.com` (staging)
- ✅ `localhost` (development)
- ⚠️ `app.survivebackpacking.com` (optional - can remove if fully migrated)

---

## ✅ **2. GOOGLE ANALYTICS 4 - UPDATE DATA STREAM**

### **Why This Matters:**
Your Google Analytics data stream is configured for the old domain. You need to update it so analytics continue tracking correctly on the new domain.

### **Steps to Update:**

1. **Go to Google Analytics:**
   - URL: https://analytics.google.com/
   - Select your property

2. **Navigate to Data Streams:**
   - Click **"Admin"** (bottom-left gear icon)
   - Under **"Property"** column, click **"Data streams"**

3. **Update Your Web Stream:**
   - Click on your existing web data stream (probably shows `app.survivebackpacking.com`)
   - Update **"Website URL"** to: `https://app.kompul.com`
   - Click **"Save"**

4. **Verify Measurement ID:**
   - Confirm the Measurement ID is still: `G-R2943ZZYSK` (this doesn't change)
   - This matches what's in your code ✅

### **Optional: Add Multiple Domains (Recommended During Transition)**

If you want to track both domains during migration:

1. **Keep existing data stream** for `app.survivebackpacking.com`
2. **Create NEW data stream** for `app.kompul.com`:
   - Click **"Add stream"** → **"Web"**
   - Website URL: `https://app.kompul.com`
   - Stream name: `Kompul - Production`
   - Click **"Create stream"**
   - Get the new Measurement ID

**Note:** If you create a new data stream, you'll need to update your code with the new Measurement ID.

---

## ✅ **3. GOOGLE ANALYTICS - CROSS-DOMAIN TRACKING (Optional)**

### **Why This Matters:**
If users navigate between `www.survivebackpacking.com` (blog) and `app.kompul.com` (app), you want to track their journey as one session.

### **Steps to Setup:**

1. **Go to Google Analytics Admin → Data Settings → Data Collection:**
   - Enable **"Configure your domains"**

2. **Add All Your Domains:**
   - `survivebackpacking.com`
   - `app.kompul.com`
   - `kompul.com`

3. **Update GA4 Config in Code (Optional):**
   
   In `public/index.html`, update your gtag config:
   
   ```javascript
   gtag('config', 'G-R2943ZZYSK', {
     'send_page_view': true,
     'anonymize_ip': true,
     'cookie_flags': 'SameSite=None;Secure',
     'linker': {
       'domains': ['survivebackpacking.com', 'app.kompul.com', 'kompul.com']
     }
   });
   ```

**Benefit:** Track users who click from blog → app as one continuous journey.

---

## ✅ **4. FIREBASE - OTHER SETTINGS TO CHECK**

### **4.1 Firebase Hosting (If Using)**

1. Go to **Firebase Console → Hosting**
2. Click **"Add custom domain"**
3. Add: `app.kompul.com`
4. Follow DNS setup instructions

**Note:** You're using Vercel, not Firebase Hosting, so this likely doesn't apply. ✅

### **4.2 Dynamic Links (If Using)**

1. Go to **Firebase Console → Dynamic Links**
2. Update URL prefix if you had one set to old domain
3. Change to new domain

**Note:** Check if you're using Firebase Dynamic Links for anything. If not, skip this. ✅

### **4.3 Remote Config (If Using)**

1. Go to **Firebase Console → Remote Config**
2. Check for any parameters that reference old domain
3. Update to new domain

**Note:** Only if you're using Remote Config. ✅

### **4.4 Cloud Functions (If Using)**

1. Check if any Cloud Functions have hardcoded domain references
2. Update to new domain or use environment variables

**Note:** Your Stripe webhook is a Vercel function, not Firebase, so you're good here. ✅

---

## ✅ **5. VERIFY EVERYTHING WORKS**

### **Test Firebase Authentication:**

1. Open `https://app.kompul.com` in browser
2. Open browser console (F12)
3. Look for Firebase messages:
   - ✅ Should see: `"✅ Firebase initialized successfully"`
   - ❌ Should NOT see: Domain authorization errors

4. Try signing in/out
   - ✅ Should work without errors
   - ❌ If you get auth errors, double-check authorized domains

### **Test Google Analytics:**

1. Open `https://app.kompul.com` in browser
2. Go to **Google Analytics → Reports → Realtime**
3. You should see:
   - ✅ "1 active user" (that's you!)
   - ✅ Correct page path being tracked
   - ✅ Events firing when you interact with app

4. Click around your app:
   - Switch tabs
   - Click features
   - Submit forms
   - Check that events appear in Realtime report

### **Check Browser Console:**

1. Open `https://app.kompul.com`
2. Open browser console (F12 → Console tab)
3. Look for any errors related to:
   - Firebase authentication
   - Google Analytics
   - Cross-origin issues
   - Domain authorization errors

---

## 📋 **QUICK CHECKLIST:**

**Firebase Console Actions:**
- [ ] Add `app.kompul.com` to authorized domains
- [ ] Add `dev.kompul.com` to authorized domains
- [ ] Decide whether to keep or remove `app.survivebackpacking.com`
- [ ] Test authentication on new domain

**Google Analytics Actions:**
- [ ] Update data stream URL to `app.kompul.com`
- [ ] Verify Measurement ID is still `G-R2943ZZYSK`
- [ ] (Optional) Set up cross-domain tracking
- [ ] Test real-time tracking on new domain

**Verification:**
- [ ] Open `app.kompul.com` and check browser console for errors
- [ ] Test sign in/out on new domain
- [ ] Check Google Analytics Realtime shows activity
- [ ] Click around app and verify events tracking

---

## ⚠️ **COMMON ISSUES:**

### **Issue 1: "This domain is not authorized for OAuth operations"**

**Cause:** Forgot to add new domain to Firebase authorized domains

**Fix:**
1. Go to Firebase Console → Authentication → Settings
2. Add `app.kompul.com` to authorized domains
3. Wait 1-2 minutes for changes to propagate
4. Refresh your app and try again

### **Issue 2: Google Analytics not tracking**

**Cause:** Data stream still points to old domain

**Fix:**
1. Go to Google Analytics → Admin → Data Streams
2. Update Website URL to new domain
3. Clear browser cache and cookies
4. Reopen app in incognito/private window
5. Check Realtime reports

### **Issue 3: Users can't sign in with Google**

**Cause:** OAuth redirect URI not updated

**Fix:**
1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select your Firebase project
3. Go to **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **"Authorized redirect URIs"**, add:
   - `https://app.kompul.com/__/auth/handler`
6. Click **"Save"**

---

## 🎯 **CURRENT STATUS:**

Based on your codebase:

**Google Analytics:**
- ✅ Measurement ID configured: `G-R2943ZZYSK`
- ✅ Code is already in place (`public/index.html`)
- ⚠️ **ACTION NEEDED:** Update data stream URL in GA4 console

**Firebase:**
- ✅ Configuration uses environment variables (flexible)
- ✅ Code is already in place (`src/firebase.js`)
- ⚠️ **ACTION NEEDED:** Add new domain to authorized domains

**Environment Variables (Vercel):**
- ✅ Already updated (from yesterday's work)
- ✅ `NEXT_PUBLIC_APP_URL` set to `https://app.kompul.com`

---

## 📝 **DETAILED STEPS (Copy/Paste Ready):**

### **Step 1: Firebase Authorized Domains**

1. Open: https://console.firebase.google.com/
2. Select project
3. Click: **Authentication** → **Settings** → **Authorized domains**
4. Click: **Add domain**
5. Type: `app.kompul.com`
6. Click: **Add**
7. Repeat for: `dev.kompul.com`

### **Step 2: Google Analytics Data Stream**

1. Open: https://analytics.google.com/
2. Click: **Admin** (bottom-left)
3. Click: **Data streams** (under Property column)
4. Click: Your existing web data stream
5. Update: **Website URL** to `https://app.kompul.com`
6. Click: **Save**

### **Step 3: Test Everything**

1. Open: `https://app.kompul.com` in incognito/private window
2. Open: Browser console (F12)
3. Look for: `"✅ Firebase initialized successfully"`
4. Test: Sign in/out (should work without errors)
5. Open: https://analytics.google.com/ → **Reports** → **Realtime**
6. Verify: You see "1 active user" and events tracking

---

## ✅ **YOU'RE DONE WHEN:**

- ✅ `app.kompul.com` appears in Firebase authorized domains
- ✅ Google Analytics data stream shows new domain
- ✅ You can sign in on `app.kompul.com` without errors
- ✅ Google Analytics Realtime shows activity
- ✅ No errors in browser console
- ✅ Everything works smoothly!

---

## 🚀 **TIMELINE:**

**Estimated time:** 10-15 minutes

**Steps:**
1. Firebase authorized domains (5 min)
2. Google Analytics data stream (3 min)
3. Testing (5 min)
4. ✅ Done!

---

## 💡 **PRO TIP:**

Keep your old domain (`app.survivebackpacking.com`) authorized in Firebase for 1-2 weeks during transition. This ensures:
- No disruption for any existing users
- You can test both domains
- Gradual migration if needed
- Remove it once you confirm everything works on new domain

---

**Created:** November 2, 2025  
**Last Updated:** After domain migration to `app.kompul.com`  
**Status:** Action required - Update Firebase & GA4 settings


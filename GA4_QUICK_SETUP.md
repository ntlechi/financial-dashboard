# 🎯 Google Analytics 4 - Quick Setup Guide

## ⏰ 5-MINUTE SETUP

### **Step 1: Get Your Measurement ID**

1. Go to: https://analytics.google.com/
2. Click **"Admin"** (bottom-left)
3. Click **"Create Property"** (or select existing)
4. Under "Data Streams" → **"Add stream"** → **"Web"**
5. Enter your app URL
6. Click **"Create stream"**
7. **Copy the Measurement ID** (looks like: `G-ABC123XYZ`)

---

### **Step 2: Add to Your App**

Open: `public/index.html`

**Replace `G-XXXXXXXXXX` in 2 places:**

#### **LOCATION 1: Line 23**
```html
<!-- BEFORE: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- AFTER (example): -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
```

#### **LOCATION 2: Line 30**
```html
<!-- BEFORE: -->
gtag('config', 'G-XXXXXXXXXX', {

<!-- AFTER (example): -->
gtag('config', 'G-ABC123XYZ', {
```

**⚠️ Use the SAME ID in both places!**

---

### **Step 3: Deploy**

```bash
git add public/index.html
git commit -m "Add Google Analytics Measurement ID"
git push origin cursor/pricing-ux-improvements-oct6
```

Wait ~40 seconds for Vercel to deploy.

---

### **Step 4: Verify It Works**

1. Open: https://analytics.google.com/
2. Go to: **Reports** → **Realtime**
3. Open your app in a new browser tab
4. You should see **"1 active user"** immediately! 🎉

Click around different tabs to see events appear in real-time.

---

## ✅ DONE!

You're now tracking:
- 📊 Page views
- 👥 Active users  
- 🔓 Locked feature clicks
- 💬 Feedback submissions
- 📱 Device types
- 🌍 User locations

---

## 🔥 Example Measurement ID

**Format:** `G-` + 10 characters (letters/numbers)

**Examples:**
- `G-ABC123XYZ9`
- `G-1234567890`
- `G-XYZTEST456`

**Your ID will look similar to these.**

---

## 🚨 Common Mistakes

❌ **Don't do this:**
- Adding only to line 23 (need BOTH lines 23 & 30)
- Using different IDs in the 2 places
- Forgetting to remove the placeholder `G-XXXXXXXXXX`
- Using an old Universal Analytics ID (format: `UA-XXXXXX`)

✅ **Do this:**
- Use the SAME GA4 ID (starts with `G-`) in BOTH places
- Double-check you replaced both occurrences
- Make sure it's a GA4 property (not Universal Analytics)

---

## 📞 Need Help?

If events aren't showing in Google Analytics:

1. **Check the ID is correct:**
   - Open `public/index.html`
   - Verify ID starts with `G-`
   - Verify same ID in lines 23 & 30

2. **Check browser console:**
   - Press F12
   - Look for Google Analytics errors
   - Should see `gtag` messages

3. **Wait a few minutes:**
   - Sometimes data takes 1-2 minutes to appear
   - Refresh the Realtime report

4. **Clear browser cache:**
   - Old cached version might not have the ID
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

**That's it! Simple 5-minute setup for powerful analytics.** 🚀

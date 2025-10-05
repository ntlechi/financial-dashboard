# 🧪 How to Test Different Subscription Tiers

## 🎯 Quick Answer

**YES, you can test all tiers without paying multiple times!**

---

## ⚡ Method 1: Manual Firebase Edit (FASTEST)

### Step-by-Step:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select project: `freedom-compass-prod`

2. **Navigate to Your User Document**
   - Click "Firestore Database" (left sidebar)
   - Click "users" collection
   - Find your user ID document (starts with your email)
   - Click on the document

3. **Edit Subscription Field**
   - Click the "Edit" button (pencil icon)
   - Find the `subscription` object
   - Find the `plan` field inside it
   - Change the value to one of:
     - `"free"` → Test FREE tier (Recon Kit)
     - `"climber"` → Test CLIMBER tier
     - `"operator"` → Test OPERATOR tier
     - `"founders-circle"` → Test FOUNDER'S CIRCLE

4. **Save & Refresh**
   - Click "Update" in Firebase
   - Go back to your app
   - Hard refresh: **Ctrl + Shift + R**
   - Badge should update immediately!

---

## 🔍 How to Find Your User ID

### Option A: Browser Console (Fastest)
```javascript
// Open app, press F12, paste this in Console:
firebase.auth().currentUser.uid
```

### Option B: Firebase Console
1. Firestore Database → `users` collection
2. Look for document with your email in the data
3. The document ID (random letters/numbers) is your User ID

Example: `rOoTPMJBsNhKEICiejrcoDPv2Wh2`

---

## 👥 Method 2: Create New Test Accounts

### For FREE Tier Testing:
1. Click profile icon → Sign Out
2. Create new account with different email
3. New accounts are FREE by default ✅

### For Paid Tier Testing:
1. Create new account
2. Go through Stripe checkout (use test card)
   OR
3. Manually edit subscription in Firebase (Method 1)

---

## 🎨 What Each Tier Shows

### 🆓 FREE (Recon Kit)
```
Dashboard:
✅ Net Worth (only 3 cards)
✅ Cash Flow
✅ Savings Rate
🔒 All other cards LOCKED

Features:
✅ Budget Calculator
✅ Transactions
🔒 Side Hustle → LOCKED
🔒 Investment → LOCKED
🔒 Travel → LOCKED
```

### 🧗 CLIMBER ($7.99/mo)
```
Dashboard:
✅ ALL CARDS UNLOCKED
  - Financial Freedom Goal
  - Emergency Fund
  - Debt Payoff
  - Credit Score
  - Goals
  - Retirement
  - Income/Expenses
  - Cash on Hand

Features:
✅ Budget Calculator
✅ Transactions
✅ All Financial Calculators
🔒 Side Hustle → LOCKED
🔒 Investment → LOCKED
🔒 Travel → LOCKED
```

### ⚙️ OPERATOR ($14.99/mo)
```
Dashboard:
✅ ALL CARDS UNLOCKED

Features:
✅ EVERYTHING UNLOCKED
✅ Side Hustle Management
✅ Investment Portfolio
✅ Travel Mode
```

---

## 🛠️ Developer Override Panel (Optional)

Want a SECRET ADMIN PANEL to switch tiers instantly?

### Features:
- Hidden dropdown menu to switch tiers
- No Firebase editing needed
- Press `Ctrl + Shift + D` to open
- Only works for your account

**Takes 15 minutes to build. Want it?**

---

## ⚠️ Important Notes

### When Testing:
- Always hard refresh after changing tier: **Ctrl + Shift + R**
- Clear Service Worker if tier doesn't update (F12 → Application → Service Workers → Unregister)
- Changes are instant (no need to wait)

### Before Launch:
- Make sure YOUR account has correct tier for demos
- Test all locked features show upgrade prompts
- Verify Stripe payments update tier correctly

### Stripe Testing:
- Use test card: `4242 4242 4242 4242`
- Any future date, any CVC
- Will create real subscription in test mode

---

## 📊 Testing Checklist

- [ ] Test FREE tier: 3 cards, upgrade prompts working
- [ ] Test CLIMBER tier: All cards, tabs locked correctly
- [ ] Test OPERATOR tier: Everything unlocked
- [ ] Test Founder's Circle: Shows in pricing, counter works
- [ ] Test upgrade flow: Payment → Tier changes
- [ ] Test badge display: Shows correct tier name & color

---

## 🚀 Quick Command Reference

```bash
# Find your user ID (Browser Console)
firebase.auth().currentUser.uid

# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Clear Service Worker
F12 → Application → Service Workers → Unregister
```

---

**Current Status:** ✅ All tier gating implemented and working!

*Last Updated: October 5, 2025*

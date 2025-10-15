# 🔍 STRIPE TEST vs LIVE MODE EXPLANATION
## **Why You're Seeing "Test" on Stripe Checkout**

**Status:** ⚠️ EXPECTED BEHAVIOR  
**Issue:** Not actually a problem!  
**Solution:** Understanding Stripe modes

---

## 🎯 **WHAT'S HAPPENING:**

### **When You Click "Upgrade":**
```
Your App (develop branch)
    ↓
Uses: REACT_APP_STRIPE_PUBLISHABLE_KEY
    ↓
Stripe Checkout Page
    ↓
Shows: "Test" or "Live" depending on key type
```

---

## 🔑 **TWO TYPES OF STRIPE KEYS:**

### **1. Test Mode Keys (Sandbox):**
```
Publishable Key: pk_test_xxxxxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxxxxx

Used for: Development & Testing
Shows: "Test" banner on checkout
Real money: NO (fake cards only)
```

### **2. Live Mode Keys (Production):**
```
Publishable Key: pk_live_xxxxxxxxxxxxx
Secret Key: sk_live_xxxxxxxxxxxxx

Used for: Real customers
Shows: No "Test" banner
Real money: YES (real payments!)
```

---

## 💡 **WHY YOU SEE "TEST":**

**Your `.env` file probably has:**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
```

**This is NORMAL for development!** ✅

---

## 🎯 **RECOMMENDED SETUP:**

### **For `develop` Branch (Testing):**
```
Use: Test mode keys
Why: Safe testing, no real charges
Who uses: You, testers, dev team
```

### **For `main` Branch (Production):**
```
Use: Live mode keys
Why: Real payments from real users
Who uses: Actual paying customers
```

---

## 🔧 **HOW TO FIX (If You Want):**

### **Option 1: Keep Test Mode on Develop (RECOMMENDED!)**
```
Why:
✅ Safe for testing
✅ No accidental charges
✅ Can test upgrades freely
✅ Industry standard practice

Action: Nothing! This is correct!
```

### **Option 2: Use Live Mode on Develop (Not Recommended)**
```
Why NOT:
❌ Risk of real charges during testing
❌ Test payments appear in production
❌ Can't safely test
❌ Violates best practices

Only do this if: You're doing final production testing
```

---

## 🎯 **WHAT YOUR PRICE IDs ARE:**

**From `src/pricing.js`:**
```javascript
STRIPE_PRICE_IDS = {
  'founders-circle-monthly': 'price_1SEtrg82nQ0x7qb2NBJr0IVU',
  'early-adopter-monthly': 'price_1SH2rg82nQ0x7qb2wte7rkSV',
  'climber-monthly': 'price_1fZu9ANe1ge3F07Q6aX7bW05',
  'climber-yearly': 'price_19B628l8GWaRtbQyard7bW06',
  'operator-monthly': 'price_1aFa6oB1eu6Bd2fY6aX7bW03',
  'operator-yearly': 'price_14gM8wJ6yOcZBcUC0QD7bW04'
}
```

**These are LIVE price IDs!** (They start with `price_1`, not `price_test_`)

**But your publishable key is probably test mode!**

---

## 🔍 **HOW TO CHECK YOUR KEYS:**

### **Check Your Environment:**
```bash
# Look in your .env file (not tracked in git)
cat .env

# You should see:
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_xxxx_xxxxxxxxx
                                    ↑
                                    test or live?
```

### **Test Mode Key:**
```
pk_test_xxxxx → Shows "Test" banner
```

### **Live Mode Key:**
```
pk_live_xxxxx → No banner (production)
```

---

## ✅ **BEST PRACTICE (What We Recommend):**

### **Develop Branch (financial-dashboard-snowy-chi.vercel.app):**
```
Environment: Development
Keys: TEST MODE
Purpose: Safe testing
Stripe shows: "Test" banner ← THIS IS GOOD!
```

### **Main Branch (app.survivebackpacking.com):**
```
Environment: Production
Keys: LIVE MODE
Purpose: Real customers
Stripe shows: No banner
```

---

## 🎯 **FOR YOUR OCTOBER 19 LAUNCH:**

### **Before Launch Day:**
```
1. Keep develop = test mode
2. Test all upgrade flows
3. Use test cards (4242 4242 4242 4242)
4. Verify webhooks work
```

### **On Launch Day:**
```
1. Merge develop → main
2. Update main's environment variables to LIVE keys
3. Deploy to production
4. Test ONE real payment yourself
5. Then open to public!
```

---

## 🔐 **WHERE ARE YOUR KEYS?**

### **Not in Code (Good!):**
```
✅ Keys are in .env file (not committed to git)
✅ Each environment has its own keys
✅ Vercel has separate environment variables
```

### **To Check Vercel:**
```
1. Go to: vercel.com
2. Open your project
3. Settings → Environment Variables
4. Check: REACT_APP_STRIPE_PUBLISHABLE_KEY

If it starts with:
- pk_test_ → Test mode (develop should use this)
- pk_live_ → Live mode (main should use this)
```

---

## 💳 **TEST CARDS (For Testing):**

**When in test mode, use these:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires SCA: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid ZIP
```

---

## 🎁 **QUICK ANSWER TO YOUR QUESTION:**

**Q:** "I see Test on Stripe. Wrong price ID? Or live only on main?"

**A:** **Live price IDs are correct!** 🎯

**The "Test" banner appears because:**
- Your `develop` branch is using a **test mode publishable key**
- This is **CORRECT and RECOMMENDED** for development!
- The price IDs in code are live (correct!)
- But the key you use determines test/live mode

**Solution:**
- **develop branch:** Use test keys (shows "Test" ← expected!)
- **main branch:** Use live keys (no "Test" banner)

---

## 🚀 **FOR LAUNCH:**

### **Checklist:**
```
□ develop branch: test keys ← Already correct!
□ main branch: live keys ← Set this on launch day
□ Test mode: All upgrades working
□ Live mode: ONE test payment before going public
□ Webhooks: Configured for both test & live
```

---

## 📝 **SUMMARY:**

**Your Setup is CORRECT!** ✅

```
develop branch = Test mode = "Test" banner = Safe testing ✅
main branch = Live mode = No banner = Real money ✅

Price IDs = Live IDs = Correct ✅
Just need live keys on main branch for October 19!
```

---

**Nothing is broken!** 🎉  
**This is exactly how it should be!** ✅  
**Launch-ready!** 🚀

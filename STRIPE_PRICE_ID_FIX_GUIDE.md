# 🚨 URGENT: Stripe Price ID Fix Guide

**Problem:** The app is failing with "No such price: 'price_operator_monthly'" error because the price IDs are not properly configured.

**Error Count:** 16 failed checkout sessions in the last 7 days

---

## 🔍 Root Cause Analysis

The issue is in `src/pricing.js` where placeholder price IDs are being used instead of actual Stripe price IDs:

```javascript
// CURRENT (BROKEN):
'operator-monthly': 'price_operator_monthly',  // ❌ This doesn't exist in Stripe
'climber-monthly': 'price_climber_monthly',    // ❌ This doesn't exist in Stripe
```

---

## ✅ SOLUTION: Create Stripe Price IDs

### Step 1: Create Price IDs in Stripe Dashboard

Go to your Stripe Dashboard → Products → Create the following products and prices:

#### Climber Plan
- **Product Name:** "Climber Plan"
- **Description:** "The essential gear for the ascent"
- **Monthly Price:** $7.99/month
- **Annual Price:** $79/year

#### Operator Plan  
- **Product Name:** "Operator Plan"
- **Description:** "The full arsenal for building your empire"
- **Monthly Price:** $14.99/month
- **Annual Price:** $149/year

### Step 2: Copy the Price IDs

After creating the products, copy the price IDs (they start with `price_`) and update your environment variables.

### Step 3: Update Environment Variables

Add these to your `.env` file:

```bash
# Stripe Price IDs - Regular Plans
REACT_APP_STRIPE_CLIMBER_MONTHLY=price_XXXXXXXXXXXXXX
REACT_APP_STRIPE_CLIMBER_ANNUAL=price_XXXXXXXXXXXXXX
REACT_APP_STRIPE_OPERATOR_MONTHLY=price_XXXXXXXXXXXXXX
REACT_APP_STRIPE_OPERATOR_ANNUAL=price_XXXXXXXXXXXXXX
```

### Step 4: Update Vercel Environment Variables

Also add these to your Vercel dashboard environment variables so they work in production.

---

## 🛠️ QUICK FIX (Temporary)

If you need a quick fix while setting up the proper price IDs, I can update the code to use the existing working price IDs temporarily.

**Would you like me to:**
1. **Create the proper Stripe price IDs** (recommended - permanent fix)
2. **Apply a temporary fix** using existing price IDs (quick but not ideal)

---

## 📋 Current Working Price IDs

These are already configured and working:
- **Founder's Circle:** `price_1SEtrg82nQ0x7qb2NBJr0IVU` ($7.49/month)
- **Early Adopter:** `price_1SH2rg82nQ0x7qb2wte7rkSV` ($8.49/month)

---

## 🎯 Expected Results After Fix

- ✅ No more "No such price" errors
- ✅ All pricing tiers work correctly
- ✅ Users can upgrade to Climber and Operator plans
- ✅ Checkout sessions complete successfully

---

## ⏱️ Time to Fix

- **Create Stripe price IDs:** 5-10 minutes
- **Update environment variables:** 2 minutes
- **Deploy:** 1 minute
- **Total:** ~15 minutes

---

**Let me know which approach you'd prefer and I'll help you implement it!**

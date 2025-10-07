# 🎯 Stripe Integration - Complete Implementation Guide
## The Freedom Compass App - Payment System

---

## 📋 **PHASE 1: Stripe Account Setup** (15 minutes)

### Step 1.1: Create/Access Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up or log in
3. **Important**: Choose "Activate your account" to enable live payments
4. Complete business verification (required for live payments)

### Step 1.2: Get API Keys
1. Go to **Developers → API keys**
2. You'll see two sets of keys:
   - **Test mode** (for development)
   - **Live mode** (for production)

**Copy these keys:**
```
Test Publishable Key: pk_test_...
Test Secret Key: sk_test_...

Live Publishable Key: pk_live_...
Live Secret Key: sk_live_...
```

⚠️ **CRITICAL**: Never expose secret keys in frontend code!

---

## 📋 **PHASE 2: Create Products in Stripe** (20 minutes)

### Step 2.1: Create Climber Plan Product

1. Go to **Products → Add product**
2. Fill in:
   ```
   Name: Climber Plan - The Climber
   Description: Advanced analytics and full dashboard access
   ```

3. **Add Monthly Price:**
   - Click "Add another price"
   - Amount: $7.99 USD
   - Billing period: Monthly
   - Price ID will be: `price_xxxxx` (save this!)

4. **Add Annual Price:**
   - Click "Add another price"
   - Amount: $79.00 USD
   - Billing period: Yearly
   - Price ID will be: `price_yyyyy` (save this!)

### Step 2.2: Create Operator Plan Product

1. **Products → Add product**
   ```
   Name: Operator Plan - The Operator
   Description: Complete financial freedom toolkit
   ```

2. **Monthly Price:** $14.99 USD
   - Save Price ID: `price_xxxxx`

3. **Annual Price:** $149.00 USD
   - Save Price ID: `price_yyyyy`

### Step 2.3: Create Founder's Circle Product

1. **Products → Add product**
   ```
   Name: Founder's Circle - The Founder
   Description: Limited-time exclusive offer (Lifetime lock at $7.49/mo)
   ```

2. **Monthly Price ONLY:** $7.49 USD
   - Save Price ID: `price_xxxxx`
   - ⚠️ NO annual option for Founder's Circle

### Step 2.4: Record All Price IDs

Create a note with your Price IDs:
```
CLIMBER_MONTHLY: price_xxxxx
CLIMBER_ANNUAL: price_yyyyy
OPERATOR_MONTHLY: price_xxxxx
OPERATOR_ANNUAL: price_yyyyy
FOUNDERS_CIRCLE_MONTHLY: price_xxxxx
```

You'll need these for the code!

---

## 📋 **PHASE 3: Set Up Vercel Environment Variables** (5 minutes)

### In Vercel Dashboard:

1. Go to your project → **Settings → Environment Variables**
2. Add these variables:

**For Production Environment:**
```
STRIPE_SECRET_KEY = sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret (we'll get this later)

# Price IDs from Step 2.4
STRIPE_CLIMBER_MONTHLY = price_xxxxx
STRIPE_CLIMBER_ANNUAL = price_yyyyy
STRIPE_OPERATOR_MONTHLY = price_xxxxx
STRIPE_OPERATOR_ANNUAL = price_yyyyy
STRIPE_FOUNDERS_CIRCLE_MONTHLY = price_xxxxx
```

**For Development/Preview (optional):**
Use test keys: `sk_test_...` and `pk_test_...`

---

## 📋 **PHASE 4: Implement Backend API** (30 minutes)

### Step 4.1: Create Vercel Serverless Functions

We'll create two API endpoints:
1. `/api/create-checkout-session` - Create Stripe checkout
2. `/api/stripe-webhook` - Handle payment confirmations

### Step 4.2: File Structure
```
/api
  ├── create-checkout-session.js
  └── stripe-webhook.js
```

*(Full code implementation in next steps)*

---

## 📋 **PHASE 5: Update Frontend** (20 minutes)

### Step 5.1: Update Environment Config
Add Stripe publishable key to frontend

### Step 5.2: Update handleUpgrade Function
Replace demo code with actual Stripe checkout redirect

### Step 5.3: Create Success/Cancel Pages
Handle post-checkout redirects

---

## 📋 **PHASE 6: Configure Webhooks** (10 minutes)

### Step 6.1: Add Webhook Endpoint in Stripe

1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://app.survivebackpacking.com/api/stripe-webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Copy Webhook Signing Secret:** `whsec_xxxxx`
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 📋 **PHASE 7: Red Team Testing** (30 minutes)

### Test Checklist:

#### Test 1: Climber Monthly
- [ ] Click "Upgrade to Climber"
- [ ] Select "Monthly" billing
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify redirect to success page
- [ ] Check Firebase: user subscription updated to "climber"
- [ ] Verify access to Climber features
- [ ] Check Stripe Dashboard: subscription created

#### Test 2: Operator Annual
- [ ] Upgrade to Operator
- [ ] Select "Annual" billing
- [ ] Use LIVE credit card (small amount)
- [ ] Complete payment
- [ ] Verify all above steps

#### Test 3: Founder's Circle
- [ ] Upgrade to Founder's Circle
- [ ] Complete checkout
- [ ] Verify "Founder" badge appears
- [ ] Verify Operator-level access

#### Test 4: Error Scenarios
- [ ] Test declined card: `4000 0000 0000 0002`
- [ ] Test insufficient funds: `4000 0000 0000 9995`
- [ ] Verify error messages display correctly
- [ ] User stays on current plan

---

## 📋 **PHASE 8: Production Deployment** (10 minutes)

### Final Checklist:

- [ ] All Stripe products created in LIVE mode
- [ ] Webhook configured with production URL
- [ ] Environment variables set in Vercel (PRODUCTION)
- [ ] Test mode transactions cleared
- [ ] Live payment tested successfully
- [ ] Subscription updates in Firebase working
- [ ] Email receipts from Stripe working
- [ ] Cancel/downgrade flow tested

---

## 🚨 **Security Checklist**

- [ ] Secret keys NEVER in frontend code
- [ ] Webhook signature verification enabled
- [ ] HTTPS only (enforced by Vercel)
- [ ] Price IDs validated server-side
- [ ] User authentication verified before checkout
- [ ] Subscription status verified on every request

---

## 📊 **Success Metrics**

After successful integration, you should see:

✅ Payments processing in Stripe Dashboard
✅ Subscriptions created and active
✅ User plan updated in Firebase
✅ Features unlocked based on subscription
✅ Webhooks received and processed
✅ Email receipts sent to customers

---

## 🆘 **Troubleshooting**

### Issue: "Stripe not initialized"
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify key starts with `pk_test_` or `pk_live_`
- Redeploy after adding environment variables

### Issue: "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Ensure raw body is passed to verification

### Issue: "Payment succeeded but subscription not updated"
- Check webhook is receiving events (Stripe Dashboard → Events)
- Verify Firebase write permissions
- Check console logs in Vercel Functions

---

## 📞 **Support Resources**

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing Cards: https://stripe.com/docs/testing
- Vercel Functions: https://vercel.com/docs/functions
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

**Ready to implement? Let's build this payment system! 🚀**

# ✅ Stripe Integration - Step-by-Step Setup Checklist
## The Freedom Compass App - Complete Implementation Guide

---

## 🎯 **OVERVIEW**

This checklist will guide you through setting up Stripe payments in ~90 minutes.

**What we're building:**
- Secure subscription checkout
- Automatic subscription management
- Webhook-based fulfillment
- Customer portal for self-service

---

## ☑️ **PHASE 1: Stripe Account Setup** (15 minutes)

### [ ] 1.1 Access Stripe Dashboard
- Go to https://dashboard.stripe.com
- Sign in or create account
- Complete business verification (required for live payments)

### [ ] 1.2 Activate Live Payments
- Click "Activate your account" in Stripe Dashboard
- Provide business details
- Verify identity (may take 1-2 business days)

### [ ] 1.3 Get API Keys
Go to: **Developers → API keys**

Copy these 4 keys:
```
✅ Test Publishable Key: pk_test_...
✅ Test Secret Key: sk_test_...
✅ Live Publishable Key: pk_live_...
✅ Live Secret Key: sk_live_...
```

**Save these securely!** You'll need them next.

---

## ☑️ **PHASE 2: Create Products in Stripe** (20 minutes)

### [ ] 2.1 Create Climber Plan

1. Go to **Products → Add product**
2. Enter details:
   ```
   Name: Climber Plan - The Climber
   Description: Advanced analytics and full dashboard access for financial clarity
   ```

3. **Add Monthly Price:**
   - Click "Add price"
   - Amount: **$7.99 USD**
   - Billing period: **Monthly**
   - Click "Add price"
   - ✅ Copy Price ID: `price_________________`

4. **Add Annual Price:**
   - Click "Add another price"
   - Amount: **$79.00 USD**
   - Billing period: **Yearly**
   - Click "Add price"
   - ✅ Copy Price ID: `price_________________`

### [ ] 2.2 Create Operator Plan

1. **Products → Add product**
   ```
   Name: Operator Plan - The Operator
   Description: Complete financial freedom toolkit with business and investment management
   ```

2. **Monthly Price:** $14.99 USD
   - ✅ Copy Price ID: `price_________________`

3. **Annual Price:** $149.00 USD
   - ✅ Copy Price ID: `price_________________`

### [ ] 2.3 Create Founder's Circle

1. **Products → Add product**
   ```
   Name: Founder's Circle - The Founder
   Description: Exclusive limited-time offer - Full Operator access locked at $7.49/mo for life
   ```

2. **Monthly Price ONLY:** $7.49 USD
   - ✅ Copy Price ID: `price_________________`
   - ⚠️ **No annual option** for Founder's Circle

### [ ] 2.4 Record Your Price IDs

Fill in your actual Price IDs below (you'll need these later):

```plaintext
STRIPE_CLIMBER_MONTHLY = price_________________
STRIPE_CLIMBER_ANNUAL = price_________________
STRIPE_OPERATOR_MONTHLY = price_________________
STRIPE_OPERATOR_ANNUAL = price_________________
STRIPE_FOUNDERS_CIRCLE_MONTHLY = price_________________
```

---

## ☑️ **PHASE 3: Firebase Admin SDK Setup** (10 minutes)

### [ ] 3.1 Get Firebase Service Account Key

1. Go to **Firebase Console → Project Settings (⚙️)**
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download JSON file
5. Open the JSON file and copy these values:
   ```
   ✅ project_id: "your-project-id"
   ✅ client_email: "firebase-adminsdk-xxxxx@..."
   ✅ private_key: "-----BEGIN PRIVATE KEY-----\n..."
   ```

---

## ☑️ **PHASE 4: Vercel Environment Variables** (15 minutes)

### [ ] 4.1 Add Production Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables for **Production** environment:

#### Stripe Keys:
```
STRIPE_SECRET_KEY = sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxx (we'll get this in Phase 5)
```

#### Stripe Price IDs (from Phase 2.4):
```
STRIPE_CLIMBER_MONTHLY = price_your_actual_id
STRIPE_CLIMBER_ANNUAL = price_your_actual_id
STRIPE_OPERATOR_MONTHLY = price_your_actual_id
STRIPE_OPERATOR_ANNUAL = price_your_actual_id
STRIPE_FOUNDERS_CIRCLE_MONTHLY = price_your_actual_id
```

#### Firebase Admin SDK (from Phase 3.1):
```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----
```

#### App Configuration:
```
NEXT_PUBLIC_APP_URL = https://app.survivebackpacking.com
```

### [ ] 4.2 Also Add Frontend Env Variables

Make sure these are in Vercel (they should already be there):
```
REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_live_your_live_publishable_key_here
REACT_APP_STRIPE_CLIMBER_MONTHLY = price_your_actual_id
REACT_APP_STRIPE_CLIMBER_ANNUAL = price_your_actual_id
REACT_APP_STRIPE_OPERATOR_MONTHLY = price_your_actual_id
REACT_APP_STRIPE_OPERATOR_ANNUAL = price_your_actual_id
REACT_APP_STRIPE_FOUNDERS_CIRCLE_MONTHLY = price_your_actual_id
```

---

## ☑️ **PHASE 5: Configure Stripe Webhook** (10 minutes)

### [ ] 5.1 Deploy Your Code First

1. Commit and push all changes to GitHub
2. Vercel will auto-deploy
3. Wait for deployment to complete
4. Note your production URL: `https://app.survivebackpacking.com`

### [ ] 5.2 Add Webhook Endpoint in Stripe

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://app.survivebackpacking.com/api/stripe-webhook`
4. Description: "Production webhook for subscription management"

### [ ] 5.3 Select Events to Listen

Check these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

Click **Add endpoint**

### [ ] 5.4 Get Webhook Signing Secret

1. After creating the endpoint, click on it
2. Click **Reveal** under "Signing secret"
3. ✅ Copy the secret: `whsec_xxxxxxxxxxxxx`
4. Go back to Vercel → Environment Variables
5. Update `STRIPE_WEBHOOK_SECRET` with this value
6. **Redeploy** the app in Vercel

---

## ☑️ **PHASE 6: Test Mode Testing** (20 minutes)

### [ ] 6.1 Switch to Test Mode

1. In Vercel, create **Preview** environment variables
2. Use `sk_test_...` and `pk_test_...` keys
3. Create test products/prices in Stripe Test Mode (same as Phase 2)

### [ ] 6.2 Test Checkout Flow

Use Stripe test cards: https://stripe.com/docs/testing

**Test Card:** `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

#### Test Scenarios:
- [ ] Click "Upgrade to Climber" → Select Monthly
- [ ] Complete checkout with test card
- [ ] Verify redirect to success page
- [ ] Check Stripe Dashboard → Payments (should show payment)
- [ ] Check Firebase → User doc → subscription field updated

### [ ] 6.3 Test Declined Card

**Declined Card:** `4000 0000 0000 0002`

- [ ] Try to upgrade
- [ ] Verify error message shows
- [ ] User remains on current plan

### [ ] 6.4 Test Webhook Delivery

1. Go to **Stripe Dashboard → Developers → Webhooks → Your endpoint**
2. Check "Events" tab
3. Should see events like `checkout.session.completed`
4. Click on event → Check "Response" shows 200 OK

---

## ☑️ **PHASE 7: Live Payment Testing (Red Team)** (20 minutes)

⚠️ **CRITICAL: Use real credit card for final test**

### [ ] 7.1 Switch to Live Mode in Vercel

1. Ensure all Production env variables use `sk_live_...` and `pk_live_...`
2. Redeploy the app

### [ ] 7.2 Test Live Payment - Climber Monthly ($7.99)

- [ ] Go to production app: `app.survivebackpacking.com`
- [ ] Click "Upgrade to Climber Plan"
- [ ] Select "Monthly" billing
- [ ] Use **YOUR REAL CREDIT CARD**
- [ ] Complete payment
- [ ] Verify redirect to success page
- [ ] Check email for receipt
- [ ] Verify in app: Plan shows as "Climber"
- [ ] Test locked feature → Should now be unlocked
- [ ] Check Stripe Dashboard → Payment shows in Live mode
- [ ] Check Firebase → User subscription updated

### [ ] 7.3 Test Subscription Management

1. Go to Stripe Dashboard → Customers
2. Find the customer you just created
3. Click "Cancel subscription"
4. Verify webhook fires
5. Verify user downgraded to Free tier in Firebase
6. Verify in app: Features locked again

### [ ] 7.4 Test Operator Plan

- [ ] Upgrade to Operator Plan ($14.99/mo)
- [ ] Complete checkout
- [ ] Verify Operator features unlock
- [ ] Check investment portfolio access
- [ ] Check side hustle tracker access

### [ ] 7.5 Test Founder's Circle

- [ ] Upgrade to Founder's Circle ($7.49/mo)
- [ ] Verify Founder badge appears
- [ ] Verify Operator-level access
- [ ] Check special "Founder" status in UI

---

## ☑️ **PHASE 8: Production Validation** (10 minutes)

### [ ] 8.1 Security Checklist

- [ ] Secret keys are ONLY in Vercel environment variables
- [ ] No secret keys in frontend code
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Firebase security rules active

### [ ] 8.2 Feature Access Verification

For each tier, verify correct access:

**Recon Kit (Free):**
- [ ] Basic dashboard cards visible
- [ ] Advanced features locked with upgrade prompt

**Climber Plan:**
- [ ] All dashboard cards visible
- [ ] Financial calculators accessible
- [ ] Side hustle/investments still locked

**Operator Plan:**
- [ ] All features unlocked
- [ ] Side hustle tracker accessible
- [ ] Investment portfolio accessible
- [ ] Travel mode accessible

**Founder's Circle:**
- [ ] Same as Operator
- [ ] Special "Founder" badge visible
- [ ] Price shows as $7.49/mo

### [ ] 8.3 Email Notifications

- [ ] Payment success emails sent by Stripe
- [ ] Receipts include correct pricing
- [ ] Company information correct

---

## ☑️ **PHASE 9: Monitoring Setup** (5 minutes)

### [ ] 9.1 Stripe Dashboard Monitoring

Bookmark these:
- [ ] **Payments:** https://dashboard.stripe.com/payments
- [ ] **Subscriptions:** https://dashboard.stripe.com/subscriptions
- [ ] **Customers:** https://dashboard.stripe.com/customers
- [ ] **Webhooks:** https://dashboard.stripe.com/webhooks

### [ ] 9.2 Set Up Alerts

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Enable webhook failure alerts
3. Add your email for notifications

---

## 🎉 **SUCCESS CRITERIA**

You're fully deployed when ALL of these are TRUE:

✅ Stripe products created in Live mode
✅ Webhooks configured and receiving events
✅ Live payment processed successfully with real credit card
✅ User subscription updated in Firebase after payment
✅ Features unlock/lock based on subscription tier
✅ Email receipts sent from Stripe
✅ Webhook signature verification working
✅ All environment variables set in Vercel Production
✅ Test mode and Live mode both working
✅ Cancel/downgrade flow tested and working

---

## 🚨 **TROUBLESHOOTING**

### Issue: "Stripe not defined"
- Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in Vercel
- Redeploy after adding environment variables

### Issue: "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check you're using the correct endpoint's secret
- Ensure webhook endpoint URL is correct

### Issue: "Payment succeeded but subscription not updated"
- Check Vercel Functions logs for errors
- Verify Firebase Admin SDK credentials are correct
- Check webhook events in Stripe Dashboard show 200 OK response

### Issue: "Firebase permission denied"
- Verify `FIREBASE_PRIVATE_KEY` is correctly formatted
- Check `FIREBASE_CLIENT_EMAIL` is correct
- Ensure Firebase service account has proper permissions

---

## 📞 **RESOURCES**

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Vercel Functions: https://vercel.com/docs/functions
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

**Total Time: ~90 minutes**

**Ready to accept payments! 🚀💰**

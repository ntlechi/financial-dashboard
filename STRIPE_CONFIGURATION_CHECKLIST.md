# ⚙️ STRIPE CONFIGURATION CHECKLIST
## What You MUST Configure Before Launch

**Critical:** These settings ensure payments work and users get access!  
**Time Needed:** 30 minutes  
**When:** Before October 19 launch

---

## ✅ **STEP 1: CHECKOUT REDIRECT URLS** (5 minutes)

### **Location:**
Stripe Dashboard → Settings → Checkout settings

### **Configure:**

**Success URL:**
```
https://app.survivebackpacking.com/success?session_id={CHECKOUT_SESSION_ID}
```

**Cancel URL:**
```
https://app.survivebackpacking.com/pricing
```

### **Why This Matters:**
- After payment, user must return to YOUR app (not stuck on Stripe!)
- Success URL shows confirmation + unlocks features
- Cancel URL lets them try again if they change mind

### **Test:**
- Use Stripe test mode
- Complete checkout
- Verify redirects to your success page
- session_id should be in URL

---

## ✅ **STEP 2: WEBHOOK ENDPOINT** (10 minutes)

### **Location:**
Stripe Dashboard → Developers → Webhooks

### **Add Endpoint:**
```
URL: https://app.survivebackpacking.com/api/stripe-webhook
Description: "Freedom Compass subscription updates"
```

### **Events to Listen For:**
```
✅ checkout.session.completed (user paid!)
✅ customer.subscription.created (subscription started)
✅ customer.subscription.updated (plan changed)
✅ customer.subscription.deleted (canceled)
✅ invoice.payment_succeeded (monthly billing success)
✅ invoice.payment_failed (payment declined)
```

### **Get Webhook Secret:**
After creating endpoint, Stripe shows:
```
Signing secret: whsec_xxxxxxxxxxxxx
```

**You need this for webhook verification!**

**Add to your .env file:**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### **Test Webhook:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### **Why This Matters:**
- Webhook updates Firebase when payment succeeds
- Without webhook, user pays but gets NO ACCESS!
- CRITICAL for payments to work!

---

## ✅ **STEP 3: CUSTOMER PORTAL** (5 minutes)

### **Location:**
Stripe Dashboard → Settings → Customer portal

### **Enable Portal:**
```
✅ Turn ON customer portal
```

### **Configure Allowed Actions:**
```
✅ Update payment method
✅ Cancel subscription
✅ View invoices
✅ Download receipts
❌ Switch plans (handle in your app)
```

### **Branding:**
```
- Upload logo
- Set brand colors
- Add support email
```

### **Why This Matters:**
- Users can self-manage subscriptions
- Reduces support burden
- Professional experience

---

## ✅ **STEP 4: EMAIL CUSTOMIZATION** (10 minutes)

### **Location:**
Stripe Dashboard → Settings → Emails

### **Customize These Emails:**

**1. Subscription Confirmation:**
```
SUBJECT: "Welcome to The Founder's Circle!"

BODY (customize):
"Thanks for joining!

You're now 1 of 100 lifetime Founder's Circle members.

Your Operator Plan access is active.

Get started:
→ Go to app.survivebackpacking.com
→ Check out the Supply Crate System
→ Start tracking your side hustles

See you on the trail!
Janara, Survive Backpacking"
```

**2. Payment Receipt:**
```
[Use Stripe's default or customize]

Make sure it includes:
- Amount ($7.49)
- Next billing date
- Subscription details
- Receipt PDF
```

**3. Upcoming Invoice Reminder:**
```
"Your subscription renews in 3 days"
[Stripe sends this automatically]
```

**4. Payment Failed:**
```
"We couldn't process your payment"
[Critical! Make sure this is set up!]
```

---

## ✅ **STEP 5: TEST MODE VERIFICATION** (15 minutes)

### **Before Going Live, Test:**

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### **Test Checklist:**
```
[ ] Create Stripe Checkout session
[ ] Complete payment with test card
[ ] Verify redirect to success page
[ ] Check webhook fired (Stripe Dashboard → Webhooks → Events)
[ ] Verify Firebase updated (check users/{userId}/subscription)
[ ] Verify app shows Founder's Circle access
[ ] Check email received
[ ] Test customer portal access
[ ] Test cancellation flow
[ ] Verify Firebase updates on cancel
```

### **If All Tests Pass:**
✅ Ready to enable LIVE mode!

---

## 🔴 **STEP 6: GO LIVE** (October 19)

### **Switch to Live Mode:**
```
1. Stripe Dashboard → Toggle "View test data" OFF
2. Use LIVE API keys in production
3. Webhook uses LIVE signing secret
4. All test subscriptions disappear
5. Real payments start working!
```

### **Live Checklist:**
```
[ ] Live API keys in .env (not test keys!)
[ ] Webhook secret is LIVE secret
[ ] Price IDs are production IDs (not test_)
[ ] Success/Cancel URLs point to production domain
[ ] Customer portal enabled in live mode
[ ] Email templates customized
[ ] First real payment tested
```

---

## 📊 **PRICE ID VERIFICATION:**

### **Current Price IDs (VERIFIED ✅):**

**Founder's Circle:**
```
price_1SEtrg82nQ0x7qb2NBJr0IVU
→ $7.49/month
→ Operator Plan access
→ Limited to 100 spots
```

**Early Adopter:**
```
price_1SH2rg82nQ0x7qb2wte7rkSV
→ $8.49/month
→ Operator Plan access
→ Limited to 500 spots
```

**Climber:**
```
Monthly: price_1fZu9ANe1ge3F07Q6aX7bW05 ($7.99)
Yearly: price_19B628l8GWaRtbQyard7bW06 ($79)
```

**Operator:**
```
Monthly: price_1aFa6oB1eu6Bd2fY6aX7bW03 ($14.99)
Yearly: price_14gM8wJ6yOcZBcUC0QD7bW04 ($149)
```

**All price IDs are in:**
- ✅ pricing.js (line 315-324)
- ✅ stripe-webhook.js (line 73-85)
- ✅ stripe-webhook.js (line 147-158)

**Status:** VERIFIED CONSISTENT! ✅

---

## 🚨 **CRITICAL: WHAT BREAKS IF NOT CONFIGURED:**

**If No Success URL:**
- User pays, stuck on Stripe page forever! 🚨
- Can't get back to app
- Bad experience

**If No Webhook:**
- User pays, Firebase doesn't update 🚨
- User has NO ACCESS to paid features!
- Payment failed from user perspective

**If Wrong Price IDs:**
- Webhook doesn't recognize payment 🚨
- Firebase doesn't update
- User pays but gets nothing!

**All of these would be LAUNCH DISASTERS!**

---

## ✅ **VERIFICATION CHECKLIST:**

**Before Launch (October 19):**

```
[ ] Success URL configured in Stripe
[ ] Cancel URL configured in Stripe
[ ] Webhook endpoint added
[ ] Webhook events selected (all 6)
[ ] Webhook secret in .env file
[ ] Customer portal enabled
[ ] Email templates customized
[ ] Test mode: All tests passed
[ ] Live mode: Ready to switch
[ ] Price IDs verified in code
[ ] First real test transaction (your card!)
```

**After First Real Payment:**
```
[ ] Webhook fired successfully
[ ] Firebase updated correctly
[ ] User got access immediately
[ ] Email sent
[ ] Receipt delivered
[ ] Customer can access portal
```

---

## 📞 **WHO TO CONTACT IF ISSUES:**

**Stripe Support:**
- Dashboard → Help
- 24/7 support chat
- Very responsive!

**Common Issues:**
- "Webhook not firing" → Check URL is public
- "Payment not updating app" → Check webhook secret
- "User stuck after payment" → Check Success URL

---

## 🎯 **30-MINUTE SETUP TIMELINE:**

**Minutes 0-5:** Configure Checkout URLs  
**Minutes 5-15:** Set up webhook endpoint  
**Minutes 15-20:** Enable customer portal  
**Minutes 20-30:** Customize emails  
**Minutes 30-45:** Test everything!

**Total:** 45 minutes to be payment-ready!

---

**DO THIS BEFORE OCTOBER 19!**  
**Payment flow MUST work on launch day!** 💳✅

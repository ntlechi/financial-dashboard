# 🌍 DOMAIN MIGRATION GUIDE
## From `app.survivebackpacking.com` → `app.kompul.com`

**Date:** October 31, 2025  
**Migration Type:** Full domain change with brand separation  
**Risk Level:** Medium (but manageable with proper planning)  
**Estimated Time:** 2-4 hours + DNS propagation (24-48 hours)

---

## 📊 **BRAND ARCHITECTURE (NEW)**

```
┌─────────────────────────────────────────────┐
│  SURVIVE BACKPACKING ECOSYSTEM             │
├─────────────────────────────────────────────┤
│                                             │
│  🏔️ www.survivebackpacking.com             │
│  └─ Blog, Philosophy, Content, Authority    │
│                                             │
│  💰 www.kompul.com                          │
│  └─ E-commerce (Physical Products)          │
│                                             │
│  📱 app.kompul.com                          │
│  └─ SaaS Product (Financial App)            │
│     • Separate & Sellable Asset             │
│     • Clean valuation                       │
│     • Acquisition-ready                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ **PRE-MIGRATION CHECKLIST**

### **Before You Start:**
- [ ] **Backup everything** (Firebase, Vercel, code)
- [ ] **Purchase kompul.com domain** (if not already owned)
- [ ] **Set up test environment** (test on staging first)
- [ ] **Notify users?** (Optional: depends on user base size)
- [ ] **Pick low-traffic time** (late night/weekend)
- [ ] **Have rollback plan ready**

---

## 🗺️ **MIGRATION ROADMAP**

### **Phase 1: Domain Setup** (30 mins)
### **Phase 2: Vercel Configuration** (30 mins)
### **Phase 3: Firebase Updates** (30 mins)
### **Phase 4: Stripe Configuration** (45 mins)
### **Phase 5: Code Changes** (30 mins)
### **Phase 6: Testing** (1 hour)
### **Phase 7: DNS Cutover** (5 mins + 24-48h propagation)
### **Phase 8: Cleanup** (30 mins)

---

## 📋 **PHASE 1: DOMAIN SETUP**

### **1.1 Purchase/Verify Domain**

**If you don't own kompul.com yet:**
- Go to your domain registrar (Namecheap, GoDaddy, etc.)
- Purchase `kompul.com`
- Keep registration private (WHOIS protection)

**Current Status Check:**
- [ ] Own `kompul.com`? Yes/No
- [ ] DNS access available? Yes/No
- [ ] Domain verified in registrar? Yes/No

### **1.2 Prepare DNS Records**

**You'll need to add these (DON'T add yet, just prepare):**

```dns
# For Vercel (Production)
Type: A
Name: app
Value: 76.76.21.21

# Alternative CNAME (if A record doesn't work)
Type: CNAME
Name: app
Value: cname.vercel-dns.com.

# For www redirect (if needed)
Type: CNAME
Name: www
Value: kompul.com
```

**Write these down - you'll add them in Phase 7!**

---

## 🔧 **NAMECHEAP SPECIFIC INSTRUCTIONS**

### **How to Add DNS Records in Namecheap:**

1. **Log into Namecheap**
   - Go to: https://www.namecheap.com/myaccount/login/
   - Enter your credentials

2. **Navigate to Domain List**
   - Click **Domain List** in left sidebar
   - Find `kompul.com`
   - Click **Manage** button

3. **Access DNS Settings**
   - Click **Advanced DNS** tab
   - You'll see existing DNS records

4. **Add A Record for App Subdomain:**
   - Click **Add New Record** button
   - Select: **A Record** from dropdown
   - Host: `app`
   - Value: `76.76.21.21`
   - TTL: **Automatic** or `3600`
   - Click **Save All Changes** (green checkmark)

5. **Alternative - CNAME Record (if Vercel tells you to use CNAME):**
   - Click **Add New Record** button
   - Select: **CNAME Record** from dropdown
   - Host: `app`
   - Value: `cname.vercel-dns.com.` (include the dot at the end!)
   - TTL: **Automatic** or `3600`
   - Click **Save All Changes**

### **Namecheap DNS Screenshot Reference:**

```
┌─────────────────────────────────────────────┐
│  Advanced DNS                               │
├─────────────────────────────────────────────┤
│  Type     Host    Value           TTL       │
│  ────────────────────────────────────────   │
│  A         app     76.76.21.21    Automatic │
│  ────────────────────────────────────────   │
│  [+ Add New Record]                         │
└─────────────────────────────────────────────┘
```

### **Important Namecheap Notes:**

- ⚠️ **Don't include the domain in Host field** - Just use `app`, NOT `app.kompul.com`
- ⚠️ **CNAME values need trailing dot** - Use `cname.vercel-dns.com.` with the dot!
- ⚠️ **Wait 5-10 minutes after saving** - Namecheap applies changes quickly
- ⚠️ **Use "Save All Changes" button** - Green checkmark at the top
- ✅ **Namecheap DNS is fast** - Usually propagates in 30 mins - 2 hours

### **Verify DNS in Namecheap:**

After adding records, you can verify:
1. Scroll down to **Domain** section
2. Look for **Nameservers** - Should show "Namecheap BasicDNS"
3. If using custom nameservers, this guide won't work - contact support

---

## 📋 **PHASE 2: VERCEL CONFIGURATION**

### **2.1 Add New Domain to Vercel**

1. **Go to Vercel Dashboard**
   - Open your project (financial-dashboard)
   - Click **Settings** → **Domains**

2. **Add Production Domain**
   - Click **Add Domain**
   - Enter: `app.kompul.com`
   - Click **Add**

3. **Vercel will show DNS instructions**
   - **DON'T add DNS records yet!**
   - Just note what Vercel tells you to add
   - We'll do DNS in Phase 7

4. **Keep old domain active for now**
   - Don't remove `app.survivebackpacking.com` yet
   - We'll remove it after successful migration

### **2.2 Update Environment Variables (if any)**

Check if you have any environment variables with the old domain:

```bash
# In Vercel Dashboard → Settings → Environment Variables
# Search for any variables containing:
# - survivebackpacking.com
# - app.survivebackpacking.com

# Example variables to check:
NEXT_PUBLIC_APP_URL=https://app.survivebackpacking.com  # UPDATE THIS
STRIPE_WEBHOOK_SECRET=...  # May need update
```

**Create a list of variables to update (update in Phase 5)**

---

## 📋 **PHASE 3: FIREBASE UPDATES**

### **3.1 Update Authentication Authorized Domains**

1. **Go to Firebase Console**
   - Select your project
   - Click **Authentication** → **Settings** → **Authorized domains**

2. **Add new domain:**
   - Click **Add domain**
   - Enter: `app.kompul.com`
   - Click **Add**

3. **Keep old domain active for now**
   - Don't remove `app.survivebackpacking.com` yet
   - We'll have both active during transition

### **3.2 Check Firestore Security Rules**

Search your Firestore rules for any hardcoded domain references:

```javascript
// Check your firestore.rules file
// Look for any references to survivebackpacking.com

// Example of what to look for:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if any rules reference the old domain
  }
}
```

**Most likely you don't have hardcoded domains in rules, but check to be sure.**

### **3.3 Update Firebase Config (if needed)**

Check your `src/firebase.js` file for any hardcoded URLs:

```javascript
// Look for any hardcoded references like:
// const API_URL = 'https://app.survivebackpacking.com'
```

---

## 📋 **PHASE 4: STRIPE CONFIGURATION**

**This is the most critical phase for payment processing!**

### **4.1 Update Webhook URLs**

1. **Go to Stripe Dashboard**
   - Navigate to **Developers** → **Webhooks**

2. **Find your webhook endpoint**
   - Look for: `app.survivebackpacking.com/api/webhooks/stripe`

3. **Add new webhook endpoint:**
   - Click **Add endpoint**
   - URL: `https://app.kompul.com/api/webhooks/stripe`
   - Events to send: Select same events as old webhook
   - Click **Add endpoint**

4. **Copy new webhook secret:**
   - Stripe will generate a new signing secret
   - Format: `whsec_...`
   - **SAVE THIS - You'll need it for Vercel env vars!**

5. **Keep old webhook active during transition**
   - Don't delete the old webhook yet
   - We'll have both active during migration

### **4.2 Update Checkout Session URLs**

Check your code for redirect URLs:

```javascript
// Look in your Stripe checkout code for:
success_url: 'https://app.survivebackpacking.com/success'
cancel_url: 'https://app.survivebackpacking.com/pricing'

// Update these to use environment variables instead:
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`
cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
```

### **4.3 Update Customer Portal Settings**

1. **Go to Stripe Dashboard**
   - Navigate to **Settings** → **Customer portal**

2. **Update business information:**
   - Business name: Consider if you want "Kompul" or "Survive Backpacking"
   - Support email: Update if needed
   - Privacy policy: Update URL
   - Terms of service: Update URL

3. **Update branding (optional):**
   - Logo
   - Colors
   - Icon

### **4.4 Update Business Profile**

1. **Go to Stripe Dashboard**
   - Navigate to **Settings** → **Business settings**

2. **Update public business information:**
   - Statement descriptor: "KOMPUL" or "SURVIVE BACKPACKING"?
   - Shortened descriptor (for credit card statements)
   - Support phone/email
   - Business website: `www.kompul.com`

---

## 📋 **PHASE 5: CODE CHANGES**

### **5.1 Search for Hardcoded URLs**

Run these searches in your codebase:

```bash
# Search for old domain
grep -r "survivebackpacking.com" src/
grep -r "survivebackpacking.com" public/
grep -r "survivebackpacking.com" *.js
grep -r "survivebackpacking.com" *.json

# Common places to check:
# - Landing page
# - Privacy policy
# - Terms of service
# - Email templates (if any)
# - API calls
# - Social meta tags
```

### **5.2 Update Landing Page**

Check `src/components/LandingPage.js` (or wherever your landing page is):

```javascript
// Update any references to:
// - survivebackpacking.com
// - Links to blog
// - Social media links
// - Contact forms

// Update meta tags:
<meta property="og:url" content="https://app.kompul.com" />
<link rel="canonical" href="https://app.kompul.com" />
```

### **5.3 Update Configuration Files**

**Check these files:**

1. **package.json** - homepage field (if any)
2. **next.config.js** - domain configurations (if any)
3. **public/robots.txt** - sitemap URL (if any)
4. **public/sitemap.xml** - URL references (if any)

### **5.4 Create Environment Variable Updates**

Update your `.env.local` and Vercel environment variables:

```bash
# Old:
NEXT_PUBLIC_APP_URL=https://app.survivebackpacking.com

# New:
NEXT_PUBLIC_APP_URL=https://app.kompul.com

# Also update:
STRIPE_WEBHOOK_SECRET=whsec_[NEW_SECRET_FROM_PHASE_4]
```

### **5.5 Update Social/SEO Meta Tags**

Look for all meta tags and update:

```html
<!-- Update in your HTML head or _document.js -->
<meta property="og:url" content="https://app.kompul.com" />
<meta property="og:site_name" content="Kompul" />
<meta name="twitter:url" content="https://app.kompul.com" />
<link rel="canonical" href="https://app.kompul.com" />
```

---

## 📋 **PHASE 6: TESTING**

### **6.1 Create Test Checklist**

Before going live, test these on STAGING with new domain:

**Authentication:**
- [ ] Sign up with email works
- [ ] Sign in with email works
- [ ] Anonymous sign-in works
- [ ] Password reset works
- [ ] Session persistence works

**Payment Flow:**
- [ ] Can view pricing page
- [ ] Can initiate checkout
- [ ] Payment succeeds (use Stripe test card)
- [ ] Redirected to success page correctly
- [ ] Webhook received and processed
- [ ] User subscription activated in Firebase

**Core Features:**
- [ ] Dashboard loads
- [ ] Can create transactions
- [ ] Can view reports
- [ ] Language switching works
- [ ] XP system works
- [ ] The Trail missions load

**SEO/Meta:**
- [ ] Open Graph tags show correct URL
- [ ] Canonical URLs correct
- [ ] Robots.txt accessible
- [ ] Sitemap accessible (if you have one)

### **6.2 Test Old Domain Still Works**

During transition, both domains should work:
- [ ] `app.survivebackpacking.com` still works
- [ ] `app.kompul.com` works (after DNS)
- [ ] No mixed content warnings
- [ ] No CORS errors

---

## 📋 **PHASE 7: DNS CUTOVER** ⚠️

**This is the actual migration moment!**

### **7.1 Add DNS Records**

1. **Log into your domain registrar** (where you bought kompul.com)

2. **Go to DNS management**

3. **Add A record for app subdomain:**
   ```
   Type: A
   Name: app
   Value: 76.76.21.21
   TTL: 3600 (1 hour)
   ```

4. **Or add CNAME record (use what Vercel told you):**
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com.
   TTL: 3600
   ```

5. **Save changes**

### **7.2 Wait for DNS Propagation**

- **Typical time:** 24-48 hours (sometimes faster)
- **Check progress:** Use https://dnschecker.org
  - Enter: `app.kompul.com`
  - Check if it resolves to Vercel's IP

### **7.3 Verify SSL Certificate**

Once DNS propagates:
- Vercel will automatically provision SSL (Let's Encrypt)
- Usually takes 5-10 minutes after DNS is live
- Check that `https://app.kompul.com` shows secure padlock

---

## 📋 **PHASE 8: POST-MIGRATION CLEANUP**

**Wait at least 1 week before cleanup to ensure everything works!**

### **8.1 Verify Everything Works on New Domain**

- [ ] All authentication flows work
- [ ] All payment flows work
- [ ] No console errors
- [ ] Users can access their data
- [ ] Subscriptions are active
- [ ] Analytics tracking (if any)

### **8.2 Set Up Redirect from Old Domain**

**Option A: Vercel Redirect (Recommended)**

In Vercel, keep `app.survivebackpacking.com` but add redirect:

```javascript
// In vercel.json or next.config.js
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://app.kompul.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

**Option B: DNS CNAME**

Point `app.survivebackpacking.com` CNAME to `app.kompul.com`

### **8.3 Clean Up Old Configurations**

After 2-4 weeks of stable operation:

**Firebase:**
- Remove `app.survivebackpacking.com` from authorized domains

**Stripe:**
- Disable old webhook endpoint
- Verify all payments going through new endpoint

**Vercel:**
- Remove old domain from project (optional, keep for redirects)

### **8.4 Update External Links**

- [ ] Update links on www.survivebackpacking.com blog
- [ ] Update social media bios
- [ ] Update email signatures
- [ ] Update business cards (if any)
- [ ] Update any paid ads
- [ ] Update app store listings (if applicable)

---

## 🚨 **ROLLBACK PLAN**

If something goes wrong:

### **Quick Rollback (5 minutes):**

1. **Remove DNS records** for `app.kompul.com`
2. **Remove domain** from Vercel
3. **Keep using** `app.survivebackpacking.com`
4. **Investigate issue** without pressure

### **What Can Go Wrong:**

| Issue | Solution |
|-------|----------|
| **DNS not propagating** | Wait 24-48h, check DNS settings |
| **SSL not working** | Check DNS, wait for Vercel to provision |
| **Webhooks failing** | Double-check Stripe webhook URL & secret |
| **Auth broken** | Verify Firebase authorized domains |
| **CORS errors** | Check API endpoints, environment variables |

---

## 📊 **COST BREAKDOWN**

| Item | Cost | Notes |
|------|------|-------|
| **kompul.com domain** | $10-15/year | One-time purchase |
| **SSL Certificate** | FREE | Automatic via Vercel |
| **DNS Hosting** | FREE | Included with domain |
| **Vercel Hosting** | Current plan | No change |
| **Firebase** | Current plan | No change |
| **Stripe** | Current plan | No change |
| **Developer Time** | 2-4 hours | Your time |
| **Total New Costs** | ~$12/year | Just domain renewal |

---

## ✅ **FINAL CHECKLIST**

**Before Migration:**
- [ ] Backup all data
- [ ] Purchase/verify kompul.com domain
- [ ] Create detailed task list
- [ ] Schedule migration during low-traffic time
- [ ] Inform team/stakeholders

**During Migration:**
- [ ] Follow phases 1-7 in order
- [ ] Test each phase before moving to next
- [ ] Keep old domain active during transition
- [ ] Monitor error logs

**After Migration:**
- [ ] Verify all features work
- [ ] Monitor for 1 week before cleanup
- [ ] Set up redirects
- [ ] Update external links
- [ ] Celebrate! 🎉

---

## 🎯 **RECOMMENDED TIMELINE**

**Week 1: Preparation**
- Buy domain
- Review this guide
- Identify all code changes needed
- Create backup

**Week 2: Staging Test**
- Set up staging environment
- Test full migration on staging
- Fix any issues found

**Week 3: Production Migration**
- Pick low-traffic day (Saturday night?)
- Execute phases 1-7
- Monitor closely

**Week 4-5: Monitoring**
- Watch for issues
- Keep old domain active as backup
- Collect user feedback

**Week 6+: Cleanup**
- Set up redirects
- Clean up old configurations
- Update external links

---

## 📞 **SUPPORT RESOURCES**

**Vercel Docs:**
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

**Firebase Docs:**
- Authorized Domains: https://firebase.google.com/docs/auth/web/redirect-best-practices

**Stripe Docs:**
- Webhooks: https://stripe.com/docs/webhooks

**DNS Checker:**
- https://dnschecker.org

---

## 💡 **PRO TIPS**

1. **Do it on a Friday night** - Gives you the weekend to fix issues
2. **Keep both domains active** for 2-4 weeks minimum
3. **Monitor Stripe webhooks** closely - payment issues are critical
4. **Test anonymous users** - Auth issues often affect new users first
5. **Use environment variables** - Never hardcode domains
6. **Document everything** - Future you will thank you
7. **Have rollback plan ready** - Be prepared to revert quickly

---

## 🚀 **POST-MIGRATION BENEFITS**

Once complete, you'll have:
- ✅ **Clean brand separation** (huge for acquisition)
- ✅ **Professional domain structure**
- ✅ **Scalable architecture**
- ✅ **Clear valuation boundaries**
- ✅ **Better SEO** for each property
- ✅ **Investor-ready** infrastructure

**This positions Kompul as a serious, sellable SaaS business!** 🏆

---

## 📝 **NOTES & OBSERVATIONS**

```
Date: _______________
Time Started: ________
Time Completed: ______

Issues Encountered:
__________________________________________________
__________________________________________________

Solutions Applied:
__________________________________________________
__________________________________________________

Rollback Required? Yes / No

Final Status: Success / Partial / Failed

Next Steps:
__________________________________________________
__________________________________________________
```

---

**Good luck with your migration!** 💪🚀

**Remember:** This is a SMART business move that will pay dividends later!


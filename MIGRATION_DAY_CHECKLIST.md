# ⚡ DOMAIN MIGRATION - QUICK CHECKLIST
## `app.survivebackpacking.com` → `app.kompul.com`

**Print this and check off as you go!** ✅

---

## 🎯 **MIGRATION DAY SCHEDULE**

**Recommended:** Friday night or Saturday  
**Duration:** 2-4 hours + 24-48h DNS propagation  
**Team:** Just you (unless you want backup)

---

## ✅ **PRE-MIGRATION (Do 1 Week Before)**

- [ ] **Own kompul.com domain**
- [ ] **Backup Firebase data** (export collections)
- [ ] **Backup Vercel project** (GitHub already backing up)
- [ ] **Test on staging** (optional but recommended)
- [ ] **Read full DOMAIN_MIGRATION_GUIDE.md**
- [ ] **Schedule migration time** (low traffic period)
- [ ] **Notify users?** (optional, depends on user base)

---

## ⚡ **MIGRATION DAY - PHASE BY PHASE**

### **Phase 1: VERCEL (30 mins)**

- [ ] Log into Vercel Dashboard
- [ ] Go to project → Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter: `app.kompul.com`
- [ ] Note Vercel's DNS instructions (don't add to DNS yet!)
- [ ] Check Environment Variables for old domain references
- [ ] Note down any variables that need updating

**Environment Variables to Update:**
```
NEXT_PUBLIC_APP_URL = https://app.kompul.com
STRIPE_WEBHOOK_SECRET = [will get from Stripe phase]
```

---

### **Phase 2: FIREBASE (20 mins)**

- [ ] Open Firebase Console
- [ ] Go to Authentication → Settings → Authorized domains
- [ ] Click "Add domain"
- [ ] Add: `app.kompul.com`
- [ ] **DON'T remove old domain yet**
- [ ] Check Firestore rules for hardcoded domain (unlikely)
- [ ] Check src/firebase.js for hardcoded URLs

---

### **Phase 3: STRIPE (45 mins)** ⚠️ **CRITICAL**

#### **Webhooks:**
- [ ] Log into Stripe Dashboard
- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] URL: `https://app.kompul.com/api/webhooks/stripe`
- [ ] Select same events as existing webhook
- [ ] Click "Add endpoint"
- [ ] **COPY NEW WEBHOOK SECRET:** `whsec_________________`
- [ ] **SAVE THIS SECRET** (you need it for Vercel!)
- [ ] **DON'T delete old webhook yet**

#### **Business Settings:**
- [ ] Go to Settings → Business settings
- [ ] Update statement descriptor (optional)
- [ ] Update support email/phone (if needed)
- [ ] Update website: `www.kompul.com`

#### **Customer Portal:**
- [ ] Go to Settings → Customer portal
- [ ] Update privacy policy URL (if needed)
- [ ] Update terms of service URL (if needed)

---

### **Phase 4: CODE CHANGES (30 mins)**

#### **Search for Hardcoded URLs:**
```bash
grep -r "survivebackpacking.com" src/
grep -r "survivebackpacking.com" public/
```

#### **Files to Check & Update:**

- [ ] **Landing page** - Update domain references
- [ ] **Privacy policy** - Update domain/company name
- [ ] **Terms of service** - Update domain/company name
- [ ] **Meta tags** - Update og:url, canonical
- [ ] **Package.json** - Check homepage field
- [ ] **Public/robots.txt** - Update sitemap URL (if exists)
- [ ] **Any email templates** - Update links

#### **Update Stripe Code:**

Find your Stripe checkout code and update:

```javascript
// OLD:
success_url: 'https://app.survivebackpacking.com/success'
cancel_url: 'https://app.survivebackpacking.com/pricing'

// NEW:
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`
cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
```

#### **Commit Changes:**
```bash
git add .
git commit -m "Update domain references for kompul.com migration"
git push origin main
```

---

### **Phase 5: UPDATE VERCEL ENV VARS (10 mins)**

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to `https://app.kompul.com`
- [ ] Update `STRIPE_WEBHOOK_SECRET` with NEW secret from Phase 3
- [ ] Click "Save"
- [ ] **Redeploy** (Vercel → Deployments → Redeploy latest)

---

### **Phase 6: DNS CUTOVER** ⚠️ **THE BIG MOMENT**

- [ ] Log into domain registrar (where you bought kompul.com)
- [ ] Go to DNS Management
- [ ] Add A record:
  ```
  Type: A
  Name: app
  Value: 76.76.21.21
  TTL: 3600
  ```
  OR CNAME (use what Vercel told you):
  ```
  Type: CNAME
  Name: app
  Value: cname.vercel-dns.com.
  TTL: 3600
  ```
- [ ] Save DNS changes
- [ ] **Wait for propagation** (24-48 hours)

#### **Check DNS Propagation:**
- Use https://dnschecker.org
- Enter: `app.kompul.com`
- Wait until it shows Vercel's IP globally

---

### **Phase 7: VERIFICATION (After DNS Propagates)**

#### **SSL Certificate:**
- [ ] Visit `https://app.kompul.com`
- [ ] Verify secure padlock shows
- [ ] Check certificate is valid (click padlock)

#### **Authentication:**
- [ ] Sign up with new email works
- [ ] Sign in works
- [ ] Anonymous sign-in works
- [ ] Password reset works

#### **Payments:**
- [ ] Can view pricing page
- [ ] Can initiate checkout (use test card: 4242 4242 4242 4242)
- [ ] Payment succeeds
- [ ] Redirected to correct success page
- [ ] Check Stripe webhook received
- [ ] Verify subscription activated in Firebase

#### **Core Features:**
- [ ] Dashboard loads
- [ ] Can create transactions
- [ ] Language switching works
- [ ] XP system works
- [ ] The Trail missions load

#### **Both Domains Work:**
- [ ] `app.kompul.com` works
- [ ] `app.survivebackpacking.com` still works (as backup)

---

## ⏰ **POST-MIGRATION MONITORING (First Week)**

### **Day 1-2:**
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Stripe webhooks (check success rate)
- [ ] Check Firebase auth logs
- [ ] Test from different devices/browsers

### **Day 3-7:**
- [ ] Monitor user complaints/issues
- [ ] Check payment success rate
- [ ] Verify new users can sign up
- [ ] Verify existing users can log in

---

## 🧹 **CLEANUP (After 2-4 Weeks of Stable Operation)**

### **Redirects:**
- [ ] Set up 301 redirect from old to new domain
  ```javascript
  // In vercel.json or next.config.js
  {
    "redirects": [
      {
        "source": "/:path*",
        "destination": "https://app.kompul.com/:path*",
        "permanent": true
      }
    ]
  }
  ```

### **Firebase:**
- [ ] Remove `app.survivebackpacking.com` from authorized domains

### **Stripe:**
- [ ] Disable old webhook endpoint
- [ ] Verify all webhooks going through new endpoint

### **External Links:**
- [ ] Update www.survivebackpacking.com blog links
- [ ] Update social media bios
- [ ] Update email signatures
- [ ] Update any paid advertising
- [ ] Update business cards (if any)

---

## 🚨 **IF SOMETHING GOES WRONG - ROLLBACK**

### **Quick Rollback (5 mins):**

1. **Remove DNS records** for app.kompul.com
2. **Remove domain** from Vercel
3. **Switch back** to using app.survivebackpacking.com
4. **Investigate** without pressure

### **Common Issues & Fixes:**

| Problem | Fix |
|---------|-----|
| DNS not working | Wait 24-48h, check DNS settings |
| SSL not loading | Wait for Vercel to provision (10-30 mins) |
| Webhooks failing | Verify webhook secret in Vercel env vars |
| Auth broken | Check Firebase authorized domains |
| CORS errors | Check environment variables |

---

## 📊 **MIGRATION STATUS TRACKER**

```
Start Time: _______________
End Time: _______________
DNS Propagation Complete: _______________

Issues Encountered:
_________________________________________
_________________________________________

Solutions Applied:
_________________________________________
_________________________________________

Status: ☐ Success  ☐ Partial  ☐ Rollback Required

Notes:
_________________________________________
_________________________________________
_________________________________________
```

---

## 💡 **QUICK TIPS**

1. ☕ **Have coffee ready** - This takes focus
2. 📱 **Test on mobile too** - Don't just test desktop
3. 🔍 **Use incognito** - Avoid cache issues
4. 📊 **Keep analytics open** - Watch real-time traffic
5. 💬 **Have support ready** - In case users report issues
6. ⏰ **Don't rush DNS** - Propagation takes time
7. 🎯 **Test payments first** - Most critical feature

---

## 🎉 **POST-MIGRATION CELEBRATION**

Once everything is verified and working:

- [ ] Take a screenshot of new domain
- [ ] Post on social media (optional)
- [ ] Update portfolio/resume
- [ ] Pat yourself on the back - this is a big deal! 🏆

**You now have a professional, sellable SaaS product!** 💰

---

## 📞 **NEED HELP?**

**Resources:**
- Full guide: `DOMAIN_MIGRATION_GUIDE.md`
- Vercel docs: https://vercel.com/docs/concepts/projects/domains
- Firebase docs: https://firebase.google.com/docs/auth
- Stripe docs: https://stripe.com/docs/webhooks

**Emergency Rollback:**
- Remove DNS records immediately
- Old domain will still work
- No data loss possible

---

**Remember:** This is a SMART business decision! 🚀

**Good luck!** 💪


# 📧 GMAIL FILTER RULES - COPY/PASTE SETUP
## Automate Your Email Organization

---

## 🎯 HOW TO ADD FILTERS IN GMAIL

1. Open Gmail
2. Click the search box at the top
3. Click the filter icon (☰) on the right side of search box
4. Enter criteria from each filter below
5. Click "Create filter"
6. Check the actions listed
7. Click "Create filter"

**Do this for each filter below** ⬇️

---

## 📋 LABEL STRUCTURE TO CREATE FIRST

**Before creating filters, create these labels:**

### **In Gmail Settings → Labels:**

Create these labels (type them exactly):
```
1-ACTION REQUIRED
1-ACTION REQUIRED/1.1-URGENT
1-ACTION REQUIRED/1.2-THIS WEEK
1-ACTION REQUIRED/1.3-THIS MONTH

2-BUSINESS
2-BUSINESS/2.1-App
2-BUSINESS/2.2-Marketing
2-BUSINESS/2.3-Legal
2-BUSINESS/2.4-Financial
2-BUSINESS/2.5-Restaurant

3-CONTENT
3-CONTENT/3.1-Blog Ideas
3-CONTENT/3.2-YouTube Ideas
3-CONTENT/3.3-Social Media

4-CUSTOMERS
4-CUSTOMERS/4.1-Support Tickets
4-CUSTOMERS/4.2-Feature Requests
4-CUSTOMERS/4.3-Testimonials

5-SUBSCRIPTIONS
5-SUBSCRIPTIONS/5.1-Software
5-SUBSCRIPTIONS/5.2-Services
5-SUBSCRIPTIONS/5.3-Newsletters

9-ARCHIVE
9-ARCHIVE/9.1-Completed
9-ARCHIVE/9.2-Reference
```

**Slash (/) creates nested labels automatically!** ✅

---

## 🔥 FILTER RULES

### **FILTER 1: STRIPE NOTIFICATIONS**

**Criteria:**
```
From: stripe.com OR no-reply@stripe.com
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "2-BUSINESS/2.4-Financial"
- ✅ Mark as read

**Why:** Keeps financial notifications organized, not cluttering inbox

---

### **FILTER 2: STRIPE IMPORTANT (Failures/Issues)**

**Criteria:**
```
From: stripe.com
Subject: (failed OR failure OR problem OR issue)
```

**Actions:**
- ✅ Never send to Spam
- ✅ Apply label: "2-BUSINESS/2.4-Financial"
- ✅ Mark as important
- ✅ Star it

**Why:** Payment failures need immediate attention

---

### **FILTER 3: FIREBASE ALERTS**

**Criteria:**
```
From: firebase.google.com OR noreply@firebase.google.com
```

**Actions:**
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Never send to Spam

**Why:** App infrastructure notifications

---

### **FILTER 4: FIREBASE CRITICAL**

**Criteria:**
```
From: firebase.google.com
Subject: (alert OR critical OR error OR down)
```

**Actions:**
- ✅ Never send to Spam
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Star it
- ✅ Mark as important

**Why:** Critical app issues need immediate attention

---

### **FILTER 5: USER SUPPORT EMAILS**

**Criteria:**
```
To: support@survivebackpacking.com
```

**Actions:**
- ✅ Apply label: "4-CUSTOMERS/4.1-Support Tickets"
- ✅ Star it
- ✅ Mark as important
- ✅ Never send to Spam

**Why:** User needs help - high priority

---

### **FILTER 6: USER FEEDBACK**

**Criteria:**
```
Subject: (feedback OR suggestion OR feature request OR improvement)
To: support@survivebackpacking.com OR hello@survivebackpacking.com
```

**Actions:**
- ✅ Apply label: "4-CUSTOMERS/4.2-Feature Requests"
- ✅ Mark as important

**Why:** User feedback is valuable for product development

---

### **FILTER 7: CONVERTKIT NOTIFICATIONS**

**Criteria:**
```
From: convertkit.com
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "3-CONTENT"
- ✅ Mark as read

**Why:** ConvertKit notifications for email marketing

---

### **FILTER 8: NEW SUBSCRIBER NOTIFICATIONS**

**Criteria:**
```
From: convertkit.com
Subject: (new subscriber OR joined)
```

**Actions:**
- ✅ Apply label: "3-CONTENT"
- ✅ Mark as important

**Why:** New subscribers are wins to celebrate

---

### **FILTER 9: GITHUB NOTIFICATIONS**

**Criteria:**
```
From: github.com OR notifications@github.com
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Mark as read

**Why:** GitHub notifications can be checked when needed

---

### **FILTER 10: VERCEL DEPLOYMENTS**

**Criteria:**
```
From: vercel.com
Subject: (deployed OR deployment)
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Mark as read

**Why:** Deployment confirmations, don't need in inbox

---

### **FILTER 11: VERCEL ERRORS**

**Criteria:**
```
From: vercel.com
Subject: (failed OR error OR build failed)
```

**Actions:**
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Star it
- ✅ Mark as important

**Why:** Deployment failures need attention

---

### **FILTER 12: INVOICES & RECEIPTS**

**Criteria:**
```
Subject: (invoice OR receipt OR payment confirmation)
```

**Actions:**
- ✅ Apply label: "2-BUSINESS/2.4-Financial"
- ✅ Never send to Spam

**Why:** Financial records need to be organized

---

### **FILTER 13: DOMAIN/HOSTING**

**Criteria:**
```
From: (namecheap.com OR godaddy.com OR google domains)
```

**Actions:**
- ✅ Apply label: "2-BUSINESS/2.1-App"
- ✅ Mark as important

**Why:** Domain renewals and hosting notifications

---

### **FILTER 14: CALENDLY/MEETING CONFIRMATIONS**

**Criteria:**
```
From: calendly.com
Subject: (confirmed OR cancelled OR rescheduled)
```

**Actions:**
- ✅ Apply label: "1-ACTION REQUIRED/1.2-THIS WEEK"
- ✅ Star it

**Why:** Meeting confirmations need to be on your radar

---

### **FILTER 15: NEWSLETTERS (GENERAL)**

**Criteria:**
```
From: (substack.com OR newsletter)
-Subject: (invoice OR receipt)
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "5-SUBSCRIPTIONS/5.3-Newsletters"
- ✅ Mark as read

**Why:** Read newsletters in batch, not as they arrive

---

### **FILTER 16: MARKETING EMAILS**

**Criteria:**
```
List: (unsubscribe OR list-unsubscribe)
-From: (stripe.com OR firebase.com OR vercel.com OR convertkit.com)
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "5-SUBSCRIPTIONS/5.3-Newsletters"
- ✅ Mark as read

**Why:** Marketing emails with unsubscribe = newsletter/promo

---

### **FILTER 17: SOCIAL MEDIA NOTIFICATIONS**

**Criteria:**
```
From: (twitter.com OR instagram.com OR linkedin.com OR facebook.com OR tiktok.com)
Subject: (notification OR mentioned OR tagged OR followed)
```

**Actions:**
- ✅ Skip Inbox (Archive it)
- ✅ Apply label: "3-CONTENT/3.3-Social Media"
- ✅ Mark as read

**Why:** Check social media on your schedule, not theirs

---

### **FILTER 18: PASSWORD RESET REQUESTS**

**Criteria:**
```
Subject: (password reset OR reset your password OR forgot password)
```

**Actions:**
- ✅ Mark as important
- ✅ Never send to Spam

**Why:** Security-related emails should never be missed

---

### **FILTER 19: LEGAL/COMPLIANCE**

**Criteria:**
```
Subject: (terms of service OR privacy policy OR legal OR compliance OR GDPR)
```

**Actions:**
- ✅ Apply label: "2-BUSINESS/2.3-Legal"
- ✅ Mark as important

**Why:** Legal changes need to be reviewed

---

### **FILTER 20: TESTIMONIALS & REVIEWS**

**Criteria:**
```
Subject: (testimonial OR review OR loved your OR amazing OR thank you for)
To: support@survivebackpacking.com OR hello@survivebackpacking.com
```

**Actions:**
- ✅ Apply label: "4-CUSTOMERS/4.3-Testimonials"
- ✅ Star it
- ✅ Mark as important

**Why:** Positive feedback = marketing gold

---

## 🎯 ADVANCED FILTERS (Optional)

### **FILTER 21: AUTO-ARCHIVE OLD PROMOTIONS**

**Criteria:**
```
Label: "5-SUBSCRIPTIONS/5.3-Newsletters"
Older than: 14 days
```

**Actions:**
- ✅ Delete it (or Archive)

**Why:** Auto-cleanup old newsletters you didn't read

**⚠️ Set this up as a recurring task, not a filter (Gmail doesn't support auto-delete by age)**

---

### **FILTER 22: HIGHLIGHT URGENT KEYWORDS**

**Criteria:**
```
Subject: (urgent OR asap OR immediately OR critical OR emergency)
-From: (promotional OR marketing)
```

**Actions:**
- ✅ Never skip inbox
- ✅ Star it
- ✅ Apply label: "1-ACTION REQUIRED/1.1-URGENT"
- ✅ Mark as important

**Why:** Catch truly urgent items

---

## 📊 INBOX ZERO WORKFLOW

### **DAILY ROUTINE (15 minutes):**

1. **Check "1-ACTION REQUIRED" labels**
   - Start with 1.1-URGENT
   - Then 1.2-THIS WEEK
   - Then 1.3-THIS MONTH

2. **Process Inbox**
   - Reply if <2 minutes
   - Add to Notion Tasks if >2 minutes
   - Label and archive

3. **Check "4-CUSTOMERS" labels**
   - Respond to support tickets
   - Review feature requests
   - Celebrate testimonials

4. **Inbox should be at ZERO**

### **WEEKLY BATCH:**

- **"5-SUBSCRIPTIONS/5.3-Newsletters"**
  - Read on Friday morning
  - Capture ideas to Notion
  - Archive or delete

---

## ⚡ GMAIL SETTINGS TO CONFIGURE

### **Go to Settings → General:**

1. **Undo Send:** 30 seconds
2. **Conversation view:** ON
3. **Smart Compose:** ON (helps write faster)
4. **Default reply behavior:** Reply all
5. **Maximum page size:** 50 (see more emails at once)

### **Go to Settings → Inbox:**

1. **Inbox type:** Default
2. **Categories:** Disable all (you have labels now)
3. **Importance markers:** Show markers

### **Go to Settings → Filters and Blocked Addresses:**

- ✅ All your filters should be listed here
- You can edit them anytime

---

## 🎨 COLOR CODE YOUR LABELS (Optional)

Make labels visual:

```
1-ACTION REQUIRED → Red
2-BUSINESS → Blue
3-CONTENT → Green
4-CUSTOMERS → Yellow
5-SUBSCRIPTIONS → Gray
9-ARCHIVE → Light Gray
```

**How:**
1. Settings → Labels
2. Click the colored box next to label name
3. Choose color

---

## 📱 GMAIL MOBILE APP SETUP

### **In Gmail app:**

1. **Settings → [Your Account] → Label settings**
2. **Enable notifications for:**
   - 1-ACTION REQUIRED (all sub-labels)
   - 4-CUSTOMERS/4.1-Support Tickets

3. **Disable notifications for:**
   - 5-SUBSCRIPTIONS/5.3-Newsletters
   - 9-ARCHIVE

**This way you only get notified for important stuff!** ✅

---

## 🧹 MAINTENANCE

### **Monthly (15 minutes):**

- Review labels that are growing
- Unsubscribe from newsletters you don't read
- Clean up "9-ARCHIVE" (delete old stuff)
- Adjust filters if needed

### **Quarterly (30 minutes):**

- Review filter effectiveness
- Add new filters for recurring patterns
- Update label structure if needed

---

## ✅ QUICK SETUP CHECKLIST

**This weekend:**

- [ ] Day 1: Create all labels (30 minutes)
- [ ] Day 1: Set up first 10 filters (45 minutes)
- [ ] Day 2: Set up remaining filters (30 minutes)
- [ ] Day 2: Configure Gmail settings (15 minutes)
- [ ] Day 2: Process current inbox using new system (1 hour)
- [ ] Day 3: Use for one day, adjust as needed (30 minutes)

**Total: ~3.5 hours**
**Result: Inbox Zero forever** ✅

---

## 💡 PRO TIPS

1. **Use search operators:**
   - `label:1-ACTION-REQUIRED` - See all action items
   - `is:starred` - See all starred emails
   - `is:unread label:4-CUSTOMERS` - See unread customer emails

2. **Keyboard shortcuts:**
   - Enable in Settings → General → Keyboard shortcuts
   - `e` = Archive
   - `l` = Label
   - `#` = Delete
   - `*` → `a` = Select all

3. **Multiple inboxes:**
   - Settings → Advanced → Enable "Multiple Inboxes"
   - Show "1-ACTION REQUIRED" as a pane in inbox
   - See important stuff without switching views

4. **Templates (Canned Responses):**
   - Settings → Advanced → Enable "Templates"
   - Create templates for common replies:
     - "Thanks for the support question..."
     - "Feature request received..."
     - "Testimonial thank you..."

---

**INSTALL THIS SYSTEM AND NEVER MISS IMPORTANT EMAILS AGAIN** 🚀

---





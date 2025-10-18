# 🧪 Stripe → ConvertKit Integration Test Guide

## 🎯 **Goal**: Test all pricing tiers with 100% rebate to populate ConvertKit

---

## 📋 **Step-by-Step Process:**

### **Step 1: Create 100% Rebate Coupon in Stripe**

1. **Go to Stripe Dashboard** → **Products** → **Coupons**
2. **Click "Create coupon"**
3. **Fill in the details:**
   ```
   Coupon ID: LAUNCH_TEST_100_OFF
   Name: Launch Test - 100% Off
   Type: Percentage
   Percentage: 100
   Duration: Forever
   Redemption limit: 50
   Description: Test coupon for launch - 100% off all plans
   ```
4. **Click "Create coupon"**

### **Step 2: Test Each Pricing Tier**

**Test Order (Recommended):**
1. **Founder's Circle** ($7.49/month) → Should show as $0.00
2. **Early Adopter** ($8.49/month) → Should show as $0.00  
3. **Climber Monthly** ($7.99/month) → Should show as $0.00
4. **Climber Yearly** ($79/year) → Should show as $0.00
5. **Operator Monthly** ($14.99/month) → Should show as $0.00
6. **Operator Yearly** ($149/year) → Should show as $0.00

### **Step 3: How to Apply the Coupon**

1. **Go to your app** → **Upgrade/Pricing page**
2. **Select any plan** → **Click "Upgrade"**
3. **On Stripe checkout page** → **Look for "Add promotion code" link**
4. **Enter**: `LAUNCH_TEST_100_OFF`
5. **Apply the coupon** → **Should show $0.00 total**
6. **Complete the checkout** with test card: `4242 4242 4242 4242`

### **Step 4: Verify ConvertKit Integration**

**After each successful test purchase:**
1. **Check Stripe Dashboard** → **Webhooks** → **ConvertKit destination**
2. **Look for successful deliveries** (should show > 0)
3. **Check ConvertKit** → **Automation** → **Entry Points**
4. **Verify the product appears** in the dropdown

---

## 🎯 **Expected Results:**

### **After Testing All Tiers:**
- ✅ **ConvertKit will show all 4 products** in automation dropdown
- ✅ **Webhook events** will show successful deliveries
- ✅ **Email automation** can be set up for each product
- ✅ **Ready for launch** with full email marketing

### **Test Card Details:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

---

## 🚨 **Important Notes:**

1. **Use real email addresses** for testing (they'll be added to ConvertKit)
2. **Test with different emails** for each pricing tier
3. **Monitor Stripe dashboard** for successful payments
4. **Check ConvertKit** after each test to see products appearing

---

## 🎉 **Success Criteria:**

- **All 4 products** visible in ConvertKit automation
- **Webhook events** showing successful deliveries
- **Email sequences** can be set up for each product
- **Ready for October 19th launch**

---

**Ready to test? Start with the Founder's Circle plan! 🚀**

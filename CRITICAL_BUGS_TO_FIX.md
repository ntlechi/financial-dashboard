# 🚨 CRITICAL BUGS - Must Fix Before Launch (Oct 19)

## Priority Level: URGENT

---

## 🗺️ BUG #1: Travel Page Map Scroll-to-Top
**Severity:** HIGH  
**Impact:** Major UX frustration
**Status:** IDENTIFIED  

**Issue:**
When user taps on map on mobile, page scrolls to top

**Root Cause:**
Likely: Default anchor/link behavior or parent scroll handler

**Fix Needed:**
Prevent scroll on map interaction

---

## 📱 BUG #2: Calendar Inputs Overflow on Mobile
**Severity:** MEDIUM-HIGH  
**Impact:** Unprofessional appearance  
**Status:** NEEDS INVESTIGATION

**Issue:**
Date input fields extend beyond container borders on mobile

**Locations:**
- All modals with date inputs
- Business creation
- Transaction modals
- Trip creation
- Moments

**Fix Needed:**
- Responsive width classes
- Test on mobile viewports
- Ensure proper containment

---

## 🎮 BUG #3: New Features Missing XP Integration
**Severity:** MEDIUM  
**Impact:** Incomplete gamification  
**Status:** NEEDS IMPLEMENTATION

**Missing XP Awards:**
1. Supply Crate creation (new feature!)
2. Field Notes milestones (newly free!)
3. First Climb Protocol (implemented but needs testing)

**Fix Needed:**
- Add XP awards to new features
- Trigger banner refresh
- Test all XP flows

---

## 🧹 BUG #4: 185 Console.log Statements
**Severity:** LOW  
**Impact:** Performance & professionalism  
**Status:** NEEDS CLEANUP

**Issue:**
185 debug console statements in production

**Fix Needed:**
Remove or conditionally disable for production

---

## ✅ COMPLETION CHECKLIST:

- [ ] Travel map scroll bug FIXED
- [ ] Mobile calendar inputs FIXED
- [ ] Supply Crate XP integrated
- [ ] Field Notes XP milestones added
- [ ] Console logs cleaned up
- [ ] All calculations verified
- [ ] Load testing completed
- [ ] Mobile testing on 3+ devices
- [ ] Final smoke test passed

**TARGET: All fixed by October 18, 2025**

# 🔍 DASHBOARD AUDIT - Found Issues

**Date:** October 29, 2025  
**Page:** Dashboard  
**Status:** Auditing...

---

## ❌ FOUND UNTRANSLATED STRINGS:

### **1. Tooltips (title attributes)**
- Line 862: `title="Status Legend"` ← Rainy Day Fund section
- Line 1707: `title="Edit Debt"` ← Debt card edit button
- Line 3068: `title="Remove debt"` ← Debt modal remove button

### **2. Placeholders**
- Line 3087: `placeholder="Extra payment amount"` ← Debt modal
- Line 3417: `placeholder="Enter your monthly income"` ← Net Worth calculator

### **3. Hardcoded Text**
- Line 5870: `label: holding.symbol || 'Unknown'` ← Investment portfolio
- Line 872: `"Resilience Status Levels"` ← Status legend tooltip
- Line 877: `"Secure (>90%)"` ← Status levels
- Line 878: `"Outstanding resilience!"` ← Status descriptions

### **4. Chart Labels**
- Line 2580: `.text("Financial Freedom Target")` ← D3 chart

### **5. Form Labels**
- Need to check all modal forms for untranslated labels

---

## 🔧 ACTION ITEMS:

1. Add missing keys to translation files
2. Replace hardcoded strings with t() calls
3. Update tooltip titles
4. Update placeholders
5. Fix chart labels
6. Test all modals

---

**Continuing audit...**

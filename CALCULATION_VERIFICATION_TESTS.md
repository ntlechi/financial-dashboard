# 🧮 CALCULATION VERIFICATION TEST SUITE
## All Financial Formulas - Test Cases & Expected Results

**Purpose:** Ensure 100% accuracy of all calculations before launch  
**Status:** READY FOR SYSTEMATIC TESTING  
**Critical:** User trust depends on accurate calculations!

---

## 📊 **FORMULA #1: NET WORTH**

### **Formula:**
```
Net Worth = Total Assets - Total Liabilities
```

### **Location:**
Dashboard → Net Worth card

### **Test Cases:**

**Test 1.1: Basic Positive Net Worth**
```
Input:
  Assets: $10,000
  Liabilities: $3,000
  
Expected Output: $7,000
Visual: Positive (green/white text)

To Test:
1. Go to Dashboard
2. Edit Net Worth card
3. Add Asset: "Savings" $10,000
4. Add Liability: "Credit Card" $3,000
5. Save
6. Verify: Net Worth displays "$7,000"
```

**Test 1.2: Negative Net Worth**
```
Input:
  Assets: $2,000
  Liabilities: $10,000
  
Expected Output: -$8,000
Visual: Negative (red text)

To Test:
1. Edit Net Worth card
2. Set Assets to $2,000
3. Set Liabilities to $10,000
4. Save
5. Verify: Displays "-$8,000" in red
```

**Test 1.3: Zero Net Worth**
```
Input:
  Assets: $5,000
  Liabilities: $5,000
  
Expected Output: $0

To Test:
1. Equal assets and liabilities
2. Verify shows "$0" or "$0.00"
```

**Test 1.4: Only Assets, No Debt**
```
Input:
  Assets: $50,000
  Liabilities: $0
  
Expected Output: $50,000

To Test:
1. Clear all liabilities
2. Verify shows full asset value
```

---

## 💰 **FORMULA #2: CASH FLOW**

### **Formula:**
```
Cash Flow = Total Income - Total Expenses (Current Month)
```

### **Location:**
Dashboard → Cash Flow card

### **Test Cases:**

**Test 2.1: Positive Cash Flow**
```
Input:
  Income (Oct): $5,000
  Expenses (Oct): $3,000
  
Expected Output: +$2,000
Visual: Green, upward arrow

To Test:
1. Log $5,000 income in October
2. Log $3,000 expenses in October
3. Check Cash Flow card
4. Verify: "+$2,000" in green
```

**Test 2.2: Negative Cash Flow**
```
Input:
  Income (Oct): $3,000
  Expenses (Oct): $5,000
  
Expected Output: -$2,000
Visual: Red, downward arrow

To Test:
1. Log $3,000 income in October
2. Log $5,000 expenses in October
3. Check Cash Flow card
4. Verify: "-$2,000" in red
```

**Test 2.3: Break Even**
```
Input:
  Income (Oct): $4,000
  Expenses (Oct): $4,000
  
Expected Output: $0
Visual: Neutral color

To Test:
1. Equal income and expenses
2. Verify shows "$0"
```

**Test 2.4: Only Expenses (No Income)**
```
Input:
  Income (Oct): $0
  Expenses (Oct): $2,000
  
Expected Output: -$2,000

To Test:
1. Log only expenses, no income
2. Verify negative cash flow
```

---

## 📈 **FORMULA #3: SAVINGS RATE**

### **Formula:**
```
Savings Rate = ((Income - Expenses) / Income) × 100
```

### **Location:**
Dashboard → Savings Rate card

### **Test Cases:**

**Test 3.1: 50% Savings Rate**
```
Input:
  Income: $4,000
  Expenses: $2,000
  
Calculation:
  (4000 - 2000) / 4000 × 100
  = 2000 / 4000 × 100
  = 0.5 × 100
  = 50%

Expected Output: 50%

To Test:
1. Set income to $4,000
2. Set expenses to $2,000
3. Check Savings Rate card
4. Verify: "50%" or "50.0%"
```

**Test 3.2: 25% Savings Rate**
```
Input:
  Income: $4,000
  Expenses: $3,000
  
Calculation:
  (4000 - 3000) / 4000 × 100
  = 1000 / 4000 × 100
  = 25%

Expected Output: 25%
```

**Test 3.3: Negative Savings (Overspending)**
```
Input:
  Income: $3,000
  Expenses: $4,000
  
Calculation:
  (3000 - 4000) / 3000 × 100
  = -1000 / 3000 × 100
  = -33.33%

Expected Output: -33.33% or -33.3%
Visual: Red (warning!)

To Test:
1. Overspend the income
2. Verify negative percentage shows
3. Should display in red/warning color
```

**Test 3.4: 100% Savings (No Spending)**
```
Input:
  Income: $5,000
  Expenses: $0
  
Calculation:
  (5000 - 0) / 5000 × 100
  = 100%

Expected Output: 100%
```

**Test 3.5: Division by Zero (EDGE CASE!)**
```
Input:
  Income: $0
  Expenses: $0
  
Calculation:
  (0 - 0) / 0 × 100
  = 0 / 0
  = NaN or Infinity

Expected Output: 0% or "N/A"
Visual: Should NOT show "NaN" or "Infinity"!

To Test:
1. Set both to zero
2. Verify graceful handling
3. Should show "0%" or "N/A"
```

---

## 🛤️ **FORMULA #4: FINANCIAL RUNWAY**

### **Formula:**
```
Runway (months) = Cash on Hand / Monthly Expenses
```

### **Location:**
Dashboard → Survival Runway card

### **Test Cases:**

**Test 4.1: 6-Month Runway (Goal)**
```
Input:
  Cash: $12,000
  Monthly Expenses: $2,000
  
Calculation:
  12000 / 2000 = 6.0 months

Expected Output: 6.0 months
Visual: Progress bar at 100% (green)

To Test:
1. Set Cash on Hand to $12,000
2. Have $2,000 monthly expenses
3. Verify: "6.0 months"
4. Progress bar should be full green
```

**Test 4.2: 3-Month Runway**
```
Input:
  Cash: $6,000
  Monthly Expenses: $2,000
  
Calculation:
  6000 / 2000 = 3.0 months

Expected Output: 3.0 months
Visual: Progress bar at 50% (yellow)
```

**Test 4.3: Less Than 1 Month (DANGER!)**
```
Input:
  Cash: $500
  Monthly Expenses: $2,000
  
Calculation:
  500 / 2000 = 0.25 months

Expected Output: 0.25 months or "0.3 months"
Visual: Progress bar nearly empty (red warning!)

To Test:
1. Low cash, high expenses
2. Verify shows decimal months
3. Should show warning color
```

**Test 4.4: High Runway**
```
Input:
  Cash: $50,000
  Monthly Expenses: $2,000
  
Calculation:
  50000 / 2000 = 25.0 months

Expected Output: 25.0 months
Visual: Progress bar maxed (green)
```

**Test 4.5: Division by Zero (EDGE CASE!)**
```
Input:
  Cash: $5,000
  Monthly Expenses: $0
  
Calculation:
  5000 / 0 = Infinity

Expected Output: "∞" or "No expenses tracked"
Visual: Should handle gracefully!

To Test:
1. Have cash but no expenses
2. Verify doesn't show "Infinity" or "NaN"
3. Should show meaningful message
```

---

## 🏔️ **FORMULA #5: FREEDOM RATIO**

### **Formula:**
```
Freedom Ratio = (Passive Income / Monthly Expenses) × 100
```

### **Location:**
Side Hustle page → Freedom Ratio card

### **Test Cases:**

**Test 5.1: 10% Freedom (First Milestone!)**
```
Input:
  Passive Income: $200
  Monthly Expenses: $2,000
  
Calculation:
  (200 / 2000) × 100 = 10%

Expected Output: 10%
Visual: "🏕️ Basecamp Secured" milestone should unlock!

To Test:
1. Create business with $200 passive income
2. Have $2,000 monthly expenses
3. Verify: "10%" displays
4. Milestone celebration should trigger!
```

**Test 5.2: 100% Freedom (FINANCIAL INDEPENDENCE!)**
```
Input:
  Passive Income: $2,500
  Monthly Expenses: $2,000
  
Calculation:
  (2500 / 2000) × 100 = 125%

Expected Output: 125%
Visual: "👑 Operator Elite" milestone unlocked!

To Test:
1. Set passive income > expenses
2. Verify shows >100%
3. ALL milestones should be unlocked
4. Celebration modal!
```

**Test 5.3: 0% Freedom (Starting Out)**
```
Input:
  Passive Income: $0
  Monthly Expenses: $2,000
  
Expected Output: 0%

To Test:
1. No passive income sources
2. Should show 0%
```

---

## 📦 **FORMULA #6: SUPPLY CRATE TRACKING (NEW!)**

### **Formulas:**
```
Spent = Sum of matching transactions (current month)
Remaining = Allocated - Spent
Percent Used = (Spent / Allocated) × 100
Burn Rate = Spent / Days Elapsed This Month
```

### **Location:**
Budget tab → Supply Crate System (Climber+)

### **Test Cases:**

**Test 6.1: Basic Crate Tracking**
```
Input:
  Crate: "Food" allocated $400
  Transactions (Oct): 
    - "Groceries" $50 (Oct 5)
    - "Restaurant" $30 (Oct 10)
    - "Fast Food" $20 (Oct 12)
  
Expected Outputs:
  Spent: $100
  Remaining: $300
  Percent Used: 25%
  Status: Healthy (green)
  Burn Rate: $100 / 12 days = $8.33/day

To Test:
1. Create "Food" crate with $400
2. Log food expenses
3. Verify spent amount matches
4. Check remaining is correct
5. Progress bar at 25%
6. Green status
```

**Test 6.2: Nearly Depleted Crate**
```
Input:
  Crate: "Entertainment" allocated $100
  Transactions (Oct): Various totaling $85
  
Expected Outputs:
  Spent: $85
  Remaining: $15
  Percent Used: 85%
  Status: Running Low (yellow warning!)
  
To Test:
1. Spend 85% of allocation
2. Verify yellow warning shows
3. "⚠️ Running Low!" status
4. Progress bar yellow
```

**Test 6.3: Depleted Crate**
```
Input:
  Crate: "Shopping" allocated $200
  Transactions (Oct): Totaling $200+
  
Expected Outputs:
  Spent: $250
  Remaining: -$50
  Percent Used: 125%
  Status: Crate Empty! (red alert!)
  
To Test:
1. Overspend the crate
2. Verify red alert shows
3. "🚨 Crate Empty!" status
4. Shows "Over budget by $50"
5. Progress bar full red
```

**Test 6.4: Category Matching**
```
Input:
  Crate: "Gas" allocated $150
  Transactions: 
    - "Gas Station" $40 ✅ Should match
    - "Gasoline" $35 ✅ Should match
    - "Car Wash" $20 ❓ Should it match?
  
Expected: Smart matching based on keywords

To Test:
1. Create crate
2. Log related transactions
3. Verify auto-tracking works
4. Check keyword matching logic
```

---

## 📈 **FORMULA #7: INVESTMENT CALCULATIONS**

### **Formulas:**
```
Current Value = Shares × Current Price
Total Gain/Loss = Current Value - Purchase Value
Gain/Loss % = (Gain / Purchase Value) × 100
Total Dividends = Sum of all dividend payments
```

### **Location:**
Investment tab (Operator+)

### **Test Cases:**

**Test 7.1: Stock with Gain**
```
Input:
  Symbol: AAPL
  Shares: 10
  Purchase Price: $100/share
  Purchase Value: $1,000
  Current Price: $150/share
  
Calculation:
  Current Value: 10 × $150 = $1,500
  Gain: $1,500 - $1,000 = $500
  Gain %: (500 / 1000) × 100 = 50%

Expected Outputs:
  Current Value: $1,500
  Gain/Loss: +$500 (+50%)
  Visual: Green (positive)

To Test:
1. Add AAPL holding
2. Set purchase at $100
3. Update current price to $150
4. Verify all calculations match
```

**Test 7.2: Stock with Loss**
```
Input:
  Symbol: TSLA
  Shares: 5
  Purchase Price: $200/share
  Purchase Value: $1,000
  Current Price: $150/share
  
Calculation:
  Current Value: 5 × $150 = $750
  Loss: $750 - $1,000 = -$250
  Loss %: (-250 / 1000) × 100 = -25%

Expected Outputs:
  Current Value: $750
  Gain/Loss: -$250 (-25%)
  Visual: Red (negative)

To Test:
1. Add TSLA holding
2. Price drops from $200 to $150
3. Verify shows loss correctly
4. Red coloring for negative
```

**Test 7.3: Dividend Calculations**
```
Input:
  Holding: VOO (S&P 500 ETF)
  Shares: 100
  Quarterly Dividend: $5 per share
  
Calculation:
  Quarterly: 100 × $5 = $500
  Annual: $500 × 4 = $2,000

Expected Output: Annual Dividends: $2,000

To Test:
1. Add dividend-paying holding
2. Set dividend schedule
3. Verify annual calculation
4. Check dividend calendar
```

---

## 🗺️ **FORMULA #8: TRAVEL CALCULATIONS**

### **Formulas:**
```
Trip Budget Remaining = Target Budget - Total Spent
Daily Spend Rate = Total Spent / Days Elapsed
Projected Total = (Total Spent / Days Elapsed) × Trip Length
Travel Runway = Total Savings / Estimated Daily Spend
```

### **Location:**
Travel tab (Operator+)

### **Test Cases:**

**Test 8.1: Trip Budget Tracking**
```
Input:
  Trip: "Thailand Adventure"
  Budget: $3,000
  Spent so far: $1,200
  Days: 10 of 30
  
Calculations:
  Remaining: $3,000 - $1,200 = $1,800
  Daily Rate: $1,200 / 10 = $120/day
  Projected: $120 × 30 = $3,600 (over budget!)
  
Expected Outputs:
  Budget Remaining: $1,800
  Daily Spend: $120/day
  Projected Total: $3,600
  Warning: "Trending over budget!"

To Test:
1. Create trip with budget
2. Add expenses
3. Verify calculations
4. Check overspend warning
```

**Test 8.2: Travel Runway**
```
Input:
  Total Savings: $10,000
  Estimated Daily Spend: $50
  
Calculation:
  10000 / 50 = 200 days

Expected Output: 200 days or "6.7 months"

To Test:
1. Set savings amount
2. Set daily budget
3. Verify runway calculation
4. Check months conversion
```

---

## 💳 **FORMULA #9: BUDGET CALCULATIONS**

### **Formulas:**
```
50/30/20 Rule:
  Needs = Income × 0.50
  Wants = Income × 0.30
  Savings = Income × 0.20

Six Jars:
  Necessities = Income × 0.55
  Education = Income × 0.10
  Play = Income × 0.10
  Long-term = Income × 0.10
  Financial = Income × 0.10
  Give = Income × 0.05
```

### **Location:**
Budget tab → Budget Calculator

### **Test Cases:**

**Test 9.1: 50/30/20 Breakdown**
```
Input:
  Monthly Income: $4,000
  
Calculations:
  Needs: $4,000 × 0.50 = $2,000
  Wants: $4,000 × 0.30 = $1,200
  Savings: $4,000 × 0.20 = $800
  Total: $4,000 ✓

Expected Outputs:
  Needs: $2,000
  Wants: $1,200
  Savings: $800

To Test:
1. Enter $4,000 income
2. Select 50/30/20 method
3. Verify all three match
4. Total should equal income
```

**Test 9.2: Six Jars Breakdown**
```
Input:
  Monthly Income: $5,000
  
Calculations:
  Necessities: $5,000 × 0.55 = $2,750
  Education: $5,000 × 0.10 = $500
  Play: $5,000 × 0.10 = $500
  Long-term: $5,000 × 0.10 = $500
  Financial: $5,000 × 0.10 = $500
  Give: $5,000 × 0.05 = $250
  Total: $5,000 ✓

Expected Outputs match calculations

To Test:
1. Enter $5,000 income
2. Select Six Jars method
3. Verify all six categories
4. Total should equal income
```

---

## 💼 **FORMULA #10: SIDE HUSTLE CALCULATIONS**

### **Formulas:**
```
Total Business Income = Sum of all income items
Total Business Expenses = Sum of all expense items
Net Profit = Income - Expenses
Profit Margin = (Net Profit / Income) × 100
Total Passive Income = Sum of items marked "isPassive"
```

### **Location:**
Side Hustle tab (Operator+)

### **Test Cases:**

**Test 10.1: Business Profitability**
```
Input:
  Business: "Freelance Design"
  Income: $5,000 (10 clients @ $500 each)
  Expenses: $1,500 (software, ads, etc.)
  
Calculations:
  Net Profit: $5,000 - $1,500 = $3,500
  Profit Margin: (3500 / 5000) × 100 = 70%

Expected Outputs:
  Total Income: $5,000
  Total Expenses: $1,500
  Net Profit: $3,500
  Margin: 70%

To Test:
1. Create business
2. Add income items
3. Add expense items
4. Verify calculations
5. Check profit margin
```

**Test 10.2: Passive Income Tracking**
```
Input:
  Business: "Rental Property"
  Income items:
    - Rent $2,000 (marked passive) ✅
    - Airbnb $500 (marked passive) ✅
    - Repair work $300 (NOT passive) ❌
  
Calculation:
  Total Income: $2,800
  Passive Income: $2,500
  Passive %: 89%

Expected Output:
  Passive Income: $2,500
  Used in Freedom Ratio

To Test:
1. Create business
2. Mark some income as passive
3. Verify passive income isolated
4. Check Freedom Ratio includes it
```

---

## 📊 **EDGE CASE TESTING CHECKLIST**

### **Division by Zero Cases:**
- [ ] Savings Rate when Income = $0
- [ ] Financial Runway when Expenses = $0
- [ ] Freedom Ratio when Expenses = $0
- [ ] Profit Margin when Income = $0
- [ ] Any other division operations

### **Negative Number Cases:**
- [ ] Negative net worth displays correctly
- [ ] Negative cash flow shows properly
- [ ] Negative savings rate (overspending)
- [ ] Negative business profit
- [ ] Negative investment returns

### **Zero Value Cases:**
- [ ] All zeros in dashboard
- [ ] Zero transactions
- [ ] Zero assets/liabilities
- [ ] Zero income/expenses
- [ ] App doesn't break with empty data

### **Large Number Cases:**
- [ ] Net worth > $1 million
- [ ] Thousands of transactions
- [ ] Very large expense amounts
- [ ] Number formatting (commas)
- [ ] No overflow in UI

### **Decimal/Precision Cases:**
- [ ] Percentages show correct decimals
- [ ] Money amounts show 2 decimals
- [ ] No rounding errors in calculations
- [ ] Consistent precision throughout

---

## ✅ **CALCULATION VERIFICATION STATUS:**

**Formulas Documented:** 10  
**Test Cases Created:** 30+  
**Edge Cases Identified:** 15+  
**Ready for Systematic Testing:** YES!

**Next Step:** Execute each test case systematically and document results.

---

**ALL CALCULATIONS NOW DOCUMENTED!**  
**Ready for thorough verification!** 🧮✅

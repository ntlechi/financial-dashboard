// 🚀 FINANCIAL CALCULATIONS ENGINE - The Heart of Financial Freedom
// This is the core calculation engine that powers all financial decisions in the app

// ============================================================================
// 🛡️ INPUT VALIDATION & SAFETY
// ============================================================================

export function validateNumber(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

export function validatePercentage(value, defaultValue = 0) {
  return validateNumber(value, defaultValue, 0, 100);
}

export function validateCurrency(value, defaultValue = 0) {
  return validateNumber(value, defaultValue, 0);
}

// ============================================================================
// 💰 CORE FINANCIAL CALCULATIONS
// ============================================================================

/**
 * Calculate Net Worth - The ultimate measure of financial health
 */
export function calculateNetWorth(assets = [], liabilities = []) {
  const totalAssets = assets.reduce((sum, asset) => {
    return sum + validateCurrency(asset.value);
  }, 0);
  
  const totalLiabilities = liabilities.reduce((sum, liability) => {
    return sum + validateCurrency(liability.value);
  }, 0);
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    isPositive: (totalAssets - totalLiabilities) > 0
  };
}

/**
 * Calculate Freedom Ratio - The percentage of income you keep
 */
export function calculateFreedomRatio(monthlyIncome, monthlyExpenses) {
  const income = validateCurrency(monthlyIncome);
  const expenses = validateCurrency(monthlyExpenses);
  
  if (income <= 0) return 0;
  
  const freedomRatio = ((income - expenses) / income) * 100;
  return Math.max(0, Math.min(100, freedomRatio));
}

/**
 * Calculate Emergency Fund Status
 */
export function calculateEmergencyFundStatus(currentSavings, monthlyExpenses, targetMonths = 6) {
  const savings = validateCurrency(currentSavings);
  const expenses = validateCurrency(monthlyExpenses);
  const target = expenses * targetMonths;
  
  if (target <= 0) return { status: 'complete', percentage: 100, monthsCovered: 0 };
  
  const percentage = Math.min(100, (savings / target) * 100);
  const monthsCovered = expenses > 0 ? savings / expenses : 0;
  
  let status = 'insufficient';
  if (percentage >= 100) status = 'complete';
  else if (percentage >= 75) status = 'almost_complete';
  else if (percentage >= 50) status = 'halfway';
  else if (percentage >= 25) status = 'started';
  
  return {
    status,
    percentage: Math.round(percentage),
    monthsCovered: Math.round(monthsCovered * 10) / 10,
    target,
    shortfall: Math.max(0, target - savings)
  };
}

/**
 * Calculate Debt Payoff Strategy
 */
export function calculateDebtPayoff(debts, strategy = 'avalanche', extraPayment = 0) {
  if (!Array.isArray(debts) || debts.length === 0) {
    return { totalDebt: 0, payoffTime: 0, totalInterest: 0, payments: [] };
  }
  
  const validatedDebts = debts.map(debt => ({
    ...debt,
    balance: validateCurrency(debt.balance),
    interestRate: validatePercentage(debt.interestRate),
    minimumPayment: validateCurrency(debt.minimumPayment)
  }));
  
  // Sort debts based on strategy
  const sortedDebts = [...validatedDebts].sort((a, b) => {
    if (strategy === 'snowball') {
      return a.balance - b.balance; // Smallest balance first
    } else {
      return b.interestRate - a.interestRate; // Highest interest first
    }
  });
  
  let totalInterest = 0;
  let totalPayoffTime = 0;
  const payments = [];
  
  // Calculate payoff for each debt
  sortedDebts.forEach((debt, index) => {
    const monthlyRate = debt.interestRate / 100 / 12;
    let balance = debt.balance;
    let monthlyPayment = debt.minimumPayment;
    
    // Add extra payment to the first debt (the one being prioritized)
    if (index === 0) {
      monthlyPayment += extraPayment;
    }
    
    let months = 0;
    let interestPaid = 0;
    
    while (balance > 0.01 && months < 600) { // Max 50 years
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      
      balance -= principalPayment;
      interestPaid += interestPayment;
      months++;
      
      if (months % 12 === 0) { // Record yearly progress
        payments.push({
          year: Math.ceil(months / 12),
          balance: Math.max(0, balance),
          interestPaid: interestPaid
        });
      }
    }
    
    totalInterest += interestPaid;
    totalPayoffTime = Math.max(totalPayoffTime, months);
  });
  
  return {
    totalDebt: validatedDebts.reduce((sum, debt) => sum + debt.balance, 0),
    payoffTime: Math.ceil(totalPayoffTime / 12), // Convert to years
    totalInterest,
    strategy,
    payments
  };
}

/**
 * Calculate Retirement Projection
 */
export function calculateRetirementProjection(
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturn = 7
) {
  const age = validateNumber(currentAge, 25, 18, 100);
  const retireAge = validateNumber(retirementAge, 65, age + 1, 100);
  const savings = validateCurrency(currentSavings);
  const contribution = validateCurrency(monthlyContribution);
  const returnRate = validateNumber(annualReturn, 7, 0, 20) / 100;
  
  const yearsToRetirement = retireAge - age;
  const monthlyRate = returnRate / 12;
  const totalMonths = yearsToRetirement * 12;
  
  // Future value of current savings
  const futureValueCurrent = savings * Math.pow(1 + returnRate, yearsToRetirement);
  
  // Future value of monthly contributions
  const futureValueContributions = contribution * 
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  const totalRetirementFund = futureValueCurrent + futureValueContributions;
  
  // Calculate monthly income in retirement (4% rule)
  const monthlyRetirementIncome = totalRetirementFund * 0.04 / 12;
  
  return {
    totalRetirementFund: Math.round(totalRetirementFund),
    monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
    yearsToRetirement,
    totalContributions: contribution * totalMonths,
    growth: totalRetirementFund - savings - (contribution * totalMonths)
  };
}

/**
 * Calculate Investment Growth
 */
export function calculateInvestmentGrowth(
  initialAmount,
  monthlyContribution,
  years,
  annualReturn = 7,
  compoundFrequency = 12
) {
  const initial = validateCurrency(initialAmount);
  const monthly = validateCurrency(monthlyContribution);
  const yearsValid = validateNumber(years, 1, 0.1, 100);
  const returnRate = validateNumber(annualReturn, 7, 0, 20) / 100;
  
  const monthlyRate = returnRate / compoundFrequency;
  const totalMonths = yearsValid * compoundFrequency;
  
  // Future value of initial amount
  const futureValueInitial = initial * Math.pow(1 + monthlyRate, totalMonths);
  
  // Future value of monthly contributions
  const futureValueContributions = monthly * 
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  const totalValue = futureValueInitial + futureValueContributions;
  const totalContributions = initial + (monthly * totalMonths);
  const totalGrowth = totalValue - totalContributions;
  
  return {
    totalValue: Math.round(totalValue),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
    growthPercentage: totalContributions > 0 ? (totalGrowth / totalContributions) * 100 : 0
  };
}

// ============================================================================
// 🎯 GOAL TRACKING CALCULATIONS
// ============================================================================

/**
 * Calculate Goal Progress
 */
export function calculateGoalProgress(currentAmount, targetAmount, targetDate) {
  const current = validateCurrency(currentAmount);
  const target = validateCurrency(targetAmount);
  const targetDateObj = new Date(targetDate);
  const now = new Date();
  
  if (target <= 0) return { percentage: 100, status: 'complete', monthsRemaining: 0 };
  
  const percentage = Math.min(100, (current / target) * 100);
  const monthsRemaining = Math.max(0, 
    (targetDateObj.getFullYear() - now.getFullYear()) * 12 + 
    (targetDateObj.getMonth() - now.getMonth())
  );
  
  let status = 'on_track';
  if (percentage >= 100) status = 'complete';
  else if (percentage < 25) status = 'behind';
  else if (percentage < 50) status = 'slow';
  
  // Calculate required monthly savings to reach goal
  const requiredMonthly = monthsRemaining > 0 ? 
    Math.max(0, (target - current) / monthsRemaining) : 0;
  
  return {
    percentage: Math.round(percentage),
    status,
    monthsRemaining,
    requiredMonthly: Math.round(requiredMonthly),
    shortfall: Math.max(0, target - current)
  };
}

// ============================================================================
// 📊 BUDGET CALCULATIONS
// ============================================================================

/**
 * Calculate 50/30/20 Budget Allocation
 */
export function calculate503020Budget(monthlyIncome) {
  const income = validateCurrency(monthlyIncome);
  
  return {
    needs: Math.round(income * 0.50),
    wants: Math.round(income * 0.30),
    savings: Math.round(income * 0.20),
    total: income
  };
}

/**
 * Calculate 6 Jars Budget System
 */
export function calculate6JarsBudget(monthlyIncome) {
  const income = validateCurrency(monthlyIncome);
  
  return {
    necessities: Math.round(income * 0.55), // 55% for necessities
    longTermSavings: Math.round(income * 0.10), // 10% for long-term savings
    education: Math.round(income * 0.10), // 10% for education/self-improvement
    play: Math.round(income * 0.10), // 10% for fun/entertainment
    give: Math.round(income * 0.10), // 10% for giving/charity
    financialFreedom: Math.round(income * 0.05), // 5% for financial freedom
    total: income
  };
}

// ============================================================================
// 🚀 PERFORMANCE OPTIMIZATION
// ============================================================================

// Memoization for expensive calculations
const calculationCache = new Map();

export function memoizedCalculation(key, calculationFn, ...args) {
  const cacheKey = `${key}_${JSON.stringify(args)}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }
  
  const result = calculationFn(...args);
  calculationCache.set(cacheKey, result);
  
  // Clear cache after 5 minutes to prevent memory leaks
  setTimeout(() => {
    calculationCache.delete(cacheKey);
  }, 5 * 60 * 1000);
  
  return result;
}

// ============================================================================
// 🎮 GAMIFICATION CALCULATIONS
// ============================================================================

/**
 * Calculate XP for financial actions
 */
export function calculateXpReward(action, amount = 0) {
  const baseRewards = {
    'add_transaction': 10,
    'update_budget': 25,
    'complete_goal': 100,
    'pay_off_debt': 50,
    'increase_savings': 75,
    'investment_contribution': 60,
    'emergency_fund_milestone': 200,
    'net_worth_milestone': 150,
    'freedom_ratio_improvement': 100
  };
  
  let baseXp = baseRewards[action] || 10;
  
  // Scale XP based on amount for certain actions
  if (['pay_off_debt', 'increase_savings', 'investment_contribution'].includes(action)) {
    const amountMultiplier = Math.min(5, Math.log10(amount + 1));
    baseXp = Math.round(baseXp * (1 + amountMultiplier * 0.1));
  }
  
  return Math.max(1, baseXp);
}

/**
 * Calculate Financial Health Score (0-100)
 */
export function calculateFinancialHealthScore(userData) {
  let score = 0;
  
  // Emergency Fund Score (25 points)
  const emergencyFund = calculateEmergencyFundStatus(
    userData.savings?.total || 0,
    userData.expenses?.monthly || 0
  );
  score += Math.min(25, (emergencyFund.percentage / 100) * 25);
  
  // Debt-to-Income Ratio Score (25 points)
  const debtToIncome = userData.debt?.total || 0;
  const monthlyIncome = userData.income?.monthly || 1;
  const debtRatio = (debtToIncome / (monthlyIncome * 12)) * 100;
  score += Math.max(0, 25 - (debtRatio / 4)); // Lower debt ratio = higher score
  
  // Savings Rate Score (25 points)
  const freedomRatio = calculateFreedomRatio(monthlyIncome, userData.expenses?.monthly || 0);
  score += Math.min(25, (freedomRatio / 100) * 25);
  
  // Net Worth Score (25 points)
  const netWorth = userData.netWorth?.total || 0;
  const netWorthScore = Math.min(25, Math.max(0, (netWorth / 100000) * 25));
  score += netWorthScore;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

// ============================================================================
// 🎯 EXPORT ALL CALCULATIONS
// ============================================================================

export default {
  // Core calculations
  calculateNetWorth,
  calculateFreedomRatio,
  calculateEmergencyFundStatus,
  calculateDebtPayoff,
  calculateRetirementProjection,
  calculateInvestmentGrowth,
  
  // Goal tracking
  calculateGoalProgress,
  
  // Budget systems
  calculate503020Budget,
  calculate6JarsBudget,
  
  // Gamification
  calculateXpReward,
  calculateFinancialHealthScore,
  
  // Utilities
  validateNumber,
  validatePercentage,
  validateCurrency,
  memoizedCalculation
};


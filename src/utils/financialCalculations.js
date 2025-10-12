// 🛡️ BULLETPROOF FINANCIAL CALCULATIONS
// This is the core calculation engine - every function is validated and error-proof

import { safeCalculation, safeParseNumber, trackError, ERROR_TYPES } from './errorHandling';

// ============================================================================
// 🛡️ INPUT VALIDATION & SAFETY
// ============================================================================

/**
 * Validates and sanitizes financial input values
 * @param {any} value - Input value to validate
 * @param {number} defaultValue - Default value if input is invalid
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Validated number
 */
export function validateFinancialInput(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return safeCalculation(() => {
    const parsed = safeParseNumber(value, defaultValue);
    return Math.max(min, Math.min(max, parsed));
  }, defaultValue, {
    type: ERROR_TYPES.DATA_VALIDATION,
    component: 'financialCalculations',
    additionalData: { inputValue: value, defaultValue, min, max }
  });
}

/**
 * Validates percentage values (0-100)
 */
export function validatePercentage(value, defaultValue = 0) {
  return validateFinancialInput(value, defaultValue, 0, 100);
}

/**
 * Validates currency amounts (non-negative)
 */
export function validateCurrency(value, defaultValue = 0) {
  return validateFinancialInput(value, defaultValue, 0);
}

// ============================================================================
// 💰 CORE FINANCIAL CALCULATIONS
// ============================================================================

/**
 * Calculate Net Worth - The ultimate measure of financial health
 * @param {Array} assets - Array of asset objects with value property
 * @param {Array} liabilities - Array of liability objects with value property
 * @returns {Object} - Net worth calculation results
 */
export function calculateNetWorth(assets = [], liabilities = []) {
  return safeCalculation(() => {
    // Validate inputs
    const validAssets = Array.isArray(assets) ? assets : [];
    const validLiabilities = Array.isArray(liabilities) ? liabilities : [];
    
    const totalAssets = validAssets.reduce((sum, asset) => {
      const value = validateCurrency(asset?.value || 0);
      return sum + value;
    }, 0);
    
    const totalLiabilities = validLiabilities.reduce((sum, liability) => {
      const value = validateCurrency(liability?.value || 0);
      return sum + value;
    }, 0);
    
    const netWorth = totalAssets - totalLiabilities;
    
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      isPositive: netWorth > 0,
      isNegative: netWorth < 0,
      isZero: netWorth === 0
    };
  }, {
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    isPositive: false,
    isNegative: false,
    isZero: true
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateNetWorth',
    additionalData: { assetsCount: assets?.length || 0, liabilitiesCount: liabilities?.length || 0 }
  });
}

/**
 * Calculate Freedom Ratio - The percentage of income you keep
 * @param {number} monthlyIncome - Monthly income amount
 * @param {number} monthlyExpenses - Monthly expenses amount
 * @returns {number} - Freedom ratio percentage (0-100)
 */
export function calculateFreedomRatio(monthlyIncome, monthlyExpenses) {
  return safeCalculation(() => {
    const income = validateCurrency(monthlyIncome);
    const expenses = validateCurrency(monthlyExpenses);
    
    if (income <= 0) return 0;
    
    const freedomRatio = ((income - expenses) / income) * 100;
    return Math.max(0, Math.min(100, freedomRatio));
  }, 0, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateFreedomRatio',
    additionalData: { monthlyIncome, monthlyExpenses }
  });
}

/**
 * Calculate Emergency Fund Status
 * @param {number} currentSavings - Current emergency fund amount
 * @param {number} monthlyExpenses - Monthly expenses
 * @param {number} targetMonths - Target months of expenses to save (default 6)
 * @returns {Object} - Emergency fund status and recommendations
 */
export function calculateEmergencyFundStatus(currentSavings, monthlyExpenses, targetMonths = 6) {
  return safeCalculation(() => {
    const savings = validateCurrency(currentSavings);
    const expenses = validateCurrency(monthlyExpenses);
    const months = validateFinancialInput(targetMonths, 6, 1, 24); // 1-24 months max
    
    if (expenses <= 0) {
      return {
        status: 'complete',
        percentage: 100,
        monthsCovered: 0,
        target: 0,
        shortfall: 0,
        recommendation: 'No expenses to cover'
      };
    }
    
    const target = expenses * months;
    const percentage = Math.min(100, (savings / target) * 100);
    const monthsCovered = savings / expenses;
    const shortfall = Math.max(0, target - savings);
    
    let status = 'insufficient';
    let recommendation = 'Start building your emergency fund';
    
    if (percentage >= 100) {
      status = 'complete';
      recommendation = 'Excellent! Your emergency fund is fully funded';
    } else if (percentage >= 75) {
      status = 'almost_complete';
      recommendation = 'Almost there! Just a bit more to reach your target';
    } else if (percentage >= 50) {
      status = 'halfway';
      recommendation = 'Good progress! Keep building your emergency fund';
    } else if (percentage >= 25) {
      status = 'started';
      recommendation = 'Good start! Continue building your emergency fund';
    }
    
    return {
      status,
      percentage: Math.round(percentage),
      monthsCovered: Math.round(monthsCovered * 10) / 10,
      target,
      shortfall,
      recommendation
    };
  }, {
    status: 'insufficient',
    percentage: 0,
    monthsCovered: 0,
    target: 0,
    shortfall: 0,
    recommendation: 'Unable to calculate emergency fund status'
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateEmergencyFundStatus',
    additionalData: { currentSavings, monthlyExpenses, targetMonths }
  });
}

/**
 * Calculate Debt Payoff Strategy
 * @param {Array} debts - Array of debt objects
 * @param {string} strategy - 'snowball' or 'avalanche'
 * @param {number} extraPayment - Extra payment amount
 * @returns {Object} - Debt payoff calculation results
 */
export function calculateDebtPayoff(debts, strategy = 'avalanche', extraPayment = 0) {
  return safeCalculation(() => {
    if (!Array.isArray(debts) || debts.length === 0) {
      return {
        totalDebt: 0,
        payoffTime: 0,
        totalInterest: 0,
        strategy,
        payments: [],
        recommendation: 'No debts to pay off'
      };
    }
    
    // Validate and sanitize debt data
    const validatedDebts = debts.map((debt, index) => ({
      id: debt.id || `debt_${index}`,
      name: debt.name || 'Unnamed Debt',
      balance: validateCurrency(debt.balance),
      interestRate: validatePercentage(debt.interestRate),
      minimumPayment: validateCurrency(debt.minimumPayment)
    })).filter(debt => debt.balance > 0); // Remove paid-off debts
    
    if (validatedDebts.length === 0) {
      return {
        totalDebt: 0,
        payoffTime: 0,
        totalInterest: 0,
        strategy,
        payments: [],
        recommendation: 'All debts are paid off!'
      };
    }
    
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
    const extraPaymentAmount = validateCurrency(extraPayment);
    
    // Calculate payoff for each debt
    sortedDebts.forEach((debt, index) => {
      const monthlyRate = debt.interestRate / 100 / 12;
      let balance = debt.balance;
      let monthlyPayment = debt.minimumPayment;
      
      // Add extra payment to the first debt (the one being prioritized)
      if (index === 0) {
        monthlyPayment += extraPaymentAmount;
      }
      
      let months = 0;
      let interestPaid = 0;
      const yearlyPayments = [];
      
      while (balance > 0.01 && months < 600) { // Max 50 years to prevent infinite loops
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
        
        balance -= principalPayment;
        interestPaid += interestPayment;
        months++;
        
        // Record yearly progress
        if (months % 12 === 0) {
          yearlyPayments.push({
            year: Math.ceil(months / 12),
            balance: Math.max(0, balance),
            interestPaid: interestPaid,
            debtName: debt.name
          });
        }
      }
      
      totalInterest += interestPaid;
      totalPayoffTime = Math.max(totalPayoffTime, months);
      payments.push(...yearlyPayments);
    });
    
    const totalDebt = validatedDebts.reduce((sum, debt) => sum + debt.balance, 0);
    const payoffYears = Math.ceil(totalPayoffTime / 12);
    
    let recommendation = '';
    if (payoffYears <= 1) {
      recommendation = 'Excellent! You can pay off your debts quickly';
    } else if (payoffYears <= 3) {
      recommendation = 'Good progress! You\'re on track to be debt-free soon';
    } else if (payoffYears <= 7) {
      recommendation = 'Consider increasing payments to pay off debts faster';
    } else {
      recommendation = 'Consider debt consolidation or increasing payments significantly';
    }
    
    return {
      totalDebt,
      payoffTime: payoffYears,
      totalInterest,
      strategy,
      payments,
      recommendation,
      monthlyPayment: validatedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0) + extraPaymentAmount
    };
  }, {
    totalDebt: 0,
    payoffTime: 0,
    totalInterest: 0,
    strategy,
    payments: [],
    recommendation: 'Unable to calculate debt payoff strategy',
    monthlyPayment: 0
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateDebtPayoff',
    additionalData: { debtsCount: debts?.length || 0, strategy, extraPayment }
  });
}

/**
 * Calculate Retirement Projection
 * @param {number} currentAge - Current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} currentSavings - Current retirement savings
 * @param {number} monthlyContribution - Monthly contribution amount
 * @param {number} annualReturn - Expected annual return percentage
 * @returns {Object} - Retirement projection results
 */
export function calculateRetirementProjection(
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturn = 7
) {
  return safeCalculation(() => {
    const age = validateFinancialInput(currentAge, 25, 18, 100);
    const retireAge = validateFinancialInput(retirementAge, 65, age + 1, 100);
    const savings = validateCurrency(currentSavings);
    const contribution = validateCurrency(monthlyContribution);
    const returnRate = validatePercentage(annualReturn, 7) / 100;
    
    const yearsToRetirement = retireAge - age;
    const monthlyRate = returnRate / 12;
    const totalMonths = yearsToRetirement * 12;
    
    if (yearsToRetirement <= 0) {
      return {
        totalRetirementFund: savings,
        monthlyRetirementIncome: savings * 0.04 / 12,
        yearsToRetirement: 0,
        totalContributions: savings,
        growth: 0,
        recommendation: 'You are at or past retirement age'
      };
    }
    
    // Future value of current savings
    const futureValueCurrent = savings * Math.pow(1 + returnRate, yearsToRetirement);
    
    // Future value of monthly contributions
    const futureValueContributions = contribution * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const totalRetirementFund = futureValueCurrent + futureValueContributions;
    const totalContributions = savings + (contribution * totalMonths);
    const growth = totalRetirementFund - totalContributions;
    
    // Calculate monthly income in retirement (4% rule)
    const monthlyRetirementIncome = totalRetirementFund * 0.04 / 12;
    
    let recommendation = '';
    if (monthlyRetirementIncome >= 5000) {
      recommendation = 'Excellent! You\'re on track for a comfortable retirement';
    } else if (monthlyRetirementIncome >= 3000) {
      recommendation = 'Good progress! Consider increasing contributions if possible';
    } else if (monthlyRetirementIncome >= 1500) {
      recommendation = 'Consider increasing your retirement contributions';
    } else {
      recommendation = 'Consider significantly increasing retirement savings';
    }
    
    return {
      totalRetirementFund: Math.round(totalRetirementFund),
      monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
      yearsToRetirement,
      totalContributions: Math.round(totalContributions),
      growth: Math.round(growth),
      recommendation
    };
  }, {
    totalRetirementFund: 0,
    monthlyRetirementIncome: 0,
    yearsToRetirement: 0,
    totalContributions: 0,
    growth: 0,
    recommendation: 'Unable to calculate retirement projection'
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateRetirementProjection',
    additionalData: { currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn }
  });
}

/**
 * Calculate Goal Progress
 * @param {number} currentAmount - Current amount saved
 * @param {number} targetAmount - Target amount
 * @param {string} targetDate - Target date (ISO string)
 * @returns {Object} - Goal progress calculation results
 */
export function calculateGoalProgress(currentAmount, targetAmount, targetDate) {
  return safeCalculation(() => {
    const current = validateCurrency(currentAmount);
    const target = validateCurrency(targetAmount);
    
    if (target <= 0) {
      return {
        percentage: 100,
        status: 'complete',
        monthsRemaining: 0,
        requiredMonthly: 0,
        shortfall: 0,
        recommendation: 'Target amount is zero or invalid'
      };
    }
    
    const percentage = Math.min(100, (current / target) * 100);
    
    // Calculate time remaining
    let monthsRemaining = 0;
    if (targetDate) {
      try {
        const targetDateObj = new Date(targetDate);
        const now = new Date();
        monthsRemaining = Math.max(0, 
          (targetDateObj.getFullYear() - now.getFullYear()) * 12 + 
          (targetDateObj.getMonth() - now.getMonth())
        );
      } catch (error) {
        monthsRemaining = 12; // Default to 1 year if date is invalid
      }
    } else {
      monthsRemaining = 12; // Default to 1 year if no date provided
    }
    
    let status = 'on_track';
    if (percentage >= 100) {
      status = 'complete';
    } else if (percentage < 25) {
      status = 'behind';
    } else if (percentage < 50) {
      status = 'slow';
    }
    
    // Calculate required monthly savings to reach goal
    const shortfall = Math.max(0, target - current);
    const requiredMonthly = monthsRemaining > 0 ? shortfall / monthsRemaining : 0;
    
    let recommendation = '';
    if (status === 'complete') {
      recommendation = 'Congratulations! You\'ve reached your goal!';
    } else if (requiredMonthly <= 100) {
      recommendation = 'Great! You\'re on track to reach your goal easily';
    } else if (requiredMonthly <= 500) {
      recommendation = 'Good progress! Keep up the current pace';
    } else {
      recommendation = 'Consider adjusting your timeline or increasing savings';
    }
    
    return {
      percentage: Math.round(percentage),
      status,
      monthsRemaining,
      requiredMonthly: Math.round(requiredMonthly),
      shortfall,
      recommendation
    };
  }, {
    percentage: 0,
    status: 'behind',
    monthsRemaining: 12,
    requiredMonthly: 0,
    shortfall: 0,
    recommendation: 'Unable to calculate goal progress'
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateGoalProgress',
    additionalData: { currentAmount, targetAmount, targetDate }
  });
}

// ============================================================================
// 📊 BUDGET CALCULATIONS
// ============================================================================

/**
 * Calculate 50/30/20 Budget Allocation
 * @param {number} monthlyIncome - Monthly income amount
 * @returns {Object} - Budget allocation breakdown
 */
export function calculate503020Budget(monthlyIncome) {
  return safeCalculation(() => {
    const income = validateCurrency(monthlyIncome);
    
    return {
      needs: Math.round(income * 0.50),
      wants: Math.round(income * 0.30),
      savings: Math.round(income * 0.20),
      total: income
    };
  }, {
    needs: 0,
    wants: 0,
    savings: 0,
    total: 0
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculate503020Budget',
    additionalData: { monthlyIncome }
  });
}

/**
 * Calculate 6 Jars Budget System
 * @param {number} monthlyIncome - Monthly income amount
 * @returns {Object} - 6 Jars budget allocation
 */
export function calculate6JarsBudget(monthlyIncome) {
  return safeCalculation(() => {
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
  }, {
    necessities: 0,
    longTermSavings: 0,
    education: 0,
    play: 0,
    give: 0,
    financialFreedom: 0,
    total: 0
  }, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculate6JarsBudget',
    additionalData: { monthlyIncome }
  });
}

// ============================================================================
// 🎮 GAMIFICATION CALCULATIONS
// ============================================================================

/**
 * Calculate Financial Health Score (0-100)
 * @param {Object} userData - User's financial data
 * @returns {number} - Financial health score
 */
export function calculateFinancialHealthScore(userData) {
  return safeCalculation(() => {
    let score = 0;
    
    // Emergency Fund Score (25 points)
    const emergencyFund = calculateEmergencyFundStatus(
      userData?.savings?.total || 0,
      userData?.expenses?.monthly || 0
    );
    score += Math.min(25, (emergencyFund.percentage / 100) * 25);
    
    // Debt-to-Income Ratio Score (25 points)
    const debtToIncome = userData?.debt?.total || 0;
    const monthlyIncome = userData?.income?.monthly || 1;
    const debtRatio = (debtToIncome / (monthlyIncome * 12)) * 100;
    score += Math.max(0, 25 - (debtRatio / 4)); // Lower debt ratio = higher score
    
    // Savings Rate Score (25 points)
    const freedomRatio = calculateFreedomRatio(monthlyIncome, userData?.expenses?.monthly || 0);
    score += Math.min(25, (freedomRatio / 100) * 25);
    
    // Net Worth Score (25 points)
    const netWorth = userData?.netWorth?.total || 0;
    const netWorthScore = Math.min(25, Math.max(0, (netWorth / 100000) * 25));
    score += netWorthScore;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }, 0, {
    type: ERROR_TYPES.CALCULATION_ERROR,
    component: 'calculateFinancialHealthScore',
    additionalData: { userDataKeys: Object.keys(userData || {}) }
  });
}

// ============================================================================
// 🚀 EXPORT ALL CALCULATIONS
// ============================================================================

export default {
  // Validation functions
  validateFinancialInput,
  validatePercentage,
  validateCurrency,
  
  // Core calculations
  calculateNetWorth,
  calculateFreedomRatio,
  calculateEmergencyFundStatus,
  calculateDebtPayoff,
  calculateRetirementProjection,
  calculateGoalProgress,
  
  // Budget systems
  calculate503020Budget,
  calculate6JarsBudget,
  
  // Gamification
  calculateFinancialHealthScore
};

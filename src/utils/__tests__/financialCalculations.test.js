// 🧪 COMPREHENSIVE TESTS FOR FINANCIAL CALCULATIONS
// This ensures all financial calculations are bulletproof before launch

import {
  validateFinancialInput,
  validatePercentage,
  validateCurrency,
  calculateNetWorth,
  calculateFreedomRatio,
  calculateEmergencyFundStatus,
  calculateDebtPayoff,
  calculateRetirementProjection,
  calculateGoalProgress,
  calculate503020Budget,
  calculate6JarsBudget,
  calculateFinancialHealthScore
} from '../financialCalculations';

// ============================================================================
// 🛡️ VALIDATION TESTS
// ============================================================================

describe('Input Validation', () => {
  test('validateFinancialInput should handle valid numbers', () => {
    expect(validateFinancialInput(100, 0)).toBe(100);
    expect(validateFinancialInput('100', 0)).toBe(100);
    expect(validateFinancialInput(100.50, 0)).toBe(100.50);
  });

  test('validateFinancialInput should handle invalid inputs', () => {
    expect(validateFinancialInput(null, 50)).toBe(50);
    expect(validateFinancialInput(undefined, 50)).toBe(50);
    expect(validateFinancialInput('invalid', 50)).toBe(50);
    expect(validateFinancialInput(NaN, 50)).toBe(50);
    expect(validateFinancialInput(Infinity, 50)).toBe(50);
  });

  test('validateFinancialInput should respect min/max bounds', () => {
    expect(validateFinancialInput(-10, 0, 0, 100)).toBe(0);
    expect(validateFinancialInput(150, 0, 0, 100)).toBe(100);
    expect(validateFinancialInput(50, 0, 0, 100)).toBe(50);
  });

  test('validatePercentage should handle percentage values', () => {
    expect(validatePercentage(50)).toBe(50);
    expect(validatePercentage(0)).toBe(0);
    expect(validatePercentage(100)).toBe(100);
    expect(validatePercentage(150)).toBe(100); // Clamped to 100
    expect(validatePercentage(-10)).toBe(0); // Clamped to 0
  });

  test('validateCurrency should handle currency values', () => {
    expect(validateCurrency(1000)).toBe(1000);
    expect(validateCurrency(0)).toBe(0);
    expect(validateCurrency(-100)).toBe(0); // No negative currency
    expect(validateCurrency('1000.50')).toBe(1000.50);
  });
});

// ============================================================================
// 💰 NET WORTH TESTS
// ============================================================================

describe('Net Worth Calculations', () => {
  test('should calculate net worth correctly', () => {
    const assets = [
      { value: 100000 },
      { value: 50000 }
    ];
    const liabilities = [
      { value: 30000 },
      { value: 20000 }
    ];

    const result = calculateNetWorth(assets, liabilities);
    expect(result.totalAssets).toBe(150000);
    expect(result.totalLiabilities).toBe(50000);
    expect(result.netWorth).toBe(100000);
    expect(result.isPositive).toBe(true);
  });

  test('should handle negative net worth', () => {
    const assets = [{ value: 10000 }];
    const liabilities = [{ value: 50000 }];

    const result = calculateNetWorth(assets, liabilities);
    expect(result.netWorth).toBe(-40000);
    expect(result.isNegative).toBe(true);
    expect(result.isPositive).toBe(false);
  });

  test('should handle empty arrays', () => {
    const result = calculateNetWorth([], []);
    expect(result.totalAssets).toBe(0);
    expect(result.totalLiabilities).toBe(0);
    expect(result.netWorth).toBe(0);
  });

  test('should handle invalid asset/liability objects', () => {
    const assets = [
      { value: 'invalid' },
      { value: null },
      { value: 10000 }
    ];
    const liabilities = [
      { value: undefined },
      { value: 5000 }
    ];

    const result = calculateNetWorth(assets, liabilities);
    expect(result.totalAssets).toBe(10000);
    expect(result.totalLiabilities).toBe(5000);
    expect(result.netWorth).toBe(5000);
  });
});

// ============================================================================
// 🎯 FREEDOM RATIO TESTS
// ============================================================================

describe('Freedom Ratio Calculations', () => {
  test('should calculate freedom ratio correctly', () => {
    expect(calculateFreedomRatio(5000, 3000)).toBe(40); // 40% freedom ratio
    expect(calculateFreedomRatio(5000, 2500)).toBe(50); // 50% freedom ratio
    expect(calculateFreedomRatio(5000, 5000)).toBe(0); // 0% freedom ratio
  });

  test('should handle zero or negative income', () => {
    expect(calculateFreedomRatio(0, 1000)).toBe(0);
    expect(calculateFreedomRatio(-1000, 1000)).toBe(0);
  });

  test('should handle expenses higher than income', () => {
    expect(calculateFreedomRatio(2000, 3000)).toBe(0); // Can't be negative
  });

  test('should handle invalid inputs', () => {
    expect(calculateFreedomRatio('invalid', 1000)).toBe(0);
    expect(calculateFreedomRatio(5000, 'invalid')).toBe(0);
    expect(calculateFreedomRatio(null, null)).toBe(0);
  });
});

// ============================================================================
// 🏦 EMERGENCY FUND TESTS
// ============================================================================

describe('Emergency Fund Calculations', () => {
  test('should calculate emergency fund status correctly', () => {
    const result = calculateEmergencyFundStatus(18000, 3000, 6);
    expect(result.status).toBe('complete');
    expect(result.percentage).toBe(100);
    expect(result.monthsCovered).toBe(6);
    expect(result.shortfall).toBe(0);
  });

  test('should handle partial emergency fund', () => {
    const result = calculateEmergencyFundStatus(9000, 3000, 6);
    expect(result.status).toBe('halfway');
    expect(result.percentage).toBe(50);
    expect(result.monthsCovered).toBe(3);
    expect(result.shortfall).toBe(9000);
  });

  test('should handle zero expenses', () => {
    const result = calculateEmergencyFundStatus(10000, 0, 6);
    expect(result.status).toBe('complete');
    expect(result.percentage).toBe(100);
    expect(result.monthsCovered).toBe(0);
  });

  test('should handle invalid inputs', () => {
    const result = calculateEmergencyFundStatus('invalid', 'invalid', 'invalid');
    expect(result.status).toBe('insufficient');
    expect(result.percentage).toBe(0);
  });
});

// ============================================================================
// 💳 DEBT PAYOFF TESTS
// ============================================================================

describe('Debt Payoff Calculations', () => {
  const sampleDebts = [
    { id: '1', name: 'Credit Card', balance: 5000, interestRate: 18, minimumPayment: 150 },
    { id: '2', name: 'Car Loan', balance: 15000, interestRate: 5, minimumPayment: 300 }
  ];

  test('should calculate debt payoff with avalanche strategy', () => {
    const result = calculateDebtPayoff(sampleDebts, 'avalanche', 200);
    expect(result.totalDebt).toBe(20000);
    expect(result.strategy).toBe('avalanche');
    expect(result.payoffTime).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  test('should calculate debt payoff with snowball strategy', () => {
    const result = calculateDebtPayoff(sampleDebts, 'snowball', 200);
    expect(result.totalDebt).toBe(20000);
    expect(result.strategy).toBe('snowball');
    expect(result.payoffTime).toBeGreaterThan(0);
  });

  test('should handle empty debt array', () => {
    const result = calculateDebtPayoff([], 'avalanche', 0);
    expect(result.totalDebt).toBe(0);
    expect(result.payoffTime).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  test('should handle invalid debt data', () => {
    const invalidDebts = [
      { balance: 'invalid', interestRate: 'invalid', minimumPayment: 'invalid' },
      { balance: -1000, interestRate: 150, minimumPayment: -50 }
    ];

    const result = calculateDebtPayoff(invalidDebts, 'avalanche', 0);
    expect(result.totalDebt).toBe(0);
    expect(result.payoffTime).toBe(0);
  });
});

// ============================================================================
// 🏖️ RETIREMENT PROJECTION TESTS
// ============================================================================

describe('Retirement Projection Calculations', () => {
  test('should calculate retirement projection correctly', () => {
    const result = calculateRetirementProjection(30, 65, 10000, 500, 7);
    expect(result.yearsToRetirement).toBe(35);
    expect(result.totalRetirementFund).toBeGreaterThan(10000);
    expect(result.monthlyRetirementIncome).toBeGreaterThan(0);
    expect(result.growth).toBeGreaterThan(0);
  });

  test('should handle zero contributions', () => {
    const result = calculateRetirementProjection(30, 65, 10000, 0, 7);
    expect(result.totalRetirementFund).toBeGreaterThan(10000);
    expect(result.totalContributions).toBe(10000);
  });

  test('should handle retirement age reached', () => {
    const result = calculateRetirementProjection(65, 65, 100000, 500, 7);
    expect(result.yearsToRetirement).toBe(0);
    expect(result.totalRetirementFund).toBe(100000);
  });

  test('should handle invalid inputs', () => {
    const result = calculateRetirementProjection('invalid', 'invalid', 'invalid', 'invalid', 'invalid');
    expect(result.totalRetirementFund).toBe(0);
    expect(result.yearsToRetirement).toBe(0);
  });
});

// ============================================================================
// 🎯 GOAL PROGRESS TESTS
// ============================================================================

describe('Goal Progress Calculations', () => {
  test('should calculate goal progress correctly', () => {
    const result = calculateGoalProgress(5000, 10000, '2024-12-31');
    expect(result.percentage).toBe(50);
    expect(result.status).toBe('slow');
    expect(result.shortfall).toBe(5000);
    expect(result.requiredMonthly).toBeGreaterThan(0);
  });

  test('should handle completed goals', () => {
    const result = calculateGoalProgress(10000, 10000, '2024-12-31');
    expect(result.percentage).toBe(100);
    expect(result.status).toBe('complete');
    expect(result.shortfall).toBe(0);
    expect(result.requiredMonthly).toBe(0);
  });

  test('should handle zero target amount', () => {
    const result = calculateGoalProgress(5000, 0, '2024-12-31');
    expect(result.percentage).toBe(100);
    expect(result.status).toBe('complete');
  });

  test('should handle invalid date', () => {
    const result = calculateGoalProgress(5000, 10000, 'invalid-date');
    expect(result.percentage).toBe(50);
    expect(result.monthsRemaining).toBe(12); // Default to 1 year
  });
});

// ============================================================================
// 📊 BUDGET CALCULATION TESTS
// ============================================================================

describe('Budget Calculations', () => {
  test('should calculate 50/30/20 budget correctly', () => {
    const result = calculate503020Budget(5000);
    expect(result.needs).toBe(2500);
    expect(result.wants).toBe(1500);
    expect(result.savings).toBe(1000);
    expect(result.total).toBe(5000);
  });

  test('should calculate 6 Jars budget correctly', () => {
    const result = calculate6JarsBudget(5000);
    expect(result.necessities).toBe(2750); // 55%
    expect(result.longTermSavings).toBe(500); // 10%
    expect(result.education).toBe(500); // 10%
    expect(result.play).toBe(500); // 10%
    expect(result.give).toBe(500); // 10%
    expect(result.financialFreedom).toBe(250); // 5%
    expect(result.total).toBe(5000);
  });

  test('should handle zero income', () => {
    const result503020 = calculate503020Budget(0);
    expect(result503020.total).toBe(0);

    const result6Jars = calculate6JarsBudget(0);
    expect(result6Jars.total).toBe(0);
  });
});

// ============================================================================
// 🎮 FINANCIAL HEALTH SCORE TESTS
// ============================================================================

describe('Financial Health Score Calculations', () => {
  test('should calculate high financial health score', () => {
    const userData = {
      savings: { total: 18000 },
      expenses: { monthly: 3000 },
      debt: { total: 0 },
      income: { monthly: 5000 },
      netWorth: { total: 100000 }
    };

    const score = calculateFinancialHealthScore(userData);
    expect(score).toBeGreaterThan(75);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should calculate low financial health score', () => {
    const userData = {
      savings: { total: 0 },
      expenses: { monthly: 3000 },
      debt: { total: 50000 },
      income: { monthly: 2000 },
      netWorth: { total: -30000 }
    };

    const score = calculateFinancialHealthScore(userData);
    expect(score).toBeLessThan(50);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('should handle missing user data', () => {
    const score = calculateFinancialHealthScore({});
    expect(score).toBe(0);
  });

  test('should handle invalid user data', () => {
    const userData = {
      savings: { total: 'invalid' },
      expenses: { monthly: 'invalid' },
      debt: { total: 'invalid' },
      income: { monthly: 'invalid' },
      netWorth: { total: 'invalid' }
    };

    const score = calculateFinancialHealthScore(userData);
    expect(score).toBe(0);
  });
});

// ============================================================================
// 🚨 EDGE CASE TESTS
// ============================================================================

describe('Edge Cases and Error Handling', () => {
  test('should handle extremely large numbers', () => {
    const result = calculateNetWorth(
      [{ value: Number.MAX_SAFE_INTEGER }],
      [{ value: 1000 }]
    );
    expect(result.totalAssets).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.netWorth).toBe(Number.MAX_SAFE_INTEGER - 1000);
  });

  test('should handle extremely small numbers', () => {
    const result = calculateNetWorth(
      [{ value: 0.01 }],
      [{ value: 0.005 }]
    );
    expect(result.netWorth).toBe(0.005);
  });

  test('should handle division by zero scenarios', () => {
    const result = calculateFreedomRatio(0, 1000);
    expect(result).toBe(0);
  });

  test('should handle null and undefined inputs gracefully', () => {
    expect(calculateNetWorth(null, undefined)).toEqual({
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      isPositive: false,
      isNegative: false,
      isZero: true
    });
  });
});

// ============================================================================
// 🎯 PERFORMANCE TESTS
// ============================================================================

describe('Performance Tests', () => {
  test('should handle large datasets efficiently', () => {
    const largeAssets = Array.from({ length: 1000 }, (_, i) => ({ value: i * 100 }));
    const largeLiabilities = Array.from({ length: 1000 }, (_, i) => ({ value: i * 50 }));

    const startTime = performance.now();
    const result = calculateNetWorth(largeAssets, largeLiabilities);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    expect(result.totalAssets).toBe(49950000); // Sum of 0+100+200+...+99900
    expect(result.totalLiabilities).toBe(24975000); // Sum of 0+50+100+...+49950
  });
});

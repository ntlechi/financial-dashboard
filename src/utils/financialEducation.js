// Financial Education System - Contextual learning based on user's journey
export const FINANCIAL_EDUCATION_MODULES = {
  // Emergency Fund Education
  'emergency_fund_basics': {
    title: 'Emergency Fund Fundamentals',
    content: 'An emergency fund is your financial safety net. Aim for 3-6 months of expenses to protect against unexpected events like job loss or medical bills.',
    tips: [
      'Start with $1,000 as your first milestone',
      'Keep it in a high-yield savings account',
      'Only use it for true emergencies',
      'Automate your savings to build it faster'
    ],
    unlockTrigger: 'first_savings_goal',
    rank: 'Recruit'
  },
  
  'emergency_fund_advanced': {
    title: 'Optimizing Your Emergency Fund',
    content: 'Now that you have a basic emergency fund, learn how to optimize it for maximum growth and accessibility.',
    tips: [
      'Consider a tiered approach: checking, savings, and money market',
      'Review and adjust your target based on life changes',
      'Use high-yield accounts to combat inflation',
      'Consider your job security when setting the amount'
    ],
    unlockTrigger: 'emergency_fund_50_percent',
    rank: 'Climber'
  },

  // Debt Management Education
  'debt_payoff_strategies': {
    title: 'Debt Payoff Strategies',
    content: 'Learn the two most effective methods for paying off debt: the Snowball and Avalanche methods.',
    tips: [
      'Snowball Method: Pay smallest debts first for psychological wins',
      'Avalanche Method: Pay highest interest debts first to save money',
      'Choose the method that motivates you most',
      'Consider debt consolidation for high-interest debts'
    ],
    unlockTrigger: 'first_debt_account',
    rank: 'Recruit'
  },

  'debt_consolidation': {
    title: 'Debt Consolidation Strategies',
    content: 'When you have multiple high-interest debts, consolidation can save you money and simplify payments.',
    tips: [
      'Compare balance transfer cards with low intro rates',
      'Consider personal loans for fixed-rate consolidation',
      'Calculate total interest savings before consolidating',
      'Avoid new debt while paying off consolidated debt'
    ],
    unlockTrigger: 'multiple_debt_accounts',
    rank: 'Climber'
  },

  // Investment Education
  'investment_basics': {
    title: 'Investment Fundamentals',
    content: 'Start your investment journey with these essential concepts for building long-term wealth.',
    tips: [
      'Start with employer 401(k) matching - it\'s free money',
      'Understand the difference between stocks, bonds, and funds',
      'Diversification reduces risk across different assets',
      'Time in the market beats timing the market'
    ],
    unlockTrigger: 'net_worth_positive',
    rank: 'Climber'
  },

  'retirement_planning': {
    title: 'Retirement Planning Essentials',
    content: 'Plan for your future with these retirement savings strategies and account types.',
    tips: [
      'Maximize employer 401(k) matching first',
      'Consider Roth vs Traditional IRA based on tax situation',
      'Aim to save 15-20% of income for retirement',
      'Use the rule of 25: multiply annual expenses by 25 for retirement target'
    ],
    unlockTrigger: 'first_retirement_contribution',
    rank: 'Operator'
  },

  // Advanced Topics
  'tax_optimization': {
    title: 'Tax Optimization Strategies',
    content: 'Learn how to legally minimize your tax burden and maximize your savings.',
    tips: [
      'Maximize tax-advantaged accounts (401k, IRA, HSA)',
      'Consider tax-loss harvesting in taxable accounts',
      'Time major purchases to optimize deductions',
      'Keep detailed records for tax deductions'
    ],
    unlockTrigger: 'high_income_earner',
    rank: 'Pathfinder'
  },

  'wealth_building': {
    title: 'Advanced Wealth Building',
    content: 'Advanced strategies for accelerating wealth accumulation and achieving financial independence.',
    tips: [
      'Increase income through side hustles and skill development',
      'Optimize your savings rate - aim for 50%+ if possible',
      'Consider real estate as part of your portfolio',
      'Plan for tax-efficient wealth transfer'
    ],
    unlockTrigger: 'net_worth_100k',
    rank: 'Vanguard'
  }
};

// Contextual education based on user's current situation
export function getContextualEducation(userData, userRank, unlockedModules = []) {
  const suggestions = [];

  // Emergency fund education
  if (userData.savings?.total > 0 && !unlockedModules.includes('emergency_fund_basics')) {
    suggestions.push('emergency_fund_basics');
  }

  // Debt education
  if (userData.debt?.total > 0 && !unlockedModules.includes('debt_payoff_strategies')) {
    suggestions.push('debt_payoff_strategies');
  }

  // Investment education
  if (userData.netWorth?.total > 0 && !unlockedModules.includes('investment_basics')) {
    suggestions.push('investment_basics');
  }

  // Retirement education
  if (userData.registeredAccounts?.total > 0 && !unlockedModules.includes('retirement_planning')) {
    suggestions.push('retirement_planning');
  }

  return suggestions;
}

// Check for new education unlocks based on user actions
export function checkEducationUnlocks(userData, userRank, currentUnlocked = []) {
  const newUnlocks = [];
  const unlocked = [...currentUnlocked];

  // Check each education module
  Object.entries(FINANCIAL_EDUCATION_MODULES).forEach(([moduleId, module]) => {
    if (unlocked.includes(moduleId)) return; // Already unlocked

    let shouldUnlock = false;

    // Check unlock conditions
    switch (module.unlockTrigger) {
      case 'first_savings_goal':
        shouldUnlock = userData.savings?.total > 0;
        break;
      case 'emergency_fund_50_percent':
        shouldUnlock = userData.savings?.total >= (userData.savings?.goal * 0.5);
        break;
      case 'first_debt_account':
        shouldUnlock = userData.debt?.total > 0;
        break;
      case 'multiple_debt_accounts':
        shouldUnlock = userData.debt?.accounts?.length > 1;
        break;
      case 'net_worth_positive':
        shouldUnlock = userData.netWorth?.total > 0;
        break;
      case 'first_retirement_contribution':
        shouldUnlock = userData.registeredAccounts?.total > 0;
        break;
      case 'high_income_earner':
        shouldUnlock = userData.income?.monthly > 5000; // $60k+ annually
        break;
      case 'net_worth_100k':
        shouldUnlock = userData.netWorth?.total >= 100000;
        break;
    }

    if (shouldUnlock) {
      newUnlocks.push(moduleId);
      unlocked.push(moduleId);
    }
  });

  return { newUnlocks, unlocked };
}

// Get education content for a specific module
export function getEducationContent(moduleId) {
  return FINANCIAL_EDUCATION_MODULES[moduleId] || null;
}



// Feature Unlock System - What users unlock at each rank
export const RANK_FEATURE_UNLOCKS = {
  'Recruit': {
    features: [
      'basic_budget_tracking',
      'simple_goals',
      'basic_debt_tracking'
    ],
    description: 'Basic financial tracking tools'
  },
  'Climber': {
    features: [
      'advanced_budget_categories',
      'custom_goal_templates',
      'debt_payoff_strategies',
      'expense_categorization'
    ],
    description: 'Enhanced tracking and planning tools'
  },
  'Operator': {
    features: [
      'investment_portfolio',
      'advanced_analytics',
      'freedom_journal',
      'side_hustle_tracking',
      'export_reports'
    ],
    description: 'Professional-grade financial tools'
  },
  'Pathfinder': {
    features: [
      'tax_optimization',
      'retirement_calculator',
      'advanced_debt_strategies',
      'financial_forecasting',
      'custom_dashboards'
    ],
    description: 'Advanced financial optimization'
  },
  'Vanguard': {
    features: [
      'ai_financial_insights',
      'advanced_investment_analysis',
      'tax_loss_harvesting',
      'premium_support',
      'priority_features'
    ],
    description: 'Expert-level financial management'
  },
  'Free Agent': {
    features: [
      'lifetime_premium',
      'personal_advisor_chat',
      'custom_financial_coaching',
      'exclusive_content',
      'beta_features'
    ],
    description: 'Ultimate financial freedom tools'
  }
};

// Milestone-based unlocks
export const MILESTONE_UNLOCKS = {
  'emergency_fund_complete': {
    badge: 'Financial Security',
    xpReward: 500,
    features: ['emergency_fund_tracker', 'security_insights'],
    description: 'You\'ve built your financial foundation!'
  },
  'debt_free': {
    badge: 'Freedom Fighter',
    xpReward: 1000,
    features: ['debt_free_celebration', 'premium_month_free'],
    description: 'You\'ve achieved financial freedom!'
  },
  'net_worth_10k': {
    badge: 'Wealth Builder',
    xpReward: 750,
    features: ['wealth_tracking', 'advanced_analytics'],
    description: 'You\'re building real wealth!'
  },
  'net_worth_100k': {
    badge: 'High Net Worth',
    xpReward: 1500,
    features: ['hnw_tools', 'personal_advisor_access'],
    description: 'You\'ve reached high net worth status!'
  },
  '30_days_active': {
    badge: 'Consistent',
    xpReward: 300,
    features: ['daily_challenges', 'streak_tracking'],
    description: 'You\'ve built a consistent habit!'
  },
  '100_transactions': {
    badge: 'Detail-Oriented',
    xpReward: 400,
    features: ['advanced_categorization', 'transaction_insights'],
    description: 'You\'re tracking every detail!'
  },
  '12_months_active': {
    badge: 'Loyalty',
    xpReward: 2000,
    features: ['lifetime_premium', 'exclusive_content'],
    description: 'You\'re a true Freedom Compass veteran!'
  }
};

// Check if user has access to a feature
export function hasFeatureAccess(userRank, feature) {
  const rankFeatures = RANK_FEATURE_UNLOCKS[userRank]?.features || [];
  return rankFeatures.includes(feature);
}

// Get all unlocked features for a user
export function getUnlockedFeatures(userRank, unlockedMilestones = []) {
  const rankFeatures = RANK_FEATURE_UNLOCKS[userRank]?.features || [];
  const milestoneFeatures = unlockedMilestones.flatMap(milestoneId => 
    MILESTONE_UNLOCKS[milestoneId]?.features || []
  );
  
  return [...new Set([...rankFeatures, ...milestoneFeatures])];
}

// Get next rank preview with features
export function getNextRankPreview(currentRank) {
  const ranks = ['Recruit', 'Climber', 'Operator', 'Pathfinder', 'Vanguard', 'Free Agent'];
  const currentIndex = ranks.indexOf(currentRank);
  
  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return null; // Already at max rank
  }
  
  const nextRank = ranks[currentIndex + 1];
  return {
    rank: nextRank,
    features: RANK_FEATURE_UNLOCKS[nextRank]?.features || [],
    description: RANK_FEATURE_UNLOCKS[nextRank]?.description || ''
  };
}

// Check for new milestone unlocks
export function checkMilestoneUnlocks(userData) {
  const newUnlocks = [];
  
  // Check emergency fund milestone
  if (userData.savings?.total >= userData.savings?.goal && 
      !userData.unlockedMilestones?.includes('emergency_fund_complete')) {
    newUnlocks.push('emergency_fund_complete');
  }
  
  // Check debt-free milestone
  if (userData.debt?.total <= 0 && 
      !userData.unlockedMilestones?.includes('debt_free')) {
    newUnlocks.push('debt_free');
  }
  
  // Check net worth milestones
  const netWorth = userData.netWorth?.total || 0;
  if (netWorth >= 10000 && !userData.unlockedMilestones?.includes('net_worth_10k')) {
    newUnlocks.push('net_worth_10k');
  }
  if (netWorth >= 100000 && !userData.unlockedMilestones?.includes('net_worth_100k')) {
    newUnlocks.push('net_worth_100k');
  }
  
  return newUnlocks;
}



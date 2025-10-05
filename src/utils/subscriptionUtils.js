// Subscription and Feature Gating Utilities

export const SUBSCRIPTION_TIERS = {
  FREE: 'recon',
  CLIMBER: 'climber', 
  OPERATOR: 'operator',
  FOUNDERS_CIRCLE: 'founders-circle'
};

export const TIER_HIERARCHY = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.CLIMBER]: 1,
  [SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]: 2, // Same level as Operator
  [SUBSCRIPTION_TIERS.OPERATOR]: 2
};

// Feature access definitions
export const FEATURE_ACCESS = {
  // Dashboard Features
  'basic-dashboard': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'advanced-dashboard': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'full-dashboard': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  
  // Core Features
  'budget-calculator': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'transaction-management': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'data-export': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  
  // Climber+ Features
  'financial-calculators': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'advanced-analytics': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'goal-tracking': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'projections': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  
  // Operator+ Features  
  'side-hustle': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'investment-portfolio': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'travel-mode': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'business-analytics': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'tax-optimization': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE],
  'multi-currency': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]
};

// Dashboard card access control
export const DASHBOARD_CARDS = {
  // Always available (Free+)
  'net-worth': { tier: SUBSCRIPTION_TIERS.FREE, name: 'Net Worth' },
  'cash-flow': { tier: SUBSCRIPTION_TIERS.FREE, name: 'Cash Flow' },
  'savings-rate': { tier: SUBSCRIPTION_TIERS.FREE, name: 'Savings Rate' },
  
  // Climber+ only
  'financial-freedom': { tier: SUBSCRIPTION_TIERS.CLIMBER, name: 'Financial Freedom Goal' },
  'debt-payoff': { tier: SUBSCRIPTION_TIERS.CLIMBER, name: 'Debt Payoff Calculator' },
  'emergency-fund': { tier: SUBSCRIPTION_TIERS.CLIMBER, name: 'Emergency Fund' },
  'credit-score': { tier: SUBSCRIPTION_TIERS.CLIMBER, name: 'Credit Score Tracking' },
  
  // Operator+ only
  'side-hustle-tracker': { tier: SUBSCRIPTION_TIERS.OPERATOR, name: 'Side Hustle Tracker' },
  'investment-portfolio': { tier: SUBSCRIPTION_TIERS.OPERATOR, name: 'Investment Portfolio' },
  'travel-expenses': { tier: SUBSCRIPTION_TIERS.OPERATOR, name: 'Travel Expenses' },
  'tax-planning': { tier: SUBSCRIPTION_TIERS.OPERATOR, name: 'Tax Planning' }
};

/**
 * Check if user has access to a specific feature
 * @param {string} userTier - User's current subscription tier
 * @param {string} feature - Feature to check access for
 * @returns {boolean} - Whether user has access
 */
export const hasFeatureAccess = (userTier, feature) => {
  const allowedTiers = FEATURE_ACCESS[feature];
  return allowedTiers ? allowedTiers.includes(userTier) : false;
};

/**
 * Check if user has access to a dashboard card
 * @param {string} userTier - User's current subscription tier  
 * @param {string} cardId - Dashboard card ID
 * @returns {boolean} - Whether user has access
 */
export const hasDashboardCardAccess = (userTier, cardId) => {
  const card = DASHBOARD_CARDS[cardId];
  if (!card) return false;
  
  const userLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredLevel = TIER_HIERARCHY[card.tier] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Get the minimum required tier for a feature
 * @param {string} feature - Feature to check
 * @returns {string} - Required subscription tier
 */
export const getRequiredTier = (feature) => {
  const allowedTiers = FEATURE_ACCESS[feature];
  if (!allowedTiers || allowedTiers.length === 0) return SUBSCRIPTION_TIERS.OPERATOR;
  
  // Return the lowest tier that has access
  const tierLevels = allowedTiers.map(tier => ({ tier, level: TIER_HIERARCHY[tier] || 0 }));
  tierLevels.sort((a, b) => a.level - b.level);
  
  return tierLevels[0].tier;
};

/**
 * Get user-friendly tier name
 * @param {string} tier - Subscription tier
 * @returns {string} - Display name
 */
export const getTierDisplayName = (tier) => {
  const names = {
    [SUBSCRIPTION_TIERS.FREE]: 'Recon Kit',
    [SUBSCRIPTION_TIERS.CLIMBER]: 'Climber Plan',
    [SUBSCRIPTION_TIERS.OPERATOR]: 'Operator Plan',
    [SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]: "Founder's Circle"
  };
  return names[tier] || 'Unknown Plan';
};

/**
 * Check if Founder's Circle offer is currently available
 * @param {number} foundersCount - Current number of founders
 * @param {Date} launchDate - Launch date
 * @returns {boolean} - Whether offer is available
 */
export const isFoundersCircleAvailable = (foundersCount = 0, launchDate = new Date('2025-10-19T13:00:00.000Z')) => {
  const now = new Date();
  const launchEndDate = new Date(launchDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later
  
  return now >= launchDate && now <= launchEndDate && foundersCount < 100;
};

/**
 * Get upgrade suggestions for locked features
 * @param {string} currentTier - User's current tier
 * @param {string} feature - Locked feature
 * @returns {object} - Upgrade suggestions
 */
export const getUpgradeSuggestions = (currentTier, feature) => {
  const requiredTier = getRequiredTier(feature);
  const isFoundersAvailable = isFoundersCircleAvailable();
  
  const suggestions = [];
  
  // Always suggest the required tier
  if (requiredTier !== currentTier) {
    suggestions.push({
      tier: requiredTier,
      name: getTierDisplayName(requiredTier),
      primary: true
    });
  }
  
  // Suggest Founder's Circle if available and better value
  if (isFoundersAvailable && requiredTier === SUBSCRIPTION_TIERS.OPERATOR) {
    suggestions.unshift({
      tier: SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE),
      primary: true,
      isLimited: true,
      savings: true
    });
  }
  
  return suggestions;
};

export default {
  SUBSCRIPTION_TIERS,
  TIER_HIERARCHY,
  FEATURE_ACCESS,
  DASHBOARD_CARDS,
  hasFeatureAccess,
  hasDashboardCardAccess,
  getRequiredTier,
  getTierDisplayName,
  isFoundersCircleAvailable,
  getUpgradeSuggestions
};
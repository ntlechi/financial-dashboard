// Subscription and Feature Gating Utilities

export const SUBSCRIPTION_TIERS = {
  FREE: 'recon',
  CLIMBER: 'climber', 
  OPERATOR: 'operator',
  FOUNDERS_CIRCLE: 'founders-circle',
  EARLY_ADOPTER: 'early-adopter'
};

export const TIER_HIERARCHY = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.CLIMBER]: 1,
  [SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]: 2, // Same level as Operator
  [SUBSCRIPTION_TIERS.OPERATOR]: 2,
  [SUBSCRIPTION_TIERS.EARLY_ADOPTER]: 2 // Same level as Operator
};

// Feature access definitions (v1.1 UPDATE)
export const FEATURE_ACCESS = {
  // Dashboard Features
  'basic-dashboard': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'advanced-dashboard': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'full-dashboard': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  
  // Core Features (Recon Kit + All)
  'budget-calculator': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'transaction-management': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'data-export': [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  
  // Climber+ Features
  'financial-calculators': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'advanced-analytics': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'goal-tracking': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'projections': [SUBSCRIPTION_TIERS.CLIMBER, SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  
  // Side Hustle: Operator+ only (SIMPLIFIED - no limits to enforce)
  'side-hustle': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  
  // Operator+ Features  
  'investment-portfolio': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'investment': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER], // Alias for tab
  'travel-mode': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'travel': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER], // Alias for tab
  'business-analytics': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'tax-optimization': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'multi-currency': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER],
  'export-freedom-story': [SUBSCRIPTION_TIERS.OPERATOR, SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE, SUBSCRIPTION_TIERS.EARLY_ADOPTER]
};

// Side hustle limits by tier
export const SIDE_HUSTLE_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.CLIMBER]: 0,
  [SUBSCRIPTION_TIERS.OPERATOR]: Infinity,
  [SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]: Infinity,
  [SUBSCRIPTION_TIERS.EARLY_ADOPTER]: Infinity
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
 * Get side hustle limit for user's tier
 * @param {string} userTier - User's current subscription tier
 * @returns {number} - Maximum number of side hustles allowed
 */
export const getSideHustleLimit = (userTier) => {
  return SIDE_HUSTLE_LIMITS[userTier] || 0;
};

/**
 * Check if user can add another side hustle
 * @param {string} userTier - User's current subscription tier
 * @param {number} currentCount - Current number of active side hustles
 * @returns {boolean} - Whether user can add more
 */
export const canAddSideHustle = (userTier, currentCount) => {
  const limit = getSideHustleLimit(userTier);
  return currentCount < limit;
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
    [SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE]: "Founder's Circle",
    [SUBSCRIPTION_TIERS.EARLY_ADOPTER]: 'Early Adopter Plan'
  };
  return names[tier] || 'Unknown Plan';
};

/**
 * Check if Founder's Circle offer is currently available
 * @param {number} foundersCount - Current number of founders
 * @param {Date} launchDate - Launch date
 * @returns {boolean} - Whether offer is available
 */
export const isFoundersCircleAvailable = (foundersCount = 0, launchDate = new Date('2024-01-01T00:00:00.000Z')) => {
  const now = new Date();
  // For testing: Make Founder's Circle available for the next 30 days
  const testEndDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
  
  return now >= launchDate && now <= testEndDate && foundersCount < 100;
};

/**
 * Check if Early Adopter offer is currently available
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {boolean} - Whether offer is available
 */
export const isEarlyAdopterAvailable = (earlyAdopterCount = 0) => {
  const now = new Date();
  const phase2Start = new Date('2025-10-27T00:00:00.000Z');
  const phase2End = new Date('2026-01-01T23:59:59.999Z');
  
  return now >= phase2Start && now <= phase2End && earlyAdopterCount < 500;
};

/**
 * Get current pricing phase
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {string} - Current phase: 'founders', 'early-adopter', or 'regular'
 */
export const getCurrentPricingPhase = (foundersCount = 0, earlyAdopterCount = 0) => {
  if (isFoundersCircleAvailable(foundersCount)) {
    return 'founders';
  } else if (isEarlyAdopterAvailable(earlyAdopterCount)) {
    return 'early-adopter';
  } else {
    return 'regular';
  }
};

/**
 * Get pricing phase message
 * @param {string} phase - Current pricing phase
 * @returns {string} - Phase-specific message
 */
export const getPricingPhaseMessage = (phase) => {
  const messages = {
    'founders': "Limited time: Join the Founder's Circle for lifetime access!",
    'early-adopter': "You missed the Founder's Circle, but you can still join the expedition at the Early Adopter rate.",
    'regular': "Choose your plan and start your financial journey today."
  };
  return messages[phase] || messages.regular;
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
  SIDE_HUSTLE_LIMITS,
  hasFeatureAccess,
  hasDashboardCardAccess,
  getRequiredTier,
  getTierDisplayName,
  isFoundersCircleAvailable,
  isEarlyAdopterAvailable,
  getCurrentPricingPhase,
  getPricingPhaseMessage,
  getUpgradeSuggestions,
  getSideHustleLimit,
  canAddSideHustle
};
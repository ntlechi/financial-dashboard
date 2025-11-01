// 3-Phase Pricing System for Kompul
// Phase 1: Founder's Circle (Oct 19-26, 2025) - 100 spots
// Phase 2: Early Adopter (Oct 27, 2025 - Jan 1, 2026) - 500 spots  
// Phase 3: Regular Pricing (Jan 2, 2026+)

import { SUBSCRIPTION_TIERS, getCurrentPricingPhase, getPricingPhaseMessage } from './utils/subscriptionUtils';

// Base pricing structure
export const PRICING_PHASES = {
  FOUNDERS: 'founders',
  EARLY_ADOPTER: 'early-adopter', 
  REGULAR: 'regular'
};

// Pricing plans for each phase
export const pricingPlans = {
  // Phase 1: Founder's Circle (Oct 19-26, 2025)
  [PRICING_PHASES.FOUNDERS]: {
    foundersCircle: {
      id: 'founders-circle',
      name: "The Founder's Circle",
      price: 7.49,
      interval: 'month',
      description: 'Get lifetime access to The Operator Plan for less than the Climber plan.',
      features: [
        'Everything in The Operator Plan',
        'Side Hustle Management',
        'Investment Portfolio',
        'Travel Mode',
        'Freedom Journal',
        'Export Freedom Story',
        'A permanent price lock',
        'Exclusive Founder badge',
        'Early access to new features',
        'Monthly billing only - less friction!'
      ],
      cta: 'Claim Your Founder\'s Spot',
      popular: true,
      badge: 'Limited Time',
      tier: SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE,
      limited: true,
      spotsLeft: 100,
      monthlyOnly: true // Flag to hide yearly option
    },
    
    recon: {
      id: 'recon',
      name: 'Recon Kit',
      price: 0,
      interval: 'month',
      description: 'Get your financial bearings. Free forever.',
      features: [
        'Basic Dashboard View',
        'Full Budget Calculator', 
        'Full Transaction Logging',
        'Basic Financial Tracking'
      ],
      cta: 'Start Your Recon',
      popular: false,
      tier: SUBSCRIPTION_TIERS.FREE
    },
    
    climber: {
      id: 'climber',
      name: 'Climber Plan',
      price: 7.99,
      interval: 'month',
      yearlyPrice: 79,
      description: 'The essential gear for the ascent.',
      features: [
        'Everything in Recon Kit',
        'Full Advanced Dashboard',
        'All Financial Calculators',
        'Debt Payoff Tracker',
        'Emergency Fund Calculator',
        'Goal Tracking'
      ],
      cta: 'Begin the Climb',
      popular: false,
      tier: SUBSCRIPTION_TIERS.CLIMBER
    },
    
    operator: {
      id: 'operator',
      name: 'Operator Plan',
      price: 14.99,
      interval: 'month',
      yearlyPrice: 149,
      description: 'The full arsenal for building your empire.',
      features: [
        'Everything in Climber',
        'Side Hustle Management',
        'Investment Portfolio',
        'Travel Mode',
        'Freedom Journal',
        'Export Freedom Story',
        'Advanced Analytics',
        'Priority Support'
      ],
      cta: 'Become an Operator',
      popular: false,
      tier: SUBSCRIPTION_TIERS.OPERATOR
    }
  },

  // Phase 2: Early Adopter (Oct 27, 2025 - Jan 1, 2026)
  [PRICING_PHASES.EARLY_ADOPTER]: {
    earlyAdopter: {
      id: 'early-adopter',
      name: 'Early Adopter Plan',
      price: 8.49,
      interval: 'month',
      description: 'You missed the Founder\'s Circle, but you can still join the expedition at the Early Adopter rate.',
      features: [
        'Everything in The Operator Plan',
        'Side Hustle Management',
        'Investment Portfolio',
        'Travel Mode',
        'Freedom Journal',
        'Export Freedom Story',
        'Early Adopter badge',
        '43% off regular price',
        'Monthly billing only - less friction!'
      ],
      cta: 'Join Early Adopters',
      popular: true,
      badge: 'Early Adopter',
      tier: SUBSCRIPTION_TIERS.EARLY_ADOPTER,
      limited: true,
      spotsLeft: 500,
      savings: 'Save $6.50/month vs regular price',
      monthlyOnly: true // Flag to hide yearly option
    },
    
    recon: {
      id: 'recon',
      name: 'Recon Kit',
      price: 0,
      interval: 'month',
      description: 'Get your financial bearings. Free forever.',
      features: [
        'Basic Dashboard View',
        'Full Budget Calculator',
        'Full Transaction Logging',
        'Basic Financial Tracking'
      ],
      cta: 'Start Your Recon',
      popular: false,
      tier: SUBSCRIPTION_TIERS.FREE
    },
    
    climber: {
      id: 'climber',
      name: 'Climber Plan',
      price: 7.99,
      interval: 'month',
      yearlyPrice: 79,
      description: 'The essential gear for the ascent.',
      features: [
        'Everything in Recon Kit',
        'Full Advanced Dashboard',
        'All Financial Calculators',
        'Debt Payoff Tracker',
        'Emergency Fund Calculator',
        'Goal Tracking'
      ],
      cta: 'Begin the Climb',
      popular: false,
      tier: SUBSCRIPTION_TIERS.CLIMBER
    },
    
    operator: {
      id: 'operator',
      name: 'Operator Plan',
      price: 14.99,
      interval: 'month',
      yearlyPrice: 149,
      description: 'The full arsenal for building your empire.',
      features: [
        'Everything in Climber',
        'Side Hustle Management',
        'Investment Portfolio',
        'Travel Mode',
        'Freedom Journal',
        'Export Freedom Story',
        'Advanced Analytics',
        'Priority Support'
      ],
      cta: 'Become an Operator',
      popular: false,
      tier: SUBSCRIPTION_TIERS.OPERATOR
    }
  },

  // Phase 3: Regular Pricing (Jan 2, 2026+)
  [PRICING_PHASES.REGULAR]: {
    recon: {
      id: 'recon',
      name: 'Recon Kit',
      price: 0,
      interval: 'month',
      description: 'Get your financial bearings. Free forever.',
      features: [
        'Basic Dashboard View',
        'Full Budget Calculator',
        'Full Transaction Logging',
        'Basic Financial Tracking'
      ],
      cta: 'Start Your Recon',
      popular: false,
      tier: SUBSCRIPTION_TIERS.FREE
    },
    
    climber: {
      id: 'climber',
      name: 'Climber Plan',
      price: 7.99,
      interval: 'month',
      yearlyPrice: 79,
      description: 'The essential gear for the ascent.',
      features: [
        'Everything in Recon Kit',
        'Full Advanced Dashboard',
        'All Financial Calculators',
        'Debt Payoff Tracker',
        'Emergency Fund Calculator',
        'Goal Tracking'
      ],
      cta: 'Begin the Climb',
      popular: false,
      tier: SUBSCRIPTION_TIERS.CLIMBER
    },
    
    operator: {
      id: 'operator',
      name: 'Operator Plan',
      price: 14.99,
      interval: 'month',
      yearlyPrice: 149,
      description: 'The full arsenal for building your empire.',
      features: [
        'Everything in Climber',
        'Side Hustle Management',
        'Investment Portfolio',
        'Travel Mode',
        'Freedom Journal',
        'Export Freedom Story',
        'Advanced Analytics',
        'Priority Support'
      ],
      cta: 'Become an Operator',
      popular: true,
      badge: 'Most Popular',
      tier: SUBSCRIPTION_TIERS.OPERATOR
    }
  }
};

/**
 * Get current pricing plans based on phase
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {object} - Current pricing plans
 */
export const getCurrentPricingPlans = (foundersCount = 0, earlyAdopterCount = 0) => {
  const phase = getCurrentPricingPhase(foundersCount, earlyAdopterCount);
  return pricingPlans[phase] || pricingPlans[PRICING_PHASES.REGULAR];
};

/**
 * Get pricing phase info
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {object} - Phase information
 */
export const getPricingPhaseInfo = (foundersCount = 0, earlyAdopterCount = 0) => {
  const phase = getCurrentPricingPhase(foundersCount, earlyAdopterCount);
  const message = getPricingPhaseMessage(phase);
  
  return {
    phase,
    message,
    isFoundersPhase: phase === PRICING_PHASES.FOUNDERS,
    isEarlyAdopterPhase: phase === PRICING_PHASES.EARLY_ADOPTER,
    isRegularPhase: phase === PRICING_PHASES.REGULAR
  };
};

/**
 * Get plan by ID for current phase
 * @param {string} planId - Plan ID
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {object} - Plan object
 */
export const getPlanById = (planId, foundersCount = 0, earlyAdopterCount = 0) => {
  const currentPlans = getCurrentPricingPlans(foundersCount, earlyAdopterCount);
  return currentPlans[planId] || null;
};

/**
 * Get all available plan IDs for current phase
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {array} - Array of plan IDs
 */
export const getAvailablePlanIds = (foundersCount = 0, earlyAdopterCount = 0) => {
  const currentPlans = getCurrentPricingPlans(foundersCount, earlyAdopterCount);
  return Object.keys(currentPlans);
};

// Stripe Price IDs - Uses environment variables
export const STRIPE_PRICE_IDS = {
  // Founder's Circle Phase - Monthly Only (Less Friction!)
  'founders-circle-monthly': process.env.REACT_APP_STRIPE_FOUNDERS_CIRCLE_MONTHLY,
  
  // Early Adopter Phase - Monthly Only (Less Friction!)
  'early-adopter-monthly': process.env.REACT_APP_STRIPE_EARLY_ADOPTER_MONTHLY,
  
  // Regular Phase - Monthly and Yearly options
  'climber-monthly': process.env.REACT_APP_STRIPE_CLIMBER_MONTHLY,
  'climber-yearly': process.env.REACT_APP_STRIPE_CLIMBER_ANNUAL,
  'operator-monthly': process.env.REACT_APP_STRIPE_OPERATOR_MONTHLY,
  'operator-yearly': process.env.REACT_APP_STRIPE_OPERATOR_ANNUAL
};

/**
 * Get Stripe price ID for plan and billing cycle
 * @param {string} planId - Plan ID
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @param {number} foundersCount - Current number of founders
 * @param {number} earlyAdopterCount - Current number of early adopters
 * @returns {string} - Stripe price ID
 */
export const getStripePriceId = (planId, billingCycle = 'monthly', foundersCount = 0, earlyAdopterCount = 0) => {
  const phase = getCurrentPricingPhase(foundersCount, earlyAdopterCount);
  
  // Map plan IDs to Stripe price IDs based on phase
  const priceIdMap = {
    [PRICING_PHASES.FOUNDERS]: {
      'founders-circle': {
        monthly: STRIPE_PRICE_IDS['founders-circle-monthly']
        // No yearly option - monthly only
      }
    },
    [PRICING_PHASES.EARLY_ADOPTER]: {
      'early-adopter': {
        monthly: STRIPE_PRICE_IDS['early-adopter-monthly']
        // No yearly option - monthly only
      }
    },
    [PRICING_PHASES.REGULAR]: {
      'climber': {
        monthly: STRIPE_PRICE_IDS['climber-monthly'],
        yearly: STRIPE_PRICE_IDS['climber-yearly']
      },
      'operator': {
        monthly: STRIPE_PRICE_IDS['operator-monthly'],
        yearly: STRIPE_PRICE_IDS['operator-yearly']
      }
    }
  };
  
  return priceIdMap[phase]?.[planId]?.[billingCycle] || null;
};

const pricingModule = {
  PRICING_PHASES,
  pricingPlans,
  getCurrentPricingPlans,
  getPricingPhaseInfo,
  getPlanById,
  getAvailablePlanIds,
  STRIPE_PRICE_IDS,
  getStripePriceId
};

export default pricingModule;
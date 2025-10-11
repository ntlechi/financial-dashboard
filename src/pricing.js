// 3-Phase Pricing System for Freedom Compass
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
        'Private Discord community',
        'Monthly billing only - less friction!'
      ],
      cta: 'Claim Your Founder\'s Spot',
      popular: true,
      badge: 'Limited Time',
      tier: SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE,
      limited: true,
      spotsLeft: 100,
      monthlyOnly: true // Flag to hide yearly option
    }
  },

  // Phase 2: Early Adopter (Oct 27, 2025 - Jan 1, 2026)
  [PRICING_PHASES.EARLY_ADOPTER]: {
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

// Stripe Price IDs - Special phases configured ✅
export const STRIPE_PRICE_IDS = {
  // Founder's Circle Phase - Monthly Only (Less Friction!)
  'founders-circle-monthly': 'price_1SEtrg82nQ0x7qb2NBJr0IVU', // $7.49/month ✅ CONFIGURED
  
  // Early Adopter Phase - Monthly Only (Less Friction!)
  'early-adopter-monthly': 'price_1SH2rg82nQ0x7qb2wte7rkSV', // $8.49/month - Product: prod_TDTpoRdW2RGmxZ
  
  // Regular Phase
  'climber-monthly': 'price_climber_monthly',
  'climber-yearly': 'price_climber_yearly',
  'operator-monthly': 'price_operator_monthly',
  'operator-yearly': 'price_operator_yearly'
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

export default {
  PRICING_PHASES,
  pricingPlans,
  getCurrentPricingPlans,
  getPricingPhaseInfo,
  getPlanById,
  getAvailablePlanIds,
  STRIPE_PRICE_IDS,
  getStripePriceId
};
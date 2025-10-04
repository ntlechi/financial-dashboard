// Pricing Plans for The Freedom Compass App
export const pricingPlans = {
  recon: {
    id: 'free',
    name: 'The Recon Kit',
    identity: 'The Recruit',
    price: 0,
    interval: 'month',
    description: 'Essential financial tracking to get your bearings',
    features: [
      'Core dashboard (Net Worth, Cash Flow, Savings Rate)',
      'Complete budget calculator (50/30/20 + 6 Jars)',
      'Full transaction management',
      'Manual entry builds discipline',
      'Financial awareness foundation'
    ],
    limitations: [
      'Limited dashboard visibility',
      'No financial calculators',
      'No side hustle tracking',
      'No investment portfolio',
      'No travel budgeting'
    ],
    cta: 'Start Your Mission',
    popular: false
  },
  
  climber: {
    id: 'price_climber_monthly',
    name: 'The Climber Plan',
    identity: 'The Climber', 
    price: 7.99,
    interval: 'month',
    description: 'Climb towards complete financial clarity',
    features: [
      'Everything in The Recon Kit',
      'Full advanced dashboard access',
      'All financial calculators unlocked',
      'Financial freedom calculator',
      'Debt payoff strategies',
      'Emergency fund planning',
      'Complete financial visibility'
    ],
    cta: 'Begin Your Climb',
    popular: true,
    badge: 'Most Popular'
  },
  
  operator: {
    id: 'price_operator_monthly',
    name: 'The Operator Plan',
    identity: 'The Operator',
    price: 14.99,
    interval: 'month', 
    description: 'Operate at full financial capacity',
    features: [
      'Everything in The Climber Plan',
      'Complete side hustle management',
      'Professional investment portfolio',
      'DRIP tracking & optimization',
      'Multi-currency travel budgeting',
      'Business income/expense tracking',
      'Full financial ecosystem access'
    ],
    cta: 'Become an Operator',
    popular: false
  },
  
  founder: {
    id: 'price_founder_circle',
    name: 'The Founder\'s Circle',
    identity: 'The Founder',
    price: 7.49,
    originalPrice: 14.99,
    interval: 'month',
    description: 'Full Operator access at Climber price - LIFETIME LOCK',
    features: [
      'EVERYTHING in The Operator Plan',
      'Lifetime price guarantee ($7.49 forever)',
      'Exclusive founder badge & status',
      'Early access to new features',
      'Priority support',
      'Limited to first 100 members only'
    ],
    cta: 'Claim Your Spot',
    popular: false,
    special: true,
    badge: 'LIMITED TIME',
    maxSpots: 100,
    launchDate: '2025-01-15', // Set your actual launch date
    daysLimit: 7
  }
};

// Stripe Configuration
export const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  
  // You'll create these products in Stripe Dashboard
  products: {
    backpacker_monthly: 'price_backpacker_monthly',
    backpacker_yearly: 'price_backpacker_yearly',
    entrepreneur_monthly: 'price_entrepreneur_monthly', 
    entrepreneur_yearly: 'price_entrepreneur_yearly'
  }
};

// Feature access by plan - The Freedom Compass App
export const planLimits = {
  recon: {
    // Dashboard Access
    dashboardCards: ['netWorth', 'cashFlow', 'savingsRate'], // Limited cards
    fullDashboard: false,
    
    // Feature Access
    budgetCalculator: true,
    transactionManagement: true,
    financialCalculators: false,
    sideHustleManagement: false,
    investmentPortfolio: false,
    travelMode: false,
    
    // Limits
    maxTransactions: Infinity, // No transaction limits - manual entry is the value
    maxBusinesses: 0,
    maxInvestments: 0,
    maxTrips: 0,
    
    // Support
    support: 'community',
    exportData: false
  },
  
  climber: {
    // Dashboard Access  
    dashboardCards: 'all', // All dashboard cards
    fullDashboard: true,
    
    // Feature Access
    budgetCalculator: true,
    transactionManagement: true, 
    financialCalculators: true, // UNLOCKED
    sideHustleManagement: false,
    investmentPortfolio: false,
    travelMode: false,
    
    // Limits
    maxTransactions: Infinity,
    maxBusinesses: 0,
    maxInvestments: 0, 
    maxTrips: 0,
    
    // Support
    support: 'email',
    exportData: true
  },
  
  operator: {
    // Dashboard Access
    dashboardCards: 'all',
    fullDashboard: true,
    
    // Feature Access - EVERYTHING
    budgetCalculator: true,
    transactionManagement: true,
    financialCalculators: true,
    sideHustleManagement: true, // UNLOCKED
    investmentPortfolio: true,  // UNLOCKED
    travelMode: true,          // UNLOCKED
    
    // Limits
    maxTransactions: Infinity,
    maxBusinesses: Infinity,
    maxInvestments: Infinity,
    maxTrips: Infinity,
    
    // Support
    support: 'priority',
    exportData: true
  },
  
  founder: {
    // Same as operator but with special status
    dashboardCards: 'all',
    fullDashboard: true,
    
    // Feature Access - EVERYTHING
    budgetCalculator: true,
    transactionManagement: true,
    financialCalculators: true,
    sideHustleManagement: true,
    investmentPortfolio: true,
    travelMode: true,
    
    // Limits
    maxTransactions: Infinity,
    maxBusinesses: Infinity,
    maxInvestments: Infinity,
    maxTrips: Infinity,
    
    // Special Founder Benefits
    support: 'founder', // Special founder support
    exportData: true,
    earlyAccess: true,
    founderBadge: true,
    lifetimePriceLock: true
  }
};
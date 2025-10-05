// Pricing Plans for Survive Financial
export const pricingPlans = {
  free: {
    id: 'free',
    name: 'Survive Basic',
    price: 0,
    interval: 'month',
    description: 'Essential financial tracking for getting started',
    features: [
      'Basic dashboard with 5 cards',
      'Manual transaction logging',
      'Simple budget calculator',
      'Up to 2 investment holdings',
      'Basic expense tracking',
      'Monthly/annual view toggle'
    ],
    limitations: [
      'Limited to 50 transactions per month',
      'Basic travel features only',
      'No premium support',
      'No data export'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  
  backpacker: {
    id: 'price_backpacker_monthly', // Stripe Price ID (you'll get this from Stripe)
    name: 'Survive Backpacker',
    price: 29,
    interval: 'month',
    yearlyPrice: 290, // 2 months free
    description: 'Perfect for digital nomads and travelers',
    features: [
      'Everything in Survive Basic',
      'Multi-currency support with live rates',
      'Unlimited trip budgeting',
      'Travel runway calculator',
      'Investment portfolio tracking',
      'Business income/expense management',
      'Canadian tax optimization (TFSA/RRSP)',
      'Quick expense logging',
      'Data export (CSV)',
      'Priority email support'
    ],
    cta: 'Start Your Journey',
    popular: true,
    badge: 'Most Popular'
  },
  
  entrepreneur: {
    id: 'price_entrepreneur_monthly', // Stripe Price ID
    name: 'Survive Entrepreneur',
    price: 49,
    interval: 'month',
    yearlyPrice: 490, // 2 months free
    description: 'Advanced tools for serious wealth builders',
    features: [
      'Everything in Survive Backpacker',
      'Unlimited transactions and holdings',
      'Advanced investment analytics',
      'Multiple business tracking',
      'Custom financial goals',
      'Advanced budget planning (6 Jars)',
      'Financial freedom calculator',
      'Real-time sync across devices',
      'Premium support (24h response)',
      'Early access to new features'
    ],
    cta: 'Build Your Empire',
    popular: false
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

// Feature limits by plan
export const planLimits = {
  free: {
    maxTransactions: 50,
    maxInvestments: 2,
    maxBusinesses: 1,
    maxTrips: 1,
    exportData: false,
    prioritySupport: false
  },
  
  backpacker: {
    maxTransactions: 1000,
    maxInvestments: 50,
    maxBusinesses: 3,
    maxTrips: 10,
    exportData: true,
    prioritySupport: true
  },
  
  entrepreneur: {
    maxTransactions: Infinity,
    maxInvestments: Infinity,
    maxBusinesses: Infinity,
    maxTrips: Infinity,
    exportData: true,
    prioritySupport: true,
    premiumSupport: true
  }
};
// Feature Access Control for The Freedom Compass App
import { planLimits } from '../pricing';

// Get user's current plan (default to 'recon' for free users)
export const getUserPlan = (user) => {
  if (!user) return 'recon';
  return user.plan || 'recon';
};

// Check if user has access to a specific feature
export const hasFeatureAccess = (userPlan, feature) => {
  const limits = planLimits[userPlan] || planLimits.recon;
  return limits[feature] === true;
};

// Check if user has access to specific dashboard cards
export const hasDashboardCardAccess = (userPlan, cardType) => {
  const limits = planLimits[userPlan] || planLimits.recon;
  
  if (limits.dashboardCards === 'all') return true;
  if (Array.isArray(limits.dashboardCards)) {
    return limits.dashboardCards.includes(cardType);
  }
  return false;
};

// Get upgrade prompt message for locked features
export const getUpgradePrompt = (feature, currentPlan) => {
  const prompts = {
    financialCalculators: {
      title: "Unlock Financial Planning Tools",
      message: "Access powerful calculators to plan your financial future",
      requiredPlan: "climber",
      benefits: ["Financial Freedom Calculator", "Debt Payoff Strategies", "Emergency Fund Planning"]
    },
    sideHustleManagement: {
      title: "Track Your Business Empire", 
      message: "Manage multiple side hustles and track your entrepreneurial journey",
      requiredPlan: "operator",
      benefits: ["Unlimited Business Tracking", "Income/Expense Management", "Profit Analytics"]
    },
    investmentPortfolio: {
      title: "Professional Portfolio Management",
      message: "Manage your investments like a pro with advanced tracking",
      requiredPlan: "operator", 
      benefits: ["Holdings Tracking", "DRIP Management", "Performance Analytics"]
    },
    travelMode: {
      title: "Budget Your Adventures",
      message: "Plan and track travel expenses with multi-currency support",
      requiredPlan: "operator",
      benefits: ["Trip Planning", "Currency Conversion", "Travel Budget Tracking"]
    },
    fullDashboard: {
      title: "Complete Financial Visibility",
      message: "See your complete financial picture with all dashboard metrics",
      requiredPlan: "climber", 
      benefits: ["All Dashboard Cards", "Advanced Metrics", "Complete Overview"]
    }
  };
  
  return prompts[feature] || {
    title: "Upgrade Required",
    message: "This feature requires a higher plan",
    requiredPlan: "climber",
    benefits: ["Enhanced Features", "Better Analytics", "More Control"]
  };
};

// Check if Founder's Circle offer is still available
export const isFounderCircleAvailable = () => {
  const founderPlan = planLimits.founder;
  if (!founderPlan) return false;
  
  const launchDate = new Date(founderPlan.launchDate);
  const now = new Date();
  const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
  
  // Check if within 7-day window (you'll need to track spots claimed separately)
  return daysSinceLaunch >= 0 && daysSinceLaunch < founderPlan.daysLimit;
};

// Get remaining Founder's Circle spots (you'll need to implement backend tracking)
export const getFounderCircleSpots = async () => {
  // This would connect to your backend to get actual count
  // For now, return mock data
  const totalSpots = planLimits.founder?.maxSpots || 100;
  const claimedSpots = 23; // This would come from your database
  
  return {
    total: totalSpots,
    claimed: claimedSpots,
    remaining: totalSpots - claimedSpots
  };
};

// Get plan display info
export const getPlanDisplayInfo = (planKey) => {
  const planNames = {
    recon: { name: "The Recon Kit", identity: "The Recruit", color: "gray" },
    climber: { name: "The Climber Plan", identity: "The Climber", color: "blue" },
    operator: { name: "The Operator Plan", identity: "The Operator", color: "purple" },
    founder: { name: "The Founder's Circle", identity: "The Founder", color: "gold" }
  };
  
  return planNames[planKey] || planNames.recon;
};

export default {
  getUserPlan,
  hasFeatureAccess,
  hasDashboardCardAccess,
  getUpgradePrompt,
  isFounderCircleAvailable,
  getFounderCircleSpots,
  getPlanDisplayInfo
};
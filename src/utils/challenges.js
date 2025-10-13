// Daily and Weekly XP Challenges System
export const DAILY_CHALLENGES = [
  {
    id: 'daily_budget_check',
    title: 'Daily Budget Review',
    description: 'Check your budget and track expenses',
    xpReward: 50,
    type: 'daily',
    action: 'budget_review'
  },
  {
    id: 'daily_debt_track',
    title: 'Debt Progress Check',
    description: 'Review your debt payoff progress',
    xpReward: 75,
    type: 'daily',
    action: 'debt_review'
  },
  {
    id: 'daily_goal_update',
    title: 'Goal Progress Update',
    description: 'Update your financial goals progress',
    xpReward: 100,
    type: 'daily',
    action: 'goal_update'
  }
];

export const WEEKLY_CHALLENGES = [
  {
    id: 'weekly_expense_analysis',
    title: 'Weekly Expense Analysis',
    description: 'Analyze your spending patterns for the week',
    xpReward: 200,
    type: 'weekly',
    action: 'expense_analysis'
  },
  {
    id: 'weekly_savings_boost',
    title: 'Savings Boost',
    description: 'Increase your savings rate by 5% this week',
    xpReward: 300,
    type: 'weekly',
    action: 'savings_increase'
  },
  {
    id: 'weekly_debt_payment',
    title: 'Extra Debt Payment',
    description: 'Make an extra payment towards your debt',
    xpReward: 250,
    type: 'weekly',
    action: 'extra_debt_payment'
  }
];

// Check if user has completed a challenge today/this week
export function hasCompletedChallenge(userId, challengeId, type) {
  const key = `${type}_challenges_${userId}`;
  const completed = JSON.parse(localStorage.getItem(key) || '{}');
  const today = new Date().toDateString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekKey = weekStart.toDateString();
  
  if (type === 'daily') {
    return completed[challengeId] === today;
  } else if (type === 'weekly') {
    return completed[challengeId] === weekKey;
  }
  return false;
}

// Mark challenge as completed
export function markChallengeCompleted(userId, challengeId, type) {
  const key = `${type}_challenges_${userId}`;
  const completed = JSON.parse(localStorage.getItem(key) || '{}');
  const today = new Date().toDateString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekKey = weekStart.toDateString();
  
  if (type === 'daily') {
    completed[challengeId] = today;
  } else if (type === 'weekly') {
    completed[challengeId] = weekKey;
  }
  
  localStorage.setItem(key, JSON.stringify(completed));
}

// Get available challenges for user
export function getAvailableChallenges(userId) {
  const dailyChallenges = DAILY_CHALLENGES.filter(challenge => 
    !hasCompletedChallenge(userId, challenge.id, 'daily')
  );
  
  const weeklyChallenges = WEEKLY_CHALLENGES.filter(challenge => 
    !hasCompletedChallenge(userId, challenge.id, 'weekly')
  );
  
  return {
    daily: dailyChallenges,
    weekly: weeklyChallenges
  };
}

// Award XP for completing a challenge
export async function awardChallengeXp(db, userId, challenge) {
  if (hasCompletedChallenge(userId, challenge.id, challenge.type)) {
    return { success: false, message: 'Challenge already completed' };
  }
  
  markChallengeCompleted(userId, challenge.id, challenge.type);
  
  // Award XP (this would integrate with your existing XP system)
  // const result = await awardXp(db, userId, challenge.xpReward);
  
  return { 
    success: true, 
    xpReward: challenge.xpReward,
    challenge: challenge
  };
}



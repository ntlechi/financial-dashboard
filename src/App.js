import React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Building, LayoutDashboard, Calculator, Briefcase, Target, PiggyBank, Umbrella, ShieldCheck, Calendar, Plus, X, Edit, Trash2, CreditCard, BarChart3, PieChart, Repeat, Wallet, AlertTriangle, Crown, Save, HelpCircle, Award } from 'lucide-react';
import * as d3 from 'd3';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import SubscriptionManager from './SubscriptionManager';
import ErrorBoundary from './components/ErrorBoundary';
import FinancialErrorBoundary from './components/FinancialErrorBoundary';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpFAQ from './components/HelpFAQ';
import PricingModal from './components/PricingModal';
import UpgradePrompt from './components/UpgradePrompt';
import { hasFeatureAccess, hasDashboardCardAccess, getRequiredTier, isFoundersCircleAvailable, SUBSCRIPTION_TIERS } from './utils/subscriptionUtils';

// Firebase Imports
import { db, auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Firebase App ID available if needed
// const appId = process.env.REACT_APP_FIREBASE_APP_ID;

// Retirement accounts are now fully user-editable - no need for country configs!

// 🤖 Smart Expense Categorization System
const expenseCategorizationRules = {
  housing: [
    'rent', 'mortgage', 'property tax', 'home insurance', 'hoa', 'utilities', 'electricity', 'gas bill', 
    'water bill', 'internet', 'cable', 'phone bill', 'maintenance', 'repairs', 'cleaning'
  ],
  food: [
    'grocery', 'groceries', 'supermarket', 'restaurant', 'takeout', 'delivery', 'coffee', 'lunch', 
    'dinner', 'breakfast', 'food', 'dining', 'uber eats', 'doordash', 'grubhub', 'starbucks'
  ],
  transport: [
    'gas', 'fuel', 'car payment', 'auto loan', 'car insurance', 'parking', 'tolls', 'uber', 'lyft', 
    'taxi', 'bus', 'train', 'subway', 'metro', 'car wash', 'oil change', 'car repair', 'mechanic'
  ],
  entertainment: [
    'netflix', 'spotify', 'amazon prime', 'disney+', 'hulu', 'movie', 'cinema', 'theater', 'concert', 
    'game', 'gaming', 'subscription', 'streaming', 'music', 'books', 'hobbies', 'gym', 'fitness'
  ],
  healthcare: [
    'doctor', 'dentist', 'pharmacy', 'medicine', 'prescription', 'hospital', 'medical', 'health insurance', 
    'copay', 'deductible', 'therapy', 'massage', 'chiropractor', 'optometrist', 'glasses', 'contacts'
  ],
  shopping: [
    'amazon', 'target', 'walmart', 'costco', 'clothing', 'shoes', 'electronics', 'furniture', 
    'home depot', 'lowes', 'best buy', 'apple store', 'shopping', 'retail'
  ],
  business: [
    'office supplies', 'software', 'saas', 'hosting', 'domain', 'marketing', 'advertising', 'business lunch', 
    'conference', 'training', 'professional development', 'legal', 'accounting', 'consulting'
  ]
};

// 🎯 Auto-categorize expense based on description
const categorizeExpense = (description) => {
  const desc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(expenseCategorizationRules)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return {
        category: 'personal', // Default to personal, can be changed manually
        subcategory: category
      };
    }
  }
  
  // Default categorization
  return {
    category: 'personal',
    subcategory: 'other'
  };
};

// 📅 Recurring Expense Utilities
const calculateNextDueDate = (frequency, dayOfMonth, dayOfWeek, monthOfYear, lastProcessed) => {
  const lastDate = new Date(lastProcessed);
  let nextDate = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(lastDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(lastDate.getMonth() + 1);
      nextDate.setDate(dayOfMonth);
      break;
    case 'yearly':
      nextDate.setFullYear(lastDate.getFullYear() + 1);
      nextDate.setMonth(monthOfYear - 1); // monthOfYear is 1-12, setMonth expects 0-11
      nextDate.setDate(dayOfMonth);
      break;
    default:
      nextDate.setMonth(lastDate.getMonth() + 1);
  }
  
  return nextDate.toISOString().split('T')[0];
};

// 🔄 Process Due Recurring Expenses
const processDueRecurringExpenses = (recurringExpenses, existingTransactions) => {
  const today = new Date();
  const newTransactions = [];
  const updatedRecurringExpenses = [];
  
  recurringExpenses.forEach(recurring => {
    if (!recurring.isActive) {
      updatedRecurringExpenses.push(recurring);
      return;
    }
    
    const dueDate = new Date(recurring.nextDueDate);
    
    // Check if the recurring expense is due (due date is today or in the past)
    if (dueDate <= today) {
      // Create new transaction
      const transaction = {
        id: Date.now() + Math.random(), // Ensure unique ID
        date: recurring.nextDueDate,
        description: recurring.description,
        amount: recurring.type === 'expense' ? -Math.abs(recurring.amount) : Math.abs(recurring.amount),
        type: recurring.type,
        category: recurring.category,
        subcategory: recurring.subcategory,
        isRecurring: true,
        recurringId: recurring.id,
        tags: recurring.tags || []
      };
      
      newTransactions.push(transaction);
      
      // Update recurring expense with new next due date
      const updatedRecurring = {
        ...recurring,
        lastProcessed: recurring.nextDueDate,
        nextDueDate: calculateNextDueDate(
          recurring.frequency,
          recurring.dayOfMonth,
          recurring.dayOfWeek,
          recurring.monthOfYear,
          recurring.nextDueDate
        )
      };
      
      updatedRecurringExpenses.push(updatedRecurring);
    } else {
      updatedRecurringExpenses.push(recurring);
    }
  });
  
  return {
    newTransactions,
    updatedRecurringExpenses
  };
};

// 🎯 REALISTIC BEGINNER SAMPLE DATA
// Designed for someone just starting their financial journey
const initialData = {
  financialFreedom: {
    targetAmount: 500000,  // More realistic first goal
    currentInvestments: 0,  // Just starting out
    monthlyContribution: 0,  // Not investing yet
    annualReturn: 7,
  },
  creditScore: {
    current: 650,  // Average starting credit score
    history: [ { date: '2025-06-30', score: 630 }, { date: '2025-08-09', score: 650 } ]
  },
  cashOnHand: {
    total: 2500,  // Small but realistic emergency fund
    accounts: [
        { id: 1, name: 'Checking Account', balance: 1200, type: 'Checking' },
        { id: 2, name: 'Savings Account', balance: 1300, type: 'Savings' },
    ],
    history: [ { date: '2025-08-09', total: 2500 } ]
  },
  rainyDayFund: {
    total: 1300,  // Building emergency fund (goal: 3-6 months expenses)
    goal: 6000,  // 3 months of $2,000 expenses
    accounts: [
        { id: 1, name: 'Emergency Savings', balance: 1300 }
    ],
    history: [ { date: '2025-08-09', total: 1300 } ]
  },
  debt: {
    total: 2800,  // Small credit card debt
    accounts: [
        { id: 1, name: 'Credit Card', balance: 2800, interestRate: 19.99, minPayment: 75 },
    ],
    history: [
        { date: '2025-06-30', total: 3200 },
        { date: '2025-07-31', total: 3000 },
        { date: '2025-08-09', total: 2800 },
    ]
  },
  netWorth: { 
    total: 4700,  // Small positive net worth ($2,500 cash + $5,000 car - $2,800 debt)
    breakdown: [
      { id: 1, name: 'Cash & Savings', value: 2500, color: 'bg-sky-500', type: 'asset' },
      { id: 2, name: 'Vehicle', value: 5000, color: 'bg-emerald-500', type: 'asset' },
      { id: 3, name: 'Credit Card Debt', value: -2800, color: 'bg-red-500', type: 'liability' },
    ],
    history: [ { date: '2025-08-09', total: 4700 } ]
  },
  income: { 
    total: 3000,  // Entry-level job income
    sources: [
      { id: 1, name: 'Full-Time Job', amount: 3000, type: 'active' },
    ]
  },
  expenses: { 
    total: 2000,  // Realistic monthly expenses
    categories: [
      { id: 1, name: 'Rent', amount: 900, color: 'bg-red-500' },
      { id: 2, name: 'Transportation', amount: 300, color: 'bg-yellow-500' },
      { id: 3, name: 'Groceries', amount: 400, color: 'bg-green-500' },
      { id: 4, name: 'Utilities & Phone', amount: 200, color: 'bg-blue-500' },
      { id: 5, name: 'Entertainment', amount: 150, color: 'bg-purple-500' },
      { id: 6, name: 'Other', amount: 50, color: 'bg-gray-400' },
    ]
  },
  cashflow: { total: 1000 },  // $1k/month savings
  savingsRate: { 
    current: 33,  // 33% savings rate (very achievable!)
    target: 40,
    monthly: 1000,
    monthlyIncome: 3000
  },
  goals: [
    { id: 1, name: 'Emergency Fund (3 months)', targetAmount: 6000, currentAmount: 1300, targetDate: '2026-06-30' },
    { id: 2, name: 'Pay Off Credit Card', targetAmount: 2800, currentAmount: 400, targetDate: '2025-12-31' },
    { id: 3, name: 'Vacation Fund', targetAmount: 1500, currentAmount: 200, targetDate: '2026-03-15' },
  ],
  // 🔧 FIX: No businesses in sample data (Side Hustle is Operator-only feature)
  // FREE tier users shouldn't have phantom businesses affecting their calculations
  businesses: [],
  investments: {
    totalValue: 0,  // Just starting out - no investments yet
    portfolioAllocation: [],  // Will build portfolio over time
    holdings: []  // Empty - beginners start with 0 investments
  },
  registeredAccounts: {
    accounts: [
      {
        id: 'tfsa',
        name: 'TFSA',
        contributed: 0,  // Just starting out
        limit: 88000,
        goal: 10000,  // Realistic first goal
        type: 'tax-free',
        description: 'Tax-free growth and withdrawals'
      },
      {
        id: 'rrsp', 
        name: 'RRSP',
        contributed: 0,  // Just starting out
        limit: 31560,
        goal: 5000,  // Realistic first goal
        type: 'tax-deferred',
        description: 'Tax-deferred retirement savings'
      }
    ]
  },
  transactions: [
    { id: 1, date: '2025-01-15', description: 'Salary - Full Time Job', amount: 3000, type: 'income', category: 'personal', subcategory: 'salary' },
    { id: 2, date: '2025-01-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'personal', subcategory: 'housing' },
    { id: 3, date: '2025-01-12', description: 'Groceries', amount: -120, type: 'expense', category: 'personal', subcategory: 'food' },
    { id: 4, date: '2025-01-10', description: 'Gas', amount: -50, type: 'expense', category: 'personal', subcategory: 'transport' },
    { id: 5, date: '2025-01-08', description: 'Credit Card Payment', amount: -200, type: 'expense', category: 'personal', subcategory: 'debt' },
    { id: 6, date: '2025-01-05', description: 'Netflix', amount: -15, type: 'expense', category: 'personal', subcategory: 'entertainment' },
    { id: 7, date: '2025-01-03', description: 'Coffee', amount: -12, type: 'expense', category: 'personal', subcategory: 'entertainment' },
  ],
  recurringExpenses: [
    {
      id: 1,
      description: 'Rent Payment',
      amount: 900,  // Updated to match realistic beginner rent
      type: 'expense',
      category: 'personal',
      subcategory: 'housing',
      frequency: 'monthly',
      dayOfMonth: 1,
      dayOfWeek: null,
      monthOfYear: null,
      isActive: true,
      nextDueDate: '2025-02-01',
      lastProcessed: '2025-01-01',
      createdDate: '2024-12-01',
      tags: ['essential', 'housing']
    },
    {
      id: 2,
      description: 'Netflix',
      amount: 15,
      type: 'expense',
      category: 'personal',
      subcategory: 'entertainment',
      frequency: 'monthly',
      dayOfMonth: 5,
      dayOfWeek: null,
      monthOfYear: null,
      isActive: true,
      nextDueDate: '2025-02-05',
      lastProcessed: '2025-01-05',
      createdDate: '2024-11-05',
      tags: ['subscription', 'entertainment']
    },
    {
      id: 3,
      description: 'Car Insurance',
      amount: 150,
      type: 'expense',
      category: 'personal',
      subcategory: 'transport',
      frequency: 'monthly',
      dayOfMonth: 15,
      dayOfWeek: null,
      monthOfYear: null,
      isActive: true,
      nextDueDate: '2025-02-15',
      lastProcessed: '2025-01-15',
      createdDate: '2024-10-15',
      tags: ['insurance', 'essential']
    }
  ],
  // 🔧 FIX: Monthly history updated to match realistic beginner sample data
  monthlyHistory: [
    { 
      month: '2025-01', 
      netWorth: 4700,      // Realistic beginner: cash + car - debt
      income: 3000,        // Entry-level job
      expenses: 2000,      // Manageable expenses
      cashflow: 1000,      // $1k/month savings
      businessIncome: 0,   // No business yet
      businessExpenses: 0,
      investmentValue: 0,  // Learning phase
      savingsRate: 33      // Achievable 33%
    },
    { 
      month: '2024-12', 
      netWorth: 4500, 
      income: 3000, 
      expenses: 2100, 
      cashflow: 900, 
      businessIncome: 0, 
      businessExpenses: 0,
      investmentValue: 0,
      savingsRate: 30
    },
    { 
      month: '2024-11', 
      netWorth: 4200, 
      income: 3000, 
      expenses: 2050, 
      cashflow: 950, 
      businessIncome: 0, 
      businessExpenses: 0,
      investmentValue: 0,
      savingsRate: 32
    },
    { 
      month: '2024-10', 
      netWorth: 4000, 
      income: 2900,        // Slight variation (realistic)
      expenses: 2150, 
      cashflow: 750, 
      businessIncome: 0, 
      businessExpenses: 0,
      investmentValue: 0,
      savingsRate: 26
    },
    { 
      month: '2024-09', 
      netWorth: 3800, 
      income: 3000, 
      expenses: 2100, 
      cashflow: 900, 
      businessIncome: 0, 
      businessExpenses: 0,
      investmentValue: 0,
      savingsRate: 30
    },
    { 
      month: '2024-08', 
      netWorth: 3500, 
      income: 2800,        // First job - lower starting salary
      expenses: 2000, 
      cashflow: 800, 
      businessIncome: 0, 
      businessExpenses: 0,
      investmentValue: 0,
      savingsRate: 29
    }
  ],
  // 🔧 FIX: No travel trips in sample data (Travel Mode is Operator-only feature)
  // FREE tier users shouldn't have phantom travel data, consistent with businesses fix
  travel: {
    totalSavings: 0,  // Just starting out - building travel fund
    homeCurrency: 'CAD',
    exchangeRates: {
      'USD': 0.70,        // 1 CAD = 0.70 USD (realistic rate)
      'EUR': 0.65,        // 1 CAD = 0.65 EUR  
      'THB': 24.5,        // 1 CAD = 24.5 Thai Baht
      'COP': 3100,        // 1 CAD = 3,100 Colombian Pesos
      'PEN': 2.65,        // 1 CAD = 2.65 Peruvian Soles
      'VND': 17800,       // 1 CAD = 17,800 Vietnamese Dong
      'MXN': 14.2         // 1 CAD = 14.2 Mexican Pesos
    },
    trips: [],  // Empty - Operator users can add their own trips
    runwayCalculation: {
      averageDailySpend: 0,
      totalAvailableFunds: 0,
      estimatedDaysRemaining: 0,
      lastUpdated: "2025-01-15"
    },
    expenseCategories: [
      { name: "accommodation", color: "bg-blue-500", icon: "🏨" },
      { name: "food", color: "bg-green-500", icon: "🍽️" },
      { name: "transport", color: "bg-yellow-500", icon: "🚌" },
      { name: "activities", color: "bg-purple-500", icon: "🎯" },
      { name: "shopping", color: "bg-pink-500", icon: "🛍️" },
      { name: "insurance", color: "bg-red-500", icon: "🛡️" },
      { name: "visa", color: "bg-orange-500", icon: "📋" },
      { name: "other", color: "bg-gray-500", icon: "💫" }
    ]
  },
  budgetSettings: {
    fiftyThirtyTwenty: {
      needs: 50,
      wants: 30,
      savings: 20
    },
    sixJars: {
      necessities: 55,
      education: 10,
      play: 10,
      longTermSavings: 10,
      financial: 10,
      give: 5
    }
  }
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

// 🔒 Locked Card Component - Shows upgrade prompt for locked dashboard cards
const LockedCard = ({ cardName, requiredTier, onUpgrade }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-amber-500/30 rounded-2xl shadow-lg p-6 relative overflow-hidden col-span-1 md:col-span-2 lg:col-span-2">
    {/* Blur overlay */}
    <div className="absolute inset-0 backdrop-blur-sm bg-gray-900/80 flex items-center justify-center z-10">
      <div className="text-center p-6">
        <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-2">{cardName}</h3>
        <p className="text-gray-400 text-sm mb-4">
          Upgrade to <span className="text-amber-400 font-semibold">{requiredTier === 'climber' ? 'Climber Plan' : 'Operator Plan'}</span> to unlock
        </p>
        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg"
        >
          View Plans
        </button>
      </div>
    </div>
    
    {/* Blurred preview content */}
    <div className="opacity-10 pointer-events-none">
      <h3 className="text-xl font-bold text-white mb-4">{cardName}</h3>
      <div className="h-24 bg-gray-700 rounded mb-4"></div>
      <div className="h-16 bg-gray-700 rounded"></div>
    </div>
  </div>
);

// Tooltip component for financial education
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help flex items-center gap-1"
      >
        {children}
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-400" />
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-gray-600 z-50">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const ProgressBar = ({ value, maxValue, color, height = 'h-2.5' }) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className={`w-full bg-gray-700 rounded-full ${height}`}>
      <div className={`${color} ${height} rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

// Financial Freedom Goal Card (VIOLET - Aspirational)
const FinancialFreedomCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.targetAmount) {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-violet-900/40 to-purple-900/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Target className="w-6 h-6 mr-3 text-violet-400" />
            Financial Freedom Goal
          </h2>
        </div>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const progressPercentage = (data.currentInvestments / data.targetAmount) * 100;
  const monthsToGoal = data.monthlyContribution > 0 
    ? Math.ceil((data.targetAmount - data.currentInvestments) / data.monthlyContribution) 
    : 0;
  const yearsToGoal = Math.floor(monthsToGoal / 12);
  const remainingMonths = monthsToGoal % 12;

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-violet-900/40 to-purple-900/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Target className="w-6 h-6 mr-3 text-violet-400" />
          Financial Freedom Goal
        </h2>
        <button
          onClick={() => onEdit('financialFreedom', data)}
          className="text-gray-400 hover:text-violet-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <span className="text-violet-400 font-semibold">{progressPercentage.toFixed(1)}%</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Current: ${data.currentInvestments.toLocaleString()}</span>
            <span>Target: ${data.targetAmount.toLocaleString()}</span>
          </div>
          <ProgressBar 
            value={data.currentInvestments} 
            maxValue={data.targetAmount} 
            color="bg-violet-500"
            height="h-3"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-violet-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">${data.monthlyContribution.toLocaleString()}</div>
            <div className="text-xs text-violet-400">Monthly Contribution</div>
          </div>
          <div className="bg-violet-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {yearsToGoal}y {remainingMonths}m
            </div>
            <div className="text-xs text-violet-400">Time to Goal</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Savings Rate Card (AMBER - Progress/KPI)
const SavingsRateCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.current === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <PiggyBank className="w-6 h-6 mr-3 text-blue-400" />
            Savings Rate
          </h2>
        </div>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const getRateColor = (rate) => {
    if (rate >= 50) return 'text-emerald-400';
    if (rate >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRateStatus = (rate) => {
    if (rate >= 50) return 'Excellent';
    if (rate >= 30) return 'Good';
    if (rate >= 20) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <PiggyBank className="w-6 h-6 mr-3 text-amber-400" />
          <Tooltip text="Savings Rate is the percentage of your income that you save/invest each month. A rate of 20%+ is good, 30%+ is excellent for building wealth.">
            Savings Rate
          </Tooltip>
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-700/50 rounded">
            Auto-calculated
          </div>
          <button
            onClick={() => onEdit('savingsRateTarget', data)}
            className="text-gray-400 hover:text-amber-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
            title="Edit target savings rate"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-extrabold ${getRateColor(data.current)}`}>
            {data.current}%
          </div>
          <div className="text-gray-400 text-sm">{getRateStatus(data.current)}</div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Current: {data.current}%</span>
            <span>Target: {data.target}%</span>
          </div>
          <ProgressBar 
            value={data.current} 
            maxValue={data.target} 
            color="bg-blue-500"
          />
        </div>
        
        <div className="text-center text-sm text-gray-300">
          Saving ${data.monthly.toLocaleString()} of ${data.monthlyIncome.toLocaleString()} monthly income
        </div>
      </div>
    </Card>
  );
};

// Rainy Day Fund Card
const RainyDayFundCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Umbrella className="w-6 h-6 mr-3 text-amber-400" />
          Rainy Day Fund
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const progressPercentage = (data.total / data.goal) * 100;
  const monthsOfExpenses = data.total / 6500; // Assuming monthly expenses
  
  const getFundStatus = (months) => {
    if (months >= 6) return { status: 'Excellent', color: 'text-emerald-400' };
    if (months >= 3) return { status: 'Good', color: 'text-yellow-400' };
    return { status: 'Build More', color: 'text-red-400' };
  };

  const { status, color } = getFundStatus(monthsOfExpenses);

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Umbrella className="w-6 h-6 mr-3 text-amber-400" />
          Rainy Day Fund
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-semibold">{progressPercentage.toFixed(1)}%</span>
          <button
            onClick={() => onEdit('rainyDayFund', data)}
            className="text-gray-400 hover:text-amber-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-white mb-1">
            ${data.total.toLocaleString()}
          </div>
          <div className={`text-sm font-semibold ${color}`}>
            {monthsOfExpenses.toFixed(1)} months • {status}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Current: ${data.total.toLocaleString()}</span>
            <span>Goal: ${data.goal.toLocaleString()}</span>
          </div>
          <ProgressBar 
            value={data.total} 
            maxValue={data.goal} 
            color="bg-purple-500"
            height="h-3"
          />
        </div>
        
        <div className="bg-purple-900/30 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-300">
            Target: 6 months of expenses (${(6500 * 6).toLocaleString()})
          </div>
        </div>
      </div>
    </Card>
  );
};

// Credit Score Card with History Chart
const CreditScoreCard = ({ data, onEdit }) => {
  const svgRef = useRef();

  const getScoreColor = (score) => {
    if (score >= 800) return 'text-emerald-400';
    if (score >= 740) return 'text-green-400';
    if (score >= 670) return 'text-yellow-400';
    if (score >= 580) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  // Score progress calculation available if needed
  // const getScoreProgress = (score) => (score / 850) * 100;

  // Create line chart for credit score history
  // 🛡️ MOVED BEFORE NULL CHECK - Hooks must be called unconditionally
  useEffect(() => {
    if (!data || !data.history || data.history.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 25, left: 35 };
    const width = 280 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data with current score
    const historyData = [...data.history, { date: new Date().toISOString().split('T')[0], score: data.current }];
    const sortedData = historyData
      .map(d => ({ ...d, date: new Date(d.date) }))
      .sort((a, b) => a.date - b.date);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(sortedData, d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([300, 850]) // Credit score range
      .range([height, 0]);

    // Create gradient for line
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "creditScoreGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "40%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "#eab308")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "85%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 1);

    // Create line
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Add background score ranges
    const scoreRanges = [
      { min: 300, max: 580, color: '#ef4444', opacity: 0.1 },
      { min: 580, max: 670, color: '#f59e0b', opacity: 0.1 },
      { min: 670, max: 740, color: '#eab308', opacity: 0.1 },
      { min: 740, max: 800, color: '#22c55e', opacity: 0.1 },
      { min: 800, max: 850, color: '#10b981', opacity: 0.1 }
    ];

    scoreRanges.forEach(range => {
      g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(range.max))
        .attr("width", width)
        .attr("height", yScale(range.min) - yScale(range.max))
        .attr("fill", range.color)
        .attr("opacity", range.opacity);
    });

    // Add line path
    g.append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", "url(#creditScoreGradient)")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add dots for data points
    g.selectAll(".dot")
      .data(sortedData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.score))
      .attr("r", 4)
      .attr("fill", d => {
        if (d.score >= 800) return '#10b981';
        if (d.score >= 740) return '#22c55e';
        if (d.score >= 670) return '#eab308';
        if (d.score >= 580) return '#f59e0b';
        return '#ef4444';
      })
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 2);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(3)
      .tickFormat(d3.timeFormat("%b %y"));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "10px");

    // Add y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(4)
      .tickFormat(d => d);

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "10px");

    // Style axis lines
    g.selectAll(".domain, .tick line")
      .style("stroke", "#4b5563")
      .style("stroke-width", 1);

  }, [data.history, data.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🛡️ NULL SAFETY CHECK - After hooks, before render - Fixed: only check 'current'
  if (!data || typeof data.current === 'undefined') {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <ShieldCheck className="w-6 h-6 mr-3 text-indigo-400" />
          Credit Score
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  // Calculate score change
  const getScoreChange = () => {
    if (!data.history || data.history.length === 0) return null;
    const sortedHistory = [...data.history].sort((a, b) => new Date(b.date) - new Date(a.date));
    const previousScore = sortedHistory[0]?.score;
    const change = data.current - previousScore;
    return change;
  };

  const scoreChange = getScoreChange();

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-blue-900/40">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShieldCheck className="w-6 h-6 mr-3 text-indigo-400" />
          Credit Score
        </h2>
        <button
          onClick={() => onEdit('creditScore', data)}
          className="text-gray-400 hover:text-indigo-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-extrabold ${getScoreColor(data.current)}`}>
            {data.current}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-gray-400 text-sm">{getScoreStatus(data.current)}</div>
            {scoreChange !== null && (
              <div className={`text-xs font-semibold flex items-center ${
                scoreChange > 0 ? 'text-green-400' : scoreChange < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {scoreChange > 0 ? '↗' : scoreChange < 0 ? '↘' : '→'} {Math.abs(scoreChange)}
              </div>
            )}
          </div>
        </div>
        
        {/* Credit Score History Chart */}
        {data.history && data.history.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-sm text-gray-300 mb-2 font-semibold">📈 Score History</div>
            <svg ref={svgRef}></svg>
          </div>
        )}
        
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Score: {data.current}</span>
            <span>Max: 850</span>
          </div>
          <ProgressBar 
            value={data.current} 
            maxValue={850} 
            color={data.current >= 740 ? 'bg-green-500' : data.current >= 670 ? 'bg-yellow-500' : 'bg-red-500'}
          />
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-xs text-center">
          <div className="text-red-400">Poor<br/>300-579</div>
          <div className="text-orange-400">Fair<br/>580-669</div>
          <div className="text-yellow-400">Good<br/>670-739</div>
          <div className="text-green-400">V.Good<br/>740-799</div>
          <div className="text-emerald-400">Exceptional<br/>800-850</div>
        </div>
      </div>
    </Card>
  );
};

// Goals Card
const GoalsCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="col-span-1 md:col-span-6 lg:col-span-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-amber-400" />
          Financial Goals
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-amber-400" />
          Financial Goals
        </h2>
        <button
          onClick={() => onEdit('goals', data)}
          className="text-gray-400 hover:text-amber-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(goal => {
          const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <div key={goal.id} className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white">{goal.name}</h3>
                <span className="text-amber-400 text-sm font-semibold">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>${goal.currentAmount.toLocaleString()}</span>
                    <span>${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <ProgressBar 
                    value={goal.currentAmount} 
                    maxValue={goal.targetAmount} 
                    color="bg-amber-500"
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    ${remaining.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">remaining</div>
                </div>
                
                <div className="text-center text-xs text-gray-400">
                  Target: {new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// 🎯 COMMAND CENTER: Net Worth Card with Donut Chart
const NetWorthCard = ({ data, onEdit }) => {
  const netWorthChartRef = useRef(null);
  
  // Calculate totals for donut chart (before any returns)
  const totalAssets = data?.breakdown?.filter(item => item.type === 'asset').reduce((sum, item) => sum + item.value, 0) || 0;
  const totalLiabilities = Math.abs(data?.breakdown?.filter(item => item.type === 'liability').reduce((sum, item) => sum + item.value, 0) || 0);

  // 📊 D3.js Donut Chart Effect (MUST be before any returns)
  useEffect(() => {
    if (netWorthChartRef.current && data && (totalAssets > 0 || totalLiabilities > 0)) {
      const svg = d3.select(netWorthChartRef.current);
      svg.selectAll("*").remove();
      
      const isMobile = window.innerWidth <= 768;
      const width = isMobile ? 200 : 220;
      const height = isMobile ? 200 : 220;
      const radius = Math.min(width, height) / 2;
      
      const chartData = [
        { label: 'Assets', value: totalAssets, color: '#84CC16' },
        { label: 'Liabilities', value: totalLiabilities, color: '#F43F5E' }
      ].filter(d => d.value > 0);
      
      const pie = d3.pie().value(d => d.value).sort(null);
      const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
      
      const g = svg.attr("width", width).attr("height", height)
        .append("g").attr("transform", `translate(${width/2},${height/2})`);
      
      const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
      
      g.selectAll(".arc").data(pie(chartData)).enter().append("g").attr("class", "arc")
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.data.label}</strong><br/>$${d.data.value.toLocaleString()}`);
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          tooltip.style("visibility", "hidden");
        });
      
      return () => { tooltip.remove(); };
    }
  }, [totalAssets, totalLiabilities]);

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-sky-900/40 to-blue-900/40">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-bold text-white flex items-center">
        <DollarSign className="w-6 h-6 mr-3 text-sky-400" />
        Net Worth
      </h2>
      <button
        onClick={() => onEdit('netWorth', data)}
        className="text-gray-400 hover:text-sky-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center">
      <svg ref={netWorthChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#84CC16'}}></div>
          <span className="text-sm text-gray-300">Assets: ${totalAssets.toLocaleString()}</span>
        </div>
        {totalLiabilities > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#F43F5E'}}></div>
            <span className="text-sm text-gray-300">Liabilities: ${totalLiabilities.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
  );
};

// Editable Retirement Accounts Card
const RegisteredAccountsCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.accounts) {
    return (
      <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <PiggyBank className="w-6 h-6 mr-3 text-blue-400" />
          Retirement Accounts
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const accounts = data?.accounts || [];
  
  // Calculate totals
  const totalContributed = accounts.reduce((sum, account) => sum + account.contributed, 0);
  const totalLimit = accounts.reduce((sum, account) => sum + account.limit, 0);
  const totalRoom = totalLimit - totalContributed;

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-sky-900/40 to-blue-900/40 border-sky-600/30">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShieldCheck className="w-6 h-6 mr-3 text-sky-400" />
          Retirement Accounts
        </h2>
        <button
          onClick={() => onEdit('registeredAccounts', data)}
          className="text-gray-400 hover:text-sky-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className={`grid grid-cols-1 ${accounts.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {accounts.map((account, index) => {
          const progress = (account.contributed / account.limit) * 100;
          const roomUsed = account.contributed;
          const roomAvailable = account.limit - account.contributed;
          
          // Color themes for different account types
          const colors = [
            { bg: 'bg-green-900/20', border: 'border-green-600/30', text: 'text-green-400', progress: 'bg-green-500' },
            { bg: 'bg-blue-900/20', border: 'border-blue-600/30', text: 'text-blue-400', progress: 'bg-blue-500' },
            { bg: 'bg-orange-900/20', border: 'border-orange-600/30', text: 'text-orange-400', progress: 'bg-orange-500' },
            { bg: 'bg-teal-900/20', border: 'border-teal-600/30', text: 'text-teal-400', progress: 'bg-teal-500' }
          ];
          const color = colors[index % colors.length];
          
          return (
            <div key={account.id} className={`${color.bg} rounded-lg p-4 border ${color.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-lg font-bold ${color.text}`}>{account.name}</h4>
                <span className={`${color.text.replace('400', '300')} text-sm font-semibold`}>
                  {progress.toFixed(1)}% Used
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    ${account.contributed.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Contributed</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Used: ${roomUsed.toLocaleString()}</span>
                    <span>Limit: ${account.limit.toLocaleString()}</span>
                  </div>
                  <ProgressBar 
                    value={roomUsed} 
                    maxValue={account.limit} 
                    color={color.progress}
                  />
                  <div className={`text-xs ${color.text} mt-1`}>
                    Room: ${roomAvailable.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded p-2 text-xs text-center">
                  <div className="text-gray-300">{account.type}</div>
                  <div className={`${color.text} font-semibold text-[10px] mt-1`}>
                    {account.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {accounts.length > 0 && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-400">
            Total Contributed: ${totalContributed.toLocaleString()} • 
            Total Room: ${totalRoom.toLocaleString()} ({((totalContributed/totalLimit)*100).toFixed(1)}% used)
          </div>
        </div>
      )}
      
      {accounts.length === 0 && (
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-400">No retirement accounts configured</p>
          <p className="text-sm text-gray-500 mt-1">Click edit to add your retirement accounts</p>
        </div>
      )}
    </Card>
  );
};

// Debt Management Card
const DebtCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.accounts) {
    return (
      <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-rose-900/40 to-pink-900/40">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <CreditCard className="w-6 h-6 mr-3 text-rose-400" />
          Total Debt
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const totalDebt = data.accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalMinPayment = data.accounts?.reduce((sum, account) => sum + account.minPayment, 0) || 0;
  const avgInterestRate = data.accounts?.length > 0 ? 
    data.accounts.reduce((sum, account) => sum + account.interestRate, 0) / data.accounts.length : 0;

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-rose-900/40 to-pink-900/40 relative">
      <button
        onClick={() => onEdit('debt', data)}
        className="absolute top-4 right-4 p-2 bg-rose-700/20 hover:bg-rose-600/30 rounded-lg transition-colors"
        title="Edit Debt"
      >
        <Edit className="w-4 h-4 text-rose-300" />
      </button>

      <h2 className="text-xl font-bold text-white mb-2 flex items-center">
        <CreditCard className="w-6 h-6 mr-3 text-rose-400" />
        Total Debt
      </h2>
      <p className="text-5xl font-extrabold text-white">${totalDebt.toLocaleString()}</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-800/20 rounded-lg p-3">
          <p className="text-rose-300 text-sm">Min. Payment</p>
          <p className="text-white font-bold">${totalMinPayment.toLocaleString()}/mo</p>
        </div>
        <div className="bg-orange-800/20 rounded-lg p-3">
          <p className="text-orange-300 text-sm">Avg. Interest</p>
          <p className="text-white font-bold">{avgInterestRate.toFixed(1)}%</p>
        </div>
        <div className="bg-yellow-800/20 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">Accounts</p>
          <p className="text-white font-bold">{data.accounts?.length || 0}</p>
        </div>
      </div>

      {data.accounts && data.accounts.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.accounts.slice(0, 3).map((account) => (
            <div key={account.id} className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg p-2">
              <div>
                <span className="text-white font-medium">{account.name}</span>
                <div className="text-gray-400 text-xs">
                  {account.interestRate}% APR • Min: ${account.minPayment}
                </div>
              </div>
              <span className="text-red-400 font-semibold">${account.balance.toLocaleString()}</span>
            </div>
          ))}
          {data.accounts.length > 3 && (
            <p className="text-gray-400 text-xs text-center">
              +{data.accounts.length - 3} more accounts
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

// Cash on Hand Card
const CashOnHandCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK - Fixed: checking for 'total' not 'amount'
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-600/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Wallet className="w-6 h-6 mr-3 text-teal-400" />
          Cash on Hand
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-600/30">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-bold text-white flex items-center">
        <Wallet className="w-6 h-6 mr-3 text-teal-400" />
        Cash on Hand
      </h2>
      <button
        onClick={() => onEdit('cashOnHand', data)}
        className="text-gray-400 hover:text-teal-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <div className="text-3xl font-bold text-teal-400 mb-4">
      ${data.total.toLocaleString()}
    </div>
    <div className="space-y-2 mb-4">
      {data.accounts.map(account => (
        <div key={account.id} className="flex justify-between items-center text-sm">
          <div>
            <span className="text-white font-medium">{account.name}</span>
            <span className="text-gray-400 ml-2">({account.type})</span>
          </div>
          <span className="text-teal-300">${account.balance.toLocaleString()}</span>
        </div>
      ))}
    </div>
    <div className="text-xs text-gray-400">
      {data.accounts.length} accounts • Last updated {new Date().toLocaleDateString()}
    </div>
  </Card>
  );
};

// 🎯 COMMAND CENTER: Income Card with Donut Chart
const IncomeCard = ({ data, viewMode }) => {
  const incomeChartRef = useRef(null);
  
  // 📊 D3.js Donut Chart Effect (MUST be before any returns)
  useEffect(() => {
    if (incomeChartRef.current && data.sources && data.sources.length > 0) {
      const svg = d3.select(incomeChartRef.current);
      svg.selectAll("*").remove();
      
      const isMobile = window.innerWidth <= 768;
      const width = isMobile ? 200 : 220;
      const height = isMobile ? 200 : 220;
      const radius = Math.min(width, height) / 2;
      
      const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
      const chartData = data.sources.map((source, idx) => ({
        label: source.name,
        value: source.amount,
        color: vibrantColors[idx % vibrantColors.length]
      }));
      
      const pie = d3.pie().value(d => d.value).sort(null);
      const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
      
      const g = svg.attr("width", width).attr("height", height)
        .append("g").attr("transform", `translate(${width/2},${height/2})`);
      
      const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
      
      g.selectAll(".arc").data(pie(chartData)).enter().append("g").attr("class", "arc")
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.data.label}</strong><br/>$${d.data.value.toLocaleString()}`);
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          tooltip.style("visibility", "hidden");
        });
      
      return () => { tooltip.remove(); };
    }
  }, [data]);

  // 🛡️ NULL SAFETY CHECK (after hooks)
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <ArrowUp className="w-6 h-6 mr-3 text-teal-400" />
          {viewMode === 'annual' ? 'Annual Income' : 'Monthly Income'}
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowUp className="w-6 h-6 mr-3 text-teal-400" />
      {viewMode === 'annual' ? 'Annual Income' : 'Monthly Income'}
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center">
      <svg ref={incomeChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 space-y-1">
        {data.sources.map((source, idx) => {
          const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
          return (
            <div key={source.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vibrantColors[idx % vibrantColors.length] }}></div>
              <span className="text-xs text-gray-300">{source.name}: ${source.amount.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  </Card>
  );
};

// 🎯 COMMAND CENTER: Expenses Card with Donut Chart
const ExpensesCard = ({ data, viewMode }) => {
  const expensesChartRef = useRef(null);
  
  // 📊 D3.js Donut Chart Effect (MUST be before any returns)
  useEffect(() => {
    if (expensesChartRef.current && data.categories && data.categories.length > 0) {
      const svg = d3.select(expensesChartRef.current);
      svg.selectAll("*").remove();
      
      const isMobile = window.innerWidth <= 768;
      const width = isMobile ? 200 : 220;
      const height = isMobile ? 200 : 220;
      const radius = Math.min(width, height) / 2;
      
      const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
      const chartData = data.categories.map((cat, idx) => ({
        label: cat.name,
        value: cat.amount,
        color: vibrantColors[idx % vibrantColors.length]
      }));
      
      const pie = d3.pie().value(d => d.value).sort(null);
      const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
      
      const g = svg.attr("width", width).attr("height", height)
        .append("g").attr("transform", `translate(${width/2},${height/2})`);
      
      const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
      
      g.selectAll(".arc").data(pie(chartData)).enter().append("g").attr("class", "arc")
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.data.label}</strong><br/>$${d.data.value.toLocaleString()}`);
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          tooltip.style("visibility", "hidden");
        });
      
      return () => { tooltip.remove(); };
    }
  }, [data]);

  // 🛡️ NULL SAFETY CHECK (after hooks)
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-rose-900/40 to-pink-900/40">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <ArrowDown className="w-6 h-6 mr-3 text-rose-400" />
          {viewMode === 'annual' ? 'Annual Expenses' : 'Monthly Expenses'}
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-rose-900/40 to-pink-900/40">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowDown className="w-6 h-6 mr-3 text-rose-400" />
      {viewMode === 'annual' ? 'Annual Expenses' : 'Monthly Expenses'}
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center">
      <svg ref={expensesChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 space-y-1">
        {data.categories.map((cat, idx) => {
          const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
          return (
            <div key={cat.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vibrantColors[idx % vibrantColors.length] }}></div>
              <span className="text-xs text-gray-300">{cat.name}: ${cat.amount.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  </Card>
  );
};

// Cash Flow Card (TEAL - Positive Growth)
const CashFlowCard = ({ data, onEdit }) => {
  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-teal-400" />
          Cash Flow
        </h2>
        <div className="text-center text-gray-400 py-8">Loading...</div>
      </Card>
    );
  }

  const isPositive = data.total >= 0;
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-teal-400" />
          Cash Flow
        </h2>
        {/* Cash Flow is calculated - no edit needed */}
      </div>
      <p className="text-5xl font-extrabold text-white">
        {isPositive ? '+' : '-'}${Math.abs(data.total).toLocaleString()}
      </p>
      <p className="text-gray-400 mt-2">Monthly income minus expenses</p>
    </Card>
  );
};

// Financial Freedom Calculator Component
const FinancialFreedomCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAmount, setTargetAmount] = useState(2000000);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(3000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
  const [passiveIncome, setPassiveIncome] = useState(1000);
  
  const chartRef = useRef(null);

  // Calculate financial independence
  const monthlyReturn = annualReturn / 100 / 12;
  const totalMonths = targetAmount > currentSavings && monthlyContribution > 0
    ? Math.log((targetAmount * monthlyReturn + monthlyContribution) / (currentSavings * monthlyReturn + monthlyContribution)) / Math.log(1 + monthlyReturn)
    : 0;
  
  const yearsToFI = Math.ceil(totalMonths / 12);
  const targetAge = currentAge + yearsToFI;
  const monthlyPassiveNeeded = monthlyExpenses - passiveIncome;
  const requiredAmountFor4Percent = monthlyPassiveNeeded * 12 / 0.04;

  // Generate projection data
  const projectionData = useMemo(() => {
    const data = [];
    let amount = currentSavings;
    for (let month = 0; month <= totalMonths && month <= 600; month++) { // Max 50 years
      if (month > 0) {
        amount = amount * (1 + monthlyReturn) + monthlyContribution;
      }
      if (month % 12 === 0) {
        data.push({
          year: currentAge + Math.floor(month / 12),
          amount: amount,
          passiveIncome: amount * 0.04 / 12 // 4% rule monthly
        });
      }
    }
    return data;
  }, [currentSavings, totalMonths, monthlyReturn, monthlyContribution, currentAge]);

  useEffect(() => {
    if (chartRef.current && projectionData.length > 0) {
      const svg = d3.select(chartRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 20, right: 30, bottom: 40, left: 80 };
      const width = 600 - margin.left - margin.right;
      const height = 350 - margin.top - margin.bottom;

      const x = d3.scaleLinear()
        .domain(d3.extent(projectionData, d => d.year))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(projectionData, d => Math.max(d.amount, monthlyExpenses * 12 * 25))])
        .nice()
        .range([height, 0]);

      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.amount))
        .curve(d3.curveMonotoneX);

      const passiveLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.passiveIncome * 12))
        .curve(d3.curveMonotoneX);

      const g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("fill", "#9CA3AF")
        .style("font-size", "12px");

      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${(d/1000000).toFixed(1)}M`))
        .selectAll("text")
        .style("fill", "#9CA3AF")
        .style("font-size", "12px");

      // Add grid lines
      g.selectAll(".grid-line-y")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("class", "grid-line-y")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#374151")
        .attr("stroke-opacity", 0.3);

      // Add target line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(targetAmount))
        .attr("y2", y(targetAmount))
        .attr("stroke", "#10B981")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      // Add expense line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(monthlyExpenses * 12))
        .attr("y2", y(monthlyExpenses * 12))
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");

      // Add wealth accumulation line
      g.append("path")
        .datum(projectionData)
        .attr("fill", "none")
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 3)
        .attr("d", line);

      // Add passive income line
      g.append("path")
        .datum(projectionData)
        .attr("fill", "none")
        .attr("stroke", "#8B5CF6")
        .attr("stroke-width", 2)
        .attr("d", passiveLine);

      // Add dots for key points
      g.selectAll(".wealth-dot")
        .data(projectionData.filter((d, i) => i % 2 === 0))
        .enter().append("circle")
        .attr("class", "wealth-dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.amount))
        .attr("r", 3)
        .attr("fill", "#3B82F6");

      // Add labels
      g.append("text")
        .attr("x", width - 10)
        .attr("y", y(targetAmount) - 10)
        .attr("text-anchor", "end")
        .style("fill", "#10B981")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Financial Freedom Target");
    }
  }, [projectionData, targetAmount, monthlyExpenses]);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Target className="w-6 h-6 mr-3 text-emerald-400" />
          Financial Freedom Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Age</label>
            <input
              type="number"
              value={currentAge || ''}
              onChange={(e) => setCurrentAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Target Amount</label>
            <input
              type="number"
              value={targetAmount || ''}
              onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Savings</label>
            <input
              type="number"
              value={currentSavings || ''}
              onChange={(e) => setCurrentSavings(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Monthly Contribution</label>
            <input
              type="number"
              value={monthlyContribution || ''}
              onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Annual Return %</label>
            <input
              type="number"
              value={annualReturn || ''}
              onChange={(e) => setAnnualReturn(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Monthly Expenses</label>
            <input
              type="number"
              value={monthlyExpenses || ''}
              onChange={(e) => setMonthlyExpenses(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Passive Income</label>
            <input
              type="number"
              value={passiveIncome || ''}
              onChange={(e) => setPassiveIncome(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Financial Independence</label>
            <div className="bg-emerald-900/30 rounded px-3 py-2 border border-emerald-600">
              <div className="text-emerald-400 font-bold">{yearsToFI} years</div>
              <div className="text-xs text-emerald-300">Age {targetAge}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-600/30">
            <h4 className="text-emerald-400 font-semibold mb-2">Financial Independence</h4>
            <div className="text-2xl font-bold text-white">${targetAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Target amount needed</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <h4 className="text-blue-400 font-semibold mb-2">Monthly Passive Needed</h4>
            <div className="text-2xl font-bold text-white">${monthlyPassiveNeeded.toLocaleString()}</div>
            <div className="text-sm text-gray-300">To cover expenses</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
            <h4 className="text-purple-400 font-semibold mb-2">4% Rule Amount</h4>
            <div className="text-2xl font-bold text-white">${requiredAmountFor4Percent.toLocaleString()}</div>
            <div className="text-sm text-gray-300">For current lifestyle</div>
          </div>
        </div>
      </Card>

      <Card>
        <h4 className="text-lg font-bold text-white mb-4">Financial Freedom Projection</h4>
        <div className="flex justify-center">
          <svg ref={chartRef}></svg>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-300">Wealth Accumulation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-500"></div>
            <span className="text-gray-300">Passive Income (4% rule)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 border-dashed border border-green-500"></div>
            <span className="text-gray-300">FI Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500 border-dashed border border-red-500"></div>
            <span className="text-gray-300">Annual Expenses</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Debt Payoff Calculator Component
const DebtPayoffCalculator = () => {
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card 1', balance: 5000, interestRate: 19.99, minPayment: 100 },
    { id: 2, name: 'Credit Card 2', balance: 10000, interestRate: 22.99, minPayment: 200 },
    { id: 3, name: 'Line of Credit', balance: 30000, interestRate: 8.5, minPayment: 300 }
  ]);
  const [extraPayment, setExtraPayment] = useState(500);
  const [strategy, setStrategy] = useState('snowball'); // 'snowball' or 'avalanche'
  
  // Add new debt function
  const addDebt = () => {
    const newId = Math.max(...debts.map(d => d.id)) + 1;
    const newDebt = {
      id: newId,
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      interestRate: 0,
      minPayment: 0
    };
    setDebts([...debts, newDebt]);
  };
  
  // Remove debt function
  const removeDebt = (debtId) => {
    if (debts.length > 1) { // Keep at least one debt
      setDebts(debts.filter(debt => debt.id !== debtId));
    }
  };
  
  // Update debt function
  const updateDebt = (index, field, value) => {
    const newDebts = [...debts];
    newDebts[index][field] = value;
    setDebts(newDebts);
  };
  
  // Load debt templates
  const loadTemplate = (templateName) => {
    let template = [];
    
    switch (templateName) {
      case 'credit-cards':
        template = [
          { id: 1, name: 'Credit Card 1', balance: 3500, interestRate: 18.99, minPayment: 85 },
          { id: 2, name: 'Credit Card 2', balance: 8200, interestRate: 22.99, minPayment: 165 },
          { id: 3, name: 'Store Card', balance: 1200, interestRate: 24.99, minPayment: 35 }
        ];
        break;
      case 'student-loans':
        template = [
          { id: 1, name: 'Federal Loan 1', balance: 15000, interestRate: 4.53, minPayment: 150 },
          { id: 2, name: 'Federal Loan 2', balance: 12000, interestRate: 5.28, minPayment: 125 },
          { id: 3, name: 'Private Loan', balance: 25000, interestRate: 7.5, minPayment: 285 }
        ];
        break;
      case 'mixed':
        template = [
          { id: 1, name: 'Credit Card', balance: 5500, interestRate: 19.99, minPayment: 110 },
          { id: 2, name: 'Car Loan', balance: 18000, interestRate: 6.5, minPayment: 320 },
          { id: 3, name: 'Student Loan', balance: 22000, interestRate: 5.8, minPayment: 245 },
          { id: 4, name: 'Personal Loan', balance: 8000, interestRate: 12.99, minPayment: 180 }
        ];
        break;
      default:
        return;
    }
    
    setDebts(template);
  };
  
  // Calculate payoff scenarios
  const calculatePayoffScenario = (debts, extraPayment, strategy) => {
    const debtsCopy = debts.map(debt => ({ ...debt }));
    let totalInterestPaid = 0;
    let months = 0;
    let payoffOrder = [];
    
    // Sort debts based on strategy
    const sortedDebts = [...debtsCopy].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance; // Smallest balance first
      } else {
        return b.interestRate - a.interestRate; // Highest interest first
      }
    });
    
    while (sortedDebts.some(debt => debt.balance > 0) && months < 600) { // Max 50 years
      months++;
      let remainingExtraPayment = extraPayment;
      
      // Apply minimum payments and interest
      for (const debt of sortedDebts) {
        if (debt.balance > 0) {
          const monthlyInterest = debt.balance * (debt.interestRate / 100 / 12);
          totalInterestPaid += monthlyInterest;
          debt.balance += monthlyInterest;
          
          const payment = Math.min(debt.minPayment, debt.balance);
          debt.balance -= payment;
        }
      }
      
      // Apply extra payment to first debt with balance
      const targetDebt = sortedDebts.find(debt => debt.balance > 0);
      if (targetDebt && remainingExtraPayment > 0) {
        const extraPaid = Math.min(remainingExtraPayment, targetDebt.balance);
        targetDebt.balance -= extraPaid;
        
        if (targetDebt.balance <= 0) {
          payoffOrder.push({ name: targetDebt.name, month: months });
        }
      }
    }
    
    return {
      totalMonths: months,
      totalYears: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalInterestPaid,
      payoffOrder,
      totalPaid: debtsCopy.reduce((sum, debt) => sum + debt.balance, 0) + totalInterestPaid
    };
  };
  
  const snowballResult = calculatePayoffScenario(debts, extraPayment, 'snowball');
  const avalancheResult = calculatePayoffScenario(debts, extraPayment, 'avalanche');
  const currentResult = strategy === 'snowball' ? snowballResult : avalancheResult;
  
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <CreditCard className="w-6 h-6 mr-3 text-red-400" />
          Debt Payoff Calculator
        </h3>
        
        {/* Strategy Selection */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setStrategy('snowball')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                strategy === 'snowball' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏔️ Debt Snowball (Smallest First)
            </button>
            <button
              onClick={() => setStrategy('avalanche')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                strategy === 'avalanche' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⚡ Debt Avalanche (Highest Interest)
            </button>
          </div>
          
          {/* Quick Templates */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-sm text-gray-400 mb-2">Quick Start Templates:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadTemplate('credit-cards')}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
              >
                💳 Credit Cards
              </button>
              <button
                onClick={() => loadTemplate('student-loans')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                🎓 Student Loans
              </button>
              <button
                onClick={() => loadTemplate('mixed')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
              >
                🔄 Mixed Debts
              </button>
            </div>
          </div>
        </div>
        
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Debt List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Your Debts</h4>
              <button
                onClick={addDebt}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Debt
              </button>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 mb-2 px-3">
              <div>Name</div>
              <div>Balance</div>
              <div>APR %</div>
              <div>Min Payment</div>
              <div></div>
            </div>
            
            <div className="space-y-3">
              {debts.map((debt, index) => (
                <div key={debt.id} className="bg-gray-700/50 rounded-lg p-3 border border-red-600/20">
                  <div className="grid grid-cols-5 gap-2 text-sm items-center">
                    <div>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(index, 'name', e.target.value)}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="Debt name"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={debt.balance || ''}
                        onChange={(e) => updateDebt(index, 'balance', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        value={debt.interestRate || ''}
                        onChange={(e) => updateDebt(index, 'interestRate', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={debt.minPayment || ''}
                        onChange={(e) => updateDebt(index, 'minPayment', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="$0"
                      />
                    </div>
                    <div className="flex justify-center">
                      {debts.length > 1 && (
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Remove debt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Extra Monthly Payment</label>
                <input
                  type="number"
                  value={extraPayment || ''}
                  onChange={(e) => setExtraPayment(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Extra payment amount"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setExtraPayment(100)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                >
                  +$100
                </button>
                <button
                  onClick={() => setExtraPayment(250)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                >
                  +$250
                </button>
                <button
                  onClick={() => setExtraPayment(500)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                >
                  +$500
                </button>
                <button
                  onClick={() => setExtraPayment(0)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              
              {/* Debt Summary */}
              <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Total Debts:</span>
                  <span className="font-semibold">{debts.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Average APR:</span>
                  <span className="font-semibold">
                    {debts.length > 0 && debts.some(d => d.interestRate > 0) ? 
                      (debts.reduce((sum, debt) => sum + (debt.interestRate || 0), 0) / debts.filter(d => d.interestRate > 0).length).toFixed(1) + '%' : 
                      '0.0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div>
            <h4 className="font-semibold text-white mb-3">
              {strategy === 'snowball' ? '🏔️ Snowball' : '⚡ Avalanche'} Results
            </h4>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Debt</p>
                    <p className="text-red-400 font-bold text-lg">${totalDebt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Min Payments</p>
                    <p className="text-white font-bold">${totalMinPayment.toLocaleString()}/mo</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Payoff Time</p>
                    <p className="text-emerald-400 font-bold">
                      {currentResult.totalYears}y {currentResult.remainingMonths}m
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Interest Paid</p>
                    <p className="text-orange-400 font-bold">${Math.round(currentResult.totalInterestPaid).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Strategy Comparison */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3">Strategy Comparison</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-400">🏔️ Snowball:</span>
                    <span className="text-white">
                      {snowballResult.totalYears}y {snowballResult.remainingMonths}m 
                      (${Math.round(snowballResult.totalInterestPaid).toLocaleString()} interest)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">⚡ Avalanche:</span>
                    <span className="text-white">
                      {avalancheResult.totalYears}y {avalancheResult.remainingMonths}m 
                      (${Math.round(avalancheResult.totalInterestPaid).toLocaleString()} interest)
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="text-emerald-400 font-semibold">
                      💰 Avalanche saves: ${Math.round(snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payoff Order */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3">Payoff Order</h5>
                <div className="space-y-2 text-sm">
                  {currentResult.payoffOrder.map((payoff, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{index + 1}. {payoff.name}</span>
                      <span className="text-emerald-400 font-medium">
                        Month {payoff.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Visualization */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h5 className="text-white font-semibold mb-3">Debt Payoff Progress</h5>
          <div className="space-y-3">
            {debts.map((debt) => {
              const progress = Math.max(0, Math.min(100, ((debt.balance / (debt.balance + extraPayment * 12)) * 100)));
              return (
                <div key={debt.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{debt.name}</span>
                    <span className="text-red-400">${debt.balance.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${100 - progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Budget Calculator Component with the critical layout fix
const BudgetCalculatorTab = ({ checkFeatureAccess, showUpgradePromptForFeature }) => {
  const [budgetType, setBudgetType] = useState('50-30-20');
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [showFFCalculator, setShowFFCalculator] = useState(false);
  const [showDebtCalculator, setShowDebtCalculator] = useState(false);
  
  // Editable budget percentages
  const [budgetPercentages, setBudgetPercentages] = useState({
    '50-30-20': {
      needs: 50,
      wants: 30,
      savings: 20
    },
    '6-jars': {
      necessities: 55,
      financialFreedom: 10,
      longTermSavings: 10,
      education: 10,
      play: 10,
      give: 5
    }
  });
  
  const fiftyThirtyTwenty = {
    needs: Math.round(monthlyIncome * (budgetPercentages['50-30-20'].needs / 100)),
    wants: Math.round(monthlyIncome * (budgetPercentages['50-30-20'].wants / 100)),
    savings: Math.round(monthlyIncome * (budgetPercentages['50-30-20'].savings / 100))
  };
  
  const sixJars = {
    necessities: Math.round(monthlyIncome * (budgetPercentages['6-jars'].necessities / 100)),
    financialFreedom: Math.round(monthlyIncome * (budgetPercentages['6-jars'].financialFreedom / 100)),
    longTermSavings: Math.round(monthlyIncome * (budgetPercentages['6-jars'].longTermSavings / 100)),
    education: Math.round(monthlyIncome * (budgetPercentages['6-jars'].education / 100)),
    play: Math.round(monthlyIncome * (budgetPercentages['6-jars'].play / 100)),
    give: Math.round(monthlyIncome * (budgetPercentages['6-jars'].give / 100))
  };
  
  // Function to update budget percentages
  const updateBudgetPercentage = (budgetSystem, category, percentage) => {
    setBudgetPercentages(prev => ({
      ...prev,
      [budgetSystem]: {
        ...prev[budgetSystem],
        [category]: Math.max(0, Math.min(100, percentage)) // Ensure 0-100 range
      }
    }));
  };

  // Calculate total percentage for validation
  const totalPercentage = budgetType === '50-30-20'
    ? budgetPercentages['50-30-20'].needs + budgetPercentages['50-30-20'].wants + budgetPercentages['50-30-20'].savings
    : Object.values(budgetPercentages['6-jars']).reduce((sum, val) => sum + val, 0);

  // Calculate remaining balance after budgeting
  const remainingBalance = budgetType === '50-30-20' 
    ? monthlyIncome - (fiftyThirtyTwenty.needs + fiftyThirtyTwenty.wants + fiftyThirtyTwenty.savings)
    : monthlyIncome - (sixJars.necessities + sixJars.financialFreedom + sixJars.longTermSavings + sixJars.education + sixJars.play + sixJars.give);

  return (
    // This is the critical layout fix: col-span-6 for full width
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-1">
              <Calculator className="w-6 h-6 mr-3 text-cyan-400" />
              Budget Calculator
            </h2>
            <p className="text-gray-400">Plan your finances with proven budgeting methods.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-gray-900/50 rounded-full p-1 space-x-1">
              <button onClick={() => setBudgetType('50-30-20')} className={`px-3 py-1 rounded-full text-sm font-semibold ${budgetType === '50-30-20' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>50/30/20 Rule</button>
              <button onClick={() => setBudgetType('6-jars')} className={`px-3 py-1 rounded-full text-sm font-semibold ${budgetType === '6-jars' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>6 Jars System</button>
            </div>
            
            <button
              onClick={() => {
                if (checkFeatureAccess('financial-calculators')) {
                  setShowFFCalculator(!showFFCalculator);
                } else {
                  showUpgradePromptForFeature('Financial Freedom Calculator', 'financial-calculators');
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                showFFCalculator ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              {showFFCalculator ? 'Hide FF Calculator' : 'Financial Freedom'}
              {!checkFeatureAccess('financial-calculators') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
            </button>
            
            <button
              onClick={() => {
                if (checkFeatureAccess('financial-calculators')) {
                  setShowDebtCalculator(!showDebtCalculator);
                } else {
                  showUpgradePromptForFeature('Debt Payoff Calculator', 'financial-calculators');
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                showDebtCalculator ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {showDebtCalculator ? 'Hide Debt Calculator' : 'Debt Payoff'}
              {!checkFeatureAccess('financial-calculators') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
            </button>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
          <label className="block text-white text-lg font-bold mb-4">Monthly Income Input</label>
          <input
            type="number"
            value={monthlyIncome || ''}
            onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-gray-700 text-white text-xl p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter your monthly income"
          />
        </div>
        
        <div className="bg-green-900/20 rounded-xl p-6 border-2 border-green-800/40">
          <label className="block text-green-400 text-lg font-bold mb-4">Monthly Income</label>
          <div className="text-3xl font-bold text-white mb-2">${monthlyIncome.toLocaleString()}</div>
          <p className="text-gray-400">Ready for budgeting</p>
        </div>
        
        <div className="bg-blue-900/20 rounded-xl p-6 border-2 border-blue-800/40">
          <label className="block text-blue-400 text-lg font-bold mb-4">After Budgeting</label>
          <div className={`text-3xl font-bold mb-2 ${remainingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(remainingBalance).toLocaleString()}
          </div>
          <p className="text-gray-400">
            {remainingBalance >= 0 ? 'Remaining balance' : 'Over budget by'}
          </p>
          <div className="mt-3 pt-3 border-t border-blue-800/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-300">Total Allocation:</span>
              <span className={`font-semibold ${totalPercentage === 100 ? 'text-green-400' : totalPercentage > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                {totalPercentage}%
              </span>
            </div>
            {totalPercentage !== 100 && (
              <p className="text-xs text-gray-400 mt-1">
                {totalPercentage > 100 ? 'Reduce percentages to 100%' : 'Add more percentage allocations'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {budgetType === '50-30-20' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-green-900/30 rounded-xl p-6 border-2 border-green-800/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-green-400">💡 Needs</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetPercentages['50-30-20'].needs || ''}
                  onChange={(e) => updateBudgetPercentage('50-30-20', 'needs', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-16 bg-green-800/50 text-green-300 text-sm px-2 py-1 rounded border border-green-600 focus:border-green-400 focus:outline-none text-center"
                  min="0"
                  max="100"
                />
                <span className="text-green-400 text-sm font-semibold">%</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Essential expenses</p>
            <div className="text-4xl font-bold text-white">${fiftyThirtyTwenty.needs.toLocaleString()}</div>
          </div>
          <div className="bg-yellow-900/30 rounded-xl p-6 border-2 border-yellow-800/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-yellow-400">🎯 Wants</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetPercentages['50-30-20'].wants || ''}
                  onChange={(e) => updateBudgetPercentage('50-30-20', 'wants', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-16 bg-yellow-800/50 text-yellow-300 text-sm px-2 py-1 rounded border border-yellow-600 focus:border-yellow-400 focus:outline-none text-center"
                  min="0"
                  max="100"
                />
                <span className="text-yellow-400 text-sm font-semibold">%</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Discretionary spending</p>
            <div className="text-4xl font-bold text-white">${fiftyThirtyTwenty.wants.toLocaleString()}</div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-6 border-2 border-blue-800/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-blue-400">💰 Savings</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetPercentages['50-30-20'].savings || ''}
                  onChange={(e) => updateBudgetPercentage('50-30-20', 'savings', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-16 bg-blue-800/50 text-blue-300 text-sm px-2 py-1 rounded border border-blue-600 focus:border-blue-400 focus:outline-none text-center"
                  min="0"
                  max="100"
                />
                <span className="text-blue-400 text-sm font-semibold">%</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">Future & investments</p>
            <div className="text-4xl font-bold text-white">${fiftyThirtyTwenty.savings.toLocaleString()}</div>
          </div>
        </div>
      )}
      
      {budgetType === '6-jars' && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-green-900/30 rounded-xl p-4 border-2 border-green-800/40 text-center">
            <h4 className="text-sm font-bold text-green-400 mb-2">🏠 Necessities</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.necessities.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].necessities || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'necessities', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-green-800/50 text-green-300 text-xs px-1 py-0.5 rounded border border-green-600 focus:border-green-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-green-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-purple-900/30 rounded-xl p-4 border-2 border-purple-800/40 text-center">
            <h4 className="text-sm font-bold text-purple-400 mb-2">🚀 Freedom</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.financialFreedom.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].financialFreedom || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'financialFreedom', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-purple-800/50 text-purple-300 text-xs px-1 py-0.5 rounded border border-purple-600 focus:border-purple-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-purple-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-4 border-2 border-blue-800/40 text-center">
            <h4 className="text-sm font-bold text-blue-400 mb-2">🎯 Savings</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.longTermSavings.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].longTermSavings || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'longTermSavings', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-blue-800/50 text-blue-300 text-xs px-1 py-0.5 rounded border border-blue-600 focus:border-blue-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-blue-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-amber-900/30 rounded-xl p-4 border-2 border-amber-800/40 text-center">
            <h4 className="text-sm font-bold text-amber-400 mb-2">📚 Education</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.education.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].education || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'education', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-amber-800/50 text-amber-300 text-xs px-1 py-0.5 rounded border border-amber-600 focus:border-amber-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-amber-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-pink-900/30 rounded-xl p-4 border-2 border-pink-800/40 text-center">
            <h4 className="text-sm font-bold text-pink-400 mb-2">🎉 Play</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.play.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].play || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'play', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-pink-800/50 text-pink-300 text-xs px-1 py-0.5 rounded border border-pink-600 focus:border-pink-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-pink-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-teal-900/30 rounded-xl p-4 border-2 border-teal-800/40 text-center">
            <h4 className="text-sm font-bold text-teal-400 mb-2">❤️ Give</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.give.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].give || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'give', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-12 bg-teal-800/50 text-teal-300 text-xs px-1 py-0.5 rounded border border-teal-600 focus:border-teal-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-teal-400 text-xs font-semibold">%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Financial Freedom Calculator */}
      {showFFCalculator && checkFeatureAccess('financial-calculators') && <FinancialFreedomCalculator />}
      
      {/* Debt Payoff Calculator */}
      {showDebtCalculator && checkFeatureAccess('financial-calculators') && <DebtPayoffCalculator />}
    </div>
  );
};

// Side Hustle Management Component
const SideHustleTab = ({ data, setData, userId }) => {
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemType, setItemType] = useState('income');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [newItem, setNewItem] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 🔧 EDGE CASE FIX: Null safety for empty businesses array
  const totalBusinessIncome = (data.businesses || []).reduce((sum, business) => sum + (business.totalIncome || business.income || 0), 0);
  const totalBusinessExpenses = (data.businesses || []).reduce((sum, business) => sum + (business.totalExpenses || business.expenses || 0), 0);
  const totalNetProfit = totalBusinessIncome - totalBusinessExpenses;

  const handleAddBusiness = async () => {
    if (!newBusiness.name) return;
    
    const business = {
      id: Date.now(),
      ...newBusiness,
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      incomeItems: [],
      expenseItems: []
    };
    
    const updatedBusinesses = [...data.businesses, business];
    const updatedData = { ...data, businesses: updatedBusinesses };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setNewBusiness({ name: '', description: '', startDate: new Date().toISOString().split('T')[0] });
      setShowAddBusiness(false);
    } catch (error) {
      console.error('Error adding business:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description || !newItem.amount || !selectedBusiness) return;
    
    const amount = parseFloat(newItem.amount);
    const item = {
      id: Date.now(),
      ...newItem,
      amount
    };
    
    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === selectedBusiness.id) {
        const updatedBusiness = { ...business };
        
        if (itemType === 'income') {
          updatedBusiness.incomeItems = [item, ...business.incomeItems];
          updatedBusiness.totalIncome = business.totalIncome + amount;
        } else {
          updatedBusiness.expenseItems = [item, ...business.expenseItems];
          updatedBusiness.totalExpenses = business.totalExpenses + amount;
        }
        
        updatedBusiness.netProfit = updatedBusiness.totalIncome - updatedBusiness.totalExpenses;
        return updatedBusiness;
      }
      return business;
    });
    
    const updatedData = { ...data, businesses: updatedBusinesses };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setNewItem({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const initiateDeleteBusiness = (business) => {
    setBusinessToDelete(business);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setBusinessToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeleteBusiness = async () => {
    if (!businessToDelete) return;

    const updatedBusinesses = data.businesses.filter(business => business.id !== businessToDelete.id);
    const updatedData = { ...data, businesses: updatedBusinesses };

    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setBusinessToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const handleDeleteItem = async (businessId, itemId, type) => {
    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === businessId) {
        const updatedBusiness = { ...business };
        
        if (type === 'income') {
          const item = business.incomeItems.find(i => i.id === itemId);
          updatedBusiness.incomeItems = business.incomeItems.filter(i => i.id !== itemId);
          updatedBusiness.totalIncome = business.totalIncome - (item?.amount || 0);
        } else {
          const item = business.expenseItems.find(i => i.id === itemId);
          updatedBusiness.expenseItems = business.expenseItems.filter(i => i.id !== itemId);
          updatedBusiness.totalExpenses = business.totalExpenses - (item?.amount || 0);
        }
        
        updatedBusiness.netProfit = updatedBusiness.totalIncome - updatedBusiness.totalExpenses;
        return updatedBusiness;
      }
      return business;
    });
    
    const updatedData = { ...data, businesses: updatedBusinesses };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Business Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ArrowUp className="w-5 h-5 mr-2 text-green-400" />
            Total Business Income
          </h3>
          <p className="text-3xl font-bold text-green-400">${totalBusinessIncome.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-2">From {data.businesses.length} businesses</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/40 to-rose-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ArrowDown className="w-5 h-5 mr-2 text-red-400" />
            Total Business Expenses
          </h3>
          <p className="text-3xl font-bold text-red-400">${totalBusinessExpenses.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-2">Operating costs</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Total Net Profit
          </h3>
          <p className={`text-3xl font-bold ${totalNetProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            ${totalNetProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {totalNetProfit >= 0 ? 'Profitable' : 'Loss'}
          </p>
        </Card>
      </div>

      {/* Header and Add Business */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <Building className="w-6 h-6 mr-3 text-violet-400" />
              Side Hustle Management
            </h2>
            <p className="text-gray-400">Track income and expenses for all your businesses</p>
          </div>
          <button
            onClick={() => setShowAddBusiness(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Business
          </button>
        </div>
      </Card>

      {/* Add Business Form */}
      {showAddBusiness && (
        <Card className="border-violet-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Add New Business</h3>
            <button
              onClick={() => setShowAddBusiness(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Business Name"
              value={newBusiness.name}
              onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
            />
            
            <input
              type="date"
              value={newBusiness.startDate}
              onChange={(e) => setNewBusiness({...newBusiness, startDate: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
            />
          </div>
          
          <textarea
            placeholder="Business Description"
            value={newBusiness.description}
            onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
            className="w-full mt-4 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
            rows="3"
          />
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowAddBusiness(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBusiness}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Business
            </button>
          </div>
        </Card>
      )}

      {/* Business List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.businesses.map(business => (
          <Card key={business.id} className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{business.name}</h3>
                <p className="text-gray-400 text-sm">{business.description}</p>
                <p className="text-gray-500 text-xs">Since {new Date(business.startDate).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowAddItem(true);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </button>
                <button
                  onClick={() => initiateDeleteBusiness(business)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Business Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-900/30 rounded-lg p-3">
                <div className="text-lg font-bold text-green-400">${business.totalIncome.toLocaleString()}</div>
                <div className="text-xs text-green-300">Income</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-3">
                <div className="text-lg font-bold text-red-400">${business.totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-red-300">Expenses</div>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-3">
                <div className={`text-lg font-bold ${business.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  ${business.netProfit.toLocaleString()}
                </div>
                <div className="text-xs text-blue-300">Net Profit</div>
              </div>
            </div>
            
            {/* Recent Items */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-300">Recent Activity</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {[...business.incomeItems, ...business.expenseItems]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map(item => {
                    const isIncome = business.incomeItems.includes(item);
                    return (
                      <div key={`${isIncome ? 'income' : 'expense'}-${item.id}`} className="flex items-center justify-between bg-gray-700/30 rounded p-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${isIncome ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-white">{item.description}</span>
                          </div>
                          <div className="text-xs text-gray-400 ml-4">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}${item.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(business.id, item.id, isIncome ? 'income' : 'expense')}
                            className="text-gray-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddItem && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-violet-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Add Item to {selectedBusiness.name}
              </h3>
              <button
                onClick={() => setShowAddItem(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setItemType('income')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    itemType === 'income' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setItemType('expense')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    itemType === 'expense' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Expense
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={newItem.amount || ''}
                onChange={(e) => setNewItem({...newItem, amount: e.target.value === '' ? '' : e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
              />
              
              <input
                type="date"
                value={newItem.date}
                onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddItem(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add {itemType === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && businessToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-red-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Delete Business</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-600/30">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Warning: Permanent Action</h4>
                    <p className="text-sm text-gray-300">
                      Are you sure you want to delete "<span className="font-semibold text-white">{businessToDelete.name}</span>"?
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      This will permanently remove all income and expense records for this business. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3">
                <h5 className="text-white font-medium mb-2">Business Details:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Income:</span>
                    <span className="text-green-400">${businessToDelete.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Expenses:</span>
                    <span className="text-red-400">${businessToDelete.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Profit:</span>
                    <span className={`${businessToDelete.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${businessToDelete.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Records:</span>
                    <span className="text-gray-300">
                      {(businessToDelete.incomeItems?.length || 0) + (businessToDelete.expenseItems?.length || 0)} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBusiness}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Business
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Investment Portfolio Component with Charts
const InvestmentTab = ({ data, setData, userId }) => {
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [allocationView, setAllocationView] = useState('ticker'); // 'ticker' or 'category'
  
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    name: '',
    shares: '',
    avgCost: '',
    currentPrice: '',
    dividendYield: '',
    dripEnabled: true,
    accountType: 'TFSA',
    isUSStock: false,
    withholdingTax: 0,
    currency: 'CAD',
    category: 'US Stocks' // Default category
  });

  // 🔧 EDGE CASE FIX: Null safety for empty holdings array
  const actualTotalValue = (data.investments?.holdings || []).reduce((sum, holding) => {
    return sum + ((holding.shares || 0) * (holding.currentPrice || 0));
  }, 0);

  const actualTotalCost = (data.investments?.holdings || []).reduce((sum, holding) => {
    return sum + ((holding.shares || 0) * (holding.avgCost || 0));
  }, 0);

  // 📊 Calculate portfolio allocation by TICKER
  const calculateAllocationByTicker = () => {
    if (!data.investments?.holdings || data.investments.holdings.length === 0) {
      return [];
    }

    const holdings = data.investments.holdings;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
    
    // Calculate total portfolio value from all holdings
    const totalPortfolioValue = holdings.reduce((sum, holding) => {
      return sum + (holding.totalValue || 0);
    }, 0);

    // Create allocation array with ticker symbols and percentages
    const allocation = holdings.map((holding, index) => {
      const holdingValue = holding.totalValue || 0;
      const percentage = totalPortfolioValue > 0 ? ((holdingValue / totalPortfolioValue) * 100) : 0;
      
      return {
        id: holding.id || index + 1,
        label: holding.symbol || 'Unknown',  // Ticker symbol (e.g., "AAPL", "BIT")
        name: holding.symbol || 'Unknown',   // Keep for compatibility
        value: holdingValue,                 // Actual dollar value
        percentage: percentage.toFixed(1),   // Percentage as string (e.g., "50.0")
        percentageNum: percentage,           // Percentage as number for sorting
        color: colors[index % colors.length]
      };
    });

    // Sort by percentage (largest to smallest)
    return allocation.sort((a, b) => b.percentageNum - a.percentageNum);
  };

  // 📊 Calculate portfolio allocation by CATEGORY
  const calculateAllocationByCategory = () => {
    if (!data.investments?.holdings || data.investments.holdings.length === 0) {
      return [];
    }

    const holdings = data.investments.holdings;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
    
    // Calculate total portfolio value
    const totalPortfolioValue = holdings.reduce((sum, holding) => {
      return sum + (holding.totalValue || 0);
    }, 0);

    // Group holdings by category
    const categoryMap = {};
    holdings.forEach(holding => {
      const category = holding.category || 'Uncategorized';
      const value = holding.totalValue || 0;
      
      if (!categoryMap[category]) {
        categoryMap[category] = { name: category, value: 0, holdings: [] };
      }
      categoryMap[category].value += value;
      categoryMap[category].holdings.push(holding);
    });

    // Create allocation array with category names and percentages
    const allocation = Object.values(categoryMap).map((cat, index) => {
      const percentage = totalPortfolioValue > 0 ? ((cat.value / totalPortfolioValue) * 100) : 0;
      
      return {
        id: index + 1,
        label: cat.name,                     // Category name (e.g., "US Stocks")
        name: cat.name,
        value: cat.value,                    // Total dollar value in category
        percentage: percentage.toFixed(1),   // Percentage as string
        percentageNum: percentage,           // Percentage as number for sorting
        color: colors[index % colors.length]
      };
    });

    // Sort by percentage (largest to smallest)
    return allocation.sort((a, b) => b.percentageNum - a.percentageNum);
  };

  // Switch between ticker and category allocation based on view mode
  const portfolioAllocation = allocationView === 'ticker' 
    ? calculateAllocationByTicker() 
    : calculateAllocationByCategory();

  useEffect(() => {
    // Pie Chart - Use dynamically calculated allocation
    if (pieChartRef.current && portfolioAllocation && portfolioAllocation.length > 0) {
      const svg = d3.select(pieChartRef.current);
      svg.selectAll("*").remove();
      
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;
      
      const color = d3.scaleOrdinal()
        .domain(portfolioAllocation.map(d => d.name))
        .range(portfolioAllocation.map(d => d.color));
      
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(60)
        .outerRadius(radius);
      
      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
      
      const arcs = g.selectAll(".arc")
        .data(pie(portfolioAllocation))
        .enter().append("g")
        .attr("class", "arc");
      
      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.name))
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 2);
      
      arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text(d => `${d.data.percentage}%`);
    }
    
    // Line Chart - Dynamic Performance History Based on Actual Investment Data
    if (lineChartRef.current && data.investments.holdings.length > 0) {
      const svg = d3.select(lineChartRef.current);
      svg.selectAll("*").remove();
      
      // Use pre-calculated values
      const currentTotalValue = actualTotalValue;
      const totalCostBasis = actualTotalCost;
      
              // Generate dynamic performance history based on investment start date and growth
        const generatePerformanceHistory = () => {
          const currentDate = new Date();
          // Start date based on investment timeline (more realistic for tracking)
          const startDate = new Date(currentDate.getFullYear() - 3, 0, 1); // 3 years ago
          const yearsDiff = (currentDate.getFullYear() - startDate.getFullYear()) + 1;
        
        // Calculate annual growth rate based on current vs cost basis
        const totalGrowth = currentTotalValue / totalCostBasis;
        const annualGrowthRate = Math.pow(totalGrowth, 1 / Math.max(yearsDiff, 1)) - 1;
        
        const performanceData = [];
        
        // Generate yearly data points
        for (let i = 0; i < yearsDiff; i++) {
          const year = startDate.getFullYear() + i;
          const isCurrentYear = year === currentDate.getFullYear();
          
          let value;
          if (isCurrentYear) {
            // Use actual current value for current year
            value = currentTotalValue;
          } else {
            // Calculate historical value based on growth rate
            const yearsFromStart = i;
            value = totalCostBasis * Math.pow(1 + annualGrowthRate, yearsFromStart);
          }
          
          performanceData.push({
            date: new Date(year, 11, 31), // December 31st
            value: Math.round(value)
          });
        }
        
        return performanceData;
      };
      
      const data_parsed = generatePerformanceHistory();
      
      // Get container width for responsive design
      const container = lineChartRef.current.parentNode;
      const containerWidth = container.getBoundingClientRect().width;
      
      // Mobile-first responsive margins and dimensions
      const margin = window.innerWidth <= 768 
        ? { top: 20, right: 20, bottom: 50, left: 50 }
        : { top: 20, right: 30, bottom: 40, left: 60 };
      
      const width = Math.min(containerWidth - 40, 800) - margin.left - margin.right;
      const height = window.innerWidth <= 768 ? 250 : 300;
      const chartHeight = height - margin.top - margin.bottom;
      
      const x = d3.scaleTime()
        .domain(d3.extent(data_parsed, d => d.date))
        .range([0, width]);
      
      const y = d3.scaleLinear()
        .domain(d3.extent(data_parsed, d => d.value))
        .nice()
        .range([chartHeight, 0]);
      
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      const area = d3.area()
        .x(d => x(d.date))
        .y0(chartHeight)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      const g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Add gradient definition
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "areaGradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", chartHeight);
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#3B82F6")
        .attr("stop-opacity", 0.4);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3B82F6")
        .attr("stop-opacity", 0.1);
      
      // Add axes with responsive formatting
      g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(data_parsed.length))
        .selectAll("text")
        .style("fill", "#9CA3AF")
        .style("font-size", window.innerWidth <= 768 ? "10px" : "12px");
      
      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${(d/1000).toFixed(0)}k`))
        .selectAll("text")
        .style("fill", "#9CA3AF")
        .style("font-size", window.innerWidth <= 768 ? "10px" : "12px");
      
      // Add subtle grid lines
      g.selectAll(".grid-line-y")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("class", "grid-line-y")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#374151")
        .attr("stroke-opacity", 0.2);
      
      // Add gradient area
      g.append("path")
        .datum(data_parsed)
        .attr("fill", "url(#areaGradient)")
        .attr("d", area);
      
      // Add main line
      g.append("path")
        .datum(data_parsed)
        .attr("fill", "none")
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", window.innerWidth <= 768 ? 2 : 3)
        .attr("d", line);
      
      // Add dots with responsive sizing
      g.selectAll(".dot")
        .data(data_parsed)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", window.innerWidth <= 768 ? 3 : 4)
        .attr("fill", "#3B82F6")
        .attr("stroke", "#1F2937")
        .attr("stroke-width", 2);
    }
  }, [data.investments, actualTotalCost, actualTotalValue, portfolioAllocation, allocationView]);

  const totalGainLoss = actualTotalValue - actualTotalCost;
  const totalGainLossPercent = actualTotalCost > 0 ? (totalGainLoss / actualTotalCost) * 100 : 0;

  const handleAddHolding = async () => {
    if (!newHolding.symbol || !newHolding.shares || !newHolding.avgCost || !newHolding.currentPrice) {
      alert('Please fill in all required fields');
      return;
    }
    
    const shares = parseFloat(newHolding.shares);
    const avgCost = parseFloat(newHolding.avgCost);
    const currentPrice = parseFloat(newHolding.currentPrice);
    const dividendYield = parseFloat(newHolding.dividendYield) || 0;

    // Validation for impossible values
    if (shares <= 0) {
      alert('Shares must be greater than 0');
      return;
    }
    if (avgCost <= 0) {
      alert('Average cost must be greater than 0');
      return;
    }
    if (currentPrice <= 0) {
      alert('Current price must be greater than 0');
      return;
    }
    if (dividendYield < 0 || dividendYield > 50) {
      alert('Dividend yield must be between 0% and 50%');
      return;
    }
    
    // Calculate withholding tax based on account type and stock origin
    let withholdingTax = 0;
    if (newHolding.isUSStock) {
      // Find the account in user's retirement accounts
      const account = data.registeredAccounts?.accounts?.find(acc => acc.name === newHolding.accountType);
      
      if (account && account.type === 'tax-deferred') {
        // Tax-deferred accounts (like RRSP, 401k, Traditional IRA) get treaty rate
        withholdingTax = 15; // US-Canada tax treaty rate for tax-deferred accounts
      } else {
        // Tax-free accounts (TFSA, Roth IRA) and taxable accounts get standard rate
        withholdingTax = 30; // Standard rate
      }
    }

    // Auto-generate next dividend date based on common patterns
    const generateNextDividendDate = (symbol, dividendYield) => {
      if (dividendYield <= 0) return null; // No dividends
      
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Common dividend schedules for major ETFs/stocks
      const dividendSchedules = {
        // Vanguard ETFs - typically quarterly
        'VTI': [2, 5, 8, 11], // March, June, September, December
        'VTF': [2, 5, 8, 11],
        'VEA': [2, 5, 8, 11],
        'VWO': [2, 5, 8, 11],
        'BND': [1, 4, 7, 10], // February, May, August, November
        'VNQ': [2, 5, 8, 11],
        'VYM': [2, 5, 8, 11],
        'VXUS': [2, 5, 8, 11],
        
        // Common monthly dividend REITs
        'O': 'monthly', // Realty Income
        'STAG': 'monthly',
        'WPC': 'monthly',
        
        // iShares ETFs - typically quarterly
        'IVV': [2, 5, 8, 11],
        'EFA': [2, 5, 8, 11],
        'AGG': [1, 4, 7, 10],
        
        // SPDR ETFs
        'SPY': [2, 5, 8, 11],
        'XLF': [2, 5, 8, 11],
        'XLK': [2, 5, 8, 11],
      };
      
      const schedule = dividendSchedules[symbol.toUpperCase()];
      
      if (schedule === 'monthly') {
        // Monthly dividends - typically around the 10th of each month
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        return new Date(nextYear, nextMonth, 10).toISOString().split('T')[0];
      } else if (Array.isArray(schedule)) {
        // Quarterly dividends - find next month in schedule
        const nextPaymentMonth = schedule.find(month => month > currentMonth) || schedule[0];
        const nextYear = nextPaymentMonth > currentMonth ? currentYear : currentYear + 1;
        const day = nextPaymentMonth === 1 ? 28 : 15; // Feb uses 28th, others use 15th
        return new Date(nextYear, nextPaymentMonth, day).toISOString().split('T')[0];
      } else {
        // Generic quarterly schedule for unknown stocks - Mar, Jun, Sep, Dec
        const genericSchedule = [2, 5, 8, 11]; // March, June, September, December
        const nextPaymentMonth = genericSchedule.find(month => month > currentMonth) || genericSchedule[0];
        const nextYear = nextPaymentMonth > currentMonth ? currentYear : currentYear + 1;
        return new Date(nextYear, nextPaymentMonth, 15).toISOString().split('T')[0];
      }
    };

    const holding = {
      id: Date.now(),
      symbol: newHolding.symbol.toUpperCase(),
      name: newHolding.name,
      shares,
      avgCost,
      currentPrice,
      totalValue: shares * currentPrice,
      dividendYield,
      annualDividend: shares * currentPrice * (dividendYield / 100), // This is correct for dividend yield %
      nextDividendDate: generateNextDividendDate(newHolding.symbol, dividendYield),
      dripEnabled: newHolding.dripEnabled,
      dividendAccumulated: 0,
      dripProgress: 0,
      accountType: newHolding.accountType,
      isUSStock: newHolding.isUSStock,
      withholdingTax,
      currency: newHolding.currency,
      category: newHolding.category || 'US Stocks' // Include category for allocation
    };
    
    const updatedHoldings = [...data.investments.holdings, holding];
    const newTotalValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    
    const updatedInvestments = {
      ...data.investments,
      holdings: updatedHoldings,
      totalValue: newTotalValue
    };
    
    const updatedData = { ...data, investments: updatedInvestments };
    
    // Update local state immediately
    setData(updatedData);
    setNewHolding({ 
      symbol: '', name: '', shares: '', avgCost: '', currentPrice: '', dividendYield: '', 
      dripEnabled: true, accountType: data.registeredAccounts?.accounts?.[0]?.name || 'Taxable', isUSStock: false, withholdingTax: 0, currency: 'CAD',
      category: 'US Stocks' // Reset to default category
    });
    setShowAddHolding(false);
    
    // Save to Firebase
    if (userId && db) {
      try {
        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  const handleDeleteHolding = async (holdingId) => {
    const updatedHoldings = data.investments.holdings.filter(h => h.id !== holdingId);
    const newTotalValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    
    const updatedInvestments = {
      ...data.investments,
      holdings: updatedHoldings,
      totalValue: newTotalValue
    };
    
    const updatedData = { ...data, investments: updatedInvestments };
    
    // Update local state immediately
    setData(updatedData);
    
    // Save to Firebase
    if (userId && db) {
      try {
        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  const handleToggleDRIP = async (holdingId) => {
    const updatedHoldings = data.investments.holdings.map(holding => {
      if (holding.id === holdingId) {
        return { ...holding, dripEnabled: !holding.dripEnabled };
      }
      return holding;
    });
    
    const updatedInvestments = { ...data.investments, holdings: updatedHoldings };
    const updatedData = { ...data, investments: updatedInvestments };
    
    // Update local state immediately
    setData(updatedData);
    
    // Save to Firebase
    if (userId && db) {
      try {
        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  const handleEditHolding = async (holding) => {
    const shares = parseFloat(holding.shares);
    const avgCost = parseFloat(holding.avgCost);
    const currentPrice = parseFloat(holding.currentPrice);
    const dividendYield = parseFloat(holding.dividendYield) || 0;
    
    const updatedHolding = {
      ...holding,
      shares,
      avgCost,
      currentPrice,
      totalValue: shares * currentPrice,
      dividendYield,
      annualDividend: shares * currentPrice * (dividendYield / 100) // Correct: yield% * totalValue
    };
    
    const updatedHoldings = data.investments.holdings.map(h => 
      h.id === holding.id ? updatedHolding : h
    );
    
    const newTotalValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    
    const updatedInvestments = {
      ...data.investments,
      holdings: updatedHoldings,
      totalValue: newTotalValue
    };
    
    const updatedData = { ...data, investments: updatedInvestments };
    
    // Update local state immediately
    setData(updatedData);
    setEditingHolding(null);
    
    // Save to Firebase
    if (userId && db) {
      try {
        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
            Total Value
          </h3>
          <p className="text-3xl font-bold text-blue-400">${actualTotalValue.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-2">{data.investments.holdings.length} holdings</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Total Gain/Loss
          </h3>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
          </p>
          <p className={`text-sm mt-2 ${totalGainLossPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
          </p>
        </Card>
        
        <Card style={{ backgroundColor: '#141F3B' }} className="border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Repeat className="w-5 h-5 mr-2 text-cyan-400" />
            Annual Dividends
          </h3>
          <p className="text-2xl font-bold text-cyan-400">
            ${data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / data.investments.totalValue * 100).toFixed(2)}% yield
          </p>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
            DRIP Progress
          </h3>
          <p className="text-2xl font-bold text-amber-400">
            {data.investments.holdings.filter(h => h.dripEnabled).length} Active
          </p>
          <p className="text-sm text-gray-300 mt-2">
            ${data.investments.holdings.reduce((sum, h) => sum + h.dividendAccumulated, 0).toLocaleString()} accumulated
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-blue-400" />
              Portfolio Allocation
            </h3>
            
            {/* Toggle between Ticker and Category views */}
            <div className="flex gap-2 bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setAllocationView('ticker')}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  allocationView === 'ticker' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                By Ticker
              </button>
              <button
                onClick={() => setAllocationView('category')}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  allocationView === 'category' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                By Category
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <svg ref={pieChartRef}></svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {portfolioAllocation.length > 0 ? portfolioAllocation.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-sm text-white font-semibold ml-auto">
                  {item.percentage}%
                </span>
              </div>
            )) : (
              <div className="col-span-2 text-center text-gray-400 py-4">
                Add holdings to see portfolio allocation
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-green-400" />
            Performance History
          </h3>
          <div className="w-full overflow-hidden">
            <svg ref={lineChartRef} className="w-full h-auto"></svg>
          </div>
        </Card>
      </div>

      {/* Enhanced Dividend Tracker */}
              <Card style={{ backgroundColor: '#18212F' }} className="border-amber-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Repeat className="w-6 h-6 mr-3 text-amber-400" />
            💰 Dividend Income Tracker
          </h3>
        
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 text-center border border-amber-500/40">
              <div className="text-2xl font-bold text-amber-300">
                ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 12).toFixed(0)}
              </div>
              <div className="text-sm text-amber-200">Monthly Income</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 text-center border border-amber-500/40">
              <div className="text-2xl font-bold text-amber-300">
                ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 4).toFixed(0)}
              </div>
              <div className="text-sm text-amber-200">Quarterly Income</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 text-center border border-amber-500/40">
              <div className="text-2xl font-bold text-amber-300">
                ${data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0).toFixed(0)}
              </div>
              <div className="text-sm text-amber-200">Annual Income</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 text-center border border-amber-500/40">
              <div className="text-2xl font-bold text-amber-300">
                {(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / actualTotalValue * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-amber-200">Portfolio Yield</div>
            </div>
          </div>
        
        {/* Dividend Calendar & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Upcoming Dividends */}
            <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-lg p-4 border border-amber-500/30">
              <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center">
                📅 Upcoming Dividends
              </h4>
            <div className="space-y-3">
              {data.investments.holdings
                .filter(h => h.nextDividendDate && h.dividendYield > 0)
                .sort((a, b) => new Date(a.nextDividendDate) - new Date(b.nextDividendDate))
                                  .map(holding => (
                    <div key={holding.id} className="flex justify-between items-center bg-amber-800/20 rounded p-2 border border-amber-600/20">
                      <div>
                        <div className="font-semibold text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(holding.nextDividendDate).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-300 font-semibold">
                          ${(holding.annualDividend / 4).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">{holding.dividendYield}% yield</div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
          
          {/* DRIP Status */}
          <div style={{ backgroundColor: '#141F3B' }} className="rounded-lg p-4 border border-blue-500/30">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              🔄 DRIP Status
            </h4>
            <div className="space-y-3">
              {data.investments.holdings
                .filter(h => h.dividendYield > 0)
                .map(holding => (
                  <div key={holding.id} className="flex justify-between items-center bg-blue-800/30 rounded p-2 border border-blue-600/20">
                    <div>
                      <div className="font-semibold text-white">{holding.symbol}</div>
                      <div className="text-xs text-gray-400">
                        ${holding.dividendAccumulated} accumulated
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        holding.dripEnabled ? 'text-cyan-300' : 'text-gray-400'
                      }`}>
                        <Tooltip 
                          text="DRIP (Dividend Reinvestment Plan) automatically uses dividend payments to buy more shares of the same stock, compounding your investment growth over time."
                        >
                          {holding.dripEnabled ? '🔄 DRIP ON' : '💵 CASH'}
                        </Tooltip>
                      </div>
                      {holding.dripEnabled && (
                        <div className="text-xs text-cyan-200">
                          {holding.dripProgress.toFixed(1)}% to next share
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
              {/* Dividend Breakdown by Holding */}
      <div className="mt-6" style={{ backgroundColor: '#141F3B' }}>
        <div className="rounded-lg p-4 border border-blue-500/30">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
          📊 Dividend Breakdown by Holding
        </h4>
          <div className="space-y-2">
            {data.investments.holdings
              .filter(h => h.dividendYield > 0)
              .sort((a, b) => b.annualDividend - a.annualDividend)
              .map(holding => {
                const totalDividends = data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0);
                const percentage = totalDividends > 0 ? (holding.annualDividend / totalDividends * 100) : 0;
                
                                  return (
                    <div key={holding.id} className="flex items-center justify-between bg-blue-800/30 rounded p-3 border border-blue-600/20">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-white">{holding.symbol}</div>
                          <div className="text-xs text-gray-400">{holding.dividendYield}% yield</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${holding.annualDividend.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  );
              })}
          </div>
        </div>
          
                      <div className="mt-4 p-3 bg-purple-800/20 rounded border border-purple-600/30">
              <div className="text-sm text-purple-200 mb-2">
                💡 <strong>Income Strategy:</strong> Your ${data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0).toLocaleString()} annual dividend income provides 
                <span className="font-semibold"> ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 12).toFixed(0)}/month </span>
                in passive income - perfect for travel funding! 🌍
              </div>
              <div className="text-xs text-purple-300 border-t border-purple-600/30 pt-2">
                📅 <strong>Auto-Generated Dates:</strong> Dividend dates are automatically estimated based on common ETF/stock payment schedules. 
                Major ETFs (VTI, SPY) typically pay quarterly (Mar/Jun/Sep/Dec), while REITs like O pay monthly.
              </div>
            </div>
        </div>
      </Card>

      {/* Holdings with DRIP */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Holdings & DRIP Calculator</h3>
          <button
            onClick={() => setShowAddHolding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Holding
          </button>
        </div>
        <div className="space-y-4">
          {data.investments.holdings.length === 0 ? (
            <Card className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 border-violet-500/30">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-violet-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Investments Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Start building your investment portfolio. Track stocks, ETFs, crypto, and dividends all in one place!
                </p>
                <button
                  onClick={() => setShowAddHolding(true)}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Investment
                </button>
              </div>
            </Card>
          ) : (
            data.investments.holdings.map(holding => (
            <div key={holding.id} className="bg-gray-700/30 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                <div className="lg:col-span-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {holding.symbol}
                    {holding.isUSStock && (
                      <span className="text-xs px-1 py-0.5 bg-red-600/20 text-red-400 rounded border border-red-600/30">
                        US
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-400">{holding.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      (() => {
                        // Find the account in user's retirement accounts for dynamic color
                        const account = data.registeredAccounts?.accounts?.find(acc => acc.name === holding.accountType);
                        if (account) {
                          // Use same color logic as retirement accounts modal
                          const accountIndex = data.registeredAccounts.accounts.indexOf(account);
                          const colors = ['green', 'blue', 'orange', 'teal', 'indigo', 'pink'];
                          const color = colors[accountIndex % colors.length];
                          return `bg-${color}-600/20 text-${color}-400 border border-${color}-600/30`;
                        }
                        // Fallback colors for non-retirement accounts
                        if (holding.accountType === 'Taxable') return 'bg-orange-600/20 text-orange-400 border border-orange-600/30';
                        return 'bg-gray-600/20 text-gray-400 border border-gray-600/30';
                      })()
                    }`}>
                      {holding.accountType}
                    </span>
                    {holding.withholdingTax > 0 && (
                      <span className="text-xs text-red-400">
                        {holding.withholdingTax}% Tax
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{holding.shares} shares</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white">${holding.currentPrice.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Current</div>
                  <div className={`text-xs ${holding.currentPrice >= holding.avgCost ? 'text-green-400' : 'text-red-400'}`}>
                    {((holding.currentPrice - holding.avgCost) / holding.avgCost * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white">${holding.totalValue.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Value</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">${holding.annualDividend.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Annual Dividend</div>
                  <div className="text-xs text-cyan-300">{holding.dividendYield}% yield</div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => handleToggleDRIP(holding.id)}
                    className={`px-2 py-1 rounded text-xs font-semibold mb-2 transition-colors ${
                      holding.dripEnabled 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    DRIP {holding.dripEnabled ? 'ON' : 'OFF'}
                  </button>
                  
                  {holding.dripEnabled ? (
                    <div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${holding.dripProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${holding.dividendAccumulated} / ${holding.currentPrice.toFixed(0)} 
                        ({holding.dripProgress.toFixed(1)}%)
                      </div>
                      {holding.nextDividendDate && (
                        <div className="text-xs text-blue-400">
                          Next: {new Date(holding.nextDividendDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      ${holding.dividendAccumulated} cash
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => setEditingHolding(holding)}
                      className="text-gray-400 hover:text-blue-400 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHolding(holding.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </Card>

        {/* Add Holding Modal */}
        {showAddHolding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-blue-500/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Add New Holding</h3>
                <button
                  onClick={() => setShowAddHolding(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Symbol (e.g., AAPL)"
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({...newHolding, symbol: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newHolding.name}
                  onChange={(e) => setNewHolding({...newHolding, name: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Category <span className="text-blue-400">(for allocation grouping)</span>
                  </label>
                  <select
                    value={newHolding.category}
                    onChange={(e) => setNewHolding({...newHolding, category: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="US Stocks">US Stocks</option>
                    <option value="International Stocks">International Stocks</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Real Estate">Real Estate (REITs)</option>
                    <option value="Crypto">Cryptocurrency</option>
                    <option value="Commodities">Commodities</option>
                    <option value="Cash & Equivalents">Cash & Equivalents</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Group similar holdings for category view
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Shares"
                    value={newHolding.shares || ''}
                    onChange={(e) => setNewHolding({...newHolding, shares: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Avg Cost"
                    value={newHolding.avgCost || ''}
                    onChange={(e) => setNewHolding({...newHolding, avgCost: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Current Price"
                    value={newHolding.currentPrice || ''}
                    onChange={(e) => setNewHolding({...newHolding, currentPrice: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Dividend Yield %"
                    value={newHolding.dividendYield || ''}
                    onChange={(e) => setNewHolding({...newHolding, dividendYield: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Account Type</label>
                    <select
                      value={newHolding.accountType}
                      onChange={(e) => setNewHolding({...newHolding, accountType: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {/* Dynamic options from user's retirement accounts */}
                      {data.registeredAccounts?.accounts?.map(account => (
                        <option key={account.id} value={account.name}>
                          {account.name} ({account.type.replace('-', ' ')})
                        </option>
                      ))}
                      {/* Always include taxable option */}
                      <option value="Taxable">Taxable Account</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Currency</label>
                    <select
                      value={newHolding.currency}
                      onChange={(e) => setNewHolding({...newHolding, currency: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newHolding.dripEnabled}
                      onChange={(e) => setNewHolding({...newHolding, dripEnabled: e.target.checked})}
                      className="rounded"
                    />
                    <label className="text-white">Enable DRIP</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newHolding.isUSStock}
                      onChange={(e) => setNewHolding({...newHolding, isUSStock: e.target.checked})}
                      className="rounded"
                    />
                    <label className="text-white">US Stock</label>
                  </div>
                </div>
                
                {newHolding.isUSStock && (
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                    <div className="text-red-400 font-semibold text-sm mb-1">US Stock Tax Notice</div>
                    <div className="text-xs text-gray-300">
                      {(() => {
                        const account = data.registeredAccounts?.accounts?.find(acc => acc.name === newHolding.accountType);
                        if (account && account.type === 'tax-deferred') {
                          return `US withholding tax: 15% (reduced rate for ${newHolding.accountType} - tax-deferred account)`;
                        } else {
                          return `US withholding tax: 30% (standard rate for ${newHolding.accountType || 'this account type'})`;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Auto-Generated Dividend Date Info */}
                {parseFloat(newHolding.dividendYield) > 0 && (
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                    <div className="text-green-400 font-semibold text-sm mb-1">📅 Auto-Generated Dividend Date</div>
                    <div className="text-xs text-gray-300">
                      Next dividend date will be automatically estimated based on common payment schedules for {newHolding.symbol || 'this symbol'}. 
                      Major ETFs typically pay quarterly (Mar/Jun/Sep/Dec), while monthly dividend stocks use the 10th of each month.
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddHolding(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHolding}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Holding
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Holding Modal */}
        {editingHolding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-blue-500/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Edit {editingHolding.symbol}</h3>
                <button
                  onClick={() => setEditingHolding(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={editingHolding.name}
                  onChange={(e) => setEditingHolding({...editingHolding, name: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Shares"
                    value={editingHolding.shares || ''}
                    onChange={(e) => setEditingHolding({...editingHolding, shares: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Avg Cost"
                    value={editingHolding.avgCost || ''}
                    onChange={(e) => setEditingHolding({...editingHolding, avgCost: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Current Price"
                    value={editingHolding.currentPrice || ''}
                    onChange={(e) => setEditingHolding({...editingHolding, currentPrice: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Dividend Yield %"
                    value={editingHolding.dividendYield || ''}
                    onChange={(e) => setEditingHolding({...editingHolding, dividendYield: e.target.value === '' ? '' : e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Account Type</label>
                    <select
                      value={editingHolding.accountType || (data.registeredAccounts?.accounts?.[0]?.name || 'Taxable')}
                      onChange={(e) => setEditingHolding({...editingHolding, accountType: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {/* Dynamic options from user's retirement accounts */}
                      {data.registeredAccounts?.accounts?.map(account => (
                        <option key={account.id} value={account.name}>
                          {account.name} ({account.type.replace('-', ' ')})
                        </option>
                      ))}
                      {/* Always include taxable option */}
                      <option value="Taxable">Taxable Account</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Currency</label>
                    <select
                      value={editingHolding.currency || 'CAD'}
                      onChange={(e) => setEditingHolding({...editingHolding, currency: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingHolding.isUSStock || false}
                    onChange={(e) => setEditingHolding({...editingHolding, isUSStock: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-white">US Stock (affects withholding tax)</label>
                </div>
                
                {editingHolding.isUSStock && (
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                    <div className="text-red-400 font-semibold text-sm mb-1">US Stock Tax Notice</div>
                    <div className="text-xs text-gray-300">
                      {(() => {
                        const account = data.registeredAccounts?.accounts?.find(acc => acc.name === editingHolding.accountType);
                        if (account && account.type === 'tax-deferred') {
                          return `US withholding tax: 15% (reduced rate for ${editingHolding.accountType} - tax-deferred account)`;
                        } else {
                          return `US withholding tax: 30% (standard rate for ${editingHolding.accountType || 'this account type'})`;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setEditingHolding(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditHolding(editingHolding)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

// Transaction Management Component
const TransactionsTab = ({ data, setData, userId }) => {
  const spendingChartRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  
  // 🔍 UPGRADE 2: Advanced Search & Filter System
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(['income', 'expense', 'transfer']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'personal',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly',
    dayOfMonth: 1,
    dayOfWeek: 1,
    monthOfYear: 1
  });

  const subcategoryOptions = {
    personal: {
      income: ['salary', 'bonus', 'investment', 'other'],
      expense: ['housing', 'food', 'transport', 'entertainment', 'healthcare', 'utilities', 'other']
    },
    business: {
      income: ['consulting', 'trading', 'services', 'products', 'other'],
      expense: ['software', 'equipment', 'meals', 'travel', 'marketing', 'other']
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    
    // Auto-categorize if subcategory is empty
    let finalTransaction = { ...newTransaction };
    if (!finalTransaction.subcategory || finalTransaction.subcategory === '') {
      const autoCategory = categorizeExpense(finalTransaction.description);
      finalTransaction.category = autoCategory.category;
      finalTransaction.subcategory = autoCategory.subcategory;
    }
    
    const transaction = {
      id: Date.now(),
      ...finalTransaction,
      amount: finalTransaction.type === 'expense' ? -Math.abs(parseFloat(finalTransaction.amount)) : Math.abs(parseFloat(finalTransaction.amount)),
      isRecurring: false // Regular transaction, not from recurring
    };
    
    let updatedData = { ...data };
    
    // Add the transaction
    const updatedTransactions = [transaction, ...data.transactions];
    updatedData.transactions = updatedTransactions;
    
    // If this is a recurring expense, add it to recurring expenses
    if (finalTransaction.isRecurring) {
      const recurringExpense = {
        id: Date.now() + 1, // Different ID from transaction
        description: finalTransaction.description,
        amount: parseFloat(finalTransaction.amount),
        type: finalTransaction.type,
        category: finalTransaction.category,
        subcategory: finalTransaction.subcategory,
        frequency: finalTransaction.frequency,
        dayOfMonth: finalTransaction.dayOfMonth,
        dayOfWeek: finalTransaction.dayOfWeek,
        monthOfYear: finalTransaction.monthOfYear,
        isActive: true,
        nextDueDate: calculateNextDueDate(
          finalTransaction.frequency,
          finalTransaction.dayOfMonth,
          finalTransaction.dayOfWeek,
          finalTransaction.monthOfYear,
          finalTransaction.date
        ),
        lastProcessed: finalTransaction.date,
        createdDate: finalTransaction.date,
        tags: ['user-created']
      };
      
      const updatedRecurringExpenses = [...(data.recurringExpenses || []), recurringExpense];
      updatedData.recurringExpenses = updatedRecurringExpenses;
    }
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'personal',
        subcategory: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
        dayOfMonth: 1,
        dayOfWeek: 1,
        monthOfYear: 1
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleEditTransaction = async (transaction) => {
    const updatedTransactions = data.transactions.map(t => 
      t.id === transaction.id ? {
        ...transaction,
        amount: transaction.type === 'expense' ? -Math.abs(parseFloat(transaction.amount)) : Math.abs(parseFloat(transaction.amount))
      } : t
    );
    const updatedData = { ...data, transactions: updatedTransactions };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const updatedTransactions = data.transactions.filter(t => t.id !== transactionId);
    const updatedData = { ...data, transactions: updatedTransactions };
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // 🔍 UPGRADE 2: Advanced Filtering Logic with Search
  const filteredTransactions = data.transactions
    // Keyword search (description)
    .filter(t => {
      if (!searchKeyword) return true;
      return t.description.toLowerCase().includes(searchKeyword.toLowerCase());
    })
    // Type filter (multiple selection)
    .filter(t => {
      if (selectedTypes.length === 0 || selectedTypes.length === 3) return true; // All types selected
      const transactionType = t.amount > 0 ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense');
      return selectedTypes.includes(transactionType);
    })
    // Category filter (multiple selection)
    .filter(t => {
      if (selectedCategories.length === 0) return true;
      return selectedCategories.includes(t.subcategory) || selectedCategories.includes(t.category);
    })
    // Date range filter
    .filter(t => {
      if (!dateRange.start && !dateRange.end) return true;
      const transactionDate = new Date(t.date);
      if (dateRange.start && new Date(dateRange.start) > transactionDate) return false;
      if (dateRange.end && new Date(dateRange.end) < transactionDate) return false;
      return true;
    })
    // Sorting
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortBy === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date); // Legacy support
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount); // Legacy support
      return new Date(b.date) - new Date(a.date); // default
    });

  // 📊 UPGRADE 1: Calculate Spending by Category (Current Month)
  const calculateSpendingByCategory = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter expenses for current month only
    const currentMonthExpenses = data.transactions.filter(t => {
      if (t.amount >= 0) return false; // Only expenses
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    if (currentMonthExpenses.length === 0) return [];
    
    // Group by subcategory
    const categoryTotals = {};
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
    
    currentMonthExpenses.forEach(t => {
      const category = t.subcategory || t.category || 'Other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(t.amount);
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    // Create array with percentages
    const spendingData = Object.entries(categoryTotals).map(([category, amount], index) => ({
      category,
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1),
      percentageNum: (amount / totalExpenses) * 100,
      color: colors[index % colors.length]
    }));
    
    return spendingData.sort((a, b) => b.amount - a.amount);
  };
  
  const spendingByCategory = calculateSpendingByCategory();

  const totalIncome = data.transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = data.transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const personalIncome = data.transactions
    .filter(t => t.amount > 0 && t.category === 'personal')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const businessIncome = data.transactions
    .filter(t => t.amount > 0 && t.category === 'business')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const personalExpenses = data.transactions
    .filter(t => t.amount < 0 && t.category === 'personal')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const businessExpenses = data.transactions
    .filter(t => t.amount < 0 && t.category === 'business')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // 📊 UPGRADE 1: D3.js Donut Chart for Spending by Category (Mobile Optimized)
  useEffect(() => {
    if (spendingChartRef.current && spendingByCategory && spendingByCategory.length > 0) {
      const svg = d3.select(spendingChartRef.current);
      svg.selectAll("*").remove();
      
      // 📱 Mobile-responsive sizing
      const isMobile = window.innerWidth <= 768;
      const width = isMobile ? Math.min(window.innerWidth - 40, 280) : 300;
      const height = isMobile ? Math.min(window.innerWidth - 40, 280) : 300;
      const radius = Math.min(width, height) / 2;
      
      const color = d3.scaleOrdinal()
        .domain(spendingByCategory.map(d => d.category))
        .range(spendingByCategory.map(d => d.color));
      
      const pie = d3.pie()
        .value(d => d.amount)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(60)
        .outerRadius(radius);
      
      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
      
      const arcs = g.selectAll(".arc")
        .data(pie(spendingByCategory))
        .enter().append("g")
        .attr("class", "arc");
      
      // Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
      
      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category))
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.data.category}</strong><br/>$${d.data.amount.toLocaleString()}`);
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          tooltip.style("visibility", "hidden");
        });
      
      arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", isMobile ? "10px" : "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text(d => `${d.data.percentage}%`);
      
      // Cleanup tooltip on unmount
      return () => {
        tooltip.remove();
      };
    }
  }, [spendingByCategory]);

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ArrowUp className="w-5 h-5 mr-2 text-green-400" />
            Total Income
          </h3>
          <p className="text-2xl font-bold text-green-400">${totalIncome.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-300">
            <div>Personal: ${personalIncome.toLocaleString()}</div>
            <div>Business: ${businessIncome.toLocaleString()}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/40 to-rose-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ArrowDown className="w-5 h-5 mr-2 text-red-400" />
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-400">${totalExpenses.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-300">
            <div>Personal: ${personalExpenses.toLocaleString()}</div>
            <div>Business: ${businessExpenses.toLocaleString()}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Net Flow
          </h3>
          <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </p>
          <div className="mt-2 text-sm text-gray-300">
            {data.transactions.length} transactions
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
            Avg Transaction
          </h3>
          <p className="text-2xl font-bold text-purple-400">
            ${data.transactions.length > 0 ? Math.abs(data.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / data.transactions.length).toLocaleString() : '0'}
          </p>
          <div className="mt-2 text-sm text-gray-300">
            Last 30 days
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <CreditCard className="w-6 h-6 mr-3 text-blue-400" />
              Transaction Management
            </h2>
            <p className="text-gray-400">Track all your personal and business transactions</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="description">Sort by Description</option>
          </select>
          
          <button
            onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors ${
              showTransactionHistory ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showTransactionHistory ? 'Hide History' : 'Monthly History'}
          </button>
        </div>
      </Card>

      {/* Transaction History by Month */}
      {showTransactionHistory && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-purple-400" />
            Transaction History by Month
          </h3>
          <div className="space-y-4">
            {Object.entries(
              data.transactions.reduce((acc, transaction) => {
                const month = transaction.date.substring(0, 7); // YYYY-MM
                if (!acc[month]) acc[month] = [];
                acc[month].push(transaction);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, transactions]) => {
                const monthIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
                const monthExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const monthNet = monthIncome - monthExpenses;
                
                return (
                  <div key={month} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-white">
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">Income: ${monthIncome.toLocaleString()}</span>
                        <span className="text-red-400">Expenses: ${monthExpenses.toLocaleString()}</span>
                        <span className={`font-semibold ${monthNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          Net: ${monthNet.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {transactions.slice(0, 6).map(transaction => (
                        <div key={transaction.id} className="flex justify-between items-center bg-gray-600/30 rounded p-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-gray-300">{transaction.description}</span>
                          </div>
                          <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {transactions.length > 6 && (
                        <div className="text-center text-gray-400 text-xs col-span-2">
                          +{transactions.length - 6} more transactions
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Add Transaction Form */}
      {showAddForm && (
        <Card className="border-blue-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Add New Transaction</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Description (e.g., Netflix, Rent, Groceries)"
                value={newTransaction.description}
                onChange={(e) => {
                  const newDesc = e.target.value;
                  setNewTransaction({...newTransaction, description: newDesc});
                  
                  // Auto-suggest category as user types
                  if (newDesc && !newTransaction.subcategory) {
                    const autoCategory = categorizeExpense(newDesc);
                    setNewTransaction(prev => ({
                      ...prev, 
                      description: newDesc,
                      category: autoCategory.category,
                      subcategory: autoCategory.subcategory
                    }));
                  }
                }}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount || ''}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value === '' ? '' : e.target.value})}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value, subcategory: ''})}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="expense">💸 Expense</option>
                <option value="income">💰 Income</option>
              </select>
              
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value, subcategory: ''})}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="personal">👤 Personal</option>
                <option value="business">🏢 Business</option>
              </select>
              
              <select
                value={newTransaction.subcategory}
                onChange={(e) => setNewTransaction({...newTransaction, subcategory: e.target.value})}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="">🤖 Auto-categorize</option>
                {subcategoryOptions[newTransaction.category]?.[newTransaction.type]?.map(sub => (
                  <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 🔄 Recurring Expense Section */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTransaction.isRecurring}
                    onChange={(e) => setNewTransaction({...newTransaction, isRecurring: e.target.checked})}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white font-semibold">🔄 Make this a recurring {newTransaction.type}</span>
                </label>
              </div>
              
              {newTransaction.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <select
                    value={newTransaction.frequency}
                    onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="weekly">📅 Weekly</option>
                    <option value="monthly">🗓️ Monthly</option>
                    <option value="yearly">📆 Yearly</option>
                  </select>
                  
                  {newTransaction.frequency === 'weekly' && (
                    <select
                      value={newTransaction.dayOfWeek}
                      onChange={(e) => setNewTransaction({...newTransaction, dayOfWeek: parseInt(e.target.value)})}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  )}
                  
                  {newTransaction.frequency === 'monthly' && (
                    <select
                      value={newTransaction.dayOfMonth}
                      onChange={(e) => setNewTransaction({...newTransaction, dayOfMonth: parseInt(e.target.value)})}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      {Array.from({length: 31}, (_, i) => (
                        <option key={i+1} value={i+1}>Day {i+1}</option>
                      ))}
                    </select>
                  )}
                  
                  {newTransaction.frequency === 'yearly' && (
                    <>
                      <select
                        value={newTransaction.monthOfYear}
                        onChange={(e) => setNewTransaction({...newTransaction, monthOfYear: parseInt(e.target.value)})}
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      >
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </select>
                      <select
                        value={newTransaction.dayOfMonth}
                        onChange={(e) => setNewTransaction({...newTransaction, dayOfMonth: parseInt(e.target.value)})}
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      >
                        {Array.from({length: 31}, (_, i) => (
                          <option key={i+1} value={i+1}>Day {i+1}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}
              
              {newTransaction.isRecurring && (
                <div className="mt-3 p-3 bg-blue-800/20 rounded-lg text-sm text-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Repeat className="w-4 h-4" />
                    <span className="font-semibold">Automation Preview:</span>
                  </div>
                  <div>
                    This {newTransaction.type} will automatically be added every{' '}
                    {newTransaction.frequency === 'weekly' && `week on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][newTransaction.dayOfWeek]}`}
                    {newTransaction.frequency === 'monthly' && `month on day ${newTransaction.dayOfMonth}`}
                    {newTransaction.frequency === 'yearly' && `year on ${['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][newTransaction.monthOfYear]} ${newTransaction.dayOfMonth}`}
                    . You can manage all recurring {newTransaction.type}s in the Transactions tab.
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTransaction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </Card>
      )}

      {/* 📊 UPGRADE 1: Spending by Category Visualization (Mobile Optimized) */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-blue-500/30">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <PieChart className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-400" />
            💰 Spending by Category
          </div>
          <span className="text-xs md:text-sm text-gray-400 font-normal">(This Month)</span>
        </h3>
        
        {spendingByCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart - Centered on mobile */}
            <div className="flex justify-center items-center py-4 md:py-0">
              <svg ref={spendingChartRef}></svg>
            </div>
            
            {/* Legend - Mobile optimized with larger tap targets */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 px-1">Category Breakdown</h4>
              {spendingByCategory.map(item => (
                <div key={item.category} className="flex items-center justify-between p-3 md:p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors min-h-[3rem] md:min-h-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm md:text-sm text-gray-200 capitalize">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-sm font-semibold text-white">${item.amount.toLocaleString()}</span>
                    <span className="text-sm text-blue-400 font-semibold min-w-[3rem] text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Total Spending This Month:</span>
                  <span className="text-lg font-bold text-red-400">
                    ${spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg font-semibold">
              Log your first expense to see your spending analysis
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Track where your money goes each month with visual insights
            </p>
          </div>
        )}
      </Card>

      {/* Recurring Expenses Management */}
      {data.recurringExpenses && data.recurringExpenses.length > 0 && (
        <Card className="border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Repeat className="w-6 h-6 text-purple-400" />
                Recurring {data.recurringExpenses.filter(r => r.type === 'expense').length > 0 ? 'Expenses' : 'Income'} 
                ({data.recurringExpenses.filter(r => r.isActive).length} active)
              </h3>
              <p className="text-gray-400">Automatically processed transactions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recurringExpenses.map(recurring => (
              <div key={recurring.id} className={`p-4 rounded-lg border-2 ${
                recurring.isActive 
                  ? 'bg-purple-900/20 border-purple-500/30' 
                  : 'bg-gray-800/50 border-gray-600/30'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{recurring.description}</h4>
                    <p className={`text-lg font-bold ${
                      recurring.type === 'expense' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {recurring.type === 'expense' ? '-' : '+'}${recurring.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    recurring.isActive 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {recurring.isActive ? 'Active' : 'Paused'}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="capitalize">{recurring.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due:</span>
                    <span className="text-purple-300">{new Date(recurring.nextDueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="capitalize">{recurring.subcategory}</span>
                  </div>
                </div>
                
                {recurring.tags && recurring.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {recurring.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => setEditingRecurring(recurring)}
                    className="flex-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={async () => {
                      const updatedRecurring = data.recurringExpenses.map(r => 
                        r.id === recurring.id ? { ...r, isActive: !r.isActive } : r
                      );
                      const updatedData = { ...data, recurringExpenses: updatedRecurring };
                      try {
                        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
                        setData(updatedData);
                      } catch (error) {
                        console.error('Error updating recurring expense:', error);
                      }
                    }}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      recurring.isActive
                        ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}
                  >
                    {recurring.isActive ? 'Pause' : 'Resume'}
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this recurring expense?')) return;
                      const updatedRecurring = data.recurringExpenses.filter(r => r.id !== recurring.id);
                      const updatedData = { ...data, recurringExpenses: updatedRecurring };
                      try {
                        await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
                        setData(updatedData);
                      } catch (error) {
                        console.error('Error deleting recurring expense:', error);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ✏️ EDIT RECURRING EXPENSE MODAL */}
      {editingRecurring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-purple-500/30">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-400" />
                Edit Recurring Expense
              </h3>
              <button
                onClick={() => setEditingRecurring(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Netflix Subscription"
                  value={editingRecurring.description || ''}
                  onChange={(e) => setEditingRecurring({...editingRecurring, description: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={editingRecurring.amount || ''}
                    onChange={(e) => setEditingRecurring({...editingRecurring, amount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={editingRecurring.type || 'expense'}
                    onChange={(e) => setEditingRecurring({...editingRecurring, type: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={editingRecurring.frequency || 'monthly'}
                  onChange={(e) => setEditingRecurring({...editingRecurring, frequency: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editingRecurring.category || 'personal'}
                    onChange={(e) => setEditingRecurring({...editingRecurring, category: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., entertainment"
                    value={editingRecurring.subcategory || ''}
                    onChange={(e) => setEditingRecurring({...editingRecurring, subcategory: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Next Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={editingRecurring.nextDueDate || ''}
                  onChange={(e) => setEditingRecurring({...editingRecurring, nextDueDate: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingRecurring.isActive || false}
                  onChange={(e) => setEditingRecurring({...editingRecurring, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-600"
                />
                <label htmlFor="edit-active" className="text-sm text-gray-300">
                  Active (will process automatically)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingRecurring(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRecurringExpense}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 UPGRADE 2: Advanced Search & Filter System (Mobile Optimized) */}
      <Card className="bg-gradient-to-br from-slate-900/40 to-gray-900/40">
        <div className="space-y-4">
          {/* Search Bar & Filters Button - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Keyword Search - Large tap target on mobile */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search transactions..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-4 py-4 md:py-3 pl-12 md:pl-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-base md:text-sm"
              />
              <div className="absolute left-3 md:left-3 top-4 md:top-3.5 text-gray-400 text-lg md:text-base">
                🔍
              </div>
            </div>
            
            {/* Advanced Filters Button - Extra large on mobile */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-6 py-4 md:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[3rem] md:min-h-0 ${
                showAdvancedFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
              }`}
            >
              <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-base md:text-sm">Filters</span>
              {(selectedCategories.length > 0 || dateRange.start || dateRange.end || selectedTypes.length < 3) && (
                <span className="bg-blue-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {[
                    selectedCategories.length > 0 ? 1 : 0,
                    dateRange.start || dateRange.end ? 1 : 0,
                    selectedTypes.length < 3 ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            
            {/* Reset Filters - Large tap target on mobile */}
            {(searchKeyword || selectedCategories.length > 0 || dateRange.start || dateRange.end || selectedTypes.length < 3) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCategories([]);
                  setSelectedTypes(['income', 'expense', 'transfer']);
                  setDateRange({ start: '', end: '' });
                  setSortBy('date-desc');
                }}
                className="px-5 py-4 md:px-4 md:py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 active:bg-red-600/40 rounded-lg font-semibold transition-colors min-h-[3rem] md:min-h-0 text-base md:text-sm"
              >
                Reset
              </button>
            )}
          </div>
          
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Transaction Type</label>
                  <div className="space-y-2">
                    {['income', 'expense', 'transfer'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-200 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Category Filter - Mobile friendly */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 md:mb-2">Category</label>
                  <select
                    multiple
                    value={selectedCategories}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedCategories(selected);
                    }}
                    className="w-full bg-gray-700 text-white px-4 py-3 md:px-3 md:py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-base md:text-sm"
                    size="3"
                  >
                    <option value="housing">Housing</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="utilities">Utilities</option>
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2 md:mt-1">Hold Ctrl/Cmd for multiple</p>
                </div>
                
                {/* Date Range Filter - Large tap targets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 md:mb-2">Date Range</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 md:px-3 md:py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-3 md:mb-2 text-base md:text-sm"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 md:px-3 md:py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-base md:text-sm"
                    placeholder="End Date"
                  />
                </div>
                
                {/* Sort By - Large tap target */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 md:mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 md:px-3 md:py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-base md:text-sm"
                  >
                    <option value="date-desc">📅 Date (Newest First)</option>
                    <option value="date-asc">📅 Date (Oldest First)</option>
                    <option value="amount-desc">💰 Amount (High to Low)</option>
                    <option value="amount-asc">💰 Amount (Low to High)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction List */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
          <span>Recent Transactions ({filteredTransactions.length})</span>
          {(searchKeyword || selectedCategories.length > 0 || dateRange.start || dateRange.end || selectedTypes.length < 3) && (
            <span className="text-sm text-blue-400 font-normal">
              {[
                searchKeyword ? 1 : 0,
                selectedCategories.length > 0 ? 1 : 0,
                dateRange.start || dateRange.end ? 1 : 0,
                selectedTypes.length < 3 ? 1 : 0
              ].reduce((a, b) => a + b, 0)} Filter{[searchKeyword, selectedCategories.length > 0, dateRange.start || dateRange.end, selectedTypes.length < 3].filter(Boolean).length !== 1 ? 's' : ''} Active
            </span>
          )}
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold text-white">{transaction.description}</h4>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()} • 
                      <span className={`ml-1 ${transaction.category === 'business' ? 'text-blue-400' : 'text-green-400'}`}>
                        {transaction.category}
                      </span>
                      {transaction.subcategory && ` • ${transaction.subcategory}`}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-lg font-bold ${
                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-gray-400 hover:text-blue-400 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No transactions found matching your filters.
            </div>
          )}
        </div>
      </Card>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-blue-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Transaction</h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={editingTransaction.description}
                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={Math.abs(editingTransaction.amount) || ''}
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value === '' ? '' : e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <select
                value={editingTransaction.type}
                onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              
              <select
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
              
              <input
                type="date"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingTransaction(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditTransaction(editingTransaction)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Travel Tab Component with Trip Budgeting
const TravelTab = ({ data, setData, userId }) => {
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showRunwayModal, setShowRunwayModal] = useState(false);
  const [runwaySettings, setRunwaySettings] = useState({
    totalSavings: data.travel?.totalSavings || 0,
    homeCurrency: data.travel?.homeCurrency || 'CAD',
    tripPlan: data.travel?.tripPlan || {
      cheap: 90,      // 3 months cheap travel
      moderate: 30,   // 1 month moderate  
      expensive: 15   // 2 weeks expensive
    }
  });
  
  const [newTrip, setNewTrip] = useState({
    name: '',
    description: '',
    targetBudget: '',
    startDate: '',
    endDate: '',
    estimatedDailySpend: '',
    countries: [],
    countryInput: ''
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    currency: data.travel?.homeCurrency || 'CAD',
    category: 'other',
    date: new Date().toISOString().split('T')[0]
  });

  // Enhanced Travel Runway Calculation with Destination Tiers
  const calculateRunway = () => {
    const totalFunds = data.travel?.totalSavings || 0;
    
    // Cost tiers for different destination types
    const costTiers = {
      cheap: 40,      // $40/day - Southeast Asia, Central America, Eastern Europe, India
      moderate: 90,   // $90/day - South America, Southern Europe, parts of Asia, Mexico  
      expensive: 160  // $160/day - Western Europe, Scandinavia, Australia, Japan, North America
    };
    
    // Get planned trips from user settings or defaults
    const tripPlan = data.travel?.tripPlan || {
      cheap: 90,      // 3 months cheap travel
      moderate: 30,   // 1 month moderate  
      expensive: 15   // 2 weeks expensive
    };
    
    // Calculate costs for planned trips
    const plannedCosts = {
      cheap: tripPlan.cheap * costTiers.cheap,
      moderate: tripPlan.moderate * costTiers.moderate,
      expensive: tripPlan.expensive * costTiers.expensive
    };
    
    const totalPlannedCost = plannedCosts.cheap + plannedCosts.moderate + plannedCosts.expensive;
    const totalPlannedDays = tripPlan.cheap + tripPlan.moderate + tripPlan.expensive;
    const remainingFunds = Math.max(0, totalFunds - totalPlannedCost);
    
    // Calculate how much longer they can extend with remaining funds (assume cheap travel)
    const extensionDays = Math.floor(remainingFunds / costTiers.cheap);
    const totalPossibleDays = totalPlannedDays + extensionDays;
    
    return { 
      totalFunds,
      costTiers,
      tripPlan,
      plannedCosts,
      totalPlannedCost,
      totalPlannedDays,
      remainingFunds,
      extensionDays,
      totalPossibleDays,
      weeksRemaining: Math.floor(totalPossibleDays / 7),
      monthsRemaining: Math.floor(totalPossibleDays / 30)
    };
  };

  const convertCurrency = (amount, fromCurrency, toCurrency = data.travel?.homeCurrency || 'CAD') => {
    if (fromCurrency === toCurrency) return amount;
    
    // Updated exchange rates (realistic as of 2024)
    const globalRates = {
      'USD': { 'CAD': 1.35, 'EUR': 0.92, 'GBP': 0.79, 'THB': 36.0, 'COP': 4100 },
      'CAD': { 'USD': 0.74, 'EUR': 0.68, 'GBP': 0.59, 'THB': 27.0, 'COP': 3050 },
      'EUR': { 'USD': 1.09, 'CAD': 1.47, 'GBP': 0.86, 'THB': 39.5, 'COP': 4450 },
      'GBP': { 'USD': 1.27, 'CAD': 1.70, 'EUR': 1.16, 'THB': 46.0, 'COP': 5200 },
      'THB': { 'USD': 0.028, 'CAD': 0.037, 'EUR': 0.025, 'GBP': 0.022, 'COP': 113 },
      'COP': { 'USD': 0.00024, 'CAD': 0.00033, 'EUR': 0.00022, 'GBP': 0.00019, 'THB': 0.0088 }
    };
    
    // Direct conversion using global rate matrix
    if (globalRates[fromCurrency] && globalRates[fromCurrency][toCurrency]) {
      return amount * globalRates[fromCurrency][toCurrency];
    }
    
        // Fallback to 1:1 if rates not found
    return amount;
  };

  const handleSaveRunwaySettings = async () => {
    try {
      const updatedData = {
        ...data,
        travel: {
          ...data.travel,
          totalSavings: Number(runwaySettings.totalSavings),
          homeCurrency: runwaySettings.homeCurrency,
          tripPlan: runwaySettings.tripPlan
        }
      };
        
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setShowRunwayModal(false);
      
      // Force viewport cleanup after modal close
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.height = '';
      }, 100);
    } catch (error) {
      console.error('Error saving runway settings:', error);
    }
  };

   const handleAddExpense = async () => {
     if (!newExpense.description || !newExpense.amount || !selectedTrip) return;

     const amount = parseFloat(newExpense.amount);
     if (isNaN(amount) || amount <= 0) return;

     const expense = {
       id: Date.now(),
       ...newExpense,
       amount,
       tripId: selectedTrip.id
     };

     const updatedTrips = data.travel.trips.map(trip => {
       if (trip.id === selectedTrip.id) {
         return {
           ...trip,
           expenses: [...(trip.expenses || []), expense]
         };
       }
       return trip;
     });

     // Convert currency if needed for main transaction
     const amountInHomeCurrency = expense.currency !== (data.travel?.homeCurrency || 'CAD') 
       ? convertCurrency(expense.amount, expense.currency, data.travel?.homeCurrency || 'CAD')
       : expense.amount;

     // Add to main transactions for dashboard consistency
     const mainTransaction = {
       id: Date.now() + 1, // Ensure unique ID
       description: `${selectedTrip.name}: ${expense.description}`,
       amount: -Math.abs(amountInHomeCurrency), // Negative for expense
       type: 'expense',
       category: 'Travel',
       subcategory: expense.category || 'other',
       date: expense.date,
       linkedToTravel: true,
       tripId: selectedTrip.id
     };

     const updatedTravel = { ...data.travel, trips: updatedTrips };
     const updatedTransactions = [mainTransaction, ...data.transactions];
     const updatedData = { 
       ...data, 
       travel: updatedTravel,
       transactions: updatedTransactions
     };

     try {
       await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
       setData(updatedData);
       setNewExpense({
         description: '',
         amount: '',
         currency: data.travel?.homeCurrency || 'CAD',
         category: 'other',
         date: new Date().toISOString().split('T')[0]
       });
       setShowExpenseModal(false);
       setSelectedTrip(null);
       
       // Force viewport cleanup after modal close
       setTimeout(() => {
         window.scrollTo(0, 0);
         document.body.style.overflow = '';
         document.body.style.position = '';
         document.body.style.height = '';
       }, 100);
     } catch (error) {
       console.error('Error adding expense:', error);
     }
   };

   const handleEditTrip = async () => {
     if (!editingTrip || !editingTrip.name || !editingTrip.targetBudget) return;

     const updatedTrips = data.travel.trips.map(trip => {
       if (trip.id === editingTrip.id) {
         return {
           ...trip,
           ...editingTrip,
           targetBudget: Number(editingTrip.targetBudget),
           estimatedDailySpend: Number(editingTrip.estimatedDailySpend),
           countries: editingTrip.countries.filter(c => c.trim())
         };
       }
       return trip;
     });

     const updatedTravel = { ...data.travel, trips: updatedTrips };
     const updatedData = { ...data, travel: updatedTravel };

     try {
       await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
       setData(updatedData);
       setEditingTrip(null);
       
       // Force viewport cleanup after modal close
       setTimeout(() => {
         window.scrollTo(0, 0);
         document.body.style.overflow = '';
         document.body.style.position = '';
         document.body.style.height = '';
       }, 100);
     } catch (error) {
       console.error('Error editing trip:', error);
     }
   };

  const handleAddTrip = async () => {
   if (!newTrip.name || !newTrip.targetBudget) return;

   const trip = {
     id: Date.now(),
     ...newTrip,
     targetBudget: Number(newTrip.targetBudget),
     estimatedDailySpend: Number(newTrip.estimatedDailySpend),
     currentSavings: 0,
     status: 'saving',
     expenses: [],
     countries: newTrip.countries.filter(c => c.trim())
   };

   const updatedTrips = [...(data.travel?.trips || []), trip];
   const updatedTravel = { ...data.travel, trips: updatedTrips };
   const updatedData = { ...data, travel: updatedTravel };

   try {
     await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
     setData(updatedData);
     setNewTrip({ name: '', description: '', targetBudget: '', startDate: '', endDate: '', estimatedDailySpend: '', countries: [], countryInput: '' });
     setShowAddTrip(false);
     
     // Force viewport cleanup after modal close
     setTimeout(() => {
       window.scrollTo(0, 0);
       document.body.style.overflow = '';
       document.body.style.position = '';
       document.body.style.height = '';
     }, 100);
   } catch (error) {
     console.error('Error adding trip:', error);
   }
 };

 // 🗑️ DELETE TRIP HANDLER
 const handleDeleteTrip = async (tripId) => {
   if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
     return;
   }

   const updatedTrips = (data.travel?.trips || []).filter(trip => trip.id !== tripId);
   const updatedTravel = { ...data.travel, trips: updatedTrips };
   const updatedData = { ...data, travel: updatedTravel };

   try {
     await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
     setData(updatedData);
   } catch (error) {
     console.error('Error deleting trip:', error);
   }
 };

 // ✏️ EDIT RECURRING EXPENSE HANDLER
 const handleEditRecurringExpense = async () => {
   if (!editingRecurring) return;

   const updatedRecurring = data.recurringExpenses.map(r =>
     r.id === editingRecurring.id ? editingRecurring : r
   );
   const updatedData = { ...data, recurringExpenses: updatedRecurring };

   try {
     await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
     setData(updatedData);
     setEditingRecurring(null);
     showNotification('Recurring expense updated successfully!', 'success');
   } catch (error) {
     console.error('Error updating recurring expense:', error);
     showNotification('Error updating recurring expense', 'error');
   }
 };

 // 🗑️ DELETE EXPENSE FROM TRIP HANDLER
 const handleDeleteExpense = async (tripId, expenseId) => {
   if (!window.confirm('Delete this expense?')) {
     return;
   }

   const updatedTrips = (data.travel?.trips || []).map(trip => {
     if (trip.id === tripId) {
       return {
         ...trip,
         expenses: trip.expenses.filter(exp => exp.id !== expenseId)
       };
     }
     return trip;
   });

   const updatedTravel = { ...data.travel, trips: updatedTrips };
   const updatedData = { ...data, travel: updatedTravel };

   try {
     await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
     setData(updatedData);
   } catch (error) {
     console.error('Error deleting expense:', error);
   }
 };

  const runway = calculateRunway();

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Travel Runway Calculator - Hero Section */}
      <Card style={{ backgroundColor: '#18212F' }} className="border-slate-500/30 relative">
        <button
          onClick={() => setShowRunwayModal(true)}
          className="absolute top-4 right-4 p-2 bg-slate-700/20 hover:bg-slate-600/30 rounded-lg transition-colors border border-slate-500/30"
          title="Edit Travel Runway Settings"
        >
          <Edit className="w-4 h-4 text-slate-300" />
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🌍 Travel Runway Calculator</h2>
          <p className="text-slate-300 mb-6">Smart destination-based travel planning with cost tiers</p>
          
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-4 border border-slate-500/40">
              <div className="text-3xl font-bold text-slate-200">{runway.totalPossibleDays}</div>
              <div className="text-slate-300">Total Possible Days</div>
            </div>
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-4 border border-slate-500/40">
              <div className="text-3xl font-bold text-slate-200">{runway.weeksRemaining}</div>
              <div className="text-slate-300">Weeks of Travel</div>
            </div>
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-4 border border-slate-500/40">
              <div className="text-3xl font-bold text-slate-200">{runway.monthsRemaining}</div>
              <div className="text-slate-300">Months of Travel</div>
            </div>
          </div>

          {/* Destination Cost Breakdown */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-4 mb-6 border border-slate-500/40">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">🎯 Your Travel Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-lg p-3 border border-emerald-500/40">
                <div className="text-emerald-300 font-semibold">🟢 Cheap Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.cheap} days</div>
                <div className="text-emerald-300">${runway.costTiers.cheap}/day</div>
                <div className="text-emerald-200">Total: ${runway.plannedCosts.cheap.toLocaleString()}</div>
                <div className="text-xs text-emerald-300 mt-1">Southeast Asia, Eastern Europe, India</div>
              </div>
              <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 border border-amber-500/40">
                <div className="text-amber-300 font-semibold">🟡 Moderate Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.moderate} days</div>
                <div className="text-amber-300">${runway.costTiers.moderate}/day</div>
                <div className="text-amber-200">Total: ${runway.plannedCosts.moderate.toLocaleString()}</div>
                <div className="text-xs text-amber-300 mt-1">South America, Southern Europe</div>
              </div>
              <div className="bg-gradient-to-br from-rose-600/20 to-pink-600/20 rounded-lg p-3 border border-rose-500/40">
                <div className="text-rose-300 font-semibold">🔴 Expensive Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.expensive} days</div>
                <div className="text-rose-300">${runway.costTiers.expensive}/day</div>
                <div className="text-rose-200">Total: ${runway.plannedCosts.expensive.toLocaleString()}</div>
                <div className="text-xs text-rose-300 mt-1">Western Europe, Scandinavia, Japan</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-3 border border-slate-500/40">
              <div className="text-slate-300">Total Travel Funds</div>
              <div className="text-xl font-bold text-white">${runway.totalFunds.toLocaleString()} {data.travel?.homeCurrency || 'CAD'}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-3 border border-slate-500/40">
              <div className="text-slate-300">Planned Trip Cost</div>
              <div className="text-xl font-bold text-white">${runway.totalPlannedCost.toLocaleString()}</div>
              <div className="text-xs text-slate-400">{runway.totalPlannedDays} days planned</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-lg p-3 border border-emerald-500/30">
              <div className="text-emerald-200">Remaining Funds</div>
              <div className="text-xl font-bold text-emerald-400">${runway.remainingFunds.toLocaleString()}</div>
              <div className="text-xs text-emerald-300">+{runway.extensionDays} days possible</div>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 text-center">
            💡 Extend your journey by choosing cheaper destinations with remaining funds
          </div>
        </div>
      </Card>

      {/* 🗺️ OPERATOR'S WORLD MAP - Epic Interactive Visualization */}
      {(() => {
        // 🌍 COUNTRY NAME MAPPING - Maps user input to GeoJSON country names
        const normalizeCountryName = (userInput) => {
          const input = userInput.trim().toLowerCase();
          
          // Common aliases and mappings to official GeoJSON names
          const countryAliases = {
            'usa': 'united states of america',
            'us': 'united states of america',
            'united states': 'united states of america',
            'america': 'united states of america',
            'uk': 'united kingdom',
            'england': 'united kingdom',
            'britain': 'united kingdom',
            'great britain': 'united kingdom',
            'uae': 'united arab emirates',
            'emirates': 'united arab emirates',
            'south korea': 'republic of korea',
            'korea': 'republic of korea',
            'north korea': "democratic people's republic of korea",
            'vietnam': 'viet nam',
            'laos': "lao people's democratic republic",
            'czech republic': 'czechia',
            'holland': 'netherlands',
            'burma': 'myanmar',
            'ivory coast': "côte d'ivoire",
            'cape verde': 'cabo verde',
            'east timor': 'timor-leste',
            'congo': 'republic of the congo',
            'drc': 'democratic republic of the congo',
            'dr congo': 'democratic republic of the congo',
            'macedonia': 'north macedonia',
            'swaziland': 'eswatini',
            'russia': 'russian federation',
            'syria': 'syrian arab republic',
            'iran': 'islamic republic of iran',
            'venezuela': 'bolivarian republic of venezuela',
            'bolivia': 'plurinational state of bolivia',
            'tanzania': 'united republic of tanzania',
            'moldova': 'republic of moldova',
            'palestine': 'palestinian territory'
          };
          
          return countryAliases[input] || input;
        };
        
        // Calculate visited countries from trips
        const calculateCountryData = () => {
          const trips = data.travel?.trips || [];
          
          // Normalize today to midnight for proper date comparison
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const visitedCountries = new Map();
          const plannedCountries = new Map();
          
          trips.forEach(trip => {
            if (!trip.endDate) return; // Skip trips without end date
            
            // Normalize trip end date to midnight for comparison
            const endDate = new Date(trip.endDate);
            endDate.setHours(0, 0, 0, 0);
            
            // Compare dates: if end date is BEFORE today, it's completed
            const isPast = endDate < today;
            const countries = trip.countries || [];
            
            // Debug logging (can remove later)
            if (countries.length > 0) {
              console.log(`🗺️ Trip: "${trip.name}" | End: ${trip.endDate} | isPast: ${isPast}`);
            }
            
            countries.forEach(country => {
              const normalizedCountry = normalizeCountryName(country);
              if (isPast) {
                // COMPLETED EXPEDITION → AMBER/GOLD
                if (!visitedCountries.has(normalizedCountry)) {
                  visitedCountries.set(normalizedCountry, []);
                }
                visitedCountries.get(normalizedCountry).push(trip);
                console.log(`✅ COMPLETED: ${country} → ${normalizedCountry} (AMBER)`);
              } else {
                // FUTURE MISSION → BLUE
                if (!plannedCountries.has(normalizedCountry)) {
                  plannedCountries.set(normalizedCountry, []);
                }
                plannedCountries.get(normalizedCountry).push(trip);
                console.log(`🔵 PLANNED: ${country} → ${normalizedCountry} (BLUE)`);
              }
            });
          });
          
          return { visitedCountries, plannedCountries };
        };
        
        const { visitedCountries, plannedCountries } = calculateCountryData();
        const totalVisited = visitedCountries.size;
        const totalPlanned = plannedCountries.size;
        const allVisitedCountries = Array.from(visitedCountries.keys());
        const allPlannedCountries = Array.from(plannedCountries.keys());
        
        // World map data - major countries with positions adjusted for new viewBox (100x50)
        const worldMapCountries = [
          // North America
          { name: 'usa', display: 'USA', x: 12, y: 18, region: 'North America' },
          { name: 'united states', display: 'USA', x: 12, y: 18, region: 'North America' },
          { name: 'canada', display: 'Canada', x: 12, y: 12, region: 'North America' },
          { name: 'mexico', display: 'Mexico', x: 12, y: 25, region: 'North America' },
          // South America
          { name: 'brazil', display: 'Brazil', x: 27, y: 38, region: 'South America' },
          { name: 'argentina', display: 'Argentina', x: 25, y: 45, region: 'South America' },
          { name: 'colombia', display: 'Colombia', x: 22, y: 32, region: 'South America' },
          { name: 'peru', display: 'Peru', x: 23, y: 37, region: 'South America' },
          { name: 'chile', display: 'Chile', x: 24, y: 42, region: 'South America' },
          // Europe
          { name: 'uk', display: 'UK', x: 46, y: 12, region: 'Europe' },
          { name: 'united kingdom', display: 'UK', x: 46, y: 12, region: 'Europe' },
          { name: 'france', display: 'France', x: 48, y: 15, region: 'Europe' },
          { name: 'germany', display: 'Germany', x: 50, y: 13, region: 'Europe' },
          { name: 'italy', display: 'Italy', x: 51, y: 17, region: 'Europe' },
          { name: 'spain', display: 'Spain', x: 46, y: 17, region: 'Europe' },
          { name: 'portugal', display: 'Portugal', x: 44, y: 17, region: 'Europe' },
          { name: 'netherlands', display: 'Netherlands', x: 49, y: 13, region: 'Europe' },
          { name: 'sweden', display: 'Sweden', x: 52, y: 10, region: 'Europe' },
          { name: 'norway', display: 'Norway', x: 51, y: 8, region: 'Europe' },
          { name: 'greece', display: 'Greece', x: 54, y: 18, region: 'Europe' },
          { name: 'switzerland', display: 'Switzerland', x: 49, y: 15, region: 'Europe' },
          // Africa
          { name: 'egypt', display: 'Egypt', x: 54, y: 23, region: 'Africa' },
          { name: 'south africa', display: 'South Africa', x: 52, y: 42, region: 'Africa' },
          { name: 'morocco', display: 'Morocco', x: 45, y: 22, region: 'Africa' },
          { name: 'kenya', display: 'Kenya', x: 56, y: 32, region: 'Africa' },
          { name: 'tanzania', display: 'Tanzania', x: 56, y: 34, region: 'Africa' },
          // Asia
          { name: 'china', display: 'China', x: 72, y: 20, region: 'Asia' },
          { name: 'japan', display: 'Japan', x: 82, y: 19, region: 'Asia' },
          { name: 'south korea', display: 'South Korea', x: 80, y: 19, region: 'Asia' },
          { name: 'thailand', display: 'Thailand', x: 74, y: 27, region: 'Asia' },
          { name: 'vietnam', display: 'Vietnam', x: 76, y: 27, region: 'Asia' },
          { name: 'cambodia', display: 'Cambodia', x: 75, y: 28, region: 'Asia' },
          { name: 'singapore', display: 'Singapore', x: 76, y: 31, region: 'Asia' },
          { name: 'malaysia', display: 'Malaysia', x: 75, y: 30, region: 'Asia' },
          { name: 'indonesia', display: 'Indonesia', x: 78, y: 33, region: 'Asia' },
          { name: 'philippines', display: 'Philippines', x: 79, y: 28, region: 'Asia' },
          { name: 'india', display: 'India', x: 68, y: 25, region: 'Asia' },
          { name: 'nepal', display: 'Nepal', x: 70, y: 23, region: 'Asia' },
          { name: 'uae', display: 'UAE', x: 62, y: 25, region: 'Middle East' },
          { name: 'turkey', display: 'Turkey', x: 56, y: 18, region: 'Middle East' },
          // Oceania
          { name: 'australia', display: 'Australia', x: 83, y: 39, region: 'Oceania' },
          { name: 'new zealand', display: 'New Zealand', x: 90, y: 44, region: 'Oceania' },
        ];
        
        return (
          <Card className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 border-amber-500/30">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Operator's World Map
                </h2>
                <p className="text-gray-400">Your quest to paint the map - track every expedition</p>
              </div>
              
              {/* Statistics Counter */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-amber-900/30 rounded-lg px-4 py-3 border border-amber-600/40">
                  <div className="text-xs text-amber-300 uppercase tracking-wide">Completed Expeditions</div>
                  <div className="text-2xl font-bold text-amber-400">{totalVisited} / 195</div>
                  <div className="text-xs text-gray-400">Countries Visited</div>
                </div>
                <div className="bg-blue-900/30 rounded-lg px-4 py-3 border border-blue-600/40">
                  <div className="text-xs text-blue-300 uppercase tracking-wide">Future Missions</div>
                  <div className="text-2xl font-bold text-blue-400">{totalPlanned}</div>
                  <div className="text-xs text-gray-400">Countries Planned</div>
                </div>
              </div>
            </div>
            
            {/* Map Visualization */}
            {totalVisited === 0 && totalPlanned === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-slate-800/30 to-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
                <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">Your World Map Awaits</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Start planning trips and watch your map come to life! Add countries to your trips to begin painting your journey.
                </p>
                <button
                  onClick={() => setShowAddTrip(true)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Plan Your First Expedition
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/40 rounded-lg p-4 md:p-6 border border-gray-700">
                {/* 🗺️ VINTAGE EXPEDITION WORLD MAP */}
                <div className="relative w-full mb-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-amber-900/40 p-4 shadow-2xl">
                  {/* Decorative Compass Rose */}
                  <div className="absolute top-4 right-4 w-16 h-16 opacity-20 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="text-amber-400">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <path d="M 50 5 L 55 45 L 50 50 L 45 45 Z" fill="currentColor"/>
                      <path d="M 95 50 L 55 55 L 50 50 L 55 45 Z" fill="currentColor" opacity="0.7"/>
                      <path d="M 50 95 L 45 55 L 50 50 L 55 55 Z" fill="currentColor" opacity="0.5"/>
                      <path d="M 5 50 L 45 45 L 50 50 L 45 55 Z" fill="currentColor" opacity="0.3"/>
                      <text x="50" y="15" fontSize="12" fill="currentColor" textAnchor="middle" fontWeight="bold">N</text>
                    </svg>
                  </div>
                  
                  {/* The Map */}
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 100,
                      center: [0, 20]
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                      minHeight: '400px',
                      background: 'linear-gradient(to bottom, #1e3a5f, #0f1f3d)'
                    }}
                  >
                    <ZoomableGroup>
                      <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                          geographies.map((geo) => {
                            const countryName = geo.properties.name.toLowerCase();
                            const isVisited = visitedCountries.has(countryName);
                            const isPlanned = plannedCountries.has(countryName);
                            
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={
                                  isVisited 
                                    ? "#FBBF24"  // Amber/Gold for completed
                                    : isPlanned 
                                    ? "#38BDF8"  // Sky Blue for planned
                                    : "#2d3748"  // Dark gray for unvisited
                                }
                                stroke={
                                  isVisited
                                    ? "#F59E0B"  // Darker amber border
                                    : isPlanned
                                    ? "#0EA5E9"  // Darker blue border
                                    : "#4a5568"  // Gray border
                                }
                                strokeWidth={isVisited || isPlanned ? 0.75 : 0.3}
                                style={{
                                  default: { 
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                  },
                                  hover: { 
                                    fill: isVisited ? "#FCD34D" : isPlanned ? "#7DD3FC" : "#3d4552",
                                    stroke: isVisited ? "#F59E0B" : isPlanned ? "#0EA5E9" : "#5a6678",
                                    strokeWidth: 1,
                                    outline: 'none',
                                    cursor: 'pointer'
                                  },
                                  pressed: { outline: 'none' }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                  
                  {/* Vintage Map Legend */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm bg-slate-900/60 rounded-lg p-3 border border-amber-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-amber-500 border-2 border-amber-600"></div>
                      <span className="text-amber-200 font-semibold">Completed Expeditions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-sky-400 border-2 border-sky-600"></div>
                      <span className="text-sky-200 font-semibold">Future Missions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-gray-700 border-2 border-gray-600"></div>
                      <span className="text-gray-400">Unexplored</span>
                    </div>
                  </div>
                  
                  {/* Vintage Paper Texture Overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.03) 0%, transparent 50%)',
                    mixBlendMode: 'overlay'
                  }}></div>
                </div>
                
                {/* Country List View - Collapsible */}
                <details className="border-t border-gray-700 pt-4">
                  <summary className="cursor-pointer text-gray-400 hover:text-white transition-colors mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    View Detailed Country List
                  </summary>
                <div className="space-y-4">
                  {totalVisited > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Completed Expeditions
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {allVisitedCountries.map(country => {
                          const trips = visitedCountries.get(country);
                          return (
                            <div 
                              key={country}
                              className="group relative bg-amber-900/20 hover:bg-amber-900/40 border border-amber-600/40 rounded-lg p-3 transition-all cursor-pointer"
                            >
                              <div className="text-amber-400 font-semibold text-sm">{country}</div>
                              <div className="text-xs text-gray-400">{trips.length} trip{trips.length > 1 ? 's' : ''}</div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-amber-500/50 whitespace-nowrap">
                                  {trips.map((trip, idx) => (
                                    <div key={idx} className="py-1">
                                      <div className="font-semibold text-amber-300">{trip.name}</div>
                                      <div className="text-gray-400">Status: Completed ✓</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {totalPlanned > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Future Missions
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {allPlannedCountries.map(country => {
                          const trips = plannedCountries.get(country);
                          return (
                            <div 
                              key={country}
                              className="group relative bg-blue-900/20 hover:bg-blue-900/40 border border-blue-600/40 rounded-lg p-3 transition-all cursor-pointer"
                            >
                              <div className="text-blue-400 font-semibold text-sm">{country}</div>
                              <div className="text-xs text-gray-400">{trips.length} trip{trips.length > 1 ? 's' : ''}</div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-blue-500/50 whitespace-nowrap">
                                  {trips.map((trip, idx) => (
                                    <div key={idx} className="py-1">
                                      <div className="font-semibold text-blue-300">{trip.name}</div>
                                      <div className="text-gray-400">Status: Planned 📅</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/20 to-blue-900/20 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-300 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <strong className="text-white">Pro Tip:</strong> The more countries you visit, the more epic your journey becomes. Keep painting that map, Operator! 🌍
                    </div>
                  </div>
                </div>
                </details>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Trip Planning Header */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              🗺️ Trip Planning & Budgets
            </h2>
            <p className="text-gray-400">Manage your travel budgets and track expenses by trip</p>
          </div>
          <button
            onClick={() => setShowAddTrip(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Plan New Trip
          </button>
        </div>
      </Card>

      {/* Trip Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(data.travel?.trips || []).length === 0 ? (
          <div className="col-span-1 lg:col-span-2">
            <Card className="bg-gradient-to-br from-blue-900/20 to-emerald-900/20 border-blue-500/30">
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Trips Planned Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Start planning your next adventure! Track budgets, expenses, and currencies for all your travels.
                </p>
                <button
                  onClick={() => setShowAddTrip(true)}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Plan Your First Trip
                </button>
              </div>
            </Card>
          </div>
        ) : (
          (data.travel?.trips || []).map(trip => {
          const progress = trip.targetBudget > 0 ? (trip.currentSavings / trip.targetBudget) * 100 : 0;
          const totalExpenses = trip.expenses?.reduce((sum, exp) => {
            return sum + convertCurrency(exp.amount, exp.currency, 'CAD');
          }, 0) || 0;
          const remainingBudget = trip.targetBudget - totalExpenses;
          
          return (
            <Card key={trip.id} className="border-blue-500/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{trip.name}</h3>
                  <p className="text-gray-400 text-sm">{trip.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {trip.countries?.map(country => (
                      <span key={country} className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setShowExpenseModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Expense
                  </button>
                  <button 
                    onClick={() => setEditingTrip({...trip, countries: trip.countries || []})}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Edit Trip"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Savings Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>${trip.currentSavings.toLocaleString()}</span>
                    <span>${trip.targetBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-700/30 rounded-lg p-2">
                    <div className="text-sm text-gray-400">Start Date</div>
                    <div className="text-white font-medium">{new Date(trip.startDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-2">
                    <div className="text-sm text-gray-400">Daily Budget</div>
                    <div className="text-white font-medium">${trip.estimatedDailySpend}</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-2">
                    <div className="text-sm text-gray-400">Remaining</div>
                    <div className={`font-medium ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${remainingBudget.toLocaleString()}
                    </div>
                  </div>
                </div>

                {trip.expenses && trip.expenses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Expenses</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {trip.expenses.slice(0, 3).map(expense => (
                        <div key={expense.id} className="flex justify-between items-start text-xs group">
                          <div className="flex flex-col flex-1">
                            <span className="text-gray-400">{expense.description}</span>
                            {expense.date && (
                              <span className="text-gray-500 text-xs mt-0.5">
                                {new Date(expense.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white flex-shrink-0">
                              {expense.amount} {expense.currency}
                              {expense.currency !== 'CAD' && (
                                <span className="text-gray-500 ml-1">
                                  (${convertCurrency(expense.amount, expense.currency, 'CAD').toFixed(0)} CAD)
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() => handleDeleteExpense(trip.id, expense.id)}
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })
        )}
      </div>

      {/* Add Trip Modal */}
      {showAddTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-blue-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Plan New Trip</h3>
              <button
                onClick={() => {
                  setShowAddTrip(false);
                  // Force viewport cleanup after modal close
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.height = '';
                  }, 100);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Trip Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Southeast Asia Adventure"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Target Budget (CAD)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={newTrip.targetBudget || ''}
                    onChange={(e) => setNewTrip({...newTrip, targetBudget: e.target.value === '' ? '' : e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Brief description of your trip..."
                  value={newTrip.description}
                  onChange={(e) => setNewTrip({...newTrip, description: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Daily Budget (CAD)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newTrip.estimatedDailySpend || ''}
                    onChange={(e) => setNewTrip({...newTrip, estimatedDailySpend: e.target.value === '' ? '' : e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 🗺️ Countries Selector - For World Map */}
              <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-600/30">
                <label className="block text-sm font-semibold text-amber-200 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Countries (Paint the Map!)
                </label>
                <input
                  type="text"
                  placeholder="Type country name and press comma or Enter"
                  value={newTrip.countryInput || ''}
                  onChange={(e) => {
                    setNewTrip({...newTrip, countryInput: e.target.value});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ',' || e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = (newTrip.countryInput || '').trim();
                      if (trimmed && !newTrip.countries.includes(trimmed)) {
                        setNewTrip({
                          ...newTrip,
                          countries: [...newTrip.countries, trimmed],
                          countryInput: ''
                        });
                      } else {
                        setNewTrip({...newTrip, countryInput: ''});
                      }
                    }
                  }}
                  onBlur={() => {
                    // Also add on blur if there's text
                    const trimmed = (newTrip.countryInput || '').trim();
                    if (trimmed && !newTrip.countries.includes(trimmed)) {
                      setNewTrip({
                        ...newTrip,
                        countries: [...newTrip.countries, trimmed],
                        countryInput: ''
                      });
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-amber-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 Type a country name, then press <span className="font-semibold text-amber-300">comma</span> or <span className="font-semibold text-amber-300">Enter</span> to add it!
                </p>
                {Array.isArray(newTrip.countries) && newTrip.countries.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {newTrip.countries.map((country, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-amber-600/30 text-amber-200 text-sm rounded-full border border-amber-500/50 flex items-center gap-2">
                        🌍 {country}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedCountries = newTrip.countries.filter((_, i) => i !== idx);
                            setNewTrip({...newTrip, countries: updatedCountries});
                          }}
                          className="hover:text-red-400 transition-colors font-bold text-base"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddTrip(false);
                  // Force viewport cleanup after modal close
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.height = '';
                  }, 100);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrip}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Trip
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-green-500/30">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Add Expense</h3>
                <p className="text-sm text-gray-400">{selectedTrip.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setSelectedTrip(null);
                  // Force viewport cleanup after modal close
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.height = '';
                  }, 100);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Hotel in Bangkok, Street food, Train ticket..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value === '' ? '' : e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Currency</label>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                  >
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="THB">THB (Thai Baht)</option>
                    <option value="COP">COP (Colombian Peso)</option>
                    <option value="PEN">PEN (Peruvian Sol)</option>
                    <option value="VND">VND (Vietnamese Dong)</option>
                    <option value="MXN">MXN (Mexican Peso)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                  >
                    {(data.travel?.expenseCategories || []).map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>

              {newExpense.currency !== 'CAD' && newExpense.amount && (
                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600/30">
                  <div className="text-sm text-blue-200">
                    💱 <strong>Currency Conversion:</strong> {newExpense.amount} {newExpense.currency} ≈ 
                    <span className="font-bold"> ${convertCurrency(parseFloat(newExpense.amount) || 0, newExpense.currency, 'CAD').toFixed(2)} CAD</span>
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    * Rates are estimates. Actual conversion may vary.
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setSelectedTrip(null);
                  // Force viewport cleanup after modal close
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.height = '';
                  }, 100);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.description || !newExpense.amount}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                                 <Plus className="w-4 h-4" />
                 Add Expense
               </button>
             </div>
           </Card>
         </div>
       )}

       {/* Edit Trip Modal */}
       {editingTrip && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <Card className="w-full max-w-2xl border-blue-500/30">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-white">Edit Trip</h3>
               <button
                 onClick={() => {
                   setEditingTrip(null);
                   // Force viewport cleanup after modal close
                   setTimeout(() => {
                     window.scrollTo(0, 0);
                     document.body.style.overflow = '';
                     document.body.style.position = '';
                     document.body.style.height = '';
                   }, 100);
                 }}
                 className="text-gray-400 hover:text-white"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Trip Name</label>
                   <input
                     type="text"
                     placeholder="e.g., Southeast Asia Adventure"
                     value={editingTrip.name}
                     onChange={(e) => setEditingTrip({...editingTrip, name: e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Target Budget (CAD)</label>
                   <input
                     type="number"
                     placeholder="45000"
                     value={editingTrip.targetBudget || ''}
                     onChange={(e) => setEditingTrip({...editingTrip, targetBudget: e.target.value === '' ? '' : e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm text-gray-300 mb-1">Description</label>
                 <textarea
                   placeholder="Brief description of your trip..."
                   value={editingTrip.description}
                   onChange={(e) => setEditingTrip({...editingTrip, description: e.target.value})}
                   className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   rows="2"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                   <input
                     type="date"
                     value={editingTrip.startDate}
                     onChange={(e) => setEditingTrip({...editingTrip, startDate: e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">End Date</label>
                   <input
                     type="date"
                     value={editingTrip.endDate}
                     onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Daily Budget (CAD)</label>
                   <input
                     type="number"
                     placeholder="500"
                     value={editingTrip.estimatedDailySpend || ''}
                     onChange={(e) => setEditingTrip({...editingTrip, estimatedDailySpend: e.target.value === '' ? '' : e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm text-gray-300 mb-1">Current Savings (CAD)</label>
                 <input
                   type="number"
                   placeholder="0"
                   value={editingTrip.currentSavings || ''}
                   onChange={(e) => setEditingTrip({...editingTrip, currentSavings: e.target.value === '' ? '' : Number(e.target.value)})}
                   className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                 />
               </div>
             </div>
             
             <div className="mt-6 flex justify-end gap-3">
               <button
                 onClick={() => {
                   setEditingTrip(null);
                   // Force viewport cleanup after modal close
                   setTimeout(() => {
                     window.scrollTo(0, 0);
                     document.body.style.overflow = '';
                     document.body.style.position = '';
                     document.body.style.height = '';
                   }, 100);
                 }}
                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleEditTrip}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
               >
                 Save Changes
               </button>
             </div>
           </Card>
         </div>
       )}

             {/* Travel Runway Settings Modal */}
      {showRunwayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <Card className="w-full max-w-sm sm:max-w-2xl border-blue-500/30 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                 <h3 className="text-lg sm:text-xl font-bold text-white">🌍 Travel Runway Settings</h3>
               <button
                 onClick={() => {
                   setShowRunwayModal(false);
                   // Force viewport cleanup after modal close
                   setTimeout(() => {
                     window.scrollTo(0, 0);
                     document.body.style.overflow = '';
                     document.body.style.position = '';
                     document.body.style.height = '';
                   }, 100);
                 }}
                 className="text-gray-400 hover:text-white"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
                          <div className="space-y-3 sm:space-y-4">
               {/* Basic Settings in Mobile-Friendly Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Total Travel Savings</label>
                   <input
                     type="number"
                     placeholder="50000"
                     value={runwaySettings.totalSavings || ''}
                     onChange={(e) => setRunwaySettings({
                       ...runwaySettings, 
                       totalSavings: e.target.value === '' ? '' : Number(e.target.value)
                     })}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                     style={{ fontSize: '16px' }}
                   />
                   <p className="text-xs text-gray-400 mt-1 hidden sm:block">Your total funds available for travel</p>
                 </div>

                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Home Currency</label>
                   <select
                     value={runwaySettings.homeCurrency}
                     onChange={(e) => setRunwaySettings({
                       ...runwaySettings, 
                       homeCurrency: e.target.value
                     })}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                     style={{ fontSize: '16px' }}
                   >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="THB">THB - Thai Baht</option>
                    <option value="COP">COP - Colombian Peso</option>
                  </select>
                   <p className="text-xs text-gray-400 mt-1 hidden sm:block">Your primary currency for calculations</p>
                 </div>
               </div>

               {/* Trip Planning by Destination Tiers */}
               <div className="bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-600/30">
                 <h4 className="text-blue-200 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">🎯 Plan Your Travel by Destination Type</h4>
                 
                 <div className="space-y-2 sm:space-y-3">
                   <div className="bg-green-900/30 rounded-lg p-2 sm:p-3 border border-green-600/30">
                     <div className="flex justify-between items-center mb-1 sm:mb-2">
                       <span className="text-green-400 font-semibold text-sm">🟢 Cheap ($40/day)</span>
                       <span className="text-green-300 text-xs sm:hidden">SE Asia, E.Europe</span>
                     </div>
                     <input
                       type="number"
                       placeholder="90"
                       value={runwaySettings.tripPlan.cheap || ''}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           cheap: e.target.value === '' ? 0 : Number(e.target.value)
                         }
                       })}
                       className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-base"
                       style={{ fontSize: '16px' }}
                     />
                     <p className="text-xs text-green-300 mt-1 hidden sm:block">Days in Southeast Asia, Eastern Europe, India</p>
                   </div>

                   <div className="bg-yellow-900/30 rounded-lg p-2 sm:p-3 border border-yellow-600/30">
                     <div className="flex justify-between items-center mb-1 sm:mb-2">
                       <span className="text-yellow-400 font-semibold text-sm">🟡 Moderate ($90/day)</span>
                       <span className="text-yellow-300 text-xs sm:hidden">S.America, S.Europe</span>
                     </div>
                     <input
                       type="number"
                       placeholder="30"
                       value={runwaySettings.tripPlan.moderate || ''}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           moderate: e.target.value === '' ? 0 : Number(e.target.value)
                         }
                       })}
                       className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none text-base"
                       style={{ fontSize: '16px' }}
                     />
                     <p className="text-xs text-yellow-300 mt-1 hidden sm:block">Days in South America, Southern Europe</p>
                   </div>

                   <div className="bg-red-900/30 rounded-lg p-2 sm:p-3 border border-red-600/30">
                     <div className="flex justify-between items-center mb-1 sm:mb-2">
                       <span className="text-red-400 font-semibold text-sm">🔴 Expensive ($160/day)</span>
                       <span className="text-red-300 text-xs sm:hidden">W.Europe, Japan</span>
                     </div>
                     <input
                       type="number"
                       placeholder="15"
                       value={runwaySettings.tripPlan.expensive || ''}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           expensive: e.target.value === '' ? 0 : Number(e.target.value)
                         }
                       })}
                       className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-400 focus:outline-none text-base"
                       style={{ fontSize: '16px' }}
                     />
                     <p className="text-xs text-red-300 mt-1 hidden sm:block">Days in Western Europe, Scandinavia, Japan</p>
                   </div>
                 </div>
               </div>

               {/* Enhanced Preview */}
               <div className="bg-blue-900/20 rounded-lg p-2 sm:p-3 border border-blue-600/30">
                 <div className="text-blue-200 text-sm font-semibold mb-2">📊 Preview</div>
                 <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                   <div className="text-center">
                     <div className="text-blue-300 font-bold text-sm">
                       {(runwaySettings.tripPlan.cheap || 0) + (runwaySettings.tripPlan.moderate || 0) + (runwaySettings.tripPlan.expensive || 0)}
                     </div>
                     <div className="text-blue-200 text-xs">Days</div>
                   </div>
                   <div className="text-center">
                     <div className="text-blue-300 font-bold text-sm">
                       ${Math.round(((runwaySettings.tripPlan.cheap || 0) * 40 + (runwaySettings.tripPlan.moderate || 0) * 90 + (runwaySettings.tripPlan.expensive || 0) * 160) / 1000)}k
                     </div>
                     <div className="text-blue-200 text-xs">Cost</div>
                   </div>
                   <div className="text-center">
                     <div className="text-green-300 font-bold text-sm">
                       ${Math.round(Math.max(0, (runwaySettings.totalSavings || 0) - ((runwaySettings.tripPlan.cheap || 0) * 40 + (runwaySettings.tripPlan.moderate || 0) * 90 + (runwaySettings.tripPlan.expensive || 0) * 160)) / 1000)}k
                     </div>
                     <div className="text-green-200 text-xs">Left</div>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
               <button
                 onClick={() => {
                   setShowRunwayModal(false);
                   // Force viewport cleanup after modal close
                   setTimeout(() => {
                     window.scrollTo(0, 0);
                     document.body.style.overflow = '';
                     document.body.style.position = '';
                     document.body.style.height = '';
                   }, 100);
                 }}
                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 sm:py-2 rounded-lg transition-colors text-base font-medium"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSaveRunwaySettings}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium"
               >
                 <Save className="w-4 h-4" />
                 Save Settings
               </button>
             </div>
           </Card>
         </div>
       )}
     </div>
   );
 };

function App() {
  // Add CSS for scrollbar hiding and mobile viewport fixes
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      /* Fix mobile over-scrolling and viewport issues */
      html, body {
        overflow-x: hidden;
        position: relative;
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #111827;
      }
      
      body {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        overscroll-behavior-y: none;
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      /* Prevent pull-to-refresh on mobile */
      .app-container {
        overscroll-behavior-y: contain;
        touch-action: pan-y;
        min-height: 100vh;
        min-height: 100dvh;
        background-color: #111827;
      }
      
      /* Fix mobile viewport whitespace */
      html {
        overscroll-behavior: none;
        overscroll-behavior-y: none;
      }
      
              /* Modern viewport units for better mobile support */
        @supports (height: 100dvh) {
          .app-container {
            min-height: 100dvh;
          }
        }
        
        /* Prevent mobile zoom on inputs */
        input[type="number"],
        input[type="text"],
        input[type="email"],
        input[type="password"],
        select,
        textarea {
          font-size: 16px !important;
          transform-origin: left top;
          -webkit-user-select: text;
        }
        
        /* Force zoom reset on modal close */
        .modal-open {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        /* Additional mobile input fixes */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
            line-height: 1.2;
          }
          
          /* Force viewport reset */
          .zoom-reset {
            zoom: 1;
            -webkit-transform: scale(1);
            transform: scale(1);
          }
          
          /* MODAL POSITIONING - NOW HANDLED BY INLINE STYLES */
          .modal-container {
            /* Inline styles take precedence for reliable positioning */
          }
          
          /* PREVENT BODY SCROLL WHEN MODAL OPEN - NO CONFLICTS */
          body.modal-open {
            /* Remove overflow hidden - it conflicts with floating button */
          }
          
          /* Floating button - SUPREME Z-INDEX */
          .floating-quick-btn {
            position: fixed !important;
            bottom: 1.5rem !important;
            right: 1.5rem !important;
            z-index: 99999 !important;
            width: 3.5rem !important;
            height: 3.5rem !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4) !important;
            transform: scale(1) !important;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            border: none !important;
            outline: none !important;
            pointer-events: auto !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            visibility: visible !important;
            opacity: 1 !important;
            will-change: transform !important;
            backface-visibility: hidden !important;
            transform-origin: center !important;
            /* Force positioning to override any conflicts */
            top: auto !important;
            left: auto !important;
            margin: 0 !important;
            /* Prevent any layout shifts */
            contain: layout style paint !important;
          }
          
          .floating-quick-btn:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 12px 40px rgba(239, 68, 68, 0.6) !important;
          }
          
          .floating-quick-btn:active {
            transform: scale(0.95) !important;
          }
          
          /* Ensure button is always above everything */
          .floating-quick-btn {
            isolation: isolate !important;
          }
        }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(null);
  // 🔐 PRODUCTION AUTHENTICATION ENABLED
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [editingRecurring, setEditingRecurring] = useState(null); // For editing recurring expenses
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [showSubscription, setShowSubscription] = useState(false);
  const [userPlan, setUserPlan] = useState(SUBSCRIPTION_TIERS.FREE); // Subscription plan state
  
  // 🛠️ SECURE DEVELOPER PANEL (only for admins)
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devOverridePlan, setDevOverridePlan] = useState(null);
  
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showHelpFAQ, setShowHelpFAQ] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptData, setUpgradePromptData] = useState({ featureName: '', requiredPlan: '' });
  // Removed unused loading state - using authLoading instead
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('monthly'); // monthly or annual
  const [showHistory, setShowHistory] = useState(false);
  
  // 🔒 SECURE ADMIN CHECK - Only specific emails can use dev panel
  const ADMIN_EMAILS = [
    'janara.nguon@gmail.com',
    // Add more admin emails here as needed
  ];
  
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);
  
  // Get current plan (with dev override if admin)
  const currentUserPlan = (isAdmin && devOverridePlan) ? devOverridePlan : userPlan;
  
  // Modal states for dashboard cards
  const [editingCard, setEditingCard] = useState(null);
  const [tempCardData, setTempCardData] = useState({});
  
  // Reset data states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStartDate, setResetStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [resetToSample, setResetToSample] = useState(false);
  
  // Quick expense logging states
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [quickExpense, setQuickExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // User feedback system
  // const [isLoading, setIsLoading] = useState(false); // Removed - using authLoading instead
  const [notification, setNotification] = useState(null);
  
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Feature gating and upgrade functions
  const checkFeatureAccess = useCallback((feature) => {
    return hasFeatureAccess(userPlan, feature);
  }, [userPlan]);

  const showUpgradePromptForFeature = useCallback((featureName, feature) => {
    const requiredPlan = getRequiredTier(feature);
    setUpgradePromptData({ featureName, requiredPlan });
    setShowUpgradePrompt(true);
  }, []);

  const handleUpgrade = useCallback(async (planId, billingCycle = 'monthly') => {
    if (planId === 'view-all') {
      setShowUpgradePrompt(false);
      setShowPricingModal(true);
      return;
    }

    // Don't allow upgrading if not authenticated
    if (!user) {
      showNotification('Please sign in to upgrade your plan', 'error');
      return;
    }

    try {
      console.log(`🛒 Initiating upgrade to ${planId} with ${billingCycle} billing`);
      
      // Import Stripe utilities dynamically
      const { createCheckoutSession } = await import('./utils/stripeUtils');
      
      // Show loading notification
      showNotification('Redirecting to secure checkout...', 'info');
      
      // Create Stripe checkout session and redirect
      await createCheckoutSession(planId, billingCycle, user);
      
      // Note: User will be redirected to Stripe, so code after this may not execute
      // Subscription update happens via webhook after successful payment
      
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      showNotification(
        error.message || 'Failed to process upgrade. Please try again.',
        'error'
      );
    }
  }, [user, showNotification]);

  const handleTabClick = useCallback((tab) => {
    // Check if user has access to the tab
    const tabFeatures = {
      'dashboard': 'basic-dashboard',
      'budget': 'budget-calculator', 
      'investment': 'investment-portfolio',
      'investments': 'investment-portfolio',
      'side-hustle': 'side-hustle',
      'travel': 'travel-mode',
      'transactions': 'transaction-management'
    };

    const requiredFeature = tabFeatures[tab];
    if (requiredFeature && !checkFeatureAccess(requiredFeature)) {
      const featureNames = {
        'investment-portfolio': 'Investment Portfolio',
        'side-hustle': 'Side Hustle Management',
        'travel-mode': 'Travel Mode'
      };
      showUpgradePromptForFeature(featureNames[requiredFeature] || tab, requiredFeature);
      return;
    }
    
    setActiveTab(tab);
  }, [checkFeatureAccess, showUpgradePromptForFeature]);

  // 🔄 Process Recurring Expenses Function
  const processRecurringExpenses = useCallback(async (userData, currentUserId) => {
    if (!userData || !userData.recurringExpenses || userData.recurringExpenses.length === 0) {
      return;
    }

    const { newTransactions, updatedRecurringExpenses } = processDueRecurringExpenses(
      userData.recurringExpenses, 
      userData.transactions || []
    );
    
    if (newTransactions.length > 0) {
      const updatedData = {
        ...userData,
        transactions: [...newTransactions, ...(userData.transactions || [])],
        recurringExpenses: updatedRecurringExpenses
      };
      
      try {
        const docRef = doc(db, `users/${currentUserId}/financials`, 'data');
        await setDoc(docRef, updatedData);
        setData(updatedData);
        
        // Show notification about processed recurring expenses
        if (newTransactions.length === 1) {
          showNotification(`✅ Processed 1 recurring ${newTransactions[0].type}: ${newTransactions[0].description}`, 'success');
        } else {
          showNotification(`✅ Processed ${newTransactions.length} recurring transactions`, 'success');
        }
      } catch (error) {
        console.error('Error processing recurring expenses:', error);
        showNotification('Error processing recurring transactions', 'error');
      }
    }
  }, [showNotification]);

    // 🔐 PRODUCTION Authentication Effect
  useEffect(() => {
    if (!auth) {
      console.error('❌ Firebase auth not initialized');
      setAuthLoading(false);
      setShowAuth(true);
      return;
    }

    console.log('🔐 Setting up authentication listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setAuthLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
        setShowAuth(false);
        
        // Load user's financial data from Firestore
        try {
          const docRef = doc(db, `users/${firebaseUser.uid}/financials`, 'data');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setData(userData);
            
            // 🔄 Process recurring expenses on data load
            await processRecurringExpenses(userData, firebaseUser.uid);
          } else {
            // New user - initialize with sample data
            console.log('New user detected, initializing with sample data');
            const newUserData = { ...initialData };
            await setDoc(docRef, newUserData);
            setData(newUserData);
            showNotification('Welcome! Your financial dashboard is ready.', 'success');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          showNotification('Error loading your data. Please try refreshing.', 'error');
          // Fallback to initial data
          setData(initialData);
        }
        
        // 💳 Load user's subscription data
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userDoc = userDocSnap.data();
            const subscription = userDoc.subscription;
            
            if (subscription && subscription.plan && subscription.status === 'active') {
              console.log('✅ Active subscription found:', subscription.plan);
              setUserPlan(subscription.plan);
            } else {
              console.log('📋 No active subscription, using free tier');
              setUserPlan(SUBSCRIPTION_TIERS.FREE);
            }
          } else {
            console.log('📋 No user document, using free tier');
            setUserPlan(SUBSCRIPTION_TIERS.FREE);
          }
        } catch (error) {
          console.error('Error loading subscription:', error);
          setUserPlan(SUBSCRIPTION_TIERS.FREE);
        }
      } else {
        // User is signed out - show authentication screen
        console.log('No user found, showing auth screen...');
        setUser(null);
        setUserId(null);
        setData(null);
        setShowAuth(true);
        
        // TEMPORARILY DISABLED: Auto anonymous sign-in (for Stripe testing)
        // Uncomment below to re-enable anonymous sign-in after payment testing
        // try {
        //   await signInAnonymously(auth);
        //   // onAuthStateChanged will handle the rest
        // } catch (error) {
        //   console.error('Anonymous sign-in failed:', error);
        //   setShowAuth(true);
        // }
      }
      
      setAuthLoading(false);
      // setLoading(false); // Removed - using authLoading instead
    });

    return () => unsubscribe();
  }, [processRecurringExpenses, showNotification]);
  
  // 🛠️ SECURE DEV PANEL - Keyboard shortcut (Ctrl+Shift+Alt+D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only works for admin emails
      if (!isAdmin) return;
      
      // Secret combo: Ctrl + Shift + Alt + D
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'D') {
        e.preventDefault();
        setShowDevPanel(prev => !prev);
      }
      
      // Quick close: Escape
      if (e.key === 'Escape' && showDevPanel) {
        setShowDevPanel(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAdmin, showDevPanel]);


  // 🔐 Authentication Functions
  const handleSignUp = async () => {
    if (!authForm.email || !authForm.password || !authForm.name) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      await updateProfile(userCredential.user, { displayName: authForm.name });
      
      showNotification(`Welcome ${authForm.name}! Your account has been created.`, 'success');
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
      showNotification(errorMessage, 'error');
    }
    setAuthLoading(false);
  };

  const handleSignIn = async () => {
    if (!authForm.email || !authForm.password) {
      showNotification('Please enter email and password', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      showNotification('Welcome back!', 'success');
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Signin error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      showNotification(errorMessage, 'error');
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('Signed out successfully', 'success');
    } catch (error) {
      console.error('Signout error:', error);
      showNotification('Error signing out', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showNotification('Welcome! Signed in with Google.', 'success');
    } catch (error) {
      console.error('Google signin error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups and try again';
      }
      
      showNotification(errorMessage, 'error');
    }
    setAuthLoading(false);
  };

  // Set up --vh for iOS viewport fix
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    // Set initial --vh
    setVH();
    
    // Update --vh on resize (orientation change, etc.)
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);


  // Firebase Data Loading - DISABLED FOR DEVELOPMENT
  useEffect(() => {
    // Skip Firebase - data already loaded in auth effect
    return;
    
    // if (!userId) return;
    // setLoading(true);
    // const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
    // 
    // const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
    //   if (doc.exists()) {
    //     const fetchedData = doc.data();
    //     setData(fetchedData);
    //   } else {
    //     setDoc(userDocRef, initialData)
    //       .then(() => setData(initialData))
    //       .catch(error => console.error("Error creating initial document:", error));
    //   }
    //   setLoading(false);
    // }, (error) => { 
    //   console.error("Firestore snapshot error:", error); 
    //   setLoading(false); 
    // });
    // return () => unsubscribeSnapshot();
  }, [userId]);

  // Card editing functions
  const openCardEditor = (cardType, currentData) => {
    setEditingCard(cardType);
    
    // Provide safe defaults for different card types
    if (cardType === 'debt' && (!currentData || !currentData.accounts)) {
      setTempCardData({
        accounts: currentData?.accounts || [],
        total: currentData?.total || 0,
        history: currentData?.history || []
      });
    } else {
      setTempCardData(currentData || {});
    }
  };

  const resetMobileViewport = () => {
    // Force viewport reset on mobile
    if (window.innerWidth <= 768) {
      // Remove any zoom/scale
      document.body.style.zoom = "1";
      document.body.style.transform = "scale(1)";
      document.body.style.webkitTransform = "scale(1)";
      
      // Force viewport meta tag reset
      let viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        // Trigger reflow
        setTimeout(() => {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }, 100);
      }
      
      // DON'T scroll to top - let the modal close function handle scroll restoration
      // window.scrollTo(0, 0); // REMOVED
      
      // Blur any focused elements
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  };

  const closeCardEditor = () => {
    setEditingCard(null);
    setTempCardData({});
    
    // Ensure page scroll is reset and viewport is clean
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
    }, 100);
  };

  const saveCardData = async () => {
    if (!editingCard || !data) return;
    
    let updatedData;
    
    // Special handling for savings rate target (only update the target, not the entire savingsRate object)
    if (editingCard === 'savingsRateTarget') {
      updatedData = { 
        ...data, 
        savingsRate: { 
          ...data.savingsRate, 
          target: tempCardData.target 
        } 
      };
    } else {
      updatedData = { ...data, [editingCard]: tempCardData };
    }
    
    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      closeCardEditor();
    } catch (error) {
      console.error('Error saving card data:', error);
    }
  };

  // CSV Export Functions
  const exportToCSV = (filename, data) => {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportAllData = () => {
    if (!data) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export Transactions
    const transactionData = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Subcategory'],
      ...data.transactions.map(t => [
        t.date, t.description, t.amount, t.type, t.category, t.subcategory || ''
      ])
    ];
    exportToCSV(`transactions_${timestamp}.csv`, transactionData);
    
    // Export Business Data
    if (data.businesses?.length > 0) {
      setTimeout(() => {
        const businessData = [
          ['Business Name', 'Description', 'Start Date', 'Total Income', 'Total Expenses', 'Net Profit'],
          ...data.businesses.map(b => [
            b.name, b.description, b.startDate, b.totalIncome, b.totalExpenses, b.netProfit
          ])
        ];
        exportToCSV(`businesses_${timestamp}.csv`, businessData);
      }, 500);
    }
    
    // Export Investment Holdings
    if (data.investments?.holdings?.length > 0) {
      setTimeout(() => {
        const investmentData = [
          ['Symbol', 'Name', 'Shares', 'Avg Cost', 'Current Price', 'Total Value', 'Annual Dividend', 'DRIP Enabled'],
          ...data.investments.holdings.map(h => [
            h.symbol, h.name, h.shares, h.avgCost, h.currentPrice, h.totalValue, h.annualDividend, h.dripEnabled
          ])
        ];
        exportToCSV(`investments_${timestamp}.csv`, investmentData);
      }, 1000);
    }
    
    // Export Monthly History
    if (data.monthlyHistory?.length > 0) {
      setTimeout(() => {
        const historyData = [
          ['Month', 'Net Worth', 'Income', 'Expenses', 'Cash Flow', 'Business Income', 'Business Expenses', 'Investment Value', 'Savings Rate'],
          ...data.monthlyHistory.map(h => [
            h.month, h.netWorth, h.income, h.expenses, h.cashflow, h.businessIncome, h.businessExpenses, h.investmentValue, h.savingsRate
          ])
        ];
        exportToCSV(`monthly_history_${timestamp}.csv`, historyData);
      }, 1500);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetStartDate(new Date().toISOString().split('T')[0]);
    setResetToSample(false);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetToSample(false);
  };

  const confirmResetData = async () => {
    console.log('🔧 Reset Data: Function called');
    console.log('🔧 Reset Data: userId =', userId);
    console.log('🔧 Reset Data: resetToSample =', resetToSample);
    
    if (!userId) {
      console.error('❌ Reset Data: No userId available!');
      showNotification('❌ Please sign in to reset data', 'error');
      return;
    }

    let resetData;
    
    if (resetToSample) {
      // Reset to sample data with new start date
      resetData = {
        ...initialData,
        // Update all dates to start from the selected date
        transactions: initialData.transactions.map(t => ({
          ...t,
          date: resetStartDate
        })),
        recurringExpenses: initialData.recurringExpenses.map(r => ({
          ...r,
          nextDueDate: calculateNextDueDate(
            r.frequency,
            r.dayOfMonth,
            r.dayOfWeek,
            r.monthOfYear,
            resetStartDate
          ),
          lastProcessed: resetStartDate,
          createdDate: resetStartDate
        })),
        monthlyHistory: [{
          month: resetStartDate.substring(0, 7),
          netWorth: initialData.netWorth.total,
          income: initialData.income.total,
          expenses: initialData.expenses.total,
          cashflow: initialData.cashflow.total || initialData.cashflow.monthly || 0,
          businessIncome: (initialData.businesses || []).reduce((sum, b) => sum + (b.totalIncome || 0), 0),
          businessExpenses: (initialData.businesses || []).reduce((sum, b) => sum + (b.totalExpenses || 0), 0),
          investmentValue: initialData.investments.totalValue || 0,
          savingsRate: initialData.savingsRate.current
        }]
      };
    } else {
      // Reset to completely clean data
      resetData = {
        financialFreedom: {
          targetAmount: 2000000,
          currentInvestments: 0,
          monthlyContribution: 0,
          annualReturn: 7,
        },
        creditScore: {
          current: 0,
          history: []
        },
        cashOnHand: {
          total: 0,
          accounts: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        rainyDayFund: {
          total: 0,
          goal: 30000,
          accounts: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        debt: {
          total: 0,
          accounts: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        registeredAccounts: {
          accounts: [
            {
              id: 'tfsa',
              name: 'TFSA',
              contributed: 0,
              limit: 88000,
              goal: 10000,
              type: 'tax-free',
              description: 'Tax-free growth and withdrawals'
            },
            {
              id: 'rrsp', 
              name: 'RRSP',
              contributed: 0,
              limit: 31560,
              goal: 5000,
              type: 'tax-deferred',
              description: 'Tax-deferred retirement savings'
            }
          ]
        },
        businesses: [],
        netWorth: {
          total: 0,
          breakdown: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        income: {
          total: 0,
          sources: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        expenses: {
          total: 0,
          categories: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        cashflow: {
          total: 0,
          monthly: 0,
          history: [{ date: resetStartDate, amount: 0 }]
        },
        savingsRate: {
          current: 0,
          target: 20,
          monthly: 0,
          monthlyIncome: 0,
          history: [{ date: resetStartDate, rate: 0 }]
        },
        goals: [],
        investments: {
          totalValue: 0,
          totalGainLoss: 0,
          holdings: [],
          categories: [],
          monthlyData: []
        },
        transactions: [],
        recurringExpenses: [],
        monthlyHistory: [{
          month: resetStartDate.substring(0, 7),
          netWorth: 0,
          income: 0,
          expenses: 0,
          cashflow: 0,
          businessIncome: 0,
          businessExpenses: 0,
          investmentValue: 0,
          savingsRate: 0
        }],
        travel: {
          totalSavings: 0,
          homeCurrency: 'CAD',
          exchangeRates: {
            'USD': 1.35,
            'EUR': 1.47,
            'GBP': 1.70,
            'THB': 0.037,
            'COP': 0.00033
          },
          trips: [],
          runwayCalculation: {
            averageDailySpend: 0,
            totalAvailableFunds: 0,
            estimatedDaysRemaining: 0,
            lastUpdated: resetStartDate
          },
          tripPlan: {
            cheap: 90,
            moderate: 30,
            expensive: 15
          },
          expenseCategories: [
            { name: 'Accommodation', icon: '🏨', color: 'bg-blue-500' },
            { name: 'Food & Dining', icon: '🍽️', color: 'bg-green-500' },
            { name: 'Transportation', icon: '🚕', color: 'bg-yellow-500' },
            { name: 'Activities', icon: '🎭', color: 'bg-purple-500' },
            { name: 'Shopping', icon: '🛍️', color: 'bg-pink-500' },
            { name: 'Other', icon: '💵', color: 'bg-gray-500' }
          ]
        },
        budgetSettings: {
          fiftyThirtyTwenty: {
            needs: 50,
            wants: 30,
            savings: 20
          },
          sixJars: {
            necessities: 55,
            education: 10,
            play: 10,
            longTermSavings: 10,
            financial: 10,
            give: 5
          }
        }
      };
    }

    try {
      console.log('🔧 Reset Data: Starting Firebase write...');
      // 🔧 FIX: Corrected Firebase path (was using wrong artifacts path)
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), resetData);
      console.log('✅ Reset Data: Firebase write successful');
      
      setData(resetData);
      console.log('✅ Reset Data: Local state updated');
      
      setShowResetModal(false);
      setResetToSample(false);
      console.log('✅ Reset Data: Modal closed');
      
      showNotification('✅ Data reset successfully!', 'success');
    } catch (error) {
      console.error('❌ Reset Data Error:', error);
      console.error('❌ Reset Data Error Details:', error.message, error.code);
      showNotification(`❌ Failed to reset data: ${error.message}`, 'error');
    }
  };

  const openQuickExpense = () => {
    setShowQuickExpense(true);
    
    setQuickExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const closeQuickExpense = () => {
    setShowQuickExpense(false);
    
    setQuickExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    // Enhanced viewport cleanup
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
    

    
    // Reset mobile viewport on modal close
    setTimeout(resetMobileViewport, 100);
  };

  const confirmQuickExpense = async () => {
    if (!quickExpense.description || !quickExpense.amount || !userId) return;

    const amount = parseFloat(quickExpense.amount);
    if (isNaN(amount) || amount <= 0) return;

    const transaction = {
      id: Date.now(),
      description: quickExpense.description,
      amount: -Math.abs(amount), // Always negative for expenses
      type: 'expense',
      category: 'personal',
      subcategory: 'cash',
      date: quickExpense.date
    };

    const updatedTransactions = [transaction, ...(data.transactions || [])];
    const updatedData = { ...data, transactions: updatedTransactions };

    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      closeQuickExpense();
      
      // Additional viewport cleanup after successful save
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.height = '';
        

      }, 150);
    } catch (error) {
      console.error('Error adding quick expense:', error);
    }
  };

  // Calculate income and expenses from transactions
  const calculateIncomeExpenses = (transactions, businesses = []) => {
    if (!transactions || transactions.length === 0) {
      transactions = [];
    }

    // Calculate total income and expenses from transactions
    const totalTransactionIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalTransactionExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate business income
    const totalBusinessIncome = businesses.reduce((sum, business) => 
      sum + (business.totalIncome || business.income || 0), 0);

    // 🔧 FIX: Calculate business expenses (CRITICAL BUG FIX!)
    const totalBusinessExpenses = businesses.reduce((sum, business) => 
      sum + (business.totalExpenses || business.expenses || 0), 0);

    // Combine transaction and business income
    const totalIncome = totalTransactionIncome + totalBusinessIncome;

    // 🔧 FIX: Combine transaction and business expenses
    const totalExpenses = totalTransactionExpenses + totalBusinessExpenses;

    // Group income by subcategory (from transactions)
    const incomeByCategory = {};
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const category = t.subcategory || 'Other';
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = 0;
        }
        incomeByCategory[category] += Math.abs(t.amount);
      });

    // Add business income as separate categories
    businesses.forEach((business, index) => {
      if (business.totalIncome > 0) {
        const businessKey = business.name || `Business ${index + 1}`;
        incomeByCategory[businessKey] = business.totalIncome;
      }
    });

    // Group expenses by subcategory
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.subcategory || 'Other';
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += Math.abs(t.amount);
      });

    // 🔧 FIX: Add business expenses as separate categories
    businesses.forEach((business, index) => {
      if ((business.totalExpenses || business.expenses || 0) > 0) {
        const businessKey = `${business.name || `Business ${index + 1}`} Expenses`;
        expensesByCategory[businessKey] = business.totalExpenses || business.expenses || 0;
      }
    });

    // Convert to array format
    const incomeSources = Object.entries(incomeByCategory).map(([name, amount], index) => ({
      id: index + 1,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
      type: 'active'
    }));

    const expenseCategories = Object.entries(expensesByCategory).map(([name, amount], index) => ({
      id: index + 1,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
      color: `bg-red-${500 + (index % 3) * 100}`
    }));

    return {
      income: {
        total: totalIncome,
        sources: incomeSources
      },
      expenses: {
        total: totalExpenses,
        categories: expenseCategories
      }
    };
  };

  // Calculate annual values
  const getAnnualizedData = () => {
    if (!data) return data;
    
    // 🔧 EDGE CASE FIX: Null safety for transactions and businesses
    const calculatedData = calculateIncomeExpenses(data.transactions || [], data.businesses || []);
    
    return {
      ...data,
      income: { 
        ...calculatedData.income, 
        total: calculatedData.income.total * 12,
        sources: calculatedData.income.sources.map(s => ({...s, amount: s.amount * 12}))
      },
      expenses: { 
        ...calculatedData.expenses, 
        total: calculatedData.expenses.total * 12,
        categories: calculatedData.expenses.categories.map(c => ({...c, amount: c.amount * 12}))
      },
      cashflow: { 
        total: (calculatedData.income.total - calculatedData.expenses.total) * 12,
        monthly: (calculatedData.income.total - calculatedData.expenses.total) * 12
      },
      // Savings rate is the same percentage regardless of monthly vs annual view
      savingsRate: { 
        ...data.savingsRate, 
        current: calculatedData.income.total > 0 ? 
          Math.round(((calculatedData.income.total - calculatedData.expenses.total) / calculatedData.income.total * 100) * 100) / 100 : 0
      }
    };
  };

  // Calculate dynamic investment total from holdings
  const calculateInvestmentTotal = (holdings) => {
    return holdings.reduce((sum, holding) => sum + (holding.totalValue || 0), 0);
  };

  const getDisplayData = () => {
    if (!data) return data;
    
    // 🔧 EDGE CASE FIX: Ensure all required data structures exist
    const calculatedData = calculateIncomeExpenses(data.transactions || [], data.businesses || []);
    const actualInvestmentTotal = calculateInvestmentTotal(data.investments?.holdings || []);
    
    // Update Net Worth with dynamic investment value
    const updatedNetWorth = {
      ...data.netWorth,
      breakdown: data.netWorth.breakdown.map(item => 
        item.name === 'Investments' 
          ? { ...item, value: actualInvestmentTotal }
          : item
      )
    };
    
    // Recalculate net worth total
    const newNetWorthTotal = updatedNetWorth.breakdown.reduce((sum, item) => sum + item.value, 0);
    updatedNetWorth.total = newNetWorthTotal;
    
    const baseData = {
      ...data,
      income: calculatedData.income,
      expenses: calculatedData.expenses,
      netWorth: updatedNetWorth,
      investments: {
        ...data.investments,
        totalValue: actualInvestmentTotal
      },
      cashflow: {
        ...data.cashflow,
        total: calculatedData.income.total - calculatedData.expenses.total,
        monthly: calculatedData.income.total - calculatedData.expenses.total
      },
      savingsRate: { 
        ...data.savingsRate,
        // 🔧 EDGE CASE FIX: Handle 0 income, negative cash flow, and null safety
        current: calculatedData.income.total > 0 ? 
          Math.max(-100, Math.min(100, Math.round(((calculatedData.income.total - calculatedData.expenses.total) / calculatedData.income.total * 100) * 100) / 100)) : 0
      }
    };
    
    return viewMode === 'annual' ? getAnnualizedData() : baseData;
  };

  const displayData = getDisplayData();


  return (
    <div className="app-container min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      {/* Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white border border-green-500' 
            : 'bg-red-600 text-white border border-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <span className="text-green-200">✅</span>
            ) : (
              <span className="text-red-200">❌</span>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Show loading screen while checking authentication */}
      {authLoading && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              {/* Spinning ring */}
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-amber-500 mx-auto"></div>
              {/* Inner pulsing circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-50 animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              The Freedom Compass
            </h2>
            <p className="text-gray-400 animate-pulse">Loading your dashboard...</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Show authentication screen if user is not logged in */}
      {showAuth && !user && !authLoading && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  The Freedom Compass
                </h1>
                <p className="text-amber-200 mt-2">
                  {authMode === 'login' ? 'Navigate to your financial freedom' : 'Start your journey to financial independence'}
                </p>
              </div>

              <div className="space-y-4">
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  />
                )}
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                />
                
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={authMode === 'login' ? handleSignIn : handleSignUp}
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {authLoading ? 'Loading...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
                
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {authMode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard - Only show when authenticated */}
      {user && !authLoading && (
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">The Freedom Compass</h1>
              <p className="text-amber-200 text-lg">Welcome back, {user?.displayName || 'Explorer'}! Navigate your {viewMode} financial journey.</p>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.displayName || 'User'}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  {user?.email}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    userPlan === SUBSCRIPTION_TIERS.FREE ? 'bg-gray-600 text-gray-300' :
                    userPlan === SUBSCRIPTION_TIERS.CLIMBER ? 'bg-blue-600 text-blue-100' :
                    userPlan === SUBSCRIPTION_TIERS.OPERATOR ? 'bg-purple-600 text-purple-100' :
                    'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                  }`}>
                    {userPlan === SUBSCRIPTION_TIERS.FREE ? 'Recon' : 
                     userPlan === SUBSCRIPTION_TIERS.CLIMBER ? 'Climber' : 
                     userPlan === SUBSCRIPTION_TIERS.OPERATOR ? 'Operator' :
                     userPlan === SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE ? 'Founder' : 
                     'Free'}
                  </span>
                </p>
              </div>
              
              {userPlan === SUBSCRIPTION_TIERS.FREE && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium"
                >
                  <Crown className="w-4 h-4" />
                  {isFoundersCircleAvailable() ? 'Join Founder\'s Circle' : 'Upgrade'}
                </button>
              )}
              
              {/* Help FAQ Button */}
              <button
                onClick={() => setShowHelpFAQ(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                title="Help & FAQ"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSignOut}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
            
            {/* View Controls - Only show on dashboard tab */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center bg-gray-800 rounded-full p-1 space-x-1">
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setViewMode('annual')}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      viewMode === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Annual
                  </button>
                </div>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                    showHistory ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-full p-1 overflow-hidden">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                <div className="flex space-x-1 min-w-max">
                  <button onClick={() => handleTabClick('dashboard')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2"/>Dashboard
                  </button>
                  <button onClick={() => handleTabClick('transactions')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'transactions' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <CreditCard className="w-4 h-4 mr-2"/>Transactions
                  </button>
                  <button onClick={() => handleTabClick('budget')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'budget' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Calculator className="w-4 h-4 mr-2"/>Budget
                  </button>
                  <button onClick={() => handleTabClick('side-hustle')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'side-hustle' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Building className="w-4 h-4 mr-2"/>Side Hustle
                    {!checkFeatureAccess('side-hustle') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('investment')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'investment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Briefcase className="w-4 h-4 mr-2"/>Investment
                    {!checkFeatureAccess('investment-portfolio') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('travel')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'travel' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    🌍 Travel
                    {!checkFeatureAccess('travel-mode') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Monthly History View */}
              {showHistory && data.monthlyHistory && (
                <FinancialErrorBoundary componentName="Monthly History">
                <Card className="col-span-1 md:col-span-6 lg:col-span-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                    Monthly History
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 text-gray-300">Month</th>
                          <th className="text-right py-2 text-gray-300">Net Worth</th>
                          <th className="text-right py-2 text-gray-300">Income</th>
                          <th className="text-right py-2 text-gray-300">Expenses</th>
                          <th className="text-right py-2 text-gray-300">Cash Flow</th>
                          <th className="text-right py-2 text-gray-300">Business Profit</th>
                          <th className="text-right py-2 text-gray-300">Investment Value</th>
                          <th className="text-right py-2 text-gray-300">Savings Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.monthlyHistory.map(month => (
                          <tr key={month.month} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="py-2 text-white font-semibold">{month.month}</td>
                            <td className="py-2 text-right text-emerald-400 font-semibold">${month.netWorth.toLocaleString()}</td>
                            <td className="py-2 text-right text-blue-400">${month.income.toLocaleString()}</td>
                            <td className="py-2 text-right text-red-400">${month.expenses.toLocaleString()}</td>
                            <td className={`py-2 text-right font-semibold ${month.cashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${month.cashflow.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-violet-400">${(month.businessIncome - month.businessExpenses).toLocaleString()}</td>
                            <td className="py-2 text-right text-purple-400">${month.investmentValue.toLocaleString()}</td>
                            <td className="py-2 text-right text-amber-400">{month.savingsRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                </FinancialErrorBoundary>
              )}
              
              {/* 🎯 OPERATOR'S TRIAGE LAYOUT - Mission-Critical Order */}
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* ROW 1: IMMEDIATE REALITY & SECURITY */}
              {/* ═══════════════════════════════════════════════════════ */}
              
              {/* Cash Flow - FREE+ (Left) */}
              <CashFlowCard data={displayData?.cashflow} onEdit={openCardEditor} />
              
              {/* Rainy Day Fund - CLIMBER+ (Right) */}
              {hasDashboardCardAccess(userPlan, 'emergency-fund') ? (
                <RainyDayFundCard data={displayData?.rainyDayFund} onEdit={openCardEditor} />
              ) : (
                <LockedCard cardName="Rainy Day Fund" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
              )}
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* ROW 2: CORE MECHANICS (Inflow & Outflow) */}
              {/* ═══════════════════════════════════════════════════════ */}
              
              {/* Monthly Income - FREE+ (Left) */}
              <IncomeCard data={displayData?.income} viewMode={viewMode} />
              
              {/* Monthly Expenses - FREE+ (Right) */}
              <ExpensesCard data={displayData?.expenses} viewMode={viewMode} />
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* ROW 3: THE BIG PICTURE (Assets & Liquidity) */}
              {/* ═══════════════════════════════════════════════════════ */}
              
              {/* Net Worth - FREE+ (Left) */}
              <FinancialErrorBoundary componentName="Net Worth Calculator">
                <NetWorthCard data={displayData?.netWorth} onEdit={openCardEditor} />
              </FinancialErrorBoundary>
              
              {/* Cash on Hand - CLIMBER+ (Right) */}
              {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                <FinancialErrorBoundary componentName="Cash Management">
                  <CashOnHandCard data={displayData?.cashOnHand} onEdit={openCardEditor} />
                </FinancialErrorBoundary>
              ) : (
                <LockedCard cardName="Cash on Hand" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
              )}
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* ROW 4: LONG-TERM MISSION & PROGRESS */}
              {/* ═══════════════════════════════════════════════════════ */}
              
              {/* Financial Freedom Goal - CLIMBER+ (Left) */}
              {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                <FinancialErrorBoundary componentName="Financial Freedom Goal">
                  <FinancialFreedomCard data={displayData.financialFreedom} onEdit={openCardEditor} />
                </FinancialErrorBoundary>
              ) : (
                <LockedCard cardName="Financial Freedom Goal" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
              )}
              
              {/* Savings Rate - FREE+ (Right) */}
              <FinancialErrorBoundary componentName="Savings Rate Tracker">
                <SavingsRateCard data={displayData?.savingsRate} onEdit={openCardEditor} />
              </FinancialErrorBoundary>
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* FULL-WIDTH CARDS: Detailed Intelligence */}
              {/* ═══════════════════════════════════════════════════════ */}
              
              {/* Total Debt - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'debt-payoff') ? (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <DebtCard data={displayData?.debt} onEdit={openCardEditor} />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <LockedCard cardName="Total Debt & Payoff Plan" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Credit Score - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'credit-score') ? (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <CreditScoreCard data={displayData?.creditScore} onEdit={openCardEditor} />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <LockedCard cardName="Credit Score Tracking" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Financial Goals - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <GoalsCard data={displayData?.goals} onEdit={openCardEditor} />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <LockedCard cardName="Financial Goals" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Retirement Accounts - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <RegisteredAccountsCard 
                    data={displayData?.registeredAccounts} 
                    onEdit={openCardEditor} 
                  />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-6 lg:col-span-6">
                  <LockedCard cardName="Retirement Planning" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'budget' && (
            <ErrorBoundary>
              <BudgetCalculatorTab 
                checkFeatureAccess={checkFeatureAccess}
                showUpgradePromptForFeature={showUpgradePromptForFeature}
              />
            </ErrorBoundary>
          )}
          
          {activeTab === 'side-hustle' && (
            <FinancialErrorBoundary componentName="Side Hustle Management">
              <SideHustleTab data={data} setData={setData} userId={userId} />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'investment' && (
            <FinancialErrorBoundary componentName="Investment Portfolio">
              <InvestmentTab data={data} setData={setData} userId={userId} />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'transactions' && (
            <FinancialErrorBoundary componentName="Transaction Management">
              <TransactionsTab data={data} setData={setData} userId={userId} />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'travel' && (
            <FinancialErrorBoundary componentName="Travel Planning">
              <TravelTab data={data} setData={setData} userId={userId} />
            </FinancialErrorBoundary>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500">
          <p>Dashboard for the modern hustler. Keep building.</p>
          <div className="flex justify-center items-center gap-6 mt-4">
            <p className="text-xs">User ID: {userId}</p>
            <button
              onClick={exportAllData}
              className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
            >
              Export Data to CSV
            </button>
            <button
              onClick={openResetModal}
              className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Reset Data
            </button>
          </div>
        </footer>
      </div>
      )}

      {/* Floating Quick Expense Button - Only show when authenticated */}
      {user && !authLoading && (
        <>
          <button
            onClick={openQuickExpense}
            className="floating-quick-btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="Quick Expense Log"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </button>

          {/* Quick Expense Modal */}
          {showQuickExpense && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // Use the custom --vh property for height (iOS fix)
            height: 'calc(var(--vh, 1vh) * 100)',
            zIndex: 9999,
            padding: '1rem' // Add padding to prevent modal touching edges
          }}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
        >
          <Card 
            className="w-full max-w-md border-red-500/30"
            style={{
              margin: 0 // Keep margin at 0
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">⚡ Quick Expense</h3>
                <p className="text-xs text-gray-400">Log cash expenses fast!</p>
              </div>
              <button
                onClick={closeQuickExpense}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">What did you spend on?</label>
                <input
                  type="text"
                  placeholder="e.g., Coffee, Lunch, Gas, Groceries..."
                  value={quickExpense.description}
                  onChange={(e) => setQuickExpense({...quickExpense, description: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-red-400 focus:outline-none placeholder-gray-400"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={quickExpense.amount || ''}
                    onChange={(e) => setQuickExpense({...quickExpense, amount: e.target.value === '' ? '' : e.target.value})}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-red-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={quickExpense.date}
                    onChange={(e) => setQuickExpense({...quickExpense, date: e.target.value})}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-red-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-red-900/20 rounded-lg p-3 border border-red-600/30">
                <div className="text-xs text-red-200">
                  💡 <strong>Quick Tip:</strong> This logs to your personal cash expenses. 
                  For business expenses or other categories, use the full Transaction tab.
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeQuickExpense}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuickExpense}
                disabled={!quickExpense.description || !quickExpense.amount}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Expense
              </button>
            </div>
          </Card>
        </div>
          )}
        </>
      )}

      {/* Card Editing Modals */}
      {editingCard && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Card className="w-full max-w-2xl border-blue-500/30 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Edit {editingCard === 'financialFreedom' ? 'Financial Freedom Goal' :
                     editingCard === 'savingsRateTarget' ? 'Savings Rate Target' :
                     editingCard === 'rainyDayFund' ? 'Rainy Day Fund' :
                     editingCard === 'creditScore' ? 'Credit Score' :
                     editingCard === 'netWorth' ? 'Net Worth' :
                     editingCard === 'cashOnHand' ? 'Cash on Hand' :
                     editingCard === 'debt' ? 'Debt Management' :

                     editingCard === 'registeredAccounts' ? 'Registered Accounts' :
                     editingCard === 'goals' ? 'Financial Goals' : editingCard}
              </h3>
              <button
                onClick={closeCardEditor}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Financial Freedom Goal Modal */}
              {editingCard === 'financialFreedom' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Target Amount</label>
                      <input
                        type="number"
                        value={tempCardData.targetAmount || ''}
                        onChange={(e) => setTempCardData({...tempCardData, targetAmount: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Current Investments</label>
                      <input
                        type="number"
                        value={tempCardData.currentInvestments || ''}
                        onChange={(e) => setTempCardData({...tempCardData, currentInvestments: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Monthly Contribution</label>
                      <input
                        type="number"
                        value={tempCardData.monthlyContribution || ''}
                        onChange={(e) => setTempCardData({...tempCardData, monthlyContribution: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Annual Return %</label>
                      <input
                        type="number"
                        value={tempCardData.annualReturn || ''}
                        onChange={(e) => setTempCardData({...tempCardData, annualReturn: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Cash on Hand Modal */}
              {editingCard === 'cashOnHand' && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">Bank Accounts</h4>
                      <button
                        onClick={() => {
                          const newAccount = {
                            id: Date.now(),
                            name: '',
                            balance: 0,
                            type: 'Checking'
                          };
                          setTempCardData({
                            ...tempCardData,
                            accounts: [...(tempCardData.accounts || []), newAccount]
                          });
                        }}
                        className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Account
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(tempCardData.accounts || []).map((account, index) => (
                        <div key={account.id} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Account Name"
                                value={account.name}
                                onChange={(e) => {
                                  const updatedAccounts = [...tempCardData.accounts];
                                  updatedAccounts[index] = {...account, name: e.target.value};
                                  setTempCardData({...tempCardData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-teal-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-3">
                              <select
                                value={account.type}
                                onChange={(e) => {
                                  const updatedAccounts = [...tempCardData.accounts];
                                  updatedAccounts[index] = {...account, type: e.target.value};
                                  setTempCardData({...tempCardData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-teal-500 focus:outline-none"
                              >
                                <option value="Checking">Checking</option>
                                <option value="Savings">Savings</option>
                                <option value="Investment Cash">Investment Cash</option>
                                <option value="Money Market">Money Market</option>
                                <option value="CD">CD</option>
                              </select>
                            </div>
                            <div className="col-span-4">
                              <input
                                type="number"
                                placeholder="Balance"
                                value={account.balance || ''}
                                onChange={(e) => {
                                  const updatedAccounts = [...tempCardData.accounts];
                                  updatedAccounts[index] = {...account, balance: e.target.value === '' ? 0 : Number(e.target.value)};
                                  const newTotal = updatedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
                                  setTempCardData({...tempCardData, accounts: updatedAccounts, total: newTotal});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-teal-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                onClick={() => {
                                  const updatedAccounts = tempCardData.accounts.filter((_, i) => i !== index);
                                  const newTotal = updatedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
                                  setTempCardData({...tempCardData, accounts: updatedAccounts, total: newTotal});
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-3 bg-teal-900/20 rounded-lg border border-teal-600/30">
                      <div className="text-teal-400 font-semibold">
                        Total Cash on Hand: ${(tempCardData.total || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Debt Management Modal */}
              {editingCard === 'debt' && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">Debt Accounts</h4>
                      <button
                        onClick={() => {
                          const newAccount = {
                            id: Date.now(),
                            name: '',
                            balance: 0,
                            interestRate: 0,
                            minPayment: 0
                          };
                          // Ensure tempCardData has the right structure
                          const currentData = tempCardData || {};
                          setTempCardData({
                            ...currentData,
                            accounts: [...(currentData.accounts || []), newAccount]
                          });
                        }}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Debt
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {((tempCardData && tempCardData.accounts) || []).map((account, index) => (
                        <div key={account.id} className="bg-gray-700/50 rounded-lg p-3 border border-red-600/20">
                          <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">Account Name</label>
                              <input
                                type="text"
                                placeholder="Credit Card"
                                value={account.name || ''}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, name: e.target.value};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">Balance</label>
                              <input
                                type="number"
                                placeholder="10000"
                                value={account.balance || ''}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, balance: e.target.value === '' ? 0 : Number(e.target.value)};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-400 mb-1">APR %</label>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="19.9"
                                value={account.interestRate || ''}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, interestRate: e.target.value === '' ? 0 : Number(e.target.value)};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">Min Payment</label>
                              <input
                                type="number"
                                placeholder="200"
                                value={account.minPayment || ''}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, minPayment: e.target.value === '' ? 0 : Number(e.target.value)};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                onClick={() => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = (currentData.accounts || []).filter((_, i) => i !== index);
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-red-400 font-semibold">
                            Total Debt: ${((tempCardData && tempCardData.accounts) || []).reduce((sum, acc) => sum + (acc.balance || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-orange-400 font-semibold">
                            Min Payment: ${((tempCardData && tempCardData.accounts) || []).reduce((sum, acc) => sum + (acc.minPayment || 0), 0).toLocaleString()}/mo
                          </div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-semibold">
                            Avg APR: {(tempCardData && tempCardData.accounts && tempCardData.accounts.length > 0) ? 
                              (tempCardData.accounts.reduce((sum, acc) => sum + (acc.interestRate || 0), 0) / tempCardData.accounts.length).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Savings Rate Target Modal */}
              {editingCard === 'savingsRateTarget' && (
                <div>
                  <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                    <div className="text-blue-400 font-semibold text-sm mb-1">Current Rate (Auto-calculated)</div>
                    <div className="text-2xl font-bold text-blue-400">{data.savingsRate.current}%</div>
                    <div className="text-xs text-gray-300 mt-1">
                      Based on your actual income and expenses from transactions
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Target Savings Rate %</label>
                    <input
                      type="number"
                      value={tempCardData.target || ''}
                      onChange={(e) => setTempCardData({...tempCardData, target: Number(e.target.value)})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 50"
                      min="0"
                      max="100"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      <div className="grid grid-cols-1 gap-1">
                        <div>💡 <strong>Common targets:</strong></div>
                        <div>• 20% - Traditional advice</div>
                        <div>• 30-40% - Aggressive saving</div>
                        <div>• 50%+ - FIRE/Early retirement</div>
                        <div>• 60%+ - Digital nomad lifestyle</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rainy Day Fund Modal */}
              {editingCard === 'rainyDayFund' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Current Amount</label>
                    <input
                      type="number"
                      value={tempCardData.total || ''}
                      onChange={(e) => setTempCardData({...tempCardData, total: e.target.value === '' ? 0 : Number(e.target.value)})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Goal Amount</label>
                    <input
                      type="number"
                      value={tempCardData.goal || ''}
                      onChange={(e) => setTempCardData({...tempCardData, goal: Number(e.target.value)})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Credit Score Modal */}
              {editingCard === 'creditScore' && (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">Add New Credit Score</h4>
                      <div className="text-sm text-indigo-400">
                        Current: {tempCardData.current || 0}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">New Credit Score</label>
                        <input
                          type="number"
                          min="300"
                          max="850"
                          value={tempCardData.newScore || ''}
                          onChange={(e) => setTempCardData({...tempCardData, newScore: Number(e.target.value)})}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                          placeholder="750"
                        />
                        <div className="text-xs text-gray-400 mt-1">Range: 300-850</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Date</label>
                        <input
                          type="date"
                          value={tempCardData.newDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            console.log('Date selected:', e.target.value);
                            setTempCardData({...tempCardData, newDate: e.target.value});
                          }}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                        />
                        <div className="text-xs text-gray-400 mt-1">When was this score checked?</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (!tempCardData.newScore) return;
                        
                        const selectedDate = tempCardData.newDate || new Date().toISOString().split('T')[0];
                        console.log('Adding score entry:', { date: selectedDate, score: tempCardData.newScore });
                        const updatedHistory = [...(tempCardData.history || [])];
                        
                        // Add the new score entry to history
                        updatedHistory.push({
                          date: selectedDate,
                          score: tempCardData.newScore
                        });
                        
                        setTempCardData({
                          ...tempCardData,
                          current: tempCardData.newScore,
                          history: updatedHistory,
                          newScore: '',
                          newDate: new Date().toISOString().split('T')[0]
                        });
                      }}
                      disabled={!tempCardData.newScore}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Score Entry
                    </button>
                  </div>
                  
                  {/* Credit Score History */}
                  {tempCardData.history && tempCardData.history.length > 0 && (
                    <div className="bg-indigo-900/20 rounded-lg p-3 border border-indigo-600/30">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-indigo-200 font-semibold">📈 Score History</h5>
                        <div className="text-xs text-indigo-300">
                          {tempCardData.history.length} entries
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {[...tempCardData.history]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((entry, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded p-2">
                              <div className="flex items-center gap-3">
                                <div className={`text-lg font-bold ${
                                  entry.score >= 800 ? 'text-emerald-400' :
                                  entry.score >= 740 ? 'text-green-400' :
                                  entry.score >= 670 ? 'text-yellow-400' :
                                  entry.score >= 580 ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {entry.score}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  // Simple and reliable deletion - filter out this specific entry
                                  const updatedHistory = tempCardData.history.filter(item => 
                                    !(item.date === entry.date && item.score === entry.score)
                                  );
                                  setTempCardData({...tempCardData, history: updatedHistory});
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                      
                      <div className="mt-3 p-2 bg-indigo-800/20 rounded text-xs text-indigo-200">
                        💡 <strong>Tip:</strong> Check your credit score monthly to track improvements from paying down debt and maintaining good credit habits.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Net Worth Modal */}
              {editingCard === 'netWorth' && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">Assets & Liabilities</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newAsset = {
                              id: Date.now(),
                              name: '',
                              value: 0,
                              type: 'asset',
                              color: 'bg-emerald-500'
                            };
                            setTempCardData({
                              ...tempCardData,
                              breakdown: [...(tempCardData.breakdown || []), newAsset]
                            });
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 px-2 py-1 rounded bg-emerald-900/20"
                        >
                          <Plus className="w-4 h-4" />
                          Add Asset
                        </button>
                        <button
                          onClick={() => {
                            const newLiability = {
                              id: Date.now() + 1,
                              name: '',
                              value: 0,
                              type: 'liability',
                              color: 'bg-red-500'
                            };
                            setTempCardData({
                              ...tempCardData,
                              breakdown: [...(tempCardData.breakdown || []), newLiability]
                            });
                          }}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 px-2 py-1 rounded bg-red-900/20"
                        >
                          <Plus className="w-4 h-4" />
                          Add Liability
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {(tempCardData.breakdown || []).map((item, index) => (
                        <div key={item.id} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                              <label className="block text-xs text-gray-400 mb-1">
                                {item.type === 'asset' ? 'Asset Name' : 'Liability Name'}
                              </label>
                              <input
                                type="text"
                                placeholder={item.type === 'asset' ? 'e.g., House, Car, Savings' : 'e.g., Mortgage, Credit Card, Loan'}
                                value={item.name}
                                onChange={(e) => {
                                  const updatedBreakdown = [...tempCardData.breakdown];
                                  updatedBreakdown[index] = {...item, name: e.target.value};
                                  setTempCardData({...tempCardData, breakdown: updatedBreakdown});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-5">
                              <label className="block text-xs text-gray-400 mb-1">Value</label>
                              <input
                                type="number"
                                placeholder="Enter amount"
                                value={Math.abs(item.value) || ''}
                                onChange={(e) => {
                                  const updatedBreakdown = [...tempCardData.breakdown];
                                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                                  updatedBreakdown[index] = {
                                    ...item, 
                                    value: item.type === 'liability' ? -value : value
                                  };
                                  const newTotal = updatedBreakdown.reduce((sum, b) => sum + b.value, 0);
                                  setTempCardData({...tempCardData, breakdown: updatedBreakdown, total: newTotal});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs text-gray-400 mb-1">&nbsp;</label>
                              <button
                                onClick={() => {
                                  const updatedBreakdown = tempCardData.breakdown.filter((_, i) => i !== index);
                                  const newTotal = updatedBreakdown.reduce((sum, b) => sum + b.value, 0);
                                  setTempCardData({...tempCardData, breakdown: updatedBreakdown, total: newTotal});
                                }}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!tempCardData.breakdown || tempCardData.breakdown.length === 0) && (
                        <div className="text-center text-gray-400 py-4 border-2 border-dashed border-gray-600 rounded-lg">
                          No assets or liabilities added yet. Use the buttons above to get started.
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-emerald-900/20 rounded-lg border border-emerald-600/30">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 font-semibold">Total Net Worth:</span>
                        <span className="text-2xl font-bold text-white">
                          ${(tempCardData.total || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Assets: ${(tempCardData.breakdown || []).filter(item => item.type === 'asset').reduce((sum, item) => sum + item.value, 0).toLocaleString()} • 
                        Liabilities: ${Math.abs((tempCardData.breakdown || []).filter(item => item.type === 'liability').reduce((sum, item) => sum + item.value, 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Cash Flow Modal - REMOVED: Cash Flow is calculated from Income - Expenses */}

              {/* Retirement Accounts Modal - Fully Editable System */}
              {editingCard === 'registeredAccounts' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-purple-400">Manage Retirement Accounts</h3>
                    <button
                      onClick={() => {
                        const newAccount = {
                          id: `account_${Date.now()}`,
                          name: 'New Account',
                          contributed: 0,
                          limit: 0,
                          type: 'tax-free',
                          description: 'Custom retirement account'
                        };
                        setTempCardData({
                          ...tempCardData,
                          accounts: [...(tempCardData.accounts || []), newAccount]
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Account
                    </button>
                  </div>

                  {(!tempCardData.accounts || tempCardData.accounts.length === 0) ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Wallet className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">No Retirement Accounts</h4>
                        <p className="text-sm">Add your retirement accounts like TFSA, RRSP, 401(k), IRA, etc.</p>
                      </div>
                      <button
                        onClick={() => {
                          // Add default Canadian accounts as starting point
                          setTempCardData({
                            ...tempCardData,
                            accounts: [
                              {
                                id: 'tfsa_default',
                                name: 'TFSA',
                                contributed: 45000,
                                limit: 88000,
                                type: 'tax-free',
                                description: 'Tax-Free Savings Account'
                              },
                              {
                                id: 'rrsp_default', 
                                name: 'RRSP',
                                contributed: 25000,
                                limit: 31560,
                                type: 'tax-deferred',
                                description: 'Registered Retirement Savings Plan'
                              }
                            ]
                          });
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                      >
                        Add Default Accounts (TFSA & RRSP)
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tempCardData.accounts.map((account, index) => {
                        const colors = [
                          'green', 'blue', 'orange', 'teal', 'indigo', 'pink'
                        ];
                        const color = colors[index % colors.length];
                        
                        return (
                          <div key={account.id} className={`bg-${color}-900/20 rounded-lg p-4 border border-${color}-600/30 relative`}>
                            <div className="flex justify-between items-start mb-3">
                              <input
                                type="text"
                                value={account.name}
                                onChange={(e) => {
                                  const updated = [...tempCardData.accounts];
                                  updated[index] = { ...updated[index], name: e.target.value };
                                  setTempCardData({ ...tempCardData, accounts: updated });
                                }}
                                className={`text-lg font-semibold text-${color}-400 bg-transparent border-none outline-none focus:bg-gray-700/50 rounded px-2 py-1`}
                              />
                              <button
                                onClick={() => {
                                  const updated = tempCardData.accounts.filter((_, i) => i !== index);
                                  setTempCardData({ ...tempCardData, accounts: updated });
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Current Balance</label>
                                <input
                                  type="number"
                                  value={account.contributed}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], contributed: Number(e.target.value) };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  className={`w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-${color}-500 focus:outline-none`}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Contribution Limit</label>
                                <input
                                  type="number"
                                  value={account.limit}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], limit: Number(e.target.value) };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  className={`w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-${color}-500 focus:outline-none`}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Account Type</label>
                                <select
                                  value={account.type}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], type: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  className={`w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-${color}-500 focus:outline-none`}
                                >
                                  <option value="tax-free">Tax-Free</option>
                                  <option value="tax-deferred">Tax-Deferred</option>
                                  <option value="pension">Pension</option>
                                  <option value="savings">Savings</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Description</label>
                                <input
                                  type="text"
                                  value={account.description}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], description: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  placeholder="e.g., Tax-Free Savings Account"
                                  className={`w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-${color}-500 focus:outline-none`}
                                />
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                  <span>Contribution Room Used</span>
                                  <span>{Math.round((account.contributed / account.limit) * 100) || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                                    style={{ width: `${Math.min((account.contributed / account.limit) * 100, 100) || 0}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Account Type Badge */}
                              <div className={`inline-block px-2 py-1 bg-${color}-600/20 text-${color}-400 text-xs rounded border border-${color}-600/30`}>
                                {account.type.charAt(0).toUpperCase() + account.type.slice(1).replace('-', ' ')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Goals Modal */}
              {editingCard === 'goals' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">Financial Goals</h4>
                    <button
                      onClick={() => {
                        const newGoal = {
                          id: Date.now(),
                          name: '',
                          targetAmount: 0,
                          currentAmount: 0,
                          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
                        };
                        setTempCardData([...(tempCardData || []), newGoal]);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Goal
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(tempCardData || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No financial goals yet.</p>
                        <p className="text-sm">Click "Add Goal" to create your first one!</p>
                      </div>
                    ) : (
                      (tempCardData || []).map((goal, index) => (
                        <div key={goal.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="text-white font-medium">Goal #{index + 1}</h5>
                            <button
                              onClick={() => {
                                const updatedGoals = tempCardData.filter((_, i) => i !== index);
                                setTempCardData(updatedGoals);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Goal Name</label>
                              <input
                                type="text"
                                placeholder="e.g., New MacBook, Vacation, Car..."
                                value={goal.name}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, name: e.target.value};
                                  setTempCardData(updatedGoals);
                                }}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Target Amount</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={goal.targetAmount || ''}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, targetAmount: e.target.value === '' ? '' : Number(e.target.value)};
                                  setTempCardData(updatedGoals);
                                }}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Current Progress</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={goal.currentAmount || ''}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, currentAmount: e.target.value === '' ? '' : Number(e.target.value)};
                                  setTempCardData(updatedGoals);
                                }}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Target Date</label>
                              <input
                                type="date"
                                value={goal.targetDate}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, targetDate: e.target.value};
                                  setTempCardData(updatedGoals);
                                }}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          
                          {goal.targetAmount > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>${goal.currentAmount.toLocaleString()}</span>
                                <span>${goal.targetAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {(tempCardData || []).length > 0 && (
                    <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-600/30">
                      <div className="text-sm text-amber-200">
                        <strong>💡 Pro Tip:</strong> Set realistic deadlines and track progress regularly. 
                        Breaking big goals into smaller milestones helps maintain motivation!
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeCardEditor}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCardData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Data Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-red-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Reset Dashboard Data</h3>
              <button
                onClick={closeResetModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-600/30">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Warning: Data Reset</h4>
                    <p className="text-sm text-gray-300">
                      This action will permanently replace your current data. Choose carefully:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-medium">Reset Options:</h5>
                
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="resetType"
                      checked={!resetToSample}
                      onChange={() => setResetToSample(false)}
                      className="mt-1 text-red-400"
                    />
                    <div>
                      <div className="text-white font-medium">Fresh Start (Blank Data)</div>
                      <div className="text-xs text-gray-400">
                        Clear everything and start with empty dashboard
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetToSample}
                      onChange={() => setResetToSample(true)}
                      className="mt-1 text-red-400"
                    />
                    <div>
                      <div className="text-white font-medium">Sample Data</div>
                      <div className="text-xs text-gray-400">
                        Reset with example data for learning/demo purposes
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Start Date for Tracking:
                </label>
                <input
                  type="date"
                  value={resetStartDate}
                  onChange={(e) => setResetStartDate(e.target.value)}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-red-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400">
                  This will be your financial tracking start date
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3">
                <h5 className="text-white font-medium mb-2">What will be reset:</h5>
                <div className="text-sm space-y-1 text-gray-300">
                  <div>• All transactions and financial data</div>
                  <div>• Investment portfolio and holdings</div>
                  <div>• Business income/expense records</div>
                  <div>• Dashboard metrics and history</div>
                  <div>• Goals and savings targets</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeResetModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Reset Data
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Subscription Manager Modal */}
      {showSubscription && (
        <SubscriptionManager
          user={user}
          currentPlan={userPlan}
          onClose={() => setShowSubscription(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-700 pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-1">The Freedom Compass</h3>
              <p className="text-gray-400 text-sm">Navigate to your financial freedom</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm">
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTermsOfService(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-gray-500">
                © {new Date().getFullYear()} The Freedom Compass. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {/* Terms of Service Modal */}
      {showTermsOfService && (
        <TermsOfService onClose={() => setShowTermsOfService(false)} />
      )}

      {/* Help FAQ Modal */}
      {showHelpFAQ && (
        <HelpFAQ onClose={() => setShowHelpFAQ(false)} />
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          currentPlan={userPlan}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          featureName={upgradePromptData.featureName}
          requiredPlan={upgradePromptData.requiredPlan}
          onViewPlans={() => {
            setShowUpgradePrompt(false);
            setShowPricingModal(true);
          }}
          currentPlan={userPlan}
          onUpgrade={handleUpgrade}
          isFoundersCircleAvailable={isFoundersCircleAvailable()}
        />
      )}
      
      {/* 🛠️ SECURE DEVELOPER PANEL - Only visible to admin emails */}
      {showDevPanel && isAdmin && (
        <div className="fixed bottom-4 right-4 bg-gray-900 border-2 border-amber-500 rounded-lg shadow-2xl p-6 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold text-sm">🛠️ DEVELOPER MODE</h3>
            </div>
            <button
              onClick={() => setShowDevPanel(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <span className="text-green-400">●</span>
              Admin: {user?.email}
            </div>
            
            <div>
              <label className="text-gray-300 text-sm font-semibold block mb-2">
                Override Subscription Tier:
              </label>
              <select
                value={devOverridePlan || 'none'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'none') {
                    setDevOverridePlan(null);
                  } else {
                    setDevOverridePlan(value);
                    setUserPlan(value);
                  }
                }}
                className="w-full bg-gray-800 text-white border border-gray-700 hover:border-amber-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="none">🔄 Use Real Subscription</option>
                <option value={SUBSCRIPTION_TIERS.FREE}>🆓 FREE (Recon Kit)</option>
                <option value={SUBSCRIPTION_TIERS.CLIMBER}>🧗 CLIMBER ($7.99/mo)</option>
                <option value={SUBSCRIPTION_TIERS.OPERATOR}>⚙️ OPERATOR ($14.99/mo)</option>
                <option value={SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE}>👑 FOUNDER'S CIRCLE ($7.49/mo)</option>
              </select>
            </div>
            
            <div className="pt-3 border-t border-gray-700 space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Plan:</span>
                  <span className="text-amber-400 font-semibold">{currentUserPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Real Subscription:</span>
                  <span className="text-blue-400">{userPlan}</span>
                </div>
                {devOverridePlan && (
                  <div className="text-amber-400 text-center mt-2 bg-amber-500/10 rounded px-2 py-1">
                    ⚠️ Dev Override Active
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-2 text-xs text-gray-500 text-center border-t border-gray-700">
              Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-amber-400">Ctrl+Shift+Alt+D</kbd> to toggle
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the entire app with error boundary for maximum protection
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;

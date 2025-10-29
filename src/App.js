/* eslint-disable no-undef */
import React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n/config'; // Initialize i18n
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Building, LayoutDashboard, Calculator, Briefcase, Target, PiggyBank, Umbrella, ShieldCheck, Calendar, Plus, X, Edit, Trash2, CreditCard, BarChart3, PieChart, Repeat, Wallet, AlertTriangle, Crown, Save, HelpCircle, Award, MessageCircle, Send, Bug, Lightbulb, Edit3, ChevronDown, ChevronUp, Eye, EyeOff, Package, BookOpen, ChevronLeft, ChevronRight, Mountain } from 'lucide-react';
import * as d3 from 'd3';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import SubscriptionManager from './SubscriptionManager';
import ErrorBoundary from './components/ErrorBoundary';
import FinancialErrorBoundary from './components/FinancialErrorBoundary';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpFAQ from './components/HelpFAQ';
import PricingModal from './components/PricingModal';
import { ensureUserProfileInitialized, awardXp, deductXp, getRankFromXp, checkMilestoneUnlocks } from './utils/xp';
import MissionStatusBanner from './components/MissionStatusBanner';
import RankUpModal from './components/RankUpModal';
import RankMedalsPage from './components/RankMedalsPage';
import DebtPayoffProgressTracker from './components/DebtPayoffProgressTracker';
import FreedomMilestones from './components/FreedomMilestones';
import UpgradePrompt from './components/UpgradePrompt';
import FreedomJournal from './components/FreedomJournal';
import ReflectionsPage from './components/ReflectionsPage';
import FirstClimbProtocol from './components/FirstClimbProtocol';
import SupplyCrateSystem from './components/SupplyCrateSystem';
import MissionControl from './components/MissionControl';
import MissionCompleteModal from './components/MissionCompleteModal';
import QuickExpenseModal from './components/QuickExpenseModal';
import QuickJournalModal from './components/QuickJournalModal';
import FixedModal from './components/FixedModal';
// import MomentsModal from './components/MomentsModal'; // TODO: Create MomentsModal component
import MomentsFeed from './components/MomentsFeed';
import QuickStartGuide from './components/QuickStartGuide';
import ForgotPassword from './components/ForgotPassword';
import LanguageSwitcher from './components/LanguageSwitcher';
import UpdateNotification from './components/UpdateNotification';
import { hasFeatureAccess, hasDashboardCardAccess, getRequiredTier, isFoundersCircleAvailable, SUBSCRIPTION_TIERS } from './utils/subscriptionUtils';
import { formatDateForUser, getTodayInUserTimezone, getTimezoneInfo } from './utils/timezoneUtils';
import StealthCard from './components/StealthCard';
import { 
  isOnline, 
  getOfflineSummary
} from './utils/offlineUtils';
import { 
  createBackup, 
  getUserBackups, 
  restoreFromBackup,
  getDataSafetySummary,
  exportUserData,
  importUserData,
  validateDataIntegrity
} from './utils/dataSafetyUtils';

// Firebase Imports
import { db, auth, functions } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

// Firebase App ID available if needed
// const appId = process.env.REACT_APP_FIREBASE_APP_ID;

// Retirement accounts are now fully user-editable - no need for country configs!

// 🧹 PRODUCTION-READY LOGGING: Only log in development, silent in production
const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = isDevelopment ? console.log.bind(console) : () => {};
const infoLog = isDevelopment ? console.log.bind(console) : () => {};

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

// 💰 Auto-categorize INCOME transactions
const categorizeIncome = (description) => {
  const desc = description.toLowerCase();
  
  // Income categorization keywords
  const incomeKeywords = {
    'salary': ['salary', 'paycheck', 'pay', 'wage', 'employment', 'employer', 'work income', 'paystub', 'payroll'],
    'bonus': ['bonus', 'commission', 'incentive', 'reward', 'performance pay'],
    'investment': ['dividend', 'interest', 'capital gain', 'stock', 'crypto', 'roi', 'investment return', 'portfolio'],
    'consulting': ['consulting', 'freelance', 'contract', 'gig', 'side hustle', 'client', 'project'],
    'trading': ['trading', 'resale', 'flip', 'sell', 'sold'],
    'services': ['service', 'labor', 'hourly', 'job'],
    'products': ['product', 'goods', 'merchandise', 'sale'],
  };
  
  for (const [category, keywords] of Object.entries(incomeKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return {
        category: 'personal', // Default to personal, can be changed manually
        subcategory: category
      };
    }
  }
  
  // Default categorization for income
  return {
    category: 'personal',
    subcategory: 'salary' // Default income to salary instead of 'other'
  };
};

// 📅 Recurring Expense Utilities
const calculateNextDueDate = (frequency, dayOfMonth, dayOfWeek, monthOfYear, lastProcessed) => {
  const lastDate = new Date(lastProcessed);
  let nextDate = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      // 🔧 ENHANCED: Calculate next occurrence of the specified day of week
      const currentDay = lastDate.getDay();
      const targetDay = parseInt(dayOfWeek) || 0; // 0=Sunday, 1=Monday, ..., 6=Saturday
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // If target day already passed this week, go to next week
      nextDate.setDate(lastDate.getDate() + daysToAdd);
      break;
      
    case 'bi-weekly':
      // 🆕 NEW: Bi-weekly on specific day (e.g., "every other Thursday")
      const currentDayBiWeekly = lastDate.getDay();
      const targetDayBiWeekly = parseInt(dayOfWeek) || 0;
      let daysToAddBiWeekly = targetDayBiWeekly - currentDayBiWeekly;
      if (daysToAddBiWeekly <= 0) daysToAddBiWeekly += 7; // Next occurrence this week
      daysToAddBiWeekly += 7; // Add another week to make it bi-weekly (14 days total)
      nextDate.setDate(lastDate.getDate() + daysToAddBiWeekly);
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
        { id: 1, name: 'Credit Card', balance: 2800, initialDebt: 5000, amountPaid: 2200, interestRate: 19.99, minPayment: 75, dueDate: 15, notificationsEnabled: true, notificationDays: 3 },
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
    total: 1297,  // Matches actual transaction total
    categories: [
      { id: 1, name: 'Rent', amount: 900, color: 'bg-red-500' },
      { id: 2, name: 'Transportation', amount: 50, color: 'bg-yellow-500' },
      { id: 3, name: 'Groceries', amount: 120, color: 'bg-green-500' },
      { id: 4, name: 'Debt Payment', amount: 200, color: 'bg-blue-500' },
      { id: 5, name: 'Entertainment', amount: 27, color: 'bg-purple-500' },
      { id: 6, name: 'Other', amount: 0, color: 'bg-gray-400' },
    ]
  },
  cashflow: { total: 1703 },  // $3,000 income - $1,297 expenses = $1,703 savings
  savingsRate: { 
    current: 57,  // 57% savings rate (1,703 / 3,000)
    target: 40,
    monthly: 1703,
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
    // 🔧 FIX: Use relative dates (days ago from today) so sample data is ALWAYS in the past!
    { id: 1, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Salary - Full Time Job', amount: 3000, type: 'income', category: 'personal', subcategory: 'salary' },
    { id: 2, date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Rent Payment', amount: -900, type: 'expense', category: 'personal', subcategory: 'housing' },
    { id: 3, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Groceries', amount: -120, type: 'expense', category: 'personal', subcategory: 'food' },
    { id: 4, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Gas', amount: -50, type: 'expense', category: 'personal', subcategory: 'transport' },
    { id: 5, date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Credit Card Payment', amount: -200, type: 'expense', category: 'personal', subcategory: 'debt' },
    { id: 6, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Netflix', amount: -15, type: 'expense', category: 'personal', subcategory: 'entertainment' },
    { id: 7, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Coffee', amount: -12, type: 'expense', category: 'personal', subcategory: 'entertainment' },
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
      expenses: 1297,      // Matches actual transaction total
      cashflow: 1703,      // $3,000 - $1,297 = $1,703 savings
      businessIncome: 0,   // No business yet
      businessExpenses: 0,
      investmentValue: 0,  // Learning phase
      savingsRate: 57      // 1,703 / 3,000 = 57%
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
    wishlistCountries: [],  // Quick wishlist - countries you want to visit (no full trip needed)
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

// Financial Freedom Goal Card (SLATE - Premium)
const FinancialFreedomCard = ({ data, onEdit }) => {
  // i18n translation hook
  const { t } = useTranslation();
  
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.targetAmount) {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-slate-900/60 to-gray-900/60 border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Target className="w-6 h-6 mr-3 text-amber-400" />
            {t('dashboard.financialFreedomGoal')}
          </h2>
        </div>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
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
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 min-h-[320px] flex flex-col bg-gradient-to-br from-green-900/40 to-emerald-900/40">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Target className="w-6 h-6 mr-3 text-green-400" />
          {t('dashboard.financialFreedomGoal')}
        </h2>
        <button
          onClick={() => onEdit('financialFreedom', data)}
          className="text-green-400 hover:text-green-300 p-1 rounded-lg hover:bg-green-500/10 transition-colors"
          title={t('dashboard.editFinancialFreedomGoal')}
        >
          <Target className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="text-center bg-green-900/30 rounded-lg p-6 border border-green-500/30">
          <div className="text-5xl font-extrabold text-green-400">
            {progressPercentage.toFixed(1)}%
          </div>
          <div className="text-sm mt-2 font-semibold text-green-200">
            {progressPercentage >= 100 ? 'Goal Reached!' : 
             progressPercentage >= 75 ? 'Almost There!' :
             progressPercentage >= 50 ? 'Halfway!' :
             progressPercentage >= 25 ? 'Good Progress' : 'Getting Started'}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-green-200 mb-2">
            <span>Current: ${(parseFloat(data.currentInvestments) || 0).toLocaleString()}</span>
            <span>Target: ${(parseFloat(data.targetAmount) || 0).toLocaleString()}</span>
          </div>
          <ProgressBar 
            value={data.currentInvestments} 
            maxValue={data.targetAmount} 
            color="bg-green-500"
            height="h-3"
          />
        </div>
        
        <div className="text-center text-sm text-green-100 bg-green-900/30 rounded-lg p-3 border border-green-500/30">
          Investing <span className="text-green-400 font-semibold">${(parseFloat(data.monthlyContribution) || 0).toLocaleString()}</span>/mo → 
          <span className="text-white font-semibold"> {yearsToGoal}y {remainingMonths}m</span> {t('dashboard.toGoal')}
        </div>
      </div>
    </Card>
  );
};

// Savings Rate Card (SLATE GREEN - Growth/Progress)
const SavingsRateCard = ({ data, onEdit }) => {
  // i18n translation hook
  const { t } = useTranslation();
  
  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.current === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 min-h-[320px] flex flex-col bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <PiggyBank className="w-6 h-6 mr-3 text-teal-400" />
            {t('dashboard.savingsRate')}
          </h2>
        </div>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
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
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20 min-h-[320px] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <PiggyBank className="w-6 h-6 mr-3 text-blue-400" />
          <Tooltip text={t('tooltips.savingsRate')}>
            {t('dashboard.savingsRate')}
          </Tooltip>
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 rounded bg-blue-900/30 border border-blue-500/30 text-blue-200">
            Auto-calculated
          </div>
          <button
            onClick={() => onEdit('savingsRateTarget', data)}
            className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-blue-500/10 transition-colors"
            title={t('dashboard.editTargetSavingsRate')}
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="text-center bg-blue-900/30 rounded-lg p-6 border border-blue-500/30">
          <div className="text-5xl font-extrabold text-white">
            {data.current}%
          </div>
          <div className="text-sm mt-2 font-semibold text-blue-200">
            {getRateStatus(data.current)}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-white mb-2">
            <span>Current: {data.current}%</span>
            <span>Target: {data.target}%</span>
          </div>
          <ProgressBar 
            value={data.current} 
            maxValue={data.target} 
            color="bg-blue-500"
            height="h-3"
          />
        </div>
        
        <div className="text-center text-sm text-white rounded-lg p-3 bg-blue-900/30 border border-blue-500/30">
          Saving <span className="font-bold">${(parseFloat(data.monthly) || 0).toLocaleString()}</span> of <span className="font-bold">${(parseFloat(data.monthlyIncome) || 0).toLocaleString()}</span> monthly income
        </div>
      </div>
    </Card>
  );
};

// Rainy Day Fund Card - PREMIUM UPGRADE: Gamified Resilience Status 🎯
const RainyDayFundCard = ({ data, expenses, viewMode, onEdit }) => {
  const [showStatusLegend, setShowStatusLegend] = useState(false);
  
  // i18n translation hook
  const { t } = useTranslation();

  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Umbrella className="w-6 h-6 mr-3 text-blue-400" />
          {t('dashboard.rainyDayFund')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
      </Card>
    );
  }

  // 🔧 USE MONTHLY EXPENSES FROM EXPENSES CARD (same calculation as dashboard)
  const expensesTotal = expenses?.total || 0; // 🛡️ FIX: No expenses = 0 (not $2000!)
  // If in annual mode, divide by 12 to get actual monthly average
  const monthlyExpenses = viewMode === 'annual' ? expensesTotal / 12 : expensesTotal;
  const progressPercentage = (data.total / data.goal) * 100;
  const monthsOfExpenses = monthlyExpenses > 0 ? data.total / monthlyExpenses : 0;
  
  // 🎮 GAMIFIED RESILIENCE STATUS LOGIC (Color-coded by completion %)
  const getResilienceStatus = (percentage) => {
    if (percentage > 90) return { 
      status: t('dashboard.secureStatus'), 
      color: '#14B8A6',        // Vibrant Teal
      textColor: 'text-teal-400',
      bgColor: 'bg-teal-500',
      borderColor: 'border-teal-500/50'
    };
    if (percentage >= 50) return { 
      status: t('dashboard.goodProgressStatus'), 
      color: '#38BDF8',        // Sky Blue
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500',
      borderColor: 'border-sky-500/50'
    };
    if (percentage >= 25) return { 
      status: t('dashboard.buildingStatus'), 
      color: '#F59E0B',        // Energetic Amber
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-500/50'
    };
    return { 
      status: t('dashboard.needsWorkStatus'), 
      color: '#F43F5E',        // Urgent Rose
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500',
      borderColor: 'border-rose-500/50'
    };
  };

  const resilience = getResilienceStatus(progressPercentage);

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20 min-h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <Umbrella className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-400" />
            {t('dashboard.rainyDayFund')}
          </h2>
          {/* 📊 Status Legend Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowStatusLegend(true)}
              onMouseLeave={() => setShowStatusLegend(false)}
              onClick={() => setShowStatusLegend(!showStatusLegend)}
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title={t('tooltips.statusLegend')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Status Legend Tooltip */}
            {showStatusLegend && (
              <div className="absolute top-full right-0 sm:left-0 mt-2 w-64 sm:w-72 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 z-50 p-4">
                <h4 className="text-white font-semibold mb-3 text-sm">{t('tooltips.resilienceStatusLevels')}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-teal-900/20 rounded border border-teal-500/30">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <div className="flex-1">
                      <div className="text-teal-400 font-semibold">{t('tooltips.secureStatus')}</div>
                      <div className="text-gray-400">{t('tooltips.secureDescription')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-sky-900/20 rounded border border-sky-500/30">
                    <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                    <div className="flex-1">
                      <div className="text-sky-400 font-semibold">{t('tooltips.goodProgressStatus')}</div>
                      <div className="text-gray-400">{t('tooltips.goodProgressDescription')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-amber-900/20 rounded border border-amber-500/30">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="flex-1">
                      <div className="text-amber-400 font-semibold">{t('tooltips.buildingStatus')}</div>
                      <div className="text-gray-400">{t('tooltips.buildingDescription')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-rose-900/20 rounded border border-rose-500/30">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="flex-1">
                      <div className="text-rose-400 font-semibold">{t('tooltips.needsWorkStatus')}</div>
                      <div className="text-gray-400">{t('tooltips.needsWorkDescription')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm sm:text-base ${resilience.textColor}`}>
            {progressPercentage.toFixed(1)}%
          </span>
          <button
            onClick={() => onEdit('rainyDayFund', data)}
            className="text-gray-400 hover:text-blue-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4 mt-8">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2 stealth-target">
            ${(parseFloat(data.total) || 0).toLocaleString()}
          </div>
          {/* 🎯 DYNAMIC STATUS INDICATOR */}
          <div className={`text-base sm:text-lg font-bold ${resilience.textColor} mb-1`} style={{ color: resilience.color }}>
            {resilience.status}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            <span className="stealth-target">{monthsOfExpenses.toFixed(1)}</span> {t('dashboard.monthsOfExpensesCovered')}
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
            <span>{t('dashboard.currentLabel')}: <span className="stealth-target">${(parseFloat(data.total) || 0).toLocaleString()}</span></span>
            <span>{t('dashboard.goalLabel')}: <span className="stealth-target">${(parseFloat(data.goal) || 0).toLocaleString()}</span></span>
          </div>
          {/* 🎨 DYNAMIC COLOR PROGRESS BAR */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${resilience.bgColor}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              <div className="h-full w-full animate-pulse opacity-20 bg-white"></div>
            </div>
          </div>
        </div>
        
        <div className={`bg-gray-800/50 rounded-lg p-3 border ${resilience.borderColor}`}>
          <div className="text-xs sm:text-sm text-gray-300 text-center">
            {t('dashboard.goalLabel')}: ${(parseFloat(data.goal) || 0).toLocaleString()} ({((parseFloat(data.goal) || 0) / (monthlyExpenses || 1)).toFixed(1)} {t('dashboard.monthsOfExpenses')})
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            {viewMode === 'annual' 
              ? t('dashboard.basedOnYearAvg', { 
                  yearly: (monthlyExpenses * 12).toFixed(2), 
                  monthly: monthlyExpenses.toFixed(2) 
                })
              : t('dashboard.basedOnMonthAvg', { 
                  monthly: monthlyExpenses.toFixed(2) 
                })
            }
          </div>
        </div>
      </div>
    </Card>
  );
};

// Credit Score Card with History Chart
const CreditScoreCard = ({ data, onEdit }) => {
  const svgRef = useRef();
  
  // i18n translation hook
  const { t } = useTranslation();

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
          {t('dashboard.creditScore')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
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
          {t('dashboard.creditScore')}
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
                {scoreChange > 0 ? '↑' : scoreChange < 0 ? '↓' : '→'} {Math.abs(scoreChange)}
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

// 🎯 Goals Card - CLIMBER+ Feature (Unlimited Goals)
const GoalsCard = ({ data, onEdit }) => {
  // Ensure data is always an array
  const goals = Array.isArray(data) ? data : [];
  
  // i18n translation hook
  const { t } = useTranslation();

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-amber-400" />
          {t('dashboard.financialGoals')}
        </h2>
        <button
          onClick={() => onEdit('goals', goals)}
          className="text-gray-400 hover:text-amber-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          title={t('dashboard.editGoals')}
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      {goals.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="inline-block bg-amber-500/10 rounded-full p-6 mb-4">
            <Target className="w-12 h-12 text-amber-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-6">
            Set your financial goals and track your progress!
          </p>
          <button
            onClick={() => onEdit('goals', goals)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('dashboard.addYourFirstGoal')}
          </button>
        </div>
      ) : (
        // Goals Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progressPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isComplete = progressPercentage >= 100;
            
            return (
              <div 
                key={goal.id} 
                className={`bg-gray-700/30 rounded-xl p-4 border transition-all ${
                  isComplete ? 'border-green-500/30' : 'border-amber-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white flex-1 pr-2">{goal.name}</h3>
                  <span className={`text-sm font-semibold ${
                    isComplete ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>${(parseFloat(goal.currentAmount) || 0).toLocaleString()}</span>
                      <span>${(parseFloat(goal.targetAmount) || 0).toLocaleString()}</span>
                    </div>
                    <ProgressBar 
                      value={goal.currentAmount || 0} 
                      maxValue={goal.targetAmount || 1} 
                      color={isComplete ? "bg-green-500" : "bg-amber-500"}
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
                      {isComplete ? `🎉 ${t('dashboard.complete')}` : `$${(parseFloat(remaining) || 0).toLocaleString()}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isComplete ? t('dashboard.goalAchieved') : t('dashboard.remaining')}
                    </div>
                  </div>
                  
                  {goal.targetDate && (
                    <div className="text-center text-xs text-gray-400">
                      Target: {new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// 🎯 COMMAND CENTER: Net Worth Card with Donut Chart
const NetWorthCard = ({ data, onEdit }) => {
  const netWorthChartRef = useRef(null);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showAllLiabilities, setShowAllLiabilities] = useState(false);
  const maxVisibleItems = 3;
  
  // i18n translation hook
  const { t } = useTranslation();
  
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

  // Null safety check
  if (!data || data.total === undefined) {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-sky-900/40 to-blue-900/40">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-white flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-sky-400" />
            {t('dashboard.netWorth')}
          </h2>
          <button
            onClick={() => onEdit('netWorth', data || {})}
            className="text-gray-400 hover:text-sky-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="text-5xl font-extrabold text-white">$0</p>
        <p className="text-gray-400 text-sm mt-2">{t('emptyStates.clickEditToAddAssetsLiabilities')}</p>
      </Card>
    );
  }

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-sky-900/40 to-blue-900/40 min-h-[420px] flex flex-col">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-bold text-white flex items-center">
        <DollarSign className="w-6 h-6 mr-3 text-sky-400" />
        {t('dashboard.netWorth')}
      </h2>
      <button
        onClick={() => onEdit('netWorth', data)}
        className="text-gray-400 hover:text-sky-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <p className="text-5xl font-extrabold text-white stealth-target">${(parseFloat(data.total) || 0).toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center">
      <svg ref={netWorthChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#84CC16'}}></div>
          <span className="text-sm text-gray-300">Assets: <span className="stealth-target">${(parseFloat(totalAssets) || 0).toLocaleString()}</span></span>
        </div>
        {totalLiabilities > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#F43F5E'}}></div>
            <span className="text-sm text-gray-300">Liabilities: <span className="stealth-target">${(parseFloat(totalLiabilities) || 0).toLocaleString()}</span></span>
          </div>
        )}
      </div>
    </div>
    
    {/* 📋 NET WORTH BREAKDOWN - Side by Side Layout */}
    {data.breakdown && data.breakdown.length > 0 && (
      <div className="border-t border-sky-800/50 pt-4 mt-4">
        <h3 className="text-xs sm:text-sm font-semibold text-sky-300 uppercase tracking-wide mb-3">Breakdown</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Assets Section - Left Column */}
          {data.breakdown.filter(item => item.type === 'asset').length > 0 && (
            <div>
              <h4 className="text-xs text-green-400 font-semibold mb-2">💰 Assets</h4>
              <div className="space-y-2">
                {(showAllAssets 
                  ? data.breakdown.filter(item => item.type === 'asset')
                  : data.breakdown.filter(item => item.type === 'asset').slice(0, maxVisibleItems)
                ).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-white font-medium truncate mr-1">{item.name}</span>
                    <span className="text-green-400 font-semibold whitespace-nowrap stealth-target">${(parseFloat(item.value) || 0).toLocaleString()}</span>
                  </div>
                ))}
                {data.breakdown.filter(item => item.type === 'asset').length > maxVisibleItems && (
                  <button
                    onClick={() => setShowAllAssets(!showAllAssets)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    {showAllAssets ? (
                      <><ChevronUp className="w-3 h-3" /> Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3" /> +{data.breakdown.filter(item => item.type === 'asset').length - maxVisibleItems}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Liabilities Section - Right Column */}
          {data.breakdown.filter(item => item.type === 'liability').length > 0 && (
            <div>
              <h4 className="text-xs text-red-400 font-semibold mb-2">💳 Liabilities</h4>
              <div className="space-y-2">
                {(showAllLiabilities 
                  ? data.breakdown.filter(item => item.type === 'liability')
                  : data.breakdown.filter(item => item.type === 'liability').slice(0, maxVisibleItems)
                ).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-white font-medium truncate mr-1">{item.name}</span>
                    <span className="text-red-400 font-semibold whitespace-nowrap stealth-target">-${Math.abs(parseFloat(item.value) || 0).toLocaleString()}</span>
                  </div>
                ))}
                {data.breakdown.filter(item => item.type === 'liability').length > maxVisibleItems && (
                  <button
                    onClick={() => setShowAllLiabilities(!showAllLiabilities)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    {showAllLiabilities ? (
                      <><ChevronUp className="w-3 h-3" /> Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3" /> +{data.breakdown.filter(item => item.type === 'liability').length - maxVisibleItems}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </Card>
  );
};

// Editable Retirement Accounts Card
const RegisteredAccountsCard = ({ data, onEdit }) => {
  // i18n translation hook
  const { t } = useTranslation();
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.accounts) {
    return (
      <Card className="col-span-1 md:col-span-6 lg:col-span-6" style={{background: 'radial-gradient(circle at top, rgba(251, 191, 36, 0.15), rgba(15, 23, 42, 0.95))'}}>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Mountain className="w-7 h-7 mr-3" style={{color: '#FBBF24'}} />
          {t('dashboard.retirementAccounts')}
        </h2>
        <div className="text-center py-8" style={{color: 'rgba(255, 255, 255, 0.6)'}}>{t('common.loading')}</div>
      </Card>
    );
  }

  const accounts = data?.accounts || [];
  
  // Calculate totals
  const totalContributed = accounts.reduce((sum, account) => sum + account.contributed, 0);
  const totalLimit = accounts.reduce((sum, account) => sum + account.limit, 0);
  const totalRoom = totalLimit - totalContributed;

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Mountain className="w-6 h-6 mr-3 text-blue-400" />
            {t('dashboard.retirementAccounts')}
          </h2>
          <p className="text-sm text-blue-200 mt-1 ml-9">Building your legacy, one contribution at a time.</p>
        </div>
        <button
          onClick={() => onEdit('registeredAccounts', data)}
          className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-blue-500/10 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className={`grid grid-cols-1 ${accounts.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {accounts.map((account, index) => {
          const progress = (account.contributed / account.limit) * 100;
          const roomUsed = account.contributed;
          const roomAvailable = account.limit - account.contributed;
          
          // 🎨 PROJECT SUMMIT: Unique vibrant gradients per account type!
          const isGoalReached = account.goal && account.contributed >= account.goal;
          
          // 🎨 BLUE THEME COMPLEMENT: Sky (TFSA) + Cyan (RRSP) - Clean & Elegant
          const isTFSA = account.name.toUpperCase().includes('TFSA') || account.name.toUpperCase().includes('TAX-FREE');
          const cardBg = isTFSA 
            ? 'from-sky-900/40 to-blue-900/40' // Sky blue (tax-free clarity)
            : 'from-cyan-900/40 to-teal-900/40'; // Cyan-teal (growth)
          const textColor = isTFSA ? 'text-sky-400' : 'text-cyan-400';
          const bgColor = isTFSA ? 'bg-sky-900/30' : 'bg-cyan-900/30';
          const borderColor = isTFSA ? 'border-sky-500/30' : 'border-cyan-500/30';
          const progressColor = isTFSA ? 'bg-sky-500' : 'bg-cyan-500';
          
          return (
            <div key={account.id} className={`bg-gradient-to-br ${cardBg} rounded-lg p-5 border ${borderColor}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                    {account.name}
                    {isGoalReached && <span className="text-xs">🏆</span>}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">{account.description}</p>
                </div>
                <span className={`text-sm font-semibold ${textColor} px-2 py-1 ${bgColor} rounded border ${borderColor}`}>
                  {progress.toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-4">
                <div className={`text-center ${bgColor} rounded-lg p-4 border ${borderColor}`}>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${(parseFloat(account.contributed) || 0).toLocaleString()}
                  </div>
                  <div className={`text-sm ${textColor}`}>Total Contributed</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-2">
                    <span>Contributed: ${(parseFloat(roomUsed) || 0).toLocaleString()}</span>
                    <span>Limit: ${(parseFloat(account.limit) || 0).toLocaleString()}</span>
                  </div>
                  <ProgressBar 
                    value={roomUsed} 
                    maxValue={account.limit} 
                    color={progressColor}
                    height="h-3"
                  />
                  <div className={`text-xs ${textColor} mt-2 text-center font-semibold`}>
                    ${(parseFloat(roomAvailable) || 0).toLocaleString()} {t('dashboard.roomRemaining')}
                  </div>
                </div>
                
                {account.goal && account.goal > 0 && (
                  <div className={`${bgColor} border ${borderColor} rounded-lg p-3 text-center`}>
                    <div className={`text-xs ${textColor} mb-1`}>{t('dashboard.annualGoal')}</div>
                    <div className="text-lg font-bold text-white">${(parseFloat(account.goal) || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {isGoalReached ? '✓ Goal Reached!' : `$${((parseFloat(account.goal) || 0) - (parseFloat(account.contributed) || 0)).toLocaleString()} to go`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {accounts.length > 0 && (
        <div className="mt-6 bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">${(parseFloat(totalContributed) || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-300 mt-1">Total Contributed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">${(parseFloat(totalRoom) || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-300 mt-1">Total Room Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{((totalContributed/totalLimit)*100).toFixed(1)}%</div>
              <div className="text-xs text-gray-300 mt-1">Contribution Rate</div>
            </div>
          </div>
        </div>
      )}
      
      {accounts.length === 0 && (
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-400">No retirement accounts configured</p>
          <p className="text-sm text-gray-500 mt-1">{t('emptyStates.clickEditToAddRetirementAccounts')}</p>
        </div>
      )}
    </Card>
  );
};

// Debt Management Card
const DebtCard = ({ data, onEdit }) => {
  // i18n translation hook
  const { t } = useTranslation();
  // 🛡️ NULL SAFETY CHECK
  if (!data || !data.accounts) {
    return (
      <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-rose-900/40 to-pink-900/40">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <CreditCard className="w-6 h-6 mr-3 text-rose-400" />
          {t('dashboard.totalDebt')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
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
        title={t('tooltips.editDebt')}
      >
        <Edit className="w-4 h-4 text-rose-300" />
      </button>

      <h2 className="text-xl font-bold text-white mb-2 flex items-center">
        <CreditCard className="w-6 h-6 mr-3 text-rose-400" />
        {t('dashboard.totalDebt')}
      </h2>
      <p className="text-5xl font-extrabold text-white">${(parseFloat(totalDebt) || 0).toLocaleString()}</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-800/20 rounded-lg p-3">
          <p className="text-rose-300 text-sm">Min. Payment</p>
          <p className="text-white font-bold">${(parseFloat(totalMinPayment) || 0).toLocaleString()}/mo</p>
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
              <span className="text-red-400 font-semibold">${(parseFloat(account.balance) || 0).toLocaleString()}</span>
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

// Cash on Hand Card - PREMIUM UPGRADE: Survival Runway Calculator 🎯
const CashOnHandCard = ({ data, rainyDayGoal, transactions = [], onEdit }) => {
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const maxVisibleAccounts = 3;
  
  // i18n translation hook
  const { t } = useTranslation();
  
  // 🛡️ NULL SAFETY CHECK
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-600/30">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Wallet className="w-6 h-6 mr-3 text-teal-400" />
          {t('dashboard.survivalRunway')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
      </Card>
    );
  }

  // 📊 CALCULATE CURRENT MONTHLY EXPENSES (Same as Monthly Expenses Card!)
  // 🔧 CRITICAL FIX: Use CURRENT MONTH, not 3-month average!
  const calculateCurrentMonthlyExpenses = () => {
    if (!transactions || transactions.length === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 🔧 CRITICAL FIX: Get CURRENT MONTH expenses only (matches Monthly Expenses card!)
    const currentMonthExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // 🛡️ FIX: Round to 2 decimal places for display (e.g., $1,559.35)
    return Math.round(currentMonthExpenses * 100) / 100;
  };

  // 🎯 SURVIVAL RUNWAY CALCULATION (Using CURRENT month burn rate)
  const avgMonthlyExpenses = calculateCurrentMonthlyExpenses();
  const runwayMonths = avgMonthlyExpenses > 0 ? data.total / avgMonthlyExpenses : 0;
  
  // 🚨 STATUS INDICATOR LOGIC
  const getRunwayStatus = (months) => {
    if (months >= 6) return { label: 'Secure', color: '#14B8A6', bgColor: 'bg-teal-500', textColor: 'text-teal-400' };
    if (months >= 3) return { label: 'Good', color: '#38BDF8', bgColor: 'bg-sky-500', textColor: 'text-sky-400' };
    if (months >= 1) return { label: 'Fair', color: '#F59E0B', bgColor: 'bg-amber-500', textColor: 'text-amber-400' };
    return { label: 'Critical', color: '#F43F5E', bgColor: 'bg-rose-500', textColor: 'text-rose-400' };
  };
  
  const status = getRunwayStatus(runwayMonths);
  
  // 📊 PROGRESS BAR CALCULATION (against Rainy Day Fund goal)
  const goalMonths = rainyDayGoal || 6; // Default to 6 months if no goal
  const progressPercent = Math.min((runwayMonths / goalMonths) * 100, 100);

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-600/30 min-h-[420px] flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-400" />
        {t('dashboard.survivalRunway')}
      </h2>
      <button
        onClick={() => onEdit('cashOnHand', data)}
        className="text-gray-400 hover:text-teal-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    
    {/* 🎯 HERO METRIC: Runway Time */}
    <div className="mb-2">
      <p className={`text-4xl sm:text-5xl font-extrabold ${status.textColor} mb-1`}>
        <span className="stealth-target">{runwayMonths.toFixed(1)}</span> <span className="text-2xl sm:text-3xl">{t('dashboard.months')}</span>
      </p>
      <p className="text-sm font-semibold" style={{ color: status.color }}>
        {status.label}
      </p>
    </div>
    
    {/* 💰 Cash Amount (Secondary) */}
    <p className="text-lg text-gray-300 mb-4 stealth-target">
      ${(parseFloat(data.total) || 0).toLocaleString()} cash on hand
    </p>
    
    {/* 📊 RUNWAY PROGRESS BAR */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
        <span className="text-gray-400">Runway Progress</span>
        <span className="text-white font-semibold">{progressPercent.toFixed(0)}% of {goalMonths}-month goal</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${status.bgColor}`}
          style={{ width: `${progressPercent}%` }}
        >
          <div className="h-full w-full animate-pulse opacity-20 bg-white"></div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
        <span>0 months</span>
        <span>{goalMonths} months (goal)</span>
      </div>
    </div>
    
    {/* 📋 ACCOUNT BREAKDOWN */}
    <div className="border-t border-teal-800/50 pt-4">
      <h3 className="text-xs sm:text-sm font-semibold text-teal-300 uppercase tracking-wide mb-3">Account Breakdown</h3>
      <div className="space-y-2 mb-3">
        {(showAllAccounts ? data.accounts : data.accounts.slice(0, maxVisibleAccounts)).map(account => (
          <div key={account.id} className="flex justify-between items-center text-xs sm:text-sm">
            <div>
              <span className="text-white font-medium">{account.name}</span>
              <span className="text-gray-400 ml-2 text-[10px] sm:text-xs">({account.type})</span>
            </div>
            <span className="text-teal-300 font-semibold stealth-target">${(parseFloat(account.balance) || 0).toLocaleString()}</span>
          </div>
        ))}
        {data.accounts.length > maxVisibleAccounts && (
          <button
            onClick={() => setShowAllAccounts(!showAllAccounts)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {showAllAccounts ? (
              <><ChevronUp className="w-3 h-3" /> Show Less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Show {data.accounts.length - maxVisibleAccounts} More</>
            )}
          </button>
        )}
      </div>
      <div className="text-[10px] sm:text-xs text-gray-400 flex flex-wrap items-center gap-2">
        <span>{data.accounts.length} accounts</span>
        <span>•</span>
        <span>Current month expenses: <span className="stealth-target">${(parseFloat(avgMonthlyExpenses) || 0).toLocaleString()}/mo</span></span>
      </div>
    </div>
  </Card>
  );
};

// 🎯 COMMAND CENTER: Income Card with Donut Chart
const IncomeCard = ({ data, viewMode }) => {
  const incomeChartRef = useRef(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const maxVisibleItems = 3;
  
  // i18n translation hook
  const { t } = useTranslation();
  
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
          {viewMode === 'annual' ? t('dashboard.annualIncome') : t('dashboard.monthlyIncome')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
      </Card>
    );
  }

  const hasMore = data.sources.length > maxVisibleItems;
  const displayedSources = showAllSources ? data.sources : data.sources.slice(0, maxVisibleItems);

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40 min-h-[420px] flex flex-col">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowUp className="w-6 h-6 mr-3 text-teal-400" />
      {viewMode === 'annual' ? t('dashboard.annualIncome') : t('dashboard.monthlyIncome')}
    </h2>
    <p className="text-5xl font-extrabold text-white stealth-target">${(parseFloat(data.total) || 0).toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center flex-1">
      <svg ref={incomeChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 space-y-1 w-full">
        {displayedSources.map((source, idx) => {
          const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
          return (
            <div key={source.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: vibrantColors[idx % vibrantColors.length] }}></div>
              <span className="text-xs text-gray-300">{source.name}: <span className="stealth-target">${(parseFloat(source.amount) || 0).toLocaleString()}</span></span>
            </div>
          );
        })}
        {hasMore && (
          <button
            onClick={() => setShowAllSources(!showAllSources)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {showAllSources ? (
              <><ChevronUp className="w-3 h-3" /> Show Less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Show {data.sources.length - maxVisibleItems} More</>
            )}
          </button>
        )}
      </div>
    </div>
  </Card>
  );
};

// 🎯 COMMAND CENTER: Expenses Card with Donut Chart
const ExpensesCard = ({ data, viewMode }) => {
  const expensesChartRef = useRef(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const maxVisibleItems = 3;
  
  // i18n translation hook
  const { t } = useTranslation();
  
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
          {viewMode === 'annual' ? t('dashboard.annualExpenses') : t('dashboard.monthlyExpenses')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
      </Card>
    );
  }

  const hasMore = data.categories.length > maxVisibleItems;
  const displayedCategories = showAllCategories ? data.categories : data.categories.slice(0, maxVisibleItems);

  return (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-rose-900/40 to-pink-900/40 min-h-[420px] flex flex-col">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowDown className="w-6 h-6 mr-3 text-rose-400" />
      {viewMode === 'annual' ? t('dashboard.annualExpenses') : t('dashboard.monthlyExpenses')}
    </h2>
    <p className="text-5xl font-extrabold text-white stealth-target">${(parseFloat(data.total) || 0).toLocaleString()}</p>
    
    {/* Donut Chart */}
    <div className="mt-4 flex flex-col items-center flex-1">
      <svg ref={expensesChartRef}></svg>
      
      {/* Legend */}
      <div className="mt-3 space-y-1 w-full">
        {displayedCategories.map((cat, idx) => {
          const vibrantColors = ['#FBBF24', '#38BDF8', '#F43F5E', '#8B5CF6', '#14B8A6', '#84CC16'];
          return (
            <div key={cat.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: vibrantColors[idx % vibrantColors.length] }}></div>
              <span className="text-xs text-gray-300">{cat.name}: <span className="stealth-target">${(parseFloat(cat.amount) || 0).toLocaleString()}</span></span>
            </div>
          );
        })}
        {hasMore && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {showAllCategories ? (
              <><ChevronUp className="w-3 h-3" /> Show Less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Show {data.categories.length - maxVisibleItems} More</>
            )}
          </button>
        )}
      </div>
    </div>
  </Card>
  );
};

// Cash Flow Card (TEAL - Positive Growth) - PREMIUM UPGRADE 🎯
const CashFlowCard = ({ data, income, expenses, transactions = [] }) => {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null); // DOM ref for tooltip (no React state!)
  const [chartKey, setChartKey] = useState(0); // For forcing re-render on resize
  
  // i18n translation hook
  const { t } = useTranslation();

  // 📊 CALCULATE 3-MONTH HISTORICAL CASH FLOW
  const calculate3MonthTrend = () => {
    if (!transactions || transactions.length === 0) return [];
    const now = new Date();
    const monthsData = [];
    
    for (let i = 2; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
      });
      
      // Calculate income and expenses for this month
      const monthIncome = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = Math.abs(monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
      
      const cashFlow = monthIncome - monthExpenses;
      
      monthsData.push({
        month: targetDate.toLocaleDateString('en-US', { month: 'short' }),
        year: targetYear,
        cashFlow: cashFlow,
        income: monthIncome,
        expenses: monthExpenses,
        isCurrent: i === 0
      });
    }
    
    return monthsData;
  };
  
  const trendData = calculate3MonthTrend();

  // 📱 Handle window resize for mobile responsiveness
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      // Debounce resize to prevent excessive re-renders
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (chartRef.current && trendData.length > 0) {
          // Force re-render by clearing and letting useEffect run again
          d3.select(chartRef.current).selectAll("*").remove();
          setChartKey(prev => prev + 1);
        }
      }, 250); // Wait 250ms after resize stops
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [trendData]);

  // 🎨 D3.js Mini Bar Chart - Mobile Responsive
  useEffect(() => {
    if (!chartRef.current || trendData.length === 0) return;

    const container = chartRef.current;
    const containerWidth = container.clientWidth || 300; // Fallback width
    const containerHeight = 120;
    const margin = { top: 10, right: 5, bottom: 25, left: 35 }; // Reduced margins for mobile
    const width = Math.max(containerWidth - margin.left - margin.right, 100); // Ensure minimum width
    const height = containerHeight - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMid meet")
      .style("max-width", "100%")
      .style("overflow", "visible")
      .style("display", "block");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(trendData.map(d => d.month))
      .range([0, width])
      .padding(0.3);

    const maxAbsValue = d3.max(trendData, d => Math.abs(d.cashFlow)) || 1000;
    const y = d3.scaleLinear()
      .domain([-maxAbsValue * 1.1, maxAbsValue * 1.1])
      .range([height, 0]);

    // Add zero line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Bars
    g.selectAll(".bar")
      .data(trendData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.month))
      .attr("y", d => d.cashFlow >= 0 ? y(d.cashFlow) : y(0))
      .attr("width", x.bandwidth())
      .attr("height", d => Math.abs(y(d.cashFlow) - y(0)))
      .attr("fill", d => d.isCurrent ? "#FBBF24" : "#14B8A6") // Amber for current, Teal for past
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Update tooltip via DOM (no React re-render!)
        if (tooltipRef.current) {
          tooltipRef.current.textContent = `${d.month}: ${d.cashFlow >= 0 ? '+' : ''}$${d.cashFlow.toLocaleString()}`;
          tooltipRef.current.style.display = 'block';
        }
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        // Hide tooltip via DOM
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        d3.select(this).attr("opacity", 1);
      });

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", containerWidth < 400 ? "9px" : "11px"); // Smaller on mobile

    // Remove axis line
    g.select(".domain").remove();

    // Y Axis with $ formatting - adaptive for mobile
    const yAxis = d3.axisLeft(y)
      .ticks(containerWidth < 400 ? 3 : 4) // Fewer ticks on mobile
      .tickFormat(d => containerWidth < 400 ? `$${(d/1000).toFixed(0)}k` : `$${(d/1000).toFixed(1)}k`);
    
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", containerWidth < 400 ? "9px" : "11px"); // Smaller on mobile

    g.selectAll(".tick line")
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2");

  }, [trendData, chartKey]); // Re-render on data change or manual resize trigger

  // 🛡️ NULL SAFETY CHECK - After hooks
  if (!data || typeof data.total === 'undefined') {
    return (
      <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-teal-400" />
          {t('dashboard.cashFlow')}
        </h2>
        <div className="text-center text-gray-400 py-8">{t('common.loading')}</div>
      </Card>
    );
  }

  const isPositive = data.total >= 0;
  const monthlyIncome = income?.total || 0;
  const monthlyExpenses = expenses?.total || 0;

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-teal-900/40 to-cyan-900/40 min-h-[420px] flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-teal-400" />
          {t('dashboard.cashFlow')}
        </h2>
      </div>
      
      {/* Main Cash Flow Number - Dynamic Color for Instant Status Recognition */}
      <p className={`text-4xl sm:text-5xl font-extrabold mb-3 ${isPositive ? 'text-lime-500' : 'text-rose-500'}`} style={{
        color: isPositive ? '#84CC16' : '#F43F5E'
      }}>
        <span className="stealth-target">{isPositive ? '+' : '-'}${Math.abs(parseFloat(data.total) || 0).toLocaleString()}</span>
      </p>
      
      {/* 💰 COMPONENT BREAKDOWN - Strategic Intelligence */}
      <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-6 mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-gray-300">{t('dashboard.totalIncome')}:</span>
          <span className="text-white font-semibold stealth-target">${(parseFloat(monthlyIncome) || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-gray-300">{t('dashboard.totalExpenses')}:</span>
          <span className="text-white font-semibold stealth-target">${(parseFloat(monthlyExpenses) || 0).toLocaleString()}</span>
        </div>
      </div>
      
      {/* 📈 3-MONTH TREND CHART */}
      <div className="mt-4 border-t border-teal-800/50 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-teal-300 uppercase tracking-wide">{t('dashboard.monthlyBreakdown')}</h3>
          {/* Tooltip - Always present, controlled via DOM (no re-renders!) */}
          <div 
            ref={tooltipRef}
            className="text-xs text-teal-300 bg-gray-800 px-2 sm:px-3 py-1 rounded-lg border border-teal-500/50"
            style={{ display: 'none' }}
          >
            {t('dashboard.hoverToView')}
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <div ref={chartRef} className="w-full" style={{ minHeight: '120px', maxWidth: '100%' }}></div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-400"></div>
            <span className="text-gray-400 text-[10px] sm:text-xs">{t('dashboard.currentMonth')}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-teal-400"></div>
            <span className="text-gray-400 text-[10px] sm:text-xs">{t('dashboard.previousMonths')}</span>
          </div>
        </div>
      </div>
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

  // Convert strings to numbers for calculations
  const age = Number(currentAge || 0);
  const target = Number(targetAmount || 0);
  const savings = Number(currentSavings || 0);
  const contribution = Number(monthlyContribution || 0);
  const returnRate = Number(annualReturn || 0);
  const expenses = Number(monthlyExpenses || 0);
  const passive = Number(passiveIncome || 0);

  // Calculate financial independence
  const monthlyReturn = returnRate / 100 / 12;
  const totalMonths = target > savings && contribution > 0
    ? Math.log((target * monthlyReturn + contribution) / (savings * monthlyReturn + contribution)) / Math.log(1 + monthlyReturn)
    : 0;
  
  const yearsToFI = Math.ceil(totalMonths / 12);
  const targetAge = age + yearsToFI;
  const monthlyPassiveNeeded = expenses - passive;
  const requiredAmountFor4Percent = monthlyPassiveNeeded * 12 / 0.04;

  // Generate projection data
  const projectionData = useMemo(() => {
    const data = [];
    let amount = savings;
    for (let month = 0; month <= totalMonths && month <= 600; month++) { // Max 50 years
      if (month > 0) {
        amount = amount * (1 + monthlyReturn) + contribution;
      }
      if (month % 12 === 0) {
        data.push({
          year: age + Math.floor(month / 12),
          amount: amount,
          passiveIncome: amount * 0.04 / 12 // 4% rule monthly
        });
      }
    }
    return data;
  }, [savings, totalMonths, monthlyReturn, contribution, age]);

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
        .domain([0, d3.max(projectionData, d => Math.max(d.amount, expenses * 12 * 25))])
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
  }, [projectionData, target, expenses]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-6 h-6 mr-3 text-emerald-400" />
              Financial Freedom Calculator
            </div>
            {/* Help Tooltip */}
          <div className="group relative">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-help transition-colors" />
            <div className="absolute right-0 top-8 w-80 bg-gray-900 border border-blue-500/30 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">How to Use This Calculator</h4>
              <div className="text-xs text-gray-300 space-y-2">
                <p><strong>📊 Enter Your Info:</strong> Input your current age, savings, and monthly contribution.</p>
                <p><strong>🎯 Set Your Target:</strong> How much do you need to be financially free?</p>
                <p><strong>📈 Expected Return:</strong> Average annual investment return (7% is typical for stocks).</p>
                <p><strong>🔮 See Your Timeline:</strong> The chart shows when you'll reach financial freedom!</p>
                <p className="text-blue-400 mt-2">💡 Tip: The higher your monthly contribution and return rate, the faster you reach freedom!</p>
              </div>
            </div>
          </div>
          </h3>
          <p className="text-emerald-300/80 text-sm ml-9">🏔️ Calculate your trail to financial independence</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Age</label>
            <input
              type="number"
              value={currentAge === 0 ? '0' : (currentAge || '')}
              onChange={(e) => setCurrentAge(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Target Amount</label>
            <input
              type="number"
              value={targetAmount === 0 ? '0' : (targetAmount || '')}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Savings</label>
            <input
              type="number"
              value={currentSavings === 0 ? '0' : (currentSavings || '')}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Monthly Contribution</label>
            <input
              type="number"
              value={monthlyContribution === 0 ? '0' : (monthlyContribution || '')}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Annual Return %</label>
            <input
              type="number"
              value={annualReturn === 0 ? '0' : (annualReturn || '')}
              onChange={(e) => setAnnualReturn(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Monthly Expenses</label>
            <input
              type="number"
              value={monthlyExpenses === 0 ? '0' : (monthlyExpenses || '')}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Passive Income</label>
            <input
              type="number"
              value={passiveIncome === 0 ? '0' : (passiveIncome || '')}
              onChange={(e) => setPassiveIncome(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Financial Independence</label>
            <div className="bg-emerald-900/30 rounded px-3 py-2 border border-emerald-600">
              <div className="text-emerald-400 font-bold">{yearsToFI} {t('dashboard.years')}</div>
              <div className="text-xs text-emerald-300">Age {targetAge}</div>
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-400 h-1.5 rounded-full transition-all" 
                    style={{ width: `${Math.min((savings / target * 100), 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-emerald-300 mt-1">
                  {((savings / target) * 100).toFixed(1)}% to FI Basecamp 🏕️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ETA to Freedom Display */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-4 border border-emerald-500/30 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-emerald-400 font-semibold mb-1">🎯 ETA to Freedom</div>
              <div className="text-2xl font-bold text-white">{yearsToFI} {t('dashboard.years')} (Age {targetAge})</div>
            </div>
            <div className="text-sm text-gray-300 max-w-md">
              💡 Optimize your route by increasing monthly contribution or passive income to reach financial freedom faster!
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-600/30">
            <h4 className="text-emerald-400 font-semibold mb-2">Financial Independence</h4>
            <div className="text-2xl font-bold text-white">${(parseFloat(target) || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-300">Target amount needed</div>
            {/* Progress Bar Under Card */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((savings / target * 100), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Current: ${(savings/1000).toFixed(0)}K</span>
                <span>Target: ${(target/1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <h4 className="text-blue-400 font-semibold mb-2">Monthly Passive Needed</h4>
            <div className="text-2xl font-bold text-white">${(parseFloat(monthlyPassiveNeeded) || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-300">To cover expenses</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
            <h4 className="text-purple-400 font-semibold mb-2">4% Rule Amount</h4>
            <div className="text-2xl font-bold text-white">${Math.round(parseFloat(requiredAmountFor4Percent) || 0).toLocaleString()}</div>
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
    // Convert all string values to numbers
    const debtsCopy = debts.map(debt => ({ 
      ...debt,
      balance: Number(debt.balance || 0),
      interestRate: Number(debt.interestRate || 0),
      minPayment: Number(debt.minPayment || 0)
    }));
    const extraPaymentNum = Number(extraPayment || 0);
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
      let remainingExtraPayment = extraPaymentNum;
      
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
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-red-400" />
              Debt Payoff Calculator
            </div>
            {/* Help Tooltip */}
          <div className="group relative">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-help transition-colors" />
            <div className="absolute right-0 top-8 w-80 bg-gray-900 border border-blue-500/30 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">How to Use This Calculator</h4>
              <div className="text-xs text-gray-300 space-y-2">
                <p><strong>💳 {t('dashboard.addTransaction')} Your Debts:</strong> List all credit cards, loans, and their interest rates.</p>
                <p><strong>💰 Extra Payment:</strong> How much extra can you pay beyond minimums?</p>
                <p><strong>🏔️ Choose Strategy:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>❄️ <strong>Snowball:</strong> Pay smallest debt first (quick wins, motivation boost!)</li>
                  <li>🔥 <strong>Avalanche:</strong> Pay highest interest first (save more money!)</li>
                </ul>
                <p className="text-blue-400 mt-2">💡 Tip: Snowball = Motivation. Avalanche = Math. Pick what keeps you going!</p>
              </div>
            </div>
          </div>
          </h3>
          {/* Debt Liberation Countdown */}
          {currentResult.payoffOrder.length > 0 && (
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <div className="text-red-400 font-semibold">Debt Liberation Countdown</div>
                  <div className="text-white text-sm">
                    You're <span className="font-bold text-orange-400">{currentResult.payoffOrder[0].months} {t('dashboard.months')}</span> from your first cleared debt. Stay the course.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
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
              🔥 Debt Avalanche (Highest Interest)
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
                {t('dashboard.addTransaction')}
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
                        placeholder={t('dashboard.debtName')}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={debt.balance === 0 ? '0' : (debt.balance || '')}
                        onChange={(e) => updateDebt(index, 'balance', e.target.value)}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        value={debt.interestRate === 0 ? '0' : (debt.interestRate || '')}
                        onChange={(e) => updateDebt(index, 'interestRate', e.target.value)}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={debt.minPayment === 0 ? '0' : (debt.minPayment || '')}
                        onChange={(e) => updateDebt(index, 'minPayment', e.target.value)}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="$0"
                      />
                    </div>
                    <div className="flex justify-center">
                      {debts.length > 1 && (
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title={t('tooltips.removeDebt')}
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
                  value={extraPayment === 0 ? '0' : (extraPayment || '')}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder={t('budget.extraPaymentPlaceholder')}
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
              {strategy === 'snowball' ? '🏔️ Snowball' : '🔥 Avalanche'} Results
            </h4>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Debt</p>
                    <p className="text-red-400 font-bold text-lg">${(parseFloat(totalDebt) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Min Payments</p>
                    <p className="text-white font-bold">${(parseFloat(totalMinPayment) || 0).toLocaleString()}/mo</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Payoff Time</p>
                    <p className="text-emerald-400 font-bold">
                      {currentResult.totalYears}y {currentResult.remainingMonths}m
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Interest Paid</p>
                    <p className="text-orange-400 font-bold">${Math.round(parseFloat(currentResult.totalInterestPaid) || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Milestone Badges */}
              <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-500/30">
                <h5 className="text-orange-400 font-semibold mb-3">🏆 Liberation Milestones</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">💥</div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">First Debt Cleared</div>
                      <div className="text-gray-400 text-xs">
                        {currentResult.payoffOrder.length > 0 
                          ? `${currentResult.payoffOrder[0].months} months away`
                          : t('dashboard.addTransaction') + ' debts to see timeline'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">50% Debt Reduction</div>
                      <div className="text-gray-400 text-xs">
                        Halfway to freedom
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">🕊️</div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">All Debts Paid - You're Free</div>
                      <div className="text-emerald-400 text-xs font-semibold">
                        {currentResult.totalYears}y {currentResult.remainingMonths}m ({(currentResult.totalYears * 12 + currentResult.remainingMonths)} {t('dashboard.monthsTotal')})
                      </div>
                    </div>
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
                      (${Math.round(parseFloat(snowballResult.totalInterestPaid) || 0).toLocaleString()} interest)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">🔥 Avalanche:</span>
                    <span className="text-white">
                      {avalancheResult.totalYears}y {avalancheResult.remainingMonths}m 
                      (${Math.round(parseFloat(avalancheResult.totalInterestPaid) || 0).toLocaleString()} interest)
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="text-emerald-400 font-semibold">
                      💰 Avalanche saves: ${Math.round(parseFloat(avalancheResult.totalInterestPaid) || 0).toLocaleString()}
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
                    <span className="text-red-400">${(parseFloat(debt.balance) || 0).toLocaleString()}</span>
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
  
  // Convert to numbers for calculations
  const income = Number(monthlyIncome || 0);
  const percentages = {
    '50-30-20': {
      needs: Number(budgetPercentages['50-30-20'].needs || 0),
      wants: Number(budgetPercentages['50-30-20'].wants || 0),
      savings: Number(budgetPercentages['50-30-20'].savings || 0)
    },
    '6-jars': {
      necessities: Number(budgetPercentages['6-jars'].necessities || 0),
      financialFreedom: Number(budgetPercentages['6-jars'].financialFreedom || 0),
      longTermSavings: Number(budgetPercentages['6-jars'].longTermSavings || 0),
      education: Number(budgetPercentages['6-jars'].education || 0),
      play: Number(budgetPercentages['6-jars'].play || 0),
      give: Number(budgetPercentages['6-jars'].give || 0)
    }
  };

  const fiftyThirtyTwenty = {
    needs: Math.round(income * (percentages['50-30-20'].needs / 100)),
    wants: Math.round(income * (percentages['50-30-20'].wants / 100)),
    savings: Math.round(income * (percentages['50-30-20'].savings / 100))
  };
  
  const sixJars = {
    necessities: Math.round(income * (percentages['6-jars'].necessities / 100)),
    financialFreedom: Math.round(income * (percentages['6-jars'].financialFreedom / 100)),
    longTermSavings: Math.round(income * (percentages['6-jars'].longTermSavings / 100)),
    education: Math.round(income * (percentages['6-jars'].education / 100)),
    play: Math.round(income * (percentages['6-jars'].play / 100)),
    give: Math.round(income * (percentages['6-jars'].give / 100))
  };
  
  // Function to update budget percentages
  const updateBudgetPercentage = (budgetSystem, category, percentage) => {
    setBudgetPercentages(prev => ({
      ...prev,
      [budgetSystem]: {
        ...prev[budgetSystem],
        [category]: percentage
      }
    }));
  };

  // Calculate total percentage for validation
  const totalPercentage = budgetType === '50-30-20'
    ? percentages['50-30-20'].needs + percentages['50-30-20'].wants + percentages['50-30-20'].savings
    : percentages['6-jars'].necessities + percentages['6-jars'].financialFreedom + percentages['6-jars'].longTermSavings + percentages['6-jars'].education + percentages['6-jars'].play + percentages['6-jars'].give;

  // Calculate remaining balance after budgeting
  const remainingBalance = budgetType === '50-30-20' 
    ? income - (fiftyThirtyTwenty.needs + fiftyThirtyTwenty.wants + fiftyThirtyTwenty.savings)
    : income - (sixJars.necessities + sixJars.financialFreedom + sixJars.longTermSavings + sixJars.education + sixJars.play + sixJars.give);

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
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full bg-gray-700 text-white text-xl p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder={t('budget.monthlyIncomePlaceholder')}
          />
        </div>
        
        <div className="bg-green-900/20 rounded-xl p-6 border-2 border-green-800/40">
          <label className="block text-green-400 text-lg font-bold mb-4">Monthly Income</label>
          <div className="text-3xl font-bold text-white mb-2">${(parseFloat(income) || 0).toLocaleString()}</div>
          <p className="text-gray-400">Ready for budgeting</p>
        </div>
        
        <div className="bg-blue-900/20 rounded-xl p-6 border-2 border-blue-800/40">
          <label className="block text-blue-400 text-lg font-bold mb-4">After Budgeting</label>
          <div className={`text-3xl font-bold mb-2 ${remainingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(parseFloat(remainingBalance) || 0).toLocaleString()}
          </div>
          <p className="text-gray-400">
            {remainingBalance >= 0 ? t('dashboard.remainingBalance') : t('dashboard.overBudgetBy')}
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
                {totalPercentage > 100 ? 'Reduce percentages to 100%' : t('dashboard.addTransaction') + ' more percentage allocations'}
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
            <div className="text-4xl font-bold text-white">${(parseFloat(fiftyThirtyTwenty.needs) || 0).toLocaleString()}</div>
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
            <div className="text-4xl font-bold text-white">${(parseFloat(fiftyThirtyTwenty.wants) || 0).toLocaleString()}</div>
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
            <div className="text-4xl font-bold text-white">${(parseFloat(fiftyThirtyTwenty.savings) || 0).toLocaleString()}</div>
          </div>
        </div>
      )}
      
      {budgetType === '6-jars' && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-green-900/30 rounded-xl p-4 border-2 border-green-800/40 text-center">
            <h4 className="text-sm font-bold text-green-400 mb-2">🏠 Necessities</h4>
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.necessities) || 0).toLocaleString()}</div>
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
            <h4 className="text-sm font-bold text-purple-400 mb-2">💰 Freedom</h4>
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.financialFreedom) || 0).toLocaleString()}</div>
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
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.longTermSavings) || 0).toLocaleString()}</div>
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
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.education) || 0).toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={budgetPercentages['6-jars'].education || ''}
                onChange={(e) => updateBudgetPercentage('6-jars', 'education', e.target.value)}
                className="w-12 bg-amber-800/50 text-amber-300 text-xs px-1 py-0.5 rounded border border-amber-600 focus:border-amber-400 focus:outline-none text-center"
                min="0"
                max="100"
              />
              <span className="text-amber-400 text-xs font-semibold">%</span>
            </div>
          </div>
          <div className="bg-pink-900/30 rounded-xl p-4 border-2 border-pink-800/40 text-center">
            <h4 className="text-sm font-bold text-pink-400 mb-2">🎉 Play</h4>
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.play) || 0).toLocaleString()}</div>
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
            <h4 className="text-sm font-bold text-teal-400 mb-2">?��️ Give</h4>
            <div className="text-xl font-bold text-white mb-1">${(parseFloat(sixJars.give) || 0).toLocaleString()}</div>
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
const SideHustleTab = ({ data, setData, userId, setRankUpData, setShowRankUpModal, setXpRefreshTrigger, showMomentModal, setShowMomentModal, editingMoment, setEditingMoment, newMoment, setNewMoment }) => {
  const { t } = useTranslation();
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemType, setItemType] = useState('income');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  
  // State for editing items
  const [editingItem, setEditingItem] = useState(null);
  
  // State for editing business
  const [editingBusiness, setEditingBusiness] = useState(null);

  // 📊 ANALYTICS TAB STATE - NEW!
  const [businessTabs, setBusinessTabs] = useState({}); // Track active tab per business by ID
  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState('last12mo'); // 'year', 'last12mo', 'alltime'
  const [showIncome, setShowIncome] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showProfit, setShowProfit] = useState(true);

  // Helper to get/set business tab
  const getBusinessTab = (businessId) => businessTabs[businessId] || 'transactions';
  const setBusinessTab = (businessId, tab) => setBusinessTabs({...businessTabs, [businessId]: tab});

  // 💫 MOMENTS SYSTEM STATE - Passed down from App component
  // (state defined in main App component, accessed here via closure)
  
  // 🔄 RECURRING ITEMS - New Feature!
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('income');
  
  const [newBusiness, setNewBusiness] = useState(() => {
    const today = new Date();
    return {
      name: '',
      description: '',
      startDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    };
  });
  
  const [newItem, setNewItem] = useState(() => {
    const today = new Date();
    return {
      description: '',
      amount: '',
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      isPassive: false // 🏔️ NEW: Passive income flag
    };
  });

  // 📊 ANALYTICS DATA PROCESSING - Calculate monthly totals for charts
  const calculateMonthlyData = (business) => {
    if (!business) return [];
    
    const monthlyTotals = {};
    
    // Process income items
    (business.incomeItems || []).forEach(item => {
      const month = item.date.substring(0, 7); // "2024-03"
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { month, income: 0, expenses: 0, profit: 0 };
      }
      monthlyTotals[month].income += parseFloat(item.amount) || 0;
    });
    
    // Process expense items
    (business.expenseItems || []).forEach(item => {
      const month = item.date.substring(0, 7);
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { month, income: 0, expenses: 0, profit: 0 };
      }
      monthlyTotals[month].expenses += parseFloat(item.amount) || 0;
    });
    
    // Calculate profit and convert to array
    const dataArray = Object.values(monthlyTotals).map(m => ({
      ...m,
      profit: m.income - m.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    return dataArray;
  };

  // 📊 FILTER DATA BY TIME RANGE
  const filterDataByTimeRange = (data, filter) => {
    if (!data || data.length === 0) return [];
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    if (filter === 'year') {
      // Current year only
      return data.filter(d => d.month.startsWith(currentYear.toString()));
    } else if (filter === 'last12mo') {
      // Last 12 months
      const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, 1);
      return data.filter(d => new Date(d.month + '-01') >= twelveMonthsAgo);
    } else {
      // All time
      return data;
    }
  };

  // 📊 CALCULATE KPI METRICS
  const calculateKPIs = (data) => {
    if (!data || data.length === 0) {
      return { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, avgMonthly: 0, growth: 0 };
    }
    
    const totalRevenue = data.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = data.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgMonthly = data.length > 0 ? totalProfit / data.length : 0;
    
    // Calculate growth (current month vs previous month)
    let growth = 0;
    if (data.length >= 2) {
      const currentMonth = data[data.length - 1];
      const previousMonth = data[data.length - 2];
      if (previousMonth.profit !== 0) {
        growth = ((currentMonth.profit - previousMonth.profit) / Math.abs(previousMonth.profit)) * 100;
      }
    }
    
    return { totalRevenue, totalExpenses, totalProfit, avgMonthly, growth };
  };

  // 📊 YEAR-OVER-YEAR COMPARISON
  const getYoYComparison = (data) => {
    if (!data || data.length === 0) return null;
    
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastYearMonth = `${today.getFullYear() - 1}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const currentData = data.find(d => d.month === currentMonth);
    const lastYearData = data.find(d => d.month === lastYearMonth);
    
    if (!currentData || !lastYearData) return null;
    
    const revenueGrowth = ((currentData.income - lastYearData.income) / (lastYearData.income || 1)) * 100;
    const expenseGrowth = ((currentData.expenses - lastYearData.expenses) / (lastYearData.expenses || 1)) * 100;
    const profitGrowth = ((currentData.profit - lastYearData.profit) / (Math.abs(lastYearData.profit) || 1)) * 100;
    
    return {
      current: currentData,
      lastYear: lastYearData,
      growth: {
        revenue: revenueGrowth,
        expenses: expenseGrowth,
        profit: profitGrowth
      }
    };
  };

  const [newRecurringItem, setNewRecurringItem] = useState(() => {
    const today = new Date();
    return {
      name: '',
      amount: '',
      isPassive: false,
      frequency: 'monthly',
      dayOfWeek: 1, // 🆕 For weekly/bi-weekly: 0=Sunday, 1=Monday, etc.
      startDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      category: ''
    };
  });

  // 🔧 EDGE CASE FIX: Null safety for empty businesses array
  const totalBusinessIncome = (data.businesses || []).reduce((sum, business) => sum + (business.totalIncome || business.income || 0), 0);
  const totalBusinessExpenses = (data.businesses || []).reduce((sum, business) => sum + (business.totalExpenses || business.expenses || 0), 0);
  const totalNetProfit = totalBusinessIncome - totalBusinessExpenses;

  // 🏔️ FREEDOM RATIO CALCULATIONS (Mission-Critical!)
  const calculateFreedomMetrics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Calculate Total Passive Income (Last 30 Days)
    let totalPassiveIncome = 0;
    (data.businesses || []).forEach(business => {
      (business.incomeItems || []).forEach(item => {
        const itemDate = new Date(item.date);
        if (item.isPassive && itemDate >= thirtyDaysAgo && itemDate <= now) {
          totalPassiveIncome += item.amount;
        }
      });
    });
    
    // Also check transactions for passive income
    (data.transactions || []).forEach(transaction => {
      if (transaction.amount > 0 && transaction.isPassive) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= thirtyDaysAgo && transactionDate <= now) {
          totalPassiveIncome += transaction.amount;
        }
      }
    });
    
    // Calculate Total Monthly Expenses (Last 30 Days)
    let totalMonthlyExpenses = 0;
    
    // From businesses
    (data.businesses || []).forEach(business => {
      (business.expenseItems || []).forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate >= thirtyDaysAgo && itemDate <= now) {
          totalMonthlyExpenses += item.amount;
        }
      });
    });
    
    // From transactions
    (data.transactions || []).forEach(transaction => {
      if (transaction.amount < 0) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= thirtyDaysAgo && transactionDate <= now) {
          totalMonthlyExpenses += Math.abs(transaction.amount);
        }
      }
    });
    
    // Calculate Side Hustle Income/Expenses (This Month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let sideHustleIncomeThisMonth = 0;
    let sideHustleExpensesThisMonth = 0;
    
    (data.businesses || []).forEach(business => {
      (business.incomeItems || []).forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
          sideHustleIncomeThisMonth += item.amount;
        }
      });
      (business.expenseItems || []).forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
          sideHustleExpensesThisMonth += item.amount;
        }
      });
    });
    
    // Calculate Freedom Ratio
    const freedomRatio = totalMonthlyExpenses > 0 
      ? (totalPassiveIncome / totalMonthlyExpenses) * 100 
      : 0;
    
    // Determine progress level and color
    let progressLevel = '';
    let progressColor = '';
    
    if (freedomRatio >= 75) {
      progressLevel = t('sideHustle.financiallyIndependent');
      progressColor = '#14B8A6'; // Teal
    } else if (freedomRatio >= 50) {
      progressLevel = t('sideHustle.nearingFreedom');
      progressColor = '#38BDF8'; // Sky Blue
    } else if (freedomRatio >= 25) {
      progressLevel = t('sideHustle.buildingMomentum');
      progressColor = '#F59E0B'; // Amber
    } else {
      progressLevel = t('sideHustle.survivalMode');
      progressColor = '#F43F5E'; // Rose
    }
    
    return {
      totalPassiveIncome,
      totalMonthlyExpenses,
      freedomRatio: Math.min(freedomRatio, 110), // Cap at 110% for display
      actualRatio: freedomRatio, // Keep actual for calculations
      progressLevel,
      progressColor,
      sideHustleIncomeThisMonth,
      sideHustleExpensesThisMonth
    };
  };
  
  const freedomMetrics = calculateFreedomMetrics();
  
  // 🏆 FREEDOM MILESTONES STATE
  const [unlockedMilestones, setUnlockedMilestones] = useState([]);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState(null);
  const [milestonesLoaded, setMilestonesLoaded] = useState(false);

  // 🔧 FIX: Load previously unlocked milestones on mount (ONE-TIME)
  useEffect(() => {
    const loadUnlockedMilestones = async () => {
      if (userId && db) {
        try {
          const profileRef = doc(db, 'userProfiles', userId);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const profile = profileSnap.data();
            setUnlockedMilestones(profile.unlockedMilestones || []);
          }
          setMilestonesLoaded(true);
        } catch (error) {
          console.error('Error loading unlocked milestones:', error);
          setMilestonesLoaded(true); // Still mark as loaded even on error
        }
      }
    };
    
    loadUnlockedMilestones();
  }, [userId, db]); // Only run once on mount

  // Check for milestone unlocks when freedom ratio changes (ONLY after milestones are loaded)
  useEffect(() => {
    const checkMilestones = async () => {
      if (userId && db && freedomMetrics.freedomRatio >= 0 && milestonesLoaded) {
        try {
          const { newMilestones, updatedMilestones } = await checkMilestoneUnlocks(
            db, 
            userId, 
            freedomMetrics.freedomRatio, 
            unlockedMilestones
          );
          
          // ✨ CRITICAL FIX: Always update state, even if milestones were removed!
          // This ensures milestones adjust down when ratio drops
          if (JSON.stringify(updatedMilestones) !== JSON.stringify(unlockedMilestones)) {
            setUnlockedMilestones(updatedMilestones);
            
            // Only celebrate if NEW milestones were unlocked (not if removed)
            if (newMilestones.length > 0) {
              // Trigger celebration for the highest unlocked milestone
              const latestMilestone = newMilestones[newMilestones.length - 1];
              setCelebratingMilestone(latestMilestone);
              setShowMilestoneCelebration(true);
              
              // Track milestone unlock in analytics
              if (window.gtag) {
                window.gtag('event', 'milestone_unlocked', {
                  milestone_id: latestMilestone.id,
                  milestone_title: latestMilestone.title,
                  freedom_ratio: freedomMetrics.freedomRatio,
                  threshold: latestMilestone.threshold
                });
              }
              
              // Hide celebration after 4 seconds
              setTimeout(() => {
                setShowMilestoneCelebration(false);
                setCelebratingMilestone(null);
              }, 4000);
            }
          }
        } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
          console.warn('Milestone check failed:', error);
        }
      }
    };

    checkMilestones();
  }, [freedomMetrics.freedomRatio, userId, db, unlockedMilestones, milestonesLoaded]);

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
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      // Update local state
      setData({ ...data, businesses: updatedBusinesses });
      
      // Award XP (+50) for creating a new business and trigger rank-up UI if applicable
      try {
        const result = await awardXp(db, userId, 50);
        setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - 50);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 50, action: 'new business' });
          setShowRankUpModal(true);
          if (window.gtag) {
            window.gtag('event', 'rank_up', { new_rank: result.newRank.name, new_level: result.newRank.level, xp_gained: 50, action: 'new business' });
          }
        }
      } catch (e) { console.warn('XP award failed (new business)', e); }
      // FIX: Use local date instead of UTC
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setNewBusiness({ name: '', description: '', startDate: localDate });
      setShowAddBusiness(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error adding business:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description || !newItem.amount || !selectedBusiness) return;
    
    const amount = parseFloat(newItem.amount) || 0;
    if (isNaN(amount) || amount <= 0) {
      alert(t('validations.pleaseEnterValidAmount'));
      return;
    }
    const item = {
      id: Date.now(),
      ...newItem,
      amount,
      isPassive: itemType === 'income' ? newItem.isPassive : false // Only income can be passive
    };
    
    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === selectedBusiness.id) {
        const updatedBusiness = { ...business };
        
        if (itemType === 'income') {
          updatedBusiness.incomeItems = [item, ...business.incomeItems];
          const currentTotal = parseFloat(business.totalIncome) || 0;
          updatedBusiness.totalIncome = currentTotal + amount;
        } else {
          updatedBusiness.expenseItems = [item, ...business.expenseItems];
          const currentTotal = parseFloat(business.totalExpenses) || 0;
          updatedBusiness.totalExpenses = currentTotal + amount;
        }
        
        // Calculate net profit with safety checks
        const totalIncome = parseFloat(updatedBusiness.totalIncome) || 0;
        const totalExpenses = parseFloat(updatedBusiness.totalExpenses) || 0;
        updatedBusiness.netProfit = totalIncome - totalExpenses;
        return updatedBusiness;
      }
      return business;
    });
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      setData({ ...data, businesses: updatedBusinesses });
      
      // Award XP for business item (income: +5, expense: +1)
      try {
        const amountXp = itemType === 'income' ? 5 : 1;
        const result = await awardXp(db, userId, amountXp);
        setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - amountXp);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: amountXp, action: 'business item' });
          setShowRankUpModal(true);
          if (window.gtag) {
            window.gtag('event', 'rank_up', { new_rank: result.newRank.name, new_level: result.newRank.level, xp_gained: amountXp, action: 'business item' });
          }
        }
      } catch (e) { console.warn('XP award failed (business item)', e); }
      
      const today = new Date();
      setNewItem({ description: '', amount: '', date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`, isPassive: false });
      setShowAddItem(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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

    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      setData({ ...data, businesses: updatedBusinesses });
      
      // 🛡️ ANTI-EXPLOIT: Deduct XP for deleting business
      try {
        await deductXp(db, userId, 50);
        setXpRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.warn('XP deduction failed (business delete)', error);
      }
      
      setBusinessToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      setData({ ...data, businesses: updatedBusinesses });
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error deleting item:', error);
    }
  };

  // ?��️ EDIT ITEM HANDLER
  const handleEditItem = async () => {
    if (!editingItem) return;

    const { businessId, itemId, type } = editingItem;
    const oldAmount = parseFloat(editingItem.oldAmount) || 0;
    const newAmount = parseFloat(editingItem.amount) || 0;
    
    if (isNaN(newAmount) || newAmount <= 0) {
      alert(t('validations.pleaseEnterValidAmount'));
      return;
    }
    
    if (isNaN(oldAmount)) {
      console.error('Invalid oldAmount:', editingItem.oldAmount);
      alert(t('validations.invalidPreviousAmount'));
      return;
    }

    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === businessId) {
        const updatedBusiness = { ...business };
        
        if (type === 'income') {
          updatedBusiness.incomeItems = business.incomeItems.map(item => 
            item.id === itemId ? {
              ...item,
              description: editingItem.description,
              amount: newAmount,
              date: editingItem.date,
              isPassive: editingItem.isPassive
            } : item
          );
          // Recalculate total income
          updatedBusiness.totalIncome = business.totalIncome - oldAmount + newAmount;
        } else {
          updatedBusiness.expenseItems = business.expenseItems.map(item => 
            item.id === itemId ? {
              ...item,
              description: editingItem.description,
              amount: newAmount,
              date: editingItem.date
            } : item
          );
          // Recalculate total expenses (with safety checks)
          const currentTotal = parseFloat(business.totalExpenses) || 0;
          updatedBusiness.totalExpenses = currentTotal - oldAmount + newAmount;
        }
        
        // Calculate net profit with safety checks
        const totalIncome = parseFloat(updatedBusiness.totalIncome) || 0;
        const totalExpenses = parseFloat(updatedBusiness.totalExpenses) || 0;
        updatedBusiness.netProfit = totalIncome - totalExpenses;
        return updatedBusiness;
      }
      return business;
    });
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      setData({ ...data, businesses: updatedBusinesses });
      setEditingItem(null);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error editing item:', error);
    }
  };

  // 🔄 ADD RECURRING ITEM HANDLER
  const handleAddRecurringItem = async () => {
    if (!newRecurringItem.name || !newRecurringItem.amount || !selectedBusiness) return;

    const amount = parseFloat(newRecurringItem.amount) || 0;
    if (isNaN(amount) || amount <= 0) {
      alert(t('validations.pleaseEnterValidAmount'));
      return;
    }
    const recurringItem = {
      id: Date.now(),
      ...newRecurringItem,
      amount,
      type: recurringType,
      isPassive: recurringType === 'income' ? newRecurringItem.isPassive : false,
      businessId: selectedBusiness.id,
      isActive: true,
      nextDueDate: newRecurringItem.startDate,
      lastProcessed: null
    };

    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === selectedBusiness.id) {
        return {
          ...business,
          recurringItems: [...(business.recurringItems || []), recurringItem]
        };
      }
      return business;
    });

    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      
      setData({ ...data, businesses: updatedBusinesses });
      const today = new Date();
      setNewRecurringItem({
        name: '',
        amount: '',
        isPassive: false,
        frequency: 'monthly',
        dayOfWeek: 1, // 🆕 Reset day of week
        startDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        category: ''
      });
      setShowAddRecurring(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error adding recurring item:', error);
    }
  };

  // 🔄 TOGGLE RECURRING ITEM ACTIVE/PAUSED
  const handleToggleRecurringItem = async (businessId, itemId) => {
    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === businessId) {
        return {
          ...business,
          recurringItems: (business.recurringItems || []).map(item =>
            item.id === itemId ? { ...item, isActive: !item.isActive } : item
          )
        };
      }
      return business;
    });

    try {
      // 🛡️ USE updateDoc to prevent data loss
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      setData({ ...data, businesses: updatedBusinesses });
    } catch (error) {
      console.error('Error toggling recurring item:', error);
    }
  };

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };

  // 🔄 DELETE RECURRING ITEM
  const handleDeleteRecurringItem = async (businessId, itemId) => {
    if (!window.confirm(t('sideHustle.deleteRecurringItem'))) return;

    const updatedBusinesses = data.businesses.map(business => {
      if (business.id === businessId) {
        return {
          ...business,
          recurringItems: (business.recurringItems || []).filter(item => item.id !== itemId)
        };
      }
      return business;
    });

    try {
      // 🛡️ USE updateDoc to prevent data loss
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        businesses: updatedBusinesses
      });
      setData({ ...data, businesses: updatedBusinesses });
    } catch (error) {
      console.error('Error deleting recurring item:', error);
    }
  };

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };

  // 🔄 PROCESS DUE RECURRING ITEMS - Automation Engine
  const processDueRecurringItems = () => {
    const today = new Date();
    let hasUpdates = false;

    const updatedBusinesses = data.businesses.map(business => {
      const recurringItems = business.recurringItems || [];
      const updatedRecurringItems = [];
      let updatedBusiness = { ...business };

      recurringItems.forEach(recurring => {
        if (!recurring.isActive) {
          updatedRecurringItems.push(recurring);
          return;
        }

        const dueDate = new Date(recurring.nextDueDate);

        // Check if due (due date is today or in the past)
        if (dueDate <= today) {
          hasUpdates = true;

          // Create new transaction item
          const newItem = {
            id: Date.now() + Math.random(),
            description: recurring.name,
            amount: recurring.amount,
            date: recurring.nextDueDate,
            isPassive: recurring.isPassive || false,
            category: recurring.category,
            isRecurring: true,
            recurringId: recurring.id
          };

          // Add to appropriate array
          if (recurring.type === 'income') {
            updatedBusiness.incomeItems = [newItem, ...(updatedBusiness.incomeItems || [])];
            updatedBusiness.totalIncome = (updatedBusiness.totalIncome || 0) + recurring.amount;
          } else {
            updatedBusiness.expenseItems = [newItem, ...(updatedBusiness.expenseItems || [])];
            updatedBusiness.totalExpenses = (updatedBusiness.totalExpenses || 0) + recurring.amount;
          }

          updatedBusiness.netProfit = (updatedBusiness.totalIncome || 0) - (updatedBusiness.totalExpenses || 0);

          // Calculate next due date
          let nextDate = new Date(recurring.nextDueDate);
          switch (recurring.frequency) {
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextDate.setMonth(nextDate.getMonth() + 3);
              break;
            case 'annually':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
            default:
              nextDate.setMonth(nextDate.getMonth() + 1);
          }

          updatedRecurringItems.push({
            ...recurring,
            lastProcessed: recurring.nextDueDate,
            nextDueDate: nextDate.toISOString().split('T')[0]
          });
        } else {
          updatedRecurringItems.push(recurring);
        }
      });

      updatedBusiness.recurringItems = updatedRecurringItems;
      return updatedBusiness;
    });

    if (hasUpdates) {
      const updatedData = { ...data, businesses: updatedBusinesses };
      setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData)
        .then(() => setData(updatedData))
        .catch(error => console.error('Error processing recurring items:', error));
    }
  };

  // Auto-process recurring items on component mount and daily
  useEffect(() => {
    processDueRecurringItems();
    
    // Run daily check
    const interval = setInterval(processDueRecurringItems, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.businesses]);

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* 🏔️ FREEDOM COMMAND CENTER - 4-Card Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 border-teal-500/30">
          <h3 className="text-sm font-semibold text-teal-200 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('sideHustle.sideHustleIncome')}
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-white stealth-target">${(parseFloat(freedomMetrics.sideHustleIncomeThisMonth) || 0).toLocaleString()}</p>
          <p className="text-xs text-teal-300 mt-1">{t('sideHustle.thisMonth')}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-900/40 to-red-900/40 border-rose-500/30">
          <h3 className="text-sm font-semibold text-rose-200 mb-2 flex items-center">
            <ArrowDown className="w-4 h-4 mr-2" />
            {t('sideHustle.sideHustleExpenses')}
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-white stealth-target">${(parseFloat(freedomMetrics.sideHustleExpensesThisMonth) || 0).toLocaleString()}</p>
          <p className="text-xs text-rose-300 mt-1">{t('sideHustle.thisMonth')}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border-amber-500/30">
          <h3 className="text-sm font-semibold text-amber-200 mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            {t('sideHustle.passiveIncome')}
            {/* 🎯 OPERATOR'S INTEL TOOLTIP */}
            <div className="tooltip-container" style={{position: 'relative', display: 'inline-block', marginLeft: '6px'}}>
              <span 
                className="tooltip-icon"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '1px solid rgba(251, 191, 36, 0.6)',
                  color: 'rgba(251, 191, 36, 0.8)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'help',
                  transition: 'all 0.2s'
                }}
              >
                i
              </span>
              <div 
                className="tooltip-content"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  width: '280px',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  zIndex: 1000,
                  visibility: 'hidden',
                  opacity: 0,
                  transition: 'opacity 0.2s, visibility 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  whiteSpace: 'normal'
                }}
              >
                <div style={{marginBottom: '4px', fontWeight: '600', color: '#FBBF24', fontSize: '10px', letterSpacing: '0.5px'}}>
                  {t('sideHustle.operatorsIntel')}
                </div>
                {t('sideHustle.passiveIncomeTooltip')}
                {/* Tooltip arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563',
                  borderTop: 'none',
                  borderLeft: 'none',
                  transform: 'translateX(-50%) rotate(45deg)'
                }}></div>
              </div>
            </div>
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-white stealth-target">${(parseFloat(freedomMetrics.totalPassiveIncome) || 0).toLocaleString()}</p>
          <p className="text-xs text-amber-300 mt-1">{t('sideHustle.last30Days')}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-violet-500/30">
          <h3 className="text-sm font-semibold text-violet-200 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            {t('sideHustle.freedomRatio')}
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-white stealth-target">{freedomMetrics.freedomRatio.toFixed(1)}%</p>
          <p className="text-xs text-violet-300 mt-1">{freedomMetrics.progressLevel}</p>
        </Card>
      </div>

      {/* 🏔️ FREEDOM RATIO CENTERPIECE CARD */}
      <Card className="bg-gradient-to-br from-slate-900 to-gray-900 border-2" style={{ borderColor: freedomMetrics.progressColor }}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            🏔️ {t('sideHustle.freedomRatio')}
          </h2>
          <p className="text-gray-400">{t('sideHustle.passiveVsExpenses')}</p>
        </div>

        {/* Progress Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-80 h-80 p-8">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256" style={{ overflow: 'visible' }}>
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#1f2937"
                strokeWidth="18"
                fill="none"
              />
              {/* Progress Circle with Neon Glow */}
              {/* Mobile-friendly neon effect using multiple circles */}
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={freedomMetrics.progressColor}
                strokeWidth="24"
                fill="none"
                strokeDasharray={`${(freedomMetrics.freedomRatio / 100) * 691} 691`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out opacity-30"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={freedomMetrics.progressColor}
                strokeWidth="18"
                fill="none"
                strokeDasharray={`${(freedomMetrics.freedomRatio / 100) * 691} 691`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out opacity-60"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={freedomMetrics.progressColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(freedomMetrics.freedomRatio / 100) * 691} 691`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${freedomMetrics.progressColor})`,
                  WebkitFilter: `drop-shadow(0 0 8px ${freedomMetrics.progressColor})`,
                  willChange: 'filter'
                }}
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold" style={{ color: freedomMetrics.progressColor }}>
                {freedomMetrics.actualRatio.toFixed(1)}%
              </div>
              <div className="text-sm font-semibold mt-2" style={{ color: freedomMetrics.progressColor }}>
                {freedomMetrics.progressLevel}
              </div>
            </div>
          </div>

          {/* Data Display */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
              <div className="text-sm text-amber-300 mb-1">{t('sideHustle.passiveIncome30')}</div>
              <div className="text-2xl font-bold text-amber-400">${(parseFloat(freedomMetrics.totalPassiveIncome) || 0).toLocaleString()}</div>
            </div>
            <div className="bg-rose-900/20 rounded-lg p-4 border border-rose-500/30">
              <div className="text-sm text-rose-300 mb-1">{t('sideHustle.monthlyExpenses30')}</div>
              <div className="text-2xl font-bold text-rose-400">${(parseFloat(freedomMetrics.totalMonthlyExpenses) || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-gray-300 italic">
            {freedomMetrics.actualRatio >= 100 
              ? t('sideHustle.congratulationsSummit')
              : freedomMetrics.actualRatio >= 75
              ? t('sideHustle.ratioAlmostThere', { ratio: freedomMetrics.actualRatio.toFixed(1) })
              : freedomMetrics.actualRatio >= 50
              ? t('sideHustle.ratioInSight', { ratio: freedomMetrics.actualRatio.toFixed(1) })
              : freedomMetrics.actualRatio >= 25
              ? t('sideHustle.ratioMomentum', { ratio: freedomMetrics.actualRatio.toFixed(1) })
              : t('sideHustle.ratioFirstStep', { ratio: freedomMetrics.actualRatio.toFixed(1) })
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('sideHustle.earnTimeBack')}
          </p>
        </div>

        {/* 🔮 Freedom Forecast */}
        {freedomMetrics.actualRatio < 100 && freedomMetrics.totalPassiveIncome > 0 && (
          <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center gap-2">
              {t('sideHustle.freedomForecast')}
            </h3>
            <p className="text-gray-300 text-sm">
              {(() => {
                // Simple projection: If we assume 10% monthly growth in passive income
                const monthlyGrowthRate = 0.10;
                const currentPassive = freedomMetrics.totalPassiveIncome;
                const targetPassive = freedomMetrics.totalMonthlyExpenses;
                
                if (currentPassive >= targetPassive) return t('sideHustle.alreadyFree');
                if (currentPassive === 0) return t('sideHustle.startBuilding');
                
                // Calculate months to freedom
                let months = 0;
                let projected = currentPassive;
                while (projected < targetPassive && months < 120) { // Cap at 10 years
                  projected *= (1 + monthlyGrowthRate);
                  months++;
                }
                
                const years = (months / 12).toFixed(1);
                
                return months >= 120 
                  ? t('sideHustle.focusOnGrowth')
                  : t('sideHustle.reachFreedomIn', { years });
              })()}
            </p>
          </div>
        )}
      </Card>

      {/* 🏆 FREEDOM MILESTONES */}
      <FreedomMilestones 
        freedomRatio={freedomMetrics.freedomRatio}
        unlockedMilestones={unlockedMilestones}
        onMilestoneUnlock={(newMilestones) => {
          // This will be handled by the useEffect above
        }}
      />

      {/* Header and Add Business */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <Building className="w-6 h-6 mr-3 text-violet-400" />
              {t('sideHustle.sideHustleManagement')}
            </h2>
            <p className="text-gray-400">{t('sideHustle.trackBusinesses')}</p>
          </div>
          <button
            onClick={() => setShowAddBusiness(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.addBusiness')}
          </button>
        </div>
      </Card>

      {/* Add Business Form */}
      {showAddBusiness && (
        <Card className="border-violet-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{t('dashboard.addBusiness')}</h3>
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
              placeholder={t('sideHustle.businessName')}
              value={newBusiness.name}
              onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
            />
            
            <input
              type="date"
              value={newBusiness.startDate}
              onChange={(e) => setNewBusiness({...newBusiness, startDate: e.target.value})}
              className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
              style={{ maxWidth: '100%' }}
            />
          </div>
          
          <textarea
            placeholder={t('sideHustle.businessDescription')}
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
              {t('dashboard.addBusiness')}
            </button>
          </div>
        </Card>
      )}

      {/* ?��️ EDIT BUSINESS MODAL */}
      {editingBusiness && (
        <Card className="border-amber-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{t('sideHustle.editBusiness')}</h3>
            <button
              onClick={() => setEditingBusiness(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('sideHustle.businessName')}
              value={editingBusiness.name}
              onChange={(e) => setEditingBusiness({...editingBusiness, name: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
            />
            
            <input
              type="date"
              value={editingBusiness.startDate}
              onChange={(e) => setEditingBusiness({...editingBusiness, startDate: e.target.value})}
              className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
              style={{ maxWidth: '100%' }}
            />
          </div>
          
          <textarea
            placeholder={t('sideHustle.businessDescription')}
            value={editingBusiness.description}
            onChange={(e) => setEditingBusiness({...editingBusiness, description: e.target.value})}
            className="w-full mt-4 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
            rows="3"
          />
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditingBusiness(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const updatedBusinesses = data.businesses.map(b => 
                  b.id === editingBusiness.id ? editingBusiness : b
                );
                try {
                  // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
                  await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
                    businesses: updatedBusinesses
                  });
                  setData({ ...data, businesses: updatedBusinesses });
                  setEditingBusiness(null);
                } catch (error) {
                  console.error('Error updating business:', error);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('sideHustle.saveChanges')}
            </button>
          </div>
        </Card>
      )}

      {/* Business List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.businesses.map(business => {
          // 📊 Calculate analytics data for this business
          const businessMonthlyData = calculateMonthlyData(business);
          const filteredData = filterDataByTimeRange(businessMonthlyData, analyticsTimeFilter);
          const kpis = calculateKPIs(filteredData);
          const yoyComparison = getYoYComparison(businessMonthlyData);
          
          // Get current tab for this business
          const currentTab = getBusinessTab(business.id);
          
          return (
          <Card key={business.id} className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{business.name}</h3>
                <p className="text-gray-400 text-sm">{business.description}</p>
                <p className="text-gray-500 text-xs">{t('sideHustle.since')} {new Date(business.startDate).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setEditingBusiness(business)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                  title={t('sideHustle.editBusiness')}
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowAddItem(true);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {t('dashboard.addTransaction')}
                </button>
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowAddRecurring(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                >
                  <Repeat className="w-3 h-3 mr-1" />
                  {t('sideHustle.recurring')}
                </button>
                <button
                  onClick={() => initiateDeleteBusiness(business)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 📊 TAB SWITCHER - NEW! */}
            <div className="flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setBusinessTab(business.id, 'transactions')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  currentTab === 'transactions'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {t('sideHustle.transactionsTab')}
              </button>
              <button
                onClick={() => setBusinessTab(business.id, 'analytics')}
                className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
                  currentTab === 'analytics'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {t('sideHustle.analyticsTab')}
              </button>
            </div>

            {/* TRANSACTIONS TAB CONTENT */}
            {currentTab === 'transactions' && (
              <>
                {/* Business Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-900/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-400">
                      ${(parseFloat(business.totalIncome) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-300">{t('sideHustle.income')}</div>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-red-400">
                      ${(parseFloat(business.totalExpenses) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-red-300">{t('sideHustle.expenses')}</div>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-3">
                    <div className={`text-lg font-bold ${(parseFloat(business.netProfit) || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      ${(parseFloat(business.netProfit) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-300">{t('sideHustle.netProfit')}</div>
                  </div>
                </div>
                
                {/* Recent Items */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-300">{t('sideHustle.recentActivity')}</h4>
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
                            {isIncome ? '+' : '-'}${(parseFloat(item.amount) || 0).toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              // Open moment modal with pre-filled business data
                              setEditingMoment(null);
                              setNewMoment({
                                title: item.description,
                                story: '',
                                location: business.name,
                                date: item.date,
                                isAchievement: false,
                                category: 'business',
                                linkedTransaction: {
                                  businessId: business.id,
                                  businessName: business.name,
                                  amount: item.amount,
                                  type: isIncome ? 'income' : 'expense'
                                }
                              });
                              setShowMomentModal(true);
                            }}
                            className="text-gray-400 hover:text-purple-400 p-1"
                            title={t('sideHustle.createBusinessMoment')}
                          >
                            <BookOpen className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingItem({
                              businessId: business.id,
                              itemId: item.id,
                              type: isIncome ? 'income' : 'expense',
                              description: item.description,
                              amount: item.amount,
                              oldAmount: item.amount,
                              date: item.date,
                              isPassive: item.isPassive || false
                            })}
                            className="text-gray-400 hover:text-blue-400 p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
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

            {/* 🔄 RECURRING ITEMS SECTION - NEW! */}
            {business.recurringItems && business.recurringItems.length > 0 && (
              <div className="space-y-2 border-t border-gray-700 pt-4">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  {t('sideHustle.recurringItems')} ({business.recurringItems.filter(r => r.isActive).length} {t('transactions.active', { count: business.recurringItems.filter(r => r.isActive).length })})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {business.recurringItems.map(recurring => (
                    <div key={recurring.id} className={`p-3 rounded-lg border ${
                      recurring.isActive 
                        ? 'bg-blue-900/20 border-blue-500/30' 
                        : 'bg-gray-800/50 border-gray-600/30'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">{recurring.name}</span>
                            {recurring.isPassive && (
                              <span className="px-2 py-0.5 bg-amber-600/30 text-amber-300 text-xs rounded-full">
                                {t('sideHustle.passive')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="capitalize">{recurring.frequency}</span>
                            <span>•</span>
                            <span>{t('sideHustle.next')} {new Date(recurring.nextDueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${recurring.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {recurring.type === 'income' ? '+' : '-'}${(parseFloat(recurring.amount) || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleRecurringItem(business.id, recurring.id)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                            recurring.isActive
                              ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                              : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          }`}
                        >
                          {recurring.isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleDeleteRecurringItem(business.id, recurring.id)}
                          className="flex-1 px-2 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {/* 📊 ANALYTICS TAB CONTENT - NEW! */}
            {currentTab === 'analytics' && (
              <div className="space-y-6">
                {filteredData.length > 0 ? (
                  <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                        <div className="text-xs text-green-300 mb-1">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-400">
                          ${(kpis.totalRevenue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                        <div className="text-xs text-red-300 mb-1">Total Expenses</div>
                        <div className="text-2xl font-bold text-red-400">
                          ${(kpis.totalExpenses || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                      </div>
                      <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
                        <div className="text-xs text-amber-300 mb-1">Total Profit</div>
                        <div className="text-2xl font-bold text-amber-400">
                          ${(kpis.totalProfit || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                      </div>
                      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                        <div className="text-xs text-blue-300 mb-1">Growth (MoM)</div>
                        <div className={`text-2xl font-bold ${kpis.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {kpis.growth >= 0 ? '+' : ''}{kpis.growth.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Chart Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showIncome}
                            onChange={(e) => setShowIncome(e.target.checked)}
                            className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-green-300">Income</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showExpenses}
                            onChange={(e) => setShowExpenses(e.target.checked)}
                            className="rounded border-gray-600 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-red-300">Expenses</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showProfit}
                            onChange={(e) => setShowProfit(e.target.checked)}
                            className="rounded border-gray-600 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm text-amber-300">Profit</span>
                        </label>
                      </div>
                      <select
                        value={analyticsTimeFilter}
                        onChange={(e) => setAnalyticsTimeFilter(e.target.value)}
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none text-sm"
                      >
                        <option value="year">Current Year</option>
                        <option value="last12mo">Last 12 Months</option>
                        <option value="alltime">All Time</option>
                      </select>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Performance Trend</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            formatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Legend />
                          {showIncome && <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />}
                          {showExpenses && <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />}
                          {showProfit && <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} name="Profit" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Year-over-Year Comparison */}
                    {yoyComparison && (
                      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                        <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Year-over-Year Comparison
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left py-2 text-gray-400 font-semibold">Metric</th>
                                <th className="text-right py-2 text-gray-400 font-semibold">Last Year</th>
                                <th className="text-right py-2 text-gray-400 font-semibold">This Year</th>
                                <th className="text-right py-2 text-gray-400 font-semibold">Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-gray-700/50">
                                <td className="py-3 text-white">Revenue</td>
                                <td className="text-right text-green-300">${yoyComparison.lastYear.income.toLocaleString()}</td>
                                <td className="text-right text-green-400 font-semibold">${yoyComparison.current.income.toLocaleString()}</td>
                                <td className={`text-right font-bold ${yoyComparison.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {yoyComparison.growth.revenue >= 0 ? '↑' : '↓'} {Math.abs(yoyComparison.growth.revenue).toFixed(1)}%
                                </td>
                              </tr>
                              <tr className="border-b border-gray-700/50">
                                <td className="py-3 text-white">Expenses</td>
                                <td className="text-right text-red-300">${yoyComparison.lastYear.expenses.toLocaleString()}</td>
                                <td className="text-right text-red-400 font-semibold">${yoyComparison.current.expenses.toLocaleString()}</td>
                                <td className={`text-right font-bold ${yoyComparison.growth.expenses >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                  {yoyComparison.growth.expenses >= 0 ? '↑' : '↓'} {Math.abs(yoyComparison.growth.expenses).toFixed(1)}%
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-white font-semibold">Net Profit</td>
                                <td className="text-right text-amber-300">${yoyComparison.lastYear.profit.toLocaleString()}</td>
                                <td className="text-right text-amber-400 font-bold">${yoyComparison.current.profit.toLocaleString()}</td>
                                <td className={`text-right font-bold ${yoyComparison.growth.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {yoyComparison.growth.profit >= 0 ? '↑' : '↓'} {Math.abs(yoyComparison.growth.profit).toFixed(1)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/* Smart Insight */}
                        <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                          <p className="text-sm text-gray-300">
                            💡 <strong>Insight:</strong> {
                              yoyComparison.growth.profit > 50 
                                ? `Outstanding ${yoyComparison.growth.profit.toFixed(0)}% profit growth! You're crushing it! 🚀`
                                : yoyComparison.growth.profit > 25
                                ? `Strong ${yoyComparison.growth.profit.toFixed(0)}% profit growth! Keep up the momentum! 💪`
                                : yoyComparison.growth.profit > 0
                                ? `Positive ${yoyComparison.growth.profit.toFixed(0)}% profit growth. Stay consistent! 📈`
                                : `Profit down ${Math.abs(yoyComparison.growth.profit).toFixed(0)}%. Time to optimize! 💡`
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No Data Yet</p>
                    <p className="text-sm">Start adding transactions to see your analytics!</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddItem && selectedBusiness && (
        <FixedModal
          isOpen={showAddItem}
          onClose={() => setShowAddItem(false)}
          title={`Add Item to ${selectedBusiness.name}`}
          size="md"
        >
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
                value={newItem.amount === 0 ? '0' : (newItem.amount || '')}
                onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
              />
              
              <input
                type="date"
                value={newItem.date}
                onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-violet-500 focus:outline-none"
                style={{ maxWidth: '100%' }}
              />
              
              {/* 🏔️ PASSIVE INCOME CHECKBOX - Freedom Ratio Feature! */}
              {itemType === 'income' && (
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.isPassive || false}
                      onChange={(e) => setNewItem({...newItem, isPassive: e.target.checked})}
                      className="w-5 h-5 rounded border-amber-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                    />
                    <div>
                      <span className="text-white font-semibold">Passive Income</span>
                      <p className="text-xs text-amber-300 mt-1">
                        💡 Passive income counts toward your Freedom Ratio (income you earn without active work)
                      </p>
                    </div>
                  </label>
                </div>
              )}
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
        </FixedModal>
      )}

      {/* ✏️ Edit Item Modal */}
      {editingItem && (
        <FixedModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit ${editingItem.type === 'income' ? 'Income' : 'Expense'} Item`}
          size="md"
        >
          <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <span className={`text-sm font-semibold ${editingItem.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {editingItem.type === 'income' ? '📈 Income Item' : '📉 Expense Item'}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="Description"
                value={editingItem.description}
                onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={editingItem.amount === 0 ? '0' : (editingItem.amount || '')}
                onChange={(e) => setEditingItem({...editingItem, amount: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="date"
                value={editingItem.date}
                onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                style={{ maxWidth: '100%' }}
              />
              
              {/* 🏔️ PASSIVE INCOME CHECKBOX - Only for Income Items */}
              {editingItem.type === 'income' && (
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isPassive || false}
                      onChange={(e) => setEditingItem({...editingItem, isPassive: e.target.checked})}
                      className="w-5 h-5 rounded border-amber-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                    />
                    <div>
                      <span className="text-white font-semibold">Passive Income</span>
                      <p className="text-xs text-amber-300 mt-1">
                        💡 Passive income counts toward your Freedom Ratio
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
        </FixedModal>
      )}

      {/* 🔄 Add Recurring Item Modal */}
      {showAddRecurring && selectedBusiness && (
        <FixedModal
          isOpen={showAddRecurring}
          onClose={() => setShowAddRecurring(false)}
          title={`Add Recurring Item to ${selectedBusiness.name}`}
          size="lg"
        >
          <div className="space-y-4">
              {/* Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setRecurringType('income')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    recurringType === 'income' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setRecurringType('expense')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    recurringType === 'expense' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., SaaS Subscription, Client Retainer"
                  value={newRecurringItem.name}
                  onChange={(e) => setNewRecurringItem({...newRecurringItem, name: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Amount & Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newRecurringItem.amount === 0 ? '0' : (newRecurringItem.amount || '')}
                    onChange={(e) => setNewRecurringItem({...newRecurringItem, amount: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newRecurringItem.frequency}
                    onChange={(e) => setNewRecurringItem({...newRecurringItem, frequency: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="weekly">📅 Weekly</option>
                    <option value="bi-weekly">📅📅 Bi-weekly (Every 2 Weeks)</option>
                    <option value="monthly">🗓️ Monthly</option>
                    <option value="quarterly">📊 Quarterly</option>
                    <option value="annually">📆 Annually</option>
                  </select>
                </div>
              </div>

              {/* 🆕 Day of Week Selector (for weekly/bi-weekly) */}
              {(newRecurringItem.frequency === 'weekly' || newRecurringItem.frequency === 'bi-weekly') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={newRecurringItem.dayOfWeek}
                    onChange={(e) => setNewRecurringItem({...newRecurringItem, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 {newRecurringItem.frequency === 'bi-weekly' ? 'Perfect for paychecks! (e.g., "every other Thursday")' : 'Choose which day this repeats'}
                  </p>
                </div>
              )}

              {/* Start Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newRecurringItem.startDate}
                    onChange={(e) => setNewRecurringItem({...newRecurringItem, startDate: e.target.value})}
                    className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., software, marketing"
                    value={newRecurringItem.category}
                    onChange={(e) => setNewRecurringItem({...newRecurringItem, category: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 🏔️ Passive Income Checkbox - Only for Income */}
              {recurringType === 'income' && (
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRecurringItem.isPassive || false}
                      onChange={(e) => setNewRecurringItem({...newRecurringItem, isPassive: e.target.checked})}
                      className="w-5 h-5 rounded border-amber-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                    />
                    <div>
                      <span className="text-white font-semibold">Passive Income</span>
                      <p className="text-xs text-amber-300 mt-1">
                        💡 Passive income counts toward your Freedom Ratio (income you earn without active work)
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                <p className="text-xs text-blue-200">
                  🔄 This item will be automatically added to your business on schedule. You can pause or delete it anytime.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddRecurring(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecurringItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Repeat className="w-4 h-4" />
                Add Recurring {recurringType === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
        </FixedModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && businessToDelete && (
        <FixedModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          title="Delete Business"
          size="md"
        >
            
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
                    <span className="text-green-400">${(parseFloat(businessToDelete.totalIncome) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Expenses:</span>
                    <span className="text-red-400">${(parseFloat(businessToDelete.totalExpenses) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Profit:</span>
                    <span className={`${businessToDelete.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(parseFloat(businessToDelete.netProfit) || 0).toLocaleString()}
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
        </FixedModal>
      )}

      {/* 🎉 MILESTONE CELEBRATION OVERLAY */}
      {showMilestoneCelebration && celebratingMilestone && (
        <FixedModal
          isOpen={showMilestoneCelebration}
          onClose={() => setShowMilestoneCelebration(false)}
          title="🎉 Milestone Unlocked!"
          size="md"
        >
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">{celebratingMilestone.icon}</div>
              <p className="text-xl text-amber-100">{celebratingMilestone.title}</p>
              <p className="text-sm text-amber-200 mt-2">{celebratingMilestone.description}</p>
            </div>
          </div>
        </FixedModal>
      )}
    </div>
  );
};

// Investment Portfolio Component with Charts
const InvestmentTab = ({ data, setData, userId, setRankUpData, setShowRankUpModal, setXpRefreshTrigger }) => {
  const { t } = useTranslation();
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [allocationView, setAllocationView] = useState('ticker'); // 'ticker' or 'category'
  const [hoveredInfo, setHoveredInfo] = useState(null);

  // ?��️ Info Tooltip Component - Beginner-friendly explanations
  const InfoTooltip = ({ id, text, children }) => (
    <span className="relative inline-flex items-center gap-1 group">
      {children}
      <svg 
        className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-help transition-colors"
        fill="currentColor" 
        viewBox="0 0 20 20"
        onMouseEnter={() => setHoveredInfo(id)}
        onMouseLeave={() => setHoveredInfo(null)}
      >
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {hoveredInfo === id && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-2xl border border-blue-500/50 w-64">
            <p className="leading-relaxed">{text}</p>
          </div>
        </div>
      )}
    </span>
  );
  
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
        label: holding.symbol || t('budget.unknownSymbol'),  // Ticker symbol (e.g., "AAPL", "BIT")
        name: holding.symbol || t('budget.unknownSymbol'),   // Keep for compatibility
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
      alert(t('validations.pleaseFillAllFields'));
      return;
    }
    
    const shares = parseFloat(newHolding.shares);
    const avgCost = parseFloat(newHolding.avgCost);
    const currentPrice = parseFloat(newHolding.currentPrice);
    const dividendYield = parseFloat(newHolding.dividendYield) || 0;

    // Validation for impossible values
    if (shares <= 0) {
      alert(t('validations.sharesMustBeGreaterThanZero'));
      return;
    }
    if (avgCost <= 0) {
      alert(t('validations.avgCostMustBeGreaterThanZero'));
      return;
    }
    if (currentPrice <= 0) {
      alert(t('validations.currentPriceMustBeGreaterThanZero'));
      return;
    }
    if (dividendYield < 0 || dividendYield > 50) {
      alert(t('validations.dividendYieldRange'));
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
        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
          investments: updatedData.investments
        });
        // Award XP (+50) for adding a new investment holding
        try {
          const result = await awardXp(db, userId, 50);
          setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
          if (result?.rankUp && result.newRank) {
            const prev = getRankFromXp((result.totalXp || 0) - 50);
            setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 50, action: 'add holding' });
            setShowRankUpModal(true);
            if (window.gtag) {
              window.gtag('event', 'rank_up', { new_rank: result.newRank.name, new_level: result.newRank.level, xp_gained: 50, action: 'add holding' });
            }
          }
        } catch (e) { console.warn('XP award failed (add holding)', e); }
      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
          investments: updatedData.investments
        });
      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
          investments: updatedData.investments
        });
      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
          investments: updatedData.investments
        });
      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <InfoTooltip 
              id="total-portfolio-value"
              text={t('tooltips.totalValue')}
            >
              <span>{t('dashboard.totalValue')}</span>
            </InfoTooltip>
          </h3>
          <p className="text-3xl font-bold text-blue-400 stealth-target">${(parseFloat(actualTotalValue) || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-2">{data.investments.holdings.length} {t('dashboard.holdings')}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <InfoTooltip 
              id="total-gain-loss"
              text={t('tooltips.totalGainLoss')}
            >
              <span>{t('dashboard.totalGainLoss')}</span>
            </InfoTooltip>
          </h3>
          <p className={`text-2xl font-bold stealth-target ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGainLoss >= 0 ? '+' : ''}${(parseFloat(totalGainLoss) || 0).toLocaleString()}
          </p>
          <p className={`text-sm mt-2 stealth-target ${totalGainLossPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
          </p>
        </Card>
        
        <Card style={{ backgroundColor: '#141F3B' }} className="border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-cyan-400" />
            <InfoTooltip 
              id="annual-dividends"
              text={t('tooltips.annualDividendsDesc')}
            >
              <span>{t('dashboard.annualDividends')}</span>
            </InfoTooltip>
          </h3>
          <p className="text-2xl font-bold text-cyan-400 stealth-target">
            ${(data.investments.holdings.reduce((sum, h) => sum + (parseFloat(h.annualDividend) || 0), 0)).toLocaleString()}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {((parseFloat(data.investments.holdings.reduce((sum, h) => sum + (parseFloat(h.annualDividend) || 0), 0)) || 0) / (parseFloat(data.investments.totalValue) || 1) * 100).toFixed(2)}% {t('dashboard.yield')}
          </p>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <InfoTooltip 
              id="drip-progress"
              text={t('tooltips.dripProgress')}
            >
              <span>{t('dashboard.dripProgress')}</span>
            </InfoTooltip>
          </h3>
          <p className="text-2xl font-bold text-amber-400">
            {data.investments.holdings.filter(h => h.dripEnabled).length} {t('dashboard.active')}
          </p>
          <p className="text-sm text-gray-300 mt-2 stealth-target">
            ${(data.investments.holdings.reduce((sum, h) => sum + (parseFloat(h.dividendAccumulated) || 0), 0)).toLocaleString()} accumulated
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
                {t('dashboard.addYourFirstInvestment')} to see portfolio allocation
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
              <div className="text-sm text-amber-200">{t('dashboard.annualIncome')}</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 text-center border border-amber-500/40">
              <div className="text-2xl font-bold text-amber-300">
                {((parseFloat(data.investments.holdings.reduce((sum, h) => sum + (parseFloat(h.annualDividend) || 0), 0)) || 0) / (parseFloat(actualTotalValue) || 1) * 100).toFixed(2)}%
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
                        <div className="text-xs text-gray-400">{holding.dividendYield}% {t('dashboard.yield')}</div>
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
                          <div className="text-xs text-gray-400">{holding.dividendYield}% {t('dashboard.yield')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${(parseFloat(holding.annualDividend) || 0).toLocaleString()}
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
                💡 <strong>Income Strategy:</strong> Your ${(data.investments.holdings.reduce((sum, h) => sum + (parseFloat(h.annualDividend) || 0), 0)).toLocaleString()} annual dividend income provides 
                <span className="font-semibold"> ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 12).toFixed(0)}{t('dashboard.perMonth')} </span>
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
            {t('dashboard.addHolding')}
          </button>
        </div>
        <div className="space-y-4">
          {data.investments.holdings.length === 0 ? (
            <Card className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 border-violet-500/30">
              <div className="max-w-4xl mx-auto">
                {/* Getting Started Guide */}
                <div className="text-center mb-8">
                  <BarChart3 className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">💼 Getting Started with Investing</h3>
                  <p className="text-gray-300 text-lg">
                    New to investing? Don't worry! Here's everything you need to know.
                  </p>
                </div>

                {/* Step-by-Step Guide */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {/* Step 1 */}
                  <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-lg p-6 border border-violet-600/30">
                    <div className="text-3xl mb-3 font-bold text-violet-300">1</div>
                    <h4 className="text-lg font-bold text-white mb-2">{t('dashboard.addYourFirstInvestment')}</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Click "{t('dashboard.addYourFirstInvestment')}" and enter your stock info:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>◆ <strong>Ticker:</strong> Stock symbol (e.g., AAPL, TSLA)</li>
                      <li>◆ <strong>Shares:</strong> How many you own</li>
                      <li>◆ <strong>Price:</strong> What you paid per share</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-lg p-6 border border-blue-600/30">
                    <div className="text-3xl mb-3 font-bold text-blue-300">2</div>
                    <h4 className="text-lg font-bold text-white mb-2">Track Your Growth</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Watch your portfolio come to life:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>◆ See real-time value</li>
                      <li>◆ Track gains & losses</li>
                      <li>◆ View allocation charts</li>
                      <li>◆ Monitor dividends</li>
                    </ul>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-lg p-6 border border-green-600/30">
                    <div className="text-3xl mb-3 font-bold text-green-300">3</div>
                    <h4 className="text-lg font-bold text-white mb-2">Build Wealth</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Enable DRIP to grow faster:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>◆ Auto-reinvest dividends</li>
                      <li>◆ Compound your returns</li>
                      <li>◆ Build wealth passively</li>
                      <li>◆ Track your progress</li>
                    </ul>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-amber-900/20 rounded-lg p-6 border border-amber-600/30 mb-8">
                  <h4 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Beginner Tips
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">💡 Start Small:</strong> You don't need thousands to start. Even one share counts!
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">📚 Learn As You Go:</strong> Each investment teaches you something new.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">🎯 Diversify:</strong> Don't put all eggs in one basket. Spread your investments.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">⏳ Think Long-Term:</strong> Wealth builds over time. Be patient!
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowAddHolding(true)}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg inline-flex items-center gap-3 hover:scale-105"
                  >
                    <Plus className="w-6 h-6" />
                    {t('dashboard.addYourFirstInvestment')}
                  </button>
                  <p className="text-sm text-gray-400 mt-3">
                    {t('dashboard.readyToStartClickAbove')} 📈
                  </p>
                </div>
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
                  <div className="text-xs text-gray-400">Current Price</div>
                  <div className={`text-xs ${holding.currentPrice >= holding.avgCost ? 'text-green-400' : 'text-red-400'}`}>
                    {((holding.currentPrice - holding.avgCost) / holding.avgCost * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white">${(parseFloat(holding.totalValue) || 0).toLocaleString()}</div>
                  <InfoTooltip 
                    id={`total-value-${holding.id}`}
                    text={t('tooltips.holdingTotalValue')}
                  >
                    <div className="text-xs text-gray-400">Total Value</div>
                  </InfoTooltip>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">${(parseFloat(holding.annualDividend) || 0).toLocaleString()}</div>
                  <InfoTooltip 
                    id={`dividend-${holding.id}`}
                    text={t('tooltips.annualDividend')}
                  >
                    <div className="text-xs text-gray-400">Annual Dividend</div>
                  </InfoTooltip>
                  <div className="text-xs text-cyan-300">{holding.dividendYield}% {t('dashboard.yield')}</div>
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
                    <InfoTooltip 
                      id={`drip-${holding.id}`}
                      text={t('tooltips.dripPlan')}
                    >
                      <span>DRIP {holding.dripEnabled ? 'ON' : 'OFF'}</span>
                    </InfoTooltip>
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
          <FixedModal
            isOpen={showAddHolding}
            onClose={() => setShowAddHolding(false)}
            title={t('dashboard.addYourFirstInvestment')}
            size="md"
          >
            <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
                    <InfoTooltip 
                      id="ticker-info"
                      text={t('tooltips.stockTicker')}
                    >
                      <span>Stock Ticker Symbol</span>
                    </InfoTooltip>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AAPL, TSLA, MSFT"
                    value={newHolding.symbol}
                    onChange={(e) => setNewHolding({...newHolding, symbol: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Apple Inc."
                    value={newHolding.name}
                    onChange={(e) => setNewHolding({...newHolding, name: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
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
                  <div>
                    <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
                      <InfoTooltip 
                        id="shares-info"
                        text={t('tooltips.shares')}
                      >
                        <span>Shares Owned</span>
                      </InfoTooltip>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 10"
                      value={newHolding.shares === 0 ? '0' : (newHolding.shares || '')}
                      onChange={(e) => setNewHolding({...newHolding, shares: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
                      <InfoTooltip 
                        id="avg-cost-info"
                        text={t('tooltips.averageCost')}
                      >
                        <span>Avg Cost per Share</span>
                      </InfoTooltip>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 150.00"
                      value={newHolding.avgCost === 0 ? '0' : (newHolding.avgCost || '')}
                      onChange={(e) => setNewHolding({...newHolding, avgCost: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
                      <InfoTooltip 
                        id="current-price-info"
                        text={t('tooltips.currentPrice')}
                      >
                        <span>Current Price</span>
                      </InfoTooltip>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 175.50"
                      value={newHolding.currentPrice === 0 ? '0' : (newHolding.currentPrice || '')}
                      onChange={(e) => setNewHolding({...newHolding, currentPrice: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
                      <InfoTooltip 
                        id="dividend-yield-info"
                        text={t('tooltips.dividendYield')}
                      >
                        <span>Dividend Yield %</span>
                      </InfoTooltip>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2.5"
                      value={newHolding.dividendYield === 0 ? '0' : (newHolding.dividendYield || '')}
                      onChange={(e) => setNewHolding({...newHolding, dividendYield: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
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
                  {t('dashboard.addYourFirstInvestment')}
                </button>
              </div>
          </FixedModal>
        )}

        {/* Edit Holding Modal */}
        {editingHolding && (
          <FixedModal
            isOpen={!!editingHolding}
            onClose={() => setEditingHolding(null)}
            title={`Edit ${editingHolding.symbol}`}
            size="md"
          >
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
                    value={editingHolding.shares === 0 ? '0' : (editingHolding.shares || '')}
                    onChange={(e) => setEditingHolding({...editingHolding, shares: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Avg Cost"
                    value={editingHolding.avgCost === 0 ? '0' : (editingHolding.avgCost || '')}
                    onChange={(e) => setEditingHolding({...editingHolding, avgCost: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Current Price"
                    value={editingHolding.currentPrice === 0 ? '0' : (editingHolding.currentPrice || '')}
                    onChange={(e) => setEditingHolding({...editingHolding, currentPrice: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Dividend Yield %"
                    value={editingHolding.dividendYield === 0 ? '0' : (editingHolding.dividendYield || '')}
                    onChange={(e) => setEditingHolding({...editingHolding, dividendYield: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
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
          </FixedModal>
        )}
      </div>
    );
  };

// Transaction Management Component
const TransactionsTab = ({ data, setData, userId, setRankUpData, setShowRankUpModal, setXpRefreshTrigger }) => {
  const { t } = useTranslation();
  const spendingChartRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null); // For editing recurring expenses
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
    date: getTodayInUserTimezone(),
    isRecurring: false,
    isPassive: false, // 🏔️ Freedom Ratio: Passive income flag
    frequency: 'monthly',
    dayOfMonth: 1,
    dayOfWeek: 1,
    monthOfYear: 1
  });

  const subcategoryOptions = {
    personal: {
      income: ['salary', 'bonus', 'investment', 'consulting', 'trading', 'services', 'products', 'other'],
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
      // 🔧 BUG FIX: Use correct categorization function based on transaction type
      const autoCategory = finalTransaction.type === 'income' 
        ? categorizeIncome(finalTransaction.description)
        : categorizeExpense(finalTransaction.description);
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
    
    // Add the transaction to BOTH arrays for consistency
    const updatedTransactions = [transaction, ...(data.transactions || [])];
    updatedData.transactions = updatedTransactions;
    updatedData.recentTransactions = updatedTransactions; // CRITICAL FIX: Update both arrays!
    
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
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      const fieldsToUpdate = {
        transactions: updatedData.transactions,
        recentTransactions: updatedData.recentTransactions
      };
      
      // Add recurring expenses if they were added
      if (updatedData.recurringExpenses && updatedData.recurringExpenses !== data.recurringExpenses) {
        fieldsToUpdate.recurringExpenses = updatedData.recurringExpenses;
      }
      
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), fieldsToUpdate);
      
      // Award XP (+1) for logging a transaction
      try {
        const result = await awardXp(db, userId, 1);
        setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - 1);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 1, action: 'transaction' });
          setShowRankUpModal(true);
          if (window.gtag) {
            window.gtag('event', 'rank_up', { new_rank: result.newRank.name, new_level: result.newRank.level, xp_gained: 1, action: 'transaction' });
          }
        }
      } catch (e) { console.warn('XP award failed (transaction)', e); }
      setData(updatedData);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'personal',
        subcategory: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        isPassive: false, // 🏔️ Freedom Ratio: Reset passive income flag
        frequency: 'monthly',
        dayOfMonth: 1,
        dayOfWeek: 1,
        monthOfYear: 1
      });
      setShowAddForm(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error adding transaction:', error);
    }
  };

  // ?��️ EDIT RECURRING EXPENSE HANDLER
  const handleEditRecurringExpense = async () => {
    if (!editingRecurring) return;

    // Convert string amounts to numbers
    const convertedRecurring = {
      ...editingRecurring,
      amount: Number(editingRecurring.amount || 0)
    };

    const updatedRecurring = data.recurringExpenses.map(r =>
      r.id === editingRecurring.id ? convertedRecurring : r
    );

    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        recurringExpenses: updatedRecurring
      });
      
      setData({ ...data, recurringExpenses: updatedRecurring });
      setEditingRecurring(null);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error updating recurring expense:', error);
    }
  };

  const handleEditTransaction = async (transaction) => {
    // FIX: Update BOTH arrays (same as delete function)
    const updatedTransactions = (data.transactions || []).map(t => 
      t.id === transaction.id ? {
        ...transaction,
        amount: transaction.type === 'expense' ? -Math.abs(parseFloat(transaction.amount)) : Math.abs(parseFloat(transaction.amount))
      } : t
    );
    
    const updatedRecentTransactions = (data.recentTransactions || []).map(t => 
      t.id === transaction.id ? {
        ...transaction,
        amount: transaction.type === 'expense' ? -Math.abs(parseFloat(transaction.amount)) : Math.abs(parseFloat(transaction.amount))
      } : t
    );
    
    try {
      // 🛡️ USE updateDoc to prevent data loss
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        transactions: updatedTransactions,
        recentTransactions: updatedRecentTransactions
      });
      setData({ 
        ...data, 
        transactions: updatedTransactions,
        recentTransactions: updatedRecentTransactions
      });
      setEditingTransaction(null);
      infoLog('? Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    // FIX: Delete from BOTH arrays to ensure UI updates
    const updatedTransactions = (data.transactions || []).filter(t => t.id !== transactionId);
    const updatedRecentTransactions = (data.recentTransactions || []).filter(t => t.id !== transactionId);
    
    const updatedData = { 
      ...data, 
      transactions: updatedTransactions,
      recentTransactions: updatedRecentTransactions
    };
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        transactions: updatedTransactions,
        recentTransactions: updatedRecentTransactions
      });
      setData(updatedData);
      infoLog('? Transaction deleted successfully');
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error deleting transaction:', error);
      alert(t('errors.failedToDeleteTransaction'));
    }
  };

  // 🔍 UPGRADE 2: Advanced Filtering Logic with Search
  debugLog('🔍 DEBUG TransactionsTab: data.recentTransactions length:', data?.recentTransactions?.length);
  debugLog('🔍 DEBUG TransactionsTab: data.transactions length:', data?.transactions?.length);
  debugLog('🔍 DEBUG TransactionsTab: Using array:', data.recentTransactions ? 'recentTransactions' : 'transactions');
  
  const filteredTransactions = (data.recentTransactions || data.transactions || [])
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
    const currentMonthExpenses = (data.recentTransactions || data.transactions || []).filter(t => {
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

  const totalIncome = (data.recentTransactions || data.transactions || [])
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = (data.recentTransactions || data.transactions || [])
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const personalIncome = (data.recentTransactions || data.transactions || [])
    .filter(t => t.amount > 0 && t.category === 'personal')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const businessIncome = (data.recentTransactions || data.transactions || [])
    .filter(t => t.amount > 0 && t.category === 'business')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const personalExpenses = (data.recentTransactions || data.transactions || [])
    .filter(t => t.amount < 0 && t.category === 'personal')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const businessExpenses = (data.recentTransactions || data.transactions || [])
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
            {t('dashboard.totalIncome')}
          </h3>
          <p className="text-2xl font-bold text-green-400 stealth-target">${(parseFloat(totalIncome) || 0).toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-300">
            <div className="stealth-target">{t('dashboard.personal')}: ${(parseFloat(personalIncome) || 0).toLocaleString()}</div>
            <div className="stealth-target">{t('dashboard.business')}: ${(parseFloat(businessIncome) || 0).toLocaleString()}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/40 to-rose-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ArrowDown className="w-5 h-5 mr-2 text-red-400" />
            {t('dashboard.totalExpenses')}
          </h3>
          <p className="text-2xl font-bold text-red-400 stealth-target">${(parseFloat(totalExpenses) || 0).toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-300">
            <div className="stealth-target">{t('dashboard.personal')}: ${(parseFloat(personalExpenses) || 0).toLocaleString()}</div>
            <div className="stealth-target">{t('dashboard.business')}: ${(parseFloat(businessExpenses) || 0).toLocaleString()}</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            {t('transactions.netFlow')}
          </h3>
          <p className={`text-2xl font-bold stealth-target ${(totalIncome - totalExpenses) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            ${((parseFloat(totalIncome) || 0) - (parseFloat(totalExpenses) || 0)).toLocaleString()}
          </p>
          <div className="mt-2 text-sm text-gray-300">
            {data.transactions.length} {t('transactions.transactionCount', { count: data.transactions.length })}
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
            {t('transactions.avgTransaction')}
          </h3>
          <p className="text-2xl font-bold text-purple-400 stealth-target">
            ${data.transactions.length > 0 ? (Math.abs(data.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / data.transactions.length)).toFixed(2) : '0.00'}
          </p>
          <div className="mt-2 text-sm text-gray-300">
            {t('transactions.last30Days')}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <CreditCard className="w-6 h-6 mr-3 text-blue-400" />
              {t('dashboard.transactionManagement')}
            </h2>
            <p className="text-gray-400">{t('dashboard.trackTransactions')}</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.addTransaction')}
          </button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="all">{t('dashboard.allTypes')}</option>
            <option value="income">{t('dashboard.incomeOnly')}</option>
            <option value="expense">{t('dashboard.expensesOnly')}</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="all">{t('dashboard.allCategories')}</option>
            <option value="personal">{t('dashboard.personal')}</option>
            <option value="business">{t('dashboard.business')}</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            <option value="date">{t('dashboard.sortByDate')}</option>
            <option value="amount">{t('dashboard.sortByAmount')}</option>
            <option value="description">{t('dashboard.sortByDescription')}</option>
          </select>
          
          <button
            onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors ${
              showTransactionHistory ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showTransactionHistory ? t('common.hideHistory') : t('dashboard.monthlyHistory')}
          </button>
        </div>
      </Card>

      {/* Transaction History by Month */}
      {showTransactionHistory && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-purple-400" />
            {t('dashboard.transactionHistoryByMonth')}
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
                        <span className="text-green-400">{t('transactions.income')}: ${(parseFloat(monthIncome) || 0).toLocaleString()}</span>
                        <span className="text-red-400">{t('transactions.expenses')}: ${(parseFloat(monthExpenses) || 0).toLocaleString()}</span>
                        <span className={`font-semibold ${monthNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          {t('transactions.netLabel')} ${(parseFloat(monthNet) || 0).toLocaleString()}
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
                            {transaction.amount > 0 ? '+' : '-'}${Math.abs(parseFloat(transaction.amount) || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {transactions.length > 6 && (
                        <div className="text-center text-gray-400 text-xs col-span-2">
                          +{transactions.length - 6} {t('transactions.moreTransactions')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Add Transaction Form - FIXED MODAL VERSION */}
      <FixedModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title={t('dashboard.addNewTransaction')}
        description={t('dashboard.trackIncomeExpenses')}
        size="lg"
      >
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t('transactions.descriptionPlaceholder')}
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
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="number"
                placeholder={t('transactions.amountPlaceholder')}
                value={newTransaction.amount === 0 ? '0' : (newTransaction.amount || '')}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                <option value="">🤖 {t('transactions.autoCategorize')}</option>
                {subcategoryOptions[newTransaction.category]?.[newTransaction.type]?.map(sub => (
                  <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                style={{ maxWidth: '100%' }}
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
                  <span className="text-white font-semibold">🔄 {newTransaction.type === 'income' ? t('transactions.makeRecurringIncome') : t('transactions.makeRecurringExpense')}</span>
                </label>
              </div>
              
              {newTransaction.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <select
                    value={newTransaction.frequency}
                    onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="weekly">📅 {t('frequencies.weekly')}</option>
                    <option value="bi-weekly">📅📅 {t('frequencies.biWeekly')}</option>
                    <option value="monthly">🗓️ {t('frequencies.monthly')}</option>
                    <option value="yearly">📆 {t('frequencies.yearly')}</option>
                  </select>
                  
                  {(newTransaction.frequency === 'weekly' || newTransaction.frequency === 'bi-weekly') && (
                    <select
                      value={newTransaction.dayOfWeek}
                      onChange={(e) => setNewTransaction({...newTransaction, dayOfWeek: e.target.value})}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value={0}>{t('daysOfWeek.sunday')}</option>
                      <option value={1}>{t('daysOfWeek.monday')}</option>
                      <option value={2}>{t('daysOfWeek.tuesday')}</option>
                      <option value={3}>{t('daysOfWeek.wednesday')}</option>
                      <option value={4}>{t('daysOfWeek.thursday')}</option>
                      <option value={5}>{t('daysOfWeek.friday')}</option>
                      <option value={6}>{t('daysOfWeek.saturday')}</option>
                    </select>
                  )}
                  
                  {newTransaction.frequency === 'monthly' && (
                    <select
                      value={newTransaction.dayOfMonth}
                      onChange={(e) => setNewTransaction({...newTransaction, dayOfMonth: parseInt(e.target.value)})}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      {Array.from({length: 31}, (_, i) => (
                        <option key={i+1} value={i+1}>{t('frequencies.day')} {i+1}</option>
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
                        <option value={1}>{t('months.january')}</option>
                        <option value={2}>{t('months.february')}</option>
                        <option value={3}>{t('months.march')}</option>
                        <option value={4}>{t('months.april')}</option>
                        <option value={5}>{t('months.may')}</option>
                        <option value={6}>{t('months.june')}</option>
                        <option value={7}>{t('months.july')}</option>
                        <option value={8}>{t('months.august')}</option>
                        <option value={9}>{t('months.september')}</option>
                        <option value={10}>{t('months.october')}</option>
                        <option value={11}>{t('months.november')}</option>
                        <option value={12}>{t('months.december')}</option>
                      </select>
                      <select
                        value={newTransaction.dayOfMonth}
                        onChange={(e) => setNewTransaction({...newTransaction, dayOfMonth: parseInt(e.target.value)})}
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      >
                        {Array.from({length: 31}, (_, i) => (
                          <option key={i+1} value={i+1}>{t('frequencies.day')} {i+1}</option>
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
                    <span className="font-semibold">{t('transactions.automationPreview')}</span>
                  </div>
                  <div>
                    This {newTransaction.type} will automatically be added every{' '}
                    {newTransaction.frequency === 'weekly' && `week on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][newTransaction.dayOfWeek]}`}
                    {newTransaction.frequency === 'bi-weekly' && `2 weeks on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][newTransaction.dayOfWeek]} (e.g., paychecks!)`}
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
              {t('dashboard.addTransaction')}
            </button>
          </div>
      </FixedModal>

      {/* 📊 UPGRADE 1: Spending by Category Visualization (Mobile Optimized) */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-blue-500/30">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <PieChart className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-400" />
            💰 {t('dashboard.spendingByCategory')}
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
              <h4 className="text-sm font-semibold text-gray-300 mb-3 px-1">{t('transactions.categoryBreakdown')}</h4>
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
                    <span className="text-sm font-semibold text-white">${(parseFloat(item.amount) || 0).toLocaleString()}</span>
                    <span className="text-sm text-blue-400 font-semibold min-w-[3rem] text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('dashboard.totalSpendingThisMonth')}</span>
                  <span className="text-lg font-bold text-red-400">
                    ${(spendingByCategory.reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg font-semibold">
              {t('dashboard.logFirstExpense')}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {t('dashboard.trackMoneyInsights')}
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
                {t('transactions.recurringIncomeExpenses')}
                ({data.recurringExpenses.filter(r => r.isActive).length} {t('transactions.active', { count: data.recurringExpenses.filter(r => r.isActive).length })})
              </h3>
              <p className="text-gray-400">{t('transactions.automaticallyProcessed')}</p>
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
                      {recurring.type === 'expense' ? '-' : '+'}${(parseFloat(recurring.amount) || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    recurring.isActive 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {recurring.isActive ? t('transactions.active', { count: 1 }) : t('transactions.pause')}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>{t('transactions.frequency')}</span>
                    <span className="capitalize">{recurring.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('transactions.nextDue')}</span>
                    <span className="text-purple-300">{new Date(recurring.nextDueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('common.category')}:</span>
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
                    {t('transactions.editRecurring')}
                  </button>
                  
                  <button
                    onClick={async () => {
                      const updatedRecurring = data.recurringExpenses.map(r => 
                        r.id === recurring.id ? { ...r, isActive: !r.isActive } : r
                      );
                      try {
                        // 🛡️ USE updateDoc to prevent data loss
                        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
                          recurringExpenses: updatedRecurring
                        });
                        setData({ ...data, recurringExpenses: updatedRecurring });
                      } catch (error) {
                        console.error('Error updating recurring expense:', error);
                      }

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
                    }}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      recurring.isActive
                        ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}
                  >
                    {recurring.isActive ? t('transactions.pause') : t('transactions.resume')}
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (!window.confirm(t('transactions.deleteRecurring'))) return;
                      const updatedRecurring = data.recurringExpenses.filter(r => r.id !== recurring.id);
                      try {
                        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
                        await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
                          recurringExpenses: updatedRecurring
                        });
                        
                        setData({ ...data, recurringExpenses: updatedRecurring });
                      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
                        console.error('Error deleting recurring expense:', error);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs font-semibold transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ✏️ EDIT RECURRING EXPENSE MODAL */}
      {editingRecurring && (
        <FixedModal
          isOpen={!!editingRecurring}
          onClose={() => setEditingRecurring(null)}
          title={editingRecurring.type === 'income' ? t('transactions.editRecurringIncome') : t('transactions.editRecurringExpense')}
          size="lg"
        >
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('common.description')}
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
                    {t('common.amount')}
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={editingRecurring.amount === 0 ? '0' : (editingRecurring.amount || '')}
                    onChange={(e) => setEditingRecurring({...editingRecurring, amount: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {t('common.type')}
                  </label>
                  <select
                    value={editingRecurring.type || 'expense'}
                    onChange={(e) => setEditingRecurring({...editingRecurring, type: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="expense">{t('dashboard.expense')}</option>
                    <option value="income">{t('dashboard.income')}</option>
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('transactions.frequency')}
                </label>
                <select
                  value={editingRecurring.frequency || 'monthly'}
                  onChange={(e) => setEditingRecurring({...editingRecurring, frequency: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="weekly">📅 {t('frequencies.weekly')}</option>
                  <option value="bi-weekly">📅📅 {t('frequencies.biWeekly')}</option>
                  <option value="monthly">🗓️ {t('frequencies.monthly')}</option>
                  <option value="yearly">📆 {t('frequencies.yearly')}</option>
                </select>
              </div>
              
              {/* 🆕 Day of Week Selector (for weekly/bi-weekly) */}
              {(editingRecurring.frequency === 'weekly' || editingRecurring.frequency === 'bi-weekly') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={editingRecurring.dayOfWeek || 1}
                    onChange={(e) => setEditingRecurring({...editingRecurring, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 {editingRecurring.frequency === 'bi-weekly' ? 'Perfect for paychecks! (e.g., "every other Thursday")' : 'Choose which day this repeats'}
                  </p>
                </div>
              )}

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editingRecurring.category || 'personal'}
                    onChange={(e) => setEditingRecurring({...editingRecurring, category: e.target.value, subcategory: ''})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="personal">👤 Personal</option>
                    <option value="business">🏢 Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={editingRecurring.subcategory || ''}
                    onChange={(e) => setEditingRecurring({...editingRecurring, subcategory: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">🤖 Auto-categorize</option>
                    {subcategoryOptions[editingRecurring.category || 'personal']?.[editingRecurring.type || 'expense']?.map(sub => (
                      <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Categorize for better tracking
                  </p>
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
                  className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  style={{ maxWidth: '100%' }}
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
        </FixedModal>
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
                placeholder={t('dashboard.searchTransactions')}
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
          <span>{t('dashboard.recentTransactions')} ({filteredTransactions.length})</span>
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
                      {formatDateForUser(transaction.date)}
                      <span className="mx-2">•</span>
                      <span className={transaction.category === 'business' ? 'text-blue-400' : 'text-green-400'}>
                        {transaction.category}
                      </span>
                      {transaction.subcategory && <><span className="mx-2">•</span>{transaction.subcategory}</>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-lg font-bold ${
                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : '-'}${Math.abs(parseFloat(transaction.amount) || 0).toLocaleString()}
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
              {t('dashboard.noTransactionsFound')}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <FixedModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          title={t('dashboard.editTransaction')}
          size="md"
        >
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
                value={editingTransaction.amount ? Math.abs(parseFloat(editingTransaction.amount) || 0) : ''}
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingTransaction.type}
                  onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value, subcategory: ''})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                >
                  <option value="expense">💸 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
                
                <select
                  value={editingTransaction.category}
                  onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value, subcategory: ''})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                >
                  <option value="personal">👤 Personal</option>
                  <option value="business">🏢 Business</option>
                </select>
              </div>
              
              <select
                value={editingTransaction.subcategory || ''}
                onChange={(e) => setEditingTransaction({...editingTransaction, subcategory: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              >
                <option value="">🤖 Auto-categorize</option>
                {subcategoryOptions[editingTransaction.category]?.[editingTransaction.type]?.map(sub => (
                  <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                style={{ maxWidth: '100%' }}
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
        </FixedModal>
      )}
    </div>
  );
};

// Travel Tab Component with Trip Budgeting
const TravelTab = ({ data, setData, userId }) => {
  const { t } = useTranslation();
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showRunwayModal, setShowRunwayModal] = useState(false);
  const [showRunwayCalculator, setShowRunwayCalculator] = useState(false); // NEW: Toggle for runway calculator
  const [hoveredCountry, setHoveredCountry] = useState(null);
  
  // 💫 NEW: Travel Moment Modal States (separate from main Moments system)
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [momentText, setMomentText] = useState('');
  const [momentTrip, setMomentTrip] = useState(null);
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

  // 🌍 Wishlist editing states
  const [showAddWishlistCountry, setShowAddWishlistCountry] = useState(false);
  const [wishlistCountryInput, setWishlistCountryInput] = useState('');

  // FIX: Helper function for local date
  const getTodayLocal = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    currency: data.travel?.homeCurrency || 'CAD',
    category: 'other',
    date: getTodayLocal() // FIX: Use local date instead of UTC
  });

  // 🔤 Auto-capitalize first letter of country name
  const capitalizeCountryName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // 🌍 Add country to wishlist
  const handleAddWishlistCountry = async () => {
    if (!wishlistCountryInput.trim()) return;
    
    const formattedCountry = capitalizeCountryName(wishlistCountryInput.trim());
    const currentWishlist = data.travel?.wishlistCountries || [];
    
    // Check if already in wishlist
    if (currentWishlist.some(c => c.toLowerCase() === formattedCountry.toLowerCase())) {
      alert(t('validations.countryAlreadyInWishlist'));
      return;
    }
    
    const updatedWishlist = [...currentWishlist, formattedCountry];
    const updatedTravel = { ...data.travel, wishlistCountries: updatedWishlist };
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        travel: updatedTravel
      });
      setData({ ...data, travel: updatedTravel });
      setWishlistCountryInput('');
      setShowAddWishlistCountry(false);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error adding wishlist country:', error);
      alert(t('errors.failedToAddCountry'));
    }
  };

  // 🗑️ Remove country from wishlist
  const handleRemoveWishlistCountry = async (countryToRemove) => {
    const currentWishlist = data.travel?.wishlistCountries || [];
    const updatedWishlist = currentWishlist.filter(c => c !== countryToRemove);
    const updatedTravel = { ...data.travel, wishlistCountries: updatedWishlist };
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        travel: updatedTravel
      });
      setData({ ...data, travel: updatedTravel });
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error removing wishlist country:', error);
      alert(t('errors.failedToRemoveCountry'));
    }
  };

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
          totalSavings: Number(runwaySettings.totalSavings || 0),
          homeCurrency: runwaySettings.homeCurrency,
          tripPlan: {
            cheap: Number(runwaySettings.tripPlan?.cheap || 0),
            moderate: Number(runwaySettings.tripPlan?.moderate || 0),
            expensive: Number(runwaySettings.tripPlan?.expensive || 0)
          }
        }
      };
      
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        travel: updatedData.travel
      });
      
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

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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

     try {
       // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
       await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
         travel: updatedTravel,
         transactions: updatedTransactions
       });
       
       setData({
         ...data,
         travel: updatedTravel,
         transactions: updatedTransactions
       });
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

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
           targetBudget: Number(editingTrip.targetBudget || 0),
           estimatedDailySpend: Number(editingTrip.estimatedDailySpend || 0),
           currentSavings: Number(editingTrip.currentSavings || 0),
           countries: editingTrip.countries.filter(c => c.trim())
         };
       }
       return trip;
     });

     const updatedTravel = { ...data.travel, trips: updatedTrips };

     try {
       // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
       await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
         travel: updatedTravel
       });
       
       setData({ ...data, travel: updatedTravel });
       setEditingTrip(null);
       
       // Force viewport cleanup after modal close
       setTimeout(() => {
         window.scrollTo(0, 0);
         document.body.style.overflow = '';
         document.body.style.position = '';
         document.body.style.height = '';
       }, 100);
     } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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

   try {
     // 🛡️ USE updateDoc to prevent data loss
     await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
       travel: updatedTravel
     });
     setData({ ...data, travel: updatedTravel });
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
   if (!window.confirm(t('confirmations.deleteTripConfirm'))) {
     return;
   }

   const updatedTrips = (data.travel?.trips || []).filter(trip => trip.id !== tripId);
   const updatedTravel = { ...data.travel, trips: updatedTrips };

   try {
     // 🛡️ USE updateDoc to prevent data loss
     await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
       travel: updatedTravel
     });
     setData({ ...data, travel: updatedTravel });
   } catch (error) {
     console.error('Error deleting trip:', error);
   }
 };

 // 🗑️ DELETE EXPENSE FROM TRIP HANDLER
 const handleDeleteExpense = async (tripId, expenseId) => {
   if (!window.confirm(t('confirmations.deleteExpenseConfirm'))) {
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

   try {
     // 🛡️ USE updateDoc to prevent data loss
     await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
       travel: updatedTravel
     });
     setData({ ...data, travel: updatedTravel });
   } catch (error) {
     console.error('Error deleting expense:', error);
   }
 };

 // 💫 NEW: ADD MOMENT TO TRIP HANDLER
 const handleAddMomentToTrip = async () => {
   if (!momentText.trim() || !momentTrip) return;

   const newMoment = {
     id: Date.now(),
     title: `${momentTrip.name} - Moment`,
     story: momentText.trim(),
     timestamp: new Date().toISOString(),
     location: momentTrip.countries?.[0] || momentTrip.name,
     tripId: momentTrip.id,
     tripName: momentTrip.name,
     isTravel: true,
     photos: []
   };

   // Add to moments array
   const updatedMoments = [...(data.moments || []), newMoment];
   
   // Also add to trip's moments array
   const updatedTrips = (data.travel?.trips || []).map(trip => {
     if (trip.id === momentTrip.id) {
       return {
         ...trip,
         moments: [...(trip.moments || []), newMoment]
       };
     }
     return trip;
   });

   const updatedTravel = { ...data.travel, trips: updatedTrips };

   try {
     // 🛡️ USE updateDoc to prevent data loss
     await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
       travel: updatedTravel,
       moments: updatedMoments
     });
     setData({ ...data, travel: updatedTravel, moments: updatedMoments });
     setMomentText('');
     setMomentTrip(null);
     setShowMomentModal(false);
     
     // Note: XP is awarded through main Moments system when users view/manage in Moments page
     // This keeps Travel component simple and avoids scope issues
   } catch (error) {
     console.error('Error adding moment:', error);
   }
 };

 // 💫 DELETE MOMENT FROM TRIP HANDLER
 const handleDeleteTripMoment = async (tripId, momentId) => {
   if (!window.confirm(t('confirmations.deleteMomentConfirm'))) return;

   // Remove from trip's moments
   const updatedTrips = (data.travel?.trips || []).map(trip => {
     if (trip.id === tripId) {
       return {
         ...trip,
         moments: (trip.moments || []).filter(m => m.id !== momentId)
       };
     }
     return trip;
   });

   // Remove from global moments
   const updatedMoments = (data.moments || []).filter(m => m.id !== momentId);

   const updatedTravel = { ...data.travel, trips: updatedTrips };

   try {
     // 🛡️ USE updateDoc to prevent data loss
     await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
       travel: updatedTravel,
       moments: updatedMoments
     });
     setData({ ...data, travel: updatedTravel, moments: updatedMoments });
   } catch (error) {
     console.error('Error deleting moment:', error);
   }
 };


  const runway = calculateRunway();

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* ? Travel Runway Calculator MOVED to "Trip Planning & Budgets" section below! */}
      {/* Now it's collapsible with a "Show Travel Runway" button - much cleaner! */}
      {/* 🗺️ OPERATOR'S WORLD MAP - Now at TOP of page (no more scroll issues!) */}
      {(() => {
        // 🌍 COUNTRY NAME MAPPING - Maps user input to GeoJSON country names
        const normalizeCountryName = (userInput) => {
          const input = userInput.trim().toLowerCase();
          
          // Common aliases and mappings to official GeoJSON names
          const countryAliases = {
            // Americas
            'usa': 'united states of america',
            'us': 'united states of america',
            'united states': 'united states of america',
            'america': 'united states of america',
            
            // Europe
            'uk': 'united kingdom',
            'england': 'united kingdom',
            'britain': 'united kingdom',
            'great britain': 'united kingdom',
            'czech republic': 'czechia',
            'holland': 'netherlands',
            'macedonia': 'north macedonia',
            'russia': 'russian federation',
            
            // Middle East
            'uae': 'united arab emirates',
            'emirates': 'united arab emirates',
            'syria': 'syrian arab republic',
            'iran': 'islamic republic of iran',
            'palestine': 'palestinian territory',
            
            // Asia
            'south korea': 'republic of korea',
            'korea': 'republic of korea',
            'north korea': "democratic people's republic of korea",
            'vietnam': 'viet nam',
            'laos': "lao people's democratic republic",
            'burma': 'myanmar',
            
            // Africa
            'ivory coast': "côte d'ivoire",
            'cape verde': 'cabo verde',
            'congo': 'republic of the congo',
            'drc': 'democratic republic of the congo',
            'dr congo': 'democratic republic of the congo',
            'swaziland': 'eswatini',
            
            // South America
            'venezuela': 'bolivarian republic of venezuela',
            'bolivia': 'plurinational state of bolivia',
            
            // East Africa
            'tanzania': 'united republic of tanzania',
            
            // Eastern Europe
            'moldova': 'republic of moldova',
            
            // Pacific
            'east timor': 'timor-leste',
            
            // Additional common variations
            'china': "people's republic of china",
            'prc': "people's republic of china"
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
                // COMPLETED EXPEDITION ?�� AMBER/GOLD
                if (!visitedCountries.has(normalizedCountry)) {
                  visitedCountries.set(normalizedCountry, []);
                }
                visitedCountries.get(normalizedCountry).push(trip);
                console.log(`? COMPLETED: ${country} ?�� ${normalizedCountry} (AMBER)`);
              } else {
                // FUTURE MISSION ?�� BLUE
                if (!plannedCountries.has(normalizedCountry)) {
                  plannedCountries.set(normalizedCountry, []);
                }
                plannedCountries.get(normalizedCountry).push(trip);
                console.log(`🔵 PLANNED: ${country} ?�� ${normalizedCountry} (BLUE)`);
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
                  {t('travel.operatorsWorldMap')}
                </h2>
                <p className="text-gray-400">{t('travel.questToPaintMap')}</p>
              </div>
              
              {/* Statistics Counter */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-amber-900/30 rounded-lg px-4 py-3 border border-amber-600/40">
                  <div className="text-xs text-amber-300 uppercase tracking-wide">{t('travel.completedExpeditions')}</div>
                  <div className="text-2xl font-bold text-amber-400">{totalVisited} / 195</div>
                  <div className="text-xs text-gray-400">{t('travel.countriesVisited')}</div>
                </div>
                <div className="bg-blue-900/30 rounded-lg px-4 py-3 border border-blue-600/40">
                  <div className="text-xs text-blue-300 uppercase tracking-wide">{t('travel.futureMissions')}</div>
                  <div className="text-2xl font-bold text-blue-400">{totalPlanned}</div>
                  <div className="text-xs text-gray-400">{t('travel.countriesPlanned')}</div>
                </div>
              </div>
            </div>
            
            {/* Map Visualization */}
            {totalVisited === 0 && totalPlanned === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-slate-800/30 to-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
                <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">{t('travel.worldMapAwaits')}</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {t('travel.startPlanningTrips')}
                </p>
                <button
                  onClick={() => setShowAddTrip(true)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('travel.planYourFirstExpedition')}
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
                  
                  {/* The Map - FIX: Prevent scroll-to-top on mobile */}
                  <div 
                    onTouchStart={(e) => { e.stopPropagation(); }}
                    onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    style={{ touchAction: 'none', userSelect: 'none' }}
                  >
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
                      background: 'linear-gradient(to bottom, #1e3a5f, #0f1f3d)',
                      touchAction: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <ZoomableGroup zoom={1} minZoom={1} maxZoom={3}>
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
                                onMouseEnter={() => {
                                  setHoveredCountry({
                                    name: geo.properties.name,
                                    isVisited,
                                    isPlanned
                                  });
                                }}
                                onMouseLeave={() => {
                                  setHoveredCountry(null);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onTouchStart={(e) => {
                                  e.stopPropagation();
                                }}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                style={{
                                  default: { 
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    touchAction: 'none'
                                  },
                                  hover: { 
                                    fill: isVisited ? "#FCD34D" : isPlanned ? "#7DD3FC" : "#3d4552",
                                    stroke: isVisited ? "#F59E0B" : isPlanned ? "#0EA5E9" : "#5a6678",
                                    strokeWidth: 1,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    touchAction: 'none'
                                  },
                                  pressed: { outline: 'none', touchAction: 'none' }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                  </div>
                  
                  {/* 🌍 Country Tooltip - Appears on Hover */}
                  {hoveredCountry && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
                      <div className="bg-gradient-to-r from-slate-900 to-gray-900 px-6 py-3 rounded-xl border-2 shadow-2xl animate-fadeIn"
                        style={{
                          borderColor: hoveredCountry.isVisited ? '#F59E0B' : hoveredCountry.isPlanned ? '#0EA5E9' : '#6B7280'
                        }}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {hoveredCountry.name}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm">
                            {hoveredCountry.isVisited && (
                              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 font-semibold">
                                ? Completed Expedition
                              </span>
                            )}
                            {hoveredCountry.isPlanned && (
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/40 font-semibold">
                                🔵 Future Mission
                              </span>
                            )}
                            {!hoveredCountry.isVisited && !hoveredCountry.isPlanned && (
                              <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full border border-gray-600/40">
                                🌍 Unexplored
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                              <div className="text-amber-400 font-semibold text-sm">{capitalizeCountryName(country)}</div>
                              <div className="text-xs text-gray-400">{trips.length} trip{trips.length > 1 ? 's' : ''}</div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-amber-500/50 whitespace-nowrap">
                                  {trips.map((trip, idx) => (
                                    <div key={idx} className="py-1">
                                      <div className="font-semibold text-amber-300">{trip.name}</div>
                                      <div className="text-gray-400">Status: Completed ?��</div>
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
                              <div className="text-blue-400 font-semibold text-sm">{capitalizeCountryName(country)}</div>
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
                  
                  {/* 🌍 EDITABLE TRAVEL WISHLIST */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        My Travel Wishlist
                      </h3>
                      <button
                        onClick={() => setShowAddWishlistCountry(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {t('dashboard.addTransaction')}
                      </button>
                    </div>
                    
                    {/* Wishlist Countries Grid */}
                    {data.travel?.wishlistCountries && data.travel.wishlistCountries.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {data.travel.wishlistCountries.map((country, idx) => (
                          <div 
                            key={idx}
                            className="group relative bg-purple-900/20 hover:bg-purple-900/40 border border-purple-600/40 rounded-lg p-3 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-purple-400 font-semibold text-sm flex-1">{country}</div>
                              <button
                                onClick={() => handleRemoveWishlistCountry(country)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                                title="Remove from wishlist"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">Wishlist</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-purple-900/10 rounded-lg border border-purple-600/20">
                        <svg className="w-12 h-12 text-purple-400/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-purple-400 font-medium mb-1">Your wishlist is empty</p>
                        <p className="text-gray-400 text-sm">{t('dashboard.addTransaction')} countries you dream of visiting!</p>
                        <button
                          onClick={() => setShowAddWishlistCountry(true)}
                          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {t('travel.addYourFirstCountry')}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/20 to-blue-900/20 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-300 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <strong className="text-white">Pro Tip:</strong> Use the wishlist for quick dreaming, then create full trips when you're ready to plan! 🌍
                    </div>
                  </div>
                </div>
                </details>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Trip Planning Header with Runway Calculator Toggle */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              🗺️ Trip Planning & Budgets
            </h2>
            <p className="text-gray-400">Manage your travel budgets and track expenses by trip</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRunwayCalculator(!showRunwayCalculator)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {showRunwayCalculator ? 'Hide' : 'Show'} Travel Runway
            </button>
            <button
              onClick={() => setShowAddTrip(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Plan New Trip
            </button>
          </div>
        </div>
        
        {/* 🌍 TRAVEL RUNWAY CALCULATOR - Collapsible Section */}
        {showRunwayCalculator && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="relative">
              <button
                onClick={() => setShowRunwayModal(true)}
                className="absolute top-0 right-0 p-2 bg-slate-700/20 hover:bg-slate-600/30 rounded-lg transition-colors border border-slate-500/30"
                title="Edit Travel Runway Settings"
              >
                <Edit className="w-4 h-4 text-slate-300" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">🌍 Travel Runway Calculator</h3>
                </div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="text-slate-300">Smart destination-based travel planning with cost tiers</p>
                  {/* 💡 Help Tooltip - Left side on mobile */}
                  <div className="group relative">
                    <button className="text-slate-400 hover:text-amber-400 transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 bg-gray-900 text-white text-sm rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl border border-amber-500/30 z-50">
                      <div className="font-bold text-amber-400 mb-2">How It Works:</div>
                      <div className="space-y-2 text-xs text-gray-300">
                        <p><strong>1. Set Your Travel Savings:</strong> Enter your total travel fund (top right edit button)</p>
                        <p><strong>2. Plan Your Days:</strong> Allocate days to different cost tiers:
                          <br />?�� 🟢 Cheap ($30/day): SE Asia, India, Eastern Europe
                          <br />?�� 🟡 Moderate ($100/day): South America, Southern Europe
                          <br />?�� 🔴 Expensive ($200/day): Western Europe, Japan, Scandinavia
                        </p>
                        <p><strong>3. See Your Runway:</strong> Calculator shows total possible travel days and cost breakdown!</p>
                        <p className="text-amber-300 font-semibold mt-2">💡 Pro Tip: Mix cheap and expensive destinations to maximize your travel time!</p>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-8 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">🎯 Your Travel Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-lg p-3 border border-emerald-500/40">
                      <div className="text-emerald-300 font-semibold">🟢 Cheap Destinations</div>
                      <div className="text-white text-lg">{runway.tripPlan.cheap} days</div>
                      <div className="text-emerald-300">${runway.costTiers.cheap}/day</div>
                      <div className="text-emerald-200">Total: ${(parseFloat(runway.plannedCosts.cheap) || 0).toLocaleString()}</div>
                      <div className="text-xs text-emerald-300 mt-1">Southeast Asia, Eastern Europe, India</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-lg p-3 border border-amber-500/40">
                      <div className="text-amber-300 font-semibold">🟡 Moderate Destinations</div>
                      <div className="text-white text-lg">{runway.tripPlan.moderate} days</div>
                      <div className="text-amber-300">${runway.costTiers.moderate}/day</div>
                      <div className="text-amber-200">Total: ${(parseFloat(runway.plannedCosts.moderate) || 0).toLocaleString()}</div>
                      <div className="text-xs text-amber-300 mt-1">South America, Southern Europe</div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-600/20 to-pink-600/20 rounded-lg p-3 border border-rose-500/40">
                      <div className="text-rose-300 font-semibold">🔴 Expensive Destinations</div>
                      <div className="text-white text-lg">{runway.tripPlan.expensive} days</div>
                      <div className="text-rose-300">${runway.costTiers.expensive}/day</div>
                      <div className="text-rose-200">Total: ${(parseFloat(runway.plannedCosts.expensive) || 0).toLocaleString()}</div>
                      <div className="text-xs text-rose-300 mt-1">Western Europe, Scandinavia, Japan</div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-3 border border-slate-500/40">
                    <div className="text-slate-300">Total Travel Funds</div>
                    <div className="text-xl font-bold text-white">${(parseFloat(runway.totalFunds) || 0).toLocaleString()} {data.travel?.homeCurrency || 'CAD'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-3 border border-slate-500/40">
                    <div className="text-slate-300">Planned Trip Cost</div>
                    <div className="text-xl font-bold text-white">${(parseFloat(runway.totalPlannedCost) || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{runway.totalPlannedDays} days planned</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-lg p-3 border border-emerald-500/30">
                    <div className="text-emerald-200">Remaining Funds</div>
                    <div className="text-xl font-bold text-emerald-400">${(parseFloat(runway.remainingFunds) || 0).toLocaleString()}</div>
                    <div className="text-xs text-emerald-300">+{runway.extensionDays} days possible</div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 text-center">
                  💡 Extend your journey by choosing cheaper destinations with remaining funds
                </div>
              </div>
            </div>
          </div>
        )}
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
                  {t('travel.planYourFirstTrip')}
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
                    {t('dashboard.addTransaction')}
                  </button>
                  {/* 💫 NEW: Add Moment Button */}
                  <button
                    onClick={() => {
                      setMomentTrip(trip);
                      setShowMomentModal(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    style={{ backgroundColor: '#F59E0B' }}
                    title="Add Travel Moment"
                  >
                    💫 Moment
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
                    <span>${(parseFloat(trip.currentSavings) || 0).toLocaleString()}</span>
                    <span>${(parseFloat(trip.targetBudget) || 0).toLocaleString()}</span>
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
                      ${(parseFloat(remainingBudget) || 0).toLocaleString()}
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

                {/* 💫 NEW: Quick Moments */}
                {trip.moments && trip.moments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                      💫 Travel Moments ({trip.moments.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {trip.moments.slice(0, 2).map(moment => (
                        <div key={moment.id} className="bg-amber-900/20 rounded-lg p-3 border border-amber-600/30 group">
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-xs text-amber-200">
                              {new Date(moment.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <button
                              onClick={() => handleDeleteTripMoment(trip.id, moment.id)}
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete moment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-amber-100 text-xs leading-relaxed">
                            {moment.story.length > 100 ? moment.story.substring(0, 100) + '...' : moment.story}
                          </p>
                        </div>
                      ))}
                      {trip.moments.length > 2 && (
                        <div className="text-xs text-amber-400 text-center">
                          +{trip.moments.length - 2} more moments
                        </div>
                      )}
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
        <FixedModal
          isOpen={showAddTrip}
          onClose={() => setShowAddTrip(false)}
          title="Plan New Trip"
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                    value={newTrip.targetBudget === 0 ? '0' : (newTrip.targetBudget || '')}
                    onChange={(e) => setNewTrip({...newTrip, targetBudget: e.target.value})}
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
                    className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                    className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Daily Budget (CAD)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newTrip.estimatedDailySpend === 0 ? '0' : (newTrip.estimatedDailySpend || '')}
                    onChange={(e) => setNewTrip({...newTrip, estimatedDailySpend: e.target.value})}
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
                onClick={() => setShowAddTrip(false)}
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
        </FixedModal>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && selectedTrip && (
        <FixedModal
          isOpen={showExpenseModal}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedTrip(null);
          }}
          title={`Add Expense - ${selectedTrip.name}`}
          size="md"
        >
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
                    value={newExpense.amount === 0 ? '0' : (newExpense.amount || '')}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
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
                    className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </div>

              {newExpense.currency !== 'CAD' && newExpense.amount && (
                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600/30">
                  <div className="text-sm text-blue-200">
                    💱 <strong>Currency Conversion:</strong> {newExpense.amount} {newExpense.currency} ?�� 
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
                 {t('dashboard.addTransaction')}
               </button>
             </div>
        </FixedModal>
      )}

       {/* 💫 NEW: Add Moment Modal */}
       {showMomentModal && momentTrip && (
         <FixedModal
           isOpen={showMomentModal}
           onClose={() => {
             setShowMomentModal(false);
             setMomentText('');
             setMomentTrip(null);
           }}
           title={`💫 Capture a Moment - ${momentTrip.name}`}
           size="md"
         >
           <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="text-xl font-bold" style={{ color: '#F59E0B' }}>💫 Add Travel Moment</h3>
                 <p className="text-sm text-gray-400">{momentTrip.name}</p>
               </div>
               <button
                 onClick={() => {
                   setShowMomentModal(false);
                   setMomentTrip(null);
                   setMomentText('');
                 }}
                 className="text-gray-400 hover:text-white"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="space-y-4">
               {/* Inspiring Message */}
               <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-lg p-4 border border-amber-500/30">
                 <p className="text-amber-200 text-sm italic text-center">
                   💰✈️ "You didn't work for money. You worked for moments like this."
                 </p>
               </div>

               <div>
                 <label className="block text-sm text-gray-300 mb-2">
                   Your Story <span className="text-red-400">*</span>
                 </label>
                 <textarea
                   placeholder="What made this moment special? Capture the feeling, the scene, the memory..."
                   value={momentText}
                   onChange={(e) => setMomentText(e.target.value)}
                   className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[150px] resize-none"
                   rows="6"
                   autoFocus
                 />
                 <p className="text-xs text-gray-500 mt-2">
                   💡 Pro tip: Write about the emotions, the people, the unexpected surprises. These stories are your treasure!
                 </p>
               </div>
             </div>
             
             <div className="mt-6 flex justify-end gap-3">
               <button
                 onClick={() => {
                   setShowMomentModal(false);
                   setMomentTrip(null);
                   setMomentText('');
                 }}
                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleAddMomentToTrip}
                 disabled={!momentText.trim()}
                 className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 transform hover:scale-105"
                 style={momentText.trim() ? { backgroundColor: '#F59E0B' } : {}}
               >
                 <Plus className="w-4 h-4" />
                 Save Moment
               </button>
             </div>
           </div>
         </FixedModal>
       )}

       {/* Edit Trip Modal */}
       {editingTrip && (
         <FixedModal
           isOpen={!!editingTrip}
           onClose={() => setEditingTrip(null)}
           title="Edit Trip"
           size="lg"
         >
           <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                     value={editingTrip.targetBudget === 0 ? '0' : (editingTrip.targetBudget || '')}
                     onChange={(e) => setEditingTrip({...editingTrip, targetBudget: e.target.value})}
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
                     className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                     style={{ maxWidth: '100%' }}
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">End Date</label>
                   <input
                     type="date"
                     value={editingTrip.endDate}
                     onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})}
                     className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-400 focus:outline-none text-base"
                     style={{ maxWidth: '100%' }}
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Daily Budget (CAD)</label>
                   <input
                     type="number"
                     placeholder="500"
                     value={editingTrip.estimatedDailySpend === 0 ? '0' : (editingTrip.estimatedDailySpend || '')}
                     onChange={(e) => setEditingTrip({...editingTrip, estimatedDailySpend: e.target.value})}
                     className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                   />
                 </div>
               </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Current Savings (CAD)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editingTrip.currentSavings === 0 ? '0' : (editingTrip.currentSavings || '')}
                  onChange={(e) => setEditingTrip({...editingTrip, currentSavings: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* 🗺️ Countries Selector - For World Map */}
              <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-600/30">
                <label className="block text-sm font-semibold text-amber-200 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Countries (Edit Your Map!)
                </label>
                <input
                  type="text"
                  placeholder="Type country name and press comma or Enter"
                  value={editingTrip.countryInput || ''}
                  onChange={(e) => {
                    setEditingTrip({...editingTrip, countryInput: e.target.value});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ',' || e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = (editingTrip.countryInput || '').trim();
                      const currentCountries = editingTrip.countries || [];
                      if (trimmed && !currentCountries.includes(trimmed)) {
                        setEditingTrip({
                          ...editingTrip,
                          countries: [...currentCountries, trimmed],
                          countryInput: ''
                        });
                      } else {
                        setEditingTrip({...editingTrip, countryInput: ''});
                      }
                    }
                  }}
                  onBlur={() => {
                    // Also add on blur if there's text
                    const trimmed = (editingTrip.countryInput || '').trim();
                    const currentCountries = editingTrip.countries || [];
                    if (trimmed && !currentCountries.includes(trimmed)) {
                      setEditingTrip({
                        ...editingTrip,
                        countries: [...currentCountries, trimmed],
                        countryInput: ''
                      });
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-amber-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 Type a country name, then press <span className="font-semibold text-amber-300">comma</span> or <span className="font-semibold text-amber-300">Enter</span> to add it!
                </p>
                {Array.isArray(editingTrip.countries) && editingTrip.countries.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingTrip.countries.map((country, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-amber-600/30 text-amber-200 text-sm rounded-full border border-amber-500/50 flex items-center gap-2">
                        🌍 {country}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedCountries = editingTrip.countries.filter((_, i) => i !== idx);
                            setEditingTrip({...editingTrip, countries: updatedCountries});
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
                 onClick={() => setEditingTrip(null)}
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
         </FixedModal>
       )}

      {/* Add Wishlist Country Modal */}
      {showAddWishlistCountry && (
        <FixedModal
          isOpen={showAddWishlistCountry}
          onClose={() => {
            setShowAddWishlistCountry(false);
            setWishlistCountryInput('');
          }}
          title="⭐ Add Country to Wishlist"
          size="md"
        >
          <div className="space-y-4">
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
                <p className="text-sm text-purple-200 mb-2">
                  ?�� <strong>Quick Wishlist</strong> - {t('dashboard.addTransaction')} countries you dream of visiting!
                </p>
                <p className="text-xs text-gray-400">
                  No need to create a full trip. Just type the country name and we'll add it to your wishlist.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Country Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thailand, Japan, Italy"
                  value={wishlistCountryInput}
                  onChange={(e) => setWishlistCountryInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWishlistCountry();
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 First letter will be automatically capitalized
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddWishlistCountry(false);
                  setWishlistCountryInput('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWishlistCountry}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('dashboard.addTransaction')}
              </button>
             </div>
        </FixedModal>
      )}

             {/* Travel Runway Settings Modal */}
      {showRunwayModal && (
        <FixedModal
          isOpen={showRunwayModal}
          onClose={() => setShowRunwayModal(false)}
          title="Travel Runway Settings"
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                     value={runwaySettings.totalSavings === 0 ? '0' : (runwaySettings.totalSavings || '')}
                     onChange={(e) => setRunwaySettings({
                       ...runwaySettings, 
                       totalSavings: e.target.value
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
                       value={runwaySettings.tripPlan.cheap === 0 ? '0' : (runwaySettings.tripPlan.cheap || '')}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           cheap: e.target.value
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
                       value={runwaySettings.tripPlan.moderate === 0 ? '0' : (runwaySettings.tripPlan.moderate || '')}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           moderate: e.target.value
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
                       value={runwaySettings.tripPlan.expensive === 0 ? '0' : (runwaySettings.tripPlan.expensive || '')}
                       onChange={(e) => setRunwaySettings({
                         ...runwaySettings,
                         tripPlan: {
                           ...runwaySettings.tripPlan,
                           expensive: e.target.value
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
           </div>
        </FixedModal>
       )}
     </div>
   );
 };

function App() {
  // Loading state for initial app load
  const [isLoading, setIsLoading] = useState(true);
  
  // i18n translation hook
  const { t } = useTranslation();

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
  
  // Smart Signup Flow states
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [existingUserWithPayment, setExistingUserWithPayment] = useState(null);
  const [userPlan, setUserPlan] = useState(SUBSCRIPTION_TIERS.FREE); // Subscription plan state
  
  // 🎖️ RANK-UP MODAL STATE (moved to top for scope access)
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [rankUpData, setRankUpData] = useState(null);
  
  // 🛠️ SECURE DEVELOPER PANEL (only for admins)
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devOverridePlan, setDevOverridePlan] = useState(null);
  const [devDemoMode, setDevDemoMode] = useState(false); // 🎭 Demo mode - hides real name
  
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showHelpFAQ, setShowHelpFAQ] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [forceShowQuickStart, setForceShowQuickStart] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptData, setUpgradePromptData] = useState({ featureName: '', requiredPlan: '' });
  const [landingRedirect, setLandingRedirect] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  
  // 📊 FEEDBACK SYSTEM - Bug Reports & Feature Requests
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug'); // 'bug' or 'feature'
  const [feedbackData, setFeedbackData] = useState({
    type: 'bug',
    message: '',
    email: '',
    page: ''
  });
  // Removed unused loading state - using authLoading instead
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('monthly'); // monthly or annual
  const [showHistory, setShowHistory] = useState(false);
  
  // 🖱️ Desktop Tab Scroll
  const tabContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  
  // 🔒 SECURE ADMIN CHECK - Only specific emails can use dev panel
  const ADMIN_EMAILS = [
    'janara.nguon@gmail.com',
    // Add more admin emails here as needed
  ];
  
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);
  
  // 🔐 URL Parameter Dev Mode (Admin Only)
  React.useEffect(() => {
    if (isAdmin) {
      const urlParams = new URLSearchParams(window.location.search);
      const devMode = urlParams.get('dev');
      if (devMode === 'true') {
        setShowDevPanel(true);
        // Clean up URL without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isAdmin]);
  
  // Get current plan (with dev override if admin)
  const currentUserPlan = (isAdmin && devOverridePlan) ? devOverridePlan : userPlan;
  
  // Modal states for dashboard cards
  const [editingCard, setEditingCard] = useState(null);
  const [tempCardData, setTempCardData] = useState({});
  
  // 📅 HELPER: Get today's date in local timezone (not UTC)
  const getTodayLocal = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // 🎮 XP Refresh Trigger - increment this to force MissionStatusBanner to reload
  const [xpRefreshTrigger, setXpRefreshTrigger] = useState(0);

  // 🎯 First Climb Protocol states
  const [showFirstClimbProtocol, setShowFirstClimbProtocol] = useState(false);
  const [missions, setMissions] = useState({
    mission1: { completed: false, progress: 0, target: 10 },
    mission2: { completed: false, progress: 0, target: 3 },
    mission3: { completed: false, progress: 0, target: 1 },
    mission4: { completed: false, progress: 0, target: 1 }
  });

  // Reset data states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStartDate, setResetStartDate] = useState(getTodayLocal());
  const [resetType, setResetType] = useState('financial-only'); // 'financial-only', 'whole-app', or 'sample-financial'
  
  // Quick expense logging states
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [quickExpense, setQuickExpense] = useState({
    description: '',
    amount: '',
    date: getTodayInUserTimezone()
  });
  
  // 🔒 STEALTH MODE - Privacy Protection Feature (Free for everyone!)
  const [stealthMode, setStealthMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('stealthMode');
    return saved === 'enabled';
  });
  
  // Toggle stealth mode and persist to localStorage
  const toggleStealthMode = () => {
    setStealthMode(prev => {
      const newValue = !prev;
      localStorage.setItem('stealthMode', newValue ? 'enabled' : 'disabled');
      return newValue;
    });
  };

  // 📝 QUICK JOURNAL SYSTEM
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [quickJournalNote, setQuickJournalNote] = useState('');

  // 🧳 OFFLINE SUPPORT FOR TRAVELERS
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [offlineSummary, setOfflineSummary] = useState(getOfflineSummary());
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  // 🛡️ DATA SAFETY - Protecting user data like it's sacred
  const [showDataRecoveryModal, setShowDataRecoveryModal] = useState(false);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [userBackups, setUserBackups] = useState([]);
  const [dataSafetySummary, setDataSafetySummary] = useState(null);

  // 📓 FREEDOM JOURNAL SYSTEM
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedTripForJournal, setSelectedTripForJournal] = useState(null);
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [completedTrip, setCompletedTrip] = useState(null);

  // 💫 MOMENTS SYSTEM (state moved up earlier for Side Hustle integration)
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [editingMoment, setEditingMoment] = useState(null);
  const [newMoment, setNewMoment] = useState(() => {
    const today = new Date();
    return {
      title: '',
      story: '',
      location: '',
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      isAchievement: false,
      category: 'personal',
      linkedTransaction: null
    };
  });

  // 🎯 PRICING PHASE STATE
  const [foundersCircleCount, setFoundersCircleCount] = useState(0);
  const [earlyAdopterCount, setEarlyAdopterCount] = useState(0);

  // Stealth removed (fresh start)

  // User feedback system
  // const [isLoading, setIsLoading] = useState(false); // Removed - using authLoading instead
  const [notification, setNotification] = useState(null);
  
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 📊 GOOGLE ANALYTICS - Track Events
  const trackEvent = useCallback((eventName, eventParams = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
      debugLog('📊 Analytics Event:', eventName, eventParams);
    }
  }, []);

  // 💫 MOMENTS HANDLERS - Creating memories from financial milestones
  const handleEditMoment = (moment) => {
    if (moment) {
      // Edit existing moment
      setEditingMoment(moment);
      setNewMoment({
        title: moment.title || '',
        story: moment.story || '',
        location: moment.location || '',
        date: moment.timestamp ? new Date(moment.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isAchievement: moment.isAchievement || false,
        category: moment.category || 'personal',
        linkedTransaction: moment.linkedTransaction || null
      });
    } else {
      // Create new moment
      setEditingMoment(null);
      setNewMoment({
        title: '',
        story: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        isAchievement: false,
        category: 'personal',
        linkedTransaction: null
      });
    }
    setShowMomentModal(true);
  };

  const handleShareMoment = (moment) => {
    // Create shareable text
    const shareText = `${moment.title}\n\n${moment.story}\n\n📍 ${moment.location || 'My Journey'}\n📅 ${new Date(moment.timestamp).toLocaleDateString()}\n\n#FinancialFreedom #TheCompass`;
    
    if (navigator.share) {
      navigator.share({
        title: moment.title,
        text: shareText
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        showNotification('📋 Moment copied to clipboard!', 'success');
      });
    }
  };

  const handleSaveMoment = async () => {
    if (!newMoment.title.trim() || !newMoment.story.trim()) {
      showNotification('Please add a title and story', 'error');
      return;
    }

    // 🛡️ SAFETY CHECK: Prevent data loss!
    if (editingMoment && (!data.moments || data.moments.length === 0)) {
      showNotification('⚠️ Data error detected. Please refresh and try again.', 'error');
      console.error('🚨 CRITICAL: Attempting to edit when moments array is empty!');
      return;
    }

    const moment = {
      id: editingMoment ? editingMoment.id : Date.now(),
      ...newMoment,
      timestamp: new Date(newMoment.date).toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedMoments;
    if (editingMoment) {
      // Update existing moment
      updatedMoments = (data.moments || []).map(m => m.id === editingMoment.id ? moment : m);
      
      // 🛡️ SAFETY: Verify moment was actually updated
      const updated = updatedMoments.find(m => m.id === editingMoment.id);
      if (!updated) {
        showNotification('⚠️ Update failed. Moment not found.', 'error');
        console.error('🚨 CRITICAL: Moment to update not found!');
        return;
      }

      // 🛡️ SAFETY: Never save if this would delete all moments
      if (updatedMoments.length === 0) {
        showNotification('⚠️ Cannot save - this would delete all moments!', 'error');
        console.error('🚨 CRITICAL: Save blocked - would delete all moments!');
        return;
      }
    } else {
      // Add new moment
      updatedMoments = [moment, ...(data.moments || [])];
    }

    // 🛡️ Deep clone to prevent reference issues
    const updatedData = JSON.parse(JSON.stringify({
      ...data,
      moments: updatedMoments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }));

    try {
      // 🛡️ CREATE BACKUP BEFORE SAVE!
      if (data.moments && data.moments.length > 0) {
        await createBackup(userId, data, 'before-moment-save');
      }

      // 🛡️ USE updateDoc to prevent data loss
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        moments: updatedData.moments
      });
      setData(updatedData);
      setShowMomentModal(false);
      setEditingMoment(null);
      setNewMoment({
        title: '',
        story: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        isAchievement: false,
        category: 'personal',
        linkedTransaction: null
      });
      showNotification(editingMoment ? '✨ Moment updated!' : '💫 Moment created!', 'success');
      
      // Award XP for creating moment
      if (!editingMoment) {
        try {
          const result = await awardXp(db, userId, 10);
          setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
          if (result?.rankUp && result.newRank) {
            const prev = getRankFromXp((result.totalXp || 0) - 10);
            setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 10, action: 'moment created' });
            setShowRankUpModal(true);
          }
        } catch (e) {
          console.warn('XP award failed (moment)', e);
        }
      }
    } catch (error) {
      console.error('Error saving moment:', error);
      showNotification('Failed to save moment', 'error');
    }
  };

  const handleDeleteMoment = async (momentId) => {
    if (!window.confirm(t('confirmations.deleteMomentWithXP'))) return;

    const updatedMoments = (data.moments || []).filter(m => m.id !== momentId);
     try {
       // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
       await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
         moments: updatedMoments
       });
       
       setData({ ...data, moments: updatedMoments });
      
      // 🛡️ ANTI-EXPLOIT: Deduct XP for deleting moment
      try {
        const result = await deductXp(db, userId, 10);
        setXpRefreshTrigger(prev => prev + 1);
        if (result.rankDown) {
          showNotification(`🗑️ Moment deleted. -10 XP. Rank: ${result.newRank.name}`, 'warning');
        } else {
          showNotification('🗑️ Moment deleted. -10 XP', 'warning');
        }
      } catch (error) {
        console.warn('XP deduction failed (moment delete)', error);
        showNotification('🗑️ Moment deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting moment:', error);
      showNotification('Failed to delete moment', 'error');
    }
  };

  // 📧 FEEDBACK SUBMISSION HANDLER
  const handleSubmitFeedback = async () => {
    if (!feedbackData.message.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }

    try {
      const feedbackDoc = {
        type: feedbackData.type,
        message: feedbackData.message,
        email: feedbackData.email || user?.email || 'anonymous',
        userPlan: currentUserPlan,
        page: activeTab,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // Save to Firebase
      await setDoc(doc(db, 'feedback', `${Date.now()}_${user?.uid || 'anonymous'}`), feedbackDoc);
      
      // Track in Analytics
      trackEvent('feedback_submitted', {
        feedback_type: feedbackData.type,
        from_page: activeTab
      });

      showNotification(
        feedbackData.type === 'bug' 
          ? '🐛 Bug report submitted! Thank you!' 
          : '💡 Feature request submitted! Thank you!',
        'success'
      );

      // Reset form
      setFeedbackData({
        type: 'bug',
        message: '',
        email: '',
        page: ''
      });
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification('Failed to submit feedback. Please try again.', 'error');
    }
  };

  // 📓 FREEDOM JOURNAL HANDLERS
  const handleSaveJournalEntry = async (entry) => {
    if (!selectedTripForJournal) return;

    const updatedTrips = (data.travel?.trips || []).map(trip => {
      if (trip.id === selectedTripForJournal.id) {
        return {
          ...trip,
          journalEntries: [...(trip.journalEntries || []), entry]
        };
      }
      return trip;
    });

    const updatedTravel = { ...data.travel, trips: updatedTrips };

    try {
      // 🛡️ USE updateDoc to prevent data loss
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        travel: updatedTravel
      });
      setData({ ...data, travel: updatedTravel });
      showNotification('Journal entry saved! 📓', 'success');
      
      // Award XP for journaling
      if (userId) {
        const xpResult = await awardXp(db, userId, 10); // 10 XP for journal entry
        if (xpResult.rankUp) {
          setRankUpData(xpResult);
          setShowRankUpModal(true);
        }
      }
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error saving journal entry:', error);
      showNotification('Error saving journal entry', 'error');
    }
  };

  const handleOpenJournal = (trip) => {
    setSelectedTripForJournal(trip);
    setShowJournalModal(true);
  };

  const handleCloseJournal = () => {
    setShowJournalModal(false);
    setSelectedTripForJournal(null);
  };

  // 🎯 MISSION COMPLETE AUTOMATION
  const checkForCompletedTrips = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const trips = data?.travel?.trips || [];
    const completedTrips = trips.filter(trip => {
      if (!trip.endDate) return false;
      const endDate = new Date(trip.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate <= today && trip.status !== 'completed';
    });

    if (completedTrips.length > 0) {
      // Show mission complete modal for the first completed trip
      setCompletedTrip(completedTrips[0]);
      setShowMissionCompleteModal(true);
      
      // Mark trip as completed
      const updatedTrips = trips.map(trip => {
        if (trip.id === completedTrips[0].id) {
          return { ...trip, status: 'completed' };
        }
        return trip;
      });
      
      const updatedTravel = { ...data.travel, trips: updatedTrips };
      const updatedData = { ...data, travel: updatedTravel };
      setData(updatedData);
      
      // Save to Firebase
      setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
    }
  };

  // 📄 PDF EXPORT HANDLER
  const handleExportPDF = async () => {
    if (currentUserPlan !== SUBSCRIPTION_TIERS.OPERATOR && currentUserPlan !== SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE) {
      setUpgradePromptData({
        featureName: 'Export Field Notes as PDF',
        requiredPlan: 'Operator'
      });
      setShowUpgradePrompt(true);
      return;
    }

    // TODO: Implement PDF generation
    showNotification('PDF export feature coming soon! 📄', 'success');
  };

  // Feature gating and upgrade functions
  const checkFeatureAccess = useCallback((feature) => {
    return hasFeatureAccess(userPlan, feature);
  }, [userPlan]);

  const showUpgradePromptForFeature = useCallback((featureName, feature) => {
    const requiredPlan = getRequiredTier(feature);
    setUpgradePromptData({ featureName, requiredPlan });
    setShowUpgradePrompt(true);
  }, []);

  const handleUpgrade = useCallback(async (planId, billingCycle = 'monthly', priceId = null) => {
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
      console.log(`🛒 Initiating upgrade to ${planId} with ${billingCycle} billing${priceId ? ` (Price ID: ${priceId})` : ''}`);
      
      // Import Stripe utilities dynamically
      const { createCheckoutSession } = await import('./utils/stripeUtils');
      
      // Show loading notification
      showNotification('Redirecting to secure checkout...', 'info');
      
      // Create Stripe checkout session and redirect
      await createCheckoutSession(planId, billingCycle, user, priceId);
      
      // Note: User will be redirected to Stripe, so code after this may not execute
      // Subscription update happens via webhook after successful payment
      
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('❌ Upgrade error:', error);
      showNotification(
        error.message || 'Failed to process upgrade. Please try again.',
        'error'
      );
    }
  }, [user, showNotification]);

  // 🖱️ Desktop Tab Scroll Functions
  const scrollTabs = (direction) => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (tabContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Update scroll arrows on mount and resize
  React.useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

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
      
      // 📊 Track locked feature access attempt
      trackEvent('locked_feature_clicked', {
        feature_name: featureNames[requiredFeature] || tab,
        tab: tab,
        user_plan: currentUserPlan
      });
      
      showUpgradePromptForFeature(featureNames[requiredFeature] || tab, requiredFeature);
      return;
    }
    
    // 📊 Track page view
    trackEvent('page_view', {
      page_title: tab,
      user_plan: currentUserPlan
    });
    
    setActiveTab(tab);
  }, [checkFeatureAccess, showUpgradePromptForFeature, trackEvent, currentUserPlan]);

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
      const updatedTransactions = [...newTransactions, ...(userData.transactions || [])];
      
      try {
        const docRef = doc(db, `users/${currentUserId}/financials`, 'data');
        // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
        await updateDoc(docRef, {
          transactions: updatedTransactions,
          recurringExpenses: updatedRecurringExpenses
        });
        setData({
          ...userData,
          transactions: updatedTransactions,
          recurringExpenses: updatedRecurringExpenses
        });
        
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

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };

    // 🔐 PRODUCTION Authentication Effect
  useEffect(() => {
    if (!auth) {
      console.error('❌ Firebase auth not initialized');
      setAuthLoading(false);
      setShowAuth(true);
      return;
    }

    debugLog('🔐 Setting up authentication listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      debugLog('🔐 Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setAuthLoading(true);
      setIsLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
        setShowAuth(false);
        try {
          await ensureUserProfileInitialized(db, firebaseUser.uid);
        } catch (e) {
          console.error('Profile init failed', e);
        }
        
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
            // 🆕 NEW USER - Show Quick Start Guide!
            // Check if they haven't dismissed it before
            const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
            
            // Check if user came from landing page with upgrade intent
            const urlParams = new URLSearchParams(window.location.search);
            const upgradePlan = urlParams.get('upgrade');
            
            if (hasSeenQuickStart !== 'true' && !upgradePlan) {
              // Only show Quick Start if no upgrade intent
              setShowQuickStart(true);
            }
            
            // New user - initialize with sample data
            console.log('New user detected, initializing with sample data');
            const newUserData = { ...initialData };
            await setDoc(docRef, newUserData);
            setData(newUserData);
            showNotification(t('notifications.welcomeDashboardReady'), 'success');
          }
        } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
            debugLog('📋 No user document, using free tier');
            setUserPlan(SUBSCRIPTION_TIERS.FREE);
          }
        } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
          console.error('Error loading subscription:', error);
          setUserPlan(SUBSCRIPTION_TIERS.FREE);
        }
      } else {
        // User is signed out - show authentication screen
        debugLog('No user found, showing auth screen...');
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
      setIsLoading(false);
      // setLoading(false); // Removed - using authLoading instead
    });

    return () => unsubscribe();
  }, [processRecurringExpenses, showNotification]);
  
  // 🛡️ DAILY AUTO-BACKUP - Creates automatic backup every 24 hours
  useEffect(() => {
    if (!userId || !data) return;

    const checkAndCreateDailyBackup = async () => {
      const lastBackupKey = `lastAutoBackup_${userId}`;
      const lastBackup = localStorage.getItem(lastBackupKey);
      const now = Date.now();
      
      // Check if 24 hours have passed since last backup (or no backup exists)
      if (!lastBackup || (now - parseInt(lastBackup)) > 24 * 60 * 60 * 1000) {
        try {
          console.log('🛡️ Creating daily auto-backup...');
          await createBackup(userId, data, 'daily-auto');
          localStorage.setItem(lastBackupKey, now.toString());
          console.log('✅ Daily auto-backup created successfully');
        } catch (error) {
          console.error('❌ Daily auto-backup failed:', error);
        }
      }
    };

    checkAndCreateDailyBackup();
    
    // Check every hour (in case user keeps app open for long periods)
    const interval = setInterval(checkAndCreateDailyBackup, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, data]);
  
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
      // 🌊 FLOW LIKE WATER: Try signup first (handles Firebase Auth inconsistency)
      console.log('🌊 Creating new account for:', authForm.email);
      const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      await updateProfile(userCredential.user, { displayName: authForm.name });
      
      // 📧 TRIGGER EMAIL AUTOMATION FOR FREE USERS
      try {
        console.log('📧 Triggering welcome email for free user:', userCredential.user.uid);
        const emailResponse = await fetch('/api/test-send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userCredential.user.uid,
            trigger: 'free_user_signup',
            additionalData: {
              userName: authForm.name,
              userEmail: authForm.email
            }
          })
        });
        
        if (emailResponse.ok) {
          console.log('✅ Welcome email triggered successfully for free user');
        } else {
          console.error('❌ Failed to trigger welcome email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('❌ Error triggering welcome email:', emailError);
      }
      
      showNotification(`Welcome ${authForm.name?.split(' ')[0] || authForm.name}! Your account has been created.`, 'success');
      setAuthForm({ email: '', password: '', name: '' });
      
      // ✨ Show Quick Start popup for new users after 2-3 seconds
      setTimeout(() => {
        // Check if user has seen Quick Start before
        const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
        if (!hasSeenQuickStart) {
          console.log('✨ Showing Quick Start popup for new signup user');
          setShowQuickStart(true);
        }
      }, 2500); // 2.5 second delay
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        // 🌊 FLOW LIKE WATER: Email exists (webhook created user), show password setup
        console.log('🌊 Email already exists - webhook created user, showing set password option');
        setExistingUserWithPayment({
          email: authForm.email,
          name: authForm.name,
          userId: 'webhook-created', // We'll get the real ID after sign-in
          subscription: { status: 'active', tier: 'founders-circle' } // Assume Founder's Circle for Payment Links
        });
        setShowSetPassword(true);
        setAuthLoading(false);
        return;
      }
      
      // Handle other errors normally
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/weak-password') {
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
      showNotification(t('errors.pleaseEnterEmailPassword'), 'error');
      return;
    }

    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      showNotification(t('notifications.welcomeBack'), 'success');
      setAuthForm({ email: '', password: '', name: '' });
      
      // ✨ Show Quick Start popup for new users after 2-3 seconds
      setTimeout(() => {
        // Check if user has seen Quick Start before
        const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
        if (!hasSeenQuickStart) {
          console.log('✨ Showing Quick Start popup for new user');
          setShowQuickStart(true);
        }
      }, 2500); // 2.5 second delay
      
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
      showNotification(t('notifications.signedOutSuccessfully'), 'success');
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Signout error:', error);
      showNotification('Error signing out', 'error');
    }
  };

  // 🎯 SMART SIGNUP FLOW: Handle setting password for existing users with payments
  const handleSetPassword = async () => {
    if (!authForm.password) {
      showNotification('Please enter a password', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      // 🌊 FLOW LIKE WATER: Use our API to update the password
      console.log('🌊 Updating password for webhook-created user:', existingUserWithPayment.email);
      
      const response = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: existingUserWithPayment.email,
          newPassword: authForm.password,
          displayName: existingUserWithPayment.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      const result = await response.json();
      console.log('✅ Password updated successfully:', result);
      
      // Now sign in with the new password
      await signInWithEmailAndPassword(auth, existingUserWithPayment.email, authForm.password);
      
      showNotification(`Welcome ${existingUserWithPayment.name}! Your account is now set up.`, 'success');
      
      // ✨ Show Quick Start popup for new users after 2-3 seconds
      setTimeout(() => {
        // Check if user has seen Quick Start before
        const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
        if (!hasSeenQuickStart) {
          console.log('✨ Showing Quick Start popup for new webhook-created user');
          setShowQuickStart(true);
        }
      }, 2500); // 2.5 second delay
      
      // Reset states
      setShowSetPassword(false);
      setExistingUserWithPayment(null);
      setAuthForm({ email: '', password: '', name: '' });
      
    } catch (error) {
      console.error('Set password error:', error);
      let errorMessage = 'Failed to set password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Unable to access account. Please contact support.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Account not found. Please try signing up again.';
      }
      
      showNotification(errorMessage, 'error');
    }
    setAuthLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showNotification('Welcome! Signed in with Google.', 'success');
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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

  // 🔧 REMOVED: Aggressive scroll-to-top fix that was breaking UX
  // This was scrolling to top on EVERY input blur - breaking Side Hustle, Travel, etc.
  // Modern browsers (iOS 14+, Android 10+) handle mobile keyboards correctly
  // No manual intervention needed!
  
  // REMOVED CODE (kept for reference):
  // useEffect(() => {
  //   const handleInputBlur = () => {
  //     setTimeout(() => {
  //       window.scrollTo(0, 0); // ?�� THIS caused scroll-to-top on every input!
  //     }, 100);
  //   };
  //   document.addEventListener('focusout', handleInputBlur);
  // }, []);


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


  // 🎯 MISSION COMPLETE AUTOMATION - Check for completed trips
  useEffect(() => {
    if (data && data.travel && data.travel.trips) {
      checkForCompletedTrips();
    }
  }, [data]);

  // 🔔 DEBT PAYMENT NOTIFICATIONS - Check for upcoming payments
  useEffect(() => {
    if (data && data.debt && data.debt.accounts) {
      checkDebtPaymentNotifications();
    }
  }, [data]);

  // 🎯 LOAD PRICING PHASE DATA (OPTIONAL - Don't error if no access)
  useEffect(() => {
    const loadPricingPhaseData = async () => {
      try {
        // Load Founder's Circle count (OPTIONAL - fail silently if no access)
        const foundersDocRef = doc(db, 'app-config', 'founders-circle');
        const foundersDoc = await getDoc(foundersDocRef);
        
        if (foundersDoc.exists()) {
          const count = foundersDoc.data().subscriberCount || 0;
          setFoundersCircleCount(count);
          infoLog(`📊 Founder's Circle: ${count}/100 spots taken`);
        }

        // Load Early Adopter count
        const earlyAdopterDocRef = doc(db, 'app-config', 'early-adopter');
        const earlyAdopterDoc = await getDoc(earlyAdopterDocRef);
        
        if (earlyAdopterDoc.exists()) {
          const count = earlyAdopterDoc.data().subscriberCount || 0;
          setEarlyAdopterCount(count);
          infoLog(`📊 Early Adopter: ${count}/500 spots taken`);
        }
      } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
        // SILENT: Pricing phase data is optional - don't show error to users
        // (Firestore permissions may restrict access to app-config collection)
      }
    };

    loadPricingPhaseData();
  }, []);

  // 🎯 HANDLE LANDING PAGE REDIRECTS (Simplified - Optional)
  useEffect(() => {
    // Only run after user authentication is complete
    if (authLoading || !user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const upgradePlan = urlParams.get('upgrade');
    const signup = urlParams.get('signup');
    const plan = urlParams.get('plan');

    // Optional: Still support redirects for users who want to upgrade in-app
    if (upgradePlan) {
      console.log('🎯 Landing redirect: Opening pricing modal for', upgradePlan);
      setLandingRedirect({ type: 'upgrade', plan: upgradePlan });
      
      // Add small delay to ensure user data is loaded
      setTimeout(() => {
        setShowPricingModal(true);
        showNotification(`Welcome! Opening ${upgradePlan} upgrade options...`, 'info');
      }, 1000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (signup && plan) {
      console.log('🎯 Landing redirect: User needs to signup for', plan);
      setLandingRedirect({ type: 'signup', plan: plan });
      showNotification(`Welcome! You can upgrade to ${plan} after signing up.`, 'info');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authLoading, user]); // Run when loading state or user changes

  // 🌊 FLOW LIKE WATER: Check for stored signup data from webhook
  const checkForStoredSignupData = async () => {
    try {
      const response = await fetch('/api/get-signup-data');
      if (response.ok) {
        const data = await response.json();
        if (data.email) {
          console.log('🌊 Found stored signup data:', data.email);
          setAuthForm(prev => ({
            ...prev,
            email: data.email,
            name: data.name || data.email.split('@')[0]
          }));
        }
      }
    } catch (error) {
      console.log('🌊 No stored signup data found (this is normal for first-time users)');
    }
  };

  // 🌊 FLOW LIKE WATER: Pre-detect user status on signup page load
  useEffect(() => {
    // Only run on signup page when not authenticated
    if (authLoading || user || !showAuth || authMode !== 'signup') return;
    
    // Check if we have an email in the URL or form
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const emailToCheck = emailFromUrl || authForm.email;
    
    // If no email in URL, check for stored signup data from webhook
    if (!emailFromUrl && !authForm.email) {
      checkForStoredSignupData();
      return;
    }
    
    if (emailToCheck) {
      console.log('🌊 Pre-detecting user status for:', emailToCheck);
      
      // Check if this email exists in Firebase Auth (webhook-created user)
      fetchSignInMethodsForEmail(auth, emailToCheck)
        .then(signInMethods => {
          console.log('🌊 Pre-detection result:', signInMethods);
          
          if (signInMethods.length > 0) {
            // Email exists - this is a webhook-created user, show password setup immediately
            console.log('🌊 User exists - showing password setup flow immediately');
            setExistingUserWithPayment({
              email: emailToCheck,
              name: authForm.name || '',
              userId: 'webhook-created',
              subscription: { status: 'active', tier: 'founders-circle' }
            });
            setShowSetPassword(true);
            
            // Pre-fill the email in the form
            if (emailFromUrl) {
              setAuthForm(prev => ({ ...prev, email: emailFromUrl }));
            }
          } else {
            console.log('🌊 New user - showing normal signup form');
            // Pre-fill email from URL if available
            if (emailFromUrl) {
              setAuthForm(prev => ({ ...prev, email: emailFromUrl }));
            }
          }
        })
        .catch(error => {
          console.log('🌊 Pre-detection failed, showing normal signup:', error);
          // Pre-fill email from URL if available
          if (emailFromUrl) {
            setAuthForm(prev => ({ ...prev, email: emailFromUrl }));
          }
        });
    }
  }, [authLoading, user, showAuth, authMode, authForm.email]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.calendar-container')) {
        // Close all open calendars
        if (tempCardData && tempCardData.accounts) {
          const updatedAccounts = tempCardData.accounts.map(account => ({
            ...account,
            showCalendar: false
          }));
          setTempCardData({...tempCardData, accounts: updatedAccounts});
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tempCardData]);

  // Function to check for debt payment notifications
  const checkDebtPaymentNotifications = () => {
    const today = new Date();
    const currentDay = today.getDate();
    
    data.debt.accounts.forEach(account => {
      if (account.notificationsEnabled && account.dueDate && account.minPayment > 0) {
        const dueDate = account.dueDate;
        const notificationDays = account.notificationDays || 3;
        
        // Calculate days until due date
        const daysUntilDue = dueDate >= currentDay ? dueDate - currentDay : (30 - currentDay) + dueDate;
        
        // Check if we should show notification
        if (daysUntilDue === notificationDays) {
          showNotification(
            `Payment Reminder: ${account.name}`,
            `Your ${account.name} payment of $${(parseFloat(account.minPayment) || 0).toLocaleString()} is due in ${daysUntilDue} days (${dueDate}th of the month).`,
            'info'
          );
        } else if (daysUntilDue === 0) {
          showNotification(
            `Payment Due Today: ${account.name}`,
            `Your ${account.name} payment of $${(parseFloat(account.minPayment) || 0).toLocaleString()} is due today!`,
            'warning'
          );
        } else if (daysUntilDue < 0) {
          showNotification(
            `Payment Overdue: ${account.name}`,
            `Your ${account.name} payment of $${(parseFloat(account.minPayment) || 0).toLocaleString()} is ${Math.abs(daysUntilDue)} days overdue!`,
            'error'
          );
        }
      }
    });
  };

  // Card editing functions
  const openCardEditor = (cardType, currentData) => {
    // ✅ Simple like other pages - let FixedModal handle everything!
    setEditingCard(cardType);
    
    // Provide safe defaults for different card types
    if (cardType === 'debt' && (!currentData || !currentData.accounts || currentData.accounts.length === 0)) {
      // Provide default debt accounts if none exist
      const defaultAccounts = [
        { id: 1, name: 'Credit Card', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 15, notificationsEnabled: true, notificationDays: 3 },
        { id: 2, name: 'Personal Loan', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 1, notificationsEnabled: true, notificationDays: 3 }
      ];
      setTempCardData({
        accounts: currentData?.accounts || defaultAccounts,
        total: currentData?.total || 0,
        history: currentData?.history || []
      });
    } else {
      setTempCardData(currentData || {});
    }
  };

  const resetMobileViewport = () => {
    // Force viewport reset on mobile (NO SCROLLING!)
    if (window.innerWidth <= 768) {
      // Remove any zoom/scale
      document.body.style.zoom = "1";
      document.body.style.transform = "scale(1)";
      document.body.style.webkitTransform = "scale(1)";
      
      // Blur any focused elements
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      // NOTE: Removed viewport meta manipulation as it can cause issues
      // Scroll position is now handled by FixedModal component
    }
  };

  const saveCardData = async () => {
    if (!editingCard || !data) return;
    
    let convertedData;
    
    // 🎯 Special handling for array-based cards (goals, budgets, etc.)
    if (Array.isArray(tempCardData)) {
      // For arrays, convert numbers within each object
      convertedData = tempCardData.map(item => {
        const converted = {};
        Object.keys(item).forEach(key => {
          const value = item[key];
          if (typeof value === 'string' && value !== '' && !isNaN(value)) {
            converted[key] = Number(value);
          } else if (value === '') {
            converted[key] = 0;
          } else {
            converted[key] = value;
          }
        });
        return converted;
      });
    } else {
      // 🔧 Convert string values to numbers for object-based cards
      convertedData = {};
      Object.keys(tempCardData).forEach(key => {
        const value = tempCardData[key];
        // Convert string numbers to actual numbers
        if (typeof value === 'string' && value !== '' && !isNaN(value)) {
          convertedData[key] = Number(value);
        } else if (value === '' || value === null || value === undefined) {
          convertedData[key] = 0; // Empty becomes 0
        } else {
          convertedData[key] = value; // Keep as-is (objects, arrays, etc)
        }
      });
    }
    
    let updatedData;
    
    // Special handling for savings rate target (only update the target, not the entire savingsRate object)
    if (editingCard === 'savingsRateTarget') {
      updatedData = { 
        ...data, 
        savingsRate: { 
          ...data.savingsRate, 
          target: Number(tempCardData.target) || 0
        } 
      };
    } else {
      updatedData = { ...data, [editingCard]: convertedData };
    }
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        [editingCard]: convertedData
      });
      
      // Award XP based on card type
      try {
        let xpAmount = 1; // Default for transactions
        let action = 'card save';
        if (editingCard === 'goals') { xpAmount = 25; action = 'create goal'; }
        else if (editingCard === 'budgets') { xpAmount = 25; action = 'create budget'; }
        const result = await awardXp(db, userId, xpAmount);
        setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - xpAmount);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: xpAmount, action });
          setShowRankUpModal(true);
          if (window.gtag) {
            window.gtag('event', 'rank_up', { new_rank: result.newRank.name, new_level: result.newRank.level, xp_gained: xpAmount, action });
          }
        }
      } catch (e) {
        console.warn('XP award failed (card save)', e);
      }
      setData(updatedData);
      setEditingCard(null);
      setTempCardData({});
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
    setResetType('financial-only'); // Default to safest option
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetType('financial-only');
  };

  const confirmResetData = async () => {
    debugLog('🔧 Reset Data: Function called');
    debugLog('🔧 Reset Data: userId =', userId);
    debugLog('🔧 Reset Data: resetType =', resetType);
    
    if (!userId) {
      console.error('❌ Reset Data: No userId available!');
      showNotification('🔒 Please sign in to reset data', 'error');
      return;
    }

    let resetData;
    
    if (resetType === 'sample-financial') {
      // 📊 SAMPLE FINANCIAL DATA ONLY (FREE tier safe!)
      // Only populates transactions & dashboard - no businesses, travel, investments
      const startDate = new Date(resetStartDate);
      
      // 🛡️ PRESERVE non-financial data
      const preservedData = {
        moments: data.moments || [],
        logbook: data.logbook || [],
        quickJournalEntries: data.quickJournalEntries || [],
        supplies: data.supplies || {}
      };
      
      resetData = {
        ...initialData,
        transactions: initialData.transactions.map((t, index) => {
          const daysToSubtract = index * 2;
          const transactionDate = new Date(startDate);
          transactionDate.setDate(startDate.getDate() - daysToSubtract);
          return {
            ...t,
            date: transactionDate.toISOString().split('T')[0]
          };
        }),
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
          businessIncome: 0, // ? No business data in sample
          businessExpenses: 0,
          investmentValue: 0, // ? No investment data in sample
          savingsRate: initialData.savingsRate.current
        }],
        
        // ? Override to remove premium features (FREE tier safe!)
        businesses: [], // No sample businesses
        investments: { totalValue: 0, totalGainLoss: 0, holdings: [], categories: [], monthlyData: [] },
        travel: {
          totalSavings: 0,
          homeCurrency: 'CAD',
          exchangeRates: { 'USD': 1.35, 'EUR': 1.47, 'GBP': 1.70, 'THB': 0.037, 'COP': 0.00033 },
          trips: [],
          runwayCalculation: { averageDailySpend: 0, totalAvailableFunds: 0, estimatedDaysRemaining: 0, lastUpdated: resetStartDate },
          tripPlan: { cheap: 90, moderate: 30, expensive: 15 },
          expenseCategories: [
            { name: 'Accommodation', icon: '🏨', color: 'bg-blue-500' },
            { name: 'Food & Dining', icon: '🍽️', color: 'bg-green-500' },
            { name: 'Transportation', icon: '🚕', color: 'bg-yellow-500' },
            { name: 'Activities', icon: '🎭', color: 'bg-purple-500' },
            { name: 'Shopping', icon: '🛍️', color: 'bg-pink-500' },
            { name: 'Other', icon: '💵', color: 'bg-gray-500' }
          ]
        },
        
        // 🛡️ PRESERVE non-financial data
        ...preservedData
      };
    } else if (resetType === 'financial-only') {
      // 💰 RESET FINANCIAL DATA ONLY (keep moments, logbook, businesses, travel, etc.)
      
      // 🛡️ PRESERVE all non-financial data
      const preservedData = {
        moments: data.moments || [],
        logbook: data.logbook || [],
        quickJournalEntries: data.quickJournalEntries || [],
        supplies: data.supplies || {},
        businesses: data.businesses || [],
        travel: data.travel || {},
        investments: data.investments || {}
      };
      
      resetData = {
        financialFreedom: {
          targetAmount: 2000000,
          currentInvestments: 0,
          monthlyContribution: 0,
          annualReturn: 7,
        },
        creditScore: { current: 0, history: [] },
        cashOnHand: { total: 0, accounts: [], history: [{ date: resetStartDate, total: 0 }] },
        rainyDayFund: { total: 0, goal: 0, accounts: [], history: [{ date: resetStartDate, total: 0 }] }, // 🛡️ FIX: Start at 0, let users set their own goal!
        debt: {
          total: 0,
          accounts: [
            { id: 1, name: 'Credit Card', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 15, notificationsEnabled: true, notificationDays: 3 },
            { id: 2, name: 'Personal Loan', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 1, notificationsEnabled: true, notificationDays: 3 }
          ],
          history: [{ date: resetStartDate, total: 0 }]
        },
        registeredAccounts: {
          accounts: [
            { id: 'tfsa', name: 'TFSA', contributed: 0, limit: 88000, goal: 10000, type: 'tax-free', description: 'Tax-free growth and withdrawals' },
            { id: 'rrsp', name: 'RRSP', contributed: 0, limit: 31560, goal: 5000, type: 'tax-deferred', description: 'Tax-deferred retirement savings' }
          ]
        },
        netWorth: { total: 0, breakdown: [], history: [{ date: resetStartDate, total: 0 }] },
        income: { total: 0, sources: [], history: [{ date: resetStartDate, total: 0 }] },
        expenses: { total: 0, categories: [], history: [{ date: resetStartDate, total: 0 }] },
        cashflow: { total: 0, monthly: 0, history: [{ date: resetStartDate, amount: 0 }] },
        savingsRate: { current: 0, target: 20, monthly: 0, monthlyIncome: 0, history: [{ date: resetStartDate, rate: 0 }] },
        goals: [],
        transactions: [],
        recurringExpenses: [],
        monthlyHistory: [{
          month: resetStartDate.substring(0, 7),
          netWorth: 0, income: 0, expenses: 0, cashflow: 0,
          businessIncome: 0, businessExpenses: 0, investmentValue: 0, savingsRate: 0
        }],
        budgetSettings: {
          fiftyThirtyTwenty: { needs: 50, wants: 30, savings: 20 },
          sixJars: { necessities: 55, education: 10, play: 10, longTermSavings: 10, financial: 10, give: 5 }
        },
        
        // 🛡️ PRESERVE all non-financial data
        ...preservedData
      };
    } else {
      // 🗑️ RESET WHOLE APP (everything goes - nuclear option)
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
          goal: 0, // 🛡️ FIX: Start at 0, let users set their own goal!
          accounts: [],
          history: [{ date: resetStartDate, total: 0 }]
        },
        debt: {
          total: 0,
          accounts: [
            { id: 1, name: 'Credit Card', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 15, notificationsEnabled: true, notificationDays: 3 },
            { id: 2, name: 'Personal Loan', balance: 0, initialDebt: 0, amountPaid: 0, interestRate: 0, minPayment: 0, dueDate: 1, notificationsEnabled: true, notificationDays: 3 }
          ],
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
      debugLog('🔧 Reset Data: Starting Firebase write...');
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), resetData);
      debugLog('? Reset Data: Firebase write successful');
      
      // 🎮 Reset XP only for sample-financial and whole-app (not financial-only)
      if (resetType === 'sample-financial' || resetType === 'whole-app') {
        debugLog('🎮 Resetting XP profile to Recruit (0 XP)...');
        const initialProfile = {
          xpPoints: 0,
          rank: 'Recruit',
          rankLevel: 1,
          unlockedMilestones: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'userProfiles', userId), initialProfile);
        debugLog('? XP profile reset successful');
      } else {
        debugLog('?��️ Financial-only reset - XP preserved');
      }
      
      setData(resetData);
      debugLog('? Reset Data: Local state updated');
      
      // Trigger MissionStatusBanner refresh by changing state
      setXpRefreshTrigger(prev => prev + 1);
      
      setShowResetModal(false);
      setResetType('financial-only');
      debugLog('? Reset Data: Modal closed');
      
      const resetTypeMessages = {
        'financial-only': '? Financial data reset successfully!',
        'sample-financial': '? Sample financial data loaded! XP reset to 0.',
        'whole-app': '🗑️ All data reset successfully! XP reset to 0.'
      };
      showNotification(resetTypeMessages[resetType] || '✅ Data reset successfully!', 'success');
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
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
      date: getTodayInUserTimezone()
    });
    
    // Enhanced viewport cleanup
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
    

    
    // Reset mobile viewport on modal close
    setTimeout(resetMobileViewport, 100);
  };

  // 🛡️ DATA SAFETY FUNCTIONS - Protecting user data like it's sacred
  const loadDataSafetyInfo = async () => {
    if (!userId) return;
    
    try {
      const [backups, summary] = await Promise.all([
        getUserBackups(userId),
        getDataSafetySummary(userId)
      ]);
      
      setUserBackups(backups);
      setDataSafetySummary(summary);
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('🛡️ Failed to load data safety info:', error);
    }
  };

  const handleDataExport = async () => {
    if (!data || !userId) {
      showNotification('No data to export', 'error');
      return;
    }
    
    try {
      // 📦 Try ZIP export via Cloud Function first (premium experience)
      showNotification('📦 Preparing your complete archive...', 'info');
      
      try {
        const exportFunction = httpsCallable(functions, 'exportUserData');
        const result = await exportFunction();
        
        if (result.data.success) {
          // Download the .zip file
          const link = document.createElement('a');
          link.href = result.data.downloadURL;
          link.download = result.data.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showNotification(`✅ Export complete! Downloaded ${result.data.fileName} (${result.data.filesCount} CSV files)`, 'success');
          
          // Track last export for reminder widget
          localStorage.setItem(`lastExport_${userId}`, Date.now().toString());
          return;
        }
      } catch (cloudError) {
        console.warn('Cloud Function export unavailable, using JSON fallback:', cloudError);
      }
      
      // 💾 Fallback to JSON export (always works, no dependencies)
      console.log('📥 Using JSON export fallback...');
      exportUserData(data);
      showNotification('💾 Backup downloaded as JSON!', 'success');
      
      // Track last export for reminder widget
      localStorage.setItem(`lastExport_${userId}`, Date.now().toString());
      
    } catch (error) {
      console.error('Export error:', error);
      showNotification('❌ Export failed. Please try again.', 'error');
    }
  };

  const handleDataImport = async (file) => {
    try {
      const importedData = await importUserData(file);
      const validation = validateDataIntegrity(importedData);
      
      if (!validation.valid) {
        showNotification(`Import failed: ${validation.error}`, 'error');
        return;
      }
      
      // Create backup before importing
      if (userId && data) {
        await createBackup(userId, data, 'pre-import');
      }
      
      // Import the data
      if (userId) {
        await setDoc(doc(db, `users/${userId}/financials`, 'data'), importedData);
        setData(importedData);
        showNotification('📁 Data imported successfully!', 'success');
        setShowDataImportModal(false);
      }
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('🛡️ Data import failed:', error);
      showNotification('Import failed', 'error');
    }
  };

  const handleDataRecovery = async (backupId) => {
    if (!userId) return;
    
    try {
      const success = await restoreFromBackup(userId, backupId);
      if (success) {
        showNotification('🛡️ Data recovered successfully! Reloading...', 'success');
        
        // 🛡️ CRITICAL FIX: Reload the actual financial data from Firebase!
        try {
          const docRef = doc(db, `users/${userId}/financials`, 'data');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const restoredData = docSnap.data();
            setData(restoredData); // ? Update React state with restored data!
            showNotification('✅ Data restored and loaded successfully!', 'success');
          } else {
            showNotification('⚠️ Data restored but reload failed. Please refresh page.', 'warning');
          }
        } catch (reloadError) {
          console.error('Error reloading data after recovery:', reloadError);
          showNotification('?��️ Data restored but reload failed. Please refresh page.', 'warning');
        }
        
        setShowDataRecoveryModal(false);
        // Reload data safety info
        loadDataSafetyInfo();
      } else {
        showNotification('Recovery failed', 'error');
      }
    } catch (error) {
      console.error('🛡️ Data recovery failed:', error);
      showNotification('Recovery failed', 'error');
    }
  };

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };

  // ?�� QUICK EXPENSE HANDLER - CRITICAL: Must show in Recent Transactions!
  const confirmQuickExpense = async (expense) => {
    if (!expense.description || !expense.amount || !userId) return;

    const amount = parseFloat(expense.amount);
    if (isNaN(amount) || amount <= 0) return;

    // CRITICAL FIX: Ensure data is valid before proceeding
    if (!data || typeof data !== 'object') {
      console.error('❌ Quick Expense Error: data is invalid:', data);
      showNotification('Error: Data not loaded. Please refresh the page.', 'error');
      return;
    }

    const transaction = {
      id: Date.now(),
      description: expense.description,
      amount: -Math.abs(amount), // Always negative for expenses
      type: 'expense',
      category: 'personal',
      subcategory: 'cash',
      date: expense.date,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleString(),
      displayDate: formatDateForUser(expense.date),
      isRecurring: false // Mark as manual transaction
    };

    // CRITICAL FIX: Ensure transaction appears in Recent Transactions immediately!
    // Add to ALL transaction arrays AND ensure recentTransactions mirrors transactions
    // SAFETY: Ensure arrays exist before spreading
    const currentTransactions = Array.isArray(data.transactions) ? data.transactions : [];
    const currentExpenses = Array.isArray(data.expenses) ? data.expenses : [];
    
    const updatedTransactions = [transaction, ...currentTransactions].sort((a, b) => 
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
    const updatedExpenses = [transaction, ...currentExpenses].sort((a, b) => 
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );

    // CRITICAL: recentTransactions should be same as transactions for consistency
    const updatedData = { 
      ...data, 
      transactions: updatedTransactions, 
      expenses: updatedExpenses,
      recentTransactions: updatedTransactions // Mirror transactions array
    };

    try {
      debugLog('🔍 DEBUG: Quick Expense Transaction:', transaction);
      debugLog('🔍 DEBUG: Updated transactions array length:', updatedTransactions.length);
      debugLog('🔍 DEBUG: Updated recentTransactions array length:', updatedTransactions.length);
      debugLog('🔍 DEBUG: First item in recentTransactions:', updatedTransactions[0]);
      
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        transactions: updatedTransactions,
        expenses: updatedExpenses,
        recentTransactions: updatedTransactions
      });
      
      // Update local state
      setData({
        ...data,
        transactions: updatedTransactions,
        expenses: updatedExpenses,
        recentTransactions: updatedTransactions
      });
      
      debugLog('? DEBUG: Data saved to Firebase and state updated');
      debugLog('🔍 DEBUG: Current data.recentTransactions:', updatedTransactions.slice(0, 3));
      
      showNotification('✅ Quick expense logged!', 'success');
      
      // Award XP for logging expense
      try {
        const result = await awardXp(db, userId, 5);
        // FIX: Trigger XP banner refresh immediately
        setXpRefreshTrigger(prev => prev + 1);
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - 5);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 5, action: 'quick expense' });
          setShowRankUpModal(true);
        }
      } catch (e) {
        console.warn('XP award failed (quick expense)', e);
      }
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('❌ ERROR adding quick expense:', error);
      showNotification('Error logging expense', 'error');
    }
  };

  // 📝 QUICK JOURNAL HANDLERS
  const openQuickJournal = () => {
    setShowQuickJournal(true);
  };

  const closeQuickJournal = () => {
    setShowQuickJournal(false);
    setQuickJournalNote('');
  };

  const saveQuickJournal = async (noteContent) => {
    if (!noteContent.trim()) return;
    
    const journalEntry = {
      id: Date.now(),
      text: noteContent.trim(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleString(),
      type: 'quick-note'
    };
    
    // Add to data structure
    const updatedQuickJournal = [...(data.quickJournalEntries || []), journalEntry];
    
    try {
      // 🛡️ CRITICAL FIX: Use updateDoc to prevent data loss!
      await updateDoc(doc(db, `users/${userId}/financials`, 'data'), {
        quickJournalEntries: updatedQuickJournal
      });
      
      setData({
        ...data,
        quickJournalEntries: updatedQuickJournal
      });
      closeQuickJournal();
      showNotification('📝 Quick note saved!', 'success');
      
      // Award XP for journaling
      try {
        const result = await awardXp(db, userId, 10);
        setXpRefreshTrigger(prev => prev + 1); // FIX: Refresh XP banner
        if (result?.rankUp && result.newRank) {
          const prev = getRankFromXp((result.totalXp || 0) - 10);
          setRankUpData({ newRank: result.newRank, oldRank: prev.current, xpGained: 10, action: 'quick journal' });
          setShowRankUpModal(true);
        }
      } catch (e) {
        console.warn('XP award failed (quick journal)', e);
      }
    } catch (error) {

  // 💫 MOMENTS HANDLERS
  // const handleEditMoment = (moment) => {
  //   console.log('Edit moment:', moment);
  // };

  // const handleShareMoment = (moment) => {
  //   console.log('Share moment:', moment);
  // };
      console.error('Error saving quick journal:', error);
      showNotification('Error saving note', 'error');
    }
  };

  // Calculate income and expenses from transactions
  const calculateIncomeExpenses = (transactions, businesses = []) => {
    if (!transactions || transactions.length === 0) {
      transactions = [];
    }

    // 🔧 FIX: Calculate from CURRENT MONTH only (not all transactions ever!)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter transactions to current month only
    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    // Calculate total income and expenses from CURRENT MONTH transactions
    const totalTransactionIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalTransactionExpenses = currentMonthTransactions
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

    // Group income by subcategory (from CURRENT MONTH transactions only)
    const incomeByCategory = {};
    currentMonthTransactions
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

    // Group expenses by subcategory (from CURRENT MONTH transactions only)
    const expensesByCategory = {};
    currentMonthTransactions
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
      },
      // 🔧 FIX: Ensure goals are included in displayData
      goals: data.goals || [],
      // 🔧 FIX: Ensure financialFreedom is included in displayData
      financialFreedom: data.financialFreedom || {
        targetAmount: 500000,
        currentInvestments: 0,
        monthlyContribution: 0,
        annualReturn: 7
      }
    };
    
    return viewMode === 'annual' ? getAnnualizedData() : baseData;
  };

  const displayData = getDisplayData();

  // 🧳 OFFLINE EVENT LISTENERS - Perfect for travelers
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineIndicator(false);
      setOfflineSummary(getOfflineSummary());
      debugLog('🧳 Back online! Syncing offline data...');
      
      // TODO: Implement sync of pending offline data
      // syncPendingOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineIndicator(true);
      setOfflineSummary(getOfflineSummary());
      debugLog('🧳 Gone offline! Storing data locally...');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!isOnline());
    setOfflineSummary(getOfflineSummary());

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading screen while app is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      {/* 🎉 Update Notification - Shows when new app version available */}
      <UpdateNotification />
      
      {/* Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white border border-green-500' 
            : 'bg-red-600 text-white border border-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <span className="text-green-200">✓</span>
            ) : (
              <span className="text-red-200">⚠</span>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* 🧳 OFFLINE INDICATOR - Perfect for travelers */}
      {isOffline && (
        <div className="fixed top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-lg bg-orange-600 text-white border border-orange-500">
          <div className="flex items-center justify-center gap-2">
            <span className="text-orange-200">🧳</span>
            <span className="font-medium">Offline Mode</span>
            <span className="text-orange-200">?��</span>
            <span className="text-sm">Data will sync when connected</span>
            {offlineSummary.pendingSync > 0 && (
              <>
                <span className="text-orange-200">?��</span>
                <span className="text-sm bg-orange-700 px-2 py-1 rounded">
                  {offlineSummary.pendingSync} pending
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🎯 PRICING PHASE BANNER - REMOVED FOR CLEAN UI */}
      
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
              Kompul
            </h2>
            <p className="text-gray-400 animate-pulse">{t('common.loading')} your dashboard...</p>
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
                  Kompul
                </h1>
                <p className="text-amber-200 mt-2">
                  {authMode === 'login' ? 'Navigate to your financial freedom' : 'Start your journey to financial independence'}
                </p>
              </div>

              <div className="space-y-4">
                {/* 🎯 SMART SIGNUP FLOW: Show different UI based on user status */}
                {showSetPassword ? (
                  // Show "Set Password" flow for existing users with payments
                  <div className="space-y-4">
                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-green-400 font-semibold">Account Already Created from Payment</h3>
                      </div>
                      <p className="text-green-200 text-sm">
                        We found an account for <strong>{existingUserWithPayment?.email}</strong> with an active subscription. 
                        Please set a password to complete your account setup.
                      </p>
                    </div>
                    
                    <input
                      type="password"
                      placeholder="Set Your Password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                    />
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowSetPassword(false);
                          setExistingUserWithPayment(null);
                          setAuthForm({ email: '', password: '', name: '' });
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSetPassword}
                        disabled={authLoading || !authForm.password}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50"
                      >
                        {authLoading ? 'Setting Password...' : 'Set Password & Continue'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show normal signup/login form
                  <>
                {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="First Name"
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
                    
                    {/* Forgot Password Link */}
                    {authMode === 'login' && (
                      <div className="text-right mt-2">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {!showSetPassword && (
                <button
                  onClick={authMode === 'login' ? handleSignIn : handleSignUp}
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {authLoading ? 'Loading...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
                )}
                
                {!showSetPassword && (
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
                )}
              </div>

              {!showSetPassword && (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard - Only show when authenticated */}
      {user && !authLoading && (
      <div className={`max-w-7xl mx-auto ${stealthMode ? 'stealth-active' : ''}`}>
        <header className="mb-8">
          {/* Mission Status Banner */}
          <MissionStatusBanner userId={userId} refreshTrigger={xpRefreshTrigger} />
          
          {/* 🛡️ Data Safety & Export Reminder Widget */}
          {data && userId && (() => {
            const lastBackupKey = `lastAutoBackup_${userId}`;
            const lastExportKey = `lastExport_${userId}`;
            const lastBackup = localStorage.getItem(lastBackupKey);
            const lastExport = localStorage.getItem(lastExportKey);
            const now = Date.now();
            
            const backupAge = lastBackup ? Math.floor((now - parseInt(lastBackup)) / (1000 * 60 * 60)) : null; // hours
            const exportAge = lastExport ? Math.floor((now - parseInt(lastExport)) / (1000 * 60 * 60 * 24)) : null; // days
            const showExportReminder = !lastExport || exportAge > 7;
            
            return (
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                {/* Backup Status Widget */}
                <div className="flex-1 bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-400 font-semibold text-sm">🛡️ Data Protected</p>
                        <p className="text-green-200 text-xs">
                          {backupAge !== null 
                            ? `Last backup: ${backupAge < 1 ? 'Less than 1 hour ago' : `${backupAge} hour${backupAge > 1 ? 's' : ''} ago`}`
                            : 'Creating first backup...'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        loadDataSafetyInfo();
                        setShowDataRecoveryModal(true);
                      }}
                      className="text-green-400 hover:text-green-300 text-xs font-medium px-3 py-1 rounded bg-green-600/20 hover:bg-green-600/30 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
                
                {/* Export Reminder (only if > 7 days) */}
                {showExportReminder && (
                  <div className="flex-1 bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-blue-400 font-semibold text-sm">💾 Export Recommended</p>
                          <p className="text-blue-200 text-xs">
                            {exportAge !== null 
                              ? `Last export: ${exportAge} day${exportAge > 1 ? 's' : ''} ago`
                              : 'Export your data weekly for extra safety!'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          await handleDataExport();
                          localStorage.setItem(lastExportKey, Date.now().toString());
                        }}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">{t('app.name')}</h1>
              <p className="text-amber-300 text-lg font-semibold">{t('dashboard.welcome')}, {devDemoMode ? 'Demo User' : (user?.displayName?.split(' ')[0] || 'Explorer')}! {t('dashboard.welcomeMessage')}</p>
            </div>
            
            {/* User Profile Section - Modern Dropdown Menu - FIXED: Now stays right on mobile */}
            <div className="flex items-center gap-4 order-last w-full sm:w-auto justify-end sm:ml-auto">
              {userPlan === SUBSCRIPTION_TIERS.FREE && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white p-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Upgrade to Premium"
                >
                  <Crown className="w-5 h-5" />
                </button>
              )}
              
              {/* Quick Expense Button */}
              <button
                onClick={openQuickExpense}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                title={t('common.quickExpense')}
              >
                <Plus className="w-5 h-5" />
              </button>
              
              {/* Quick Journal Button - FREE FOR EVERYONE! 🎁 - BRIGHT BLUE! */}
              <button
                onClick={() => setShowQuickJournal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors flex items-center gap-2 transform hover:scale-105 shadow-md"
                title={t('common.quickJournal')}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              
              {/* 🔒 STEALTH MODE Toggle - Free for Everyone! */}
              <button
                onClick={toggleStealthMode}
                className={`${
                  stealthMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } text-white p-2 rounded-lg transition-colors flex items-center gap-2`}
                title={stealthMode ? t('common.stealthModeOn') : t('common.stealthModeOff')}
              >
                {stealthMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {/* Help FAQ Button */}
              <button
                onClick={() => setShowHelpFAQ(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                title={t('settings.helpFAQ')}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Modern User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                  title={t('settings.accountMenu')}
                >
                  {/* User Avatar with Plan Badge */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                      {devDemoMode ? 'D' : (user?.displayName?.split(' ')[0] || 'U')[0].toUpperCase()}
                    </div>
                    {/* Plan Badge on Avatar */}
                    <div className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      userPlan === SUBSCRIPTION_TIERS.FREE ? 'bg-gray-600 text-gray-300' :
                      userPlan === SUBSCRIPTION_TIERS.CLIMBER ? 'bg-blue-600 text-blue-100' :
                      userPlan === SUBSCRIPTION_TIERS.OPERATOR ? 'bg-purple-600 text-purple-100' :
                      'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    }`}>
                      {userPlan === SUBSCRIPTION_TIERS.FREE ? 'R' : 
                       userPlan === SUBSCRIPTION_TIERS.CLIMBER ? 'C' : 
                       userPlan === SUBSCRIPTION_TIERS.OPERATOR ? 'O' :
                       userPlan === SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE ? 'F' : 
                       'F'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    {/* Menu Content */}
                    <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 overflow-hidden max-w-[calc(100vw-2rem)]">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                            {devDemoMode ? 'D' : (user?.displayName?.split(' ')[0] || 'U')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{devDemoMode ? t('settings.demoUser') : (user?.displayName?.split(' ')[0] || 'User')}</p>
                            <p className="text-gray-400 text-sm truncate">{devDemoMode ? 'demo@example.com' : user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                            userPlan === SUBSCRIPTION_TIERS.FREE ? 'bg-gray-600 text-gray-300' :
                            userPlan === SUBSCRIPTION_TIERS.CLIMBER ? 'bg-blue-600 text-blue-100' :
                            userPlan === SUBSCRIPTION_TIERS.OPERATOR ? 'bg-purple-600 text-purple-100' :
                            'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                          }`}>
                            {userPlan === SUBSCRIPTION_TIERS.FREE ? t('settings.reconKit') : 
                             userPlan === SUBSCRIPTION_TIERS.CLIMBER ? t('settings.climberPlan') : 
                             userPlan === SUBSCRIPTION_TIERS.OPERATOR ? t('settings.operatorPlan') :
                             userPlan === SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE ? t('settings.foundersCircle') : 
                             t('settings.freePlan')}
                          </span>
                          {/* Timezone Indicator */}
                          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                            🌍 {getTimezoneInfo().displayName}
                          </span>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Bug Report */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setFeedbackType('bug');
                            setFeedbackData({...feedbackData, type: 'bug', email: user?.email || ''});
                            setShowFeedbackModal(true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.reportBug')}</p>
                            <p className="text-xs text-gray-500">{t('settings.reportBugDesc')}</p>
                          </div>
                        </button>
                        
                        {/* Feature Request */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setFeedbackType('feature');
                            setFeedbackData({...feedbackData, type: 'feature', email: user?.email || ''});
                            setShowFeedbackModal(true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                        >
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.requestFeature')}</p>
                            <p className="text-xs text-gray-500">{t('settings.requestFeatureDesc')}</p>
                          </div>
                        </button>
                        
                        <div className="border-t border-gray-700 my-2"></div>
                        
                        {/* 🛡️ DATA SAFETY SECTION */}
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t('settings.dataSafety')}</p>
                        </div>
                        
                        {/* Export Data */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleDataExport();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-green-400"
                        >
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.exportData')}</p>
                            <p className="text-xs text-gray-500">{t('settings.exportDataDesc')}</p>
                          </div>
                        </button>
                        
                        {/* Import Data */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowDataImportModal(true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-blue-400"
                        >
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.importData')}</p>
                            <p className="text-xs text-gray-500">{t('settings.importDataDesc')}</p>
                          </div>
                        </button>
                        
                        {/* Recover Data */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            loadDataSafetyInfo();
                            setShowDataRecoveryModal(true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-amber-400"
                        >
                          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.recoverData')}</p>
                            <p className="text-xs text-gray-500">{t('settings.recoverDataDesc')}</p>
                          </div>
                        </button>
                        
                        {/* Manual Backup - NEW! */}
                        <button
                          onClick={async () => {
                            setShowUserMenu(false);
                            if (!data || !userId) {
                              showNotification('No data to backup', 'error');
                              return;
                            }
                            try {
                              showNotification('💾 Creating backup...', 'info');
                              await createBackup(userId, data, 'manual-backup');
                              showNotification('✅ Backup created successfully!', 'success');
                            } catch (error) {
                              console.error('Manual backup failed:', error);
                              showNotification('Backup failed', 'error');
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-purple-400"
                        >
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.createBackup')}</p>
                            <p className="text-xs text-gray-500">{t('settings.createBackupDesc')}</p>
                          </div>
                        </button>
                        
                        <div className="border-t border-gray-700 my-2"></div>
                        
                        {/* Sign Out */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-300 hover:text-red-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <div>
                            <p className="font-medium">{t('settings.signOut')}</p>
                            <p className="text-xs text-gray-500">{t('settings.signOutDesc')}</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                    {t('common.monthly')}
                  </button>
                  <button
                    onClick={() => setViewMode('annual')}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      viewMode === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {t('common.annual')}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                    showHistory ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showHistory ? t('common.hideHistory') : t('common.showHistory')}
                </button>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-full p-1 overflow-hidden relative">
              {/* 🖱️ Desktop-Only Left Scroll Arrow */}
              {showLeftScroll && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 shadow-lg transition-all"
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* 🖱️ Desktop-Only Right Scroll Arrow */}
              {showRightScroll && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 shadow-lg transition-all"
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <div 
                ref={tabContainerRef}
                onScroll={checkScrollPosition}
                className="flex items-center space-x-1 overflow-x-auto scrollbar-hide md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent"
              >
                <div className="flex space-x-1 min-w-max">
                  <button onClick={() => handleTabClick('dashboard')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2"/>{t('dashboard.title')}
                  </button>
                  <button onClick={() => handleTabClick('transactions')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'transactions' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <CreditCard className="w-4 h-4 mr-2"/>{t('common.transactions')}
                  </button>
                  <button onClick={() => handleTabClick('budget')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'budget' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Calculator className="w-4 h-4 mr-2"/>{t('common.budget')}
                  </button>
                  <button onClick={() => handleTabClick('mission-control')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'mission-control' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Target className="w-4 h-4 mr-2"/>{t('common.missionControl')}
                    {!checkFeatureAccess('goal-tracking') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('reflections')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'reflections' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <BookOpen className="w-4 h-4 mr-2"/>{t('common.fieldNotes')}
                  </button>
                  <button onClick={() => handleTabClick('rank-medals')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'rank-medals' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Award className="w-4 h-4 mr-2"/>{t('common.rankMedals')}
                    {userPlan === SUBSCRIPTION_TIERS.FREE && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('side-hustle')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'side-hustle' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Building className="w-4 h-4 mr-2"/>{t('common.sideHustle')}
                    {!checkFeatureAccess('side-hustle') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('investment')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'investment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <Briefcase className="w-4 h-4 mr-2"/>{t('common.investment')}
                    {!checkFeatureAccess('investment-portfolio') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('travel')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'travel' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    🌍 {t('common.travel')}
                    {!checkFeatureAccess('travel-mode') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                  <button onClick={() => handleTabClick('moments')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'moments' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    💫 {t('common.moments')}
                    {!checkFeatureAccess('travel-mode') && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {activeTab === 'dashboard' && (
            <>
              {/* Monthly History View */}
              {showHistory && data.monthlyHistory && (
                <FinancialErrorBoundary componentName="Monthly History">
                <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                    {t('dashboard.monthlyHistory')}
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
                            <td className="py-2 text-right text-emerald-400 font-semibold">${(parseFloat(month.netWorth) || 0).toLocaleString()}</td>
                            <td className="py-2 text-right text-blue-400">${(parseFloat(month.income) || 0).toLocaleString()}</td>
                            <td className="py-2 text-right text-red-400">${(parseFloat(month.expenses) || 0).toLocaleString()}</td>
                            <td className={`py-2 text-right font-semibold ${month.cashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${(parseFloat(month.cashflow) || 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-violet-400">${((parseFloat(month.businessIncome) || 0) - (parseFloat(month.businessExpenses) || 0)).toLocaleString()}</td>
                            <td className="py-2 text-right text-purple-400">${(parseFloat(month.investmentValue) || 0).toLocaleString()}</td>
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
              
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              {/* ROW 1: IMMEDIATE REALITY & SECURITY */}
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Cash Flow - FREE+ (Left) */}
              <StealthCard>
                <CashFlowCard 
                  data={displayData?.cashflow} 
                  income={displayData?.income}
                  expenses={displayData?.expenses}
                  transactions={data?.transactions || []}
                  onEdit={openCardEditor} 
                />
              </StealthCard>
              
              {/* Rainy Day Fund - 🎁 NOW FREE! (Emergency fund tracking) */}
              <StealthCard>
                <RainyDayFundCard data={displayData?.rainyDayFund} expenses={displayData?.expenses} viewMode={viewMode} onEdit={openCardEditor} />
              </StealthCard>
              </div>
              
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              {/* ROW 2: CORE MECHANICS (Inflow & Outflow) */}
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Monthly Income - FREE+ (Left) */}
              <StealthCard>
                <IncomeCard data={displayData?.income} viewMode={viewMode} />
              </StealthCard>
              
              {/* Monthly Expenses - FREE+ (Right) */}
              <StealthCard>
                <ExpensesCard data={displayData?.expenses} viewMode={viewMode} />
              </StealthCard>
              </div>
              
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              {/* ROW 3: THE BIG PICTURE (Assets & Liquidity) */}
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Net Worth - FREE+ (Left) */}
              <StealthCard>
                <FinancialErrorBoundary componentName="Net Worth Calculator">
                  <NetWorthCard data={displayData?.netWorth} onEdit={openCardEditor} />
                </FinancialErrorBoundary>
              </StealthCard>
              
              {/* Survival Runway - 🎁 NOW FREE! (Financial Runway Tracker) */}
              <StealthCard>
                <FinancialErrorBoundary componentName="Cash Management">
                  <CashOnHandCard 
                    data={displayData?.cashOnHand} 
                    rainyDayGoal={6}
                    transactions={data?.transactions || []}
                    onEdit={openCardEditor} 
                  />
                </FinancialErrorBoundary>
              </StealthCard>
              </div>
              
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              {/* ROW 4: LONG-TERM MISSION & PROGRESS */}
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Financial Freedom Goal - CLIMBER+ (Left) */}
              <StealthCard>
                {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                  <FinancialErrorBoundary componentName="Financial Freedom Goal">
                    <FinancialFreedomCard data={displayData.financialFreedom} onEdit={openCardEditor} />
                  </FinancialErrorBoundary>
                ) : (
                  <LockedCard cardName="Financial Freedom Goal" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                )}
              </StealthCard>
              
              {/* Savings Rate - FREE+ (Right) */}
              <StealthCard>
                <FinancialErrorBoundary componentName="Savings Rate Tracker">
                  <SavingsRateCard data={displayData?.savingsRate} onEdit={openCardEditor} />
                </FinancialErrorBoundary>
              </StealthCard>
              </div>
              
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              {/* FULL-WIDTH CARDS: Detailed Intelligence */}
              {/* ?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?��?�� */}
              
              {/* Debt Payoff Progress Tracker - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'debt-payoff') ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <DebtPayoffProgressTracker 
                  data={displayData?.debt} 
                  onEdit={openCardEditor}
                  userPlan={userPlan}
                  onUpgrade={() => setShowPricingModal(true)}
                />
              </div>
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <LockedCard cardName="Debt Payoff Calculator" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Credit Score - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'credit-score') ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <CreditScoreCard data={displayData?.creditScore} onEdit={openCardEditor} />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <LockedCard cardName="Credit Score Tracking" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Financial Goals - CLIMBER+ (Unlimited Goals) */}
              {hasDashboardCardAccess(userPlan, 'financial-goals') ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <GoalsCard 
                    data={displayData?.goals} 
                    onEdit={openCardEditor}
                  />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <LockedCard cardName="Financial Goals" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
              
              {/* Retirement Accounts - CLIMBER+ (Full Width) */}
              {hasDashboardCardAccess(userPlan, 'financial-freedom') ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <RegisteredAccountsCard 
                    data={displayData?.registeredAccounts} 
                    onEdit={openCardEditor} 
                  />
                </div>
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <LockedCard cardName="Retirement Planning" requiredTier="climber" onUpgrade={() => setShowPricingModal(true)} />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'budget' && (
            <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
              {/* 📦 Supply Crate System - Climber+ Feature */}
              {checkFeatureAccess('financial-calculators') ? (
                <SupplyCrateSystem
                  data={data}
                  setData={setData}
                  userId={userId}
                  currentMonth={new Date().getMonth()}
                  awardXp={awardXp}
                  setXpRefreshTrigger={setXpRefreshTrigger}
                />
              ) : (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">📦 Supply Crate System</h3>
                  <p className="text-gray-300 mb-4 max-w-lg mx-auto">
                    Real-time budget management that shows you EXACTLY what you can spend, right now. 
                    Like envelope budgeting, but gamified!
                  </p>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30 mb-6 max-w-md mx-auto">
                    <div className="text-sm text-green-200 space-y-2">
                      <p>💰 Assign monthly supplies to each category</p>
                      <p>? Track burn rate in real-time</p>
                      <p>? Visual warnings before overspending</p>
                      <p>? The discipline tool you've been missing!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showUpgradePromptForFeature('financial-calculators')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Climber
                  </button>
                </div>
              )}

              {/* Original Budget Calculator */}
              <ErrorBoundary>
                <BudgetCalculatorTab 
                  checkFeatureAccess={checkFeatureAccess}
                  showUpgradePromptForFeature={showUpgradePromptForFeature}
                />
              </ErrorBoundary>
            </div>
          )}
          
          {activeTab === 'side-hustle' && (
            <FinancialErrorBoundary componentName="Side Hustle Management">
              <SideHustleTab 
                data={data} 
                setData={setData} 
                userId={userId} 
                setRankUpData={setRankUpData} 
                setShowRankUpModal={setShowRankUpModal} 
                setXpRefreshTrigger={setXpRefreshTrigger}
                showMomentModal={showMomentModal}
                setShowMomentModal={setShowMomentModal}
                editingMoment={editingMoment}
                setEditingMoment={setEditingMoment}
                newMoment={newMoment}
                setNewMoment={setNewMoment}
              />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'rank-medals' && (
            <div className="col-span-1 md:col-span-6 lg:col-span-6">
              <RankMedalsPage 
                userId={userId} 
                userPlan={userPlan} 
                onUpgrade={() => setShowPricingModal(true)} 
              />
            </div>
          )}
          
          {activeTab === 'investment' && (
            <FinancialErrorBoundary componentName="Investment Portfolio">
              <InvestmentTab data={data} setData={setData} userId={userId} setRankUpData={setRankUpData} setShowRankUpModal={setShowRankUpModal} setXpRefreshTrigger={setXpRefreshTrigger} />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'transactions' && (
            <FinancialErrorBoundary componentName="Transaction Management">
              <TransactionsTab data={data} setData={setData} userId={userId} setRankUpData={setRankUpData} setShowRankUpModal={setShowRankUpModal} setXpRefreshTrigger={setXpRefreshTrigger} />
            </FinancialErrorBoundary>
          )}
          
          {activeTab === 'travel' && (
            <FinancialErrorBoundary componentName="Travel Planning">
              <TravelTab data={data} setData={setData} userId={userId} />
            </FinancialErrorBoundary>
          )}

          {/* 💫 Moments - OPERATOR+ ONLY */}
          {activeTab === 'moments' && (
            checkFeatureAccess('travel-mode') ? (
              <div className="col-span-1 md:col-span-6 lg:col-span-6">
                <FinancialErrorBoundary componentName="Moments Feed">
                  <MomentsFeed data={data} userId={userId} onEditMoment={handleEditMoment} onShareMoment={handleShareMoment} onDeleteMoment={handleDeleteMoment} />
                </FinancialErrorBoundary>
              </div>
            ) : (
              <div className="col-span-1 md:col-span-6 lg:col-span-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-pink-600/20 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">💫 Moments - Operator Feature</h3>
                  <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                    Capture and celebrate your financial milestones with stories and achievements. 
                    Document your journey from start to freedom!
                  </p>
                  <button
                    onClick={() => showUpgradePromptForFeature('travel-mode')}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Operator
                  </button>
                </div>
              </div>
            )
          )}

          {/* 🎯 MISSION CONTROL - The Heart of The Compass (CLIMBER+ Feature) */}
          {activeTab === 'mission-control' && (
            checkFeatureAccess('goal-tracking') ? (
              <FinancialErrorBoundary componentName="Mission Control">
                <MissionControl
                  data={data}
                  userId={userId}
                  onUpdateData={setData}
                  awardXp={awardXp}
                  setXpRefreshTrigger={setXpRefreshTrigger}
                />
              </FinancialErrorBoundary>
            ) : (
              <div className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-purple-900/30 to-gray-900/50 rounded-2xl p-12 border border-purple-500/30 text-center">
                <div className="inline-block bg-purple-500/20 rounded-full p-8 mb-6">
                  <Target className="w-20 h-20 text-purple-400" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4">
                  🎯 Mission Control
                </h2>
                <p className="text-xl text-purple-200 mb-6 max-w-2xl mx-auto">
                  Your strategic flight plan. Connect your daily actions to your ultimate life goals.
                </p>
                <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30 mb-8 max-w-2xl mx-auto">
                  <div className="text-lg text-blue-200 space-y-3 text-left">
                    <p className="flex items-start gap-3">
                      <span className="text-2xl">?��</span>
                      <span><strong>North Star:</strong> Set your ultimate life goal and track progress</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <span><strong>Active Missions:</strong> See all your sub-goals in one strategic view</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-2xl">🧭</span>
                      <span><strong>Your "Why":</strong> Write your personal mission statement</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <span><strong>Projected Freedom Date:</strong> See when you'll reach your North Star</span>
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 mb-8 italic">
                  "The most powerful financial tool is a clear purpose."
                </p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-5 rounded-xl font-black text-lg transition-all flex items-center gap-3 mx-auto shadow-2xl transform hover:scale-105"
                >
                  <Crown className="w-6 h-6" />
                  Unlock Mission Control
                </button>
              </div>
            )
          )}

          {/* 🎁 Field Notes - NOW FREE FOR EVERYONE! Export PDF = Operator+ */}
          {activeTab === 'reflections' && (
            <FinancialErrorBoundary componentName="Field Notes Archive">
              <ReflectionsPage 
                data={data} 
                userPlan={currentUserPlan} 
                onExportPDF={handleExportPDF}
                onUpdateData={setData}
                userId={userId}
                checkFeatureAccess={checkFeatureAccess}
                showUpgradePromptForFeature={showUpgradePromptForFeature}
                awardXp={awardXp}
                setXpRefreshTrigger={setXpRefreshTrigger}
              />
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

      {/* Quick Expense Button - Moved to header (cleaner UX) */}
      {user && !authLoading && (
        <>
          {/* Quick Expense Modal - FIXED VERSION */}
          <QuickExpenseModal
            isOpen={showQuickExpense}
            onClose={closeQuickExpense}
            onSave={confirmQuickExpense}
          />

          {/* Quick Journal Modal - FIXED VERSION */}
          <QuickJournalModal
            isOpen={showQuickJournal}
            onClose={closeQuickJournal}
            onSave={saveQuickJournal}
          />

          {/* 🎯 First Climb Protocol - Week 1 Missions */}
          {showFirstClimbProtocol && (
            <FirstClimbProtocol
              userId={userId}
              data={data}
              onClose={() => setShowFirstClimbProtocol(false)}
              onComplete={() => {
                setXpRefreshTrigger(prev => prev + 1);
                setShowFirstClimbProtocol(false);
              }}
              awardXp={awardXp}
            />
          )}

          {/* 💫 Moments Modal - Add/Edit Moments */}
          {showMomentModal && (
            <FixedModal
              isOpen={showMomentModal}
              onClose={() => setShowMomentModal(false)}
              title={editingMoment ? '✏️ Edit Moment' : '💫 Create New Moment'}
              size="lg"
            >
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., First Debt Payment, Emergency Fund Milestone..."
                      value={newMoment.title}
                      onChange={(e) => setNewMoment({...newMoment, title: e.target.value})}
                      className="w-full bg-gradient-to-br from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all duration-300 placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-amber-500/50"
                      autoFocus
                    />
                  </div>

                  {/* Story */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Your Story *
                    </label>
                    <textarea
                      placeholder="Share the story behind this moment... How did it feel? What did you learn? Why is it meaningful?"
                      value={newMoment.story}
                      onChange={(e) => setNewMoment({...newMoment, story: e.target.value})}
                      rows={5}
                      className="w-full bg-gradient-to-br from-gray-700 to-gray-800 text-white px-4 py-4 rounded-xl border-2 border-gray-600 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all duration-300 placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-amber-500/50 resize-none leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Tip: Be specific! Future you will love reading this.
                    </p>
                  </div>

                  {/* Location & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Location (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Home, Coffee Shop, Bank..."
                        value={newMoment.location}
                        onChange={(e) => setNewMoment({...newMoment, location: e.target.value})}
                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newMoment.date}
                        onChange={(e) => setNewMoment({...newMoment, date: e.target.value})}
                        className="w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Achievement Toggle */}
                  <div className="flex items-center gap-3 bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                    <input
                      type="checkbox"
                      id="isAchievement"
                      checked={newMoment.isAchievement}
                      onChange={(e) => setNewMoment({...newMoment, isAchievement: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isAchievement" className="text-sm text-purple-200 font-medium cursor-pointer">
                      🏆 Mark as Achievement (shows special badge)
                    </label>
                  </div>

                  {/* Business Moment Info */}
                  {newMoment.linkedTransaction && (
                    <div className="bg-purple-900/30 border-2 border-purple-500/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        <h4 className="text-sm font-bold text-purple-300">💼 Business Moment</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Business</p>
                          <p className="text-white font-semibold">{newMoment.linkedTransaction.businessName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Amount</p>
                          <p className={`font-bold ${newMoment.linkedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {newMoment.linkedTransaction.type === 'income' ? '+' : '-'}${(parseFloat(newMoment.linkedTransaction.amount) || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-purple-200 mt-3">
                        ✨ This moment is linked to your business activity
                      </p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                    <p className="text-sm text-purple-200">
                      <strong>💫 What are Moments?</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Moments capture the emotional side of your financial journey. They're not just numbers - 
                      they're the stories of your growth, your wins, and your lessons learned. 
                      Years from now, you'll look back and remember not just what you achieved, but how it felt.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowMomentModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMoment}
                    disabled={!newMoment.title.trim() || !newMoment.story.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    {editingMoment ? 'Update Moment' : 'Create Moment'}
                  </button>
                </div>
            </FixedModal>
          )}
        </>
      )}

      {/* Card Editing Modals */}
      {editingCard && (
        <FixedModal
          isOpen={!!editingCard}
          onClose={() => {
            setEditingCard(null);
            setTempCardData({});
          }}
          title={`${t('modals.edit')} ${editingCard === 'financialFreedom' ? t('modals.financialFreedomGoal') :
                     editingCard === 'savingsRateTarget' ? t('modals.savingsRateTarget') :
                     editingCard === 'rainyDayFund' ? t('modals.rainyDayFund') :
                     editingCard === 'creditScore' ? t('modals.creditScore') :
                     editingCard === 'netWorth' ? t('modals.netWorth') :
                     editingCard === 'cashOnHand' ? t('modals.survivalRunway') :
                     editingCard === 'debt' ? t('modals.debtManagement') :
                     editingCard === 'registeredAccounts' ? t('modals.registeredAccounts') :
                     editingCard === 'goals' ? t('modals.financialGoals') : editingCard}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Financial Freedom Goal Modal */}
              {editingCard === 'financialFreedom' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Target Amount</label>
                      <input
                        type="number"
                        value={tempCardData.targetAmount || ''}
                        onChange={(e) => setTempCardData({...tempCardData, targetAmount: e.target.value})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Current Investments</label>
                      <input
                        type="number"
                        value={tempCardData.currentInvestments || ''}
                        onChange={(e) => setTempCardData({...tempCardData, currentInvestments: e.target.value})}
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
                        onChange={(e) => setTempCardData({...tempCardData, monthlyContribution: e.target.value})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Annual Return %</label>
                      <input
                        type="number"
                        value={tempCardData.annualReturn || ''}
                        onChange={(e) => setTempCardData({...tempCardData, annualReturn: e.target.value})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Survival Runway Modal */}
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
                        {t('dashboard.addTransaction')}
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
                                  updatedAccounts[index] = {...account, balance: e.target.value};
                                  const newTotal = updatedAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
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
                        Total Cash on Hand: ${((parseFloat(tempCardData.total) || 0)).toLocaleString()}
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
                            initialDebt: 0,
                            amountPaid: 0,
                            interestRate: 0,
                            minPayment: 0,
                            dueDate: new Date().getDate(), // Default to current day of month
                            notificationsEnabled: true,
                            notificationDays: 3 // Default to 3 days before
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
                        {t('dashboard.addTransaction')}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {((tempCardData && tempCardData.accounts) || []).map((account, index) => (
                        <div key={account.id} className="bg-gray-700/50 rounded-lg p-3 border border-red-600/20">
                          <div className="space-y-3">
                            {/* First Row: Name and Balance */}
                          <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-4">
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
                              <div className="col-span-4">
                                <label className="block text-xs text-gray-400 mb-1">
                                  Current Balance
                                  {account.balance === 0 && (
                                    <span className="ml-2 text-green-400 font-bold">🎉 PAID OFF!</span>
                                  )}
                                </label>
                              <input
                                type="number"
                                placeholder="10000"
                                value={account.balance === 0 ? '0' : (account.balance || '')}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                    const currentBalance = e.target.value;
                                    const initialDebt = Number(account.initialDebt || 0);
                                    const amountPaid = Math.max(0, initialDebt - Number(currentBalance || 0));
                                    updatedAccounts[index] = {...account, balance: currentBalance, amountPaid};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                  
                                  // 🎉 CELEBRATE DEBT PAYOFF!
                                  if (currentBalance === 0 && account.balance > 0) {
                                    // Award XP for paying off debt
                                    if (userId) {
                                      awardXp(db, userId, 50).then(result => {
                                        if (result?.rankUp && result.newRank) {
                                          const prev = getRankFromXp((result.totalXp || 0) - 50);
                                          setRankUpData({ 
                                            newRank: result.newRank, 
                                            oldRank: prev.current, 
                                            xpGained: 50, 
                                            action: 'debt payoff' 
                                          });
                                          setShowRankUpModal(true);
                                        }
                                      }).catch(e => console.warn('XP award failed (debt payoff)', e));
                                    }
                                    
                                    // Show celebration notification
                                    showNotification('🎉 DEBT PAID OFF! You earned 50 XP!', 'success');
                                  }
                                }}
                                className={`w-full px-2 py-1 rounded text-sm border focus:outline-none ${
                                  account.balance === 0 
                                    ? 'bg-green-600/20 text-green-400 border-green-500 focus:border-green-400' 
                                    : 'bg-gray-600 text-white border-gray-500 focus:border-red-500'
                                }`}
                              />
                            </div>
                              <div className="col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">APR %</label>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="19.9"
                                value={account.interestRate === 0 ? '0' : (account.interestRate || '')}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, interestRate: e.target.value};
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
                            
                            {/* Second Row: Initial Debt and Min Payment */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-3">
                                <label className="block text-xs text-gray-400 mb-1">Initial Debt Amount</label>
                                <input
                                  type="number"
                                  placeholder="15000"
                                  value={account.initialDebt === 0 ? '0' : (account.initialDebt || '')}
                                  onChange={(e) => {
                                    const currentData = tempCardData || {};
                                    const updatedAccounts = [...(currentData.accounts || [])];
                                    const initialDebt = e.target.value;
                                    const currentBalance = Number(account.balance || 0);
                                    const amountPaid = Math.max(0, Number(initialDebt || 0) - currentBalance);
                                    updatedAccounts[index] = {...account, initialDebt, amountPaid};
                                    setTempCardData({...currentData, accounts: updatedAccounts});
                                  }}
                                  className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                                />
                              </div>
                              <div className="col-span-3">
                                <label className="block text-xs text-gray-400 mb-1">Amount Paid (Auto-calculated)</label>
                                <div className="w-full bg-gray-700 text-green-400 px-2 py-1 rounded text-sm border border-gray-500 flex items-center justify-between">
                                  <span>${((parseFloat(account.initialDebt) || 0) - (parseFloat(account.balance) || 0)).toLocaleString()}</span>
                                  <span className="text-xs text-gray-400">Auto</span>
                                </div>
                              </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">Min Payment</label>
                              <input
                                type="number"
                                placeholder="200"
                                value={account.minPayment === 0 ? '0' : (account.minPayment || '')}
                                onChange={(e) => {
                                  const currentData = tempCardData || {};
                                  const updatedAccounts = [...(currentData.accounts || [])];
                                  updatedAccounts[index] = {...account, minPayment: e.target.value};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                              <div className="col-span-3">
                                <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                                <div className="relative calendar-container">
                                  <input
                                    type="text"
                                    readOnly
                                    value={(() => {
                                      const dueDay = account.dueDate || 1;
                                      const today = new Date();
                                      const currentYear = today.getFullYear();
                                      const currentMonth = today.getMonth();
                                      const date = new Date(currentYear, currentMonth, dueDay);
                                      return date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      });
                                    })()}
                                    onClick={() => {
                                      // Toggle calendar visibility for this account
                                      const currentData = tempCardData || {};
                                      const updatedAccounts = [...(currentData.accounts || [])];
                                      updatedAccounts[index] = {...account, showCalendar: !account.showCalendar};
                                      setTempCardData({...currentData, accounts: updatedAccounts});
                                    }}
                                    className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none cursor-pointer"
                                    placeholder="Select due date"
                                  />
                                  
                                  {/* Custom Calendar */}
                                  {account.showCalendar && (
                                    <div className="absolute top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-4 w-[280px] xs:w-[320px] transform -translate-x-1/2 left-1/2 sm:left-auto sm:right-0 sm:transform-none sm:w-[320px]">
                                      <div className="flex justify-between items-center mb-3">
                              <button
                                onClick={() => {
                                  const currentData = tempCardData || {};
                                            const updatedAccounts = [...(currentData.accounts || [])];
                                            const currentDate = new Date(account.calendarYear || new Date().getFullYear(), (account.calendarMonth || new Date().getMonth()) - 1);
                                            updatedAccounts[index] = {...account, calendarYear: currentDate.getFullYear(), calendarMonth: currentDate.getMonth()};
                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                }}
                                          className="text-gray-400 hover:text-white p-1"
                                        >
                                          ?��
                                        </button>
                                        <span className="text-white font-semibold">
                                          {new Date(account.calendarYear || new Date().getFullYear(), (account.calendarMonth || new Date().getMonth())).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const currentData = tempCardData || {};
                                            const updatedAccounts = [...(currentData.accounts || [])];
                                            const currentDate = new Date(account.calendarYear || new Date().getFullYear(), (account.calendarMonth || new Date().getMonth()) + 1);
                                            updatedAccounts[index] = {...account, calendarYear: currentDate.getFullYear(), calendarMonth: currentDate.getMonth()};
                                            setTempCardData({...currentData, accounts: updatedAccounts});
                                          }}
                                          className="text-gray-400 hover:text-white p-1"
                                        >
                                          ?��
                              </button>
                            </div>
                                      
                                      {/* Calendar Grid */}
                                      <div className="grid grid-cols-7 gap-1 text-xs">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                          <div key={day} className="text-gray-400 text-center p-2 font-semibold">{day}</div>
                                        ))}
                                        
                                        {(() => {
                                          const year = account.calendarYear || new Date().getFullYear();
                                          const month = account.calendarMonth || new Date().getMonth();
                                          const firstDay = new Date(year, month, 1);
                                          const lastDay = new Date(year, month + 1, 0);
                                          const daysInMonth = lastDay.getDate();
                                          const startingDayOfWeek = firstDay.getDay();
                                          
                                          const days = [];
                                          
                                          // Empty cells for days before the first day of the month
                                          for (let i = 0; i < startingDayOfWeek; i++) {
                                            days.push(<div key={`empty-${i}`} className="p-2"></div>);
                                          }
                                          
                                          // Days of the month
                                          for (let day = 1; day <= daysInMonth; day++) {
                                            const isSelected = day === account.dueDate;
                                            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                            
                                            days.push(
                                              <button
                                                key={day}
                                                onClick={() => {
                                                  const currentData = tempCardData || {};
                                                  const updatedAccounts = [...(currentData.accounts || [])];
                                                  updatedAccounts[index] = {...account, dueDate: day, showCalendar: false};
                                                  setTempCardData({...currentData, accounts: updatedAccounts});
                                                }}
                                                className={`p-2 rounded text-sm transition-colors ${
                                                  isSelected 
                                                    ? 'bg-red-600 text-white' 
                                                    : isToday 
                                                      ? 'bg-gray-600 text-white' 
                                                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                              >
                                                {day}
                                              </button>
                                            );
                                          }
                                          
                                          return days;
                                        })()}
                                      </div>
                                      
                                      {/* Quick Actions */}
                                      <div className="mt-3 pt-3 border-t border-gray-600">
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => {
                                              const currentData = tempCardData || {};
                                              const updatedAccounts = [...(currentData.accounts || [])];
                                              updatedAccounts[index] = {...account, dueDate: 1, showCalendar: false};
                                              setTempCardData({...currentData, accounts: updatedAccounts});
                                            }}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                                          >
                                            1st
                                          </button>
                                          <button
                                            onClick={() => {
                                              const currentData = tempCardData || {};
                                              const updatedAccounts = [...(currentData.accounts || [])];
                                              updatedAccounts[index] = {...account, dueDate: 15, showCalendar: false};
                                              setTempCardData({...currentData, accounts: updatedAccounts});
                                            }}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                                          >
                                            15th
                                          </button>
                                          <button
                                            onClick={() => {
                                              const currentData = tempCardData || {};
                                              const updatedAccounts = [...(currentData.accounts || [])];
                                              updatedAccounts[index] = {...account, dueDate: 30, showCalendar: false};
                                              setTempCardData({...currentData, accounts: updatedAccounts});
                                            }}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                                          >
                                            30th
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Third Row: Notification Settings */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-6">
                                <label className="block text-xs text-gray-400 mb-1">Payment Reminders</label>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input
                                      type="checkbox"
                                      checked={account.notificationsEnabled !== false}
                                      onChange={(e) => {
                                        const currentData = tempCardData || {};
                                        const updatedAccounts = [...(currentData.accounts || [])];
                                        updatedAccounts[index] = {...account, notificationsEnabled: e.target.checked};
                                        setTempCardData({...currentData, accounts: updatedAccounts});
                                      }}
                                      className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500 focus:ring-2"
                                    />
                                    Enable notifications
                                  </label>
                                </div>
                              </div>
                              <div className="col-span-6">
                                <label className="block text-xs text-gray-400 mb-1">Remind me</label>
                                <select
                                  value={account.notificationDays || 3}
                                  onChange={(e) => {
                                    const currentData = tempCardData || {};
                                    const updatedAccounts = [...(currentData.accounts || [])];
                                    updatedAccounts[index] = {...account, notificationDays: Number(e.target.value)};
                                    setTempCardData({...currentData, accounts: updatedAccounts});
                                  }}
                                  disabled={account.notificationsEnabled === false}
                                  className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value={1}>1 day before</option>
                                  <option value={3}>3 days before</option>
                                  <option value={7}>1 week before</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Progress Bar for this debt */}
                            {(account.initialDebt || 0) > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>Progress: ${((parseFloat(account.amountPaid) || 0)).toLocaleString()} paid of ${((parseFloat(account.initialDebt) || 0)).toLocaleString()}</span>
                                  <span>{Math.round(((account.amountPaid || 0) / (account.initialDebt || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, ((account.amountPaid || 0) / (account.initialDebt || 1)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-red-400 font-semibold">
                            Current Debt: ${((tempCardData && tempCardData.accounts) || []).reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-green-400 font-semibold">
                            Total Paid: ${((tempCardData && tempCardData.accounts) || []).reduce((sum, acc) => sum + (parseFloat(acc.amountPaid) || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-orange-400 font-semibold">
                            Min Payment: ${((tempCardData && tempCardData.accounts) || []).reduce((sum, acc) => sum + (parseFloat(acc.minPayment) || 0), 0).toLocaleString()}/mo
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
                      onChange={(e) => setTempCardData({...tempCardData, target: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 50"
                      min="0"
                      max="100"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      <div className="grid grid-cols-1 gap-1">
                        <div>💡 <strong>Common targets:</strong></div>
                        <div>?�� 20% - Traditional advice</div>
                        <div>?�� 30-40% - Aggressive saving</div>
                        <div>?�� 50%+ - FIRE/Early retirement</div>
                        <div>?�� 60%+ - Digital nomad lifestyle</div>
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
                      onChange={(e) => setTempCardData({...tempCardData, total: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Goal Amount</label>
                    <input
                      type="number"
                      value={tempCardData.goal || ''}
                      onChange={(e) => setTempCardData({...tempCardData, goal: e.target.value})}
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
                      <h4 className="text-lg font-semibold text-white">{t('dashboard.addTransaction')} New Credit Score</h4>
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
                          onChange={(e) => setTempCardData({...tempCardData, newScore: e.target.value})}
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
                          className="w-full max-w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                          style={{ maxWidth: '100%' }}
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
                      {t('dashboard.addTransaction')}
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
                          {t('dashboard.addTransaction')}
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
                          {t('dashboard.addTransaction')}
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
                                  const value = e.target.value;
                                  updatedBreakdown[index] = {
                                    ...item, 
                                    value: item.type === 'liability' ? -Number(value || 0) : Number(value || 0)
                                  };
                                  const newTotal = updatedBreakdown.reduce((sum, b) => sum + Number(b.value || 0), 0);
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
                          {t('dashboard.noAssetsLiabilitiesYet')}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-emerald-900/20 rounded-lg border border-emerald-600/30">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 font-semibold">Total Net Worth:</span>
                        <span className="text-2xl font-bold text-white">
                          ${((parseFloat(tempCardData.total) || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Assets: ${((tempCardData.breakdown || []).filter(item => item.type === "asset").reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0)).toLocaleString()} 💰 
                        Liabilities: ${Math.abs((tempCardData.breakdown || []).filter(item => item.type === "liability").reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0)).toLocaleString()}
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
                    <h3 className="text-lg font-semibold text-amber-400">Manage Retirement Accounts</h3>
                    <button
                      onClick={() => {
                        const newAccount = {
                          id: `account_${Date.now()}`,
                          name: t('dashboard.addTransaction') + ' Account',
                          contributed: 0,
                          limit: 0,
                          goal: 0,
                          type: 'tax-free',
                          description: 'Custom retirement account'
                        };
                        setTempCardData({
                          ...tempCardData,
                          accounts: [...(tempCardData.accounts || []), newAccount]
                        });
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('dashboard.addTransaction')}
                    </button>
                  </div>

                  {(!tempCardData.accounts || tempCardData.accounts.length === 0) ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                          <Wallet className="w-8 h-8 text-amber-400" />
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
                                goal: 10000,
                                type: 'tax-free',
                                description: 'Tax-Free Savings Account'
                              },
                              {
                                id: 'rrsp_default', 
                                name: 'RRSP',
                                contributed: 25000,
                                limit: 31560,
                                goal: 5000,
                                type: 'tax-deferred',
                                description: 'Registered Retirement Savings Plan'
                              }
                            ]
                          });
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
                      >
                        {t('dashboard.addTransaction')} Default Accounts (TFSA & RRSP)
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tempCardData.accounts.map((account, index) => {
                        return (
                          <div key={account.id} className="bg-slate-800/50 rounded-lg p-4 border-2 border-slate-700/50 hover:border-amber-500/40 transition-all relative">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <label className="block text-xs text-amber-400/70 mb-1">Account Name (Click to edit)</label>
                                <input
                                  type="text"
                                  value={account.name}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], name: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  placeholder="e.g., TFSA, RRSP, 401(k)..."
                                  className="text-lg font-semibold text-amber-400 bg-slate-900/50 border border-amber-500/20 outline-none focus:border-amber-500 focus:bg-slate-900 rounded px-3 py-2 w-full transition-all"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const updated = tempCardData.accounts.filter((_, i) => i !== index);
                                  setTempCardData({ ...tempCardData, accounts: updated });
                                }}
                                className="text-red-400 hover:text-red-300 p-1 ml-2"
                                title="Delete Account"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Current Balance</label>
                                <input
                                  type="number"
                                  value={account.contributed === 0 ? '0' : (account.contributed || '')}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], contributed: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-slate-700 focus:border-amber-500 focus:outline-none transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Contribution Limit</label>
                                <input
                                  type="number"
                                  value={account.limit === 0 ? '0' : (account.limit || '')}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], limit: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-slate-700 focus:border-amber-500 focus:outline-none transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Annual Goal (Optional)</label>
                                <input
                                  type="number"
                                  value={account.goal === 0 ? '0' : (account.goal || '')}
                                  onChange={(e) => {
                                    const updated = [...tempCardData.accounts];
                                    updated[index] = { ...updated[index], goal: e.target.value };
                                    setTempCardData({ ...tempCardData, accounts: updated });
                                  }}
                                  placeholder="e.g., 10000"
                                  className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-slate-700 focus:border-amber-500 focus:outline-none transition-all"
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
                                  className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-slate-700 focus:border-amber-500 focus:outline-none transition-all"
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
                                  placeholder="e.g., Tax-free growth..."
                                  className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-slate-700 focus:border-amber-500 focus:outline-none transition-all"
                                />
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                  <span>Contribution Room Used</span>
                                  <span>{Math.round((account.contributed / account.limit) * 100) || 0}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((account.contributed / account.limit) * 100, 100) || 0}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Account Type Badge */}
                              <div className="flex justify-center">
                                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-600/30 font-semibold">
                                  {account.type === 'tax-free' && '💰 Tax-Free'}
                                  {account.type === 'tax-deferred' && '📊 Tax-Deferred'}
                                  {account.type === 'pension' && '🏛️ Pension'}
                                  {account.type === 'savings' && '💵 Savings'}
                                </span>
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
                    <h4 className="text-lg font-semibold text-white">
                      Financial Goals
                    </h4>
                    <button
                      onClick={() => {
                        const newGoal = {
                          id: Date.now(),
                          name: '',
                          targetAmount: 0,
                          currentAmount: 0,
                          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
                        };
                        setTempCardData([...(tempCardData || []), newGoal]);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {t('dashboard.addYourFirstGoal')}
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(tempCardData || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('dashboard.noFinancialGoalsYet')}</p>
                        <p className="text-sm">{t('dashboard.clickAddGoalToCreateFirst')}</p>
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
                                value={goal.targetAmount === 0 ? '0' : (goal.targetAmount || '')}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, targetAmount: e.target.value};
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
                                value={goal.currentAmount === 0 ? '0' : (goal.currentAmount || '')}
                                onChange={(e) => {
                                  const updatedGoals = [...tempCardData];
                                  updatedGoals[index] = {...goal, currentAmount: e.target.value};
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
                                className="w-full max-w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-amber-400 focus:outline-none"
                                style={{ maxWidth: '100%' }}
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
                                <span>${(parseFloat(goal.currentAmount) || 0).toLocaleString()}</span>
                                <span>${(parseFloat(goal.targetAmount) || 0).toLocaleString()}</span>
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
                onClick={() => {
                  setEditingCard(null);
                  setTempCardData({});
                }}
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
        </FixedModal>
      )}

      {/* Reset Data Modal */}
      {showResetModal && (
        <FixedModal
          isOpen={showResetModal}
          onClose={closeResetModal}
          title="🔄 Reset Dashboard Data"
          size="md"
        >
          <div className="space-y-4">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-600/30">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">{t('common.warningDataReset')}</h4>
                    <p className="text-sm text-gray-300">
                      {t('common.resetDataWarning')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-medium">{t('common.resetOptions')}:</h5>
                
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 border-2 border-transparent data-[checked=true]:border-blue-500">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetType === 'financial-only'}
                      onChange={() => setResetType('financial-only')}
                      className="mt-1 text-blue-400"
                    />
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        💰 {t('common.financialDataOnly')}
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{t('common.recommended')}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {t('common.resetFinancialDataDescription')}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetType === 'sample-financial'}
                      onChange={() => setResetType('sample-financial')}
                      className="mt-1 text-amber-400"
                    />
                    <div>
                      <div className="text-white font-medium">📊 Sample Financial Data (FREE tier safe)</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Example transactions & dashboard only. No phantom data. Perfect for learning!
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetType === 'whole-app'}
                      onChange={() => setResetType('whole-app')}
                      className="mt-1 text-red-400"
                    />
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        🗑️ Reset Whole App
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Nuclear</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Clear EVERYTHING - all data, moments, businesses, travel, logbook. Complete fresh start.
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
                  className="w-full max-w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-red-400 focus:outline-none"
                  style={{ maxWidth: '100%' }}
                />
                <p className="text-xs text-gray-400">
                  This will be your financial tracking start date
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3">
                <h5 className="text-white font-medium mb-2">
                  {resetType === 'financial-only' && '💰 Will Reset:'}
                  {resetType === 'sample-financial' && '📊 Will Load:'}
                  {resetType === 'whole-app' && '🗑️ Will Delete:'}
                </h5>
                <div className="text-sm space-y-1 text-gray-300">
                  {resetType === 'financial-only' && (
                    <>
                      <div>?�� Transactions & recurring expenses</div>
                      <div>?�� Dashboard cards (cash, debt, goals)</div>
                      <div>?�� Financial metrics & history</div>
                      <div className="text-green-400 mt-2">? KEEPS: Moments, logbook, businesses, travel, investments</div>
                      <div className="text-green-400">? KEEPS: Your XP and rank!</div>
                    </>
                  )}
                  {resetType === 'sample-financial' && (
                    <>
                      <div>?�� Sample transactions (last month)</div>
                      <div>?�� Sample dashboard data</div>
                      <div>?�� Example financial metrics</div>
                      <div className="text-green-400 mt-2">? KEEPS: Moments, logbook</div>
                      <div className="text-amber-400">?��️ RESETS: XP to 0</div>
                    </>
                  )}
                  {resetType === 'whole-app' && (
                    <>
                      <div>?�� All transactions & financial data</div>
                      <div>?�� Investment portfolio & holdings</div>
                      <div>?�� Business income/expense records</div>
                      <div>?�� All moments & logbook entries</div>
                      <div>?�� Travel plans & journal</div>
                      <div>?�� Dashboard metrics & history</div>
                      <div className="text-red-400 mt-2">?��️ DELETES: EVERYTHING!</div>
                      <div className="text-red-400">?��️ RESETS: XP to 0</div>
                    </>
                  )}
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
        </FixedModal>
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
              <h3 className="text-lg font-semibold text-white mb-1">
                <a href="https://survivebackpacking.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-400 transition-colors">
                  Survive Backpacking
                </a>
              </h3>
              <p className="text-gray-400 text-sm">{t('auth.welcomeMessage')}</p>
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
                © {new Date().getFullYear()} <a href="https://survivebackpacking.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Survive Backpacking</a>. All rights reserved.
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
        <HelpFAQ 
          onClose={() => setShowHelpFAQ(false)} 
          onOpenQuickStart={() => {
            setForceShowQuickStart(true);
            setShowQuickStart(true);
            setShowHelpFAQ(false);
          }}
        />
      )}

      {/* 🆕 Quick Start Guide - Auto-shows for new users, accessible from Help menu */}
      {showQuickStart && (
        <QuickStartGuide 
          onClose={() => {
            setShowQuickStart(false);
            setForceShowQuickStart(false);
          }}
          forceShow={forceShowQuickStart}
        />
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          currentPlan={userPlan}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSuccess={(message) => {
            setShowForgotPassword(false);
            showNotification(message, 'success');
          }}
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
              ?��
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <span className="text-green-400">?��</span>
              Admin: {devDemoMode ? 'demo@example.com' : user?.email}
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
                <option value={SUBSCRIPTION_TIERS.OPERATOR}>?��️ OPERATOR ($14.99/mo)</option>
                <option value={SUBSCRIPTION_TIERS.FOUNDERS_CIRCLE}>👑 FOUNDER'S CIRCLE ($7.49/mo)</option>
              </select>
            </div>
            
            {/* 🎭 DEMO MODE TOGGLE */}
            <div className="pt-3 border-t border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
                <input
                  type="checkbox"
                  checked={devDemoMode}
                  onChange={(e) => setDevDemoMode(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <div className="flex-1">
                  <span className="text-white font-semibold text-sm block">🎭 Demo Mode</span>
                  <span className="text-gray-400 text-xs">Hide real name & email</span>
                </div>
              </label>
              {devDemoMode && (
                <div className="mt-2 text-xs text-purple-400 bg-purple-500/10 rounded px-3 py-2">
                  ?�� Demo Mode ON: Shows "Demo User" & "demo@example.com"
                </div>
              )}
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
                    ?��️ Dev Override Active
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

      {/* 💬 FEEDBACK BUTTON - Moved to User Menu Dropdown (cleaner UX) */}

      {/* 💬 FEEDBACK MODAL */}
      {showFeedbackModal && (
        <FixedModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title="💬 Send Feedback"
          size="md"
        >
          <div className="space-y-4">
              {/* Type Selector */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFeedbackType('bug');
                    setFeedbackData({...feedbackData, type: 'bug'});
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                    feedbackType === 'bug' 
                      ? 'bg-red-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Bug className="w-5 h-5" />
                  Report Bug
                </button>
                <button
                  onClick={() => {
                    setFeedbackType('feature');
                    setFeedbackData({...feedbackData, type: 'feature'});
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                    feedbackType === 'feature' 
                      ? 'bg-amber-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  Request Feature
                </button>
              </div>

              {/* Info Box */}
              <div className={`rounded-lg p-4 border ${
                feedbackType === 'bug' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-amber-900/20 border-amber-500/30'
              }`}>
                <p className={`text-sm ${
                  feedbackType === 'bug' ? 'text-red-300' : 'text-amber-300'
                }`}>
                  {feedbackType === 'bug' 
                    ? '🐛 Found a bug? Let us know! We\'ll fix it ASAP.' 
                    : '💡 Have an idea? We\'d love to hear it! Your feedback shapes the future of Kompul.'}
                </p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  {feedbackType === 'bug' ? 'Describe the bug:' : 'Describe your feature idea:'}
                </label>
                <textarea
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                  placeholder={feedbackType === 'bug' 
                    ? 'What happened? What did you expect to happen?' 
                    : 'What feature would you like to see? How would it help you?'}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] resize-none"
                  rows="5"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Your Email (for follow-up):
                </label>
                <input
                  type="email"
                  value={feedbackData.email}
                  onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Current Page Info */}
              <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Current Page:</span>
                  <span className="text-blue-400 font-semibold">{activeTab}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Your Plan:</span>
                  <span className="text-amber-400 font-semibold">{currentUserPlan}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className={`px-6 py-3 rounded-lg transition-all font-semibold flex items-center gap-2 ${
                  feedbackType === 'bug'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                } hover:scale-105 shadow-lg`}
              >
                <Send className="w-4 h-4" />
                Send {feedbackType === 'bug' ? 'Bug Report' : 'Feature Request'}
              </button>
            </div>
        </FixedModal>
      )}

      {/* 🎖️ RANK-UP CELEBRATION MODAL */}
      <RankUpModal
        isOpen={showRankUpModal}
        onClose={() => setShowRankUpModal(false)}
        newRank={rankUpData?.newRank}
        oldRank={rankUpData?.oldRank}
        xpGained={rankUpData?.xpGained}
      />

      {/* 📓 FREEDOM JOURNAL MODAL */}
      {showJournalModal && selectedTripForJournal && (
        <FixedModal
          isOpen={showJournalModal}
          onClose={handleCloseJournal}
          title={`📓 Freedom Journal - ${selectedTripForJournal.name}`}
          size="lg"
        >
          <div className="max-h-[70vh] overflow-y-auto">
                <button
                  onClick={handleCloseJournal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <FreedomJournal
                trip={selectedTripForJournal}
                onSaveEntry={handleSaveJournalEntry}
                onClose={handleCloseJournal}
              />
        </FixedModal>
      )}

      {/* 🎯 MISSION COMPLETE MODAL */}
      {showMissionCompleteModal && completedTrip && (
        <MissionCompleteModal
          trip={completedTrip}
          onClose={() => setShowMissionCompleteModal(false)}
          onOpenJournal={() => handleOpenJournal(completedTrip)}
        />
      )}

      {/* 🛡️ DATA RECOVERY MODAL */}
      {showDataRecoveryModal && (
        <FixedModal
          isOpen={showDataRecoveryModal}
          onClose={() => setShowDataRecoveryModal(false)}
          title="🛡️ Data Recovery"
          size="lg"
        >
          <div className="space-y-4">
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400">?��️</span>
                    <span className="font-semibold text-amber-400">{t('common.recoveryWarning')}</span>
                  </div>
                  <p className="text-sm text-amber-200">
                    This will restore your data from a backup. Your current data will be replaced. 
                    A backup of your current data will be created before restoration.
                  </p>
                </div>

                {userBackups.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Available Backups:</h4>
                    {userBackups.map((backup) => (
                      <div key={backup.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">
                              {new Date(backup.backupDate).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400">
                              Type: {backup.backupType} ?�� ID: {backup.id}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDataRecovery(backup.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No backups available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Backups are created automatically before data operations
                    </p>
                  </div>
                )}
              </div>
        </FixedModal>
      )}

      {/* 🛡️ DATA IMPORT MODAL */}
      {showDataImportModal && (
        <FixedModal
          isOpen={showDataImportModal}
          onClose={() => setShowDataImportModal(false)}
          title="🛡️ Import Data"
          size="lg"
        >
          <div className="space-y-4">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400">?��️</span>
                    <span className="font-semibold text-blue-400">Import Information</span>
                  </div>
                  <p className="text-sm text-blue-200">
                    Select a backup file to restore your data. Your current data will be backed up before import.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleDataImport(file);
                      }
                    }}
                    className="hidden"
                    id="data-import-file"
                  />
                  <label
                    htmlFor="data-import-file"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Click to select backup file</p>
                      <p className="text-sm text-gray-400">JSON format only</p>
                    </div>
                  </label>
                </div>
              </div>
        </FixedModal>
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


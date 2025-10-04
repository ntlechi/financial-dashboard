import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Building, LayoutDashboard, Calculator, Briefcase, Target, PiggyBank, Umbrella, ShieldCheck, Calendar, Plus, X, Edit, Trash2, CreditCard, BarChart3, PieChart, Repeat, Wallet, AlertTriangle, Crown, Save, HelpCircle } from 'lucide-react';
import * as d3 from 'd3';
import SubscriptionManager from './SubscriptionManager';
import UpgradePrompt from './components/UpgradePrompt';
import FounderCircleOffer from './components/FounderCircleOffer';
import { hasFeatureAccess, hasDashboardCardAccess, getUserPlan } from './utils/featureAccess';

// Firebase Imports
import { db, auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const appId = process.env.REACT_APP_FIREBASE_APP_ID;

// Retirement accounts are now fully user-editable - no need for country configs!

const initialData = {
  financialFreedom: {
    targetAmount: 2000000,
    currentInvestments: 450000,
    monthlyContribution: 1500,
    annualReturn: 7,
  },
  creditScore: {
    current: 750,
    history: [ { date: '2025-06-30', score: 720 }, { date: '2025-08-09', score: 750 } ]
  },
  cashOnHand: {
    total: 75000,
    accounts: [
        { id: 1, name: 'CIBC Chequing', balance: 15000, type: 'Checking' },
        { id: 2, name: 'Tangerine Savings', balance: 45000, type: 'Savings' },
        { id: 3, name: 'Wealthsimple Cash', balance: 15000, type: 'Investment Cash' },
    ],
    history: [ { date: '2025-08-09', total: 75000 } ]
  },
  registeredAccounts: {
    tfsa: {
      currentBalance: 45000,
      contributionRoom: 88000,
      contributionLimit: 95000,
      annualContributionLimit: 7000,
      withdrawals: 0,
      contributionsThisYear: 7000
    },
    rrsp: {
      currentBalance: 85000,
      contributionRoom: 42000,
      contributionLimit: 127000,
      annualContributionLimit: 31560, // 18% of income up to max
      contributionsThisYear: 15000,
      carryForward: 8500
    }
  },
  rainyDayFund: {
    total: 20000,
    goal: 30000,
    accounts: [
        { id: 1, name: 'Emergency Fund', balance: 20000 }
    ],
    history: [ { date: '2025-08-09', total: 20000 } ]
  },
  debt: {
    total: 45000,
    accounts: [
        { id: 1, name: 'Visa Card', balance: 5000, interestRate: 19.99, minPayment: 100 },
        { id: 2, name: 'Mastercard', balance: 10000, interestRate: 22.99, minPayment: 200 },
        { id: 3, name: 'Line of Credit', balance: 30000, interestRate: 8.5, minPayment: 300 },
    ],
    history: [
        { date: '2025-06-30', total: 50000 },
        { date: '2025-07-31', total: 48000 },
        { date: '2025-08-09', total: 45000 },
    ]
  },
  netWorth: { 
    total: 550000, 
    breakdown: [
      { id: 1, name: 'Cash', value: 75000, color: 'bg-sky-500', type: 'asset' },
      { id: 2, name: 'Investments', value: 350000, color: 'bg-violet-500', type: 'asset' },
      { id: 3, name: 'Real Estate', value: 250000, color: 'bg-emerald-500', type: 'asset' },
      { id: 4, name: 'Liabilities', value: -125000, color: 'bg-red-500', type: 'liability' },
    ],
    history: [ { date: '2025-08-09', total: 550000 } ]
  },
  income: { 
    total: 12500, 
    sources: [
      { id: 1, name: 'Main Job', amount: 8000, type: 'active' },
      { id: 2, name: 'Trading', amount: 2500, type: 'passive' },
      { id: 3, name: 'Side Business', amount: 2000, type: 'passive' },
    ]
  },
  expenses: { 
    total: 6500, 
    categories: [
      { id: 1, name: 'Housing', amount: 2500, color: 'bg-red-500' },
      { id: 2, name: 'Transport', amount: 800, color: 'bg-yellow-500' },
      { id: 3, name: 'Food', amount: 1200, color: 'bg-green-500' },
      { id: 4, name: 'Entertainment', amount: 1000, color: 'bg-purple-500' },
      { id: 5, name: 'Other', amount: 1000, color: 'bg-gray-400' },
    ]
  },
  cashflow: { total: 6000 },
  savingsRate: { 
    current: 48, // 48% savings rate
    target: 50,
    monthly: 6000,
    monthlyIncome: 12500
  },
  goals: [
    { id: 1, name: 'House Down Payment', targetAmount: 75000, currentAmount: 25000, targetDate: '2025-12-31' },
    { id: 2, name: 'New Car', targetAmount: 40000, currentAmount: 10000, targetDate: '2026-06-30' },
    { id: 3, name: 'Vacation Fund', targetAmount: 15000, currentAmount: 5000, targetDate: '2025-09-15' },
  ],
  businesses: [
    {
      id: 1,
      name: "Trading Business",
      description: "Stock and crypto trading",
      startDate: "2024-01-01",
      totalIncome: 15000,
      totalExpenses: 2500,
      netProfit: 12500,
      incomeItems: [
        { id: 1, description: "Q4 Trading Profits", amount: 8000, date: "2025-01-10" },
        { id: 2, description: "Crypto Gains", amount: 4500, date: "2025-01-08" },
        { id: 3, description: "Dividend Income", amount: 2500, date: "2025-01-05" }
      ],
      expenseItems: [
        { id: 1, description: "Trading Platform Fees", amount: 1200, date: "2025-01-12" },
        { id: 2, description: "Market Data Subscription", amount: 800, date: "2025-01-01" },
        { id: 3, description: "Tax Preparation", amount: 500, date: "2025-01-15" }
      ]
    },
    {
      id: 2,
      name: "Consulting Services",
      description: "Tech consulting and advisory",
      startDate: "2023-06-01",
      totalIncome: 25000,
      totalExpenses: 3500,
      netProfit: 21500,
      incomeItems: [
        { id: 1, description: "Client A - Project Completion", amount: 15000, date: "2025-01-14" },
        { id: 2, description: "Client B - Monthly Retainer", amount: 5000, date: "2025-01-01" },
        { id: 3, description: "Client C - Strategy Session", amount: 5000, date: "2025-01-07" }
      ],
      expenseItems: [
        { id: 1, description: "Business License Renewal", amount: 1500, date: "2025-01-03" },
        { id: 2, description: "Professional Development", amount: 1200, date: "2025-01-11" },
        { id: 3, description: "Office Supplies", amount: 800, date: "2025-01-09" }
      ]
    }
  ],
  investments: {
    totalValue: 270000, // Calculated: VTI (1200 * 225) = 270,000
    portfolioAllocation: [
      { id: 1, name: 'Stocks', value: 270000, percentage: 60, color: '#3B82F6' },
      { id: 2, name: 'Bonds', value: 90000, percentage: 20, color: '#10B981' },
      { id: 3, name: 'Real Estate', value: 45000, percentage: 10, color: '#F59E0B' },
      { id: 4, name: 'Crypto', value: 45000, percentage: 10, color: '#8B5CF6' }
    ],
    holdings: [
      {
        id: 1,
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        shares: 1200,
        avgCost: 180.50,
        currentPrice: 225.00,
        totalValue: 270000, // 1200 * 225 = 270000 ✅
        dividendYield: 1.8,
        annualDividend: 4860,
        nextDividendDate: '2025-03-15',
        dripEnabled: true,
        dividendAccumulated: 1215,
        dripProgress: 27.0, // 27% towards next share
        accountType: 'RRSP',
        isUSStock: true,
        withholdingTax: 15, // US withholding tax for RRSP
        currency: 'USD'
      },
      {
        id: 2,
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        shares: 1125,
        avgCost: 75.00,
        currentPrice: 80.00,
        totalValue: 90000, // 1125 * 80 = 90000 ✅
        dividendYield: 4.2,
        annualDividend: 3780,
        nextDividendDate: '2025-02-28',
        dripEnabled: true,
        dividendAccumulated: 65,
        dripProgress: 81.3, // 81% towards next share
        accountType: 'TFSA',
        isUSStock: true,
        withholdingTax: 30, // US withholding tax for TFSA
        currency: 'USD'
      },
      {
        id: 3,
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        shares: 500,
        avgCost: 85.00,
        currentPrice: 90.00,
        totalValue: 45000, // 500 * 90 = 45000 ✅
        dividendYield: 3.5,
        annualDividend: 1575,
        nextDividendDate: '2025-03-20',
        dripEnabled: false,
        dividendAccumulated: 262,
        dripProgress: 0, // DRIP disabled
        accountType: 'Taxable',
        isUSStock: true,
        withholdingTax: 30, // US withholding tax for non-registered
        currency: 'USD'
      },
      {
        id: 4,
        symbol: 'BTC',
        name: 'Bitcoin',
        shares: 0.5,
        avgCost: 45000,
        currentPrice: 90000,
        totalValue: 45000, // 0.5 * 90000 = 45000 ✅
        dividendYield: 0,
        annualDividend: 0,
        nextDividendDate: null,
        dripEnabled: false,
        dividendAccumulated: 0,
        dripProgress: 0,
        accountType: 'Taxable',
        isUSStock: false,
        withholdingTax: 0, // No withholding tax on crypto
        currency: 'USD'
      }
    ]
  },
  registeredAccounts: {
    accounts: [
      {
        id: 'tfsa',
        name: 'TFSA',
        contributed: 45000,
        limit: 88000,
        goal: 88000,
        type: 'tax-free',
        description: 'Tax-free growth and withdrawals'
      },
      {
        id: 'rrsp', 
        name: 'RRSP',
        contributed: 25000,
        limit: 31560,
        goal: 31560,
        type: 'tax-deferred',
        description: 'Tax-deferred retirement savings'
      }
    ]
  },
  transactions: [
    { id: 1, date: '2025-01-15', description: 'Main Job Salary', amount: 8000, type: 'income', category: 'personal', subcategory: 'salary' },
    { id: 2, date: '2025-01-15', description: 'Rent Payment', amount: -2500, type: 'expense', category: 'personal', subcategory: 'housing' },
    { id: 3, date: '2025-01-14', description: 'Trading Profit', amount: 2500, type: 'income', category: 'business', subcategory: 'trading' },
    { id: 4, date: '2025-01-13', description: 'Groceries', amount: -150, type: 'expense', category: 'personal', subcategory: 'food' },
    { id: 5, date: '2025-01-12', description: 'Side Business Revenue', amount: 2000, type: 'income', category: 'business', subcategory: 'consulting' },
    { id: 6, date: '2025-01-12', description: 'Software Subscription', amount: -100, type: 'expense', category: 'business', subcategory: 'software' },
    { id: 7, date: '2025-01-11', description: 'Gas Station', amount: -80, type: 'expense', category: 'personal', subcategory: 'transport' },
    { id: 8, date: '2025-01-10', description: 'Dividend Payment', amount: 500, type: 'income', category: 'personal', subcategory: 'investment' },
    { id: 9, date: '2025-01-10', description: 'Coffee Shop', amount: -15, type: 'expense', category: 'personal', subcategory: 'entertainment' },
    { id: 10, date: '2025-01-09', description: 'Business Lunch', amount: -75, type: 'expense', category: 'business', subcategory: 'meals' },
  ],
  monthlyHistory: [
    { 
      month: '2025-01', 
      netWorth: 550000, 
      income: 12500, 
      expenses: 6500, 
      cashflow: 6000, 
      businessIncome: 4500, 
      businessExpenses: 1000,
      investmentValue: 450000,
      savingsRate: 48
    },
    { 
      month: '2024-12', 
      netWorth: 535000, 
      income: 11800, 
      expenses: 6200, 
      cashflow: 5600, 
      businessIncome: 4200, 
      businessExpenses: 950,
      investmentValue: 445000,
      savingsRate: 47
    },
    { 
      month: '2024-11', 
      netWorth: 528000, 
      income: 12200, 
      expenses: 6400, 
      cashflow: 5800, 
      businessIncome: 4400, 
      businessExpenses: 1100,
      investmentValue: 440000,
      savingsRate: 48
    },
    { 
      month: '2024-10', 
      netWorth: 522000, 
      income: 11900, 
      expenses: 6300, 
      cashflow: 5600, 
      businessIncome: 4100, 
      businessExpenses: 980,
      investmentValue: 435000,
      savingsRate: 47
    },
    { 
      month: '2024-09', 
      netWorth: 515000, 
      income: 12000, 
      expenses: 6100, 
      cashflow: 5900, 
      businessIncome: 4300, 
      businessExpenses: 920,
      investmentValue: 425000,
      savingsRate: 49
    },
    { 
      month: '2024-08', 
      netWorth: 508000, 
      income: 11700, 
      expenses: 5900, 
      cashflow: 5800, 
      businessIncome: 4000, 
      businessExpenses: 850,
      investmentValue: 415000,
      savingsRate: 50
    }
  ],
  travel: {
    totalSavings: 85000,
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
    trips: [
      {
        id: 1,
        name: "Southeast Asia Adventure 2025",
        description: "3 months backpacking through Thailand, Vietnam, Cambodia",
        targetBudget: 45000,
        currentSavings: 32000,
        startDate: "2025-06-01",
        endDate: "2025-09-01",
        estimatedDailySpend: 500, // in CAD
        countries: ["Thailand", "Vietnam", "Cambodia"],
        status: "planning",
        expenses: [
          { id: 1, date: "2025-01-15", description: "Flight to Bangkok", amount: 1200, currency: "CAD", category: "transport" },
          { id: 2, date: "2025-01-10", description: "Travel Insurance", amount: 450, currency: "CAD", category: "insurance" }
        ]
      },
      {
        id: 2,
        name: "Colombia & Peru 2026",
        description: "6 weeks exploring South American culture and coffee",
        targetBudget: 28000,
        currentSavings: 8500,
        startDate: "2026-03-15",
        endDate: "2026-05-01",
        estimatedDailySpend: 350,
        countries: ["Colombia", "Peru"],
        status: "saving",
        expenses: []
      }
    ],
    runwayCalculation: {
      averageDailySpend: 425, // Average across all travel styles
      totalAvailableFunds: 85000,
      estimatedDaysRemaining: 200,
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
  }
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
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

// Financial Freedom Goal Card
const FinancialFreedomCard = ({ data, onEdit }) => {
  const progressPercentage = (data.currentInvestments / data.targetAmount) * 100;
  const monthsToGoal = data.monthlyContribution > 0 
    ? Math.ceil((data.targetAmount - data.currentInvestments) / data.monthlyContribution) 
    : 0;
  const yearsToGoal = Math.floor(monthsToGoal / 12);
  const remainingMonths = monthsToGoal % 12;

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-emerald-900/40 to-teal-900/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Target className="w-6 h-6 mr-3 text-emerald-400" />
          Financial Freedom Goal
        </h2>
        <button
          onClick={() => onEdit('financialFreedom', data)}
          className="text-gray-400 hover:text-emerald-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <span className="text-emerald-400 font-semibold">{progressPercentage.toFixed(1)}%</span>
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
            color="bg-emerald-500"
            height="h-3"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-emerald-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">${data.monthlyContribution.toLocaleString()}</div>
            <div className="text-xs text-emerald-400">Monthly Contribution</div>
          </div>
          <div className="bg-emerald-900/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {yearsToGoal}y {remainingMonths}m
            </div>
            <div className="text-xs text-emerald-400">Time to Goal</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Savings Rate Card
const SavingsRateCard = ({ data, onEdit }) => {
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
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <PiggyBank className="w-6 h-6 mr-3 text-blue-400" />
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
            className="text-gray-400 hover:text-blue-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
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
  const progressPercentage = (data.total / data.goal) * 100;
  const monthsOfExpenses = data.total / 6500; // Assuming monthly expenses
  
  const getFundStatus = (months) => {
    if (months >= 6) return { status: 'Excellent', color: 'text-emerald-400' };
    if (months >= 3) return { status: 'Good', color: 'text-yellow-400' };
    return { status: 'Build More', color: 'text-red-400' };
  };

  const { status, color } = getFundStatus(monthsOfExpenses);

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-purple-900/40 to-pink-900/40">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Umbrella className="w-6 h-6 mr-3 text-purple-400" />
          Rainy Day Fund
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-semibold">{progressPercentage.toFixed(1)}%</span>
          <button
            onClick={() => onEdit('rainyDayFund', data)}
            className="text-gray-400 hover:text-purple-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
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

  const getScoreProgress = (score) => (score / 850) * 100;

  // Create line chart for credit score history
  useEffect(() => {
    if (!data.history || data.history.length === 0) return;

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

  }, [data.history, data.current]);

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

// Net Worth Card
const NetWorthCard = ({ data, onEdit }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-bold text-white flex items-center">
        <DollarSign className="w-6 h-6 mr-3 text-emerald-400" />
        Net Worth
      </h2>
      <button
        onClick={() => onEdit('netWorth', data)}
        className="text-gray-400 hover:text-emerald-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    <div className="mt-4 space-y-4">
      {/* Assets Section */}
      <div>
        <h4 className="text-sm font-semibold text-emerald-400 mb-2">Assets</h4>
        <div className="space-y-2">
          {data.breakdown.filter(item => item.type === 'asset').map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-emerald-400 font-medium">+${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities Section */}
      {data.breakdown.filter(item => item.type === 'liability').length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 mb-2">Liabilities</h4>
          <div className="space-y-2">
            {data.breakdown.filter(item => item.type === 'liability').map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-red-400 font-medium">-${Math.abs(item.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </Card>
);

// Editable Retirement Accounts Card
const RegisteredAccountsCard = ({ data, onEdit }) => {
  const accounts = data?.accounts || [];
  
  // Calculate totals
  const totalContributed = accounts.reduce((sum, account) => sum + account.contributed, 0);
  const totalLimit = accounts.reduce((sum, account) => sum + account.limit, 0);
  const totalRoom = totalLimit - totalContributed;

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-600/30">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShieldCheck className="w-6 h-6 mr-3 text-purple-400" />
          Retirement Accounts
        </h2>
        <button
          onClick={() => onEdit('registeredAccounts', data)}
          className="text-gray-400 hover:text-purple-400 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
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
  const totalDebt = data.accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalMinPayment = data.accounts?.reduce((sum, account) => sum + account.minPayment, 0) || 0;
  const avgInterestRate = data.accounts?.length > 0 ? 
    data.accounts.reduce((sum, account) => sum + account.interestRate, 0) / data.accounts.length : 0;

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-red-900/30 to-orange-900/30 relative">
      <button
        onClick={() => onEdit('debt', data)}
        className="absolute top-4 right-4 p-2 bg-red-700/20 hover:bg-red-600/30 rounded-lg transition-colors"
        title="Edit Debt"
      >
        <Edit className="w-4 h-4 text-red-300" />
      </button>

      <h2 className="text-xl font-bold text-white mb-2 flex items-center">
        <CreditCard className="w-6 h-6 mr-3 text-red-400" />
        Total Debt
      </h2>
      <p className="text-5xl font-extrabold text-red-400">${totalDebt.toLocaleString()}</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-800/20 rounded-lg p-3">
          <p className="text-red-300 text-sm">Min. Payment</p>
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
const CashOnHandCard = ({ data, onEdit }) => (
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

// Income Card
const IncomeCard = ({ data, viewMode }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-cyan-900/30 to-sky-900/30">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowUp className="w-6 h-6 mr-3 text-cyan-400" />
      {viewMode === 'annual' ? 'Annual Income' : 'Monthly Income'}
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    <div className="mt-4 space-y-2">
      {data.sources.map(source => (
        <div key={source.id} className="flex justify-between items-center text-sm">
          <span className="text-gray-300">{source.name}</span>
          <span className="font-semibold text-white">${source.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Expenses Card
const ExpensesCard = ({ data, viewMode }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-red-900/40 to-rose-900/40">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowDown className="w-6 h-6 mr-3 text-red-500" />
      {viewMode === 'annual' ? 'Annual Expenses' : 'Monthly Expenses'}
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    <div className="mt-4 space-y-2">
      {data.categories.map(cat => (
        <div key={cat.id} className="flex justify-between items-center text-sm">
          <span className="text-gray-300">{cat.name}</span>
          <span className="font-semibold text-white">${cat.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Cash Flow Card
const CashFlowCard = ({ data, onEdit }) => {
  const isPositive = data.total >= 0;
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-amber-400" />
          Cash Flow
        </h2>
        {/* Cash Flow is calculated - no edit needed */}
      </div>
      <p className={`text-5xl font-extrabold ${isPositive ? 'text-amber-400' : 'text-red-500'}`}>
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
  const projectionData = [];
  let amount = currentSavings;
  for (let month = 0; month <= totalMonths && month <= 600; month++) { // Max 50 years
    if (month > 0) {
      amount = amount * (1 + monthlyReturn) + monthlyContribution;
    }
    if (month % 12 === 0) {
      projectionData.push({
        year: currentAge + Math.floor(month / 12),
        amount: amount,
        passiveIncome: amount * 0.04 / 12 // 4% rule monthly
      });
    }
  }

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
      sortedDebts.forEach(debt => {
        if (debt.balance > 0) {
          const monthlyInterest = debt.balance * (debt.interestRate / 100 / 12);
          totalInterestPaid += monthlyInterest;
          debt.balance += monthlyInterest;
          
          const payment = Math.min(debt.minPayment, debt.balance);
          debt.balance -= payment;
        }
      });
      
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
const BudgetCalculatorTab = () => {
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
              onClick={() => setShowFFCalculator(!showFFCalculator)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                showFFCalculator ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              {showFFCalculator ? 'Hide FF Calculator' : 'Financial Freedom'}
            </button>
            
            <button
              onClick={() => setShowDebtCalculator(!showDebtCalculator)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-colors ${
                showDebtCalculator ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {showDebtCalculator ? 'Hide Debt Calculator' : 'Debt Payoff'}
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
      {showFFCalculator && <FinancialFreedomCalculator />}
      
      {/* Debt Payoff Calculator */}
      {showDebtCalculator && <DebtPayoffCalculator />}
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

  const totalBusinessIncome = data.businesses.reduce((sum, business) => sum + (business.totalIncome || business.income || 0), 0);
  const totalBusinessExpenses = data.businesses.reduce((sum, business) => sum + (business.totalExpenses || business.expenses || 0), 0);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isIncome ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-white">{item.description}</span>
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
    currency: 'CAD'
  });

  // Calculate dynamic totals from actual holdings
  const actualTotalValue = data.investments.holdings.reduce((sum, holding) => {
    return sum + (holding.shares * holding.currentPrice);
  }, 0);

  const actualTotalCost = data.investments.holdings.reduce((sum, holding) => {
    return sum + (holding.shares * holding.avgCost);
  }, 0);

  useEffect(() => {
    // Pie Chart
    if (pieChartRef.current && data.investments.portfolioAllocation) {
      const svg = d3.select(pieChartRef.current);
      svg.selectAll("*").remove();
      
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;
      
      const color = d3.scaleOrdinal()
        .domain(data.investments.portfolioAllocation.map(d => d.name))
        .range(data.investments.portfolioAllocation.map(d => d.color));
      
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
        .data(pie(data.investments.portfolioAllocation))
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
      const xAxis = g.append("g")
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
  }, [data.investments]);

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
      currency: newHolding.currency
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
      dripEnabled: true, accountType: data.registeredAccounts?.accounts?.[0]?.name || 'Taxable', isUSStock: false, withholdingTax: 0, currency: 'CAD' 
    });
    setShowAddHolding(false);
    
    // Save to Firebase only if auth is enabled and user exists
    if (userId && userId !== 'dev-user') {
      try {
        await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
    
    // Save to Firebase only if auth is enabled and user exists
    if (userId && userId !== 'dev-user') {
      try {
        await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
    
    // Save to Firebase only if auth is enabled and user exists
    if (userId && userId !== 'dev-user') {
      try {
        await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
    
    // Save to Firebase only if auth is enabled and user exists
    if (userId && userId !== 'dev-user') {
      try {
        await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
        
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Repeat className="w-5 h-5 mr-2 text-purple-400" />
            Annual Dividends
          </h3>
          <p className="text-2xl font-bold text-purple-400">
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
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <PieChart className="w-6 h-6 mr-3 text-blue-400" />
            Portfolio Allocation
          </h3>
          <div className="flex justify-center">
            <svg ref={pieChartRef}></svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.investments.portfolioAllocation.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-300">{item.name}</span>
                <span className="text-sm text-white font-semibold ml-auto">
                  ${(item.value/1000).toFixed(0)}k
                </span>
              </div>
            ))}
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
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Repeat className="w-6 h-6 mr-3 text-green-400" />
            💰 Dividend Income Tracker
          </h3>
        
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-800/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">
                ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 12).toFixed(0)}
              </div>
              <div className="text-sm text-green-200">Monthly Income</div>
            </div>
            
            <div className="bg-green-800/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">
                ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 4).toFixed(0)}
              </div>
              <div className="text-sm text-green-200">Quarterly Income</div>
            </div>
            
            <div className="bg-green-800/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">
                ${data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0).toFixed(0)}
              </div>
              <div className="text-sm text-green-200">Annual Income</div>
            </div>
            
            <div className="bg-green-800/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">
                {(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / actualTotalValue * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-green-200">Portfolio Yield</div>
            </div>
          </div>
        
        {/* Dividend Calendar & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Upcoming Dividends */}
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
              <h4 className="text-lg font-semibold text-green-200 mb-3 flex items-center">
                📅 Upcoming Dividends
              </h4>
            <div className="space-y-3">
              {data.investments.holdings
                .filter(h => h.nextDividendDate && h.dividendYield > 0)
                .sort((a, b) => new Date(a.nextDividendDate) - new Date(b.nextDividendDate))
                                  .map(holding => (
                    <div key={holding.id} className="flex justify-between items-center bg-green-800/20 rounded p-2">
                      <div>
                        <div className="font-semibold text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(holding.nextDividendDate).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-300 font-semibold">
                          ${(holding.annualDividend / 4).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">{holding.dividendYield}% yield</div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
          
          {/* DRIP Status */}
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
            <h4 className="text-lg font-semibold text-green-200 mb-3 flex items-center">
              🔄 DRIP Status
            </h4>
            <div className="space-y-3">
              {data.investments.holdings
                .filter(h => h.dividendYield > 0)
                .map(holding => (
                  <div key={holding.id} className="flex justify-between items-center bg-green-800/20 rounded p-2">
                    <div>
                      <div className="font-semibold text-white">{holding.symbol}</div>
                      <div className="text-xs text-gray-400">
                        ${holding.dividendAccumulated} accumulated
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        holding.dripEnabled ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        <Tooltip 
                          text="DRIP (Dividend Reinvestment Plan) automatically uses dividend payments to buy more shares of the same stock, compounding your investment growth over time."
                        >
                          {holding.dripEnabled ? '🔄 DRIP ON' : '💵 CASH'}
                        </Tooltip>
                      </div>
                      {holding.dripEnabled && (
                        <div className="text-xs text-green-300">
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
      <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-600/30">
        <h4 className="text-lg font-semibold text-green-200 mb-3 flex items-center">
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
                    <div key={holding.id} className="flex items-center justify-between bg-green-800/20 rounded p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-white">{holding.symbol}</div>
                          <div className="text-xs text-gray-400">{holding.dividendYield}% yield</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-300">
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
          
                      <div className="mt-4 p-3 bg-green-800/20 rounded border border-green-600/30">
              <div className="text-sm text-green-200 mb-2">
                💡 <strong>Income Strategy:</strong> Your ${data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0).toLocaleString()} annual dividend income provides 
                <span className="font-semibold"> ${(data.investments.holdings.reduce((sum, h) => sum + h.annualDividend, 0) / 12).toFixed(0)}/month </span>
                in passive income - perfect for travel funding! 🌍
              </div>
              <div className="text-xs text-green-300 border-t border-green-600/30 pt-2">
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
          {data.investments.holdings.map(holding => (
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
                  <div className="text-lg font-bold text-purple-400">${holding.annualDividend.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Annual Dividend</div>
                  <div className="text-xs text-purple-300">{holding.dividendYield}% yield</div>
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
          ))}
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'personal',
    subcategory: '',
    date: new Date().toISOString().split('T')[0]
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
    
    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: newTransaction.type === 'expense' ? -Math.abs(parseFloat(newTransaction.amount)) : Math.abs(parseFloat(newTransaction.amount))
    };
    
    const updatedTransactions = [transaction, ...data.transactions];
    const updatedData = { ...data, transactions: updatedTransactions };
    
    try {
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'personal',
        subcategory: '',
        date: new Date().toISOString().split('T')[0]
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = data.transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
      return a.description.localeCompare(b.description);
    });

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
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
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value, subcategory: ''})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
            
            <select
              value={newTransaction.subcategory}
              onChange={(e) => setNewTransaction({...newTransaction, subcategory: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
            >
              <option value="">Select Subcategory</option>
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

      {/* Transaction List */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">
          Recent Transactions ({filteredTransactions.length})
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
    countries: []
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
        
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
       await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
       await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setNewTrip({ name: '', description: '', targetBudget: '', startDate: '', endDate: '', estimatedDailySpend: '', countries: [] });
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

  const runway = calculateRunway();

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Travel Runway Calculator - Hero Section */}
      <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30 relative">
        <button
          onClick={() => setShowRunwayModal(true)}
          className="absolute top-4 right-4 p-2 bg-blue-700/20 hover:bg-blue-600/30 rounded-lg transition-colors"
          title="Edit Travel Runway Settings"
        >
          <Edit className="w-4 h-4 text-blue-300" />
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🌍 Travel Runway Calculator</h2>
          <p className="text-blue-200 mb-6">Smart destination-based travel planning with cost tiers</p>
          
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-800/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-300">{runway.totalPossibleDays}</div>
              <div className="text-blue-200">Total Possible Days</div>
            </div>
            <div className="bg-blue-800/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-300">{runway.weeksRemaining}</div>
              <div className="text-blue-200">Weeks of Travel</div>
            </div>
            <div className="bg-blue-800/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-300">{runway.monthsRemaining}</div>
              <div className="text-blue-200">Months of Travel</div>
            </div>
          </div>

          {/* Destination Cost Breakdown */}
          <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">🎯 Your Travel Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/30">
                <div className="text-green-400 font-semibold">🟢 Cheap Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.cheap} days</div>
                <div className="text-green-300">${runway.costTiers.cheap}/day</div>
                <div className="text-green-200">Total: ${runway.plannedCosts.cheap.toLocaleString()}</div>
                <div className="text-xs text-green-300 mt-1">Southeast Asia, Eastern Europe, India</div>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-600/30">
                <div className="text-yellow-400 font-semibold">🟡 Moderate Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.moderate} days</div>
                <div className="text-yellow-300">${runway.costTiers.moderate}/day</div>
                <div className="text-yellow-200">Total: ${runway.plannedCosts.moderate.toLocaleString()}</div>
                <div className="text-xs text-yellow-300 mt-1">South America, Southern Europe</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-3 border border-red-600/30">
                <div className="text-red-400 font-semibold">🔴 Expensive Destinations</div>
                <div className="text-white text-lg">{runway.tripPlan.expensive} days</div>
                <div className="text-red-300">${runway.costTiers.expensive}/day</div>
                <div className="text-red-200">Total: ${runway.plannedCosts.expensive.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1">Western Europe, Scandinavia, Japan</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="bg-blue-700/20 rounded-lg p-3">
              <div className="text-blue-200">Total Travel Funds</div>
              <div className="text-xl font-bold text-white">${runway.totalFunds.toLocaleString()} {data.travel?.homeCurrency || 'CAD'}</div>
            </div>
            <div className="bg-blue-700/20 rounded-lg p-3">
              <div className="text-blue-200">Planned Trip Cost</div>
              <div className="text-xl font-bold text-white">${runway.totalPlannedCost.toLocaleString()}</div>
              <div className="text-xs text-blue-300">{runway.totalPlannedDays} days planned</div>
            </div>
            <div className="bg-green-700/20 rounded-lg p-3">
              <div className="text-green-200">Remaining Funds</div>
              <div className="text-xl font-bold text-green-400">${runway.remainingFunds.toLocaleString()}</div>
              <div className="text-xs text-green-300">+{runway.extensionDays} days possible</div>
            </div>
          </div>
          
          <div className="text-xs text-blue-300 text-center">
            💡 Extend your journey by choosing cheaper destinations with remaining funds
          </div>
        </div>
      </Card>

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
        {(data.travel?.trips || []).map(trip => {
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
                  >
                    <Edit className="w-4 h-4" />
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
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {trip.expenses.slice(0, 3).map(expense => (
                        <div key={expense.id} className="flex justify-between text-xs">
                          <span className="text-gray-400">{expense.description}</span>
                          <span className="text-white">
                            {expense.amount} {expense.currency}
                            {expense.currency !== 'CAD' && (
                              <span className="text-gray-500 ml-1">
                                (${convertCurrency(expense.amount, expense.currency, 'CAD').toFixed(0)} CAD)
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
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

export default function App() {
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
  // AUTHENTICATION DISABLED FOR DEVELOPMENT - QUICK ACCESS
  const [user, setUser] = useState({ uid: 'dev-user', email: 'dev@test.com', displayName: 'Dev User', plan: 'recon' });
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [showSubscription, setShowSubscription] = useState(false);
  const [userPlan, setUserPlan] = useState('recon');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState(null);
  const [showFounderOffer, setShowFounderOffer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('monthly'); // monthly or annual
  const [showHistory, setShowHistory] = useState(false);
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Feature access handlers
  const handleFeatureAccess = (feature) => {
    const currentUserPlan = getUserPlan(user);
    if (hasFeatureAccess(currentUserPlan, feature)) {
      return true;
    } else {
      setUpgradeFeature(feature);
      setShowUpgradePrompt(true);
      return false;
    }
  };

  const handleUpgrade = (planType) => {
    setShowUpgradePrompt(false);
    if (planType === 'founder') {
      setShowFounderOffer(true);
    } else {
      setShowSubscription(true);
    }
  };

  const handleSubscribe = (planType) => {
    // This would integrate with your payment system
    console.log(`Subscribing to plan: ${planType}`);
    setUser(prev => ({ ...prev, plan: planType }));
    setUserPlan(planType);
    setShowFounderOffer(false);
    setShowSubscription(false);
    showNotification(`Welcome to ${planType === 'founder' ? 'The Founder\'s Circle' : 'your new plan'}! 🎉`);
  };

    // Authentication Effect - DISABLED FOR DEVELOPMENT
  useEffect(() => {
    // Skip Firebase auth - use mock user
    setUserId('dev-user');
    setAuthLoading(false);
    setLoading(false);
    
    // Load initial sample data immediately
    if (!data) {
      setData(initialData);
    }
    
    // Set up --vh for iOS viewport fix
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    // Set initial --vh
    setVH();
    
    // Update --vh on resize (orientation change, etc.)
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    //   setUser(user);
    //   setUserId(user?.uid || null);
    //   setAuthLoading(false);
    //   
    //   if (!user) {
    //     setLoading(false);
    //     setData(null);
    //   }
    // });
    // return () => unsubscribeAuth();
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Authentication Functions
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      await updateProfile(user, { displayName: authForm.name });
      
      // Create initial user data
      await setDoc(doc(db, 'users', user.uid), {
        ...initialData,
        profile: {
          name: authForm.name,
          email: authForm.email,
          createdAt: new Date().toISOString(),
          subscription: 'free' // Default to free tier
        }
      });
      
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Sign in error:', error);
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists, if not create initial data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          ...initialData,
          profile: {
            name: user.displayName,
            email: user.email,
            createdAt: new Date().toISOString(),
            subscription: 'free'
          }
        });
      }
      
      setShowAuth(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setData(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
    if (!userId) return;

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
        history: [{
          month: resetStartDate.substring(0, 7),
          netWorth: initialData.netWorth.total,
          income: initialData.income.total,
          expenses: initialData.expenses.total,
          cashflow: initialData.cashflow.monthly,
          businessIncome: initialData.businesses.reduce((sum, b) => sum + b.totalIncome, 0),
          businessExpenses: initialData.businesses.reduce((sum, b) => sum + b.totalExpenses, 0),
          investmentValue: initialData.investments.totalValue,
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
        registeredAccounts: {
          tfsa: {
            currentBalance: 0,
            contributionRoom: 95000,
            contributionLimit: 95000,
            annualContributionLimit: 7000,
            withdrawals: 0,
            contributionsThisYear: 0
          },
          rrsp: {
            currentBalance: 0,
            contributionRoom: 127000,
            contributionLimit: 127000,
            annualContributionLimit: 31560,
            contributionsThisYear: 0,
            carryForward: 0
          }
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
          monthly: 0,
          history: [{ date: resetStartDate, amount: 0 }]
        },
        savingsRate: {
          current: 0,
          target: 20,
          history: [{ date: resetStartDate, rate: 0 }]
        },
        goals: {
          items: [],
          totalTarget: 0,
          totalProgress: 0
        },
        investments: {
          totalValue: 0,
          totalGainLoss: 0,
          holdings: [],
          categories: [],
          monthlyData: []
        },
        transactions: [],
        history: [{
          month: resetStartDate.substring(0, 7),
          netWorth: 0,
          income: 0,
          expenses: 0,
          cashflow: 0,
          businessIncome: 0,
          businessExpenses: 0,
          investmentValue: 0,
          savingsRate: 0
        }]
      };
    }

    try {
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), resetData);
      setData(resetData);
      setShowResetModal(false);
      setResetToSample(false);
    } catch (error) {
      console.error('Error resetting data:', error);
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
      await setDoc(doc(db, `artifacts/${process.env.REACT_APP_FIREBASE_APP_ID}/users/${userId}/financials`, 'data'), updatedData);
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
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate business income
    const totalBusinessIncome = businesses.reduce((sum, business) => 
      sum + (business.totalIncome || business.income || 0), 0);

    // Combine transaction and business income
    const totalIncome = totalTransactionIncome + totalBusinessIncome;

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
    
    const calculatedData = calculateIncomeExpenses(data.transactions, data.businesses);
    
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
    
    const calculatedData = calculateIncomeExpenses(data.transactions, data.businesses);
    const actualInvestmentTotal = calculateInvestmentTotal(data.investments.holdings);
    
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
        current: calculatedData.income.total > 0 ? 
          Math.round(((calculatedData.income.total - calculatedData.expenses.total) / calculatedData.income.total * 100) * 100) / 100 : 0
      }
    };
    
    return viewMode === 'annual' ? getAnnualizedData() : baseData;
  };

  const displayData = getDisplayData();

  // Show loading spinner during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl animate-pulse mb-4">Loading Your Financial Universe...</p>
          <p className="text-gray-400 text-sm">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Survive Financial</h1>
            <p className="text-gray-400">Your journey to financial freedom starts here</p>
          </div>

          {!showAuth ? (
            <div className="space-y-4">
              <button
                onClick={() => { setShowAuth(true); setAuthMode('login'); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setShowAuth(true); setAuthMode('signup'); }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
          ) : (
            <form onSubmit={authMode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {authMode === 'login' ? 'Welcome Back' : 'Join Survive Financial'}
                </h2>
              </div>

              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {authLoading ? 'Loading...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="flex-1 text-blue-400 hover:text-blue-300 py-2 px-4 rounded-lg transition-colors"
                >
                  {authMode === 'login' ? 'Need an account?' : 'Have an account?'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl animate-pulse mb-4">Loading Your Financial Data...</p>
          <p className="text-gray-400 text-sm">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

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
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">The Freedom Compass App</h1>
              <p className="text-gray-400 text-lg">Welcome back, {user?.displayName || 'Financial Navigator'}! Here's your {viewMode} snapshot.</p>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.displayName || 'User'}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  {user?.email}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    userPlan === 'free' ? 'bg-gray-600 text-gray-300' :
                    userPlan === 'backpacker' ? 'bg-blue-600 text-blue-100' :
                    'bg-purple-600 text-purple-100'
                  }`}>
                    {userPlan === 'free' ? 'Free' : userPlan === 'backpacker' ? 'Backpacker' : 'Entrepreneur'}
                  </span>
                </p>
              </div>
              
              {userPlan === 'free' && (
                <button
                  onClick={() => setShowSubscription(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </button>
              )}
              
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
                  <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2"/>Dashboard
                  </button>
                  <button 
                    onClick={() => setActiveTab('budget')} 
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'budget' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                  >
                    <Calculator className="w-4 h-4 mr-2"/>Budget
                  </button>
                  <button 
                    onClick={() => {
                      if (handleFeatureAccess('sideHustleManagement')) {
                        setActiveTab('side-hustle');
                      }
                    }} 
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'side-hustle' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'} ${!hasFeatureAccess(getUserPlan(user), 'sideHustleManagement') ? 'opacity-75' : ''}`}
                  >
                    <Building className="w-4 h-4 mr-2"/>Side Hustle
                    {!hasFeatureAccess(getUserPlan(user), 'sideHustleManagement') && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                  </button>
                  <button 
                    onClick={() => {
                      if (handleFeatureAccess('investmentPortfolio')) {
                        setActiveTab('investment');
                      }
                    }} 
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'investment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'} ${!hasFeatureAccess(getUserPlan(user), 'investmentPortfolio') ? 'opacity-75' : ''}`}
                  >
                    <Briefcase className="w-4 h-4 mr-2"/>Investment
                    {!hasFeatureAccess(getUserPlan(user), 'investmentPortfolio') && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                  </button>
                  <button onClick={() => setActiveTab('transactions')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'transactions' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                    <CreditCard className="w-4 h-4 mr-2"/>Transactions
                  </button>
                  <button 
                    onClick={() => {
                      if (handleFeatureAccess('travelMode')) {
                        setActiveTab('travel');
                      }
                    }} 
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center whitespace-nowrap ${activeTab === 'travel' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'} ${!hasFeatureAccess(getUserPlan(user), 'travelMode') ? 'opacity-75' : ''}`}
                  >
                    🌍 Travel
                    {!hasFeatureAccess(getUserPlan(user), 'travelMode') && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
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
              )}
              
              {/* Top Row - Financial Freedom Goal */}
              <FinancialFreedomCard data={displayData.financialFreedom} onEdit={openCardEditor} />
              <SavingsRateCard data={displayData.savingsRate} onEdit={openCardEditor} />
              
              {/* Second Row - Net Worth and Cash on Hand */}
              <NetWorthCard data={displayData.netWorth} onEdit={openCardEditor} />
              <CashOnHandCard data={displayData.cashOnHand} onEdit={openCardEditor} />
              
              {/* Third Row - Income and Expenses Side by Side */}
              <IncomeCard data={displayData.income} viewMode={viewMode} />
              <ExpensesCard data={displayData.expenses} viewMode={viewMode} />
              
              {/* Fourth Row - Cash Flow and Rainy Day Fund */}
              <CashFlowCard data={displayData.cashflow} onEdit={openCardEditor} />
              <RainyDayFundCard data={displayData.rainyDayFund} onEdit={openCardEditor} />
              
              {/* Fifth Row - Debt (Full Width) */}
              <DebtCard data={displayData.debt} onEdit={openCardEditor} />
              
              {/* Sixth Row - Credit Score and Goals */}
              <CreditScoreCard data={displayData.creditScore} onEdit={openCardEditor} />
              <GoalsCard data={displayData.goals} onEdit={openCardEditor} />
              
              {/* Seventh Row - Retirement Accounts */}
              <RegisteredAccountsCard 
                data={displayData.registeredAccounts} 
                onEdit={openCardEditor} 
              />
            </>
          )}
          
          {activeTab === 'budget' && <BudgetCalculatorTab />}
          
          {activeTab === 'side-hustle' && <SideHustleTab data={data} setData={setData} userId={userId} />}
          
          {activeTab === 'investment' && <InvestmentTab data={data} setData={setData} userId={userId} />}
          
          {activeTab === 'transactions' && <TransactionsTab data={data} setData={setData} userId={userId} />}
          
          {activeTab === 'travel' && <TravelTab data={data} setData={setData} userId={userId} />}
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

      {/* Floating Quick Expense Button */}
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

        {showUpgradePrompt && (
          <UpgradePrompt
            feature={upgradeFeature}
            currentPlan={getUserPlan(user)}
            onClose={() => setShowUpgradePrompt(false)}
            onUpgrade={handleUpgrade}
          />
        )}

        {showFounderOffer && (
          <FounderCircleOffer
            onClose={() => setShowFounderOffer(false)}
            onSubscribe={handleSubscribe}
          />
        )}
    </div>
  );
}


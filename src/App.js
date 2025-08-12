import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Building, LayoutDashboard, Calculator, Briefcase, Target, PiggyBank, Umbrella, ShieldCheck, Calendar, Plus, X, Edit, Trash2, CreditCard, BarChart3, PieChart, Repeat } from 'lucide-react';
import * as d3 from 'd3';

// Firebase Imports
import { db, auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const appId = process.env.REACT_APP_FIREBASE_APP_ID;

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
        { id: 1, name: 'CIBC Chequing', balance: 15000 },
        { id: 2, name: 'Tangerine Savings', balance: 45000 },
        { id: 3, name: 'Wealthsimple Cash', balance: 15000 },
    ],
    history: [ { date: '2025-08-09', total: 75000 } ]
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
    totalValue: 450000,
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
        totalValue: 270000,
        dividendYield: 1.8,
        annualDividend: 4860,
        nextDividendDate: '2025-03-15',
        dripEnabled: true,
        dividendAccumulated: 1215,
        dripProgress: 27.0 // 27% towards next share
      },
      {
        id: 2,
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        shares: 1125,
        avgCost: 75.00,
        currentPrice: 80.00,
        totalValue: 90000,
        dividendYield: 4.2,
        annualDividend: 3780,
        nextDividendDate: '2025-02-28',
        dripEnabled: true,
        dividendAccumulated: 65,
        dripProgress: 81.3 // 81% towards next share
      },
      {
        id: 3,
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        shares: 500,
        avgCost: 85.00,
        currentPrice: 90.00,
        totalValue: 45000,
        dividendYield: 3.5,
        annualDividend: 1575,
        nextDividendDate: '2025-03-20',
        dripEnabled: false,
        dividendAccumulated: 262,
        dripProgress: 0 // DRIP disabled
      },
      {
        id: 4,
        symbol: 'BTC',
        name: 'Bitcoin',
        shares: 0.5,
        avgCost: 45000,
        currentPrice: 90000,
        totalValue: 45000,
        dividendYield: 0,
        annualDividend: 0,
        nextDividendDate: null,
        dripEnabled: false,
        dividendAccumulated: 0,
        dripProgress: 0
      }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 380000 },
      { date: '2024-02-01', value: 385000 },
      { date: '2024-03-01', value: 392000 },
      { date: '2024-04-01', value: 388000 },
      { date: '2024-05-01', value: 395000 },
      { date: '2024-06-01', value: 402000 },
      { date: '2024-07-01', value: 410000 },
      { date: '2024-08-01', value: 415000 },
      { date: '2024-09-01', value: 425000 },
      { date: '2024-10-01', value: 435000 },
      { date: '2024-11-01', value: 440000 },
      { date: '2024-12-01', value: 445000 },
      { date: '2025-01-01', value: 450000 }
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
  ]
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, maxValue, color, height = 'h-2.5' }) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className={`w-full bg-gray-700 rounded-full ${height}`}>
      <div className={`${color} ${height} rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

// Financial Freedom Goal Card
const FinancialFreedomCard = ({ data }) => {
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
const SavingsRateCard = ({ data }) => {
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
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <PiggyBank className="w-6 h-6 mr-3 text-blue-400" />
        Savings Rate
      </h2>
      
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
const RainyDayFundCard = ({ data }) => {
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
        <span className="text-purple-400 font-semibold">{progressPercentage.toFixed(1)}%</span>
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

// Credit Score Card
const CreditScoreCard = ({ data }) => {
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

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-blue-900/40">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <ShieldCheck className="w-6 h-6 mr-3 text-indigo-400" />
        Credit Score
      </h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-extrabold ${getScoreColor(data.current)}`}>
            {data.current}
          </div>
          <div className="text-gray-400 text-sm">{getScoreStatus(data.current)}</div>
        </div>
        
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
const GoalsCard = ({ data }) => {
  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Calendar className="w-6 h-6 mr-3 text-amber-400" />
        Financial Goals
      </h2>
      
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
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
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
const NetWorthCard = ({ data }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <DollarSign className="w-6 h-6 mr-3 text-emerald-400" />
      Net Worth
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    <div className="mt-4 space-y-2">
      {data.breakdown.filter(item => item.type === 'asset').map((item) => (
        <div key={item.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
            <span className="text-gray-300">{item.name}</span>
          </div>
          <span className="font-semibold text-white">${item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Income Card
const IncomeCard = ({ data }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-cyan-900/30 to-sky-900/30">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowUp className="w-6 h-6 mr-3 text-cyan-400" />
      Monthly Income
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
const ExpensesCard = ({ data }) => (
  <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-red-900/40 to-rose-900/40">
    <h2 className="text-xl font-bold text-white mb-2 flex items-center">
      <ArrowDown className="w-6 h-6 mr-3 text-red-500" />
      Monthly Expenses
    </h2>
    <p className="text-5xl font-extrabold text-white">${data.total.toLocaleString()}</p>
    <div className="mt-4 space-y-2">
      {data.categories.map(cat => (
        <div key={cat.id} className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${cat.color}`}></span>
            <span className="text-gray-300">{cat.name}</span>
          </div>
          <span className="font-semibold text-white">${cat.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Cash Flow Card
const CashFlowCard = ({ data }) => {
  const isPositive = data.total >= 0;
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-amber-900/40 to-yellow-900/40">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center">
        <TrendingUp className="w-6 h-6 mr-3 text-amber-400" />
        Cash Flow
      </h2>
      <p className={`text-5xl font-extrabold ${isPositive ? 'text-amber-400' : 'text-red-500'}`}>
        {isPositive ? '+' : '-'}${Math.abs(data.total).toLocaleString()}
      </p>
      <p className="text-gray-400 mt-2">Monthly income minus expenses</p>
    </Card>
  );
};

// Budget Calculator Component with the critical layout fix
const BudgetCalculatorTab = () => {
  const [budgetType, setBudgetType] = useState('50-30-20');
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  
  const fiftyThirtyTwenty = {
    needs: Math.round(monthlyIncome * 0.5),
    wants: Math.round(monthlyIncome * 0.3),
    savings: Math.round(monthlyIncome * 0.2)
  };
  
  const sixJars = {
    necessities: Math.round(monthlyIncome * 0.55),
    financialFreedom: Math.round(monthlyIncome * 0.10),
    longTermSavings: Math.round(monthlyIncome * 0.10),
    education: Math.round(monthlyIncome * 0.10),
    play: Math.round(monthlyIncome * 0.10),
    give: Math.round(monthlyIncome * 0.05)
  };

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
          <div className="flex items-center bg-gray-900/50 rounded-full p-1 space-x-1">
            <button onClick={() => setBudgetType('50-30-20')} className={`px-3 py-1 rounded-full text-sm font-semibold ${budgetType === '50-30-20' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>50/30/20 Rule</button>
            <button onClick={() => setBudgetType('6-jars')} className={`px-3 py-1 rounded-full text-sm font-semibold ${budgetType === '6-jars' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>6 Jars System</button>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
          <label className="block text-white text-lg font-bold mb-4">Monthly Income Input</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
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
          <div className="text-3xl font-bold text-white mb-2">$0</div>
          <p className="text-gray-400">Remaining balance</p>
        </div>
      </div>
      
      {budgetType === '50-30-20' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-green-900/30 rounded-xl p-6 border-2 border-green-800/40">
            <h3 className="text-2xl font-bold text-green-400 mb-3">💡 Needs (50%)</h3>
            <p className="text-gray-300 mb-4">Essential expenses</p>
            <div className="text-4xl font-bold text-white">${fiftyThirtyTwenty.needs.toLocaleString()}</div>
          </div>
          <div className="bg-yellow-900/30 rounded-xl p-6 border-2 border-yellow-800/40">
            <h3 className="text-2xl font-bold text-yellow-400 mb-3">🎯 Wants (30%)</h3>
            <p className="text-gray-300 mb-4">Discretionary spending</p>
            <div className="text-4xl font-bold text-white">${fiftyThirtyTwenty.wants.toLocaleString()}</div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-6 border-2 border-blue-800/40">
            <h3 className="text-2xl font-bold text-blue-400 mb-3">💰 Savings (20%)</h3>
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
            <div className="text-xs text-green-400 font-semibold">55%</div>
          </div>
          <div className="bg-purple-900/30 rounded-xl p-4 border-2 border-purple-800/40 text-center">
            <h4 className="text-sm font-bold text-purple-400 mb-2">🚀 Freedom</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.financialFreedom.toLocaleString()}</div>
            <div className="text-xs text-purple-400 font-semibold">10%</div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-4 border-2 border-blue-800/40 text-center">
            <h4 className="text-sm font-bold text-blue-400 mb-2">🎯 Savings</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.longTermSavings.toLocaleString()}</div>
            <div className="text-xs text-blue-400 font-semibold">10%</div>
          </div>
          <div className="bg-amber-900/30 rounded-xl p-4 border-2 border-amber-800/40 text-center">
            <h4 className="text-sm font-bold text-amber-400 mb-2">📚 Education</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.education.toLocaleString()}</div>
            <div className="text-xs text-amber-400 font-semibold">10%</div>
          </div>
          <div className="bg-pink-900/30 rounded-xl p-4 border-2 border-pink-800/40 text-center">
            <h4 className="text-sm font-bold text-pink-400 mb-2">🎉 Play</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.play.toLocaleString()}</div>
            <div className="text-xs text-pink-400 font-semibold">10%</div>
          </div>
          <div className="bg-teal-900/30 rounded-xl p-4 border-2 border-teal-800/40 text-center">
            <h4 className="text-sm font-bold text-teal-400 mb-2">❤️ Give</h4>
            <div className="text-xl font-bold text-white mb-1">${sixJars.give.toLocaleString()}</div>
            <div className="text-xs text-teal-400 font-semibold">5%</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Side Hustle Management Component
const SideHustleTab = ({ data, setData, userId }) => {
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemType, setItemType] = useState('income');
  
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

  const totalBusinessIncome = data.businesses.reduce((sum, business) => sum + business.totalIncome, 0);
  const totalBusinessExpenses = data.businesses.reduce((sum, business) => sum + business.totalExpenses, 0);
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
                value={newItem.amount}
                onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
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
    </div>
  );
};

// Investment Portfolio Component with Charts
const InvestmentTab = ({ data, setData, userId }) => {
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);

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
    
    // Line Chart
    if (lineChartRef.current && data.investments.performanceHistory) {
      const svg = d3.select(lineChartRef.current);
      svg.selectAll("*").remove();
      
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      const width = 600 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      const parseDate = d3.timeParse("%Y-%m-%d");
      const data_parsed = data.investments.performanceHistory.map(d => ({
        date: parseDate(d.date),
        value: d.value
      }));
      
      const x = d3.scaleTime()
        .domain(d3.extent(data_parsed, d => d.date))
        .range([0, width]);
      
      const y = d3.scaleLinear()
        .domain(d3.extent(data_parsed, d => d.value))
        .nice()
        .range([height, 0]);
      
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      const g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("fill", "#9CA3AF")
        .style("font-size", "12px");
      
      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d/1000}k`))
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
      
      // Add line
      g.append("path")
        .datum(data_parsed)
        .attr("fill", "none")
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 3)
        .attr("d", line);
      
      // Add dots
      g.selectAll(".dot")
        .data(data_parsed)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .attr("fill", "#3B82F6");
    }
  }, [data.investments]);

  const totalGainLoss = data.investments.holdings.reduce((sum, holding) => {
    return sum + ((holding.currentPrice - holding.avgCost) * holding.shares);
  }, 0);
  
  const totalGainLossPercent = data.investments.holdings.reduce((sum, holding) => {
    const cost = holding.avgCost * holding.shares;
    return sum + cost;
  }, 0);
  
  const gainLossPercent = totalGainLossPercent > 0 ? (totalGainLoss / totalGainLossPercent) * 100 : 0;

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
            Total Value
          </h3>
          <p className="text-3xl font-bold text-blue-400">${data.investments.totalValue.toLocaleString()}</p>
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
          <p className={`text-sm mt-2 ${gainLossPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
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
          <svg ref={lineChartRef}></svg>
        </Card>
      </div>

      {/* Holdings with DRIP */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Holdings & DRIP Calculator</h3>
        <div className="space-y-4">
          {data.investments.holdings.map(holding => (
            <div key={holding.id} className="bg-gray-700/30 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                <div className="lg:col-span-2">
                  <h4 className="font-bold text-white">{holding.symbol}</h4>
                  <p className="text-sm text-gray-400">{holding.name}</p>
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
                  {holding.dripEnabled ? (
                    <div>
                      <div className="text-sm font-semibold text-green-400">DRIP ON</div>
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
                    <div>
                      <div className="text-sm font-semibold text-gray-400">DRIP OFF</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${holding.dividendAccumulated} cash
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
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
        </div>
      </Card>

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
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
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
                value={Math.abs(editingTransaction.amount)}
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
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

export default function App() {
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const signInUser = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Authentication error:", error);
        setLoading(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    if (!auth.currentUser) {
      signInUser();
    }

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
    
    const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const fetchedData = doc.data();
        setData(fetchedData);
      } else {
        setDoc(userDocRef, initialData)
          .then(() => setData(initialData))
          .catch(error => console.error("Error creating initial document:", error));
      }
      setLoading(false);
    }, (error) => { 
      console.error("Firestore snapshot error:", error); 
      setLoading(false); 
    });

    return () => unsubscribeSnapshot();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl animate-pulse mb-4">Loading Your Financial Universe...</p>
          <p className="text-gray-400 text-sm">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Financial Freedom Dashboard</h1>
              <p className="text-gray-400 text-lg">Welcome back, Entrepreneur! Here's your financial snapshot.</p>
            </div>
            <div className="flex items-center bg-gray-800 rounded-full p-1 space-x-1">
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                <LayoutDashboard className="w-4 h-4 mr-2"/>Dashboard
              </button>
              <button onClick={() => setActiveTab('budget')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'budget' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                <Calculator className="w-4 h-4 mr-2"/>Budget
              </button>
              <button onClick={() => setActiveTab('side-hustle')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'side-hustle' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                <Building className="w-4 h-4 mr-2"/>Side Hustle
              </button>
              <button onClick={() => setActiveTab('investment')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'investment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                <Briefcase className="w-4 h-4 mr-2"/>Investment
              </button>
              <button onClick={() => setActiveTab('transactions')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'transactions' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                <CreditCard className="w-4 h-4 mr-2"/>Transactions
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Top Row - Financial Freedom Goal */}
              <FinancialFreedomCard data={data.financialFreedom} />
              <SavingsRateCard data={data.savingsRate} />
              
              {/* Second Row - Core Metrics */}
              <NetWorthCard data={data.netWorth} />
              <IncomeCard data={data.income} />
              <ExpensesCard data={data.expenses} />
              <CashFlowCard data={data.cashflow} />
              
              {/* Third Row - Additional Metrics */}
              <RainyDayFundCard data={data.rainyDayFund} />
              <CreditScoreCard data={data.creditScore} />
              
              {/* Fourth Row - Goals */}
              <GoalsCard data={data.goals} />
            </>
          )}
          
          {activeTab === 'budget' && <BudgetCalculatorTab />}
          
          {activeTab === 'side-hustle' && <SideHustleTab data={data} setData={setData} userId={userId} />}
          
          {activeTab === 'investment' && <InvestmentTab data={data} setData={setData} userId={userId} />}
          
          {activeTab === 'transactions' && <TransactionsTab data={data} setData={setData} userId={userId} />}
        </main>

        <footer className="text-center mt-12 text-gray-500">
          <p>Dashboard for the modern hustler. Keep building.</p>
          <p className="text-xs mt-2">User ID: {userId}</p>
        </footer>
      </div>
    </div>
  );
}


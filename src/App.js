import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, DollarSign, Target, Briefcase, BarChart2, Repeat, ShoppingCart, X, Plus, TrendingUp, Wind, PiggyBank, Leaf, Download, Calendar, Wallet, Trash2, CreditCard, Building, LayoutDashboard, AreaChart, Umbrella, Calculator, AlertTriangle, Save, Edit, ShieldCheck } from 'lucide-react';
import * as d3 from 'd3';

// Firebase Imports
import { db, auth } from './firebase'; // Import the ready-to-use services
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const appId = process.env.REACT_APP_FIREBASE_APP_ID;

/* global __initial_auth_token:readonly */




//-///////////////////////////////////////////////////////////////////////////
// DATA STRUCTURES (Sample, Empty)
//-///////////////////////////////////////////////////////////////////////////

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
  businesses: [
    { 
        id: 1,
        name: "Main Business",
        income: 4500, 
        expenses: 1000, 
        net: 3500, 
        history: [ { date: '2025-08-09', net: 3500 } ],
        incomeSources: [{id: 1, name: 'Consulting', amount: 4500}],
        expenseItems: [{id: 1, name: 'Software', amount: 1000}]
    }
  ],
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
      { id: 1, name: 'Main Job', amount: 8000, icon: 'briefcase', type: 'active' },
      { id: 2, name: 'Trading', amount: 2500, icon: 'trading', type: 'passive' },
      { id: 3, name: 'Survive Backpacking', amount: 2000, icon: 'backpacking', type: 'passive' },
      { id: 4, name: 'Dividends', amount: 500, icon: 'leaf', type: 'dividend' },
    ],
  },
  passiveIncome: {
    total: 0,
  },
  cashflow: {
    total: 0,
  },
  dividends: {
    total: 0,
  },
  expenses: {
    total: 6500,
    categories: [
      { id: 1, name: 'Housing', amount: 2500, color: 'bg-red-500' },
      { id: 2, name: 'Transport', amount: 800, color: 'bg-yellow-500' },
      { id: 3, name: 'Food', amount: 1200, color: 'bg-green-500' },
      { id: 4, name: 'Entertainment', amount: 1000, color: 'bg-purple-500' },
      { id: 5, name: 'Other', amount: 1000, color: 'bg-gray-400' },
    ],
  },
  investmentPortfolio: {
    totalValue: 350000,
    tfsaContribution: 50000,
    tfsaGoal: 81500,
    rrspContribution: 80000,
    rrspGoal: 150000,
    allocation: [
      { id: 1, name: 'Stocks', percentage: 60, color: 'bg-blue-500' },
      { id: 2, name: 'Bonds', percentage: 20, color: 'bg-emerald-500' },
      { id: 3, name: 'Crypto', percentage: 10, color: 'bg-amber-500' },
      { id: 4, name: 'Other', percentage: 10, color: 'bg-slate-500' },
    ],
    holdings: [
        { id: 1, ticker: 'VFV.TO', name: 'Vanguard S&P 500 Index ETF', shares: 100, avgCost: 115.50, currentPrice: 125.00, annualDividend: 1.40, type: 'ETF', account: 'TFSA' },
        { id: 2, ticker: 'XEQT.TO', name: 'iShares Core Equity ETF Portfolio', shares: 200, avgCost: 28.75, currentPrice: 30.25, annualDividend: 0.60, type: 'ETF', account: 'TFSA' },
        { id: 3, ticker: 'TD.TO', name: 'Toronto-Dominion Bank', shares: 50, avgCost: 82.00, currentPrice: 78.50, annualDividend: 4.08, type: 'Stock', account: 'RRSP' },
    ],
    history: [{ date: '2025-08-09', total: 350000 }],
  },
  recentTransactions: [
    { id: 1, description: 'Main Job', amount: 8000, type: 'income', category: 'personal', date: '2025-08-05' },
    { id: 2, description: 'Housing', amount: -2500, type: 'expense', category: 'personal', date: '2025-08-01' },
    { id: 3, description: 'TFSA Contribution', amount: -1500, type: 'investment', investmentType: 'tfsa', date: '2025-08-03' },
    { id: 4, description: 'Trading', amount: 2500, type: 'income', category: 'business', date: '2025-08-02' },
    { id: 5, description: 'Food', amount: -1200, type: 'expense', category: 'personal', date: '2025-08-04' },
    { id: 6, description: 'Survive Backpacking', amount: 2000, type: 'income', category: 'business', date: '2025-08-06' },
    { id: 7, description: 'Dividends', amount: 500, type: 'income', category: 'personal', date: '2025-08-07' },
    { id: 8, description: 'RRSP Contribution', amount: -2000, type: 'investment', investmentType: 'rrsp', date: '2025-08-08' },
    { id: 9, description: 'Web Hosting', amount: -100, type: 'expense', category: 'business', date: '2025-08-09' },
  ],
  allocations: {
    necessities: 55,
    financialFreedom: 10,
    longTermSavings: 10,
    education: 10,
    play: 10,
    give: 5,
  },
  goals: [
    { id: 1, name: 'House Down Payment', targetAmount: 75000, currentAmount: 25000 },
    { id: 2, name: 'New Car', targetAmount: 40000, currentAmount: 10000 },
  ]
};

const emptyData = {
  financialFreedom: {
    targetAmount: 0,
    currentInvestments: 0,
    monthlyContribution: 0,
    annualReturn: 0,
  },
  creditScore: {
    current: 0,
    history: []
  },
  cashOnHand: {
    total: 0,
    accounts: [],
    history: []
  },
  rainyDayFund: {
    total: 0,
    goal: 0,
    accounts: [],
    history: []
  },
  debt: {
    total: 0,
    accounts: [],
    history: []
  },
  businesses: [],
  netWorth: {
    total: 0,
    breakdown: [
      { id: 1, name: 'Cash', value: 0, color: 'bg-sky-500', type: 'asset' },
    ],
    history: []
  },
  income: {
    total: 0,
    sources: [],
  },
  passiveIncome: {
    total: 0,
  },
  cashflow: {
    total: 0,
  },
  dividends: {
    total: 0,
  },
  expenses: {
    total: 0,
    categories: [],
  },
  investmentPortfolio: {
    totalValue: 0,
    tfsaContribution: 0,
    tfsaGoal: 0,
    rrspContribution: 0,
    rrspGoal: 0,
    allocation: [],
    holdings: [],
    history: [],
  },
  recentTransactions: [],
  allocations: {
    necessities: 55,
    financialFreedom: 10,
    longTermSavings: 10,
    education: 10,
    play: 10,
    give: 5,
  },
  goals: []
};

//-///////////////////////////////////////////////////////////////////////////
// HELPER COMPONENTS
//-///////////////////////////////////////////////////////////////////////////

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, maxValue, color }) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0; // Cap at 100%
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const DonutChart = ({ data, size = 120 }) => {
    const positiveData = data.filter(item => item.value > 0);
    const total = positiveData.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div style={{width: size, height: size}} className="flex items-center justify-center text-gray-500 text-sm">No Data</div>;
    
    let cumulative = 0;
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {positiveData.map((item, index) => {
                    const dasharray = (item.value / total) * circumference;
                    const dashoffset = cumulative * circumference / total;
                    cumulative += item.value;
                    return (
                        <circle
                            key={index}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            strokeWidth="15"
                            strokeDasharray={`${dasharray} ${circumference - dasharray}`}
                            strokeDashoffset={-dashoffset}
                            className={item.color.replace('bg-', 'stroke-')}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

//-///////////////////////////////////////////////////////////////////////////
// MODAL COMPONENTS
//-///////////////////////////////////////////////////////////////////////////
const AddDataModal = ({ isOpen, onClose, onSave, currentData }) => {
    const [formData, setFormData] = useState(currentData);

    useEffect(() => {
        setFormData(currentData);
    }, [isOpen, currentData]);

    if (!isOpen) return null;
    
    const handleTransactionChange = (e, index, field) => {
        const { value } = e.target;
        const newTransactions = [...formData.recentTransactions];
        const updatedTx = { ...newTransactions[index] };
        
        if (field === 'amount') {
            updatedTx.amount = Number(value);
        } else {
            updatedTx[field] = value;
        }
        
        newTransactions[index] = updatedTx;
        setFormData(prev => ({...prev, recentTransactions: newTransactions}));
    };

    const handleIncomeSourceChange = (e, index, field) => {
        const { value } = e.target;
        const newSources = [...formData.income.sources];
        newSources[index][field] = value;
        setFormData(prev => ({...prev, income: {...prev.income, sources: newSources}}));
    };

    const addIncomeSource = () => {
        const newSource = { id: Date.now(), name: 'New Source', amount: 0, icon: 'dollar', type: 'active' };
        setFormData(prev => ({...prev, income: {...prev.income, sources: [...prev.income.sources, newSource]}}));
    };

    const removeIncomeSource = (id) => {
        setFormData(prev => ({...prev, income: {...prev.income, sources: prev.income.sources.filter(s => s.id !== id)}}));
    };

    const handleAccountChange = (e, index, field, type) => {
        const { value } = e.target;
        const newAccounts = [...formData[type].accounts];
        if (field === 'balance') {
            newAccounts[index].balance = Number(value);
        } else {
            newAccounts[index].name = value;
        }
        setFormData(prev => ({...prev, [type]: {...prev[type], accounts: newAccounts}}));
    };

    const addAccount = (type) => {
        const newAccount = { id: Date.now(), name: 'New Account', balance: 0 };
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                accounts: [...prev[type].accounts, newAccount]
            }
        }));
    };

    const removeAccount = (id, type) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                accounts: prev[type].accounts.filter(acc => acc.id !== id)
            }
        }));
    };

    const addTransaction = () => {
        const newTransaction = { id: Date.now(), description: '', amount: 0, type: 'expense', category: 'personal', date: new Date().toISOString().split('T')[0] };
        setFormData(prev => ({...prev, recentTransactions: [newTransaction, ...prev.recentTransactions] }));
    };

    const removeTransaction = (id) => {
        setFormData(prev => ({
            ...prev,
            recentTransactions: prev.recentTransactions.filter(tx => tx.id !== id)
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Update Your Financials</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-300">Recent Transactions</h3>
                            <button onClick={addTransaction} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg flex items-center text-sm">
                                <Plus className="w-4 h-4 mr-1"/> Add New
                            </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {formData.recentTransactions.map((tx, index) => (
                                <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                                    {tx.type === 'income' ? (
                                        <select value={tx.description} onChange={(e) => handleTransactionChange(e, index, 'description')} className="md:col-span-2 bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                                            <option value="">Select Income Source</option>
                                            {formData.income.sources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" value={tx.description} onChange={(e) => handleTransactionChange(e, index, 'description')} placeholder="Description" className="md:col-span-2 bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                    )}
                                    <input type="number" value={tx.amount} onChange={(e) => handleTransactionChange(e, index, 'amount')} placeholder="Amount" className="bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                    <select value={tx.type} onChange={(e) => handleTransactionChange(e, index, 'type')} className="bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                        <option value="investment">Investment</option>
                                    </select>
                                    <select value={tx.category || 'personal'} onChange={(e) => handleTransactionChange(e, index, 'category')} className="bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                                        <option value="personal">Personal</option>
                                        <option value="business">Business</option>
                                    </select>
                                    <button onClick={() => removeTransaction(tx.id)} className="text-rose-500 hover:text-rose-400 p-2 justify-self-center md:justify-self-end">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-cyan-400">Income Sources</h3>
                                <button onClick={addIncomeSource} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-3 rounded-lg flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1"/> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.income.sources.map((source, index) => (
                                    <div key={source.id} className="flex items-center gap-2">
                                        <input type="text" value={source.name} onChange={(e) => handleIncomeSourceChange(e, index, 'name')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <select value={source.type} onChange={(e) => handleIncomeSourceChange(e, index, 'type')} className="bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                                            <option value="active">Active</option>
                                            <option value="passive">Passive</option>
                                            <option value="dividend">Dividend</option>
                                        </select>
                                        <button onClick={() => removeIncomeSource(source.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-sky-400">Cash on Hand</h3>
                                <button onClick={() => addAccount('cashOnHand')} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-1 px-3 rounded-lg flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1"/> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.cashOnHand.accounts.map((acc, index) => (
                                    <div key={acc.id} className="flex items-center gap-2">
                                        <input type="text" value={acc.name} onChange={(e) => handleAccountChange(e, index, 'name', 'cashOnHand')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <input type="number" value={acc.balance} onChange={(e) => handleAccountChange(e, index, 'balance', 'cashOnHand')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <button onClick={() => removeAccount(acc.id, 'cashOnHand')} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-red-500">Debt Accounts</h3>
                                <button onClick={() => addAccount('debt')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1"/> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.debt.accounts.map((acc, index) => (
                                    <div key={acc.id} className="flex items-center gap-2">
                                        <input type="text" value={acc.name} onChange={(e) => handleAccountChange(e, index, 'name', 'debt')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <input type="number" value={acc.balance} onChange={(e) => handleAccountChange(e, index, 'balance', 'debt')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <button onClick={() => removeAccount(acc.id, 'debt')} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-blue-400">Rainy Day Fund</h3>
                                <button onClick={() => addAccount('rainyDayFund')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1"/> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.rainyDayFund.accounts.map((acc, index) => (
                                    <div key={acc.id} className="flex items-center gap-2">
                                        <input type="text" value={acc.name} onChange={(e) => handleAccountChange(e, index, 'name', 'rainyDayFund')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <input type="number" value={acc.balance} onChange={(e) => handleAccountChange(e, index, 'balance', 'rainyDayFund')} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
                                        <button onClick={() => removeAccount(acc.id, 'rainyDayFund')} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                        Save & Recalculate
                    </button>
                </div>
            </Card>
        </div>
    );
};

const HistoryModal = ({ isOpen, onClose, onViewHistory, transactions }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());

    if (!isOpen) return null;

    const availableYears = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => b - a);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleView = () => {
        onViewHistory({ year, month });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">View History</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400">Year</label>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400">Month</label>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600">
                            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleView} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                        View History
                    </button>
                </div>
            </Card>
        </div>
    );
};

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-800">
                       <AlertTriangle className="h-6 w-6 text-red-300" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white">Reset All Data?</h2>
                    <p className="mt-2 text-gray-400">
                        Are you sure you want to reset all your financial data? This action is irreversible and will restore the dashboard to a blank state.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        onClick={onConfirm}
                    >
                        Reset Data
                    </button>
                </div>
            </Card>
        </div>
    );
};

const EditNetWorthModal = ({ isOpen, onClose, onSave, breakdown }) => {
    const [localBreakdown, setLocalBreakdown] = useState(breakdown);

    useEffect(() => {
        setLocalBreakdown(breakdown);
    }, [isOpen, breakdown]);

    if (!isOpen) return null;

    const handleItemChange = (id, field, value) => {
        const updated = localBreakdown.map(item => {
            if (item.id === id) {
                const newValue = field === 'value' ? Number(value) : value;
                // Ensure liabilities remain negative
                return { ...item, [field]: item.type === 'liability' ? -Math.abs(newValue) : newValue };
            }
            return item;
        });
        setLocalBreakdown(updated);
    };

    const addItem = (type) => {
        const newItem = {
            id: Date.now(),
            name: `New ${type}`,
            value: 0,
            color: type === 'asset' ? 'bg-sky-500' : 'bg-red-500',
            type: type
        };
        setLocalBreakdown([...localBreakdown, newItem]);
    };

    const removeItem = (id) => {
        setLocalBreakdown(localBreakdown.filter(item => item.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Net Worth Breakdown</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-emerald-400">Assets</h3>
                            <button onClick={() => addItem('asset')} className="bg-emerald-600 text-white px-2 py-1 text-xs rounded-md">Add Asset</button>
                        </div>
                        <div className="space-y-2">
                            {localBreakdown.filter(i => i.type === 'asset').map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                                    <input type="number" value={item.value} onChange={e => handleItemChange(item.id, 'value', e.target.value)} className="w-32 bg-gray-700 p-2 rounded-md" />
                                    <button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-red-500">Liabilities</h3>
                            <button onClick={() => addItem('liability')} className="bg-red-600 text-white px-2 py-1 text-xs rounded-md">Add Liability</button>
                        </div>
                        <div className="space-y-2">
                            {localBreakdown.filter(i => i.type === 'liability').map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                                    <input type="number" value={Math.abs(item.value)} onChange={e => handleItemChange(item.id, 'value', e.target.value)} className="w-32 bg-gray-700 p-2 rounded-md" />
                                    <button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave(localBreakdown); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};

const EditExpensesModal = ({ isOpen, onClose, onSave, categories }) => {
    const [localCategories, setLocalCategories] = useState(categories);

    useEffect(() => {
        setLocalCategories(categories);
    }, [isOpen, categories]);

    if (!isOpen) return null;

    const handleCategoryChange = (id, field, value) => {
        setLocalCategories(localCategories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    };

    const addCategory = () => {
        const newCategory = { id: Date.now(), name: 'New Expense', amount: 0, color: 'bg-gray-400' };
        setLocalCategories([...localCategories, newCategory]);
    };

    const removeCategory = (id) => {
        setLocalCategories(localCategories.filter(cat => cat.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Fixed Monthly Expenses</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {localCategories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2">
                            <input type="text" value={cat.name} onChange={e => handleCategoryChange(cat.id, 'name', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                            <input type="number" value={cat.amount} onChange={e => handleCategoryChange(cat.id, 'amount', Number(e.target.value))} className="w-32 bg-gray-700 p-2 rounded-md" />
                            <button onClick={() => removeCategory(cat.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <button onClick={addCategory} className="bg-blue-600 text-white w-full py-2 rounded-md">Add Expense Category</button>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave(localCategories); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};



const EditCreditScoreModal = ({ isOpen, onClose, onSave, currentScore }) => {
    const [score, setScore] = useState(currentScore);

    useEffect(() => {
        setScore(currentScore);
    }, [isOpen, currentScore]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Update Credit Score</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Enter your new credit score (300-850)</label>
                    <input 
                        type="number" 
                        value={score} 
                        onChange={e => setScore(Number(e.target.value))} 
                        className="w-full bg-gray-700 text-white text-2xl font-bold p-3 rounded-lg border-2 border-gray-600 text-center"
                        min="300"
                        max="850"
                    />
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave(score); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Score</button>
                </div>
            </Card>
        </div>
    );
};

const EditGoalsModal = ({ isOpen, onClose, onSave, ffTarget, rdfGoal }) => {
    const [ff, setFf] = useState(ffTarget);
    const [rdf, setRdf] = useState(rdfGoal);

    useEffect(() => {
        setFf(ffTarget);
        setRdf(rdfGoal);
    }, [isOpen, ffTarget, rdfGoal]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Goals</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Financial Freedom Number</label>
                        <input type="number" value={ff} onChange={e => setFf(Number(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Rainy Day Fund Goal</label>
                        <input type="number" value={rdf} onChange={e => setRdf(Number(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave({ ffTarget: ff, rdfGoal: rdf }); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Goals</button>
                </div>
            </Card>
        </div>
    );
};

const EditInvestmentModal = ({ isOpen, onClose, onSave, portfolio }) => {
    const [localPortfolio, setLocalPortfolio] = useState(portfolio);

    useEffect(() => {
        setLocalPortfolio(portfolio);
    }, [isOpen, portfolio]);

    if (!isOpen) return null;

    const handleValueChange = (value) => {
        setLocalPortfolio(prev => ({ ...prev, totalValue: Number(value) }));
    };

    const handleAllocationChange = (id, field, value) => {
        const updatedAllocation = localPortfolio.allocation.map(item => {
            if (item.id === id) {
                return { ...item, [field]: field === 'percentage' ? Number(value) : value };
            }
            return item;
        });
        setLocalPortfolio(prev => ({ ...prev, allocation: updatedAllocation }));
    };

    const addAllocation = () => {
        const newItem = { id: Date.now(), name: 'New Asset', percentage: 0, color: 'bg-gray-500' };
        setLocalPortfolio(prev => ({ ...prev, allocation: [...prev.allocation, newItem] }));
    };

    const removeAllocation = (id) => {
        setLocalPortfolio(prev => ({ ...prev, allocation: prev.allocation.filter(item => item.id !== id) }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Investment Portfolio</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Total Portfolio Value</label>
                        <input type="number" value={localPortfolio.totalValue} onChange={e => handleValueChange(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Asset Allocation</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {localPortfolio.allocation.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <input type="text" value={item.name} onChange={e => handleAllocationChange(item.id, 'name', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                                    <input type="number" value={item.percentage} onChange={e => handleAllocationChange(item.id, 'percentage', e.target.value)} className="w-24 bg-gray-700 p-2 rounded-md" />
                                    <span className="text-gray-400">%</span>
                                    <button onClick={() => removeAllocation(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                         <button onClick={addAllocation} className="bg-blue-600 text-white w-full py-2 rounded-md mt-2">Add Asset</button>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave(localPortfolio); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};

const EditContributionGoalsModal = ({ isOpen, onClose, onSave, tfsaGoal, rrspGoal }) => {
    const [tfsa, setTfsa] = useState(tfsaGoal);
    const [rrsp, setRrsp] = useState(rrspGoal);

    useEffect(() => {
        setTfsa(tfsaGoal);
        setRrsp(rrspGoal);
    }, [isOpen, tfsaGoal, rrspGoal]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Contribution Goals</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">TFSA Contribution Goal</label>
                        <input type="number" value={tfsa} onChange={e => setTfsa(Number(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">RRSP Contribution Goal</label>
                        <input type="number" value={rrsp} onChange={e => setRrsp(Number(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave({ tfsaGoal: tfsa, rrspGoal: rrsp }); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Goals</button>
                </div>
            </Card>
        </div>
    );
};

const SideHustleModal = ({ isOpen, onClose, onSave, businesses }) => {
    const [localBusinesses, setLocalBusinesses] = useState(businesses);

    useEffect(() => {
        setLocalBusinesses(businesses);
    }, [isOpen, businesses]);

    if (!isOpen) return null;

    const handleBusinessChange = (id, field, value) => {
        setLocalBusinesses(localBusinesses.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const addBusiness = () => {
        const newBusiness = {
            id: Date.now(),
            name: "New Side Hustle",
            income: 0,
            expenses: 0,
            net: 0,
            history: [],
            incomeSources: [],
            expenseItems: []
        };
        setLocalBusinesses([...localBusinesses, newBusiness]);
    };

    const removeBusiness = (id) => {
        setLocalBusinesses(localBusinesses.filter(b => b.id !== id));
    };

    const handleItemChange = (businessId, itemId, type, field, value) => {
        setLocalBusinesses(localBusinesses.map(b => {
            if (b.id === businessId) {
                const items = b[type].map(item => {
                    if (item.id === itemId) {
                        return { ...item, [field]: field === 'amount' ? Number(value) : value };
                    }
                    return item;
                });
                return { ...b, [type]: items };
            }
            return b;
        }));
    };

    const addItem = (businessId, type) => {
        const newItem = { id: Date.now(), name: "New Item", amount: 0 };
        setLocalBusinesses(localBusinesses.map(b => {
            if (b.id === businessId) {
                return { ...b, [type]: [...b[type], newItem] };
            }
            return b;
        }));
    };

    const removeItem = (businessId, itemId, type) => {
        setLocalBusinesses(localBusinesses.map(b => {
            if (b.id === businessId) {
                return { ...b, [type]: b[type].filter(item => item.id !== itemId) };
            }
            return b;
        }));
    };
    
    const handleSave = () => {
        onSave(localBusinesses);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Side Hustles</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                    {localBusinesses.map(business => (
                        <div key={business.id} className="p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <input 
                                    type="text" 
                                    value={business.name} 
                                    onChange={e => handleBusinessChange(business.id, 'name', e.target.value)} 
                                    className="text-xl font-bold bg-transparent border-b-2 border-gray-700 focus:border-violet-500 outline-none text-white"
                                />
                                <button onClick={() => removeBusiness(business.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-emerald-400">Income Sources</h4>
                                        <button onClick={() => addItem(business.id, 'incomeSources')} className="text-xs bg-emerald-600 px-2 py-1 rounded-md">Add</button>
                                    </div>
                                    {business.incomeSources.map(item => (
                                        <div key={item.id} className="flex gap-2 mb-2">
                                            <input type="text" value={item.name} onChange={e => handleItemChange(business.id, item.id, 'incomeSources', 'name', e.target.value)} className="w-full bg-gray-700 p-1 rounded-md text-sm" />
                                            <input type="number" value={item.amount} onChange={e => handleItemChange(business.id, item.id, 'incomeSources', 'amount', e.target.value)} className="w-24 bg-gray-700 p-1 rounded-md text-sm" />
                                            <button onClick={() => removeItem(business.id, item.id, 'incomeSources')} className="text-rose-500"><X className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-red-500">Expense Items</h4>
                                        <button onClick={() => addItem(business.id, 'expenseItems')} className="text-xs bg-red-600 px-2 py-1 rounded-md">Add</button>
                                    </div>
                                    {business.expenseItems.map(item => (
                                        <div key={item.id} className="flex gap-2 mb-2">
                                            <input type="text" value={item.name} onChange={e => handleItemChange(business.id, item.id, 'expenseItems', 'name', e.target.value)} className="w-full bg-gray-700 p-1 rounded-md text-sm" />
                                            <input type="number" value={item.amount} onChange={e => handleItemChange(business.id, item.id, 'expenseItems', 'amount', e.target.value)} className="w-24 bg-gray-700 p-1 rounded-md text-sm" />
                                            <button onClick={() => removeItem(business.id, item.id, 'expenseItems')} className="text-rose-500"><X className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                     <button onClick={addBusiness} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">
                        Add New Side Hustle
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                        Save Businesses
                    </button>
                </div>
            </Card>
        </div>
    );
};

const EditHoldingsModal = ({ isOpen, onClose, onSave, holdings }) => {
    const [localHoldings, setLocalHoldings] = useState(holdings);

    useEffect(() => {
        setLocalHoldings(holdings);
    }, [isOpen, holdings]);

    if (!isOpen) return null;

    const handleHoldingChange = (id, field, value) => {
        const updatedHoldings = localHoldings.map(h => {
            if (h.id === id) {
                const isNumberField = ['shares', 'avgCost', 'currentPrice', 'annualDividend'].includes(field);
                return { ...h, [field]: isNumberField ? Number(value) : value };
            }
            return h;
        });
        setLocalHoldings(updatedHoldings);
    };

    const addHolding = () => {
        const newHolding = {
            id: Date.now(),
            ticker: '',
            name: '',
            shares: 0,
            avgCost: 0,
            currentPrice: 0,
            annualDividend: 0,
            type: 'Stock',
            account: 'TFSA'
        };
        setLocalHoldings([...localHoldings, newHolding]);
    };

    const removeHolding = (id) => {
        setLocalHoldings(localHoldings.filter(h => h.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Portfolio Holdings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-9 gap-2 text-xs text-gray-400 font-bold px-2">
                        <span>Ticker</span>
                        <span className="col-span-2">Name</span>
                        <span>Shares</span>
                        <span>Avg. Cost</span>
                        <span>Current Price</span>
                        <span>Annual Div.</span>
                        <span>Account</span>
                        <span></span>
                    </div>
                    <div className="space-y-2">
                        {localHoldings.map(h => (
                            <div key={h.id} className="grid grid-cols-1 md:grid-cols-9 gap-2 items-center bg-gray-900/50 p-2 rounded-lg">
                                <input type="text" placeholder="TICKER" value={h.ticker} onChange={e => handleHoldingChange(h.id, 'ticker', e.target.value)} className="bg-gray-700 p-2 rounded-md" />
                                <input type="text" placeholder="Name" value={h.name} onChange={e => handleHoldingChange(h.id, 'name', e.target.value)} className="col-span-2 bg-gray-700 p-2 rounded-md" />
                                <input type="number" placeholder="Shares" value={h.shares} onChange={e => handleHoldingChange(h.id, 'shares', e.target.value)} className="bg-gray-700 p-2 rounded-md" />
                                <input type="number" placeholder="Avg Cost" value={h.avgCost} onChange={e => handleHoldingChange(h.id, 'avgCost', e.target.value)} className="bg-gray-700 p-2 rounded-md" />
                                <input type="number" placeholder="Price" value={h.currentPrice} onChange={e => handleHoldingChange(h.id, 'currentPrice', e.target.value)} className="bg-gray-700 p-2 rounded-md" />
                                <input type="number" placeholder="Dividend" value={h.annualDividend} onChange={e => handleHoldingChange(h.id, 'annualDividend', e.target.value)} className="bg-gray-700 p-2 rounded-md" />
                                <select value={h.account} onChange={e => handleHoldingChange(h.id, 'account', e.target.value)} className="bg-gray-700 p-2 rounded-md">
                                    <option>TFSA</option>
                                    <option>RRSP</option>
                                    <option>Margin</option>
                                    <option>Other</option>
                                </select>
                                <button onClick={() => removeHolding(h.id)} className="text-red-500 hover:text-red-400 p-2 flex justify-center"><Trash2 className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                </div>
                 <button onClick={addHolding} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Add New Holding
                </button>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => { onSave(localHoldings); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Save Holdings</button>
                </div>
            </Card>
        </div>
    );
};


//-///////////////////////////////////////////////////////////////////////////
// MAIN COMPONENTS
//-///////////////////////////////////////////////////////////////////////////

const FinancialFreedomCard = ({ data, onEdit }) => {
  const { targetAmount } = data.financialFreedom;
  const currentSavings = data.netWorth.total;
  const percentage = targetAmount > 0 ? Math.min((currentSavings / targetAmount) * 100, 100) : 0; // Cap at 100%

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6 bg-gradient-to-br from-emerald-900/50 to-green-900/50">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
            <Target className="w-6 h-6 mr-3 text-emerald-400" />
            Road to Financial Freedom
        </h2>
        <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>
      </div>
      <p className="text-gray-300 mb-6">Your progress towards your ultimate financial goal.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center">
            <div className="relative">
                 <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" className="text-gray-700" fill="transparent" />
                    <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-emerald-500"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - (percentage > 0 ? percentage : 0) / 100)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                    {percentage.toFixed(1)}%
                </div>
            </div>
            <p className="text-gray-300 mt-2">Completed</p>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-300">Current Savings</span>
            <span className="font-bold text-white text-2xl">${currentSavings.toLocaleString()}</span>
          </div>
          <ProgressBar value={currentSavings} maxValue={targetAmount} color="bg-emerald-500" />
          <div className="flex justify-between items-baseline">
            <span className="text-gray-300">Freedom Number</span>
            <span className="font-bold text-emerald-400 text-2xl">${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const NetWorthCard = ({ data, onEdit }) => {
  const { total, breakdown } = data;
  const assets = breakdown.filter(item => item.type === 'asset');
  const liabilities = breakdown.filter(item => item.type === 'liability');

  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-emerald-400" />
            Net Worth
          </h2>
          <p className="text-5xl font-extrabold text-white">${total.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end">
            <button onClick={onEdit} className="text-gray-400 hover:text-white mb-2"><Edit size={18}/></button>
            <DonutChart data={assets} size={100} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-8">
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Assets</h3>
            {assets.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-white">${item.value.toLocaleString()}</span>
              </div>
            ))}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Liabilities</h3>
            {liabilities.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-red-500">${Math.abs(item.value).toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

const IncomeCard = ({ data, timeframe, historicalDate }) => {
    let displayTitle = "Monthly Income";
    if (timeframe === 'historical' && historicalDate) {
        const monthName = new Date(historicalDate.year, historicalDate.month).toLocaleString('default', { month: 'long' });
        displayTitle = `Income for ${monthName} ${historicalDate.year}`;
    } else if (timeframe === 'annual') {
        displayTitle = "Annual Income";
    }
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-cyan-900/30 to-sky-900/30">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <ArrowUp className="w-6 h-6 mr-3 text-cyan-400" />
          {displayTitle}
        </h2>

      </div>
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
};

const ExpensesCard = ({ data, timeframe, historicalDate, onEdit }) => {
    let displayTitle = "Monthly Expenses";
    if (timeframe === 'historical') {
        displayTitle = "Expenses (from transactions)";
    } else if (timeframe === 'annual') {
        displayTitle = "Annual Expenses (from transactions)";
    }
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-red-900/40 to-rose-900/40">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center">
            <ArrowDown className="w-6 h-6 mr-3 text-red-500" />
            {displayTitle}
        </h2>
        {timeframe === 'monthly' && <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>}
      </div>
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
};

const CardWithTimeframe = ({ title, icon, color, data, timeframe, historicalDate, bgColor = '' }) => {
    let displayTitle = title;
    if (timeframe === 'historical' && historicalDate) {
        const monthName = new Date(historicalDate.year, historicalDate.month).toLocaleString('default', { month: 'long' });
        displayTitle = `${title} for ${monthName} ${historicalDate.year}`;
    } else {
        displayTitle = `${timeframe === 'annual' ? 'Annual' : 'Monthly'} ${title}`;
    }

    const isPositive = data.total >= 0;

    return (
        <Card className={`col-span-1 md:col-span-2 ${bgColor}`}>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                {React.cloneElement(icon, { className: `w-6 h-6 mr-3 ${color}` })}
                {displayTitle}
            </h2>
            <p className={`text-5xl font-extrabold ${title === 'Cashflow' ? (isPositive ? 'text-amber-400' : 'text-red-500') : 'text-white'}`}>
                {title === 'Cashflow' ? (isPositive ? '+' : '-') : ''}${Math.abs(data.total).toLocaleString()}
            </p>
        </Card>
    );
};

const InvestmentAccountsCard = ({ data, onEdit }) => {
    const { tfsaContribution, tfsaGoal, rrspContribution, rrspGoal } = data;
    return (
        <Card className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <PiggyBank className="w-6 h-6 mr-3 text-fuchsia-500" />
                    Registered Accts
                </h2>
                <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-gray-400">TFSA Contribution</p>
                    <p className="text-2xl font-bold text-white">${tfsaContribution.toLocaleString()}</p>
                    <ProgressBar value={tfsaContribution} maxValue={tfsaGoal} color="bg-fuchsia-500" />
                    <div className="flex justify-end text-xs text-gray-400 mt-1">
                        <span>Goal: ${tfsaGoal.toLocaleString()}</span>
                    </div>
                </div>
                <div>
                    <p className="text-gray-400">RRSP Contribution</p>
                    <p className="text-2xl font-bold text-white">${rrspContribution.toLocaleString()}</p>
                    <ProgressBar value={rrspContribution} maxValue={rrspGoal} color="bg-fuchsia-500" />
                     <div className="flex justify-end text-xs text-gray-400 mt-1">
                        <span>Goal: ${rrspGoal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const AccountBreakdownCard = ({ holdings }) => {
    const accountTotals = holdings.reduce((acc, holding) => {
        const value = holding.shares * holding.currentPrice;
        if (!acc[holding.account]) {
            acc[holding.account] = 0;
        }
        acc[holding.account] += value;
        return acc;
    }, {});

    const accountData = Object.entries(accountTotals).map(([name, value]) => ({ name, value }));
    const total = accountData.reduce((sum, acc) => sum + acc.value, 0);

    const accountColors = {
        'TFSA': 'bg-emerald-500',
        'RRSP': 'bg-sky-500',
        'Margin': 'bg-amber-500',
        'Other': 'bg-gray-500'
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart2 className="w-6 h-6 mr-3 text-violet-400" />
                Account Breakdown
            </h2>
            <div className="space-y-2">
                {accountData.map(acc => (
                    <div key={acc.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold">{acc.name}</span>
                            <span className="font-mono">${acc.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <ProgressBar value={acc.value} maxValue={total} color={accountColors[acc.name] || 'bg-gray-500'} />
                    </div>
                ))}
            </div>
        </Card>
    );
};

const CashOnHandCard = ({ data }) => {
    const { total, accounts } = data;
    return (
        <Card className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <Wallet className="w-6 h-6 mr-3 text-sky-400" />
                Cash on Hand
            </h2>
            <p className="text-5xl font-extrabold text-white">${total.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{acc.name}</span>
                        <span className="font-semibold text-white">${acc.balance.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const DebtCard = ({ data }) => {
    const { total, accounts } = data;
    return (
        <Card className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-red-500" />
                Total Debt
            </h2>
            <p className="text-5xl font-extrabold text-red-500">${total.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{acc.name}</span>
                        <span className="font-semibold text-white">${acc.balance.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const RainyDayFundCard = ({ data, expensesTotal, onEdit }) => {
    const { total, goal } = data;
    const monthsCovered = expensesTotal > 0 ? total / expensesTotal : 0;

    return (
        <Card className="col-span-1 md:col-span-2">
             <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <Umbrella className="w-6 h-6 mr-3 text-blue-400" />
                    Rainy Day Fund
                </h2>
                <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>
            </div>
            <p className="text-5xl font-extrabold text-white">${total.toLocaleString()}</p>
            <div className="mt-4">
                <ProgressBar value={total} maxValue={goal} color="bg-blue-400" />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>${total.toLocaleString()}</span>
                    <span>Goal: ${goal.toLocaleString()}</span>
                </div>
            </div>
            <div className="mt-4 text-center bg-gray-900/50 p-2 rounded-lg">
                <p className="text-lg font-bold text-blue-300">{monthsCovered.toFixed(1)} Months</p>
                <p className="text-xs text-gray-400">of expenses covered</p>
            </div>
        </Card>
    );
};

const SavingsRateCard = ({ savingsRate }) => {
    const getRateColor = (rate) => {
        if (rate >= 20) return 'text-emerald-400';
        if (rate >= 10) return 'text-lime-400';
        if (rate >= 0) return 'text-yellow-400';
        return 'text-red-500';
    };
    const color = getRateColor(savingsRate);

    return (
        <Card className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className={`w-6 h-6 mr-3 ${color}`} />
                Savings Rate
            </h2>
            <div className="text-center">
                <p className={`text-6xl font-extrabold ${color}`}>{savingsRate.toFixed(1)}%</p>
                <p className="text-gray-400">of your income is being saved/invested.</p>
            </div>
        </Card>
    );
};


const BusinessCard = ({ data, onEdit }) => {
    const isPositive = data.net >= 0;
    return (
        <Card className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <Building className="w-6 h-6 mr-3 text-violet-500" />
                    All Side Hustles
                </h2>
                <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-gray-400">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-400">${data.income.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500">${data.expenses.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400">Total Net Profit</p>
                    <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}${Math.abs(data.net).toLocaleString()}
                    </p>
                </div>
            </div>
        </Card>
    );
};


const InvestmentCard = ({ data, onEdit }) => {
  const { totalValue, allocation } = data;
  return (
    <Card className="col-span-1 md:col-span-3 lg:col-span-3">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <Briefcase className="w-6 h-6 mr-3 text-amber-400" />
                    Investment Portfolio
                </h2>
                <p className="text-5xl font-extrabold text-white">${totalValue.toLocaleString()}</p>
            </div>
             <div className="flex flex-col items-end">
                <button onClick={onEdit} className="text-gray-400 hover:text-white mb-2"><Edit size={18}/></button>
                <DonutChart data={allocation.map(a => ({...a, value: a.percentage}))} size={100} />
            </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
            {allocation.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${asset.color}`}></span>
                  <span className="text-gray-300">{asset.name}</span>
                </div>
                <span className="font-semibold text-white">{asset.percentage}%</span>
              </div>
            ))}
        </div>
    </Card>
  );
};

const TransactionsCard = ({ data }) => {
  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Repeat className="w-6 h-6 mr-3 text-gray-400" />
        Recent Transactions
      </h2>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {data.sort((a, b) => new Date(b.date) - new Date(a.date)).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">{tx.description}</p>
              <p className="text-sm text-gray-500">{tx.date}</p>
            </div>
            <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const HistoryChartCard = ({ title, data, dataKey, color, icon, yDomain = null }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const tailwindColors = {
        'emerald-400': '#34d399',
        'sky-400': '#38bdf8',
        'red-500': '#ef4444',
        'violet-500': '#8b5cf6'
    };
    const strokeColor = tailwindColors[color.replace('text-', '')] || '#ffffff';

    useEffect(() => {
        if (!data || data.length < 2) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        };

        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const parsedData = sortedData.map(d => ({ ...d, date: new Date(d.date) }));

        const width = svgRef.current.parentElement.offsetWidth;
        const height = 260;
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .html(""); // Clear previous renders

        const x = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain(yDomain || [0, d3.max(parsedData, d => d[dataKey]) * 1.1 || 10])
            .range([height - margin.bottom, margin.top]);

        const formatYAxis = d3.format("~s");

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10))
            .attr("class", "text-gray-400");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10).tickFormat(d => dataKey === 'score' ? d : `$${formatYAxis(d)}`))
            .attr("class", "text-gray-400");
        
        svg.selectAll(".domain").remove();

        const area = d3.area()
            .x(d => x(d.date))
            .y0(height - margin.bottom)
            .y1(d => y(d[dataKey]));
        
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d[dataKey]));

        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", `gradient-${dataKey}-${title.replace(/\s+/g, '-')}`)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", strokeColor).attr("stop-opacity", 0.4);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", strokeColor).attr("stop-opacity", 0);

        svg.append("path")
            .datum(parsedData)
            .attr("fill", `url(#gradient-${dataKey}-${title.replace(/\s+/g, '-')})`)
            .attr("d", area);

        svg.append("path")
            .datum(parsedData)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 2.5)
            .attr("d", line);

        const tooltip = d3.select(tooltipRef.current);

        svg.selectAll("dot")
            .data(parsedData)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d[dataKey]))
            .attr("fill", strokeColor)
            .attr("stroke", "#1f2937")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
            })
            .on("mousemove", (event, d) => {
                tooltip.html(`
                    <div class="font-bold text-white">${dataKey === 'score' ? '' : '$'}${d[dataKey].toLocaleString()}</div>
                    <div class="text-xs text-gray-300">${d.date.toLocaleDateString()}</div>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

    }, [data, dataKey, color, yDomain, title]);

    if (!data || data.length < 2) {
        return (
             <Card className="col-span-1 md:col-span-3">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                     {React.cloneElement(icon, { className: `w-6 h-6 mr-3 ${color}` })}
                     {title} Over Time
                </h2>
                <div className="flex justify-center items-center h-[260px] bg-gray-900/50 p-4 rounded-lg text-gray-500">
                    Not enough data to display a chart.
                </div>
             </Card>
        )
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                {React.cloneElement(icon, { className: `w-6 h-6 mr-3 ${color}` })}
                {title} Over Time
            </h2>
            <div className="relative">
                <svg ref={svgRef}></svg>
                <div ref={tooltipRef} className="absolute bg-gray-700 text-white text-sm rounded-lg p-2 shadow-lg transition-opacity duration-200" style={{opacity: 0, pointerEvents: 'none'}}></div>
            </div>
        </Card>
    );
};

const CreditScoreCard = ({ score, onEdit }) => {
    const getScoreColor = (s) => {
        if (s >= 800) return 'text-emerald-400';
        if (s >= 740) return 'text-green-400';
        if (s >= 670) return 'text-lime-400';
        if (s >= 580) return 'text-yellow-400';
        return 'text-red-500';
    };
    const getScoreTier = (s) => {
        if (s >= 800) return 'Exceptional';
        if (s >= 740) return 'Very Good';
        if (s >= 670) return 'Good';
        if (s >= 580) return 'Fair';
        return 'Poor';
    };
    
    const color = getScoreColor(score);
    const tier = getScoreTier(score);
    const percentage = ((score - 300) / (850 - 300)) * 100;

    return (
        <Card className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <ShieldCheck className={`w-6 h-6 mr-3 ${color}`} />
                    Credit Score
                </h2>
                <button onClick={onEdit} className="text-gray-400 hover:text-white"><Edit size={18}/></button>
            </div>
            <div className="text-center">
                <p className={`text-6xl font-extrabold ${color}`}>{score}</p>
                <p className={`font-semibold ${color}`}>{tier}</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div className={`${color.replace('text-','bg-')} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </Card>
    );
};


const AllocationsCalculator = ({ allocations, setAllocations, onSave }) => {
    const [income, setIncome] = useState(10000);
    const [showSuccess, setShowSuccess] = useState(false);

    const totalPercentage = Object.values(allocations).reduce((sum, val) => sum + Number(val), 0);

    const handlePercentageChange = (jar, value) => {
        const newAllocations = { ...allocations, [jar]: Number(value) || 0 };
        setAllocations(newAllocations);
    };
    
    const handleSave = () => {
        onSave();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }

    const jarDetails = {
        necessities: { name: "Necessities (NEC)", color: "text-sky-400" },
        financialFreedom: { name: "Financial Freedom (FFA)", color: "text-emerald-400" },
        longTermSavings: { name: "Long-Term Savings (LTSS)", color: "text-amber-400" },
        education: { name: "Education (EDU)", color: "text-teal-400" },
        play: { name: "Play", color: "text-fuchsia-500" },
        give: { name: "Give", color: "text-lime-400" },
    };

    return (
        <Card className="col-span-1 md:col-span-6 lg:col-span-6">
             <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Calculator className="w-6 h-6 mr-3 text-emerald-400" />
                    Income Allocation Jars
                </h2>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm transition-all duration-300">
                    <Save className="w-4 h-4 mr-2"/> 
                    {showSuccess ? 'Saved!' : 'Save Percentages'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-lg font-semibold text-gray-300 mb-2">Enter Monthly Income</label>
                    <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(Number(e.target.value))}
                            className="w-full bg-gray-900 text-white text-2xl font-bold p-3 pl-12 rounded-lg border-2 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g., 10000"
                        />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    {totalPercentage !== 100 && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-3"/>
                            Total percentage is {totalPercentage}%. It should be 100%.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(allocations).map(([jar, percentage]) => (
                    <div key={jar} className="bg-gray-900/60 p-4 rounded-xl">
                        <h3 className={`text-lg font-bold ${jarDetails[jar].color}`}>{jarDetails[jar].name}</h3>
                        <div className="flex items-center mt-2 gap-4">
                            <input
                                type="number"
                                value={percentage}
                                onChange={(e) => handlePercentageChange(jar, e.target.value)}
                                className="w-20 bg-gray-700 text-white text-center p-2 rounded-md border border-gray-600"
                            />
                            <span className="text-gray-400 text-2xl">%</span>
                            <div className="flex-grow text-right">
                                <p className="text-2xl font-bold text-white">${((income * percentage) / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const FinancialFreedomCalculator = ({ data, onSave }) => {
    const [inputs, setInputs] = useState(data);
    const [projection, setProjection] = useState({ years: 0, finalValue: 0, data: [] });

    useEffect(() => {
        setInputs(data);
    }, [data]);

    useEffect(() => {
        const { targetAmount, currentInvestments, monthlyContribution, annualReturn } = inputs;
        if (targetAmount > 0 && annualReturn > 0) {
            let futureValue = currentInvestments;
            let months = 0;
            const monthlyReturn = annualReturn / 100 / 12;
            const startDate = new Date();
            const projectionData = [{ date: startDate.toISOString().split('T')[0], value: currentInvestments }];

            while (futureValue < targetAmount && months < 1200) { // Cap at 100 years
                futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
                months++;
                if (months % 12 === 0) {
                    const futureDate = new Date(startDate);
                    futureDate.setFullYear(startDate.getFullYear() + (months / 12));
                    projectionData.push({ date: futureDate.toISOString().split('T')[0], value: futureValue });
                }
            }
             if (futureValue < targetAmount) { // If not reached in 100 years
                setProjection({ years: Infinity, finalValue: futureValue, data: projectionData });
            } else {
                setProjection({ years: months / 12, finalValue: futureValue, data: projectionData });
            }
        } else {
             setProjection({ years: 0, finalValue: currentInvestments, data: [{ date: new Date().toISOString().split('T')[0], value: currentInvestments }] });
        }
    }, [inputs]);

    const handleInputChange = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: Number(value) }));
    };

    return (
        <Card className="col-span-1 md:col-span-6 lg:col-span-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Target className="w-6 h-6 mr-3 text-emerald-400" />
                    Financial Freedom Calculator
                </h2>
                <button onClick={() => onSave(inputs)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm">
                    <Save className="w-4 h-4 mr-2"/> Save Calculator Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400">Freedom Number ($)</label>
                        <input type="number" value={inputs.targetAmount} onChange={e => handleInputChange('targetAmount', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400">Current Investments ($)</label>
                        <input type="number" value={inputs.currentInvestments} onChange={e => handleInputChange('currentInvestments', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400">Monthly Contribution ($)</label>
                        <input type="number" value={inputs.monthlyContribution} onChange={e => handleInputChange('monthlyContribution', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400">Expected Annual Return (%)</label>
                        <input type="number" value={inputs.annualReturn} onChange={e => handleInputChange('annualReturn', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-gray-400">Time to Freedom</p>
                        <p className="text-3xl font-bold text-emerald-400">
                            {isFinite(projection.years) ? `${projection.years.toFixed(1)} Years` : 'Over 100 years'}
                        </p>
                    </div>
                </div>
                <div>
                     <HistoryChartCard title="Investment Growth" data={projection.data} dataKey="value" color="text-emerald-400" icon={<TrendingUp/>} />
                </div>
            </div>
        </Card>
    );
};

      const BudgetCalculatorTab = () => {
  const [budgetType, setBudgetType] = useState('50-30-20');
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  
  // 50/30/20 Budget
  const fiftyThirtyTwenty = {
    needs: Math.round(monthlyIncome * 0.5),
    wants: Math.round(monthlyIncome * 0.3),
    savings: Math.round(monthlyIncome * 0.2)
  };
  
  // 6 Jars System
  const sixJars = {
    necessities: Math.round(monthlyIncome * 0.55),
    financialFreedom: Math.round(monthlyIncome * 0.10),
    longTermSavings: Math.round(monthlyIncome * 0.10),
    education: Math.round(monthlyIncome * 0.10),
    play: Math.round(monthlyIncome * 0.10),
    give: Math.round(monthlyIncome * 0.05)
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">💰 Budget Calculator</h2>
        
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">Monthly Income</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
            placeholder="Enter your monthly income"
          />
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setBudgetType('50-30-20')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              budgetType === '50-30-20' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            50/30/20 Rule
          </button>
          <button
            onClick={() => setBudgetType('6-jars')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              budgetType === '6-jars' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            6 Jars System
          </button>
        </div>
        
        {budgetType === '50-30-20' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-2">💡 Needs (50%)</h3>
              <p className="text-3xl font-bold text-white">${fiftyThirtyTwenty.needs.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Rent, groceries, utilities, minimum debt payments</p>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">🎯 Wants (30%)</h3>
              <p className="text-3xl font-bold text-white">${fiftyThirtyTwenty.wants.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Entertainment, dining out, hobbies, non-essential shopping</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">💰 Savings (20%)</h3>
              <p className="text-3xl font-bold text-white">${fiftyThirtyTwenty.savings.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Emergency fund, retirement, investments, debt payoff</p>
            </div>
          </div>
        )}
        
        {budgetType === '6-jars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-2">🏠 Necessities (55%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.necessities.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Housing, food, transportation, utilities</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">🚀 Financial Freedom (10%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.financialFreedom.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Investments, income-generating assets</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🎯 Long-Term Savings (10%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.longTermSavings.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Emergency fund, major purchases</p>
            </div>
            <div className="bg-amber-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-400 mb-2">📚 Education (10%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.education.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Courses, books, skill development</p>
            </div>
            <div className="bg-pink-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-pink-400 mb-2">🎉 Play (10%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.play.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Entertainment, hobbies, fun activities</p>
            </div>
            <div className="bg-teal-900/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-teal-400 mb-2">❤️ Give (5%)</h3>
              <p className="text-3xl font-bold text-white">${sixJars.give.toLocaleString()}</p>
              <p className="text-gray-300 text-sm mt-2">Charity, gifts, helping others</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-2">💡 Budget Tips</h4>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• Start with the 50/30/20 rule if you're new to budgeting</li>
            <li>• The 6 jars system gives more detailed allocation for specific goals</li>
            <li>• Adjust percentages based on your personal situation</li>
            <li>• Track your actual spending to see how you're doing</li>
            <li>• Review and adjust your budget monthly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const SideHustleTab = ({ businesses, onEdit, allTransactions }) => {
    const [selectedYear, setSelectedYear] = useState('all');
    const [annualData, setAnnualData] = useState([]);

    const availableYears = [...new Set(allTransactions
        .filter(tx => tx.category === 'business')
        .map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => b - a);

    useEffect(() => {
        const calculatedData = businesses.map(business => {
            const businessIncomeSources = business.incomeSources.map(s => s.name);

            const incomeTransactions = allTransactions.filter(tx => 
                tx.type === 'income' &&
                tx.category === 'business' &&
                businessIncomeSources.includes(tx.description) &&
                (selectedYear === 'all' || new Date(tx.date).getFullYear() === parseInt(selectedYear))
            );
            
            const businessExpenseItems = business.expenseItems.map(e => e.name);

            const expenseTransactions = allTransactions.filter(tx =>
                tx.type === 'expense' &&
                tx.category === 'business' &&
                businessExpenseItems.includes(tx.description) &&
                (selectedYear === 'all' || new Date(tx.date).getFullYear() === parseInt(selectedYear))
            );

            const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
            const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

            return {
                ...business,
                income: totalIncome,
                expenses: totalExpenses,
                net: totalIncome - totalExpenses,
                filteredIncomeTransactions: incomeTransactions,
                filteredExpenseTransactions: expenseTransactions
            };
        });
        setAnnualData(calculatedData);
    }, [selectedYear, businesses, allTransactions]);

    return (
        <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Side Hustle Report</h2>
                <div className="flex items-center gap-4">
                    <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                    >
                        <option value="all">All Time</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <button onClick={onEdit} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                        <Edit className="w-4 h-4 mr-2"/> Manage Businesses
                    </button>
                </div>
            </div>
            {annualData.map(business => {
                 const isPositive = business.net >= 0;
                 return (
                    <Card key={business.id}>
                        <h3 className="text-2xl font-bold text-violet-400 mb-4">{business.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <p className="text-gray-400">Total Income</p>
                                <p className="text-3xl font-bold text-emerald-400">${business.income.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <p className="text-gray-400">Total Expenses</p>
                                <p className="text-3xl font-bold text-red-500">${business.expenses.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <p className="text-gray-400">Net Profit</p>
                                <p className={`text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {isPositive ? '+' : '-'}${Math.abs(business.net).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Income Transactions</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                    {business.filteredIncomeTransactions.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-800/50 rounded">
                                            <span>{item.description} <span className="text-gray-500 text-xs">{item.date}</span></span>
                                            <span className="font-mono text-emerald-400">${item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Expense Transactions</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                    {business.filteredExpenseTransactions.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-800/50 rounded">
                                            <span>{item.description} <span className="text-gray-500 text-xs">{item.date}</span></span>
                                            <span className="font-mono text-red-500">${Math.abs(item.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    );
};

const InvestmentTab = ({ portfolio, onSaveHoldings, openEditHoldingsModal }) => {
    const { holdings, totalValue, allocation, history } = portfolio;

    const totalCostBasis = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const totalAnnualDividend = holdings.reduce((sum, h) => sum + (h.shares * h.annualDividend), 0);
    const yieldOnCost = totalCostBasis > 0 ? (totalAnnualDividend / totalCostBasis) * 100 : 0;

    return (
        <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Investment Portfolio</h2>
                <button onClick={openEditHoldingsModal} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <Edit className="w-4 h-4 mr-2"/> Manage Holdings
                </button>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center"><p className="text-gray-400">Total Value</p><p className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></Card>
                <Card className="text-center"><p className="text-gray-400">Gain / Loss</p><p className={`text-3xl font-bold ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString(undefined, {minimumFractionDigits: 2})}</p></Card>
                <Card className="text-center"><p className="text-gray-400">Annual Dividend</p><p className="text-3xl font-bold text-cyan-400">${totalAnnualDividend.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></Card>
                <Card className="text-center"><p className="text-gray-400">Yield on Cost</p><p className="text-3xl font-bold text-cyan-400">{yieldOnCost.toFixed(2)}%</p></Card>
            </div>

            {/* Detailed Holdings Table */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Holdings</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                            <tr>
                                <th className="p-3">Holding</th>
                                <th className="p-3">Account</th>
                                <th className="p-3 text-right">Market Value</th>
                                <th className="p-3 text-right">Cost Basis</th>
                                <th className="p-3 text-right">Total Return</th>
                                <th className="p-3 text-right">Annual Dividend</th>
                                <th className="p-3">DRIP Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map(h => {
                                const marketValue = h.shares * h.currentPrice;
                                const costBasis = h.shares * h.avgCost;
                                const gainLoss = marketValue - costBasis;
                                const annualDividend = h.shares * h.annualDividend;
                                const sharesFromDrip = h.currentPrice > 0 ? annualDividend / h.currentPrice : 0;
                                const dripProgress = (sharesFromDrip % 1) * 100;

                                return (
                                    <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="p-3"><div className="font-bold">{h.ticker}</div><div className="text-xs text-gray-400">{h.name}</div></td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${h.account === 'TFSA' ? 'bg-emerald-800 text-emerald-300' : h.account === 'RRSP' ? 'bg-sky-800 text-sky-300' : 'bg-gray-700 text-gray-300'}`}>{h.account}</span></td>
                                        <td className="p-3 text-right font-mono">${marketValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right font-mono">${costBasis.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className={`p-3 text-right font-mono ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{gainLoss >= 0 ? '+' : '-'}${Math.abs(gainLoss).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right font-mono text-cyan-400">${annualDividend.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 w-48">
                                            <div className="flex items-center gap-2">
                                                <ProgressBar value={dripProgress} maxValue={100} color="bg-green-500" />
                                                <span className="text-xs font-mono">{dripProgress.toFixed(1)}%</span>
                                            </div>
                                            <div className="text-xs text-gray-500 text-center">To next share</div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Portfolio Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">Asset Allocation</h3>
                    <div className="flex justify-center">
                        <DonutChart data={allocation.map(a => ({...a, value: a.percentage}))} size={200} />
                    </div>
                </Card>
                <HistoryChartCard title="Portfolio Growth" data={history} dataKey="total" color="text-violet-500" icon={<TrendingUp/>} />
            </div>
        </div>
    )
}

//-///////////////////////////////////////////////////////////////////////////
// MAIN APP
//-///////////////////////////////////////////////////////////////////////////

export default function App() {
  const [data, setData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
  const [historicalDate, setHistoricalDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditNetWorthModalOpen, setIsEditNetWorthModalOpen] = useState(false);
  const [isEditExpensesModalOpen, setIsEditExpensesModalOpen] = useState(false);

  const [isEditCreditScoreModalOpen, setIsEditCreditScoreModalOpen] = useState(false);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  const [isEditInvestmentModalOpen, setIsEditInvestmentModalOpen] = useState(false);
  const [isEditContributionGoalsModalOpen, setIsEditContributionGoalsModalOpen] = useState(false);
  const [isSideHustleModalOpen, setIsSideHustleModalOpen] = useState(false);
  const [isEditHoldingsModalOpen, setIsEditHoldingsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allocations, setAllocations] = useState(initialData.allocations);

  const recalculateTotals = (sourceData, view) => {
    const newData = JSON.parse(JSON.stringify(sourceData)); 
    
    // Ensure all required properties exist with default values
    if (!Array.isArray(newData.businesses)) newData.businesses = [];
    if (!newData.investmentPortfolio) newData.investmentPortfolio = {};
    if (!newData.investmentPortfolio.holdings) newData.investmentPortfolio.holdings = [];
    if (!Array.isArray(newData.recentTransactions)) newData.recentTransactions = [];
    if (!newData.income) newData.income = { total: 0, sources: [] };
    if (!Array.isArray(newData.income.sources)) newData.income.sources = [];
    if (!newData.expenses) newData.expenses = { total: 0, categories: [] };
    if (!Array.isArray(newData.expenses.categories)) newData.expenses.categories = [];
    if (!newData.passiveIncome) newData.passiveIncome = { total: 0 };
    if (!newData.dividends) newData.dividends = { total: 0 };
    if (!newData.cashflow) newData.cashflow = { total: 0 };
    const now = new Date();
    
    let filteredTransactions;
    if (view.timeframe === 'monthly') {
        filteredTransactions = newData.recentTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        });
    } else if (view.timeframe === 'historical' && view.date) {
        filteredTransactions = newData.recentTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === view.date.month && txDate.getFullYear() === view.date.year;
        });
    } else { // annual
        filteredTransactions = newData.recentTransactions;
    }

    const incomeTransactions = filteredTransactions.filter(tx => tx.type === 'income');
    const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'expense');
    const investmentTransactions = filteredTransactions.filter(tx => tx.type === 'investment');
    
    newData.income.sources.forEach(s => s.amount = 0);
    incomeTransactions.forEach(tx => {
        const source = newData.income.sources.find(s => s.name === tx.description);
        if (source) {
            source.amount += tx.amount;
        }
    });

    newData.income.total = incomeTransactions.filter(tx => tx.category !== 'business').reduce((sum, tx) => sum + tx.amount, 0);
    
    if (view.timeframe === 'monthly') {
        newData.expenses.total = newData.expenses.categories.reduce((sum, cat) => sum + cat.amount, 0);
    } else {
        newData.expenses.total = expenseTransactions.filter(tx => tx.category !== 'business').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    }
    
    const totalInvestmentAmount = investmentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    newData.passiveIncome.total = newData.income.sources.filter(s => s.type === 'passive').reduce((sum, s) => sum + s.amount, 0);
    newData.dividends.total = newData.income.sources.filter(s => s.type === 'dividend').reduce((sum, s) => sum + s.amount, 0);
    
    newData.cashflow.total = newData.income.total - newData.expenses.total + totalInvestmentAmount;

    newData.businesses.forEach(business => {
        // Ensure business has required properties
        if (!Array.isArray(business.incomeSources)) business.incomeSources = [];
        if (!Array.isArray(business.expenseItems)) business.expenseItems = [];
        
        business.income = business.incomeSources.reduce((sum, item) => sum + (item.amount || 0), 0);
        business.expenses = business.expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        business.net = business.income - business.expenses;
    });

    newData.cashOnHand.total = newData.cashOnHand.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    newData.rainyDayFund.total = newData.rainyDayFund.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    newData.debt.total = newData.debt.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const allInvestmentTransactions = newData.recentTransactions.filter(tx => tx.type === 'investment');
    newData.investmentPortfolio.tfsaContribution = allInvestmentTransactions.filter(tx => tx.investmentType === 'tfsa').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    newData.investmentPortfolio.rrspContribution = allInvestmentTransactions.filter(tx => tx.investmentType === 'rrsp').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    newData.investmentPortfolio.totalValue = newData.investmentPortfolio.holdings.reduce((sum, h) => sum + ((h.shares || 0) * (h.currentPrice || 0)), 0);

    // Safely update net worth breakdown
    const cashItem = newData.netWorth.breakdown.find(b => b.name === 'Cash');
    if (cashItem) {
      cashItem.value = newData.cashOnHand.total;
      console.log("💰 Auto-updated Cash value:", cashItem.value);
    }
    
    const investmentItem = newData.netWorth.breakdown.find(b => b.name === 'Investments');
    if (investmentItem) {
      investmentItem.value = newData.investmentPortfolio.totalValue;
      console.log("💰 Auto-updated Investment value:", investmentItem.value);
    }
    
    // Log all breakdown items to debug
    console.log("💰 Full net worth breakdown:", newData.netWorth.breakdown);
    
    newData.netWorth.total = newData.netWorth.breakdown.reduce((sum, b) => sum + (b.value || 0), 0);

    const totalSavings = Math.abs(investmentTransactions.reduce((sum, tx) => sum + tx.amount, 0));
    const totalIncomeForSavingsRate = newData.income.total + newData.businesses.reduce((sum, b) => sum + b.net, 0);
    newData.savingsRate = totalIncomeForSavingsRate > 0 ? (totalSavings / totalIncomeForSavingsRate) * 100 : 0;

    return newData;
  };

  // Handles Authentication
  useEffect(() => {
    const signInUser = async () => {
      try {
        let initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
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
  }, []); // Runs once on mount

  // Handles Data Fetching, depends on userId
  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
    
    const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
      console.log("📄 Firebase snapshot received:", { exists: doc.exists(), id: doc.id, timestamp: new Date().toISOString() });
      
      if (doc.exists()) {
        const fetchedData = doc.data();
        console.log("✅ Data fetched from Firebase at:", new Date().toISOString());
        console.log("📊 Data structure keys:", Object.keys(fetchedData));
        console.log("💰 Net Worth from Firebase:", fetchedData.netWorth?.total);
        console.log("💸 Expenses from Firebase:", fetchedData.expenses?.total);
        setData(fetchedData);
        if (fetchedData.allocations) {
            setAllocations(fetchedData.allocations);
        }
        console.log("🔄 React state updated with new data");
      } else {
        console.log("🆕 No document exists, creating initial data...");
        setDoc(userDocRef, initialData)
          .then(() => {
            console.log("✅ Initial data created successfully");
            setData(initialData);
            setAllocations(initialData.allocations);
          })
          .catch(error => {
            console.error("❌ Error creating initial document:", error);
          });
      }
      console.log("🔄 Setting loading to false");
      setLoading(false);
    }, (error) => { 
      console.error("❌ Firestore snapshot error:", error); 
      setLoading(false); 
    });

    return () => unsubscribeSnapshot();
  }, [userId]); // Re-runs when userId changes

  useEffect(() => {
    console.log("🔄 DisplayData calculation triggered:", { 
      hasData: !!data, 
      timeframe, 
      historicalDate,
      dataKeys: data ? Object.keys(data) : 'none'
    });
    
    if (data) {
        const view = { timeframe, date: historicalDate };
        console.log("📊 Recalculating totals with view:", view);
        const newDisplayData = recalculateTotals(data, view);
        console.log("✅ New display data calculated at:", new Date().toISOString());
        console.log("📋 Display data keys:", Object.keys(newDisplayData));
        console.log("💰 Calculated Net Worth:", newDisplayData.netWorth?.total);
        console.log("💸 Calculated Expenses:", newDisplayData.expenses?.total);
        console.log("💵 Calculated Income:", newDisplayData.income?.total);
        setDisplayData(newDisplayData);
        console.log("🔄 DisplayData state updated");
    } else {
      console.log("⚠️ No data available for display calculation");
    }
  }, [data, timeframe, historicalDate]);

  // Function to clean data and remove undefined values
  const cleanData = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(cleanData).filter(item => item !== null && item !== undefined);
    }
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          const cleanedValue = cleanData(value);
          if (cleanedValue !== null && cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  };

  const handleSaveData = async (formData) => {
    console.log("🔄 handleSaveData called with:", { userId, appId, formData });
    
    if (!userId) {
      console.error("❌ No userId - authentication failed");
      return;
    }
    
    if (!db) {
      console.error("❌ Firebase not initialized - check your configuration");
      alert("Database connection failed. Please check Firebase configuration.");
      return;
    }
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
    console.log("📄 Document reference created:", userDocRef.path);
    
    try {
      const recalculatedData = recalculateTotals(formData, { timeframe, date: historicalDate });
      console.log("🧮 Data recalculated:", recalculatedData);
      
      const today = new Date().toISOString().split('T')[0];
      
      ['debt', 'netWorth', 'cashOnHand', 'rainyDayFund', 'creditScore', 'investmentPortfolio'].forEach(key => {
          if(!recalculatedData[key].history) recalculatedData[key].history = [];
          const historyIndex = recalculatedData[key].history.findIndex(h => h.date === today);
          const currentTotal = key === 'creditScore' ? recalculatedData[key].current : recalculatedData[key].total;
          const historyKey = key === 'creditScore' ? 'score' : 'total';

          if (historyIndex > -1) {
              recalculatedData[key].history[historyIndex][historyKey] = currentTotal;
          } else {
              recalculatedData[key].history.push({ date: today, [historyKey]: currentTotal });
          }
      });
      
      recalculatedData.businesses.forEach(business => {
        if (!business.history) business.history = [];
        const historyIndex = business.history.findIndex(h => h.date === today);
        if (historyIndex > -1) {
            business.history[historyIndex].net = business.net;
        } else {
            business.history.push({ date: today, net: business.net });
        }
      });

      recalculatedData.allocations = allocations;

      // Clean data to remove undefined values
      const cleanedData = cleanData(recalculatedData);
      console.log("🧹 Data cleaned:", cleanedData);

      console.log("💾 Attempting to save to Firebase...");
      console.log("📄 Document path:", userDocRef.path);
      console.log("👤 User ID:", userId);
      console.log("📦 Original data:", recalculatedData);
      console.log("✨ Cleaned data to save:", cleanedData);
      
      await setDoc(userDocRef, cleanedData, { merge: true });
      console.log("✅ Data saved successfully!");
      console.log("🔄 Waiting for Firebase to trigger data refresh...");
      
      // Show user feedback
      alert("✅ Data saved successfully!");
      
          } catch (error) {
        console.error("❌ Error saving data:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        // Show user feedback
        alert(`❌ Failed to save data: ${error.message}`);
      }
  };
  
  const handleSaveBusinesses = async (newBusinesses) => {
    console.log("💼 Saving businesses:", newBusinesses);
    if (!data || !userId) {
      console.error("❌ Cannot save businesses - missing data or userId");
      return;
    }
    const updatedData = { ...data, businesses: newBusinesses };
    console.log("💼 Updated data with businesses:", updatedData);
    handleSaveData(updatedData);
  };

  const handleSaveNetWorth = async (newBreakdown) => {
    console.log("💰 Saving net worth breakdown:", newBreakdown);
    if (!data || !userId) {
      console.error("❌ Cannot save net worth - missing data or userId");
      return;
    }
    const updatedData = { ...data, netWorth: { ...data.netWorth, breakdown: newBreakdown }};
    console.log("💰 Updated data with net worth:", updatedData.netWorth);
    handleSaveData(updatedData);
  };
  
  const handleSaveExpenses = async (newCategories) => {
    if (!data || !userId) return;
    const updatedData = { ...data, expenses: { ...data.expenses, categories: newCategories }};
    handleSaveData(updatedData);
  };
  

  
  const handleSaveCreditScore = async (newScore) => {
    if (!data || !userId) return;
    const updatedData = { ...data, creditScore: { ...data.creditScore, current: newScore }};
    handleSaveData(updatedData);
  };

  const handleSaveGoals = async (goals) => {
    if (!data || !userId) return;
    const updatedData = { 
        ...data, 
        financialFreedom: { ...data.financialFreedom, targetAmount: goals.ffTarget },
        rainyDayFund: { ...data.rainyDayFund, goal: goals.rdfGoal }
    };
    handleSaveData(updatedData);
  };
  
  const handleSaveInvestment = async (newPortfolio) => {
    console.log("📊 Saving investment portfolio:", newPortfolio);
    if (!data || !userId) {
      console.error("❌ Cannot save investment - missing data or userId");
      return;
    }
    const updatedData = { ...data, investmentPortfolio: newPortfolio };
    console.log("📊 Updated data with investment:", updatedData.investmentPortfolio);
    handleSaveData(updatedData);
  };

  const handleSaveHoldings = async (newHoldings) => {
    console.log("🏦 Saving holdings:", newHoldings);
    if (!data || !userId) {
      console.error("❌ Cannot save holdings - missing data or userId");
      return;
    }
    const updatedData = { ...data, investmentPortfolio: { ...data.investmentPortfolio, holdings: newHoldings }};
    console.log("🏦 Updated data with holdings:", updatedData.investmentPortfolio);
    handleSaveData(updatedData);
  };

  const handleSaveContributionGoals = async (goals) => {
    if (!data || !userId) return;
    const updatedData = { 
        ...data, 
        investmentPortfolio: { 
            ...data.investmentPortfolio, 
            tfsaGoal: goals.tfsaGoal,
            rrspGoal: goals.rrspGoal
        }
    };
    handleSaveData(updatedData);
  };

  const handleSaveAllocations = async () => {
      if (!userId || !data) return;
      const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
      try {
          const updatedData = { ...data, allocations: allocations };
          await setDoc(userDocRef, updatedData, { merge: true });
      } catch (error) {
          console.error("Error saving allocations:", error);
      }
  };
  
  const handleResetData = async () => {
    if (!userId) return;
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/financials`, 'data');
    try {
        await setDoc(userDocRef, emptyData);
        setData(JSON.parse(JSON.stringify(emptyData)));
        setAllocations(emptyData.allocations);
        setTimeframe('monthly');
        setHistoricalDate(null);
        setActiveTab('dashboard');
    } catch (error) {
        console.error("Error resetting data:", error);
    } finally {
        setIsResetModalOpen(false);
    }
  };

  const handleViewHistory = (date) => {
    setTimeframe('historical');
    setHistoricalDate(date);
  };

  const handleExport = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Total\n";
    csvContent += `Net Worth,${data.netWorth.total}\n`;
    csvContent += `TFSA Contribution,${data.investmentPortfolio.tfsaContribution}\n`;
    csvContent += `RRSP Contribution,${data.investmentPortfolio.rrspContribution}\n\n`;
    csvContent += "Date,Description,Amount,Type,Category,Investment Type\n";
    data.recentTransactions.forEach(tx => {
        const row = [ tx.date, `"${tx.description.replace(/"/g, '""')}"`, tx.amount, tx.type || '', tx.category || '', tx.investmentType || '' ].join(",");
        csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_dashboard_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Debug logging
  console.log("App render state:", { 
    loading, 
    displayData: !!displayData, 
    userId, 
    data: !!data,
    dataKeys: data ? Object.keys(data) : 'none',
    displayDataKeys: displayData ? Object.keys(displayData) : 'none'
  });

  // More detailed condition debugging
  console.log("🔍 Render condition check:", {
    loading: loading,
    displayDataExists: !!displayData,
    displayDataType: typeof displayData,
    displayDataValue: displayData,
    shouldShowLoading: loading || !displayData
  });

  // Temporary fix: force render the dashboard since data is working
  if (loading || (!displayData && !data)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl animate-pulse mb-4">Loading Your Financial Universe...</p>
          <p className="text-gray-400 text-sm">Loading: {loading ? 'true' : 'false'}</p>
          <p className="text-gray-400 text-sm">User ID: {userId || 'none'}</p>
          <p className="text-gray-400 text-sm">Display Data: {displayData ? 'loaded' : 'none'}</p>
          <p className="text-gray-400 text-sm">Condition: {loading || (!displayData && !data) ? 'should load' : 'should render'}</p>
        </div>
      </div>
    );
  }

  // Use data as fallback if displayData is not ready yet
  const renderData = displayData || data;

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
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><LayoutDashboard className="w-4 h-4 mr-2"/>Dashboard</button>
              <button onClick={() => setActiveTab('budget')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'budget' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><Calculator className="w-4 h-4 mr-2"/>Budget</button>
              <button onClick={() => setActiveTab('side-hustle')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'side-hustle' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><Building className="w-4 h-4 mr-2"/>Side Hustle</button>
              <button onClick={() => setActiveTab('investment')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'investment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><Briefcase className="w-4 h-4 mr-2"/>Investment</button>
              <button onClick={() => setActiveTab('visuals')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'visuals' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><AreaChart className="w-4 h-4 mr-2"/>Visuals</button>
              <button onClick={() => setActiveTab('allocations')} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${activeTab === 'allocations' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><Calculator className="w-4 h-4 mr-2"/>Allocations</button>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="flex items-center bg-gray-800 rounded-full p-1 space-x-1 mt-4 max-w-min">
              <button onClick={() => { setTimeframe('monthly'); setHistoricalDate(null); }} className={`px-3 py-1 rounded-full text-sm font-semibold ${timeframe === 'monthly' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Monthly</button>
              <button onClick={() => { setTimeframe('annual'); setHistoricalDate(null); }} className={`px-3 py-1 rounded-full text-sm font-semibold ${timeframe === 'annual' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Annually</button>
              <button onClick={() => setIsHistoryModalOpen(true)} className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${timeframe === 'historical' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}><Calendar className="w-4 h-4 mr-1"/> History</button>
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6">
          {activeTab === 'dashboard' && (
            <>
              <FinancialFreedomCard data={renderData} onEdit={() => setIsEditGoalsModalOpen(true)} />
              <NetWorthCard data={renderData.netWorth} onEdit={() => setIsEditNetWorthModalOpen(true)} />
              <InvestmentCard data={renderData.investmentPortfolio} onEdit={() => setIsEditInvestmentModalOpen(true)} />
              <IncomeCard data={renderData.income} timeframe={timeframe} historicalDate={historicalDate} />
              <ExpensesCard data={renderData.expenses} timeframe={timeframe} historicalDate={historicalDate} onEdit={() => setIsEditExpensesModalOpen(true)} />
              <CashOnHandCard data={renderData.cashOnHand} />
              <DebtCard data={renderData.debt} />
              <InvestmentAccountsCard data={renderData.investmentPortfolio} onEdit={() => setIsEditContributionGoalsModalOpen(true)} />
              <AccountBreakdownCard holdings={renderData.investmentPortfolio.holdings} />
              <BusinessCard data={renderData.businesses.reduce((acc, b) => ({
                  income: acc.income + b.income,
                  expenses: acc.expenses + b.expenses,
                  net: acc.net + b.net
              }), {income: 0, expenses: 0, net: 0})} onEdit={() => setIsSideHustleModalOpen(true)} />
              <CreditScoreCard score={renderData.creditScore.current} onEdit={() => setIsEditCreditScoreModalOpen(true)} />
              <SavingsRateCard savingsRate={renderData.savingsRate || 0} />
              <RainyDayFundCard data={renderData.rainyDayFund} expensesTotal={renderData.expenses.total} onEdit={() => setIsEditGoalsModalOpen(true)} />
              <CardWithTimeframe title="Cashflow" icon={<TrendingUp/>} color="text-amber-400" data={renderData.cashflow} timeframe={timeframe} historicalDate={historicalDate} bgColor="bg-gradient-to-br from-amber-900/40 to-yellow-900/40" />
              <TransactionsCard data={data.recentTransactions} />
            </>
          )}
          {activeTab === 'budget' && (
            <BudgetCalculatorTab />
          )}
          {activeTab === 'side-hustle' && (
            <SideHustleTab 
                businesses={data.businesses} 
                onEdit={() => setIsSideHustleModalOpen(true)}
                allTransactions={data.recentTransactions}
            />
          )}
          {activeTab === 'investment' && (
            <InvestmentTab 
                portfolio={renderData.investmentPortfolio} 
                onSaveHoldings={handleSaveHoldings}
                openEditHoldingsModal={() => setIsEditHoldingsModalOpen(true)}
            />
          )}
          {activeTab === 'visuals' && (
            <>
              <HistoryChartCard title="Net Worth" data={renderData.netWorth.history} dataKey="total" color="text-emerald-400" icon={<DollarSign/>} />
              <HistoryChartCard title="Cash on Hand" data={renderData.cashOnHand.history} dataKey="total" color="text-sky-400" icon={<Wallet/>} />
              <HistoryChartCard title="Debt" data={renderData.debt.history} dataKey="total" color="text-red-500" icon={<CreditCard/>} />
              <HistoryChartCard title="Business Profit" data={renderData.businesses[0]?.history || []} dataKey="net" color="text-violet-500" icon={<Building/>} />
              <HistoryChartCard title="Credit Score" data={renderData.creditScore.history} dataKey="score" color="text-emerald-400" icon={<ShieldCheck/>} yDomain={[300, 850]} />
            </>
          )}
          {activeTab === 'allocations' && (
            <>
                <AllocationsCalculator allocations={allocations} setAllocations={setAllocations} onSave={handleSaveAllocations} />
                <FinancialFreedomCalculator data={data.financialFreedom} onSave={(newData) => handleSaveData({...data, financialFreedom: newData})} />
            </>
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500">
            <p>Dashboard for the modern hustler. Keep building.</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
                <p>User ID: <span className="text-xs">{userId}</span></p>
                <button onClick={handleExport} className="text-gray-400 hover:text-white flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                </button>
                <span className="text-gray-600">|</span>
                <button onClick={() => setIsResetModalOpen(true)} className="text-red-500 hover:text-red-400 flex items-center space-x-1">
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Data</span>
                </button>
            </div>
        </footer>

        <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
            aria-label="Add new data"
        >
            <Plus className="w-8 h-8" />
        </button>

        {isModalOpen && <AddDataModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveData}
            currentData={data}
        />}
        {isHistoryModalOpen && <HistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            onViewHistory={handleViewHistory}
            transactions={data.recentTransactions}
        />}
        {isResetModalOpen && <ResetConfirmationModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleResetData}
        />}
        {isEditNetWorthModalOpen && <EditNetWorthModal 
            isOpen={isEditNetWorthModalOpen} 
            onClose={() => setIsEditNetWorthModalOpen(false)} 
            onSave={handleSaveNetWorth} 
            breakdown={data.netWorth.breakdown} 
        />}
        {isEditExpensesModalOpen && <EditExpensesModal 
            isOpen={isEditExpensesModalOpen} 
            onClose={() => setIsEditExpensesModalOpen(false)} 
            onSave={handleSaveExpenses} 
            categories={data.expenses.categories} 
        />}
        
        {isEditCreditScoreModalOpen && <EditCreditScoreModal
            isOpen={isEditCreditScoreModalOpen}
            onClose={() => setIsEditCreditScoreModalOpen(false)}
            onSave={handleSaveCreditScore}
            currentScore={data.creditScore.current}
        />}
        {isEditGoalsModalOpen && <EditGoalsModal
            isOpen={isEditGoalsModalOpen}
            onClose={() => setIsEditGoalsModalOpen(false)}
            onSave={handleSaveGoals}
            ffTarget={data.financialFreedom.targetAmount}
            rdfGoal={data.rainyDayFund.goal}
        />}
        {isEditInvestmentModalOpen && <EditInvestmentModal
            isOpen={isEditInvestmentModalOpen}
            onClose={() => setIsEditInvestmentModalOpen(false)}
            onSave={handleSaveInvestment}
            portfolio={data.investmentPortfolio}
        />}
        {isEditContributionGoalsModalOpen && <EditContributionGoalsModal
            isOpen={isEditContributionGoalsModalOpen}
            onClose={() => setIsEditContributionGoalsModalOpen(false)}
            onSave={handleSaveContributionGoals}
            tfsaGoal={data.investmentPortfolio.tfsaGoal}
            rrspGoal={data.investmentPortfolio.rrspGoal}
        />}
        {isSideHustleModalOpen && <SideHustleModal
            isOpen={isSideHustleModalOpen}
            onClose={() => setIsSideHustleModalOpen(false)}
            onSave={handleSaveBusinesses}
            businesses={data.businesses}
        />}
        {isEditHoldingsModalOpen && <EditHoldingsModal
            isOpen={isEditHoldingsModalOpen}
            onClose={() => setIsEditHoldingsModalOpen(false)}
            onSave={handleSaveHoldings}
            holdings={data.investmentPortfolio.holdings}
        />}
      </div>
    </div>
  );
}

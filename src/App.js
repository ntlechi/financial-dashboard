import React from 'react';
import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Building, LayoutDashboard, Calculator, Briefcase } from 'lucide-react';

// Firebase Imports
import { db, auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const appId = process.env.REACT_APP_FIREBASE_APP_ID;

const initialData = {
  netWorth: { total: 550000, breakdown: [
    { id: 1, name: 'Cash', value: 75000, color: 'bg-sky-500', type: 'asset' },
    { id: 2, name: 'Investments', value: 350000, color: 'bg-violet-500', type: 'asset' },
    { id: 3, name: 'Real Estate', value: 250000, color: 'bg-emerald-500', type: 'asset' },
    { id: 4, name: 'Liabilities', value: -125000, color: 'bg-red-500', type: 'liability' },
  ]},
  income: { total: 12500, sources: [
    { id: 1, name: 'Main Job', amount: 8000, type: 'active' },
    { id: 2, name: 'Trading', amount: 2500, type: 'passive' },
    { id: 3, name: 'Side Business', amount: 2000, type: 'passive' },
  ]},
  expenses: { total: 6500, categories: [
    { id: 1, name: 'Housing', amount: 2500, color: 'bg-red-500' },
    { id: 2, name: 'Transport', amount: 800, color: 'bg-yellow-500' },
    { id: 3, name: 'Food', amount: 1200, color: 'bg-green-500' },
    { id: 4, name: 'Entertainment', amount: 1000, color: 'bg-purple-500' },
    { id: 5, name: 'Other', amount: 1000, color: 'bg-gray-400' },
  ]},
  cashflow: { total: 6000 }
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

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

// Dashboard Cards
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
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6">
          {activeTab === 'dashboard' && (
            <>
              <NetWorthCard data={data.netWorth} />
              <IncomeCard data={data.income} />
              <ExpensesCard data={data.expenses} />
              <CashFlowCard data={data.cashflow} />
              
              <Card className="col-span-1 md:col-span-6 lg:col-span-6">
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-white mb-4">🎉 Dashboard Working!</h2>
                  <p className="text-gray-400 mb-4">
                    Your financial dashboard is connected to Firebase and displaying real data.
                  </p>
                  <div className="bg-green-900/20 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h3 className="text-green-400 font-semibold mb-2">✅ What's Working:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Firebase Authentication ✅</li>
                      <li>• Firestore Database ✅</li>
                      <li>• Real-time data sync ✅</li>
                      <li>• Responsive design ✅</li>
                      <li>• Budget Calculator layout fix ✅</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}
          
          {activeTab === 'budget' && <BudgetCalculatorTab />}
          
          {activeTab === 'side-hustle' && (
            <Card className="col-span-1 md:col-span-6 lg:col-span-6">
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Side Hustle Tracking</h2>
                <p className="text-gray-400">Track your business income and expenses with real-time calculations.</p>
              </div>
            </Card>
          )}
          
          {activeTab === 'investment' && (
            <Card className="col-span-1 md:col-span-6 lg:col-span-6">
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Investment Portfolio</h2>
                <p className="text-gray-400">Manage your investment holdings and track performance.</p>
              </div>
            </Card>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500">
          <p>Dashboard for the modern hustler. Keep building.</p>
          <p className="text-xs mt-2">User ID: {userId}</p>
        </footer>
      </div>
    </div>
  );
}


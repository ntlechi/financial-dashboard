import React, { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import SideHustle from './components/SideHustle';
import BudgetCalculator from './components/BudgetCalculator';
import Portfolio from './components/Portfolio';
import Transactions from './components/Transactions';
import { 
  BarChart3, 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  CreditCard 
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const signInUser = async () => {
      try {
        const result = await signInAnonymously(auth);
        setUser(result.user);
        console.log('✅ Anonymous user signed in');
      } catch (error) {
        console.error('❌ Anonymous sign-in failed:', error);
      }
    };

    signInUser();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sidehustle', label: 'Side Hustle', icon: DollarSign },
    { id: 'budget', label: 'Budget Calculator', icon: Calculator },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sidehustle':
        return <SideHustle />;
      case 'budget':
        return <BudgetCalculator />;
      case 'portfolio':
        return <Portfolio />;
      case 'transactions':
        return <Transactions />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        </header>

        <nav className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </nav>

        <main className="pb-8">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default App;

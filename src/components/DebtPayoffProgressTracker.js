import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Calendar, DollarSign, Target, Zap, Calculator, ArrowRight, Clock } from 'lucide-react';

// Debt payoff calculation engine
const calculateDebtPayoff = (debts, strategy, extraPayment = 0) => {
  if (!debts || debts.length === 0) {
    return {
      totalDebt: 0,
      totalInterest: 0,
      payoffDate: null,
      monthsToPayoff: 0,
      monthlyPayment: 0,
      strategy: strategy
    };
  }

  // Sort debts based on strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') {
      return a.balance - b.balance; // Smallest balance first
    } else {
      return b.interestRate - a.interestRate; // Highest interest first
    }
  });

  let totalInterest = 0;
  let currentDate = new Date();
  let totalMonthlyPayment = 0;
  let remainingDebts = sortedDebts.map(debt => ({
    ...debt,
    remainingBalance: debt.balance,
    monthlyPayment: debt.minPayment || 0
  }));

  // Calculate total minimum payments
  totalMonthlyPayment = remainingDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);

  // Simulate month-by-month payoff
  while (remainingDebts.some(debt => debt.remainingBalance > 0)) {
    let availablePayment = totalMonthlyPayment + extraPayment;
    
    // Pay minimums first
    remainingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const interestPayment = (debt.remainingBalance * debt.interestRate / 100) / 12;
        const principalPayment = Math.min(debt.monthlyPayment - interestPayment, debt.remainingBalance);
        
        debt.remainingBalance -= principalPayment;
        totalInterest += interestPayment;
        availablePayment -= debt.monthlyPayment;
      }
    });

    // Apply extra payment to first remaining debt (strategy-based)
    const firstRemainingDebt = remainingDebts.find(debt => debt.remainingBalance > 0);
    if (firstRemainingDebt && availablePayment > 0) {
      const extraPrincipalPayment = Math.min(availablePayment, firstRemainingDebt.remainingBalance);
      firstRemainingDebt.remainingBalance -= extraPrincipalPayment;
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Safety check to prevent infinite loops
    if (currentDate.getFullYear() > new Date().getFullYear() + 20) {
      break;
    }
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthsToPayoff = Math.ceil((currentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));

  return {
    totalDebt,
    totalInterest,
    payoffDate: currentDate,
    monthsToPayoff,
    monthlyPayment: totalMonthlyPayment,
    strategy: strategy,
    extraPayment
  };
};

export default function DebtPayoffProgressTracker({ data, onEdit, userPlan, onUpgrade }) {
  const [strategy, setStrategy] = useState('snowball');
  const [extraPayment, setExtraPayment] = useState(0);
  const [showSimulator, setShowSimulator] = useState(false);

  // Calculate payoff scenarios
  const currentScenario = useMemo(() => {
    return calculateDebtPayoff(data?.accounts || [], strategy, 0);
  }, [data?.accounts, strategy]);

  const extraPaymentScenario = useMemo(() => {
    return calculateDebtPayoff(data?.accounts || [], strategy, extraPayment);
  }, [data?.accounts, strategy, extraPayment]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Calculate progress percentage (inverse of debt remaining)
  const progressPercentage = data?.total ? 
    Math.max(0, Math.min(100, ((data.total - (data.total * 0.1)) / data.total) * 100)) : 0;

  // Free tier - show locked version
  if (userPlan === 'FREE') {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Debt Payoff Progress Tracker</h3>
              <p className="text-gray-400 text-sm">Your debt-free journey starts here</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">
              ${data?.total?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Total Debt</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Unlock Your Debt-Free Date</h4>
            <p className="text-gray-300 mb-4">
              Get personalized payoff strategies, timeline projections, and a "What If" simulator to accelerate your debt freedom.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Upgrade to Climber
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium tier - full interactive tracker
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-red-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Debt Payoff Progress Tracker</h3>
            <p className="text-gray-400 text-sm">Your strategic path to debt freedom</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Calculator className="w-5 h-5" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Debt-Free Date</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatDate(currentScenario.payoffDate)}
          </div>
          <div className="text-xs text-gray-400">
            {currentScenario.monthsToPayoff} months
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Interest</span>
          </div>
          <div className="text-xl font-bold text-white">
            ${currentScenario.totalInterest.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Current strategy
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-400">Total Debt</span>
          </div>
          <div className="text-xl font-bold text-white">
            ${currentScenario.totalDebt.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Across {data?.accounts?.length || 0} accounts
          </div>
        </div>
      </div>

      {/* Strategy Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Payoff Strategy</h4>
          <div className="flex items-center bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setStrategy('snowball')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                strategy === 'snowball'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Snowball
            </button>
            <button
              onClick={() => setStrategy('avalanche')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                strategy === 'avalanche'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Avalanche
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-sm text-gray-300">
            {strategy === 'snowball' 
              ? '🎯 Pay off smallest debts first for quick psychological wins'
              : '💰 Pay off highest interest debts first to save the most money'
            }
          </p>
        </div>
      </div>

      {/* What If Simulator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">What If Simulator</h4>
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
          >
            <Zap className="w-4 h-4" />
            {showSimulator ? 'Hide' : 'Show'} Simulator
          </button>
        </div>

        {showSimulator && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Extra Monthly Payment
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-gray-400">/month</span>
              </div>
            </div>

            {extraPayment > 0 && (
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Impact Analysis</span>
                </div>
                <div className="text-white">
                  By paying an extra <span className="font-bold text-green-400">+${extraPayment}</span> per month, you will be debt-free{' '}
                  <span className="font-bold text-blue-400">
                    {currentScenario.monthsToPayoff - extraPaymentScenario.monthsToPayoff} months earlier
                  </span>{' '}
                  and save{' '}
                  <span className="font-bold text-green-400">
                    ${(currentScenario.totalInterest - extraPaymentScenario.totalInterest).toLocaleString()}
                  </span>{' '}
                  in interest.
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  New debt-free date: <span className="font-semibold text-blue-400">
                    {formatDate(extraPaymentScenario.payoffDate)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Visualization */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Debt Payoff Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-red-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Current Debt</span>
          <span>Debt Free</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setExtraPayment(100)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          +$100
        </button>
        <button
          onClick={() => setExtraPayment(250)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          +$250
        </button>
        <button
          onClick={() => setExtraPayment(500)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          +$500
        </button>
        <button
          onClick={() => setExtraPayment(0)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}


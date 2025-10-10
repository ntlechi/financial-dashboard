import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Edit, Plus, Trash2 } from 'lucide-react';

export default function DebtPayoffProgressTracker({ data, onEdit, userPlan, onUpgrade }) {
  // Calculate total debt and progress
  const totalDebt = data?.accounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
  const totalInitialDebt = data?.accounts?.reduce((sum, account) => sum + (account.initialDebt || 0), 0) || 0;
  const totalPaid = data?.accounts?.reduce((sum, account) => sum + (account.amountPaid || 0), 0) || 0;
  const accountCount = data?.accounts?.length || 0;

  // Calculate progress percentage based on actual payments made
  const progressPercentage = totalInitialDebt > 0 ? (totalPaid / totalInitialDebt) * 100 : 0;

  // Free tier - show locked version
  if (userPlan === 'FREE') {
    return (
      <div className="bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-xl p-6 border border-rose-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-600/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Debt Tracker</h3>
              <p className="text-gray-400 text-sm">Track your debt payoff progress</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-400">
              ${totalDebt.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Debt</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Unlock Debt Management</h4>
            <p className="text-gray-300 mb-4">
              Get detailed debt tracking, payoff strategies, and progress visualization.
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

  // Premium tier - simple debt card
  return (
    <div 
      className="bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-xl p-6 border border-rose-500/30"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-600/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Debt Tracker</h3>
            <p className="text-gray-400 text-sm">Track your debt payoff progress</p>
          </div>
        </div>
        <button
          onClick={() => onEdit('debt', data)}
          className="text-rose-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-rose-700/20"
          title="Edit Debt Accounts"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Total Debt Display */}
      <div className="mb-4">
        <p className="text-4xl font-extrabold text-white">${totalDebt.toLocaleString()}</p>
        <p className="text-sm text-gray-400">Across {accountCount} account{accountCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        {totalInitialDebt > 0 ? (
          <>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Debt Payoff Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>${totalPaid.toLocaleString()} paid</span>
              <span>${totalInitialDebt.toLocaleString()} total</span>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="text-sm text-gray-400 mb-1">Debt Payoff Progress</div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-gray-600 h-3 rounded-full"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Add initial debt amounts to track progress</div>
          </div>
        )}
      </div>

      {/* Current Debt Accounts */}
      {data?.accounts && data.accounts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-2">Your Debts</h4>
          <div className="space-y-2">
            {data.accounts.slice(0, 3).map((account, index) => {
              const accountProgress = (account.initialDebt || 0) > 0 ? ((account.amountPaid || 0) / (account.initialDebt || 1)) * 100 : 0;
              
              // Calculate payment status
              const today = new Date();
              const currentDay = today.getDate();
              const dueDate = account.dueDate || 1;
              const daysUntilDue = dueDate >= currentDay ? dueDate - currentDay : (30 - currentDay) + dueDate;
              
              let paymentStatus = 'upcoming';
              let statusColor = 'text-blue-400';
              let statusText = `Due in ${daysUntilDue} days`;
              
              if (daysUntilDue === 0) {
                paymentStatus = 'due-today';
                statusColor = 'text-orange-400';
                statusText = 'Due today!';
              } else if (daysUntilDue < 0) {
                paymentStatus = 'overdue';
                statusColor = 'text-red-400';
                statusText = `${Math.abs(daysUntilDue)} days overdue`;
              } else if (daysUntilDue <= 3) {
                paymentStatus = 'urgent';
                statusColor = 'text-yellow-400';
                statusText = `Due in ${daysUntilDue} days`;
              }
              
              return (
                <div key={account.id || index} className="bg-gray-800/50 rounded-lg p-2 border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <div className="text-white text-sm font-medium">{account.name || `Debt ${index + 1}`}</div>
                      <div className="text-xs text-gray-400">
                        {(account.interestRate || 0).toFixed(1)}% • Min: ${(account.minPayment || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${statusColor} font-medium`}>
                        Due: {dueDate}th • {statusText}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-rose-400 font-bold text-sm">${(account.balance || 0).toLocaleString()}</div>
                      {(account.initialDebt || 0) > 0 && (
                        <div className="text-xs text-green-400">
                          ${(account.amountPaid || 0).toLocaleString()} paid
                        </div>
                      )}
                    </div>
                  </div>
                  {(account.initialDebt || 0) > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, accountProgress)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
            {data.accounts.length > 3 && (
              <div className="text-xs text-gray-400 text-center">
                +{data.accounts.length - 3} more accounts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Only show Add First Debt if no accounts exist */}
      {(!data?.accounts || data.accounts.length === 0) && (
        <div className="flex justify-center">
          <button
            onClick={() => onEdit('debt', data)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Debt
          </button>
        </div>
      )}
    </div>
  );
}
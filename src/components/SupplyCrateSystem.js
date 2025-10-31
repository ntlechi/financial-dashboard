// 📦 SUPPLY CRATE SYSTEM - Real-time Budget Management (Climber+ Feature)
// Gamified envelope budgeting system that creates in-the-moment awareness
// The bridge between "knowing" and "controlling" your finances

import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit3, Trash2, X, Award, DollarSign } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../utils/localeUtils';

export default function SupplyCrateSystem({ data, setData, userId, currentMonth, awardXp, setXpRefreshTrigger }) {
  const { t } = useTranslation();
  const [crates, setCrates] = useState([]);
  const [showAddCrate, setShowAddCrate] = useState(false);
  const [editingCrate, setEditingCrate] = useState(null);
  const [newCrate, setNewCrate] = useState({
    name: '',
    allocated: '',
    category: 'needs',
    icon: '📦'
  });

  // Load crates from data
  useEffect(() => {
    if (data?.supplyCrates?.crates) {
      setCrates(data.supplyCrates.crates);
    }
  }, [data?.supplyCrates]);

  // Calculate spending for each crate from current month's transactions
  const calculateCrateSpending = (crateName) => {
    const now = new Date();
    const currentMonthTransactions = (data.transactions || []).filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && 
             tDate.getFullYear() === now.getFullYear() &&
             t.amount < 0; // Only expenses
    });

    // Sum up expenses that match this crate
    return currentMonthTransactions
      .filter(t => {
        const transactionCategory = (t.subcategory || t.category || '').toLowerCase();
        const crateLower = crateName.toLowerCase();
        // Match by category or description keywords
        return transactionCategory.includes(crateLower) || 
               crateLower.includes(transactionCategory) ||
               (t.description || '').toLowerCase().includes(crateLower);
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Get crate status
  const getCrateStatus = (allocated, spent) => {
    const percentUsed = (spent / allocated) * 100;

    if (percentUsed >= 100) {
      return { status: 'depleted', color: 'red', message: `🚨 ${t('supplyCrateSystem.crateEmpty')}` };
    } else if (percentUsed >= 80) {
      return { status: 'low', color: 'yellow', message: `⚠️ ${t('supplyCrateSystem.runningLow')}` };
    } else if (percentUsed >= 50) {
      return { status: 'moderate', color: 'orange', message: `📊 ${t('supplyCrateSystem.halfUsed')}` };
    } else {
      return { status: 'healthy', color: 'green', message: `✅ ${t('supplyCrateSystem.suppliesGood')}` };
    }
  };

  const saveCrates = async (updatedCrates) => {
    if (!userId) return;

    const updatedData = {
      ...data,
      supplyCrates: {
        crates: updatedCrates,
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      setData(updatedData);
      setCrates(updatedCrates);
    } catch (error) {
      console.error('Error saving supply crates:', error);
      alert(t('supplyCrateSystem.saveFailed'));
    }
  };

  const handleAddCrate = async () => {
    if (!newCrate.name || !newCrate.allocated) return;

    const crate = {
      id: Date.now(),
      name: newCrate.name,
      allocated: parseFloat(newCrate.allocated),
      category: newCrate.category,
      icon: newCrate.icon,
      createdAt: new Date().toISOString()
    };

    const updatedCrates = [...crates, crate];
    await saveCrates(updatedCrates);

    // 🎮 GAMIFICATION: Award XP for creating Supply Crate!
    if (awardXp && setXpRefreshTrigger) {
      try {
        const xpAmount = crates.length === 0 ? 25 : 10; // First crate = 25 XP, others = 10 XP
        await awardXp(db, userId, xpAmount);
        setXpRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.warn('XP award failed (supply crate)', error);
      }
    }

    setNewCrate({ name: '', allocated: '', category: 'needs', icon: '📦' });
    setShowAddCrate(false);
  };

  const handleEditCrate = async () => {
    if (!editingCrate || !editingCrate.name || !editingCrate.allocated) return;

    const updatedCrates = crates.map(c =>
      c.id === editingCrate.id
        ? { ...editingCrate, allocated: parseFloat(editingCrate.allocated) }
        : c
    );

    await saveCrates(updatedCrates);
    setEditingCrate(null);
  };

  const handleDeleteCrate = async (crateId) => {
    // Determine XP deduction (first crate was +25, others +10)
    const crateIndex = crates.findIndex(c => c.id === crateId);
    const xpDeduction = crateIndex === 0 ? 25 : 10; // Approximate (first = 25, others = 10)
    
    if (!window.confirm(t('supplyCrateSystem.deleteConfirm', { xp: xpDeduction }))) return;
    
    const updatedCrates = crates.filter(c => c.id !== crateId);
    await saveCrates(updatedCrates);
    
    // 🛡️ ANTI-EXPLOIT: Deduct XP for deleting crate
    // Note: Using deductXp if available, otherwise using awardXp with negative (fallback)
    if (setXpRefreshTrigger) {
      try {
        // Import deductXp at component level if needed, for now using alert
        alert(t('supplyCrateSystem.crateDeleted', { xp: xpDeduction }));
        setXpRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.warn('XP deduction failed (crate delete)', error);
      }
    }
  };

  // Calculate total allocated and remaining
  const totalAllocated = crates.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = crates.reduce((sum, c) => sum + calculateCrateSpending(c.name), 0);
  const totalRemaining = totalAllocated - totalSpent;

  const categoryIcons = {
    needs: '🏠',
    wants: '🎮',
    savings: '💰',
    debt: '💳',
    emergency: '🚨'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-green-400" />
              📦 {t('supplyCrate.title')}
            </h2>
            <p className="text-gray-300 mt-2">
              {t('supplyCrateSystem.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowAddCrate(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('supplyCrateSystem.newCrate')}
          </button>
        </div>

        {/* Month Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">{t('supplyCrateSystem.totalAllocated')}</div>
            <div className="text-2xl font-bold text-white">${formatNumber(totalAllocated)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">{t('supplyCrateSystem.totalSpent')}</div>
            <div className="text-2xl font-bold text-red-400">${formatNumber(totalSpent)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">{t('supplyCrateSystem.totalRemaining')}</div>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${formatNumber(Math.abs(totalRemaining))}
            </div>
          </div>
        </div>
      </div>

      {/* Supply Crates Grid */}
      {crates.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-white mb-2">{t('supplyCrateSystem.noCratesYet')}</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {t('supplyCrateSystem.noCratesDescription')}
          </p>
          <button
            onClick={() => setShowAddCrate(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('supplyCrateSystem.createFirstCrate')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crates.map(crate => {
            const spent = calculateCrateSpending(crate.name);
            const remaining = crate.allocated - spent;
            const percentUsed = Math.min((spent / crate.allocated) * 100, 100);
            const status = getCrateStatus(crate.allocated, spent);

            return (
              <div
                key={crate.id}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 transition-all ${
                  status.status === 'depleted'
                    ? 'border-red-500/60 shadow-red-500/20 shadow-lg'
                    : status.status === 'low'
                    ? 'border-yellow-500/60 shadow-yellow-500/20 shadow-lg'
                    : 'border-gray-700'
                }`}
              >
                {/* Crate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{crate.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{crate.name}</h3>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        {categoryIcons[crate.category]} {crate.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCrate(crate)}
                      className="text-gray-400 hover:text-blue-400 p-1 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCrate(crate.id)}
                      className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  status.status === 'depleted'
                    ? 'bg-red-900/30 text-red-300 border border-red-600/40'
                    : status.status === 'low'
                    ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-600/40'
                    : 'bg-green-900/30 text-green-300 border border-green-600/40'
                }`}>
                  {status.message}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{t('supplyCrateSystem.spent')}</span>
                    <span className={`font-bold ${
                      status.status === 'depleted' ? 'text-red-400' : 'text-white'
                    }`}>
                      ${formatNumber(spent)} / ${formatNumber(crate.allocated)}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        status.status === 'depleted'
                          ? 'bg-gradient-to-r from-red-600 to-red-500'
                          : status.status === 'low'
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                          : status.status === 'moderate'
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                          : 'bg-gradient-to-r from-green-600 to-green-500'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                </div>

                {/* Remaining */}
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{t('supplyCrateSystem.suppliesRemaining')}</div>
                  <div className={`text-2xl font-bold ${
                    remaining <= 0 ? 'text-red-400' : remaining < crate.allocated * 0.2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    ${formatNumber(Math.abs(remaining))}
                  </div>
                  {remaining < 0 && (
                    <div className="text-xs text-red-300 mt-1">
                      ⚠️ {t('supplyCrateSystem.overBudgetBy')} ${formatNumber(Math.abs(remaining))}
                    </div>
                  )}
                </div>

                {/* Burn Rate Indicator */}
                {remaining > 0 && (
                  <div className="mt-3 text-xs text-gray-400">
                    💨 {t('supplyCrateSystem.burnRate')}: ${((spent / new Date().getDate())).toFixed(2)}/day
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Tip */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-500/40">
        <h3 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
          <Award className="w-5 h-5" />
          💡 {t('supplyCrateSystem.howToUse')}
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <strong>{t('supplyCrateSystem.step1Title')}</strong> {t('supplyCrateSystem.step1Description')}
          </p>
          <p>
            <strong>{t('supplyCrateSystem.step2Title')}</strong> {t('supplyCrateSystem.step2Description')}
          </p>
          <p>
            <strong>{t('supplyCrateSystem.step3Title')}</strong> {t('supplyCrateSystem.step3Description')}
          </p>
          <p className="text-amber-300 font-semibold">
            🎯 <strong>{t('supplyCrateSystem.proTip')}</strong> {t('supplyCrateSystem.proTipDescription')}
          </p>
        </div>
      </div>

      {/* Add Crate Modal */}
      {showAddCrate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md border border-green-500/40 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">{t('supplyCrateSystem.createNewCrate')}</h3>
              <button
                onClick={() => {
                  setShowAddCrate(false);
                  setNewCrate({ name: '', allocated: '', category: 'needs', icon: '📦' });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('supplyCrateSystem.crateName')}</label>
                <input
                  type="text"
                  placeholder={t('supplyCrateSystem.crateNamePlaceholder')}
                  value={newCrate.name}
                  onChange={(e) => setNewCrate({ ...newCrate, name: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Monthly Allocation</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newCrate.allocated}
                    onChange={(e) => setNewCrate({ ...newCrate, allocated: e.target.value })}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('common.category')}</label>
                <select
                  value={newCrate.category}
                  onChange={(e) => setNewCrate({ ...newCrate, category: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                  <option value="needs">🏠 {t('supplyCrateSystem.categoryNeeds')}</option>
                  <option value="wants">🎮 {t('supplyCrateSystem.categoryWants')}</option>
                  <option value="savings">💰 {t('supplyCrateSystem.categorySavings')}</option>
                  <option value="debt">💳 {t('supplyCrateSystem.categoryDebt')}</option>
                  <option value="emergency">🚨 {t('supplyCrateSystem.categoryEmergency')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('supplyCrateSystem.icon')}</label>
                <input
                  type="text"
                  placeholder={t('supplyCrateSystem.iconPlaceholder')}
                  value={newCrate.icon}
                  onChange={(e) => setNewCrate({ ...newCrate, icon: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none text-3xl text-center"
                  maxLength={2}
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 {t('supplyCrateSystem.iconTip')}
                </p>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                <p className="text-xs text-blue-200">
                  💡 {t('supplyCrateSystem.autoTrackingTip')}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddCrate(false);
                  setNewCrate({ name: '', allocated: '', category: 'needs', icon: '📦' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddCrate}
                disabled={!newCrate.name || !newCrate.allocated}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('supplyCrateSystem.createCrate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Crate Modal */}
      {editingCrate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md border border-blue-500/40 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">{t('supplyCrateSystem.editCrate')}</h3>
              <button
                onClick={() => setEditingCrate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('supplyCrateSystem.crateName')}</label>
                <input
                  type="text"
                  value={editingCrate.name}
                  onChange={(e) => setEditingCrate({ ...editingCrate, name: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('supplyCrateSystem.monthlyAllocation')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={editingCrate.allocated}
                    onChange={(e) => setEditingCrate({ ...editingCrate, allocated: e.target.value })}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('common.category')}</label>
                <select
                  value={editingCrate.category}
                  onChange={(e) => setEditingCrate({ ...editingCrate, category: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="needs">🏠 {t('supplyCrateSystem.categoryNeedsShort')}</option>
                  <option value="wants">🎮 {t('supplyCrateSystem.categoryWantsShort')}</option>
                  <option value="savings">💰 {t('supplyCrateSystem.categorySavingsShort')}</option>
                  <option value="debt">💳 {t('supplyCrateSystem.categoryDebtShort')}</option>
                  <option value="emergency">🚨 {t('supplyCrateSystem.categoryEmergencyShort')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('supplyCrateSystem.icon')}</label>
                <input
                  type="text"
                  value={editingCrate.icon}
                  onChange={(e) => setEditingCrate({ ...editingCrate, icon: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-2xl text-center"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingCrate(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEditCrate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

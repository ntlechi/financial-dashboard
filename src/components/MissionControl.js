// 🎯 MISSION CONTROL - The Heart of Kompul
// The strategic flight plan connecting daily actions to ultimate life goals

import React, { useState, useEffect } from 'react';
import { Target, Calendar, Edit, Save, TrendingUp, Award, Rocket, CheckCircle, Circle, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserLocale, formatNumber } from '../utils/localeUtils';

const MissionControl = ({ 
  data, 
  userId, 
  onUpdateData,
  awardXp,
  setXpRefreshTrigger 
}) => {
  const { t } = useTranslation();
  
  // State
  const [northStarGoal, setNorthStarGoal] = useState(null);
  const [activeMissions, setActiveMissions] = useState([]);
  const [whyStatement, setWhyStatement] = useState('');
  const [editingWhy, setEditingWhy] = useState(false);
  const [tempWhy, setTempWhy] = useState('');
  const [projectedDate, setProjectedDate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load data
  useEffect(() => {
    if (data?.goals && Array.isArray(data.goals)) {
      // Find North Star goal
      const northStar = data.goals.find(g => g.isNorthStar);
      setNorthStarGoal(northStar || null);
      
      // Active Missions = all other goals
      const missions = data.goals.filter(g => !g.isNorthStar);
      setActiveMissions(missions);
    }
    
    // Load Why Statement
    if (data?.missionControl?.whyStatement) {
      setWhyStatement(data.missionControl.whyStatement);
    }
  }, [data]);

  // Calculate savings rate and projected date
  useEffect(() => {
    if (!northStarGoal || !data) return;

    const remaining = northStarGoal.targetAmount - northStarGoal.currentAmount;
    
    // Calculate monthly savings rate (income - expenses)
    const monthlyIncome = data.income?.total || 0;
    const monthlyExpenses = data.expenses?.total || 0;
    const savingsRate = monthlyIncome - monthlyExpenses;
    
    if (savingsRate > 0 && remaining > 0) {
      const monthsToGoal = remaining / savingsRate;
      const today = new Date();
      const projected = new Date(today.getTime() + (monthsToGoal * 30 * 24 * 60 * 60 * 1000));
      setProjectedDate(projected);
    } else {
      setProjectedDate(null);
    }
  }, [northStarGoal, data]);

  // Calculate progress percentage
  const progressPercentage = northStarGoal 
    ? Math.min(100, (northStarGoal.currentAmount / northStarGoal.targetAmount) * 100)
    : 0;

  const strokeDasharray = `${(progressPercentage / 100) * 691} 691`; // Circumference = 2πr = 2 * π * 110 ≈ 691

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Set North Star
  const setAsNorthStar = async (missionId) => {
    if (!userId || !data) return;

    try {
      const updatedGoals = data.goals.map(g => ({
        ...g,
        isNorthStar: g.id === missionId
      }));

      const updatedData = {
        ...data,
        goals: updatedGoals
      };

      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      
      onUpdateData(updatedData);
      showNotification(t('missionControl.northStarSetSuccess'), 'success');

      // Award XP for setting North Star
      if (awardXp && setXpRefreshTrigger) {
        try {
          await awardXp(db, userId, 100);
          setXpRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.warn('XP award failed', error);
        }
      }
    } catch (error) {
      console.error('Error setting North Star:', error);
      showNotification(t('missionControl.failedToSetNorthStar'), 'error');
    }
  };

  // Save Why Statement
  const saveWhyStatement = async () => {
    if (!userId) return;

    const updatedData = {
      ...data,
      missionControl: {
        ...data.missionControl,
        whyStatement: tempWhy.trim()
      }
    };

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await setDoc(doc(db, `users/${userId}/financials`, 'data'), updatedData);
      
      onUpdateData(updatedData);
      setWhyStatement(tempWhy.trim());
      setEditingWhy(false);
      showNotification(t('missionControl.whySavedSuccess'), 'success');

      // Award XP if this is their first time setting Why
      if (!data?.missionControl?.whyStatement && awardXp && setXpRefreshTrigger) {
        try {
          await awardXp(db, userId, 50);
          setXpRefreshTrigger(prev => prev + 1);
          showNotification(t('missionControl.firstWhyStatement'), 'success');
        } catch (error) {
          console.warn('XP award failed', error);
        }
      }
    } catch (error) {
      console.error('Error saving Why statement:', error);
      showNotification(t('missionControl.failedToSave'), 'error');
    }
  };

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-8 p-4 sm:p-6">
      {/* 🎊 Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-2xl border ${
          notification.type === 'success' 
            ? 'bg-green-900/90 border-green-500 text-green-100' 
            : 'bg-red-900/90 border-red-500 text-red-100'
        }`}>
          {notification.message}
        </div>
      )}

      {/* 🌟 PAGE HEADER */}
      <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-gray-900/40 rounded-2xl p-8 border border-blue-500/30 text-center shadow-2xl">
        <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
          {t('missionControl.pageTitle')}
        </h1>
        <p className="text-xl text-blue-200 font-semibold mb-2">
          {t('missionControl.strategicFlightPlan')}
        </p>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {t('missionControl.connectDailyActions')}
        </p>
      </div>

      {/* 1️⃣ THE NORTH STAR - Main Life Goal */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-amber-500/50 shadow-2xl overflow-hidden">
        {northStarGoal ? (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-amber-500/20 rounded-full px-6 py-2 mb-4">
                <span className="text-amber-400 font-black text-sm uppercase tracking-wider">
                  {t('missionControl.yourNorthStar')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
                {northStarGoal.name}
              </h2>
              <p className="text-gray-400">
                {t('missionControl.ultimateGoal')}
              </p>
            </div>

            {/* Progress Donut Chart */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-8">
              {/* Chart */}
              <div className="relative w-80 h-80 p-8">
                {/* Mobile-friendly circular gauge with neon effect - "Jedi Effect" from Freedom Ratio! */}
                <svg 
                  className="w-full h-full transform -rotate-90" 
                  viewBox="0 0 256 256" 
                  style={{ overflow: 'visible' }}
                >
                  {/* Background Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#1f2937"
                    strokeWidth="18"
                    fill="none"
                  />
                  
                  {/* Progress Circle - Layered for Mobile Glow Effect */}
                  {/* Layer 1: Wide, low opacity for base glow */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#FBBF24"
                    strokeWidth="24"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out opacity-30"
                  />
                  
                  {/* Layer 2: Medium width, medium opacity */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#FBBF24"
                    strokeWidth="18"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out opacity-60"
                  />
                  
                  {/* Layer 3: Thin with drop-shadow for neon glow */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#FBBF24"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px #FBBF24)',
                      WebkitFilter: 'drop-shadow(0 0 8px #FBBF24)',
                      willChange: 'filter'
                    }}
                  />
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-5xl font-black text-amber-400">
                    {progressPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mt-1">
                    {t('missionControl.complete')}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
                <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30">
                  <div className="text-sm text-blue-300 mb-2">{t('missionControl.currentSavings')}</div>
                  <div className="text-3xl font-black text-white">
                    ${formatNumber(northStarGoal.currentAmount)}
                  </div>
                </div>
                
                <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
                  <div className="text-sm text-purple-300 mb-2">{t('missionControl.targetAmount')}</div>
                  <div className="text-3xl font-black text-white">
                    ${formatNumber(northStarGoal.targetAmount)}
                  </div>
                </div>
                
                <div className="bg-amber-900/30 rounded-xl p-6 border border-amber-500/30 sm:col-span-2">
                  <div className="text-sm text-amber-300 mb-2">{t('missionControl.remaining')}</div>
                  <div className="text-3xl font-black text-amber-400">
                    ${formatNumber(northStarGoal.targetAmount - northStarGoal.currentAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* The Hope Engine - Projected Freedom Date */}
            {projectedDate && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/40">
                <div className="flex items-center justify-center gap-4">
                  <Rocket className="w-6 h-6 text-green-400" />
                  <div className="text-center">
                    <div className="text-sm text-green-300 mb-1">{t('missionControl.projectedFreedomDate')}</div>
                    <div className="text-2xl font-black text-green-400">
                      {projectedDate.toLocaleDateString(getUserLocale(), { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-green-300/70 mt-1">
                      {t('missionControl.basedOnSavingsRate')}
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            )}

            {/* Target Date */}
            {northStarGoal.targetDate && (
              <div className="mt-6 text-center text-sm text-gray-400">
                {t('missionControl.targetDate')} {new Date(northStarGoal.targetDate + 'T12:00:00').toLocaleDateString(getUserLocale(), { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            )}
          </div>
        ) : (
          // No North Star Set
          <div className="p-12 text-center">
            <div className="inline-block bg-amber-500/10 rounded-full p-6 mb-6">
              <Target className="w-16 h-16 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {t('missionControl.setYourNorthStar')}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {t('missionControl.northStarDescription')}
            </p>
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-500/30 mb-6 max-w-md mx-auto">
              <p className="text-sm text-amber-200 font-semibold mb-2">
                {t('missionControl.howToSetNorthStar')}
              </p>
              <p className="text-sm text-amber-300">
                Faites défiler jusqu'aux <span className="font-bold">Missions Actives</span> ci-dessous et cliquez sur le bouton <span className="font-bold">⭐ Définir comme Étoile Polaire</span> sur votre objectif ultime !
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2️⃣ ACTIVE MISSIONS - Sub-Goals */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 sm:p-8 border border-blue-500/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-blue-400" />
            {t('missionControl.activeMissions')}
          </h2>
          <p className="text-gray-400">
            {t('missionControl.battlesYoureWinning')}
          </p>
        </div>

        {activeMissions.length > 0 ? (
          <div>
            <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30 mb-6 text-center">
              <p className="text-amber-300 text-sm">
                ⭐ Cliquez sur <span className="font-bold">"Définir comme Étoile Polaire"</span> sur votre objectif de vie ultime ci-dessous !
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMissions.map(mission => {
              const progress = (mission.currentAmount / mission.targetAmount) * 100;
              const isComplete = progress >= 100;
              
              return (
                <div 
                  key={mission.id}
                  className={`bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 border transition-all duration-300 ${
                    isComplete 
                      ? 'border-green-500/50 hover:border-green-400 hover:shadow-green-500/20' 
                      : 'border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/20'
                  } hover:shadow-2xl`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex-1">
                      {mission.name}
                    </h3>
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" title={t('missionControl.missionComplete')} />
                    ) : (
                      <Circle className="w-6 h-6 text-blue-400/50 flex-shrink-0" title={t('missionControl.inProgress')} />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>${formatNumber(mission.currentAmount)}</span>
                      <span>${formatNumber(mission.targetAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isComplete ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">
                        {progress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">{t('missionControl.progress')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400">
                        ${formatNumber(mission.targetAmount - mission.currentAmount)}
                      </div>
                      <div className="text-xs text-gray-400">{t('missionControl.remaining')}</div>
                    </div>
                  </div>

                  {/* Target Date */}
                  {mission.targetDate && (
                    <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {t('missionControl.target')} {new Date(mission.targetDate + 'T12:00:00').toLocaleDateString(getUserLocale(), { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}

                  {/* ⭐ SET AS NORTH STAR BUTTON */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setAsNorthStar(mission.id)}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Target className="w-4 h-4" />
                      {t('missionControl.setAsNorthStar')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">{t('missionControl.noActiveMissions')}</p>
            <p className="text-sm text-gray-500">
              {t('missionControl.createGoalsToSee')}
            </p>
          </div>
        )}
      </div>

      {/* 3️⃣ THE "WHY" STATEMENT - Founder's Touch */}
      <div className="bg-gradient-to-br from-purple-900/30 to-gray-900/50 rounded-2xl p-6 sm:p-8 border border-purple-500/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white mb-2">
            {t('missionControl.myWhy')}
          </h2>
          <p className="text-gray-400">
            {t('missionControl.whatAreYouFightingFor')}
          </p>
        </div>

        {editingWhy ? (
          // Editing Mode
          <div className="space-y-4">
            <textarea
              value={tempWhy}
              onChange={(e) => setTempWhy(e.target.value)}
              placeholder={t('missionControl.whyPlaceholder')}
              className="w-full bg-gray-800/50 text-white px-6 py-4 rounded-xl border border-purple-500/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[200px] text-lg leading-relaxed resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingWhy(false);
                  setTempWhy(whyStatement);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={saveWhyStatement}
                disabled={!tempWhy.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-black transition-all flex items-center gap-2 shadow-xl"
              >
                <Save className="w-5 h-5" />
                {t('missionControl.saveMyWhy')}
              </button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div>
            {whyStatement ? (
              <div className="bg-gray-800/30 rounded-xl p-6 border border-purple-500/20 relative group">
                <p className="text-xl text-gray-200 leading-relaxed italic font-medium mb-4">
                  "{whyStatement}"
                </p>
                
                <button
                  onClick={() => {
                    setTempWhy(whyStatement);
                    setEditingWhy(true);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                  title={t('missionControl.editYourWhy')}
                >
                  <Edit className="w-5 h-5" />
                </button>

                <div className="text-sm text-purple-400 font-semibold">
                  {t('missionControl.youOnYourJourney')}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={() => {
                    setTempWhy('');
                    setEditingWhy(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-3 mx-auto shadow-2xl transform hover:scale-105"
                >
                  <Edit className="w-5 h-5" />
                  {t('missionControl.writeYourWhy')}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  {t('missionControl.mostPowerfulTool')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎯 MOTIVATIONAL FOOTER */}
      {northStarGoal && activeMissions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20 text-center">
          <p className="text-lg text-gray-300 italic">
            {t('missionControl.motivationalQuote')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MissionControl;

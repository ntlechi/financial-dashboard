import React, { useState } from 'react';
import { BookOpen, Lock, Unlock, Star, Clock } from 'lucide-react';
import { FINANCIAL_EDUCATION_MODULES } from '../utils/financialEducation';

export default function EducationLibrary({ 
  userRank, 
  unlockedModules = [], 
  onOpenModule 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = {
    'all': 'All Modules',
    'emergency_fund': 'Emergency Fund',
    'debt_management': 'Debt Management', 
    'investing': 'Investing',
    'retirement': 'Retirement',
    'advanced': 'Advanced Topics'
  };

  const getModuleCategory = (moduleId) => {
    if (moduleId.includes('emergency_fund')) return 'emergency_fund';
    if (moduleId.includes('debt')) return 'debt_management';
    if (moduleId.includes('investment')) return 'investing';
    if (moduleId.includes('retirement')) return 'retirement';
    if (moduleId.includes('tax') || moduleId.includes('wealth')) return 'advanced';
    return 'all';
  };

  const filteredModules = Object.entries(FINANCIAL_EDUCATION_MODULES).filter(([moduleId, module]) => {
    if (selectedCategory === 'all') return true;
    return getModuleCategory(moduleId) === selectedCategory;
  });

  const isModuleUnlocked = (moduleId) => {
    return unlockedModules.includes(moduleId);
  };

  const canAccessModule = (moduleId, module) => {
    // Always allow access to unlocked modules
    if (isModuleUnlocked(moduleId)) return true;
    
    // Check rank requirement
    const rankOrder = ['Recruit', 'Climber', 'Operator', 'Pathfinder', 'Vanguard', 'Free Agent'];
    const userRankIndex = rankOrder.indexOf(userRank);
    const requiredRankIndex = rankOrder.indexOf(module.rank);
    
    return userRankIndex >= requiredRankIndex;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Financial Education Library</h3>
          <p className="text-gray-400 text-sm">Learn at your own pace</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map(([moduleId, module]) => {
          const unlocked = isModuleUnlocked(moduleId);
          const accessible = canAccessModule(moduleId, module);
          
          return (
            <div
              key={moduleId}
              className={`rounded-lg p-4 border transition-all ${
                unlocked
                  ? 'bg-green-900/20 border-green-500/30 hover:border-green-400/50'
                  : accessible
                    ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    : 'bg-gray-800/30 border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {unlocked ? (
                    <Unlock className="w-5 h-5 text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <h4 className="text-white font-semibold">{module.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">{module.rank}</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {module.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{module.tips?.length || 0} tips</span>
                </div>
                
                <button
                  onClick={() => onOpenModule(moduleId, module)}
                  disabled={!accessible}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    unlocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : accessible
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {unlocked ? 'Review' : accessible ? 'Learn' : 'Locked'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No modules found in this category.</p>
        </div>
      )}
    </div>
  );
}


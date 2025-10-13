// src/components/StealthToggle.js
// 🛡️ STEALTH MODE TOGGLE - Universal Trust Feature

import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { setStealthMode, isStealthModeEnabled, onStealthModeChange, getStealthMessages } from '../utils/stealthMode';

const StealthToggle = ({ className = '', showLabel = true, size = 'default' }) => {
  const [isStealth, setIsStealth] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Initialize stealth mode
    setIsStealth(isStealthModeEnabled());
    
    // Subscribe to stealth mode changes
    const unsubscribe = onStealthModeChange((enabled) => {
      setIsStealth(enabled);
    });
    
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    setStealthMode(!isStealth);
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const messages = getStealthMessages();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isStealth 
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
          }
          hover:scale-105 active:scale-95
          border-2 ${isStealth ? 'border-amber-500' : 'border-gray-600'}
        `}
        title={isStealth ? 'Disable Stealth Mode' : 'Enable Stealth Mode'}
      >
        {isStealth ? (
          <Shield className={`${iconSizes[size]} animate-pulse`} />
        ) : (
          <Eye className={iconSizes[size]} />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-700 whitespace-nowrap z-50">
          <div className="flex items-center gap-2">
            {isStealth ? (
              <>
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Disable Stealth Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Enable Stealth Mode</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {messages.toggle}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Stealth Mode Badge */}
      {isStealth && showLabel && (
        <div className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
          🛡️
        </div>
      )}
    </div>
  );
};

export default StealthToggle;


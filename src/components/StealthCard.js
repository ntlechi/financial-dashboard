// src/components/StealthCard.js
// 🛡️ STEALTH CARD WRAPPER - Universal Trust Feature

import React, { useState, useEffect } from 'react';
import { isStealthModeEnabled, onStealthModeChange, getStealthOverlayProps, getStealthStyles } from '../utils/stealthMode';

const StealthCard = ({ 
  children, 
  className = '', 
  stealthClassName = '',
  showOverlay = true,
  ...props 
}) => {
  const [isStealth, setIsStealth] = useState(false);

  useEffect(() => {
    // Initialize stealth mode
    setIsStealth(isStealthModeEnabled());
    
    // Subscribe to stealth mode changes
    const unsubscribe = onStealthModeChange((enabled) => {
      setIsStealth(enabled);
    });
    
    return unsubscribe;
  }, []);

  const stealthStyles = getStealthStyles();
  const overlayProps = getStealthOverlayProps();

  return (
    <div 
      className={`
        relative 
        ${className}
        ${isStealth ? stealthClassName : ''}
        transition-all duration-300 ease-in-out
      `}
      {...props}
    >
      {/* Main Content */}
      <div className={`
        ${isStealth ? stealthStyles.blur : ''}
        ${isStealth ? stealthStyles.opacity : ''}
        transition-all duration-300 ease-in-out
      `}>
        {children}
      </div>

      {/* Stealth Overlay */}
      {isStealth && showOverlay && (
        <div {...overlayProps}>
          {overlayProps.children}
        </div>
      )}

      {/* Stealth Mode Indicator */}
      {isStealth && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-amber-600/90 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
            <span>🛡️</span>
            <span>STEALTH</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StealthCard;

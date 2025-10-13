// src/components/StealthCard.js
// 🛡️ STEALTH CARD WRAPPER - Universal Trust Feature

import React, { useState, useEffect } from 'react';
import { getStealthOverlayProps, getStealthStyles } from '../utils/stealthMode';
import { Shield, Eye } from 'lucide-react';

const StealthCard = ({ 
  children, 
  className = '', 
  stealthClassName = '',
  showOverlay = true,
  enableLocalToggle = true,
  defaultLocalStealth = false,
  ...props 
}) => {
  const [isStealth, setIsStealth] = useState(false);
  const [localStealth, setLocalStealth] = useState(defaultLocalStealth);

  // Global stealth removed; only local toggle applies

  const stealthStyles = getStealthStyles();
  const overlayProps = getStealthOverlayProps();

  const effectiveStealth = isStealth || localStealth;

  return (
    <div 
      className={`
        relative 
        ${className}
        ${effectiveStealth ? stealthClassName : ''}
        transition-all duration-300 ease-in-out
      `}
      {...props}
      style={{
        // Ensure stealth never collapses card layout
        minHeight: '100%',
        width: '100%'
      }}
    >
      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${effectiveStealth ? 'pointer-events-none' : ''}
      `}
      style={{
        // Preserve internal spacing when masked
        minHeight: '100%',
        width: '100%'
      }}>
        {children}
      </div>

      {/* Stealth Overlay */}
      {(effectiveStealth) && showOverlay && (
        <div {...overlayProps} className={`${overlayProps.className} pointer-events-auto`}>
          {overlayProps.children}
        </div>
      )}

      {/* Stealth Mode Indicator */}
      {effectiveStealth && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-amber-600/90 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
            <span>🛡️</span>
            <span>STEALTH</span>
          </div>
        </div>
      )}

      {/* Local toggle (optional) */}
      {enableLocalToggle && (
        <button
          type="button"
          onClick={() => setLocalStealth(!localStealth)}
          className="absolute top-2 left-2 z-20 bg-gray-700/70 hover:bg-gray-600 text-white p-1 rounded-full border border-gray-600"
          title={localStealth ? 'Disable card stealth' : 'Enable card stealth'}
        >
          {localStealth ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default StealthCard;


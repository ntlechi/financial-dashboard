// src/components/GlobalStealthToggle.js
import React from 'react';
import { Shield, Eye } from 'lucide-react';

const sizes = {
  small: { btn: 'w-8 h-8', icon: 'w-4 h-4' },
  default: { btn: 'w-10 h-10', icon: 'w-5 h-5' },
  large: { btn: 'w-12 h-12', icon: 'w-6 h-6' }
};

const GlobalStealthToggle = ({ isOn, onToggle, size = 'default', className = '' }) => {
  const s = sizes[size] || sizes.default;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        ${s.btn} rounded-full flex items-center justify-center flex-shrink-0
        transition-all duration-300 ease-in-out border-2
        ${isOn ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white'}
        hover:scale-105 active:scale-95 ${className}
      `}
      title={isOn ? 'Disable Stealth Mode' : 'Enable Stealth Mode'}
    >
      {isOn ? <Shield className={s.icon} /> : <Eye className={s.icon} />}
    </button>
  );
};

export default GlobalStealthToggle;



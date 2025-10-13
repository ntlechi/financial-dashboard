// src/components/StealthCard.js
// Passthrough card wrapper (stealth removed)

import React from 'react';

const StealthCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`relative ${className}`}
      {...props}
      style={{ minHeight: '100%', width: '100%' }}
    >
      {children}
    </div>
  );
};

export default StealthCard;


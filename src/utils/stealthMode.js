// src/utils/stealthMode.js
// 🛡️ STEALTH MODE - Universal Trust Feature (Always Free)

/**
 * Stealth Mode Utilities
 * Privacy-first approach - everyone deserves to feel safe
 */

// Stealth Mode State Management
let stealthModeEnabled = false;
let stealthCallbacks = [];

/**
 * Enable/disable stealth mode
 * @param {boolean} enabled - Whether to enable stealth mode
 */
export const setStealthMode = (enabled) => {
  stealthModeEnabled = enabled;
  
  // Notify all registered callbacks
  stealthCallbacks.forEach(callback => {
    try {
      callback(enabled);
    } catch (error) {
      console.error('🛡️ Stealth mode callback error:', error);
    }
  });
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem('stealthMode', enabled.toString());
  } catch (error) {
    console.warn('🛡️ Could not save stealth mode to localStorage:', error);
  }
  
  console.log(`🛡️ Stealth Mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
};

/**
 * Get current stealth mode status
 * @returns {boolean} - Whether stealth mode is enabled
 */
export const isStealthModeEnabled = () => {
  return stealthModeEnabled;
};

/**
 * Register a callback for stealth mode changes
 * @param {function} callback - Function to call when stealth mode changes
 * @returns {function} - Unsubscribe function
 */
export const onStealthModeChange = (callback) => {
  stealthCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = stealthCallbacks.indexOf(callback);
    if (index > -1) {
      stealthCallbacks.splice(index, 1);
    }
  };
};

/**
 * Initialize stealth mode from localStorage
 */
export const initStealthMode = () => {
  try {
    const saved = localStorage.getItem('stealthMode');
    if (saved !== null) {
      stealthModeEnabled = saved === 'true';
    }
  } catch (error) {
    console.warn('🛡️ Could not load stealth mode from localStorage:', error);
    stealthModeEnabled = false;
  }
  
  console.log(`🛡️ Stealth Mode initialized: ${stealthModeEnabled ? 'ENABLED' : 'DISABLED'}`);
};

/**
 * Get stealth mode messaging
 */
export const getStealthMessages = () => ({
  enabled: "You're in Stealth Mode. Eyes off your mission.",
  toggle: "Stealth Mode — Always Free",
  description: "Because freedom means privacy. No one should ever have to pay to feel safe.",
  badge: "🛡️ STEALTH"
});

/**
 * Get stealth mode styles
 */
export const getStealthStyles = () => ({
  blur: stealthModeEnabled ? 'blur-sm' : '',
  opacity: stealthModeEnabled ? 'opacity-60' : '',
  overlay: stealthModeEnabled ? 'bg-black/20' : '',
  border: stealthModeEnabled ? 'border-amber-500/50' : '',
  text: stealthModeEnabled ? 'text-amber-400' : ''
});

/**
 * Create stealth mode overlay component props
 */
export const getStealthOverlayProps = () => ({
  className: stealthModeEnabled ? 'absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg' : 'hidden',
  children: (
    <div className="text-center p-4">
      <div className="text-2xl mb-2">🛡️</div>
      <p className="text-amber-400 font-semibold text-sm">
        {getStealthMessages().enabled}
      </p>
    </div>
  )
});

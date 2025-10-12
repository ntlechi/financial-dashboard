// 🔧 COMPONENT EXTRACTION UTILITIES
// Tools to help split the massive App.js into manageable components

import React from 'react';
import { createLazyComponent, memoizedCalculation } from './performanceOptimization';

// ============================================================================
// 📦 COMPONENT EXTRACTION HELPERS
// ============================================================================

/**
 * Extract a component from App.js with proper error boundaries
 * @param {Function} componentFactory - Function that returns the component
 * @param {string} componentName - Name of the component for debugging
 * @returns {React.Component} - Extracted component with error boundary
 */
export function extractComponent(componentFactory, componentName) {
  return function ExtractedComponent(props) {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const errorHandler = (error) => {
        setHasError(true);
        setError(error);
        console.error(`Error in ${componentName}:`, error);
      };

      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-400 font-semibold mb-2">
            Error in {componentName}
          </div>
          <div className="text-red-300 text-sm">
            {error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    try {
      const Component = componentFactory();
      return React.createElement(Component, props);
    } catch (error) {
      setHasError(true);
      setError(error);
      return null;
    }
  };
}

/**
 * Create a lazy-loaded component with loading state
 * @param {Function} importFn - Dynamic import function
 * @param {string} componentName - Name of the component
 * @returns {React.Component} - Lazy component with loading fallback
 */
export function createLazyComponentWithFallback(importFn, componentName) {
  const LazyComponent = createLazyComponent(importFn, componentName);

  return function LazyComponentWithFallback(props) {
    return (
      <React.Suspense
        fallback={
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="text-center mt-4 text-gray-400 text-sm">
              Loading {componentName}...
            </div>
          </div>
        }
      >
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

// ============================================================================
// 🎯 SPECIFIC COMPONENT EXTRACTORS
// ============================================================================

/**
 * Extract dashboard components
 */
export const DashboardComponents = {
  // Net Worth Card
  NetWorthCard: extractComponent(() => {
    return function NetWorthCard({ netWorth, onEdit }) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Worth</h3>
          <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netWorth?.toLocaleString() || 0}
          </p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      );
    };
  }, 'NetWorthCard'),

  // Income Card
  IncomeCard: extractComponent(() => {
    return function IncomeCard({ income, onEdit }) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Income</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${income?.toLocaleString() || 0}
          </p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      );
    };
  }, 'IncomeCard'),

  // Expenses Card
  ExpensesCard: extractComponent(() => {
    return function ExpensesCard({ expenses, onEdit }) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
          <p className="text-3xl font-bold text-red-600">
            ${expenses?.toLocaleString() || 0}
          </p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      );
    };
  }, 'ExpensesCard'),

  // Cash Flow Card
  CashFlowCard: extractComponent(() => {
    return function CashFlowCard({ cashFlow, onEdit }) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h3>
          <p className={`text-3xl font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${cashFlow?.toLocaleString() || 0}
          </p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      );
    };
  }, 'CashFlowCard')
};

/**
 * Extract modal components
 */
export const ModalComponents = {
  // Generic Modal Wrapper
  ModalWrapper: extractComponent(() => {
    return function ModalWrapper({ isOpen, onClose, title, children, className = '' }) {
      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      );
    };
  }, 'ModalWrapper'),

  // Card Editor Modal
  CardEditorModal: extractComponent(() => {
    return function CardEditorModal({ isOpen, onClose, cardData, onSave, cardType }) {
      const [tempData, setTempData] = React.useState(cardData || {});

      React.useEffect(() => {
        if (isOpen) {
          setTempData(cardData || {});
        }
      }, [isOpen, cardData]);

      const handleSave = () => {
        onSave(tempData);
        onClose();
      };

      return (
        <ModalComponents.ModalWrapper
          isOpen={isOpen}
          onClose={onClose}
          title={`Edit ${cardType}`}
        >
          <div className="space-y-4">
            {/* Add form fields based on cardType */}
            <div>
              <label className="block text-white font-semibold mb-2">
                {cardType} Data
              </label>
              <textarea
                value={JSON.stringify(tempData, null, 2)}
                onChange={(e) => {
                  try {
                    setTempData(JSON.parse(e.target.value));
                  } catch (error) {
                    // Invalid JSON, keep current value
                  }
                }}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows="10"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </ModalComponents.ModalWrapper>
      );
    };
  }, 'CardEditorModal')
};

/**
 * Extract form components
 */
export const FormComponents = {
  // Number Input with validation
  NumberInput: extractComponent(() => {
    return function NumberInput({ label, value, onChange, placeholder, min, max, className = '' }) {
      const [error, setError] = React.useState('');

      const handleChange = (e) => {
        const inputValue = e.target.value;
        const numValue = parseFloat(inputValue);

        if (inputValue === '' || (!isNaN(numValue) && isFinite(numValue))) {
          if (min !== undefined && numValue < min) {
            setError(`Value must be at least ${min}`);
          } else if (max !== undefined && numValue > max) {
            setError(`Value must be at most ${max}`);
          } else {
            setError('');
          }
          onChange(numValue);
        }
      };

      return (
        <div className={className}>
          <label className="block text-white font-semibold mb-2">
            {label}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`w-full bg-gray-700 text-white px-3 py-2 rounded border ${
              error ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
            } focus:outline-none`}
          />
          {error && (
            <div className="text-red-400 text-sm mt-1">{error}</div>
          )}
        </div>
      );
    };
  }, 'NumberInput'),

  // Text Input with validation
  TextInput: extractComponent(() => {
    return function TextInput({ label, value, onChange, placeholder, maxLength, className = '' }) {
      return (
        <div className={className}>
          <label className="block text-white font-semibold mb-2">
            {label}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      );
    };
  }, 'TextInput')
};

// ============================================================================
// 🔄 STATE MANAGEMENT HELPERS
// ============================================================================

/**
 * Create a memoized state hook for expensive calculations
 * @param {any} initialValue - Initial state value
 * @param {Function} calculationFn - Function to calculate new state
 * @param {Array} dependencies - Dependencies for the calculation
 * @returns {Array} - [state, setState] tuple
 */
export function useMemoizedState(initialValue, calculationFn, dependencies = []) {
  const [state, setState] = React.useState(initialValue);

  React.useEffect(() => {
    if (calculationFn) {
      const newState = memoizedCalculation(
        'memoized_state',
        calculationFn,
        ...dependencies
      );
      setState(newState);
    }
  }, dependencies);

  return [state, setState];
}

/**
 * Create a debounced state hook
 * @param {any} initialValue - Initial state value
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Array} - [state, setState] tuple
 */
export function useDebouncedState(initialValue, delay = 300) {
  const [state, setState] = React.useState(initialValue);
  const [debouncedState, setDebouncedState] = React.useState(initialValue);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => clearTimeout(timer);
  }, [state, delay]);

  return [debouncedState, setState];
}

// ============================================================================
// 🎯 EXPORT ALL EXTRACTION UTILITIES
// ============================================================================

export default {
  // Component extraction
  extractComponent,
  createLazyComponentWithFallback,
  
  // Specific components
  DashboardComponents,
  ModalComponents,
  FormComponents,
  
  // State management
  useMemoizedState,
  useDebouncedState
};

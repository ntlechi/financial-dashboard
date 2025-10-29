// 🚀 Lazy Loading Components for Better Performance

import { lazy } from 'react';

// Lazy load heavy components to improve initial load time
export const LazyBudgetCalculator = lazy(() => 
  new Promise(resolve => {
    // Add a small delay to prevent flash of loading
    setTimeout(() => {
      resolve({ default: () => import('../components/BudgetCalculator') });
    }, 100);
  }).then(module => module.default())
);

export const LazyInvestmentPortfolio = lazy(() => 
  import('../components/Portfolio').then(module => ({ default: module.default }))
);

export const LazyTransactionManager = lazy(() => 
  import('../components/Transactions').then(module => ({ default: module.default }))
);

// Loading fallback component with Kompul branding
export const LoadingFallback = ({ componentName = 'Component' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
      <p className="text-amber-200 text-sm">Loading {componentName}...</p>
    </div>
  </div>
);

export default {
  LazyBudgetCalculator,
  LazyInvestmentPortfolio, 
  LazyTransactionManager,
  LoadingFallback
};
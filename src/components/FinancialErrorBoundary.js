import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class FinancialErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💰 Financial Component Error:', {
      component: this.props.componentName || 'Financial Component',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    });

    this.setState({ error });

    // Track financial component errors specifically
    if (process.env.NODE_ENV === 'production') {
      // sendFinancialErrorToService({
      //   component: this.props.componentName,
      //   error: error.message,
      //   errorId: this.state.errorId
      // });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Render financial-specific error UI
      return (
        <div className="bg-red-900/20 rounded-2xl p-6 border border-red-500/30 shadow-lg">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-2">
              {this.props.componentName || 'Financial Component'} Error
            </h3>
            <p className="text-red-200 text-sm mb-4">
              This section encountered an error, but your financial data is safe.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-800/20 rounded p-3 mb-4 text-xs text-red-300 font-mono text-left">
                {this.state.error.message}
              </div>
            )}
            
            <button
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for financial components
export const withFinancialErrorBoundary = (Component, componentName) => {
  return function WrappedFinancialComponent(props) {
    return (
      <FinancialErrorBoundary componentName={componentName}>
        <Component {...props} />
      </FinancialErrorBoundary>
    );
  };
};

export default FinancialErrorBoundary;
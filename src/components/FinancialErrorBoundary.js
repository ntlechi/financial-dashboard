import React from 'react';
import { Calculator, AlertTriangle, RefreshCw } from 'lucide-react';

class FinancialErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🧮 Financial Calculation Error:', error, errorInfo);
    
    this.setState({ error });

    // Log financial errors specifically
    if (process.env.NODE_ENV === 'production') {
      console.error('Financial Error:', {
        component: this.props.componentName || 'Unknown',
        error: error.toString(),
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      retryCount: this.state.retryCount + 1
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
            <Calculator className="w-6 h-6 text-red-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Calculation Error
          </h3>
          
          <p className="text-red-200 text-sm mb-4">
            {this.props.componentName || 'This financial component'} encountered an error. 
            Your data is safe - this is just a display issue.
          </p>

          {this.state.retryCount < 3 && (
            <button
              onClick={this.handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Calculation
            </button>
          )}

          {this.state.retryCount >= 3 && (
            <div className="text-red-300 text-xs">
              Multiple retry attempts failed. Please refresh the page.
            </div>
          )}

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-3 text-left">
              <summary className="text-red-300 text-xs cursor-pointer">
                Debug Info
              </summary>
              <pre className="text-red-200 text-xs mt-2 bg-red-900/30 p-2 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default FinancialErrorBoundary;
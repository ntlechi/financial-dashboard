import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) // Simple error ID for tracking
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you could send this to an error reporting service
    // Example: Sentry, LogRocket, or custom error tracking
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToService({
      //   error: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack,
      //   errorId: this.state.errorId
      // });
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    // Navigate to home/dashboard
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render custom error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 shadow-lg shadow-red-500/10">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-red-400 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-red-200">
                  The Freedom Compass encountered an unexpected error, but your data is safe.
                </p>
              </div>

              <div className="bg-red-800/20 rounded-lg p-4 mb-6 border border-red-600/30">
                <div className="text-sm text-red-200">
                  <div className="font-semibold mb-1">Error ID: {this.state.errorId}</div>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="text-xs text-red-300 mt-2 font-mono">
                      {this.state.error.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  If this problem persists, please refresh the page or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('🚨 Component Error:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString()
    });
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToService({ error, errorInfo });
    }
  };
};

export default ErrorBoundary;
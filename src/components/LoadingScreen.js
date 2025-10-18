import React from 'react';
import { Mountain, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Mountain className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Freedom Compass</h1>
          <p className="text-blue-200">Loading your financial journey...</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <span className="text-white">Preparing your dashboard</span>
        </div>
        
        <div className="mt-8 text-sm text-blue-300">
          <p>Optimizing your experience...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

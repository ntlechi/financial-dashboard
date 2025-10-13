import React, { useEffect, useState } from 'react';
import { X, BookOpen, Lightbulb, Star, CheckCircle, ArrowRight } from 'lucide-react';

export default function FinancialEducationModal({ 
  isOpen, 
  onClose, 
  educationModule,
  onMarkAsRead
}) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (isOpen && educationModule) {
      setShowAnimation(false);
      setShowContent(false);
      setCurrentTip(0);
      
      setTimeout(() => setShowAnimation(true), 100);
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen, educationModule]);

  if (!isOpen || !educationModule) return null;

  const handleNextTip = () => {
    if (currentTip < educationModule.tips.length - 1) {
      setCurrentTip(currentTip + 1);
    }
  };

  const handlePreviousTip = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  const handleComplete = () => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-blue-500/50 shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-white animate-pulse" />
              <Lightbulb className="w-8 h-8 text-yellow-300 ml-2 animate-bounce" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Knowledge Unlocked!</h1>
            <p className="text-blue-100 text-lg">New Learning Module Available</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`transition-all duration-1000 delay-200 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Module Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {educationModule.title}
              </h2>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">Educational Content</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                {educationModule.content}
              </p>
            </div>

            {/* Tips Section */}
            {educationModule.tips && educationModule.tips.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Key Tips ({currentTip + 1} of {educationModule.tips.length})
                </h3>
                
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">{currentTip + 1}</span>
                    </div>
                    <p className="text-yellow-200 text-base leading-relaxed">
                      {educationModule.tips[currentTip]}
                    </p>
                  </div>
                </div>

                {/* Tip Navigation */}
                {educationModule.tips.length > 1 && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePreviousTip}
                      disabled={currentTip === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {educationModule.tips.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentTip ? 'bg-yellow-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNextTip}
                      disabled={currentTip === educationModule.tips.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Completion */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



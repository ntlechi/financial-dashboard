import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Target, DollarSign, PiggyBank, X, Crown } from 'lucide-react';

const FirstClimbOnboarding = ({ user, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Your Financial Freedom Journey!',
      description: 'You\'ve just joined The Freedom Compass App - your training ground for building wealth and discipline.',
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      action: 'Start Your First Climb',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome, Financial Navigator! 🎯
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              You're about to begin your "First Climb" - a guided journey to financial mastery.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-white font-semibold mb-2">🏔️ The First Climb Protocol</h3>
            <p className="text-gray-300 text-sm">
              We'll guide you through 4 essential steps to get your financial foundation rock-solid. 
              Each step builds discipline and awareness - the cornerstones of wealth building.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Why Manual Entry Builds Wealth:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Awareness:</strong> You become conscious of every dollar</li>
              <li>• <strong>Discipline:</strong> Manual tracking builds better habits</li>
              <li>• <strong>Control:</strong> You own your financial data completely</li>
              <li>• <strong>Mindfulness:</strong> Each entry is a moment of financial reflection</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'first-transaction',
      title: 'Log Your First Transaction',
      description: 'Start building awareness by recording a recent expense or income.',
      icon: <DollarSign className="w-8 h-8 text-green-400" />,
      action: 'Add Transaction',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Your First Financial Entry</h3>
            <p className="text-gray-300">
              Think of a recent purchase - coffee, groceries, or income. Let's log it manually.
            </p>
          </div>

          <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-300 font-semibold mb-2">💡 Pro Tip:</h4>
            <p className="text-gray-300 text-sm">
              Don't worry about being perfect. The goal is to start the habit of conscious money tracking. 
              Every millionaire started with their first recorded transaction.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-300 text-sm">
              <strong>Next:</strong> Go to the Transactions tab and add any recent expense or income. 
              Feel the power of taking control of your financial data!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'set-budget',
      title: 'Create Your First Budget',
      description: 'Use our 50/30/20 calculator to plan your money allocation.',
      icon: <Target className="w-8 h-8 text-blue-400" />,
      action: 'Set Budget',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Build Your Money Plan</h3>
            <p className="text-gray-300">
              A budget isn't restriction - it's giving every dollar a purpose and direction.
            </p>
          </div>

          <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <h4 className="text-blue-300 font-semibold mb-2">🎯 The 50/30/20 Rule:</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>50% Needs:</strong> Housing, utilities, groceries, minimum debt payments</div>
              <div><strong>30% Wants:</strong> Entertainment, dining out, hobbies, fun money</div>
              <div><strong>20% Savings:</strong> Emergency fund, retirement, debt payoff, investments</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-300 text-sm">
              <strong>Action:</strong> Go to Budget Calculator and enter your monthly income. 
              See how the 50/30/20 rule applies to your situation.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'emergency-fund',
      title: 'Set Your Emergency Fund Goal',
      description: 'Every financial journey starts with a safety net. Set your rainy day target.',
      icon: <PiggyBank className="w-8 h-8 text-purple-400" />,
      action: 'Set Goal',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <PiggyBank className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Your Financial Safety Net</h3>
            <p className="text-gray-300">
              Before investing or big goals, secure your foundation with an emergency fund.
            </p>
          </div>

          <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-300 font-semibold mb-2">🛡️ Emergency Fund Basics:</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>Starter Goal:</strong> $1,000 for immediate emergencies</div>
              <div><strong>Full Goal:</strong> 3-6 months of essential expenses</div>
              <div><strong>Purpose:</strong> Car repairs, medical bills, job loss protection</div>
              <div><strong>Location:</strong> High-yield savings account (easy access)</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-300 text-sm">
              <strong>Your Mission:</strong> Calculate your monthly essential expenses and set a 
              3-month emergency fund goal. This is your financial foundation!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-yellow-600/10 to-orange-600/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <h2 className="text-xl font-bold text-white">The First Climb</h2>
                <p className="text-gray-400 text-sm">Step {currentStep + 1} of {onboardingSteps.length}</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h3>
            <p className="text-gray-400">{currentStepData.description}</p>
          </div>

          {currentStepData.content}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkipStep}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Skip for now
            </button>
            
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={() => handleStepComplete(currentStepData.id)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Complete First Climb' : currentStepData.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  index <= currentStep 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstClimbOnboarding;
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Rocket, TrendingUp, Target, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * QuickStartGuide Component
 * 
 * Onboarding guide that appears for first-time users
 * - Shows step-by-step getting started instructions
 * - Can be dismissed permanently via checkbox
 * - Accessible from Help menu later
 * - Responsive design for mobile
 */
export default function QuickStartGuide({ onClose, forceShow = false }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check if user has dismissed before (only if not forced to show)
  useEffect(() => {
    if (!forceShow) {
      const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
      if (hasSeenQuickStart === 'true') {
        setDismissed(true);
      }
    }
  }, [forceShow]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenQuickStart', 'true');
    }
    setDismissed(true);
    if (onClose) onClose();
  };

  // Don't show if dismissed (unless forced)
  if (dismissed && !forceShow) return null;

  const steps = [
    {
      icon: <Rocket className="w-6 h-6 text-blue-400" />,
      title: t('quickStart.step1Title'),
      description: t('quickStart.step1Description'),
      color: "blue"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      title: t('quickStart.step2Title'),
      description: t('quickStart.step2Description'),
      color: "green"
    },
    {
      icon: <Target className="w-6 h-6 text-amber-400" />,
      title: t('quickStart.step3Title'),
      description: t('quickStart.step3Description'),
      color: "amber"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: t('quickStart.step4Title'),
      description: t('quickStart.step4Description'),
      color: "purple"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl border-b border-blue-500/30">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('quickStart.welcomeTitle')}
              </h2>
              <p className="text-blue-100 text-sm">
                {t('quickStart.welcomeSubtitle')}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-200 text-sm leading-relaxed">
              <strong className="text-blue-400">{t('quickStart.guideIntro')}</strong> {t('quickStart.guideDescription')}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`bg-gray-800/50 border border-${step.color}-500/30 rounded-lg p-4 hover:border-${step.color}-500/50 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${step.color}-900/30 border border-${step.color}-500/30 flex items-center justify-center`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-${step.color}-400 font-bold text-sm`}>
                        {t('quickStart.step')} {index + 1}
                      </span>
                      <h3 className="text-white font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-4">
            <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('quickStart.proTips')}
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">{t('quickStart.proTip1Title')}</strong> {t('quickStart.proTip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">{t('quickStart.proTip2Title')}</strong> {t('quickStart.proTip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">{t('quickStart.proTip3Title')}</strong> {t('quickStart.proTip3')}</span>
              </li>
            </ul>
          </div>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-gray-300 text-sm cursor-pointer select-none"
            >
              {t('quickStart.dontShowAgain')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {t('quickStart.letsGetStarted')}
            </button>
            {!forceShow && (
              <button
                onClick={() => {
                  localStorage.setItem('hasSeenQuickStart', 'true');
                  handleClose();
                }}
                className="sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t('quickStart.skipForNow')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

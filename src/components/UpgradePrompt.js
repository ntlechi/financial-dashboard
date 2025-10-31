import React from 'react';
import { X, Lock, Crown, Zap, Rocket, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UpgradePrompt = ({ 
  onClose, 
  featureName, 
  requiredPlan, 
  onUpgrade, 
  currentPlan = 'free',
  isFoundersCircleAvailable = false 
}) => {
  const { t } = useTranslation();

  const planDetails = {
    'climber': {
      name: t('upgradePrompt.climberPlan'),
      price: t('upgradePrompt.priceClimber'),
      icon: Zap,
      color: 'from-blue-600 to-blue-700',
      features: [
        t('upgradePrompt.featureFullDashboard'),
        t('upgradePrompt.featureAllCalculators'),
        t('upgradePrompt.featureAdvancedAnalytics'),
        t('upgradePrompt.featureGoalTracking')
      ]
    },
    'operator': {
      name: t('upgradePrompt.operatorPlan'),
      price: t('upgradePrompt.priceOperator'),
      icon: Rocket,
      color: 'from-purple-600 to-purple-700',
      features: [
        t('upgradePrompt.featureSideHustle'),
        t('upgradePrompt.featureInvestmentPortfolio'),
        t('upgradePrompt.featureTravelMode'),
        t('upgradePrompt.featureBusinessAnalytics')
      ]
    }
  };

  const foundersCircle = {
    name: t('upgradePrompt.foundersCircle'),
    price: t('upgradePrompt.priceFounders'),
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    features: [
      t('upgradePrompt.featureOperatorAccess'),
      t('upgradePrompt.featureLifetimeLock'),
      t('upgradePrompt.featureFounderBadge'),
      t('upgradePrompt.featureEarlyAccess')
    ]
  };

  const getFeatureDescription = (feature) => {
    const descriptions = {
      'Side Hustle Management': t('upgradePrompt.descSideHustle'),
      'Investment Portfolio': t('upgradePrompt.descInvestmentPortfolio'),
      'Travel Mode': t('upgradePrompt.descTravelMode'),
      'Advanced Dashboard': t('upgradePrompt.descAdvancedDashboard'),
      'Advanced Analytics': t('upgradePrompt.descAdvancedAnalytics')
    };
    return descriptions[feature] || t('upgradePrompt.descDefault', { feature });
  };

  const plan = planDetails[requiredPlan];
  const PlanIcon = plan?.icon || Lock;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header - Sticky so close button always visible */}
        <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-gray-700 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">{t('upgradePrompt.unlockFeature', { featureName })}</h2>
              <p className="text-gray-400 text-xs sm:text-sm">{t('upgradePrompt.upgradeToAccess')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Feature Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{t('upgradePrompt.whyYouWillLove', { featureName })}</h3>
            <p className="text-gray-300 leading-relaxed">
              {getFeatureDescription(featureName)}
            </p>
          </div>

          {/* Founder's Circle Offer (if available) */}
          {isFoundersCircleAvailable && (
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Crown className="w-6 h-6 text-amber-400 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-amber-400">{t('upgradePrompt.limitedLaunchOffer')}</h4>
                  <p className="text-amber-200 text-sm">{t('upgradePrompt.fullOperatorAccess')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {foundersCircle.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-amber-100">
                    <ArrowRight className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onUpgrade('founders-circle')}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {t('upgradePrompt.claimFoundersSpot', { price: foundersCircle.price })}
              </button>
            </div>
          )}

          {/* Required Plan */}
          {plan && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <PlanIcon className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-gray-400 text-sm">{t('upgradePrompt.requiredFor', { featureName })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <ArrowRight className="w-3 h-3 text-blue-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onUpgrade(requiredPlan)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {t('upgradePrompt.upgradeTo', { planName: plan.name, price: plan.price })}
              </button>
            </div>
          )}

          {/* Alternative: View All Plans */}
          <div className="text-center">
            <button
              onClick={() => onUpgrade('view-all')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {t('upgradePrompt.viewAllPlans')}
            </button>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="border-t border-gray-700 p-3 sm:p-4 text-center flex-shrink-0">
          <p className="text-gray-400 text-xs sm:text-sm">
            {t('upgradePrompt.moneyBackGuarantee')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;

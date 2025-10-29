import React from 'react';
import { useTranslation } from 'react-i18next';

const BudgetCalculator = () => {
  const { t } = useTranslation();
  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('budget.budgetCalculator')}</h2>
        <p className="text-gray-600 mb-6">
          {t('budget.useRules')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('budget.rule503020')}</h3>
            <p className="text-gray-600 text-sm">{t('budget.ruleDescription')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('budget.sixJarsSystem')}</h3>
            <p className="text-gray-600 text-sm">{t('budget.sixJarsDescription')}</p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500">
          {t('budget.comingSoon')}
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator;
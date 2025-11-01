// 🛠️ QUICK EXPENSE MODAL - Fixed version that prevents all modal bugs
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FixedModal, { FixedInput, FixedButton } from './FixedModal';

// Helper function to get local date in YYYY-MM-DD format (fixes "tomorrow" bug)
const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const QuickExpenseModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    date: getTodayLocalDate(), // FIX: Use local date instead of UTC
  });

  const handleSave = () => {
    if (!expense.description || !expense.amount) {
      return;
    }

    onSave({
      ...expense,
      amount: parseFloat(expense.amount),
      category: 'personal',
      subcategory: 'other',
    });

    // Reset form
    setExpense({
      description: '',
      amount: '',
      date: getTodayLocalDate(), // FIX: Use local date
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form
    setExpense({
      description: '',
      amount: '',
      date: getTodayLocalDate(), // FIX: Use local date
    });
    onClose();
  };

  return (
    <FixedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('quickActions.quickExpense')}
      description={t('quickActions.quickExpenseDescription')}
      size="md"
      headerClassName="bg-gradient-to-r from-red-900/30 to-pink-900/30 border-b border-red-700/30"
    >
      <div className="space-y-4 bg-gradient-to-br from-red-900/10 to-pink-900/10 rounded-lg p-4 border border-red-500/20">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            {t('quickActions.whatDidYouSpendOn')}
          </label>
          <FixedInput
            type="text"
            placeholder={t('quickActions.expensePlaceholder')}
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            autoFocus
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('common.amount')}</label>
            <FixedInput
              type="number"
              placeholder={t('placeholders.numericExamples.zeroDecimal')}
              step="0.01"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('common.date')}</label>
            <FixedInput
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-red-900/20 rounded-lg p-3 border border-red-600/30">
          <div className="text-xs text-red-200">
            💡 <strong>{t('quickActions.quickTip')}</strong> {t('quickActions.expenseTip')}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <FixedButton
          onClick={handleClose}
          variant="secondary"
        >
          {t('common.cancel')}
        </FixedButton>
        <FixedButton
          onClick={handleSave}
          disabled={!expense.description || !expense.amount}
          variant="danger"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('quickActions.logExpense')}
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default QuickExpenseModal;


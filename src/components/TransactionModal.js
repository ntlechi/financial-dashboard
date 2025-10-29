// 🛠️ TRANSACTION MODAL - Fixed version that prevents all modal bugs
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import FixedModal, { FixedInput, FixedSelect, FixedButton } from './FixedModal';
import { useTranslation } from 'react-i18next';

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, isEditing = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'personal',
    subcategory: 'other',
    type: 'expense', // expense or income
    account: 'cash',
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && transaction) {
        setFormData({
          description: transaction.description || '',
          amount: transaction.amount || '',
          date: transaction.date || new Date().toISOString().split('T')[0],
          category: transaction.category || 'personal',
          subcategory: transaction.subcategory || 'other',
          type: transaction.type || 'expense',
          account: transaction.account || 'cash',
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'personal',
          subcategory: 'other',
          type: 'expense',
          account: 'cash',
        });
      }
    }
  }, [isOpen, isEditing, transaction]);

  const handleSave = () => {
    if (!formData.description || !formData.amount) {
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      id: isEditing && transaction ? transaction.id : Date.now(),
      timestamp: isEditing && transaction ? transaction.timestamp : new Date().toISOString(),
    };

    onSave(transactionData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'personal',
      subcategory: 'other',
      type: 'expense',
      account: 'cash',
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <FixedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? t('transactions.editTransaction') : t('transactions.addTransaction')}
      description={isEditing ? t('transactions.updateTransactionDetails') : t('transactions.addNewTransactionToRecords')}
      size="lg"
    >
      <div className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">{t('transactions.transactionType')}</label>
          <FixedSelect
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="expense">{t('dashboard.expense')}</option>
            <option value="income">{t('dashboard.income')}</option>
          </FixedSelect>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            {formData.type === 'income' ? t('transactions.incomeSource') : t('transactions.whatDidYouSpendOn')}
          </label>
          <FixedInput
            type="text"
            placeholder={formData.type === 'income' ? t('transactions.incomePlaceholder') : t('transactions.expensePlaceholder')}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            autoFocus
          />
        </div>
        
        {/* Amount and Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('common.amount')}</label>
            <FixedInput
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('common.date')}</label>
            <FixedInput
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('common.category')}</label>
            <FixedSelect
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="personal">{t('categories.personal')}</option>
              <option value="business">{t('categories.business')}</option>
              <option value="investment">{t('common.investment')}</option>
              <option value="travel">{t('common.travel')}</option>
            </FixedSelect>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">{t('transactions.subcategory')}</label>
            <FixedSelect
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
            >
              <option value="other">{t('categories.other')}</option>
              <option value="housing">{t('categories.housing')}</option>
              <option value="food">{t('categories.food')}</option>
              <option value="transport">{t('categories.transport')}</option>
              <option value="entertainment">{t('categories.entertainment')}</option>
              <option value="healthcare">{t('categories.healthcare')}</option>
              <option value="shopping">{t('categories.shopping')}</option>
              <option value="utilities">{t('categories.utilities')}</option>
              <option value="insurance">{t('categories.insurance')}</option>
              <option value="education">{t('categories.education')}</option>
            </FixedSelect>
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">{t('transactions.account')}</label>
          <FixedSelect
            value={formData.account}
            onChange={(e) => handleInputChange('account', e.target.value)}
          >
            <option value="cash">{t('accounts.cash')}</option>
            <option value="checking">{t('accounts.checking')}</option>
            <option value="savings">{t('accounts.savings')}</option>
            <option value="credit">{t('accounts.credit')}</option>
            <option value="investment">{t('accounts.investmentAccount')}</option>
          </FixedSelect>
        </div>

        {/* Info Box */}
        <div className={`rounded-lg p-3 border ${
          formData.type === 'income' 
            ? 'bg-green-900/20 border-green-600/30' 
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <div className={`text-xs ${
            formData.type === 'income' ? 'text-green-200' : 'text-red-200'
          }`}>
            💡 <strong>{t('transactions.tip')}</strong> {formData.type === 'income' 
              ? t('transactions.incomeTip') 
              : t('transactions.expenseTip')}
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
          disabled={!formData.description || !formData.amount}
          variant={formData.type === 'income' ? 'success' : 'danger'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isEditing ? t('transactions.updateTransaction') : t('transactions.addTransaction')}
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default TransactionModal;


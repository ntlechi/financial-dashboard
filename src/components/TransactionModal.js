// 🛠️ TRANSACTION MODAL - Fixed version that prevents all modal bugs
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import FixedModal, { FixedInput, FixedSelect, FixedButton } from './FixedModal';

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, isEditing = false }) => {
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
      title={isEditing ? "Edit Transaction" : "Add Transaction"}
      description={isEditing ? "Update transaction details" : "Add a new transaction to your records"}
      size="lg"
    >
      <div className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Transaction Type</label>
          <FixedSelect
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </FixedSelect>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            {formData.type === 'income' ? 'Income Source' : 'What did you spend on?'}
          </label>
          <FixedInput
            type="text"
            placeholder={formData.type === 'income' ? 'e.g., Salary, Freelance, Investment...' : 'e.g., Coffee, Lunch, Gas, Groceries...'}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            autoFocus
          />
        </div>
        
        {/* Amount and Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Amount</label>
            <FixedInput
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Date</label>
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
            <label className="block text-sm text-gray-300 mb-2">Category</label>
            <FixedSelect
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="investment">Investment</option>
              <option value="travel">Travel</option>
            </FixedSelect>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Subcategory</label>
            <FixedSelect
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
            >
              <option value="other">Other</option>
              <option value="housing">Housing</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="healthcare">Healthcare</option>
              <option value="shopping">Shopping</option>
              <option value="utilities">Utilities</option>
              <option value="insurance">Insurance</option>
              <option value="education">Education</option>
            </FixedSelect>
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Account</label>
          <FixedSelect
            value={formData.account}
            onChange={(e) => handleInputChange('account', e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="checking">Checking Account</option>
            <option value="savings">Savings Account</option>
            <option value="credit">Credit Card</option>
            <option value="investment">Investment Account</option>
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
            💡 <strong>Tip:</strong> {formData.type === 'income' 
              ? 'This will be added to your income tracking and net worth calculation.' 
              : 'This will be deducted from your cash flow and net worth calculation.'}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <FixedButton
          onClick={handleClose}
          variant="secondary"
        >
          Cancel
        </FixedButton>
        <FixedButton
          onClick={handleSave}
          disabled={!formData.description || !formData.amount}
          variant={formData.type === 'income' ? 'success' : 'danger'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </FixedButton>
      </div>
    </FixedModal>
  );
};

export default TransactionModal;

